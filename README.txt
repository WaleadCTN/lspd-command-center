LSPD COMMAND CENTER — CLEAN PHASE 3.1

IMPORTANT:
Replace ALL 3 website files on GitHub:
- index.html
- app.js
- style.css

The new index.html contains ONLY:
<script type="module" src="app.js?v=3.1"></script>

No Firebase code must remain inline in index.html.

FIRESTORE:
Open Firebase > Firestore Database > Règles
Paste firestore.rules
Click Publier.

Then wait for GitHub Pages deployment and use:
https://waleadctn.github.io/lspd-command-center/?v=31

FEATURES:
- Firebase login
- Firestore profile loading
- Officer list
- Chief profile management
- Real FTO evaluation form
- 6 scoring criteria
- Automatic score and result
- Firestore evaluation history
- Personal training progress
- Audit log for command
- Role-based visibility
