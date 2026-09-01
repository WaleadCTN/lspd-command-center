LSPD COMMAND CENTER — PHASE 17
ACADEMY PRO + TRAINING MANAGEMENT + SECURE VISITOR

BASE
Construite directement depuis Phase 16.2.
Toutes les fonctions précédentes doivent rester présentes.

========================================
VISITEUR — NOUVEAU GRADE ET RÔLE
========================================
Nouveau grade : Visiteur
Nouveau rôle : Visiteur
Division externe : External

Le visiteur crée son compte exactement comme les autres :
- nom
- adresse e-mail
- mot de passe
- attente de validation Chief

Le Chief décide ensuite, depuis Inscriptions, s'il lui attribue Visiteur.
Quand Visiteur est choisi, le formulaire harmonise :
- Grade Visiteur
- Rôle Visiteur
- Division External
- matricule VIS-xxxx proposé si vide

IMPORTANT SECURITE
Le rôle Visiteur est bloqué au niveau Firestore, pas seulement dans l'interface.
Il ne peut pas lire :
- officiers / personnel
- messages
- incidents
- MDT
- BOLO
- CAD
- shifts / roster
- congés
- évaluations
- FTO Academy interne
- audit
- permissions
- dossiers RH
- formations planifiées
- données de recrues

Le Visiteur peut voir seulement :
- son propre profil
- Portail visiteur
- annonces marquées Public
- structure générale statique du département
- catalogue général M01-M16 sans résultats ni données personnelles

Les annonces ont maintenant une Visibilité :
- Interne
- Public
Les anciennes annonces sans champ visibility restent internes.

========================================
ACADEMY PRO — CONTENU MODIFIABLE
========================================
Nouvelle permission : academy_content_manage
Nouvelle page : Gestion Academy

Permet de modifier M01-M16 directement depuis l'application :
- durée
- prérequis
- objectif FR/EN
- étapes FTO FR/EN
- exemple RP FR/EN
- variantes FR/EN
- erreurs fréquentes FR/EN
- erreurs critiques FR/EN
- questions/réponses FR/EN
- action corrective FR/EN

Aucun changement app.js n'est nécessaire ensuite.
Les données sont enregistrées dans academy_content.
Le contenu d'origine reste disponible comme fallback.

========================================
SCENARIOS PERSONNALISES
========================================
Depuis Gestion Academy :
- choisir M01-M16
- difficulté
- situation FR/EN
- contraintes FR/EN
- réussite attendue FR/EN
- archiver un scénario

Collection : academy_scenarios

Le générateur de Phase 16.2 reste strictement limité au module choisi.
Les scénarios personnalisés sont ajoutés au pool du même module uniquement.

========================================
QUIZ + PARCOURS
========================================
Nouvelle page : Quiz formations

- Quiz basé sur les questions/réponses du module
- Score automatique
- 75% pour réussir
- Historique Firestore
- Prérequis M01-M16 pris en compte
- Module verrouillé si un prérequis n'est pas validé

Collection : academy_quiz_attempts

========================================
DOSSIER FTO RECRUE
========================================
Nouvelle page : Dossier FTO recrue

Affiche sur une seule page :
- heatmap M01-M16
- moyenne
- sessions terminées
- objectifs ouverts
- modules faibles
- plan de rattrapage recommandé
- passations FTO
- feedback recrue
- résumé historique

Bouton rapport final imprimable.

Collection passations : fto_handoffs

========================================
FEEDBACK RECRUE
========================================
Nouvelle page : Feedback formation

La recrue peut sélectionner une session FTO et indiquer :
- compréhension 1 à 5
- difficulté rencontrée
- question au FTO

Collection : fto_feedback
Le FTO retrouve ce feedback dans le dossier de la recrue.

========================================
VALIDATION FINALE A DEUX NIVEAUX
========================================
Nouvelle permission : academy_final_review

Le FTO crée sa recommandation :
- Validation FTO
- Prolongation FTO
- Échec FTO

Elle passe ensuite en :
En attente Commandement

Le Command autorisé peut :
- Valider définitivement
- Refuser la validation

========================================
PERMISSIONS
========================================
Les deux nouvelles permissions sont ajoutées à la page Permissions :
- academy_content_manage
- academy_final_review

Le rôle Visiteur apparaît dans Permissions mais ses permissions sensibles sont verrouillées.
Le Chief garde tous les droits.

Une migration de configuration Phase 17 est effectuée au premier chargement Chief pour ajouter les nouvelles permissions sans réactiver les anciennes permissions que tu avais désactivées.

========================================
INSTALLATION
========================================
GitHub : remplacer
- index.html
- app.js
- style.css

FIREBASE FIRESTORE : OBLIGATOIRE
- remplacer firestore.rules
- Publier

Le nouveau firestore.rules est indispensable pour la sécurité Visiteur et les nouvelles collections Academy.

Storage reste facultatif.

TEST
https://waleadctn.github.io/lspd-command-center/?v=170

TEST PRIORITAIRE
1. Connecte-toi Chief.
2. Ouvre Permissions et vérifie les nouvelles permissions.
3. Crée un second compte de test.
4. Chief > Inscriptions > attribue Visiteur.
5. Connecte-toi avec ce compte : seul le Portail visiteur / profil / annonces publiques doivent être accessibles.
6. Crée une annonce Interne : le Visiteur ne doit pas la voir.
7. Crée une annonce Public : le Visiteur doit la voir.
8. FTO > Gestion Academy > modifie M04.
9. Ajoute un scénario M04 et génère plusieurs scénarios M04.
10. Teste Quiz formations, Dossier FTO et validation finale commandement.


================================================
STATS FORMATION & ALERTES INTELLIGENTES
================================================
Nouvelle page :
📈 Stats formation

Pour les rôles autorisés academy_manage :
- nombre total d'évaluations
- sessions FTO terminées
- tentatives de quiz
- taux de validation finale
- moyenne et échecs par module
- statistiques par FTO
- recrues sans évaluation récente

Alertes FTO intelligentes :
- recrue active sans évaluation depuis 7 jours
- objectif pédagogique Critique encore ouvert
- notification créée automatiquement dans le centre de notifications

IMPORTANT :
Le site reste 100% client / Firebase gratuit. Les alertes sont générées
lorsque le FTO ouvre ou reconnecte le site, sans scheduler serveur payant.
