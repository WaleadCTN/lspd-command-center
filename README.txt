LSPD COMMAND CENTER — PHASE 16 FTO ACADEMY

BASE
Construite directement depuis Phase 14+15.
Aucune ancienne fonction n'est supprimée.
Bilingue FR / EN conservé.
Permissions dynamiques conservées.

NOUVELLE PERMISSION
academy_manage
Par défaut : FTO et Command.
Le Chief peut la modifier depuis 🔐 Permissions.

🎓 FTO ACADEMY
Chaque module M01 à M16 contient :
- objectif pédagogique
- durée conseillée
- prérequis
- étapes exactes du FTO
- exemple RP
- variantes
- erreurs fréquentes
- erreurs critiques
- questions à poser
- réponses attendues
- action corrective

SCÉNARIOS
Bouton "Générer un scénario".
Scénarios préparés Facile / Normal / Difficile / Stress test.
Aucune API externe et aucun coût.

SESSION GUIDÉE
Le FTO sélectionne :
- recrue
- module
- phase FTO

Phases :
1 Observation
2 Assistance
3 Autonomie supervisée
4 Évaluation finale

Checklist :
- Briefing
- Démonstration
- Pratique
- Observation
- Débrief

Journal :
- résumé
- points forts
- points à améliorer
- objectifs prochaine session

📝 JOURNAL FTO
- historique des sessions
- sessions en cours / terminées
- objectifs personnalisés
- priorité Faible / Moyenne / Haute / Critique
- marquer un objectif Atteint

RECOMMANDATIONS
FTO Academy analyse les évaluations existantes :
- score moyen
- module faible
- prochaine priorité conseillée

BIBLIOTHÈQUE
- mauvais / bons exemples radio
- mauvais / bons exemples de rapports
- explication du pourquoi

🏁 ÉVALUATION FINALE FTO
Affiche :
- modules validés / 16
- moyenne globale
- sessions terminées

Décisions :
- Validation FTO
- Prolongation FTO
- Échec FTO

NOUVELLES COLLECTIONS
- fto_sessions
- training_objectives
- final_fto_reviews

INSTALLATION
GitHub : remplacer
- index.html
- app.js
- style.css

Firebase Firestore :
OBLIGATOIRE de remplacer firestore.rules puis Publier.

Storage reste facultatif / ignorable.

TEST
https://waleadctn.github.io/lspd-command-center/?v=160


================================================
PHASE 16.1 — CRÉDIT DÉVELOPPEUR
================================================
Ajout de la mention :
"Développé par Walead"

Visible :
- sur l'écran de connexion
- en bas du menu latéral

En anglais :
"Developed by Walead"

Aucun changement Firestore.
Aucune nouvelle règle nécessaire.
Toutes les fonctions de la Phase 16 sont conservées.

INSTALLATION
Sur GitHub, remplacer seulement :
- index.html
- app.js
- style.css

firestore.rules peut rester inchangé.

TEST
https://waleadctn.github.io/lspd-command-center/?v=161


================================================
PHASE 16.2 — SCÉNARIOS PAR FORMATION
================================================
Le générateur est maintenant STRICTEMENT lié au module sélectionné.

AVANT
Si un module ne possédait pas de scénario prédéfini,
il pouvait retomber sur un scénario d'une autre formation.

MAINTENANT
- Le FTO choisit M01 à M16 avant de générer.
- Le pool est construit uniquement pour le module choisi.
- Aucun fallback vers un autre module.
- Tous les modules M01 à M16 disposent de scénarios grâce
  au contenu pédagogique, aux variantes et aux questions du module.

EXEMPLE
Si le FTO choisit :
M04 — Code de la route

Seuls des scénarios M04 peuvent être générés :
- contrôle routier
- conducteur nerveux
- passager perturbateur
- véhicule suspect
- variantes / niveau difficile / stress test liés à M04

Il est impossible que le générateur retourne M08 ou M11.

Le bouton dans le guide d'un module est également verrouillé
sur ce module.

Une session guidée M04 possède maintenant :
"Générer un scénario pour ce module"
et génère uniquement du M04.

FIRESTORE
Aucun changement.
Pas besoin de republier firestore.rules.

INSTALLATION
Remplacer sur GitHub :
- index.html
- app.js
- style.css

TEST
https://waleadctn.github.io/lspd-command-center/?v=162
