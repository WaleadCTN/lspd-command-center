PHASE 17.11.9 — RECRUITMENT WORKFLOW PERMISSION FIX

CAUSE EXACTE DU BUG DE PRÉSÉLECTION
- app.js écrivait publicDecisionMessage pendant la présélection.
- firestore.rules n'autorisait pas ce champ pour recruitment_screening.
- Firebase renvoyait donc permission-denied, y compris au Chief.

CORRECTIONS
- publicDecisionMessage est désormais autorisé de façon contrôlée pendant la présélection.
- La présélection n'écrit ce champ que lorsqu'il est réellement nécessaire.
- Présélection, évaluation d'entretien et Command Decision sont maintenant atomiques : review interne + candidature sont enregistrées ensemble ou annulées ensemble.
- Les statuts autorisés à la présélection sont limités à Pré-sélectionné / En étude / Refusé.
- Les 349 fonctions existantes de la 17.11.8 sont conservées, plus le helper atomique.

IMPORTANT : publier firestore.rules manuellement dans Firebase Console > Firestore Database > Règles.

PHASE 17.11.8 — INCORPORATION REPAIR FIX

Correction ciblée du permission-denied lors de l'incorporation finale.
- Autorise la reprise sécurisée d'un candidat dont users/{uid} a déjà été partiellement converti en Officer/Actif par une ancienne tentative.
- La réparation n'est autorisée que si lspd_applications/{uid} appartient au même candidat et est Admission approuvée / Entretien réussi / Recruté.
- Le flux reste atomique.
- Publier firestore.rules manuellement dans Firebase Console est obligatoire.

LSPD COMMAND CENTER — PHASE 17.11.6 FINAL
Permissions Audit + FTO Assignments + Report Viewer

INSTALLATION
1. Remplacer sur GitHub Pages : index.html, app.js, style.css et le dossier assets/.
2. IMPORTANT : ouvrir Firebase Console > Firestore Database > Règles.
3. Remplacer les règles par le contenu de firestore.rules puis cliquer sur Publier.
4. Faire un rechargement forcé du navigateur (Ctrl+F5).
5. URL de test : ?v=17116

CORRECTIONS PRINCIPALES
- Permissions pilotées par GRADE, jamais par rôle de commandement.
- Chief of Police : bypass complet côté interface ET Firestore.
- Navigation de gauche séparée de la sécurité : cacher un menu ne retire plus une permission Firestore.
- Correction de la page Inscriptions qui pouvait casser sur le rendu du grade.
- Correction des droits de validation inscription / refus / création / suppression / codes provisoires.
- Recrutement détaillé : lecture, présélection, entretien, notation, Command Decision, incorporation, ouverture/fermeture.
- Correction des droits FTO / Academy et des écritures du journal de session.
- Affectations FTO : gestion Lieutenant+ seulement, individuelle et groupée.
- Mes recrues : uniquement affectations actives du FTO, filtre hiérarchique et recherche nom/matricule/grade.
- Rapports : bouton œil, lecteur pop-up, fermeture X / clic extérieur / Échap.
- Requêtes annuaire adaptées aux règles Firestore pour éviter les permission-denied liés aux comptes Visiteur.

RÈGLE FTO
- fto_assignments_manage a un minimum technique Lieutenant.
- Même si la case était présente dans une ancienne configuration pour un grade inférieur, elle est ignorée.
- Un Lieutenant+ peut encore se voir retirer la permission par le Chief.
- Une recrue de grade supérieur au FTO n’apparaît pas dans Mes recrues et ne peut pas être affectée à ce FTO.

CATALOGUE DES PERMISSIONS

[Comptes & inscriptions] — Validation des accès, création/suppression de profils et codes provisoires.
- Voir le module Inscriptions (registrations_manage) : Afficher et consulter les demandes d'inscription en attente.
- Approuver une inscription (registrations_approve) : Valider une inscription et définir matricule, grade, rôle et unité.
- Refuser une inscription (registrations_reject) : Refuser ou réexaminer une demande d'inscription.
- Créer un officier (personnel_create) : Créer un compte Firebase + profil LSPD depuis la gestion des officiers.
- Supprimer un officier (personnel_delete) : Supprimer le profil LSPD d'un officier (hors compte actuel).
- Voir les codes provisoires (provisional_credentials_view) : Afficher/copier le mot de passe provisoire d'un compte à activer.

[Recrutement] — Sépare chaque étape du Bureau du recrutement et la décision finale du Commandement.
- Voir les candidatures (recruitment_view) : Accéder au Bureau du recrutement et ouvrir les dossiers candidats.
- Évaluer les dossiers (recruitment_screening) : Remplir la grille de présélection /25.
- Planifier les entretiens (recruitment_interview_schedule) : Créer ou modifier une convocation d'entretien oral.
- Noter les entretiens (recruitment_interview_evaluate) : Compléter la grille d'entretien /35 et la recommandation.
- Décision finale Command (recruitment_command_decision) : Approuver/refuser définitivement une candidature après entretien.
- Finaliser l'incorporation (recruitment_incorporate) : Transformer un candidat admis en officier actif.
- Ouvrir / fermer les candidatures (recruitment_settings_manage) : Piloter le bouton public de candidature LSPD.

[Personnel & carrière] — Consultation et modification des profils, certifications, dossiers RH et promotions.
- Voir tous les officiers (personnel_view) : Accéder au roster complet et aux dossiers officier.
- Modifier identité / rôle / unité (personnel_manage) : Modifier matricule, nom RP, rôle technique et division.
- Modifier les grades (personnel_grade_manage) : Changer le grade d'un officier.
- Modifier les statuts (personnel_status_manage) : Activer, suspendre, rendre inactif ou archiver un officier.
- Créer une demande de congé (leave_request_create) : Créer et consulter ses propres demandes de congé.
- Valider les congés (leave_review) : Approuver/refuser les demandes de congé de l'effectif.
- Voir les certifications (certifications_view) : Consulter les certifications internes.
- Gérer les certifications (certifications_manage) : Attribuer des certifications.
- Voir les dossiers RH (records_view) : Consulter distinctions, sanctions et dossiers RH.
- Gérer les dossiers RH (records_manage) : Ajouter distinctions, sanctions et entrées RH.
- Valider les candidatures divisions (division_review) : Approuver/refuser les demandes de division.
- Voir les promotions (promotions_view) : Consulter l'historique et les propositions de promotion.
- Gérer les promotions (promotions_manage) : Créer/valider une promotion.

[FTO & suivi des recrues] — Outils pédagogiques, affectations et validation du parcours FTO.
- Accès FTO / Mes recrues (fto_tools) : Accéder aux outils FTO et au suivi des recrues assignées.
- Créer des évaluations FTO (fto_evaluations_create) : Évaluer une formation/module pour une recrue.
- Voir les affectations FTO (fto_assignments_view) : Consulter toutes les affectations FTO.
- Gérer les affectations FTO (Lieutenant+) (fto_assignments_manage) : Créer, affecter en groupe et clôturer les affectations. Sécurité minimale: Lieutenant+.
- Gérer les sessions FTO (fto_sessions_manage) : Créer et clôturer les anciennes sessions FTO. S'utilise avec l'accès FTO / Academy.
- Gérer les objectifs FTO (fto_objectives_manage) : Créer et suivre les objectifs pédagogiques. S'utilise avec l'accès FTO / Academy.
- Gérer les passations FTO (fto_handoffs_manage) : Ajouter les notes de passation entre FTO. S'utilise avec l'accès FTO / Academy.
- Gérer le parcours Academy (academy_manage) : Accès aux outils avancés Academy / dossiers FTO.
- Modifier le contenu Academy (academy_content_manage) : Modifier modules, scénarios et contenu pédagogique.
- Valider la fin de parcours FTO (academy_final_review) : Approuver/refuser la validation finale FTO.

[Formations & calendrier] — Accès au Centre Formation, inscriptions, création, invitations et présences.
- Accéder au Centre Formation (training_access) : Voir le planning, les modules et les formations accessibles.
- S'inscrire / se désinscrire (training_self_register) : S'inscrire soi-même à une formation ouverte ou annuler son inscription.
- Créer / gérer les formations (training_manage) : Créer et administrer les événements de formation.
- Inviter des participants (training_invites_manage) : Envoyer des invitations individuelles/groupées aux formations.
- Gérer les présences (training_attendance_manage) : Marquer les présences et statuts des participants.

[Communication, rapports & validations] — Messagerie, rapports d'incident, validations, corrections et annonces.
- Utiliser la messagerie interne (messages_access) : Lire, envoyer, répondre et transférer des messages LSPD.
- Créer ses rapports d'incident (incident_create) : Rédiger et soumettre un nouveau rapport d'incident.
- Voir tous les rapports (incident_view_all) : Voir les rapports de tous les membres, pas seulement les siens.
- Approuver / refuser les rapports (incident_review) : Traiter la file des validations de rapports.
- Exporter les rapports (incident_export) : Exporter les rapports d'incident en CSV.
- Demander une correction / addendum (corrections_create) : Créer une demande de correction sur un rapport ou une évaluation accessible.
- Valider corrections & addenda (corrections_review) : Approuver/refuser les demandes de correction et créer les addenda.
- Publier des annonces (announcements_manage) : Créer et gérer les annonces LSPD.

[Opérations, MDT & CAD] — Dossiers MDT, service, CAD, BOLO et Watch Commander.
- Accéder au MDT opérationnel (mdt_manage) : Accéder à l'onglet Dossiers MDT et à ses recherches.
- Créer un dossier MDT (mdt_case_create) : Créer un nouveau dossier d'enquête MDT.
- Clôturer un dossier MDT (mdt_case_close) : Clôturer les dossiers d'enquête.
- Voir tous les shifts (shifts_view) : Consulter les shifts de tous les officiers.
- Gérer les shifts (shifts_manage) : Créer, modifier ou annuler les shifts.
- Voir le tableau de service (duty_board) : Accéder au Duty Board.
- Accéder au CAD (cad_access) : Voir le CAD et gérer sa propre unité opérationnelle.
- Gérer toutes les unités CAD (cad_manage) : Modifier les unités CAD autres que sa propre unité.
- Voir les BOLO (bolo_view) : Consulter les BOLO actifs et leur historique.
- Gérer les BOLO (bolo_manage) : Créer, modifier et clôturer les BOLO.
- Voir Watch Commander (watch_view) : Consulter le Watch Commander actif et l'historique.
- Gérer Watch Commander (watch_manage) : Créer et administrer les sessions Watch Commander.

[Commandement & contrôle] — Outils de pilotage, statistiques et audit.
- Statistiques & Promotion Advisor (analytics) : Accéder aux statistiques et outils d'aide à la promotion.
- Voir l'historique audit (audit) : Consulter les actions enregistrées dans l'audit.

VÉRIFICATIONS AUTOMATIQUES EFFECTUÉES
- app.js : node --check OK.
- 331/331 fonctions nommées de la Phase 17.11.5 conservées.
- 349 fonctions nommées au total.
- 63 permissions cataloguées ; toutes les permissions utilisées dans Firestore appartiennent au catalogue.
- 1 seul script module dans index.html.
- Références locales index.html vérifiées : aucune ressource manquante.
- Accolades style.css et firestore.rules équilibrées.

IMPORTANT
Le fichier firestore.rules présent sur GitHub ne publie PAS les règles Firebase automatiquement.
Il faut impérativement les coller et les publier dans Firebase Console.

Firebase Admin / serviceAccountKey.json ne doit jamais être placé dans ce site public.

=== PHASE 17.11.7 — CORRECTIF INCORPORATION RECRUTEMENT ===
- Finalisation d'admission convertie en écriture atomique Firestore (batch).
- Profil candidat + candidature + review interne + audit sont validés ensemble ou annulés ensemble.
- Règles d'incorporation compatibles avec les profils candidats hérités (Applicant / Candidat / Recruitment) tout en limitant strictement les champs modifiables.
- Chief of Police explicitement accepté sur chaque écriture d'incorporation.
- Message permission-denied plus clair et sans état partiellement modifié.
IMPORTANT : publier firestore.rules dans Firebase Console > Firestore Database > Règles.
