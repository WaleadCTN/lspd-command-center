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


================================================
PHASE 17.1 — NAVIGATION REGROUPÉE
================================================
Le menu latéral est maintenant organisé en catégories :

1. Accueil & personnel
   - Dashboard
   - Portail visiteur
   - Mon profil
   - Mon espace opérationnel
   - Notifications

2. Communication & rapports
   - Annonces
   - Messages
   - Rapports d'incident
   - Validations
   - Corrections & addenda

3. FTO & formation
   - Manuel FTO
   - FTO Academy
   - Journal FTO
   - Évaluation finale
   - Dossier FTO
   - Stats formation
   - Gestion Academy
   - Quiz
   - Feedback
   - Formations
   - Évaluations
   - Mes recrues
   - Affectations FTO
   - Calendrier
   - Inscriptions formations
   - Scénarios

4. Personnel & carrière
   - Officiers
   - Certifications
   - Dossiers & distinctions
   - Congés
   - À valider
   - Promotion Advisor
   - Promotions
   - Divisions
   - Grades

5. Opérations & MDT
   - Roster & shifts
   - Tableau de service
   - CAD / Dispatch
   - Watch Commander
   - BOLO
   - MDT

6. Commandement & administration
   - Inscriptions
   - Statistiques
   - Admin
   - Permissions
   - Historique

ERGONOMIE
- chaque groupe peut être ouvert / fermé
- l'état des groupes est mémorisé dans le navigateur
- le groupe de la page active s'ouvre automatiquement
- les groupes sans aucune page autorisée sont masqués
- compatible avec les permissions dynamiques
- compatible avec le rôle Visiteur
- compatible menu réduit et mobile
- FR / EN

FIRESTORE
Aucun changement.
Ne pas remplacer firestore.rules pour cette phase.

INSTALLATION
Remplacer uniquement :
- index.html
- app.js
- style.css

TEST
https://waleadctn.github.io/lspd-command-center/?v=171


================================================
PHASE 17.2 — NOTIFICATIONS + MESSAGERIE OUTLOOK
================================================

NOTIFICATIONS
- Notifications retirées du menu de gauche
- Cloche 🔔 ajoutée en haut
- Badge rouge = notifications non lues
- Clic = panneau flottant type téléphone
- La page derrière ne change jamais
- Marquer une notification comme lue sans quitter la page
- Tout marquer comme lu
- X / clic extérieur / Échap pour fermer
- Mise à jour du badge en temps réel
- Si une notification correspond à un nouveau message récent,
  "Ouvrir" affiche le message dans une fenêtre au-dessus de la page,
  sans changer la page derrière

MESSAGERIE TYPE OUTLOOK
La page Messages devient une vraie boîte mail :
- Boîte de réception
- Envoyés
- Tous les messages
- Recherche
- Badge de messages non lus
- Nouveau message
- Lecture dans une fenêtre flottante
- La liste derrière reste affichée
- Répondre
- Transférer
- Marquer comme non lu
- Conversation / thread visible
- Composer dans une fenêtre flottante
- Les réponses gardent le threadId
- Les transferts gardent forwardedFromId
- Responsive mobile

IMPORTANT
Les anciens messages restent compatibles.
S'ils n'ont pas encore de champ "read", ils apparaissent comme non lus
jusqu'à leur première ouverture.

NOUVELLES DONNÉES POSSIBLES DANS messages/
- read
- readAt
- threadId
- messageType
- replyToId
- forwardedFromId

SÉCURITÉ
- Seul l'expéditeur et le destinataire peuvent lire un message.
- Le destinataire peut uniquement modifier read/readAt.
- Réponse et transfert créent de nouveaux messages.
- Les Visiteurs n'ont toujours pas accès à la messagerie.
- Les utilisateurs internes peuvent consulter l'annuaire interne
  afin de choisir un destinataire. Les profils Visiteur restent exclus
  de cette sélection.

FIRESTORE
⚠️ OBLIGATOIRE :
remplacer firestore.rules puis Publier.

Cette phase modifie les règles pour :
- autoriser le destinataire à marquer ses messages lus/non lus
- permettre l'annuaire interne nécessaire à la messagerie

INSTALLATION
GitHub :
- index.html
- app.js
- style.css

Firebase :
- firestore.rules → Firestore Database → Règles → Publier

TEST
https://waleadctn.github.io/lspd-command-center/?v=172


================================================
PHASE 17.3 — MESSAGERIE POUR TOUS + ENVOIS GROUPÉS
================================================

CORRECTION D'ACCÈS
- La page Messages est explicitement accessible à tous les membres internes :
  Officer, FTO, Sergeant, Lieutenant, Captain, Deputy Chief,
  Assistant Chief et Chief.
- Le rôle Visiteur reste exclu de la messagerie interne.
- Correction importante Firestore : le répertoire mail utilise désormais
  une requête qui exclut explicitement les profils Visiteur.
  Cela évite le "permission-denied" qui touchait les comptes non-admin.

NOUVEAU COMPOSITEUR
Il est maintenant possible de sélectionner simultanément :

1. PLUSIEURS PERSONNES
   - recherche par nom / matricule / grade / division / certification
   - cases à cocher individuelles

2. UN OU PLUSIEURS GRADES
   Exemples :
   - tous les PO1
   - tous les Sergents
   - PO1 + PO2 + PO3
   - Captain + Deputy Chief + Assistant Chief

3. UNE OU PLUSIEURS CERTIFICATIONS
   Exemples :
   - tous les FTO certifiés
   - tous les membres Traffic
   - SWAT + Pursuit
   - Air Support + Supervisor

COMBINAISON
Les sélections sont en UNION.
Exemple :
- John Smith sélectionné individuellement
- tous les PO3
- tous les certifiés FTO

=> tous ces membres reçoivent le message.
Si une personne appartient à plusieurs sélections, elle ne reçoit
qu'UNE SEULE copie grâce à la déduplication automatique.

CONFIDENTIALITÉ
Pour un envoi à 20 personnes, le système crée 20 messages personnels.
Chaque destinataire ne voit que sa propre copie et ne voit pas
les conversations privées des autres destinataires.

RÉPONSES
- "Répondre" reste une réponse directe à l'expéditeur.
- "Transférer" permet à nouveau de choisir plusieurs personnes,
  grades ou certifications.

FIRESTORE
⚠️ OBLIGATOIRE :
Publier le nouveau firestore.rules.

Modification nécessaire :
- les membres internes peuvent lire le répertoire des certifications
  pour résoudre les groupes de destinataires
- les Visiteurs restent exclus

INSTALLATION
GitHub :
- index.html
- app.js
- style.css

Firebase :
- firestore.rules → Firestore Database → Règles → Publier

TEST
https://waleadctn.github.io/lspd-command-center/?v=173


================================================
PHASE 17.4 — REFONTE COMPLÈTE FTO & FORMATION
================================================

OBJECTIF
La partie FTO était devenue très riche mais trop fragmentée.
Cette phase ne supprime pas les fonctionnalités précédentes :
elle les reconnecte autour d'un parcours unique et plus simple.

NOUVELLE NAVIGATION FTO
Le menu gauche passe d'environ 16 entrées à 8 entrées principales :
- Centre FTO & Formation
- Mon parcours formation
- Quiz & connaissances
- Calendrier & inscriptions
- Mes recrues
- Évaluations
- Sessions & objectifs
- Administration formation

Les anciennes fonctions restent accessibles depuis le Centre ou
la barre de navigation FTO contextuelle :
- Manuel FTO
- FTO Academy
- Évaluation finale
- Dossier complet recrue
- Stats formation
- Affectations FTO
- Planning des formations
- Scénarios
- Feedback recrue

CENTRE FTO & FORMATION
Accessible à tous les membres internes.

POUR UNE RECRUE / OFFICER
- affiche son FTO actif
- progression M01-M16
- moyenne
- prochain module recommandé
- objectifs ouverts
- prochaine formation inscrite
- accès direct aux quiz, planning, évaluations et feedback
- chaque module ouvre une fiche contextuelle

POUR UN FTO
- liste des recrues accessibles
- progression de chaque recrue
- FTO actif
- module recommandé
- objectifs ouverts
- accès direct "Espace recrue"
- démarrage rapide d'une session
- nouvelle évaluation
- Journal FTO
- Academy

ESPACE RECRUE
Nouvelle page centrale pour le FTO :
- profil recrue
- affectation FTO active
- progression M01-M16
- moyenne
- sessions terminées
- module recommandé
- objectifs ouverts
- sessions récentes
- évaluations récentes
- feedback recrue
- passation FTO
- statut validation finale

Actions directes :
- Démarrer une session sur le module recommandé
- Nouvelle évaluation préremplie
- Ajouter un objectif prérempli
- Générer un scénario du module recommandé
- Ouvrir le dossier complet
- Ajouter une passation FTO

LIENS ENTRE MODULES ET FTO
Chaque module ouvre maintenant une fiche qui montre :
- statut dans le parcours
- FTO actif de la recrue
- dernière évaluation
- nombre de sessions
- dernier quiz
- objectif et déroulé pédagogique
- erreurs critiques
- action corrective

Depuis cette fiche :
FTO :
- guide complet
- scénario du module
- démarrer une session
- évaluer le module

Recrue :
- lancer le quiz
- ouvrir le planning

PARCOURS FORMATION
La page Formations devient un vrai parcours :
- Validé
- Prêt à commencer
- En progression
- À retravailler
- Verrouillé par prérequis

COMMAND
Le Centre affiche des raccourcis vers :
- Affectations FTO
- Validations finales
- Stats formation
- Planification formations
- Gestion Academy
- Manuel FTO

BARRE CONTEXTUELLE
Toutes les pages de formation affichent une petite barre commune :
Centre / Mon parcours / Planning / Mes recrues / Sessions /
Évaluations / Gestion selon les permissions.

FIRESTORE
⚠️ OBLIGATOIRE : publier le nouveau firestore.rules.

Modification :
Une recrue peut maintenant lire uniquement sa propre affectation FTO.
Cela permet d'afficher "Mon FTO" dans le Centre.
La recrue ne peut ni créer ni modifier une affectation.

AUCUNE NOUVELLE COLLECTION FIRESTORE.
Les données existantes sont réutilisées.

INSTALLATION
GitHub :
- index.html
- app.js
- style.css

Firebase :
- firestore.rules → Firestore Database → Règles → Publier

TEST
https://waleadctn.github.io/lspd-command-center/?v=174


================================================
PHASE 17.5 — TRAINING HUB PRO
================================================

POURQUOI CETTE REFONTE ?
La Phase 17.4 reliait mieux les outils, mais restait encore trop dense.
La Phase 17.5 adopte une logique plus proche d'une application moderne :
1 centre unique, 5 onglets maximum, actions immédiates.

MENU GAUCHE
La section Formation & FTO ne contient plus que :
- Centre Formation
- Évaluations
- Configuration formation

Toutes les autres fonctions avancées restent conservées et sont accessibles
depuis le Centre Formation lorsque le rôle en a besoin.

CENTRE FORMATION
5 onglets maximum :
1. Vue d'ensemble
2. Mes formations
3. Mon parcours
4. Mes recrues (FTO seulement)
5. Pilotage (Command/FTO autorisé)

VUE D'ENSEMBLE
Affiche seulement les informations utiles :
- invitations en attente
- prochaine formation
- FTO actif
- prochain module
- progression M01-M16
- bouton Créer une formation pour le FTO
- raccourcis vers quiz / feedback / évaluation / Academy

CRÉER UNE FORMATION — ASSISTANT 3 ÉTAPES
Le FTO clique "Créer une formation".

Étape 1 : Informations
- module M01-M16
- titre
- date
- heure
- lieu
- capacité
- notes / objectif

Étape 2 : Invitations
Le FTO peut inviter :
- plusieurs personnes individuellement
- un ou plusieurs grades
- une ou plusieurs certifications

Les sélections peuvent être mélangées.
Les doublons sont supprimés automatiquement.

Étape 3 : Confirmation
Le FTO vérifie :
- module
- titre
- date / heure
- lieu
- nombre d'invités
- capacité
Puis clique :
"Créer et envoyer les invitations"

AUTOMATISATION
La création :
- crée training_events
- crée une invitation training_registrations pour chaque invité
- envoie une notification à chaque invité
- conserve le formateur
- crée un audit

INVITÉ
L'utilisateur voit l'invitation dans :
Centre Formation → Mes formations

Il peut :
- Accepter
- Refuser

Accepter :
status = Inscrit
attendanceStatus = Inscrit

Refuser :
status = Refusé
attendanceStatus = Invitation refusée

FTO — GÉRER UNE FORMATION
Mes formations → Mes formations créées → Gérer la formation

Le FTO voit :
- confirmés
- invitations sans réponse
- refus
- capacité
- participants

Actions :
- inviter des membres supplémentaires
- gérer les présences
- lancer un scénario du module

MES RECRUES
Interface volontairement simple :
- Ouvrir le dossier
- Démarrer une session
- Évaluer

PILOTAGE
Les fonctions avancées sont regroupées ici :
- Affectations FTO
- Validations finales
- Stats formation
- Sessions & objectifs
- Academy / Guide FTO
- Configuration Academy
- Calendrier détaillé
- Manuel FTO

ANCIENNES FONCTIONS
Toutes les fonctions Phase 17.4 sont conservées.
Le changement concerne surtout la navigation et le workflow.

FIRESTORE
⚠️ Nouveau firestore.rules OBLIGATOIRE.

training_registrations permet maintenant :
- auto-inscription classique
- invitation créée par un utilisateur training_manage
- acceptation/refus par l'invité
- gestion présence par le FTO

VISITEURS
Toujours aucun accès aux formations internes.

INSTALLATION
GitHub :
- index.html
- app.js
- style.css

Firebase :
- firestore.rules → Firestore Database → Règles → Publier

TEST
https://waleadctn.github.io/lspd-command-center/?v=175


================================================
PHASE 17.6 — UNE FORMATION = UNE VALIDATION
================================================

PRINCIPE
Le modèle pédagogique est simplifié :

FORMATION
→ ÉVALUATION
→ RÉSULTAT

Une formation se fait en une fois.
Le FTO ne doit plus créer plusieurs séances normales sur le même module.

Exemple M04 :
1. Le FTO crée M04.
2. Il invite la recrue / les participants.
3. La formation M04 est faite en une fois.
4. Le FTO clique "Terminer la formation".
5. Il évalue chaque participant.
6. Résultat individuel :
   - Validé
   - À revoir
   - Échec

Dans l'interface :
Validé = Formation validée
À revoir / Échec = Formation à refaire

Si la formation est à refaire, une nouvelle formation M04 peut être créée
plus tard. Ce nouveau passage remplace l'idée d'une accumulation de séances.

FORMATIONS INDÉPENDANTES
Les M01 à M16 ne se bloquent plus entre elles.

Il est possible d'avoir :
- M01 non évaluée
- M02 validée
- M03 validée
- M04 à refaire
- M09 validée

Le système n'exige plus 16/16 pour considérer la situation correcte.
Les validations sont individuelles.

PRÉREQUIS
Les prérequis historiques restent dans le contenu Academy comme conseil
pédagogique, mais ils ne verrouillent plus :
- le parcours
- les formations
- les quiz

ESPACE RECRUE
L'ancien écran complexe est remplacé par :

1. Identité + FTO actif
2. Explication :
   Une formation → Une évaluation → Un résultat
3. Une grosse action :
   "Continuer la formation de [recrue]"
4. Résumé :
   - formations validées
   - formations à refaire
   - non évaluées
   - moyenne
5. Actions secondaires :
   - évaluer
   - objectif correctif
   - dossier complet
   - passation
6. M01-M16 avec seulement :
   - Formation validée
   - Formation à refaire
   - Formation planifiée
   - Non évaluée

PLANIFICATION DEPUIS LA RECRUE
Le bouton principal ouvre directement l'assistant de création :
- module prérempli
- recrue pré-sélectionnée
- date / heure / lieu à compléter
- possibilité d'ajouter d'autres personnes, grades ou certifications

GESTION FORMATION
Le FTO ouvre sa formation puis suit :

1. Présences
2. Programme / scénario si besoin
3. Terminer la formation
4. Évaluer chaque participant

Après "Terminer la formation", un bouton Évaluer apparaît pour chaque
participant confirmé.

ÉVALUATION LIÉE À LA FORMATION
Les nouvelles évaluations faites depuis une formation enregistrent :
trainingEventId

Cela permet à la page de formation d'afficher immédiatement :
- Validé + score
- À revoir + score
- Échec + score

La présence passe également à :
Évalué — Validé
ou
Évalué — À revoir
ou
Évalué — Échec

QUIZ
Tous les quiz M01-M16 sont maintenant accessibles indépendamment.
Plus de verrouillage par prérequis.

ANCIENNES SESSIONS FTO
Les anciennes données fto_sessions sont conservées.
Elles apparaissent comme "Ancien historique FTO" lorsqu'elles existent.
Elles n'influencent plus le fonctionnement normal de la Phase 17.6.

ACADEMY
Les guides, contenus, scénarios, erreurs critiques, questions et actions
correctives sont conservés.
Le bouton principal de l'Academy devient "Créer une formation" au lieu de
pousser le FTO vers plusieurs sessions guidées.

FIRESTORE
⚠️ Nouveau firestore.rules à publier.

Le formateur peut maintenant clôturer sa propre training_event :
status = Terminée

Les seuls champs modifiables sont :
- status
- completedAt
- completedById
- completedByName

Aucune modification libre du contenu de la formation.
Aucune suppression.

INSTALLATION
GitHub :
- index.html
- app.js
- style.css

Firebase :
- firestore.rules → Firestore Database → Règles → Publier

TEST
https://waleadctn.github.io/lspd-command-center/?v=176
