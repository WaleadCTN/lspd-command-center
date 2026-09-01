LSPD COMMAND CENTER — PHASE 10.0 ADDITIVE

BASE STABLE
Cette version est construite directement depuis Phase 9 ADDITIVE.
Les fonctions existantes sont conservées.
La Phase 10 ajoute uniquement le système d'inscription/validation.

NOUVEAU FONCTIONNEMENT

1. Un nouvel officier ouvre le site LSPD.
2. Il clique "Créer un compte".
3. Il saisit :
   - Nom RP
   - Email
   - Mot de passe
4. Firebase Authentication crée automatiquement son compte et son UID.
5. Le site crée automatiquement users/{uid} avec :
   - badge: —
   - grade: PO1
   - role: Officer
   - division: Patrol
   - status: En attente
6. Tant qu'il n'est pas validé, il ne voit PAS le Command Center.
7. Le Chief voit la demande dans :
   Inscriptions
8. Le Chief choisit :
   - Matricule
   - Grade
   - Rôle
   - Division
9. Le Chief clique "Valider l'inscription".
10. Le profil devient Actif et l'utilisateur peut accéder au site.

REFUS
Le Chief peut refuser une demande.
Le compte Firebase Authentication existe toujours, mais il reste bloqué sur un écran "Inscription refusée".
Il peut ensuite être réexaminé par le Chief.

IMPORTANT
Tu n'as plus besoin d'aller dans Firebase Authentication pour créer les nouveaux comptes.
Le nouvel utilisateur se crée lui-même depuis le site.

Firebase Console reste utile uniquement pour les opérations exceptionnelles :
- suppression définitive d'un compte Authentication
- dépannage
- réinitialisations administratives

À REMPLACER SUR GITHUB
- index.html
- app.js
- style.css

FIRESTORE OBLIGATOIRE
Firebase > Firestore Database > Règles
Colle le nouveau firestore.rules
Puis clique Publier.

STORAGE
Toujours optionnel.
Tu as indiqué ne pas utiliser Firebase Storage.
Tu peux donc IGNORER storage.rules.

TEST
https://waleadctn.github.io/lspd-command-center/?v=100

TEST CONSEILLÉ
Pour tester une vraie inscription, utilise une autre adresse e-mail que celle du Chief :
- déconnexion
- Créer un compte
- inscription
- vérifier l'écran "En attente"
- reconnecter le Chief
- Inscriptions
- approuver la demande
- reconnecter le nouveau compte
