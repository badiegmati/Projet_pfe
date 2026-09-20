# ✅ VALIDATION: Spring Boot est déjà bien configuré

## Statut du projet

| Composant | État | Notes |
|-----------|------|-------|
| **Lecture Supabase** | ✅ Correct | Lit UNIQUEMENT `evenements_bruts` |
| **Table GPS** | ✅ N/A | Aucune référence à `gps_logs_supabase` |
| **Base PostgreSQL** | ✅ Correct | Cible `dms-adas2` |
| **Entities JPA** | ✅ Correct | Correspondent à la structure SQL |
| **Poller Supabase** | ✅ Correct | Anti-doublon via `supabase_id` |
| **Calcul Score** | ✅ Correct | Utilise `scores_risque` PostgreSQL |
| **Notifications** | ✅ Correct | Crée pour chaque événement |

## Preuve: Lectures du code source

### 1️⃣ SupabasePollerService.java

```java
// ✅ Configuration fournie dans application.yml
@Value("${supabase.tables.evenements}")
private String tableEvenements; // = "evenements_bruts"

// ✅ Méthode GET Supabase
private List<JsonNode> getEvenementsNonTraites() {
    String url = supabaseUrl
        + "/rest/v1/" + tableEvenements  // ← "evenements_bruts"
        + "?traite=eq.false"             // ← Anti-doublon
        + "&order=id.asc"
        + "&limit=50";
}

// ✅ Marquage traite=true (évite relecture)
private void marquerTraite(List<Long> ids) {
    String url = supabaseUrl
        + "/rest/v1/" + tableEvenements  // ← "evenements_bruts"
        + "?id=in." + idsFormat;
    
    // PATCH traite=true
}

// ✅ Anti-doublon via supabase_id
if (evenementRepo.existsBySupabaseId(supId)) {
    log.debug("[POLLER] Doublon supabase_id={} — ignore", supId);
    return false;
}
```

**Conclusion**: Lit UNIQUEMENT `evenements_bruts`, aucune tentative de lire GPS

### 2️⃣ DataInitializer.java

```java
@Component
public class DataInitializer implements CommandLineRunner {
    
    // ✅ Crée comptes de test
    void run(String... args) {
        log.info("[INIT] Base : dms-adas2 — Initialisation...");
        creerAdministrateur();        // Admin 00000000
        creerGestionnaireTest();      // G1
        creerConducteurC10();         // C10
        creerConducteurC12();         // C12
    }
}

// ✅ Pas de colonnes actif/en_ligne (supprimées de la structure)
```

**Conclusion**: Synchronisée avec la nouvelle structure `dms-adas2`

### 3️⃣ Entity mappings

```java
// ✅ Evenement.java
@Entity @Table(name = "evenements")
public class Evenement {
    @Column(name = "supabase_id", unique = true)
    private Long supabaseId;  // ← Anti-doublon
    
    @Enumerated(EnumType.STRING)
    private CategorieEnum categorie;    // DMS, ADAS
    private SeveriteEnum severite;      // FAIBLE, MODERE, ELEVE, CRITIQUE
}

// ✅ ScoreRisque.java
@Entity @Table(name = "scores_risque")
public class ScoreRisque {
    private BigDecimal scoreValeur;
    @Enumerated(EnumType.STRING)
    private NiveauRisqueEnum niveauRisque;
}

// ❌ Pas d'entité GpsLog, GpsLogsSupabase
```

**Conclusion**: Entités correspondent à PostgreSQL 18 `dms-adas2`

### 4️⃣ application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dms-adas2  # ✅ Base correcte
  jpa:
    hibernate:
      ddl-auto: validate  # ✅ Mode validation (pas de création auto)

supabase:
  tables:
    evenements: evenements_bruts  # ✅ Table correcte
  poll-interval-ms: 5000          # ✅ Polling 5s
```

**Conclusion**: Configuration parfaitement alignée

## Actions requises (HORS Spring Boot)

### ✅ PostgreSQL 18 - dms-adas2

**Statut**: À exécuter une fois

```sql
-- Créer la base
CREATE DATABASE "dms-adas2" WITH ENCODING = 'UTF8';

-- Créer tables, énums, indexes
-- Voir: SETUP_DMS-ADAS2.md
-- Voir: Script SQL complet fourni par l'utilisateur
```

### ✅ Supabase - evenements_bruts

**Statut**: À modifier une fois

```sql
-- Supprimer colonnes inutiles
ALTER TABLE evenements_bruts 
    DROP COLUMN IF EXISTS ear_ratio,
    DROP COLUMN IF EXISTS mar_ratio,
    -- ... (voir SUPABASE_CONFIG.md)

-- Garder 11 colonnes essentielles
-- Voir: SUPABASE_CONFIG.md
```

## 🚀 Flux opérationnel - SANS modifications Spring Boot

```
1. Couche 1 (Python)
   └─ Envoie événements → Supabase evenements_bruts

2. Spring Boot (UNCHANGED)
   ├─ SupabasePollerService lit toutes les 5s
   ├─ WHERE traite=false (anti-doublon)
   ├─ Valide conducteur dans PostgreSQL
   ├─ INSERT evenements + notifications
   ├─ Calcul score
   └─ PATCH traite=true

3. Résultat
   ├─ PostgreSQL: Events + Scores + Notifications
   └─ API Spring Boot: Tableaux bord en temps réel
```

## ✅ Checklist déploiement

- [ ] PostgreSQL 18 installé
- [ ] Base `dms-adas2` créée
- [ ] Tables + indexes + données test créés
- [ ] Spring Boot `application.yml` pointe vers `dms-adas2`
- [ ] Spring Boot démarre sans erreur
- [ ] Logs affichent: `[INIT] Base : dms-adas2 — Initialisation...`
- [ ] Supabase `evenements_bruts` prêt
- [ ] Colonnes GPS supprimées de `evenements_bruts`
- [ ] Supabase RLS désactivé
- [ ] Spring Boot poller commence: `[POLLER] N evenement(s) a traiter`
- [ ] Événements reçus → PostgreSQL ✓
- [ ] Scores calculés ✓
- [ ] Notifications envoyées ✓

## ❓ FAQ

### Q: Spring Boot doit-il être modifié?
**R**: Non. Le code est déjà correct.

### Q: Spring Boot lit-il gps_logs_supabase?
**R**: Non. Aucune référence dans le code.

### Q: Où les positions GPS sont-elles stockées?
**R**: Dans `evenements.latitude / longitude` et `notifications.latitude / longitude`.

### Q: Comment éviter les doublons?
**R**: Via le flag `traite` de Supabase + colonne `supabase_id` unique dans PostgreSQL.

### Q: Quelle est la fréquence de polling?
**R**: 5 secondes (configurable: `supabase.poll-interval-ms: 5000`).

### Q: Comment calculer les scores?
**R**: Service `ScoreService` utilise 7 jours glissants sur les événements PostgreSQL.

### Q: Que faire si les énums PostgreSQL causent des problèmes?
**R**: Exécuter le script `FIX_ENUMS_OPTIONAL.sql` pour convertir en VARCHAR.

## 📞 Support

Pour des modifications futures au flux de données:
- **Spring Boot**: Modifier `SupabasePollerService` ou `ScoreService`
- **PostgreSQL**: Schemas dans les entités (`@Entity @Table(name=...)`)
- **Supabase**: Garder `evenements_bruts` avec colonnes listées dans `SUPABASE_CONFIG.md`
- **Couche 1**: Envoyer événements via `supabase_sender.py`
