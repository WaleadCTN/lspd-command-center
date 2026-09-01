LSPD COMMAND CENTER — PHASE 11.1 BILINGUAL MENU FIXED

BASE
Cette version est construite directement depuis Phase 10 REGISTRATION.
Toutes les fonctions de la Phase 10 sont conservées.

NOUVEAUTÉ : FRANÇAIS / ENGLISH
- Boutons FR / EN visibles même avant la connexion.
- Le choix de langue est mémorisé dans le navigateur.
- La langue reste active après déconnexion/reconnexion.
- Le menu, les pages, les formulaires, les boutons, les tableaux,
  les modules FTO, les scénarios, les grades, les statuts et les
  messages système sont traduits.
- Les pages/modales créées dynamiquement sont automatiquement traduites.
- Les dates utilisent le format français ou anglais selon la langue.

IMPORTANT — FIREBASE
Les valeurs internes Firestore ne sont PAS traduites.
Exemple :
  Firestore garde status = "En attente"
mais un utilisateur anglais voit :
  Pending

Cela évite de casser les règles, les filtres, les rôles, les promotions,
les évaluations et les données déjà existantes.

CONTENU ÉCRIT PAR LES UTILISATEURS
Les messages, commentaires, annonces et rapports rédigés librement par
les utilisateurs ne sont pas automatiquement traduits : ils restent
dans la langue dans laquelle leur auteur les a écrits.
L'interface autour de ces contenus est traduite.

INSTALLATION
Sur GitHub, remplace :
- index.html
- app.js
- style.css

FIRESTORE
AUCUNE nouvelle règle Firestore n'est nécessaire pour le bilingue.
Le fichier firestore.rules est inclus et reste compatible avec Phase 10.

STORAGE
Toujours optionnel. Tu peux continuer à ignorer storage.rules.

TEST
https://waleadctn.github.io/lspd-command-center/?v=110

TEST CONSEILLÉ
1. Ouvre le site.
2. Clique EN.
3. Vérifie la connexion / création de compte.
4. Connecte le Chief.
5. Vérifie Dashboard, Inscriptions, FTO, Officiers, Congés, Promotions, etc.
6. Passe FR pendant que tu es connecté : la page doit revenir en français immédiatement.


CORRECTION 11.1
- Le menu latéral est maintenant traduit en FR / EN.
- Les emoji/icônes restent visibles.
- Aucun changement Firebase/Firestore.
- Aucune fonction de la Phase 11 n'est retirée.

Exemples :
- 🏠 Dashboard -> 🏠 Tableau de bord
- 📚 Manuel FTO -> 📚 FTO Manual
- 👮 Officiers -> 👮 Officers
- 🌴 Congés -> 🌴 Leave

TEST
https://waleadctn.github.io/lspd-command-center/?v=111
