# Configuration BASE PostgreSQL 18 "dms-adas2"

## ✓ État Spring Boot
- Base configurée : `dms-adas2` ✓
- Fichier : [application.yml](src/main/resources/application.yml)
- Pool HikariCP : 10 max connexions
- Mode Hibernate : `validate` (pas de DDL auto)

## ÉTAPE 1 : Créer la base PostgreSQL 18

```sql
-- Connecté à 'postgres' (défaut)
CREATE DATABASE "dms-adas2"
    WITH ENCODING = 'UTF8' TEMPLATE = template0;
```

## ÉTAPE 2 : Initialiser les tables

Connecté à `dms-adas2`, exécuter le script complet:
- Énumérations : `categorie_enum`, `severite_enum`, `niveau_risque_enum`, `statut_msg_enum`
- Tables : `administrateurs`, `gestionnaires_flotte`, `conducteurs`, `vehicules`, `evenements`, `scores_risque`, `journal_evenements`, `notifications`, `messages`
- Indexes pour performances
- Données de test : Admin 00000000, Gestionnaire G1, Conducteurs C10/C12

**Note SQL** : Les colonnes d'enum:
- `evenements.categorie` → `categorie_enum`
- `evenements.severite` → `severite_enum`  
- `scores_risque.niveau_risque` → `niveau_risque_enum`

## ÉTAPE 3 : Vérifier les insertions

```sql
SELECT 'administrateurs'     AS table_name, COUNT(*) FROM administrateurs
UNION ALL
SELECT 'gestionnaires_flotte',               COUNT(*) FROM gestionnaires_flotte
UNION ALL
SELECT 'conducteurs',                         COUNT(*) FROM conducteurs
UNION ALL
SELECT 'evenements',                          COUNT(*) FROM evenements
UNION ALL
SELECT 'scores_risque',                       COUNT(*) FROM scores_risque
UNION ALL
SELECT 'notifications',                       COUNT(*) FROM notifications
UNION ALL
SELECT 'messages',                            COUNT(*) FROM messages;
```

### Résultat attendu (après initialisation Spring Boot):
```
administrateurs       | 1
gestionnaires_flotte  | 1 (G1)
conducteurs           | 2 (C10, C12)
evenements            | 0 → remplies par poller Supabase
scores_risque         | 0 → calculés périodiquement
notifications         | 0 → générées pour chaque événement
messages              | 0
```

## ✓ Supabase - Modifications essentielles

### Table : `evenements_bruts`

Garder les colonnes:
```
✓ id (PK, BIGINT)
✓ conducteur_id (VARCHAR)
✓ type_evenement (VARCHAR)
✓ categorie (VARCHAR: 'DMS' ou 'ADAS')
✓ timestamp_utc (TIMESTAMP)
✓ duree_secondes (DECIMAL)
✓ latitude (DECIMAL)
✓ longitude (DECIMAL)
✓ severite (VARCHAR: 'FAIBLE','MODERE','ELEVE','CRITIQUE')
✓ traite (BOOLEAN) — IMPORTANT pour éviter doublon
✓ crc (VARCHAR) — intégrité
```

Supprimer (inutiles):
```sql
ALTER TABLE evenements_bruts 
    DROP COLUMN IF EXISTS ear_ratio,
    DROP COLUMN IF EXISTS mar_ratio,
    DROP COLUMN IF EXISTS head_pose_angle,
    DROP COLUMN IF EXISTS ttc_value,
    DROP COLUMN IF EXISTS deviation_voie,
    DROP COLUMN IF EXISTS distance_m,
    DROP COLUMN IF EXISTS vitesse_kmh,
    DROP COLUMN IF EXISTS cap_degres,
    DROP COLUMN IF EXISTS vehicule_id;
```

### Pas de table GPS
- ✗ `gps_logs_supabase` → n'existe pas (pas créée)
- Spring Boot ne l'utilise pas
- Couche1 (Python) peut l'utiliser en local

## ✓ Spring Boot - Vérification

### Configuration appliquée:
```yaml
spring.datasource.url: jdbc:postgresql://localhost:5432/dms-adas2
spring.datasource.username: postgres
spring.datasource.password: "123"
supabase.tables.evenements: evenements_bruts
supabase.poll-interval-ms: 5000
```

### Services actifs:
- `SupabasePollerService` : Lit `evenements_bruts` (traite=false) toutes les 5s
- `ScoreService` : Calcule scores risque (7j glissants)
- `DataInitializer` : Crée comptes de test

## ✓ Flux de données

```
Couche 1 (Python - main.py)
    ↓ INSERT événements détectés
Supabase: evenements_bruts (traite=false)
    ↓ Poller Spring Boot (5s)
SupabasePollerService
    ↓ Vérification conducteur + anti-doublon (supabase_id)
PostgreSQL: dms-adas2
    ├─ INSERT evenements
    ├─ INSERT notifications
    ├─ INSERT journal_evenements
    ├─ CALCUL SCORE (7j)
    └─ PATCH Supabase traite=true
    
Résultat: Tableaux bord, scores, alertes en temps réel
```

## 🧪 Test après configuration

### 1. Vérifier la connexion PostgreSQL
```bash
psql -h localhost -U postgres -d dms-adas2 -c "SELECT VERSION();"
```

### 2. Lancer Spring Boot
```bash
cd couche3_backend/spring-boot
mvn spring-boot:run
```

### 3. Logs attendus
```
[INIT] Base : dms-adas2 — Initialisation...
[INIT] Admin 00000000 hash mis a jour
[INIT] G1 hash mis a jour
[INIT] C10 hash mis a jour
[INIT] C12 hash mis a jour
[POLLER] N evenement(s) a traiter
```

### 4. Tests API (PowerShell)
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET

# Login Admin
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST -ContentType "application/json" `
    -Body '{"id":"00000000","motDePasse":"Admis123456"}'

Write-Host "Token: " $login.token
```

## 📋 Checklist

- [ ] Base PostgreSQL 18 créée : `dms-adas2`
- [ ] Tables créées (script SQL complet)
- [ ] Indexes créés pour `evenements`, `scores_risque`
- [ ] Comptes test : Admin 00000000, G1, C10, C12
- [ ] Supabase `evenements_bruts` : colonnes GPS supprimées
- [ ] Supabase RLS désactivé sur `evenements_bruts`
- [ ] Spring Boot `application.yml` cible `dms-adas2`
- [ ] Connection test PostgreSQL ✓
- [ ] Spring Boot démarre sans erreur ✓
- [ ] Poller Supabase actif (toutes les 5s)
- [ ] Events fluent → PostgreSQL → Scores → Notifications ✓

## 🚫 Plus d'utilisation

❌ `gps_logs_supabase` — table supprimée, aucune utilisation Spring Boot
❌ Colonnes inutiles dans `evenements_bruts` — nettoyées
❌ Colonnes `actif`, `en_ligne` dans conducteurs/gestionnaires — supprimées (soft delete non utilisé)
