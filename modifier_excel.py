import pandas as pd
import numpy as np
from datetime import datetime
import csv

def lire_fichier_robuste(chemin_fichier):
    """
    Lecture robuste du fichier avec gestion des guillemets et séparateurs
    """
    try:
        # Essayer avec différents séparateurs
        for sep in [',', ';', '\t']:
            try:
                df = pd.read_csv(chemin_fichier, sep=sep, encoding='utf-8-sig', 
                                quotechar='"', skipinitialspace=True)
                if len(df.columns) > 1:
                    print(f"✅ Fichier lu avec séparateur: '{sep}'")
                    return df
            except:
                continue
        
        # Si ça échoue, lire avec le module csv pour analyser
        with open(chemin_fichier, 'r', encoding='utf-8-sig') as f:
            premier_ligne = f.readline()
            if '"' in premier_ligne:
                # Enlever les guillemets
                premier_ligne = premier_ligne.replace('"', '')
            
            # Détecter le séparateur
            for sep in [',', ';', '\t']:
                if sep in premier_ligne:
                    df = pd.read_csv(chemin_fichier, sep=sep, encoding='utf-8-sig',
                                    quotechar='"', skipinitialspace=True)
                    # Nettoyer les noms de colonnes
                    df.columns = df.columns.str.replace('"', '').str.strip()
                    return df
        
        raise Exception("Impossible de lire le fichier")
        
    except Exception as e:
        print(f"❌ Erreur lecture fichier: {e}")
        return None

def modifier_excel_professionnel(fichier_entree, fichier_sortie):
    """
    Fonction principale de modification de l'Excel
    """
    
    # ÉTAPE 1: Lire le fichier avec méthode robuste
    print("📂 ÉTAPE 1: Lecture du fichier Excel...")
    df = lire_fichier_robuste(fichier_entree)
    
    if df is None:
        print("❌ Impossible de lire le fichier. Vérifiez le format.")
        return None
    
    print(f"✅ Fichier lu avec succès: {len(df)} lignes, {len(df.columns)} colonnes")
    print(f"Colonnes trouvées: {list(df.columns)}")
    
    # ÉTAPE 2: Nettoyer les colonnes (supprimer les guillemets et espaces)
    print("🧹 ÉTAPE 2: Nettoyage des colonnes...")
    df.columns = df.columns.str.strip().str.replace('"', '').str.replace("'", "")
    
    # Renommer les colonnes si nécessaire (version originale avec guillemets)
    mapping_colonnes = {
        '"id"': 'id', 'id': 'id',
        '"conducteur_id"': 'conducteur_id', 'conducteur_id': 'conducteur_id',
        '"date_calcul"': 'date_calcul', 'date_calcul': 'date_calcul',
        '"heure_calcul"': 'heure_calcul', 'heure_calcul': 'heure_calcul',
        '"score_valeur"': 'score_valeur', 'score_valeur': 'score_valeur',
        '"niveau_risque"': 'niveau_risque', 'niveau_risque': 'niveau_risque',
        '"nb_fatigue"': 'nb_fatigue', 'nb_fatigue': 'nb_fatigue',
        '"nb_telephone"': 'nb_telephone', 'nb_telephone': 'nb_telephone',
        '"nb_ceinture"': 'nb_ceinture', 'nb_ceinture': 'nb_ceinture',
        '"nb_tabagisme"': 'nb_tabagisme', 'nb_tabagisme': 'nb_tabagisme',
        '"nb_distraction"': 'nb_distraction', 'nb_distraction': 'nb_distraction',
        '"nb_head_pose"': 'nb_head_pose', 'nb_head_pose': 'nb_head_pose',
        '"nb_fcw"': 'nb_fcw', 'nb_fcw': 'nb_fcw',
        '"nb_ldw"': 'nb_ldw', 'nb_ldw': 'nb_ldw',
        '"nb_total"': 'nb_total', 'nb_total': 'nb_total',
        '"vitesse_moyenne"': 'vitesse_moyenne', 'vitesse_moyenne': 'vitesse_moyenne',
        '"ratio_graves"': 'ratio_graves', 'ratio_graves': 'ratio_graves',
        '"timestamp"': 'timestamp', 'timestamp': 'timestamp'
    }
    
    # Appliquer le renommage
    for ancien, nouveau in mapping_colonnes.items():
        if ancien in df.columns:
            df.rename(columns={ancien: nouveau}, inplace=True)
    
    # ÉTAPE 3: Correction du format des dates
    print("📅 ÉTAPE 3: Correction du format des dates...")
    
    # Si timestamp existe et contient des guillemets
    if 'timestamp' in df.columns:
        df['timestamp'] = df['timestamp'].astype(str).str.replace('"', '')
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
        
        if 'date_calcul' not in df.columns or df['date_calcul'].isna().all():
            df['date_calcul'] = df['timestamp'].dt.date
        
        if 'heure_calcul' not in df.columns or df['heure_calcul'].isna().all():
            df['heure_calcul'] = df['timestamp'].dt.time
    
    # ÉTAPE 4: Ajout d'un code de modification unique
    print("🔑 ÉTAPE 4: Ajout du code de modification...")
    df['code_modification'] = 'MOD_' + df.index.astype(str) + '_' + datetime.now().strftime('%Y%m%d_%H%M%S')
    df['date_modification'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    df['version_donnees'] = 'v2.0'
    
    # ÉTAPE 5: Correction des données (valeurs manquantes/erreurs)
    print("⚙️ ÉTAPE 5: Correction des données...")
    
    # Convertir les colonnes numériques
    colonnes_numeriques = ['score_valeur', 'ratio_graves', 'vitesse_moyenne', 
                          'nb_fatigue', 'nb_telephone', 'nb_ceinture', 
                          'nb_tabagisme', 'nb_distraction', 'nb_head_pose',
                          'nb_fcw', 'nb_ldw', 'nb_total']
    
    for col in colonnes_numeriques:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            if col in ['score_valeur', 'ratio_graves']:
                df[col] = df[col].round(4)
            else:
                df[col] = df[col].fillna(0).astype(int)
    
    # Correction des heures
    if 'heure_calcul' in df.columns:
        df['heure_calcul'] = df['heure_calcul'].astype(str)
        # Extraire seulement HH:MM:SS
        df['heure_calcul'] = df['heure_calcul'].str.extract(r'(\d{2}:\d{2}:\d{2})')
        df['heure_calcul'] = df['heure_calcul'].fillna('00:00:00')
    
    # ÉTAPE 6: Ajout des métadonnées (avec gestion d'erreur)
    print("📊 ÉTAPE 6: Ajout des métadonnées...")
    
    # Vérifier l'existence des colonnes avant d'utiliser
    if 'score_valeur' in df.columns and 'niveau_risque' in df.columns:
        df['qualite_donnees'] = np.where(
            df['score_valeur'].notna() & df['niveau_risque'].notna(),
            'VALIDE',
            'A_VERIFIER'
        )
    else:
        df['qualite_donnees'] = 'A_VERIFIER'
        print("⚠️ Colonnes score_valeur ou niveau_risque manquantes")
    
    # Ajout d'un identifiant de session
    if 'conducteur_id' in df.columns and 'date_calcul' in df.columns:
        df['session_id'] = df['conducteur_id'].astype(str) + '_' + df['date_calcul'].astype(str)
    else:
        df['session_id'] = df.index.astype(str)
    
    # ÉTAPE 7: Réorganisation des colonnes
    print("📋 ÉTAPE 7: Réorganisation des colonnes...")
    
    # Définir l'ordre des colonnes
    colonnes_ordre = [
        'id', 'conducteur_id', 'date_calcul', 'heure_calcul', 
        'session_id', 'code_modification', 'version_donnees',
        'score_valeur', 'niveau_risque', 'ratio_graves',
        'nb_fatigue', 'nb_telephone', 'nb_ceinture', 
        'nb_tabagisme', 'nb_distraction', 'nb_head_pose',
        'nb_fcw', 'nb_ldw', 'nb_total', 'vitesse_moyenne',
        'qualite_donnees', 'timestamp', 'date_modification'
    ]
    
    # Garder seulement les colonnes existantes
    colonnes_existantes = [col for col in colonnes_ordre if col in df.columns]
    # Ajouter les colonnes qui ne sont pas dans l'ordre
    for col in df.columns:
        if col not in colonnes_existantes:
            colonnes_existantes.append(col)
    
    df = df[colonnes_existantes]
    
    # ÉTAPE 8: Sauvegarder le fichier modifié
    print("💾 ÉTAPE 8: Sauvegarde du fichier modifié...")
    
    # Sauvegarde en CSV (sans guillemets inutiles)
    fichier_csv = fichier_sortie.replace('.xlsx', '.csv')
    df.to_csv(fichier_csv, index=False, encoding='utf-8-sig', quoting=1)
    print(f"✅ CSV sauvegardé: {fichier_csv}")
    
    # Sauvegarde en Excel
    try:
        with pd.ExcelWriter(fichier_sortie, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Données_Corrigées', index=False)
            
            # Formatage Excel
            workbook = writer.book
            worksheet = writer.sheets['Données_Corrigées']
            
            # Ajuster la largeur des colonnes
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width
            
            worksheet.auto_filter.ref = worksheet.dimensions
        print(f"✅ Excel sauvegardé: {fichier_sortie}")
        
    except Exception as e:
        print(f"⚠️ Export Excel optionnel: {e}")
    
    # ÉTAPE 9: Générer un rapport
    print("📄 ÉTAPE 9: Génération du rapport...")
    
    rapport = f"""
    ========================================
    RAPPORT DE MODIFICATION DES DONNÉES
    ========================================
    
    Date modification: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    Fichier source: {fichier_entree}
    Fichier destination: {fichier_sortie}
    
    Modifications appliquées:
    ✓ Lecture robuste du fichier
    ✓ Nettoyage des guillemets
    ✓ Correction format dates
    ✓ Ajout code modification unique
    ✓ Ajout version données (v2.0)
    ✓ Correction ratios et scores
    ✓ Ajout indicateur qualité
    ✓ Ajout session_id
    
    Statistiques:
    - Total lignes: {len(df)}
    - Total colonnes: {len(df.columns)}
    - Lignes valides: {df['qualite_donnees'].value_counts().get('VALIDE', 0) if 'qualite_donnees' in df.columns else 0}
    
    """
    
    if 'conducteur_id' in df.columns:
        rapport += f"- Conducteurs uniques: {df['conducteur_id'].nunique()}\n"
    
    if 'niveau_risque' in df.columns:
        rapport += f"\nNiveaux de risque:\n{df['niveau_risque'].value_counts().to_string()}\n"
    
    rapport += """
    ========================================
    """
    
    with open('rapport_modification.txt', 'w', encoding='utf-8') as f:
        f.write(rapport)
    
    print(rapport)
    print("✅ Modification terminée avec succès!")
    
    return df

# ============================================
# EXÉCUTION
# ============================================

if __name__ == "__main__":
    # Spécifier les fichiers
    fichier_entree = "data-1780313461895.csv"  # Remplacez par votre fichier
    fichier_sortie = "donnees_modifiees_professionnel.xlsx"
    
    # Exécuter la modification
    df_modifie = modifier_excel_professionnel(fichier_entree, fichier_sortie)
    
    if df_modifie is not None:
        print("\n🔍 APERÇU DES DONNÉES MODIFIÉES (5 premières lignes):")
        print(df_modifie.head().to_string())
        
        # Afficher les noms des colonnes
        print("\n📋 LISTE DES COLONNES:")
        for i, col in enumerate(df_modifie.columns, 1):
            print(f"{i:2}. {col}")