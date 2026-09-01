LSPD COMMAND CENTER — PHASE 9.0 ADDITIVE

BASE
Cette version est construite directement depuis Phase 8.1 FIXED.
Les fonctions/pages de 8.1 sont conservées et les nouveautés sont ajoutées par-dessus.

À REMPLACER SUR GITHUB
- index.html
- app.js
- style.css

FIRESTORE
Firebase > Firestore Database > Règles
Colle firestore.rules puis clique Publier.

NOUVEAUTÉS PHASE 9
- Centre de notifications + compteur non lu
- Notification lors d'un message reçu
- Notification lors d'une annonce
- Notification après validation/refus d'un rapport
- Workflow Corrections & addenda
- Le document original n'est jamais écrasé
- Une correction approuvée crée un addendum immuable
- Pièces jointes optionnelles sur les rapports d'incident
- Images/PDF visibles depuis la page de validation
- Approbation des corrections réservée à Lieutenant+

PIÈCES JOINTES / FIREBASE STORAGE
C'est optionnel. Le reste du site fonctionne sans pièce jointe.

Pour les activer :
1. Firebase Console > Storage
2. Active/crée le bucket si nécessaire
3. Storage > Rules
4. Colle storage.rules
5. Publie

Limite incluse : 10 Mo par fichier.
Types autorisés : images et PDF.

TEST
https://waleadctn.github.io/lspd-command-center/?v=90
