LSPD COMMAND CENTER — PHASE 14+15
UI/UX REFRESH + CAD + BOLO + WATCH COMMANDER + DYNAMIC PERMISSIONS

BASE
Construite directement depuis Phase 12+13 Operations & MDT.
Les fonctions existantes sont conservées.
FR / EN est conservé.

================================================
PHASE 14 — REFONTE VISUELLE & ERGONOMIQUE
================================================
- Sidebar moderne et rétractable sur PC
- Menu mobile avec overlay
- Header sticky
- Horloge live
- Command Palette (Ctrl+K / Cmd+K)
- Navigation rapide vers les pages autorisées
- Toasts modernes à la place des alert() classiques
- Cards, tableaux, boutons, formulaires et modales améliorés
- En-têtes de tableaux sticky
- Animations de changement de page
- Responsive amélioré
- Design plus "Police Command Center"

================================================
PERMISSIONS DIRECTEMENT DANS L'APPLICATION
================================================
NOUVELLE PAGE :
🔐 Permissions

Le Chief peut cocher/décocher les droits de chaque rôle :
Officer
FTO
Sergeant
Lieutenant
Captain
Deputy Chief
Assistant Chief
Chief

Exemples de permissions :
- FTO tools
- voir / gérer les officiers
- voir / gérer affectations FTO
- certifications
- dossiers RH
- shifts
- tableau de service
- congés
- formations
- validation incidents
- MDT
- candidatures divisions
- promotions
- statistiques
- audit
- annonces
- inscriptions
- CAD
- BOLO
- Watch Commander

IMPORTANT :
Les permissions sont enregistrées dans :
settings/permissions

Les règles Firestore lisent cette configuration.
Ce n'est donc PAS uniquement du masquage visuel.

Sécurité :
- Le Chief garde toujours tous les droits.
- Même si un rôle reçoit "Modifier profils officiers",
  seul le Chief peut changer le champ ROLE d'un utilisateur.
  Cela évite qu'un utilisateur se donne Chief.

Si le document settings/permissions n'existe pas encore :
- le site utilise les permissions par défaut de l'ancienne version
- le Chief le crée automatiquement à sa première connexion

================================================
PHASE 15 — CAD / DISPATCH
================================================
NOUVELLE PAGE :
📡 CAD / Dispatch

Chaque officier peut créer/mettre à jour sa propre unité :
- indicatif (ex. ADAM-547)
- partenaire
- division
- localisation
- note
- statut :
  Disponible
  En intervention
  Transport
  Pause
  Hors service

Le tableau CAD utilise Firestore onSnapshot :
les modifications apparaissent en temps réel pour les utilisateurs
qui ont la page CAD ouverte.

Permission cad_manage :
permet de gérer les unités des autres officiers.

================================================
BOLO
================================================
NOUVELLE PAGE :
🚨 BOLO / Avis

Tous les utilisateurs connectés peuvent consulter les BOLO.

Les rôles ayant bolo_manage peuvent :
- créer un BOLO
- Personne / Véhicule / Autre
- priorité Normal / Important / Critique
- plaque véhicule
- description
- clôturer le BOLO

================================================
WATCH COMMANDER
================================================
NOUVELLE PAGE :
🛡️ Watch Commander

Le rôle autorisé peut :
- sélectionner le Watch Commander
- démarrer un service
- publier le briefing
- clôturer le service
- écrire une note de passation
- consulter l'historique des watches

Permission :
watch_manage

================================================
INSTALLATION
================================================
SUR GITHUB — REMPLACER :
- index.html
- app.js
- style.css

FIRESTORE — OBLIGATOIRE :
Firebase > Firestore Database > Règles
Remplacer avec firestore.rules
Puis Publier.

IMPORTANT :
Le nouveau firestore.rules est indispensable pour les permissions dynamiques,
CAD, BOLO et Watch Commander.

STORAGE :
Toujours facultatif.
Tu peux continuer à ignorer storage.rules.

TEST :
https://waleadctn.github.io/lspd-command-center/?v=150

TEST CONSEILLÉ :
1. Chief -> Permissions
2. Modifier un droit pour Sergeant
3. Se connecter avec un Sergeant et vérifier le menu
4. Tester CAD avec 2 comptes ouverts
5. Modifier l'état d'une unité et vérifier la mise à jour live
6. Créer un BOLO
7. Démarrer un Watch Commander
8. Tester Ctrl+K
9. Tester le menu rétractable
10. Tester FR puis EN
