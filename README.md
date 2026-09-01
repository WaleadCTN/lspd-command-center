# LSPD Command Center

Prototype web interactif du manuel FTO LSPD.

## Inclus
- Dashboard
- Manuel FTO
- 16 modules de formation
- Évaluations FTO
- Base officiers
- Grades PO1 → Chief
- Scénarios
- Historique
- Sauvegarde locale navigateur

## Important
Cette version est immédiatement utilisable en démonstration mais la base de données est locale au navigateur.
Pour une vraie utilisation multi-utilisateurs, il faut connecter Supabase (authentification + PostgreSQL) et remplacer le stockage local par les tables Supabase.

## Hébergement gratuit
Le dossier peut être publié sur GitHub Pages. Ensuite, la version multi-utilisateurs peut utiliser Supabase Free.

## Évolution recommandée
1. Authentification (Admin / Command / FTO / Officer)
2. Tables officers, training_modules, evaluations, scenarios, audit_log
3. RLS Supabase
4. Dashboard commandement
5. Historique immuable des évaluations
6. Export PDF/CSV
7. Notifications et rappels
