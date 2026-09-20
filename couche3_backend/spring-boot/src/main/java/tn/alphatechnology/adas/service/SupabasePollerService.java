package tn.alphatechnology.adas.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tn.alphatechnology.adas.entity.*;
import tn.alphatechnology.adas.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * SupabasePollerService — VERSION FINALE CORRIGÉE
 *
 * PROBLÈME RÉSOLU :
 *   - Anciens événements avaient traite=true → non lus
 *   - Anti-doublon basé sur supabase_id (pas sur traite)
 *   - Lit traite=false ET marque traite=true après INSERT
 *
 * FLUX :
 *   Supabase evenements_bruts (traite=false)
 *     → Vérifie supabase_id non existant dans PostgreSQL
 *     → INSERT evenements (PostgreSQL)
 *     → INSERT notifications (PostgreSQL)
 *     → UPDATE journal_evenements (PostgreSQL)
 *     → calculerScore() (PostgreSQL)
 *     → PATCH traite=true (Supabase)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SupabasePollerService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.tables.evenements}")
    private String tableEvenements;

    private final EvenementRepository        evenementRepo;
    private final NotificationRepository     notificationRepo;
    private final JournalEvenementRepository journalRepo;
    private final ConducteurRepository       conducteurRepo;
    private final ScoreService               scoreService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = buildRestTemplate();

    private static RestTemplate buildRestTemplate() {
        var factory = new HttpComponentsClientHttpRequestFactory(
                HttpClients.createDefault());
        factory.setConnectTimeout(10000);
        factory.setConnectionRequestTimeout(10000);
        return new RestTemplate(factory);
    }
    public enum TraitementResult {
        INSERE,
        IGNORE_MARK,
        IGNORE_RETRY
    }
    // ══════════════════════════════════════════════════════════
    // POLLING — toutes les 5 secondes
    // ══════════════════════════════════════════════════════════

    @Scheduled(fixedDelayString = "${supabase.poll-interval-ms}")
    public void pollSupabase() {
        log.info("[POLLER] ===== CYCLE DÉBUT =====");
        try {
            log.info("[POLLER] Appel getEvenementsNonTraites()...");
            List<JsonNode> evenements = getEvenementsNonTraites();
            log.info("[POLLER] getEvenementsNonTraites() OK — {} evenement(s)", evenements.size());

            if (evenements.isEmpty()) {
                log.debug("[POLLER] Aucun evenement non traite dans Supabase");
                return;
            }

            log.info("[POLLER] {} evenement(s) a traiter", evenements.size());

            List<Long>  idsAMarquer        = new ArrayList<>();
            Set<String> conducteursAScorer = new LinkedHashSet<>();
            int         nbInseres          = 0;
            int         nbIgnores          = 0;
            int         nbRejets           = 0;

            for (JsonNode node : evenements) {
                long supId = node.path("id").asLong(-1);
                if (supId < 0) {
                    log.warn("[POLLER] ID invalide dans node: {}", node);
                    continue;
                }

                try {
                    TraitementResult resultat = traiterEvenement(
                            node, supId, conducteursAScorer);
                    if (resultat == TraitementResult.INSERE) {
                        idsAMarquer.add(supId);
                        nbInseres++;
                    } else if (resultat == TraitementResult.IGNORE_MARK) {
                        idsAMarquer.add(supId);
                        nbIgnores++;
                    } else {
                        nbRejets++;
                    }
                } catch (Exception e) {
                    log.error("[POLLER] Erreur traitement id={}: {}",
                            supId, e.getMessage(), e);
                    // Marquer quand même pour éviter boucle infinie
                    idsAMarquer.add(supId);
                }
            }

            log.info("[POLLER] Bilan : {} insere(s), {} ignore(s), {} rejete(s)",
                    nbInseres, nbIgnores, nbRejets);

            // PATCH traite=true dans Supabase
            if (!idsAMarquer.isEmpty()) {
                marquerTraite(idsAMarquer);
            }

            // Calcul scores après traitement
            for (String conducteurId : conducteursAScorer) {
                try {
                    scoreService.calculerEtSauvegarderScore(conducteurId);
                    log.info("[POLLER] Score calcule pour {}", conducteurId);
                } catch (Exception e) {
                    log.warn("[POLLER] Score echoue conducteur={}: {}",
                            conducteurId, e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("[POLLER] Erreur critique: {}", e.getMessage(), e);
        }
    }

    // ══════════════════════════════════════════════════════════
    // TRAITEMENT D'UN ÉVÉNEMENT
    // Retourne true=inséré, false=ignoré
    // ══════════════════════════════════════════════════════════

    @Transactional
    public TraitementResult traiterEvenement(JsonNode node,
                                              long supId,
                                              Set<String> conducteursAScorer) {

        // ── Anti-doublon : supabase_id déjà en PostgreSQL ? ─────
        if (evenementRepo.existsBySupabaseId(supId)) {
            log.debug("[POLLER] Doublon supabase_id={} — ignore", supId);
            return TraitementResult.IGNORE_MARK;
        }

        // ── Extraction et validation conducteur_id ───────────────
        String conducteurId = node.path("conducteur_id")
                .asText("").trim();

        if (conducteurId.isEmpty()) {
            log.warn("[POLLER] conducteur_id vide — supabase_id={}", supId);
            return TraitementResult.IGNORE_MARK;
        }

        if (!conducteurId.matches("^C[0-9]+$")) {
            log.warn("[POLLER] Format invalide '{}' — supabase_id={}",
                    conducteurId, supId);
            return TraitementResult.IGNORE_MARK;
        }

        // ── Vérification existence conducteur dans PostgreSQL ────
        Optional<Conducteur> conducteurOpt = conducteurRepo.findById(conducteurId);
        if (conducteurOpt.isEmpty()) {
            log.warn("[POLLER] Conducteur '{}' INCONNU dans PostgreSQL " +
                     "— supabase_id={} laisse pour reessayer",
                    conducteurId, supId);
            return TraitementResult.IGNORE_RETRY;
        }
        Conducteur conducteur = conducteurOpt.get();

        // ── Filtre durée >= 2 secondes ───────────────────────────
        double duree = node.path("duree_secondes").asDouble(0.0);
        if (duree < 2.0) {
            log.debug("[POLLER] Duree {}s < 2s — supabase_id={} ignore",
                    duree, supId);
            return TraitementResult.IGNORE_MARK;
        }

        // ── Extraction type et catégorie ─────────────────────────
        String typeEvenement = node.path("type_evenement")
                .asText("INCONNU").trim();
        String categorieStr  = node.path("categorie")
                .asText("DMS").trim().toUpperCase();
        String severiteStr   = node.path("severite")
                .asText("MODERE").trim().toUpperCase();

        // ── Parsing catégorie ─────────────────────────────────────
        Evenement.CategorieEnum categorie;
        try {
            categorie = Evenement.CategorieEnum.valueOf(categorieStr);
        } catch (Exception e) {
            log.warn("[POLLER] Categorie inconnue '{}' → DMS", categorieStr);
            categorie = Evenement.CategorieEnum.DMS;
        }

        // ── Parsing sévérité ──────────────────────────────────────
        Evenement.SeveriteEnum severite;
        try {
            severite = Evenement.SeveriteEnum.valueOf(severiteStr);
        } catch (Exception e) {
            log.warn("[POLLER] Severite inconnue '{}' → MODERE", severiteStr);
            severite = Evenement.SeveriteEnum.MODERE;
        }

        // ── Parsing timestamp ─────────────────────────────────────
        OffsetDateTime dateHeure;
        try {
            String ts = node.path("timestamp_utc").asText("")
                            .trim().replace(" ", "T");
            if (ts.endsWith("+00")) ts = ts + ":00";
            dateHeure = OffsetDateTime.parse(ts);
        } catch (Exception e) {
            log.warn("[POLLER] Timestamp invalide supabase_id={} → NOW",
                    supId);
            dateHeure = OffsetDateTime.now();
        }

        // ── Sauvegarde événement ──────────────────────────────────
        Evenement evt = Evenement.builder()
                .supabaseId(supId)
                .conducteurId(conducteurId)
                .vehiculeNom(conducteur.getNomVehicule())
                .typeEvenement(typeEvenement)
                .categorie(categorie)
                .dateHeure(dateHeure)
                .dureeSecondes(getDecimal(node, "duree_secondes"))
                .latitude(getDecimal(node, "latitude"))
                .longitude(getDecimal(node, "longitude"))
                .severite(severite)
                .createdAt(OffsetDateTime.now())
                .build();

        evenementRepo.save(evt);

        log.info("[POLLER] INSERT evenement OK — supabase_id={} " +
                 "conducteur={} type={} severite={} duree={}s",
                supId, conducteurId, typeEvenement,
                severite, String.format("%.2f", duree));

        // ── Sauvegarde notification ───────────────────────────────
        String prefixe = switch (severite) {
            case CRITIQUE -> "[CRITIQUE]";
            case ELEVE    -> "[ELEVE]";
            case MODERE   -> "[MODERE]";
            case FAIBLE   -> "[FAIBLE]";
        };

        Notification notif = Notification.builder()
                .conducteurId(conducteurId)
                .titre(prefixe + " " + buildTitre(typeEvenement))
                .corps(buildCorps(typeEvenement, duree))
                .typeAlerte(typeEvenement)
                .latitude(getDecimal(node, "latitude"))
                .longitude(getDecimal(node, "longitude"))
                .lue(false)
                .dateEnvoi(OffsetDateTime.now())
                .build();

        notificationRepo.save(notif);

        log.info("[POLLER] INSERT notification OK — conducteur={} titre='{}'",
                conducteurId, notif.getTitre());

        // ── Journal journalier ────────────────────────────────────
        incrementerJournal(conducteurId, dateHeure.toLocalDate());

        // ── Ajouter à la liste pour calcul score ──────────────────
        conducteursAScorer.add(conducteurId);

        return TraitementResult.INSERE;
    }

    // ══════════════════════════════════════════════════════════
    // JOURNAL JOURNALIER
    // Utilise la date de l'événement (pas today)
    // ══════════════════════════════════════════════════════════

    @Transactional
    public void incrementerJournal(String conducteurId, LocalDate dateEvt) {
        Optional<JournalEvenement> opt =
                journalRepo.findByConducteurIdAndDateJournee(
                        conducteurId, dateEvt);

        if (opt.isPresent()) {
            JournalEvenement j = opt.get();
            j.setNbEvenements(j.getNbEvenements() + 1);
            journalRepo.save(j);
        } else {
            JournalEvenement j = new JournalEvenement();
            j.setConducteurId(conducteurId);
            j.setDateJournee(dateEvt);
            j.setNbEvenements(1);
            journalRepo.save(j);
        }
    }

    // ══════════════════════════════════════════════════════════
    // GET EVENEMENTS NON TRAITÉS depuis Supabase
    // ══════════════════════════════════════════════════════════

    private List<JsonNode> getEvenementsNonTraites() {
    // CORRECTION : filtre traite=eq.false
    String url = supabaseUrl
        + "/rest/v1/" + tableEvenements
        + "?traite=eq.false"
        + "&order=id.asc"
        + "&limit=50";

    log.info("[POLLER] GET Supabase URL: {}", url);

    try {
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(buildHeaders()),
                String.class);

        log.info("[POLLER] Supabase status: {}", response.getStatusCode());

        if (response.getStatusCode().is2xxSuccessful()
                && response.getBody() != null) {

            JsonNode root = objectMapper.readTree(response.getBody());
            List<JsonNode> liste = new ArrayList<>();
            if (root.isArray()) {
                root.forEach(liste::add);
            }
            log.info("[POLLER] getEvenementsNonTraites retourne {} event(s)", 
                    liste.size());
            return liste;
        }
    } catch (Exception e) {
        log.error("[POLLER] Erreur GET Supabase: {}", e.getMessage(), e);
    }
    return Collections.emptyList();
}

    // ══════════════════════════════════════════════════════════
    // PATCH traite=true dans Supabase
    // Apache HttpClient5 requis pour PATCH
    // ══════════════════════════════════════════════════════════

    private void marquerTraite(List<Long> ids) {
        if (ids.isEmpty()) return;

        // Format Supabase : ?id=in.(55,56,57)
        String idsFormat = ids.toString()
                .replace("[", "(")
                .replace("]", ")");

        String url = supabaseUrl
                + "/rest/v1/" + tableEvenements
                + "?id=in." + idsFormat;

        HttpHeaders headers = buildHeaders();
        headers.set("Prefer", "return=minimal");

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    new HttpEntity<>(Map.of("traite", true), headers),
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[POLLER] PATCH traite=true OK — {} ids: {}",
                        ids.size(), ids);
            } else {
                log.warn("[POLLER] PATCH status inattendu: {}",
                        response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[POLLER] Erreur PATCH Supabase: {}", e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════

    private HttpHeaders buildHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.set("apikey",        supabaseKey);
        h.set("Authorization", "Bearer " + supabaseKey);
        h.setContentType(MediaType.APPLICATION_JSON);
        h.set("Accept",        "application/json");
        return h;
    }

    private BigDecimal getDecimal(JsonNode n, String field) {
        if (n == null) return null;
        JsonNode v = n.path(field);
        if (v.isNull() || v.isMissingNode()) return null;
        String s = v.asText("").trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        try {
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String buildTitre(String type) {
        return switch (type) {
            case "FATIGUE_EYES_CLOSED" -> "Yeux fermes detectes";
            case "FATIGUE_EYES_DROWSY" -> "Somnolence detectee";
            case "FATIGUE_YAWN"        -> "Baillement detecte";
            case "FATIGUE_DROP"        -> "Tete tombante detectee";
            case "DISTRACTION"         -> "Distraction detectee";
            case "PHONE"               -> "Telephone en main detecte";
            case "SMOKING"             -> "Tabagisme detecte";
            case "SEATBELT"            -> "Ceinture de securite absente";
            case "FCW_WARNING"         -> "Alerte collision imminente";
            case "FCW_DANGER"          -> "DANGER collision critique";
            case "LDW_LEFT"            -> "Sortie de voie a gauche";
            case "LDW_RIGHT"           -> "Sortie de voie a droite";
            default                    -> "Alerte : " + type;
        };
    }

    private String buildCorps(String type, double duree) {
        return switch (type) {
            case "FATIGUE_EYES_CLOSED" ->
                String.format("Yeux fermes pendant %.1f secondes.", duree);
            case "FATIGUE_EYES_DROWSY" ->
                String.format("Somnolence detectee pendant %.1f secondes.", duree);
            case "FATIGUE_YAWN"        ->
                String.format("Baillement detecte (%.1f s).", duree);
            case "FATIGUE_DROP"        ->
                String.format("Tete tombante pendant %.1f secondes.", duree);
            case "DISTRACTION"         ->
                String.format("Distraction pendant %.1f secondes.", duree);
            case "PHONE"               ->
                String.format("Telephone utilise pendant %.1f secondes.", duree);
            case "SMOKING"             ->
                String.format("Cigarette detectee pendant %.1f secondes.", duree);
            case "SEATBELT"            ->
                String.format("Ceinture non attachee pendant %.1f secondes.", duree);
            case "FCW_WARNING"         -> "Vehicule trop proche. Ralentissez !";
            case "FCW_DANGER"          -> "DANGER : risque de collision frontale !";
            case "LDW_LEFT"            ->
                String.format("Sortie de voie a gauche (%.1f s).", duree);
            case "LDW_RIGHT"           ->
                String.format("Sortie de voie a droite (%.1f s).", duree);
            default ->
                String.format("Evenement : %s (%.1f s)", type, duree);
        };
    }
}