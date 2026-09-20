-- ══════════════════════════════════════════════════════════════════════════════
-- FIX ENUMs PostgreSQL → VARCHAR (Hibernate @Enumerated(EnumType.STRING))
-- ══════════════════════════════════════════════════════════════════════════════
-- 
-- CONTEXTE:
--   Spring Boot utilise @Enumerated(EnumType.STRING) dans les entités
--   PostgreSQL a des types ENUM (categorie_enum, severite_enum, etc.)
--   → Conversion automatique avec CAST implicite
--
-- ALTERNATIVE si problèmes: Convertir les colonnes ENUM en VARCHAR
-- ══════════════════════════════════════════════════════════════════════════════

-- Connecté à dms-adas2

-- OPTION 1: Garder les ENUMs (fonctionne avec Hibernate)
-- → Vérifier que les colonnes utilisent le bon type ENUM
-- → Les valeurs STRING sont castées automatiquement

-- OPTION 2: Convertir en VARCHAR (plus flexible, recommandé si problèmes)

-- ─────────────────────────────────────────────────────────────
-- Étape 1: Créer les colonnes VARCHAR temporaires
-- ─────────────────────────────────────────────────────────────

ALTER TABLE evenements 
ADD COLUMN categorie_varchar VARCHAR(10);

ALTER TABLE evenements 
ADD COLUMN severite_varchar VARCHAR(10);

ALTER TABLE scores_risque 
ADD COLUMN niveau_risque_varchar VARCHAR(10);

-- ─────────────────────────────────────────────────────────────
-- Étape 2: Migrer les données
-- ─────────────────────────────────────────────────────────────

UPDATE evenements 
SET categorie_varchar = categorie::TEXT;

UPDATE evenements 
SET severite_varchar = severite::TEXT;

UPDATE scores_risque 
SET niveau_risque_varchar = niveau_risque::TEXT;

-- ─────────────────────────────────────────────────────────────
-- Étape 3: Supprimer les colonnes ENUM
-- ─────────────────────────────────────────────────────────────

ALTER TABLE evenements 
DROP COLUMN categorie;

ALTER TABLE evenements 
DROP COLUMN severite;

ALTER TABLE scores_risque 
DROP COLUMN niveau_risque;

-- ─────────────────────────────────────────────────────────────
-- Étape 4: Renommer les colonnes VARCHAR
-- ─────────────────────────────────────────────────────────────

ALTER TABLE evenements 
RENAME COLUMN categorie_varchar TO categorie;

ALTER TABLE evenements 
RENAME COLUMN severite_varchar TO severite;

ALTER TABLE scores_risque 
RENAME COLUMN niveau_risque_varchar TO niveau_risque;

-- ─────────────────────────────────────────────────────────────
-- Étape 5: Ajouter les contraintes CHECK
-- ─────────────────────────────────────────────────────────────

ALTER TABLE evenements 
ADD CONSTRAINT chk_categorie CHECK (categorie IN ('DMS', 'ADAS'));

ALTER TABLE evenements 
ADD CONSTRAINT chk_severite CHECK (severite IN ('FAIBLE', 'MODERE', 'ELEVE', 'CRITIQUE'));

ALTER TABLE scores_risque 
ADD CONSTRAINT chk_niveau_risque CHECK (niveau_risque IN ('FAIBLE', 'MODERE', 'ELEVE', 'CRITIQUE'));

-- ─────────────────────────────────────────────────────────────
-- Vérification finale
-- ─────────────────────────────────────────────────────────────

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('evenements', 'scores_risque')
  AND column_name IN ('categorie', 'severite', 'niveau_risque')
ORDER BY table_name, ordinal_position;

-- Résultat attendu:
-- ┌────────────────┬─────────────────┬───────────┐
-- │ table_name     │ column_name     │ data_type │
-- ├────────────────┼─────────────────┼───────────┤
-- │ evenements     │ categorie       │ character │
-- │ evenements     │ severite        │ character │
-- │ scores_risque  │ niveau_risque   │ character │
-- └────────────────┴─────────────────┴───────────┘
