LSPD COMMAND CENTER — PHASE 12+13 OPERATIONS & MDT

BASE
Cette version est construite directement depuis PHASE 11.1 BILINGUAL MENU FIXED.
Toutes les fonctions de la 11.1 sont conservées.
Le site reste bilingue FR / EN.

========================================
PHASE 12 — OPERATIONS & SUIVI QUOTIDIEN
========================================

NOUVELLE PAGE : MON ESPACE OPÉRATIONNEL
Chaque officier peut voir :
- ses prochains shifts
- pointer son entrée en service
- pointer sa sortie
- ses formations auxquelles il est inscrit
- ses certifications
- ses congés
- ses sanctions / commendations

NOUVELLE PAGE : TABLEAU DE SERVICE
Visible Command.
Affiche pour aujourd'hui :
- officiers en service
- absents / non pointés
- officiers en congé
- officiers inscrits en formation

Le Chief peut :
- modifier un shift
- annuler un shift

FORMATIONS
Nouvelle page Inscriptions formations :
- capacité par session
- inscription officier
- annulation d'inscription
- compteur places occupées
- FTO peut marquer Présent / Absent

Les nouvelles formations peuvent maintenant définir une capacité de 1 à 100.

RAPPELS
Lorsqu'un utilisateur ouvre/se reconnecte au site :
- rappel si un shift commence dans les 24h
- rappel si une formation inscrite commence dans les 24h

IMPORTANT :
Sans serveur payant / fonction planifiée, ces rappels sont générés à l'ouverture du site.
Ils ne sont pas des notifications push lorsque le site est fermé.

========================================
PHASE 13 — MDT / DIVISIONS
========================================

NOUVELLE PAGE : MDT / DOSSIERS
- création de dossiers d'enquête
- numéro de dossier automatique
- catégories
- statut Ouvert / Clos
- rapports d'incident accessibles dans le même espace
- Command peut clôturer un dossier

NOUVELLE PAGE : DIVISIONS & CANDIDATURES
- présentation Patrol / Traffic / Detective / SWAT / Air Support / Training / Command
- un officier peut candidater à une division
- motivation obligatoire
- Command peut voir les candidatures
- Chief approuve/refuse
- si approuvé, la division de l'officier est changée automatiquement
- notification au candidat

========================================
INSTALLATION
========================================

SUR GITHUB, REMPLACER :
- index.html
- app.js
- style.css

FIRESTORE : OBLIGATOIRE
Firebase > Firestore Database > Règles
Coller le nouveau firestore.rules
Cliquer Publier.

Le nouveau firestore.rules est nécessaire pour :
- pointage shifts
- inscriptions formations
- présence formations
- dossiers MDT
- candidatures divisions

STORAGE
Toujours optionnel.
Tu peux continuer à NE PAS utiliser storage.rules.

TEST
https://waleadctn.github.io/lspd-command-center/?v=130

TEST CONSEILLÉ
1. Tester FR puis EN.
2. Officer : Mon espace opérationnel.
3. Chief : créer un shift pour aujourd'hui.
4. Officer : Pointer l'entrée puis la sortie.
5. FTO : créer une formation avec capacité.
6. Officer : s'inscrire.
7. FTO : marquer la présence.
8. Créer un dossier MDT.
9. Officer : candidater à Traffic/Detective/etc.
10. Chief : approuver la candidature.
