// LSPD Command Center — Phase 17.11.6 PERMISSION AUDIT + FTO ASSIGNMENTS + REPORT VIEWER — based on Phase 17.11.6

import { initializeApp, getApps, getApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, deleteUser as deleteAuthUser } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, onSnapshot,
  collection, query, where, serverTimestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBuYoRqUmCfGZwb8P106k9vJZhkZkPtjxk",
  authDomain: "lspd-command-center.firebaseapp.com",
  projectId: "lspd-command-center",
  storageBucket: "lspd-command-center.firebasestorage.app",
  messagingSenderId: "834995310565",
  appId: "1:834995310565:web:114873d54be7987cb9290c",
  measurementId: "G-FT5133P8GN"
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

window.LSPD = { auth, db, storage, user:null, profile:null, permissionConfig:null, navigationConfig:null, pageCleanup:null, currentPage:"dashboard", academyOverrides:{}, customAcademyScenarios:[] };

const $ = id => document.getElementById(id);
const esc = v => String(v ?? "")
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  .replaceAll('"',"&quot;").replaceAll("'","&#039;");

// Phase 11 bilingual display layer.
// Firestore values remain canonical/original; only visible labels are translated.
const I18N_EN = {"Command Center":"Command Center","Training & Operations":"Training & Operations","Training • Personnel • Operations • Communication":"Training • Personnel • Operations • Communication","Connexion":"Login","Créer un compte":"Create account","Adresse e-mail":"Email address","Mot de passe":"Password","Se connecter":"Log in","Nom RP":"RP name","Confirmer le mot de passe":"Confirm password","Créer ma demande d'inscription":"Submit my registration request","Le compte Firebase est créé automatiquement. L'accès LSPD reste bloqué jusqu'à validation par le Chief.":"The Firebase account is created automatically. LSPD access remains locked until approval by the Chief.","Inscription en attente":"Registration pending","Votre demande doit être validée par le commandement LSPD.":"Your request must be approved by LSPD Command.","Se déconnecter":"Log out","Déconnecté":"Logged out","Connecté":"Connected","Compte LSPD":"LSPD account","Dashboard":"Dashboard","Mon profil":"My profile","Inscriptions":"Registrations","Notifications":"Notifications","Annonces":"Announcements","Messages":"Messages","Rapports d'incident":"Incident reports","Validations":"Approvals","Corrections & addenda":"Corrections & addenda","Manuel FTO":"FTO Manual","Formations":"Training","Évaluations":"Evaluations","Mes recrues":"My trainees","Officiers":"Officers","Affectations FTO":"FTO assignments","Certifications":"Certifications","Dossiers & distinctions":"Personnel records & distinctions","Roster & shifts":"Roster & shifts","Congés":"Leave","Calendrier formations":"Training calendar","À valider":"To validate","Promotion advisor":"Promotion advisor","Promotions":"Promotions","Statistiques":"Statistics","Grades & responsabilités":"Ranks & responsibilities","Scénarios":"Scenarios","Admin":"Admin","Historique":"History","Recherche globale...":"Global search...","Profil incomplet":"Incomplete profile","Ton compte Authentication existe, mais aucun profil LSPD valide n'est associé. Contacte le Chief of Police.":"Your Authentication account exists, but no valid LSPD profile is linked to it. Contact the Chief of Police.","Erreur profil":"Profile error","Erreur de profil":"Profile error","Impossible de charger ton profil LSPD. Réessaie ou contacte le commandement.":"Unable to load your LSPD profile. Try again or contact Command.","Ta demande a bien été enregistrée. Le Chief of Police doit maintenant valider ton matricule, ton grade, ton rôle et ta division.":"Your request has been recorded. The Chief of Police must now approve your badge number, rank, role, and division.","Inscription refusée":"Registration rejected","Ta demande d'inscription n'a pas été validée. Contacte le commandement LSPD si tu penses qu'il s'agit d'une erreur.":"Your registration request was not approved. Contact LSPD Command if you believe this is an error.","Compte archivé":"Archived account","Ton profil LSPD est archivé et l'accès au Command Center est désactivé.":"Your LSPD profile is archived and access to the Command Center is disabled.","Utilisateur":"User","Statut :":"Status:","Entre un nom RP valide.":"Enter a valid RP name.","Les mots de passe ne correspondent pas.":"Passwords do not match.","Inscription enregistrée":"Registration submitted","Ton compte a été créé automatiquement. Tu n'as rien d'autre à faire : attends simplement la validation du Chief of Police.":"Your account was created automatically. You do not need to do anything else; simply wait for approval by the Chief of Police.","Cette adresse e-mail possède déjà un compte.":"This email address already has an account.","Le mot de passe doit contenir au moins 6 caractères.":"The password must contain at least 6 characters.","Adresse e-mail invalide.":"Invalid email address.","Demandes d'inscription":"Registration requests","Les candidats créent eux-mêmes leur compte Firebase Authentication. Ici, tu valides uniquement leur accès LSPD : matricule, grade, rôle et division.":"Applicants create their own Firebase Authentication account. Here, you only approve their LSPD access: badge number, rank, role, and division.","Date":"Date","Email":"Email","Statut":"Status","Profil proposé":"Proposed profile","Action":"Action","Réexaminer":"Review again","Approuver":"Approve","Refuser":"Reject","Aucune demande en attente.":"No pending requests.","Valider l'inscription":"Approve registration","UID géré automatiquement par Firebase":"UID managed automatically by Firebase","Matricule":"Badge number","Grade":"Rank","Rôle":"Role","Division":"Division","Annuler":"Cancel","Le matricule est obligatoire.":"Badge number is required.","Inscription LSPD approuvée":"LSPD registration approved","Tout marquer comme lu":"Mark all as read","Aucune notification.":"No notifications.","Marquer comme lu":"Mark as read","Par":"By","Système":"System","Info":"Info","Validation":"Approval","Command overview":"Command overview","Effectif actif":"Active personnel","Congés en attente":"Pending leave","Shifts aujourd'hui":"Today's shifts","Évaluations totales":"Total evaluations","Identité":"Identity","Progression":"Progress","Progression personnelle":"Personal progress","Dossier":"Record","Accès FTO/Command actif":"FTO/Command access active","Accès Officer":"Officer access","Unité":"Unit","Sécurité du compte":"Account security","Tu peux recevoir un e-mail Firebase pour réinitialiser ton mot de passe.":"You can receive a Firebase email to reset your password.","Envoyer l'e-mail de réinitialisation":"Send password reset email","E-mail de réinitialisation envoyé.":"Password reset email sent.","+ Nouvelle annonce":"+ New announcement","Aucune annonce.":"No announcements.","Nouvelle annonce":"New announcement","Titre":"Title","Priorité":"Priority","Message":"Message","Publier":"Publish","Normal":"Normal","Important":"Important","Urgent":"Urgent","+ Nouveau message":"+ New message","De":"From","À":"To","Sujet":"Subject","Aucun message.":"No messages.","Nouveau message":"New message","Destinataire":"Recipient","Envoyer":"Send","+ Nouveau rapport":"+ New report","Exporter CSV":"Export CSV","Auteur":"Author","Type":"Type","Pièces":"Attachments","Aucun rapport.":"No reports.","Nouveau rapport d'incident":"New incident report","Résumé":"Summary","Détails":"Details","Pièces jointes (optionnel : images/PDF, max 10 Mo par fichier)":"Attachments (optional: images/PDF, max 10 MB per file)","Soumettre pour validation":"Submit for approval","Aucune validation en attente.":"No approvals pending.","Use of Force":"Use of Force","Vehicle Pursuit":"Vehicle Pursuit","Arrestation sensible":"Sensitive arrest","Accident service":"On-duty accident","Plainte citoyen":"Citizen complaint","Incident interne":"Internal incident","Autre":"Other","Approuvé":"Approved","Refusé":"Rejected","+ Demander une correction":"+ Request a correction","Les documents d'origine restent intacts. Une correction approuvée crée un":"Original documents remain unchanged. An approved correction creates a","addendum":"addendum","traçable.":"with a full audit trail.","Demandeur":"Requester","Cible":"Target","Motif":"Reason","Révision":"Review","Demande de correction / addendum":"Correction / addendum request","Document concerné":"Affected document","Pourquoi une correction est nécessaire ?":"Why is a correction needed?","Texte proposé pour l'addendum":"Proposed addendum text","Correction précise, sans effacer l'original...":"Precise correction without deleting the original...","Envoyer la demande":"Submit request","Aucun document disponible pour une demande de correction.":"No document is available for a correction request.","Manuel FTO LSPD":"LSPD FTO Manual","Briefing → démonstration → pratique → observation → feedback → validation → traçabilité.":"Briefing → demonstration → practice → observation → feedback → validation → audit trail.","Sécurité avant performance":"Safety before performance","Expliquer le pourquoi":"Explain the why","Erreur critique = correction immédiate":"Critical error = immediate correction","Feedback factuel":"Factual feedback","Validation traçable":"Traceable validation","Même standard pour tous":"Same standard for everyone","Débutant":"Beginner","Intermédiaire":"Intermediate","Avancé":"Advanced","Commandement":"Command","À faire":"To do","Validé":"Validated","À revoir":"Needs review","Échec":"Failed","Déroulé FTO":"FTO process","Briefing et objectifs":"Briefing and objectives","Démonstration FTO":"FTO demonstration","Mise en pratique":"Practical exercise","Questions/correction":"Questions/correction","Observation en situation":"Field observation","Fermer":"Close","Fondamentaux LSPD":"LSPD Fundamentals","Structure, chaîne de commandement, radio et code de conduite":"Structure, chain of command, radio, and code of conduct","Radio & communications":"Radio & Communications","Codes radio, transmissions, priorités et dispatch":"Radio codes, transmissions, priorities, and dispatch","Patrouille":"Patrol","Positionnement, observation, contrôles et contacts citoyens":"Positioning, observation, stops, and citizen contacts","Code de la route":"Traffic Code","Contrôles routiers, infractions et conduite professionnelle":"Traffic stops, violations, and professional driving","Contrôle d'identité":"Identity Check","Procédure de contact, vérifications et sécurité":"Contact procedure, checks, and safety","Arrestation":"Arrest","Menottage, fouille, droits, transport et remise en garde":"Handcuffing, search, rights, transport, and custody handoff","Usage de la force":"Use of Force","Proportionnalité, désescalade et justification":"Proportionality, de-escalation, and justification","Poursuites":"Pursuits","Poursuite véhicule/pied, coordination et sécurité":"Vehicle/foot pursuit, coordination, and safety","Scènes de crime":"Crime Scenes","Sécurisation, témoins, preuves et préservation":"Scene security, witnesses, evidence, and preservation","Rapports":"Reports","Rédaction factuelle, chronologie, preuves et transmission":"Factual writing, chronology, evidence, and submission","Interventions à risque":"High-Risk Incidents","Renfort, périmètre, négociation et coordination":"Backup, perimeter, negotiation, and coordination","Gestion de scène":"Scene Management","Commandement tactique, briefing et ressources":"Tactical command, briefing, and resources","FTO & pédagogie":"FTO & Training Methods","Démonstration, observation, feedback et validation":"Demonstration, observation, feedback, and validation","Supervision":"Supervision","Contrôle qualité, discipline, coaching et décisions":"Quality control, discipline, coaching, and decisions","Gestion opérationnelle, effectifs et crises":"Operational management, staffing, and crises","Leadership":"Leadership","Culture LSPD, éthique, développement et succession":"LSPD culture, ethics, development, and succession","+ Nouvelle évaluation":"+ New evaluation","Officier":"Officer","FTO":"FTO","Module":"Module","Score":"Score","Résultat":"Result","Aucune évaluation.":"No evaluations.","Nouvelle évaluation FTO":"New FTO evaluation","Officier évalué":"Officer evaluated","Critères":"Criteria","Procédure":"Procedure","Respect des étapes et SOP":"Compliance with steps and SOPs","Sécurité":"Safety","Sécurité personnelle, partenaires et public":"Personal, partner, and public safety","Communication radio":"Radio communication","Clarté, concision et pertinence":"Clarity, concision, and relevance","Jugement":"Judgment","Décision adaptée à la situation":"Decision appropriate to the situation","Professionnalisme":"Professionalism","Comportement et attitude":"Behavior and attitude","Compte rendu":"Report","Qualité du rapport et traçabilité":"Report quality and traceability","Commentaires FTO":"FTO comments","Score :":"Score:","1 — Insuffisant":"1 — Unsatisfactory","2 — À améliorer":"2 — Needs improvement","3 — Conforme":"3 — Meets standard","4 — Très bien":"4 — Very good","5 — Excellent":"5 — Excellent","Enregistrer":"Save","Fiche d'évaluation FTO":"FTO Evaluation Form","Commentaires":"Comments","Aucun commentaire.":"No comments.","Imprimer / PDF":"Print / PDF","Voir / Imprimer":"View / Print","Aucune recrue assignée.":"No trainee assigned.","Ouvrir le dossier":"Open record","Rechercher...":"Search...","Tous statuts":"All statuses","Toutes unités":"All units","+ Ajouter un profil":"+ Add profile","Nom":"Name","Aucun officier.":"No officers.","Modifier":"Edit","Dossier officier":"Officer record","Distinctions / sanctions":"Commendations / sanctions","Dernières évaluations":"Latest evaluations","Ajouter un profil":"Add profile","UID Firebase Authentication":"Firebase Authentication UID","Unité / Division":"Unit / Division","Actif":"Active","En formation":"In training","Suspendu":"Suspended","Inactif":"Inactive","Archivé":"Archived","En attente":"Pending","Officer":"Officer","Sergeant":"Sergeant","Lieutenant":"Lieutenant","Captain":"Captain","Deputy Chief":"Deputy Chief","Assistant Chief":"Assistant Chief","Chief":"Chief","Sergent":"Sergeant","Chief of Police":"Chief of Police","Patrol":"Patrol","Traffic":"Traffic","Detective":"Detective","SWAT":"SWAT","Air Support":"Air Support","Training":"Training","Command":"Command","Police Officer I":"Police Officer I","Police Officer II":"Police Officer II","Police Officer III":"Police Officer III","Applique les procédures sous supervision.":"Applies procedures under supervision.","Officier autonome sur les missions courantes.":"Independent officer on routine duties.","Officier expérimenté, senior et mentor.":"Experienced senior officer and mentor.","Premier niveau de supervision.":"First level of supervision.","Supervise plusieurs équipes et opérations.":"Supervises multiple teams and operations.","Responsable d'une division ou unité.":"Responsible for a division or unit.","Supervise plusieurs divisions.":"Supervises multiple divisions.","Direction stratégique du département.":"Strategic leadership of the department.","Autorité finale du département.":"Final authority of the department.","+ Nouvelle affectation":"+ New assignment","Recrue":"Trainee","Commentaire":"Comment","Aucune affectation.":"No assignments.","Clôturer":"Close assignment","Nouvelle affectation FTO":"New FTO assignment","Affecter":"Assign","+ Ajouter une certification":"+ Add certification","Certification":"Certification","Attribuée par":"Issued by","Aucune certification.":"No certifications.","Ajouter une certification":"Add certification","Attribuer":"Issue","Pursuit":"Pursuit","Supervisor":"Supervisor","+ Nouvelle entrée":"+ New entry","Émis par":"Issued by","Aucune entrée.":"No entries.","Nouvelle entrée au dossier":"New personnel record entry","Commendation":"Commendation","Sanction":"Sanction","+ Ajouter un shift":"+ Add shift","Début":"Start","Fin":"End","Aucun shift.":"No shifts.","Ajouter un shift":"Add shift","Planifié":"Scheduled","+ Demander un congé":"+ Request leave","Du":"From","Au":"To","Aucune demande.":"No requests.","Demande de congé":"Leave request","+ Planifier une formation":"+ Schedule training","Aucune formation planifiée.":"No training scheduled.","Planifier une formation":"Schedule training","Heure":"Time","Lieu":"Location","Notes":"Notes","Planifier":"Schedule","Formateur:":"Trainer:","Modules restants":"Remaining modules","Indicateur d'aide à la décision. Il ne remplace pas le jugement du commandement.":"Decision-support indicator. It does not replace Command judgment.","Moyenne FTO":"FTO average","Sanctions":"Sanctions","Indice":"Index","Lecture":"Assessment","Fort candidat":"Strong candidate","À considérer":"Consider","Pas encore":"Not yet","+ Enregistrer une promotion":"+ Record promotion","Ancien grade":"Previous rank","Nouveau grade":"New rank","Validé par":"Approved by","Aucune promotion.":"No promotions.","Enregistrer une promotion":"Record promotion","Effectif":"Personnel","Affectations actives":"Active assignments","Score moyen":"Average score","Effectif par grade":"Personnel by rank","Operations & RH":"Operations & HR","Commendations":"Commendations","Shifts enregistrés":"Recorded shifts","Par unité":"By unit","officiers":"officers","Contrôle routier":"Traffic Stop","Contrôle d'un véhicule suspect":"Stop of a suspicious vehicle","Sécurité, radio, approche, identification, décision, rapport":"Safety, radio, approach, identification, decision, report","Suspect coopératif":"Cooperative suspect","Contrôle, menottage, fouille, droits, transport":"Control, handcuffing, search, rights, transport","Poursuite véhicule":"Vehicle Pursuit","Fuite après refus d'obtempérer":"Flight after failure to stop","Radio, sécurité, coordination, décision":"Radio, safety, coordination, decision","Poursuite à pied":"Foot Pursuit","Suspect prend la fuite":"Suspect flees","Communication, trajectoire, renfort, arrestation":"Communication, route, backup, arrest","Intervention à risque":"High-Risk Incident","Appel avec menace":"Call involving a threat","Périmètre, briefing, désescalade, commandement":"Perimeter, briefing, de-escalation, command","Scène de crime":"Crime Scene","Vol avec plusieurs témoins":"Theft with multiple witnesses","Sécurisation, témoins, preuves, chronologie":"Scene security, witnesses, evidence, chronology","Incident multi-unités":"Multi-unit incident","Commandement, rôles, briefing, compte rendu":"Command, roles, briefing, report","Évaluation FTO":"FTO Evaluation","Patrouille complète":"Full patrol","Évaluation globale en conditions réalistes":"Overall evaluation under realistic conditions","Lancer":"Start","Points à observer":"Observation points","Terminer":"Finish","Gestion système":"System management","Profils":"Profiles","Authentication":"Authentication","Rôles & unités":"Roles & units","Onglet Officiers":"Officers tab","Archivage":"Archiving","Pour retirer un officier des listes actives sans supprimer son historique, passe son statut à":"To remove an officer from active lists without deleting their history, set their status to","Aucun historique.":"No history.","Recherche globale":"Global search","Aucun résultat.":"No results.","Erreur :":"Error:","Aucune donnée à exporter.":"No data to export."};
const I18N_FR = {"Command Center":"Centre de commandement","Training & Operations":"Formation & opérations","Training • Personnel • Operations • Communication":"Formation • Personnel • Opérations • Communication","Dashboard":"Tableau de bord","Roster & shifts":"Planning & services","Promotion advisor":"Conseiller promotions","Admin":"Administration","Email":"E-mail","Authentication":"Authentification","Operations & RH":"Opérations & RH","Officer":"Officier","Sergeant":"Sergent","Captain":"Capitaine","Deputy Chief":"Chef adjoint","Assistant Chief":"Chef assistant","Chief":"Chef","Chief of Police":"Chef de la police","Police Officer I":"Officier de police I","Police Officer II":"Officier de police II","Police Officer III":"Officier de police III","Patrol":"Patrouille","Traffic":"Circulation","Detective":"Enquêtes","Air Support":"Support aérien","Training":"Formation","Command":"Commandement","Pursuit":"Poursuite","Supervisor":"Superviseur","Use of Force":"Usage de la force","Vehicle Pursuit":"Poursuite véhicule"};

Object.assign(I18N_EN,{"Mon espace opérationnel":"My operational space","Tableau de service":"Duty board","Inscriptions formations":"Training enrollment","MDT / Dossiers":"MDT / Case files","Divisions & candidatures":"Divisions & applications","Mes prochains shifts":"My upcoming shifts","Mes formations":"My training sessions","Mes certifications":"My certifications","Mon dossier RH":"My personnel record","Mes congés":"My leave","Aucun shift à venir.":"No upcoming shifts.","Aucune formation inscrite.":"No training registration.","Aucun élément au dossier.":"No personnel record entries.","Pointer l'entrée":"Check in","Pointer la sortie":"Check out","En service":"On duty","Terminé":"Completed","Annulé":"Cancelled","Absent / non pointé":"Absent / no check-in","À venir":"Upcoming","Aujourd'hui":"Today","Service en cours":"Currently on duty","Absences / non pointés":"Absences / no-shows","En congé":"On leave","En formation aujourd'hui":"In training today","Modifier shift":"Edit shift","Annuler shift":"Cancel shift","Modifier le shift":"Edit shift","Nouveau début":"New start","Nouvelle fin":"New end","Enregistrer les modifications":"Save changes","Capacité":"Capacity","Places":"Spots","S'inscrire":"Register","Annuler mon inscription":"Cancel my registration","Gérer les présences":"Manage attendance","Inscrit":"Registered","Présent":"Present","Absent":"Absent","Inscription annulée":"Registration cancelled","Complet":"Full","Participants":"Participants","Marquer présent":"Mark present","Marquer absent":"Mark absent","Aucun participant.":"No participants.","Rappel de shift":"Shift reminder","Rappel de formation":"Training reminder","Ton shift commence bientôt.":"Your shift starts soon.","Ta formation commence bientôt.":"Your training starts soon.","Dossiers d'enquête":"Case files","+ Nouveau dossier":"+ New case file","Numéro":"Number","Catégorie":"Category","Ouvert":"Open","Clos":"Closed","Enquête":"Investigation","Intervention":"Incident","Renseignement":"Intelligence","Administration":"Administration","Nouveau dossier MDT":"New MDT case file","Créer le dossier":"Create case file","Clôturer le dossier":"Close case file","Aucun dossier MDT.":"No MDT case files.","Rapports accessibles":"Accessible incident reports","Mesure":"Measure","Effectif actuel":"Current personnel","Ma division actuelle":"My current division","Candidater":"Apply","Candidature division":"Division application","Division souhaitée":"Requested division","Motivation":"Motivation","Envoyer ma candidature":"Submit application","Mes candidatures":"My applications","Candidatures en attente":"Pending applications","Aucune candidature.":"No applications.","Candidature approuvée":"Application approved","Candidature refusée":"Application rejected","Approuver la candidature":"Approve application","Refuser la candidature":"Reject application","Ta division a été mise à jour.":"Your division has been updated.","Patrouille générale et réponse aux appels.":"General patrol and response to calls.","Circulation, contrôles routiers et poursuites.":"Traffic enforcement, traffic stops, and pursuits.","Enquêtes, preuves et dossiers criminels.":"Investigations, evidence, and criminal cases.","Interventions tactiques à haut risque.":"High-risk tactical operations.","Support aérien et coordination aérienne.":"Air support and aerial coordination.","Formation, FTO et développement des officiers.":"Training, FTO, and officer development.","Commandement et supervision du département.":"Department command and supervision.","La capacité doit être comprise entre 1 et 100.":"Capacity must be between 1 and 100.","Tu es déjà inscrit à cette formation.":"You are already registered for this training.","Formation complète.":"Training session is full.","Ton inscription est enregistrée.":"Your registration is confirmed.","Présence mise à jour.":"Attendance updated.","Shift annulé.":"Shift cancelled."});
Object.assign(I18N_FR,{"Roster & shifts":"Planning & services","Duty board":"Tableau de service","My operational space":"Mon espace opérationnel","Training enrollment":"Inscriptions formations","MDT / Case files":"MDT / Dossiers","Divisions & applications":"Divisions & candidatures"});

Object.assign(I18N_EN,{"BOLO / Avis":"BOLO / Alerts","CAD / Dispatch":"CAD / Dispatch","Watch Commander":"Watch Commander","Permissions":"Permissions","Réduire le menu":"Collapse menu","Navigation rapide":"Quick navigation","Accès refusé":"Access denied","Cette fonction n'est pas autorisée pour ton grade / tes permissions.":"This feature is not allowed for your role.","Permissions par grade":"Permissions & roles","Les permissions sont enregistrées dans Firestore. Le Chief peut les modifier ici sans changer le code.":"Permissions are stored in Firestore. The Chief can edit them here without changing code.","Enregistrer les permissions":"Save permissions","Réinitialiser les valeurs par défaut":"Reset defaults","Permission":"Permission","Lecture / gestion FTO":"FTO tools","Voir tous les officiers":"View all officers","Modifier les profils officiers":"Manage officer profiles","Voir les affectations FTO":"View FTO assignments","Gérer les affectations FTO":"Manage FTO assignments","Voir les certifications":"View certifications","Gérer les certifications":"Manage certifications","Voir les dossiers RH":"View personnel records","Gérer les dossiers RH":"Manage personnel records","Voir tous les shifts":"View all shifts","Gérer les shifts":"Manage shifts","Voir le tableau de service":"View duty board","Valider les congés":"Review leave","Gérer les formations":"Manage training","Valider les incidents":"Review incidents","Gérer le MDT":"Manage MDT","Valider les candidatures divisions":"Review division applications","Voir les promotions":"View promotions","Gérer les promotions":"Manage promotions","Statistiques & Promotion Advisor":"Statistics & Promotion Advisor","Voir l'historique audit":"View audit history","Publier des annonces":"Publish announcements","Valider les inscriptions":"Review registrations","Gérer toutes les unités CAD":"Manage all CAD units","Gérer les BOLO":"Manage BOLOs","Gérer Watch Commander":"Manage Watch Commander","Permissions enregistrées.":"Permissions saved.","Valeurs par défaut restaurées.":"Default values restored.","Le Chief conserve toujours tous les droits.":"The Chief always keeps all permissions.","Unité CAD":"CAD unit","Mon unité":"My unit","Toutes les unités":"All units","Indicatif":"Call sign","Partenaire":"Partner","Localisation":"Location","État":"Status","Note opérationnelle":"Operational note","Disponible":"Available","En intervention":"On call","Transport":"Transport","Pause":"Break","Hors service":"Off duty","Créer mon unité":"Create my unit","Mettre à jour":"Update","Actualisé":"Updated","Aucune unité active.":"No active units.","BOLO actifs":"Active BOLOs","+ Nouveau BOLO":"+ New BOLO","Personne":"Person","Véhicule":"Vehicle","Plaque":"Plate","Description":"Description","Actif":"Active","Clôturé":"Closed","Clôturer le BOLO":"Close BOLO","Aucun BOLO actif.":"No active BOLO.","Nouveau BOLO":"New BOLO","Publier le BOLO":"Publish BOLO","Priorité":"Priority","Critique":"Critical","Watch en cours":"Current watch","Aucun Watch Commander actif.":"No active Watch Commander.","Démarrer un watch":"Start a watch","Commander":"Commander","Briefing":"Briefing","Démarrer le service":"Start watch","Clôturer le watch":"Close watch","Note de passation":"Pass-down note","Historique des watches":"Watch history","Service actif":"Active watch","Service clôturé":"Closed watch","Tape une page...":"Type a page...","Aucune page trouvée.":"No page found.","Interface améliorée":"Improved interface","En direct":"Live"});
Object.assign(I18N_FR,{"Command Center":"Centre de commandement","Training & Operations":"Formation & opérations"});

Object.assign(I18N_EN,{"Journal FTO":"FTO Journal","Évaluation finale FTO":"Final FTO Evaluation","Programme guidé":"Guided program","Bibliothèque pédagogique":"Training library","Recommandations FTO":"FTO recommendations","Session guidée":"Guided session","Objectifs de la recrue":"Trainee objectives","Commencer une session":"Start session","Continuer":"Continue","Terminer la session":"Finish session","Ajouter un objectif":"Add objective","Objectif":"Objective","Faible":"Low","Moyenne":"Medium","Haute":"High","Atteint":"Achieved","Objectif pédagogique":"Training objective","Ce que le FTO doit faire":"What the FTO should do","Exemple RP":"RP example","Variantes":"Variants","Erreurs fréquentes":"Common mistakes","Erreurs critiques":"Critical errors","Questions à poser":"Questions to ask","Réponses attendues":"Expected answers","Action corrective":"Corrective action","Durée conseillée":"Suggested duration","Prérequis":"Prerequisites","Checklist live":"Live checklist","Démonstration":"Demonstration","Pratique":"Practice","Observation":"Observation","Débrief":"Debrief","Validation":"Validation","Générer un scénario":"Generate scenario","Nouveau scénario":"New scenario","Difficulté":"Difficulty","Facile":"Easy","Difficile":"Hard","Stress test":"Stress test","Situation":"Situation","Contraintes":"Constraints","Réussite attendue":"Expected success criteria","Voir le guide":"View guide","Créer une session":"Create session","Phase FTO":"FTO phase","Phase 1 — Observation":"Phase 1 — Observation","Phase 2 — Assistance":"Phase 2 — Assistance","Phase 3 — Autonomie supervisée":"Phase 3 — Supervised autonomy","Phase 4 — Évaluation finale":"Phase 4 — Final evaluation","Points forts":"Strengths","Points à améliorer":"Areas to improve","Objectifs prochaine session":"Next-session goals","Résumé de session":"Session summary","Aucune session.":"No sessions.","Aucun objectif.":"No objectives.","Module faible":"Weak module","Prochaine priorité":"Next priority","Sessions terminées":"Completed sessions","Prochaine formation conseillée":"Recommended next training","Évaluation finale":"Final evaluation","Recommandation finale":"Final recommendation","Validation FTO":"FTO pass","Prolongation FTO":"Extend FTO","Échec FTO":"FTO fail","Créer l'évaluation finale":"Create final evaluation","Décision":"Decision","Commentaire final":"Final comments","Modules validés":"Validated modules","Moyenne globale":"Overall average","Historique pédagogique":"Training history","Exemples radio":"Radio examples","Exemples de rapports":"Report examples","Bon exemple":"Good example","Mauvais exemple":"Bad example","Pourquoi":"Why","Session créée.":"Session created.","Journal enregistré.":"Journal saved.","Objectif ajouté.":"Objective added.","Évaluation finale enregistrée.":"Final evaluation saved.","Sélectionner une recrue":"Select a trainee","FTO Academy":"FTO Academy"});

Object.assign(I18N_EN,{
  "Développé par":"Developed by"
});

Object.assign(I18N_EN,{"Choisir la formation":"Choose training module","Scénario de formation":"Training scenario","Scénario du module":"Module scenario","Générer un scénario pour ce module":"Generate a scenario for this module","Formation sélectionnée":"Selected training","Le générateur reste limité à la formation sélectionnée.":"The generator stays limited to the selected training module.","Variante pédagogique":"Training variant"});

Object.assign(I18N_EN,{"Visiteur":"Visitor","Portail visiteur":"Visitor Portal","Accès externe limité":"Limited external access","Gestion Academy":"Academy Management","Dossier FTO recrue":"Trainee FTO File","Quiz formations":"Training Quizzes","Feedback formation":"Training Feedback","Gestion contenu Academy":"Academy Content Management","Modifier le module":"Edit module","Nouveau scénario personnalisé":"New custom scenario","Scénarios personnalisés":"Custom scenarios","Archiver":"Archive","Personnalisé":"Customized","Contenu d’origine":"Original content","Enregistrer le contenu":"Save content","Accès public":"Public access","Interne":"Internal","Public":"Public","Visibilité":"Visibility","Réservé au département":"Department only","Accessible aux visiteurs":"Visible to visitors","Parcours de formation":"Training pathway","Prérequis non validés":"Prerequisites not validated","Quiz réussi":"Quiz passed","Quiz à refaire":"Quiz to retry","Commencer le quiz":"Start quiz","Soumettre le quiz":"Submit quiz","Dossier pédagogique":"Training file","Plan de rattrapage":"Remedial plan","Passation FTO":"FTO handoff","Ajouter une note de passation":"Add handoff note","Imprimer le rapport final":"Print final report","Feedback de la recrue":"Trainee feedback","Compréhension":"Understanding","Difficulté rencontrée":"Difficulty encountered","Question au FTO":"Question for FTO","Envoyer le feedback":"Send feedback","Validation commandement":"Command approval","En attente Commandement":"Pending Command approval","Validée":"Approved","Refusée":"Rejected","Valider définitivement":"Final approval","Refuser la validation":"Reject approval","academy_content_manage":"academy_content_manage","academy_final_review":"academy_final_review","Gérer le contenu FTO Academy":"Manage FTO Academy content","Valider les fins de parcours FTO":"Approve final FTO reviews","Accès visiteur sécurisé":"Secure visitor access","Informations publiques du département":"Public department information","Aucune donnée opérationnelle ou personnelle n’est accessible avec ce compte.":"No operational or personal data is accessible with this account.","Annonces publiques":"Public announcements","Structure du département":"Department structure","Catalogue de formation":"Training catalog","Compte externe":"External account","Feedback envoyé.":"Feedback sent.","Contenu Academy enregistré.":"Academy content saved.","Scénario enregistré.":"Scenario saved.","Note de passation enregistrée.":"Handoff note saved.","Validation finale mise à jour.":"Final approval updated."});

Object.assign(I18N_EN,{"Stats formation":"Training analytics","Alertes pédagogiques":"Training alerts","Recrues sans évaluation":"Trainees without evaluation","Taux de validation finale":"Final approval rate","Performance FTO":"FTO performance","Performance par module":"Performance by module"});

Object.assign(I18N_EN,{"Accueil & personnel":"Home & personal","Communication & rapports":"Communication & reports","FTO & formation":"FTO & training","Personnel & carrière":"Personnel & career","Opérations & MDT":"Operations & MDT","Commandement & administration":"Command & administration"});

Object.assign(I18N_EN,{"Tout marquer comme lu":"Mark all as read","Marquer comme lu":"Mark as read","Marquer comme non lu":"Mark as unread","Aucune notification.":"No notifications.","Chargement...":"Loading...","Boîte de réception":"Inbox","Envoyés":"Sent","Tous les messages":"All mail","Nouveau message":"New message","Rechercher dans les messages...":"Search mail...","Répondre":"Reply","Transférer":"Forward","Fermer":"Close","Envoyer":"Send","À":"To","De":"From","Sujet":"Subject","Conversation":"Conversation","Message transféré":"Forwarded message","Message d'origine":"Original message","Aucun message.":"No messages.","message non lu":"unread message","messages non lus":"unread messages","Tout est à jour":"You're all caught up","Actualiser":"Refresh","Boîte LSPD":"LSPD Mail"});

Object.assign(I18N_EN,{"Destinataires":"Recipients","Personnes":"People","Grades":"Ranks","Certifications":"Certifications","Rechercher un membre...":"Search a member...","Sélection directe":"Direct selection","Sélection par grade":"Select by rank","Sélection par certification":"Select by certification","Effacer la sélection":"Clear selection","destinataire sélectionné":"recipient selected","destinataires sélectionnés":"recipients selected","Les sélections se cumulent. Les doublons sont supprimés automatiquement.":"Selections are combined. Duplicates are automatically removed.","Aucun destinataire sélectionné.":"No recipient selected.","Envoi groupé":"Group email","Message envoyé à":"Message sent to","messages envoyés":"messages sent","Tous les membres de ce grade":"All members of this rank","Tous les membres certifiés":"All certified members","Réponse directe":"Direct reply","Le destinataire de la réponse est verrouillé sur l'expéditeur du message.":"The reply recipient is locked to the message sender.","Membre":"Member","Certification":"Certification","Sélection":"Selection"});

Object.assign(I18N_EN,{"Centre FTO & Formation":"FTO & Training Center","Mon parcours formation":"My training path","Quiz & connaissances":"Quizzes & knowledge","Calendrier & inscriptions":"Calendar & enrollment","Sessions & objectifs":"Sessions & objectives","Administration formation":"Training administration","Mon FTO":"My FTO","Prochaine étape":"Next step","Parcours pédagogique":"Training journey","Affectation FTO":"FTO assignment","Session pratique":"Practical session","Évaluation module":"Module evaluation","Objectifs & correction":"Objectives & remediation","Validation finale":"Final validation","Espace recrue":"Trainee workspace","Ouvrir l'espace recrue":"Open trainee workspace","Démarrer une session":"Start a session","Nouvelle évaluation":"New evaluation","Ajouter un objectif":"Add objective","Voir le module":"View module","Module recommandé":"Recommended module","Prêt à commencer":"Ready to start","En progression":"In progress","À retravailler":"Needs work","Verrouillé":"Locked","Validé":"Validated","Aucun FTO actif":"No active FTO","Aucune affectation active":"No active assignment","Activité récente":"Recent activity","Outils FTO":"FTO tools","Outils Commandement":"Command tools","Retour au centre":"Back to center","Progression de la recrue":"Trainee progress","Suivi pédagogique":"Training follow-up","Historique récent":"Recent history","Planning formation":"Training schedule","Raccourcis":"Shortcuts","Programme & guide":"Program & guide","Dossier complet":"Full record"});

Object.assign(I18N_EN,{"Centre Formation":"Training Center","Formation & FTO":"Training & FTO","Configuration formation":"Training settings","Vue d'ensemble":"Overview","Mes formations":"My training","Mon parcours":"My path","Mes recrues":"My trainees","Pilotage":"Management","Créer une formation":"Create training","Formation à venir":"Upcoming training","Invitation en attente":"Pending invitation","Invitations en attente":"Pending invitations","Accepter":"Accept","Refuser":"Decline","Invité":"Invited","Invitation refusée":"Invitation declined","Participants":"Participants","Inviter des membres":"Invite members","Gérer la formation":"Manage training","Mes formations créées":"Training I created","Formation créée":"Training created","Étape 1 sur 3":"Step 1 of 3","Étape 2 sur 3":"Step 2 of 3","Étape 3 sur 3":"Step 3 of 3","Informations":"Details","Invitations":"Invitations","Confirmation":"Review","Continuer":"Continue","Retour":"Back","Créer et envoyer les invitations":"Create and send invitations","Qui veux-tu inviter ?":"Who do you want to invite?","Sélection individuelle":"Individual selection","Par grade":"By rank","Par certification":"By certification","Les sélections se cumulent et les doublons sont supprimés.":"Selections are combined and duplicates are removed.","personne invitée":"person invited","personnes invitées":"people invited","Aucune invitation":"No invitations","Formateur":"Trainer","Places réservées":"Reserved seats","Présences":"Attendance","Voir le programme":"View program","Lancer un scénario":"Start scenario","Formation terminée":"Training completed","Réponse enregistrée":"Response saved","Aujourd'hui":"Today","Cette semaine":"This week","À faire":"To do"});

Object.assign(I18N_EN,{"Formation validée":"Training validated","Formation à refaire":"Training to repeat","Non évaluée":"Not evaluated","Formation planifiée":"Training scheduled","Continuer la formation":"Continue training","Planifier cette formation":"Schedule this training","Évaluer cette formation":"Evaluate this training","Résultat de la formation":"Training result","Formations validées":"Validated training","Formations à refaire":"Training to repeat","Formations non évaluées":"Not evaluated","Terminer la formation":"Complete training","Formation terminée, évalue maintenant les participants.":"Training completed. Now evaluate the participants.","À évaluer":"Needs evaluation","Évalué":"Evaluated","Ancien historique FTO":"Legacy FTO history","Aucun prérequis bloquant":"No blocking prerequisite"});

Object.assign(I18N_EN,{"Première connexion":"First login","Choisis ton mot de passe":"Choose your password","Nouveau mot de passe":"New password","Enregistrer mon mot de passe":"Save my password","Compte importé":"Imported account","À activer":"Needs activation","Activé":"Activated","Adresse professionnelle":"Professional email","Mot de passe provisoire":"Temporary password","Comptes importés":"Imported accounts","Jamais activés":"Never activated"});
Object.assign(I18N_EN,{"Tous grades":"All ranks","Tous rôles":"All roles","Toutes unités":"All units","Tous statuts":"All statuses","Voir le code provisoire":"View temporary code","Code provisoire":"Temporary code","Voir les codes provisoires d’activation":"View temporary activation codes","Code provisoire indisponible":"Temporary code unavailable"});

Object.assign(I18N_EN,{"Postuler au LSPD":"Apply to LSPD","Ma candidature LSPD":"My LSPD application","Centre de recrutement":"Recruitment desk","Dossier reçu":"Application received","À convoquer":"Invite to interview","Entretien planifié":"Interview scheduled","Entretien réussi":"Interview passed","Recruté":"Hired","Retirée":"Withdrawn","Pré-sélectionner":"Shortlist","Planifier l’entretien":"Schedule interview","Finaliser le recrutement":"Finalize hiring","Envoyer ma candidature LSPD":"Submit LSPD application","Approuver le rapport":"Approve report","Refuser le rapport":"Reject report","Envoyer":"Send"});

Object.assign(I18N_EN,{"Bureau du recrutement":"Recruitment Bureau","Dossier officiel de candidature":"Official application file","Présentation":"Introduction","Motivation":"Motivation","Mise en situation":"Scenario","Engagement":"Commitment","En étude":"Under review","Pré-sélectionné":"Shortlisted","Entretien évalué":"Interview assessed","Admission approuvée":"Admission approved","Évaluer le dossier":"Review application","Conduire / noter l’entretien":"Conduct / score interview","Décision du Commandement":"Command decision","Avis favorable":"Favorable recommendation","Avis réservé":"Reserved recommendation","Avis défavorable":"Unfavorable recommendation","Grille de présélection":"Screening scorecard","Grille d’entretien":"Interview scorecard","Notes internes":"Internal notes","Dossier candidat":"Applicant file","Entretien oral in-game":"In-game oral interview","Incorporation":"Onboarding"});

let currentLang = localStorage.getItem("lspdLanguage")
  || ((navigator.language||"").toLowerCase().startsWith("en") ? "en" : "fr");

function translateSystemText(source, lang=currentLang){
  if(source == null) return source;
  const text=String(source);
  const dict=lang==="en"?I18N_EN:I18N_FR;
  if(Object.prototype.hasOwnProperty.call(dict,text)) return dict[text];

  // Sidebar/nav labels often begin with an emoji or icon.
  // Keep the icon and translate only the label.
  // Examples:
  // "🏠 Dashboard" -> "🏠 Tableau de bord"
  // "📚 Manuel FTO" -> "📚 FTO Manual"
  const iconMatch=text.match(/^([^\p{L}\p{N}]*)(.+)$/u);
  if(iconMatch && iconMatch[1]){
    const prefix=iconMatch[1];
    const label=iconMatch[2].trim();
    if(Object.prototype.hasOwnProperty.call(dict,label)){
      return prefix + dict[label];
    }
  }

  // Common composed UI strings. User-provided content is preserved.
  let m;
  if((m=text.match(/^(M\d{2}) — (.+)$/))){
    const translated=dict[m[2]] ?? m[2];
    return `${m[1]} — ${translated}`;
  }
  if(text.includes(" • ")){
    const parts=text.split(" • ");
    const changed=parts.map(p=>dict[p] ?? p);
    return changed.join(" • ");
  }
  if(text.includes(" — ")){
    const parts=text.split(" — ");
    const changed=parts.map(p=>dict[p] ?? p);
    return changed.join(" — ");
  }

  if(lang==="en"){
    if((m=text.match(/^Statut : (.+)$/))) return `Status: ${translateSystemText(m[1],"en")}`;
    if((m=text.match(/^Par (.+)$/))) return `By ${m[1]}`;
    if((m=text.match(/^Formateur: (.+)$/))) return `Trainer: ${m[1]}`;
    if((m=text.match(/^(\d+)\/(\d+) modules validés$/))) return `${m[1]}/${m[2]} modules completed`;
    if((m=text.match(/^Annonce LSPD : (.+)$/))) return `LSPD announcement: ${m[1]}`;
    if((m=text.match(/^Nouveau message : (.+)$/))) return `New message: ${m[1]}`;
    if((m=text.match(/^Message de (.+)$/))) return `Message from ${m[1]}`;
    if((m=text.match(/^Rapport (Approuvé|Refusé)$/))) return `Report ${m[1]==="Approuvé"?"Approved":"Rejected"}`;
    if((m=text.match(/^(.+) a été (approuvé|refusé) par (.+)\.$/))) return `${m[1]} was ${m[2]==="approuvé"?"approved":"rejected"} by ${m[3]}.`;
    if((m=text.match(/^Correction (Approuvé|Refusé)$/))) return `Correction ${m[1]==="Approuvé"?"Approved":"Rejected"}`;
    if((m=text.match(/^(.+) : ta demande a été (approuvée|refusée) par (.+)\.$/))) return `${m[1]}: your request was ${m[2]==="approuvée"?"approved":"rejected"} by ${m[3]}.`;
    if((m=text.match(/^Ton accès au Command Center est validé\. Matricule (.+), grade (.+)\.$/))) return `Your Command Center access is approved. Badge ${m[1]}, rank ${translateSystemText(m[2],"en")}.`;
    if((m=text.match(/^Refuser la demande de (.+) \?$/))) return `Reject ${m[1]}'s request?`;
    if((m=text.match(/^Erreur d'inscription : (.+)$/))) return `Registration error: ${m[1]}`;
    if((m=text.match(/^Erreur : (.+)$/))) return `Error: ${m[1]}`;
    if((m=text.match(/^Pièce jointe non envoyée\. Vérifie Firebase Storage et storage\.rules : (.+)$/))) return `Attachment not uploaded. Check Firebase Storage and storage.rules: ${m[1]}`;
    if((m=text.match(/^(.+) → (.+)$/))) return `${m[1]} → ${m[2]}`;
  }
  return text;
}

let i18nBusy=false;

function translateTextNode(node){
  if(!node || node.nodeType!==Node.TEXT_NODE) return;
  const current=node.nodeValue ?? "";
  if(node.__lspdI18nSource===undefined || (node.__lspdI18nLast!==undefined && current!==node.__lspdI18nLast)){
    node.__lspdI18nSource=current;
  }
  const source=node.__lspdI18nSource;
  const leading=(source.match(/^\s*/)||[""])[0];
  const trailing=(source.match(/\s*$/)||[""])[0];
  const core=source.trim();
  if(!core){ node.__lspdI18nLast=source; return; }
  const rendered=leading+translateSystemText(core,currentLang)+trailing;
  node.__lspdI18nLast=rendered;
  if(current!==rendered){
    i18nBusy=true;
    node.nodeValue=rendered;
    i18nBusy=false;
  }
}

function translateElement(el){
  if(!el || el.nodeType!==Node.ELEMENT_NODE) return;

  // Preserve canonical OPTION value before changing its visible text.
  if(el.tagName==="OPTION" && !el.hasAttribute("value")){
    el.setAttribute("value",el.textContent);
  }

  for(const attr of ["placeholder","title","aria-label"]){
    if(el.hasAttribute(attr)){
      const key=`i18n${attr.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()).replace(/^./,c=>c.toUpperCase())}Source`;
      if(el.dataset[key]===undefined) el.dataset[key]=el.getAttribute(attr);
      el.setAttribute(attr,translateSystemText(el.dataset[key],currentLang));
    }
  }
}

function translateDOM(root=document.body){
  if(!root) return;
  if(root.nodeType===Node.ELEMENT_NODE) translateElement(root);
  if(root.nodeType===Node.TEXT_NODE) translateTextNode(root);

  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.nodeType===Node.ELEMENT_NODE) translateElement(node);
    else translateTextNode(node);
  }
}

function updateLanguageButtons(){
  document.querySelectorAll("[data-language]").forEach(b=>b.classList.toggle("active",b.dataset.language===currentLang));
}

function setLanguage(lang){
  if(!["fr","en"].includes(lang)) return;
  currentLang=lang;
  localStorage.setItem("lspdLanguage",lang);
  document.documentElement.lang=lang;
  document.title=lang==="fr"?"LSPD — Centre de commandement":"LSPD Command Center";
  translateDOM(document.body);
  updateLanguageButtons();
  if(window.LSPD?.user && ["ftoAcademy","ftoJournal","ftoFinal"].includes(window.LSPD.currentPage)){
    setTimeout(()=>render(window.LSPD.currentPage),0);
  }
}

const i18nObserver=new MutationObserver(mutations=>{
  if(i18nBusy) return;
  for(const mutation of mutations){
    if(mutation.type==="characterData") translateTextNode(mutation.target);
    for(const node of mutation.addedNodes){
      if(node.nodeType===Node.ELEMENT_NODE || node.nodeType===Node.TEXT_NODE) translateDOM(node);
    }
  }
});

// Modern toast notifications; confirm remains native/synchronous for legacy flows.
const nativeConfirm=window.confirm.bind(window);
function showToast(message,type="info",duration=3400){
  const host=$("toastContainer");
  if(!host) return;
  const el=document.createElement("div");
  el.className=`toast toast-${type}`;
  el.innerHTML=`<span class="toast-dot"></span><div>${esc(translateSystemText(String(message),currentLang))}</div>`;
  host.appendChild(el);
  requestAnimationFrame(()=>el.classList.add("show"));
  setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),220);},duration);
}
window.alert=(message)=>showToast(message,"info");
window.confirm=(message)=>nativeConfirm(translateSystemText(String(message),currentLang));


const modules = [
["M01","Fondamentaux LSPD","Structure, chaîne de commandement, radio et code de conduite","Débutant"],
["M02","Radio & communications","Codes radio, transmissions, priorités et dispatch","Débutant"],
["M03","Patrouille","Positionnement, observation, contrôles et contacts citoyens","Débutant"],
["M04","Code de la route","Contrôles routiers, infractions et conduite professionnelle","Débutant"],
["M05","Contrôle d'identité","Procédure de contact, vérifications et sécurité","Débutant"],
["M06","Arrestation","Menottage, fouille, droits, transport et remise en garde","Intermédiaire"],
["M07","Usage de la force","Proportionnalité, désescalade et justification","Intermédiaire"],
["M08","Poursuites","Poursuite véhicule/pied, coordination et sécurité","Intermédiaire"],
["M09","Scènes de crime","Sécurisation, témoins, preuves et préservation","Intermédiaire"],
["M10","Rapports","Rédaction factuelle, chronologie, preuves et transmission","Intermédiaire"],
["M11","Interventions à risque","Renfort, périmètre, négociation et coordination","Avancé"],
["M12","Gestion de scène","Commandement tactique, briefing et ressources","Avancé"],
["M13","FTO & pédagogie","Démonstration, observation, feedback et validation","FTO"],
["M14","Supervision","Contrôle qualité, discipline, coaching et décisions","Commandement"],
["M15","Commandement","Gestion opérationnelle, effectifs et crises","Commandement"],
["M16","Leadership","Culture LSPD, éthique, développement et succession","Commandement"]
];

const gradeList = [
["Visiteur","Visiteur","Accès externe limité aux informations publiques du département."],
["Rookie","Rookie","Recrue / nouvel arrivant en formation."],
["Police Officer1","Police Officer I","Officier de niveau initial."],
["Police Officer2","Police Officer II","Officier autonome sur les missions courantes."],
["Police Officer3","Police Officer III","Officier expérimenté."],
["Senior Lead Officer","Senior Lead Officer","Officier senior / référent."],
["Detective1","Detective I","Détective niveau I."],
["Detective2","Detective II","Détective niveau II."],
["Detective3","Detective III","Détective niveau III."],
["Sergeant1","Sergeant I","Premier niveau de supervision."],
["Sergeant2","Sergeant II","Supervision confirmée."],
["Lieutenant","Lieutenant","Supervise plusieurs équipes et opérations."],
["Commander","Commander","Commandement opérationnel."],
["Captain","Captain","Commandement d'unité / supervision supérieure."],
["Deputy Chief of Police","Deputy Chief of Police","Haut commandement."],
["Assistant Chief","Assistant Chief","Direction stratégique du département."],
["Chief of Police","Chief of Police","Autorité finale du département."],
["Commissioner","Commissioner","Direction supérieure / supervision stratégique."]
];

const LEGACY_GRADE_ALIASES = {
  "PO1":"Police Officer1",
  "PO2":"Police Officer2",
  "PO3":"Police Officer3",
  "Sergent":"Sergeant1",
  "Deputy Chief":"Deputy Chief of Police"
};
function canonicalGrade(grade){ return LEGACY_GRADE_ALIASES[grade] || grade || "Rookie"; }
const roles = ["Visiteur","Officer","FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"];
const gradeIndex = grade => { const i=gradeList.findIndex(g=>g[0]===canonicalGrade(grade)); return i<0?999:i; };
const statuses = ["Actif","En formation","Suspendu","Inactif","Archivé","En attente","Refusé"];
const divisions = ["External","Patrol","Traffic","Detective","SWAT","Air Support","Training","Command"];
const certificationsCatalog = ["FTO","Pursuit","Traffic","Detective","SWAT","Air Support","Supervisor"];
const incidentTypes = ["Use of Force","Vehicle Pursuit","Arrestation sensible","Accident service","Plainte citoyen","Incident interne","Autre"];

const PERMISSION_GROUPS = [
  {key:"accounts",label:"Comptes & inscriptions",description:"Validation des accès, création/suppression de profils et codes provisoires.",permissions:[
    ["registrations_manage","Voir le module Inscriptions","Afficher et consulter les demandes d'inscription en attente."],
    ["registrations_approve","Approuver une inscription","Valider une inscription et définir matricule, grade, rôle et unité."],
    ["registrations_reject","Refuser une inscription","Refuser ou réexaminer une demande d'inscription."],
    ["personnel_create","Créer un officier","Créer un compte Firebase + profil LSPD depuis la gestion des officiers."],
    ["personnel_delete","Supprimer un officier","Supprimer le profil LSPD d'un officier (hors compte actuel)."],
    ["provisional_credentials_view","Voir les codes provisoires","Afficher/copier le mot de passe provisoire d'un compte à activer."]
  ]},
  {key:"recruitment",label:"Recrutement",description:"Sépare chaque étape du Bureau du recrutement et la décision finale du Commandement.",permissions:[
    ["recruitment_view","Voir les candidatures","Accéder au Bureau du recrutement et ouvrir les dossiers candidats."],
    ["recruitment_screening","Évaluer les dossiers","Remplir la grille de présélection /25."],
    ["recruitment_interview_schedule","Planifier les entretiens","Créer ou modifier une convocation d'entretien oral."],
    ["recruitment_interview_evaluate","Noter les entretiens","Compléter la grille d'entretien /35 et la recommandation."],
    ["recruitment_command_decision","Décision finale Command","Approuver/refuser définitivement une candidature après entretien."],
    ["recruitment_incorporate","Finaliser l'incorporation","Transformer un candidat admis en officier actif."],
    ["recruitment_settings_manage","Ouvrir / fermer les candidatures","Piloter le bouton public de candidature LSPD."]
  ]},
  {key:"personnel",label:"Personnel & carrière",description:"Consultation et modification des profils, certifications, dossiers RH et promotions.",permissions:[
    ["personnel_view","Voir tous les officiers","Accéder au roster complet et aux dossiers officier."],
    ["personnel_manage","Modifier identité / rôle / unité","Modifier matricule, nom RP, rôle technique et division."],
    ["personnel_grade_manage","Modifier les grades","Changer le grade d'un officier."],
    ["personnel_status_manage","Modifier les statuts","Activer, suspendre, rendre inactif ou archiver un officier."],
    ["leave_request_create","Créer une demande de congé","Créer et consulter ses propres demandes de congé."],
    ["leave_review","Valider les congés","Approuver/refuser les demandes de congé de l'effectif."],
    ["certifications_view","Voir les certifications","Consulter les certifications internes."],
    ["certifications_manage","Gérer les certifications","Attribuer des certifications."],
    ["records_view","Voir les dossiers RH","Consulter distinctions, sanctions et dossiers RH."],
    ["records_manage","Gérer les dossiers RH","Ajouter distinctions, sanctions et entrées RH."],
    ["division_review","Valider les candidatures divisions","Approuver/refuser les demandes de division."],
    ["promotions_view","Voir les promotions","Consulter l'historique et les propositions de promotion."],
    ["promotions_manage","Gérer les promotions","Créer/valider une promotion."]
  ]},
  {key:"fto",label:"FTO & suivi des recrues",description:"Outils pédagogiques, affectations et validation du parcours FTO.",permissions:[
    ["fto_tools","Accès FTO / Mes recrues","Accéder aux outils FTO et au suivi des recrues assignées."],
    ["fto_evaluations_create","Créer des évaluations FTO","Évaluer une formation/module pour une recrue."],
    ["fto_assignments_view","Voir les affectations FTO","Consulter toutes les affectations FTO."],
    ["fto_assignments_manage","Gérer les affectations FTO (Lieutenant+)","Créer, affecter en groupe et clôturer les affectations. Sécurité minimale: Lieutenant+."],
    ["fto_sessions_manage","Gérer les sessions FTO","Créer et clôturer les anciennes sessions FTO. S'utilise avec l'accès FTO / Academy."],
    ["fto_objectives_manage","Gérer les objectifs FTO","Créer et suivre les objectifs pédagogiques. S'utilise avec l'accès FTO / Academy."],
    ["fto_handoffs_manage","Gérer les passations FTO","Ajouter les notes de passation entre FTO. S'utilise avec l'accès FTO / Academy."],
    ["academy_manage","Gérer le parcours Academy","Accès aux outils avancés Academy / dossiers FTO."],
    ["academy_content_manage","Modifier le contenu Academy","Modifier modules, scénarios et contenu pédagogique."],
    ["academy_final_review","Valider la fin de parcours FTO","Approuver/refuser la validation finale FTO."]
  ]},
  {key:"training",label:"Formations & calendrier",description:"Accès au Centre Formation, inscriptions, création, invitations et présences.",permissions:[
    ["training_access","Accéder au Centre Formation","Voir le planning, les modules et les formations accessibles."],
    ["training_self_register","S'inscrire / se désinscrire","S'inscrire soi-même à une formation ouverte ou annuler son inscription."],
    ["training_manage","Créer / gérer les formations","Créer et administrer les événements de formation."],
    ["training_invites_manage","Inviter des participants","Envoyer des invitations individuelles/groupées aux formations."],
    ["training_attendance_manage","Gérer les présences","Marquer les présences et statuts des participants."]
  ]},
  {key:"reports",label:"Communication, rapports & validations",description:"Messagerie, rapports d'incident, validations, corrections et annonces.",permissions:[
    ["messages_access","Utiliser la messagerie interne","Lire, envoyer, répondre et transférer des messages LSPD."],
    ["incident_create","Créer ses rapports d'incident","Rédiger et soumettre un nouveau rapport d'incident."],
    ["incident_view_all","Voir tous les rapports","Voir les rapports de tous les membres, pas seulement les siens."],
    ["incident_review","Approuver / refuser les rapports","Traiter la file des validations de rapports."],
    ["incident_export","Exporter les rapports","Exporter les rapports d'incident en CSV."],
    ["corrections_create","Demander une correction / addendum","Créer une demande de correction sur un rapport ou une évaluation accessible."],
    ["corrections_review","Valider corrections & addenda","Approuver/refuser les demandes de correction et créer les addenda."],
    ["announcements_manage","Publier des annonces","Créer et gérer les annonces LSPD."]
  ]},
  {key:"operations",label:"Opérations, MDT & CAD",description:"Dossiers MDT, service, CAD, BOLO et Watch Commander.",permissions:[
    ["mdt_manage","Accéder au MDT opérationnel","Accéder à l'onglet Dossiers MDT et à ses recherches."],
    ["mdt_case_create","Créer un dossier MDT","Créer un nouveau dossier d'enquête MDT."],
    ["mdt_case_close","Clôturer un dossier MDT","Clôturer les dossiers d'enquête."],
    ["shifts_view","Voir tous les shifts","Consulter les shifts de tous les officiers."],
    ["shifts_manage","Gérer les shifts","Créer, modifier ou annuler les shifts."],
    ["duty_board","Voir le tableau de service","Accéder au Duty Board."],
    ["cad_access","Accéder au CAD","Voir le CAD et gérer sa propre unité opérationnelle."],
    ["cad_manage","Gérer toutes les unités CAD","Modifier les unités CAD autres que sa propre unité."],
    ["bolo_view","Voir les BOLO","Consulter les BOLO actifs et leur historique."],
    ["bolo_manage","Gérer les BOLO","Créer, modifier et clôturer les BOLO."],
    ["watch_view","Voir Watch Commander","Consulter le Watch Commander actif et l'historique."],
    ["watch_manage","Gérer Watch Commander","Créer et administrer les sessions Watch Commander."]
  ]},
  {key:"command",label:"Commandement & contrôle",description:"Outils de pilotage, statistiques et audit.",permissions:[
    ["analytics","Statistiques & Promotion Advisor","Accéder aux statistiques et outils d'aide à la promotion."],
    ["audit","Voir l'historique audit","Consulter les actions enregistrées dans l'audit."]
  ]}
];
const PERMISSION_CATALOG = PERMISSION_GROUPS.flatMap(group=>group.permissions.map(([key,label])=>[key,label]));
const PERMISSION_DETAILS = Object.fromEntries(PERMISSION_GROUPS.flatMap(group=>group.permissions.map(([key,label,description])=>[key,{label,description,group:group.key}])));
const PERMISSION_MIN_GRADE = {fto_assignments_manage:"Lieutenant"};
const PERMISSION_EXPANSIONS = {
  registrations_manage:["registrations_approve","registrations_reject"],
  personnel_manage:["personnel_grade_manage","personnel_status_manage","recruitment_command_decision","recruitment_incorporate"],
  fto_tools:["fto_evaluations_create","fto_sessions_manage","fto_objectives_manage","fto_handoffs_manage"],
  training_manage:["training_invites_manage","training_attendance_manage"],
  incident_review:["incident_view_all","incident_export","corrections_review"],
  mdt_manage:["mdt_case_create","mdt_case_close","recruitment_view","recruitment_screening","recruitment_interview_schedule","recruitment_interview_evaluate"]
};
function permissionMinimumAllows(permission,grade){
  const min=PERMISSION_MIN_GRADE[permission];
  if(!min)return true;
  return gradeIndex(canonicalGrade(grade))>=gradeIndex(min);
}
function expandPermissionSet(list,grade,{legacy=false,assignmentDefault=false}={}){
  const out=new Set(Array.isArray(list)?list:[]);
  // Broad permissions from Phase 17.11.6 are expanded only during migration.
  // Once catalog v22 is saved, every checkbox remains independent.
  if(legacy){
    for(const [oldPermission,extras] of Object.entries(PERMISSION_EXPANSIONS)){
      if(out.has(oldPermission)) extras.forEach(p=>out.add(p));
    }
  }
  // Lieutenant+ is a hard minimum to manage assignments; the checkbox still
  // remains revocable by the Chief for any Lieutenant+ grade.
  if(assignmentDefault && isLieutenantPlusGrade(grade)){
    out.add("fto_assignments_view");
    out.add("fto_assignments_manage");
  }
  return [...out].filter(p=>PERMISSION_CATALOG.some(x=>x[0]===p) && permissionMinimumAllows(p,grade));
}

const DEFAULT_PERMISSIONS = {
  Visiteur: [],
  Officer: [],
  FTO: ["fto_tools","training_manage","academy_manage","academy_content_manage"],
  Sergeant: ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage","academy_manage","academy_content_manage","academy_final_review"],
  Lieutenant: ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage","academy_manage","academy_content_manage","academy_final_review"],
  Captain: ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage","academy_manage","academy_content_manage","academy_final_review"],
  "Deputy Chief": ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage","academy_manage","academy_content_manage","academy_final_review"],
  "Assistant Chief": ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage","academy_manage","academy_content_manage","academy_final_review"],
  Chief: PERMISSION_CATALOG.map(x=>x[0])
};

function permissionsForLegacyRole(roleName, roleMap=DEFAULT_PERMISSIONS){
  return Array.isArray(roleMap?.[roleName]) ? [...roleMap[roleName]] : [];
}
function buildGradePermissionsFromRoleConfig(roleMap=DEFAULT_PERMISSIONS){
  const byGrade={};
  const roleForGrade={
    "Visiteur":"Visiteur","Rookie":"Officer","Police Officer1":"Officer","Police Officer2":"Officer","Police Officer3":"Officer",
    "Senior Lead Officer":"Officer","Detective1":"Officer","Detective2":"Officer","Detective3":"Officer",
    "Sergeant1":"Sergeant","Sergeant2":"Sergeant","Lieutenant":"Lieutenant","Commander":"Captain","Captain":"Captain",
    "Deputy Chief of Police":"Deputy Chief","Assistant Chief":"Assistant Chief","Chief of Police":"Chief","Commissioner":"Assistant Chief"
  };
  for(const [grade] of gradeList){
    const sourceRole=roleForGrade[grade]||"Officer";
    byGrade[grade]=grade==="Chief of Police"?PERMISSION_CATALOG.map(x=>x[0]):grade==="Visiteur"?[]:expandPermissionSet(permissionsForLegacyRole(sourceRole,roleMap),grade,{legacy:true,assignmentDefault:true});
  }
  return byGrade;
}
const DEFAULT_GRADE_PERMISSIONS = buildGradePermissionsFromRoleConfig(DEFAULT_PERMISSIONS);
const BASE_SELF_SERVICE_PERMISSIONS = ["messages_access","incident_create","corrections_create","training_access","training_self_register","leave_request_create","cad_access","bolo_view"];
function migrationDefaultsForGrade(grade){
  const g=canonicalGrade(grade),out=[...BASE_SELF_SERVICE_PERMISSIONS];
  if(gradeIndex(g)>=gradeIndex("Sergeant1"))out.push("watch_view");
  return g==="Visiteur"?[]:out;
}
for(const [g] of gradeList){
  if(g==="Visiteur")DEFAULT_GRADE_PERMISSIONS[g]=[];
  else if(g==="Chief of Police")DEFAULT_GRADE_PERMISSIONS[g]=PERMISSION_CATALOG.map(x=>x[0]);
  else DEFAULT_GRADE_PERMISSIONS[g]=[...new Set([...(DEFAULT_GRADE_PERMISSIONS[g]||[]),...migrationDefaultsForGrade(g)])];
}

const PAGE_PERMISSIONS = {
  registrations:"registrations_manage",
  recruitmentControl:"recruitment_settings_manage",
  approvals:"incident_review",
  trainees:"fto_tools",
  officers:"personnel_view",
  assignments:"fto_assignments_view",
  certifications:"certifications_view",
  records:"records_view",
  shifts:"shifts_view",
  dutyBoard:"duty_board",
  requirements:"analytics",
  promotionAdvisor:"analytics",
  promotions:"promotions_view",
  stats:"analytics",
  history:"audit",
  ftoAcademy:"academy_manage",
  ftoJournal:"academy_manage",
  ftoFinal:"academy_manage",
  ftoDossier:"academy_manage",
  academyManager:"academy_content_manage",
  trainingAnalytics:"academy_manage"
};


function B(fr,en){ return currentLang==="en"?en:fr; }

const ACADEMY_MODULES = {
M01:{
 duration:"30–45 min",prereq:["—"],
 objective:()=>B("Comprendre la structure LSPD, la chaîne de commandement et les attentes professionnelles.","Understand LSPD structure, chain of command, and professional expectations."),
 steps:()=>[
  B("Présenter grades, rôles, responsabilités et chaîne de commandement.","Explain ranks, roles, responsibilities, and chain of command."),
  B("Faire identifier à la recrue qui contacter selon plusieurs situations.","Have the trainee identify who to contact in several situations."),
  B("Faire un briefing radio court et rappeler les standards professionnels.","Run a short radio briefing and review professional standards."),
  B("Terminer par des questions de compréhension.","Finish with comprehension questions.")
 ],
 example:()=>B("Donner trois situations : demande de renfort, conflit interne, incident majeur. La recrue doit expliquer la bonne remontée hiérarchique.","Give three situations: backup request, internal conflict, major incident. The trainee explains the correct escalation path."),
 variants:()=>[B("Question surprise sur le rôle d'un superviseur.","Surprise question about a supervisor's role."),B("Mini briefing devant une autre unité.","Mini briefing in front of another unit.")],
 mistakes:()=>[B("Confondre grade et rôle opérationnel.","Confusing rank with operational role."),B("Contourner inutilement la chaîne de commandement.","Unnecessarily bypassing chain of command.")],
 critical:()=>[B("Refuser un ordre légal RP d'un supérieur.","Refusing a lawful RP order from a supervisor.")],
 questions:()=>[
  [B("Qui contactes-tu en premier pour un problème pendant ton shift ?","Who do you contact first for an issue during your shift?"),B("Le superviseur direct ou le Watch Commander selon l'organisation du service.","Your direct supervisor or the Watch Commander depending on the shift structure.")],
  [B("Pourquoi la chaîne de commandement existe-t-elle ?","Why does the chain of command exist?"),B("Pour garder une communication claire, des responsabilités définies et des décisions cohérentes.","To maintain clear communication, defined accountability, and consistent decisions.")]
 ],
 corrective:()=>B("Refaire un briefing de 5 minutes puis poser des questions de situation jusqu'à obtenir des réponses cohérentes.","Repeat a 5-minute briefing and use situational questions until answers are consistent.")
},
M02:{
 duration:"45–60 min",prereq:["M01"],
 objective:()=>B("Maîtriser les transmissions radio courtes, utiles et structurées.","Master short, useful, structured radio transmissions."),
 steps:()=>[
  B("Expliquer le format : indicatif → localisation → situation → besoin.","Explain the format: call sign → location → situation → need."),
  B("Démontrer cinq transmissions correctes.","Demonstrate five correct transmissions."),
  B("Faire répéter avec chrono : 10 secondes maximum pour un appel simple.","Practice with a timer: max 10 seconds for a simple call."),
  B("Ajouter du trafic radio parasite pour tester la discipline radio.","Add radio congestion to test discipline.")
 ],
 example:()=>B("« Adam-12, contrôle routier Vespucci Blvd, Sultan noir, deux occupants, pas de renfort demandé. »","“Adam-12, traffic stop Vespucci Blvd, black Sultan, two occupants, no backup requested.”"),
 variants:()=>[B("Poursuite avec changements rapides de rue.","Pursuit with rapid street changes."),B("Officer down nécessitant une priorité radio.","Officer-down call requiring radio priority.")],
 mistakes:()=>[B("Parler trop longtemps.","Talking too long."),B("Oublier la localisation.","Forgetting location."),B("Couper une transmission prioritaire.","Stepping on a priority transmission.")],
 critical:()=>[B("Ne pas annoncer une situation dangereuse nécessitant du renfort.","Failing to broadcast a dangerous situation requiring backup.")],
 questions:()=>[
  [B("Quelles sont les informations minimales d'un appel radio ?","What are the minimum details for a radio call?"),B("Indicatif, localisation, nature de l'événement et besoin éventuel.","Call sign, location, event type, and any needed resource.")],
  [B("Quand interrompre le trafic radio normal ?","When should normal radio traffic be interrupted?"),B("Lors d'une urgence ou information prioritaire affectant directement la sécurité.","During an emergency or priority information directly affecting safety.")]
 ],
 corrective:()=>B("Faire 10 transmissions simulées. Objectif : 8/10 claires sans correction.","Run 10 simulated transmissions. Goal: 8/10 clear without correction.")
},
M03:{
 duration:"60 min",prereq:["M01","M02"],
 objective:()=>B("Conduire une patrouille proactive, sûre et structurée.","Conduct proactive, safe, structured patrol."),
 steps:()=>[
  B("Expliquer zones de patrouille, observation et positionnement.","Explain patrol areas, observation, and positioning."),
  B("Faire identifier cinq éléments suspects sans intervenir immédiatement.","Have the trainee identify five suspicious cues without immediately acting."),
  B("Faire gérer un contact citoyen puis un appel de service.","Handle a citizen contact then a call for service."),
  B("Débriefer décision, sécurité et communication.","Debrief decision-making, safety, and communication.")
 ],
 example:()=>B("Un véhicule stationne moteur allumé derrière un commerce fermé. La recrue observe, vérifie puis décide si un contact est utile.","A vehicle idles behind a closed business. The trainee observes, checks, then decides whether contact is appropriate."),
 variants:()=>[B("Patrouille de nuit.","Night patrol."),B("Zone très fréquentée.","Crowded area.")],
 mistakes:()=>[B("Intervenir trop vite sans observation.","Acting too quickly without observation."),B("Mauvais positionnement du véhicule.","Poor patrol vehicle positioning.")],
 critical:()=>[B("Se placer dans une zone de danger évitable.","Placing oneself in an avoidable danger zone.")],
 questions:()=>[[B("Pourquoi observer avant de prendre contact ?","Why observe before making contact?"),B("Pour obtenir du contexte, identifier les risques et choisir la meilleure approche.","To gain context, identify risks, and choose the best approach.")]],
 corrective:()=>B("Refaire une patrouille d'observation où la recrue doit verbaliser chaque décision.","Repeat an observation-only patrol where the trainee verbalizes each decision.")
},
M04:{
 duration:"60–75 min",prereq:["M02","M03"],
 objective:()=>B("Réaliser un contrôle routier complet, professionnel et sûr.","Perform a complete, professional, safe traffic stop."),
 steps:()=>[
  B("Briefing : motif, positionnement, plaque, radio et approche.","Brief: reason, positioning, plate, radio, and approach."),
  B("Le FTO démontre un contrôle complet.","FTO demonstrates a full traffic stop."),
  B("La recrue réalise un contrôle standard.","Trainee performs a standard stop."),
  B("Ajouter un conducteur nerveux puis un refus de présenter les documents.","Add a nervous driver, then refusal to provide documents."),
  B("Faire rédiger ou verbaliser le rapport final.","Have the trainee draft or verbally outline the final report.")
 ],
 example:()=>B("Véhicule à vive allure. La recrue annonce le stop, choisit une position sûre, gère le conducteur et justifie sa décision finale.","Speeding vehicle. The trainee broadcasts the stop, chooses safe positioning, manages the driver, and justifies the final disposition."),
 variants:()=>[B("Conducteur coopératif.","Cooperative driver."),B("Conducteur agressif verbalement.","Verbally aggressive driver."),B("Passager qui intervient constamment.","Passenger repeatedly interfering."),B("Véhicule possiblement volé.","Possibly stolen vehicle.")],
 mistakes:()=>[B("Oublier plaque ou description.","Forgetting plate or description."),B("Se placer trop près du véhicule.","Standing too close to the vehicle."),B("Ne pas expliquer le motif du contrôle.","Not explaining the reason for the stop.")],
 critical:()=>[B("Approche dangereuse malgré un risque évident.","Unsafe approach despite an obvious risk."),B("Perdre totalement le contrôle des occupants.","Completely losing control of the occupants.")],
 questions:()=>[
  [B("Pourquoi annoncer le contrôle avant l'approche ?","Why broadcast the stop before approaching?"),B("Pour informer le dispatch et permettre une réaction rapide si la situation dégénère.","To inform dispatch and allow a rapid response if the situation escalates.")],
  [B("Quand demandes-tu un renfort ?","When do you request backup?"),B("Quand les occupants, le comportement, les informations ou l'environnement augmentent le risque.","When occupants, behavior, known information, or environment increase risk.")]
 ],
 corrective:()=>B("Refaire trois contrôles : standard, agressif, suspicion véhicule volé. Validation si sécurité + radio restent constantes.","Repeat three stops: standard, aggressive, suspected stolen vehicle. Validate if safety + radio stay consistent.")
},
M05:{
 duration:"45–60 min",prereq:["M03"],
 objective:()=>B("Effectuer un contrôle d'identité professionnel et proportionné.","Conduct a professional and proportionate identity check."),
 steps:()=>[
  B("Expliquer les motifs du contact et les limites de la procédure RP.","Explain reasons for contact and limits of the RP procedure."),
  B("Démontrer un contact consensuel puis un contrôle formel.","Demonstrate consensual contact then a formal check."),
  B("Faire gérer une personne calme puis méfiante.","Handle a calm person then a wary person."),
  B("Faire expliquer à la recrue chaque étape avant de la faire.","Have the trainee explain each step before doing it.")
 ],
 example:()=>B("Individu correspondant partiellement à un signalement. La recrue vérifie les éléments avant de décider de la suite.","Person partially matching a description. The trainee verifies details before deciding next steps."),
 variants:()=>[B("Témoin pressé.","Witness in a hurry."),B("Personne refusant de répondre aux questions non obligatoires.","Person declining optional questions.")],
 mistakes:()=>[B("Transformer trop vite un contact en confrontation.","Turning contact into confrontation too quickly."),B("Poser des questions sans objectif.","Asking questions without purpose.")],
 critical:()=>[B("Escalader sans justification.","Escalating without justification.")],
 questions:()=>[[B("Que vérifies-tu avant d'escalader ?","What do you verify before escalating?"),B("Contexte, description, comportement, informations disponibles et justification procédurale.","Context, description, behavior, available information, and procedural justification.")]],
 corrective:()=>B("Rejouer la scène avec le FTO demandant « pourquoi ? » avant chaque action de la recrue.","Replay the scene with the FTO asking “why?” before each trainee action.")
},
M06:{
 duration:"75 min",prereq:["M05"],
 objective:()=>B("Effectuer une arrestation sûre, claire et traçable.","Perform a safe, clear, traceable arrest."),
 steps:()=>[
  B("Briefing sur contrôle, menottage, fouille et transport.","Brief control, handcuffing, search, and transport."),
  B("Démonstration lente puis à vitesse normale.","Demonstrate slowly, then at normal speed."),
  B("Pratique sur suspect coopératif.","Practice on a cooperative suspect."),
  B("Ajouter une résistance passive.","Add passive resistance."),
  B("Faire verbaliser la chronologie du rapport.","Have trainee verbalize the report chronology.")
 ],
 example:()=>B("Suspect coopératif arrêté après mandat confirmé. La recrue contrôle, menotte, fouille, informe et transporte.","Cooperative suspect arrested after a confirmed warrant. Trainee controls, cuffs, searches, informs, and transports."),
 variants:()=>[B("Suspect au sol.","Suspect on the ground."),B("Deux suspects avec renfort.","Two suspects with backup.")],
 mistakes:()=>[B("Fouille incomplète.","Incomplete search."),B("Oublier de vérifier les menottes.","Failing to check cuffs.")],
 critical:()=>[B("Laisser un suspect menotté sans contrôle pendant une menace active.","Leaving a cuffed suspect uncontrolled during an active threat.")],
 questions:()=>[[B("Pourquoi la fouille doit-elle être systématique ?","Why must the search be systematic?"),B("Pour la sécurité, la découverte d'objets et la traçabilité avant transport.","For safety, item discovery, and accountability before transport.")]],
 corrective:()=>B("Répéter contrôle → menottage → vérification → fouille → transport jusqu'à automatisation.","Repeat control → cuffing → check → search → transport until automatic.")
},
M07:{
 duration:"75 min",prereq:["M06"],
 objective:()=>B("Choisir une réponse proportionnée et privilégier la désescalade.","Choose proportionate responses and prioritize de-escalation."),
 steps:()=>[
  B("Présenter des situations de faible à haut risque.","Present situations from low to high risk."),
  B("Faire expliquer l'option choisie avant action.","Have trainee explain the chosen option before acting."),
  B("Jouer deux scénarios de désescalade verbale.","Run two verbal de-escalation scenarios."),
  B("Analyser ensuite les alternatives possibles.","Review alternative options afterward.")
 ],
 example:()=>B("Individu agité, mains visibles, refuse de s'asseoir mais n'attaque pas. Objectif : espace et contrôle verbal avant force.","Agitated subject, hands visible, refuses to sit but is not attacking. Goal: space and verbal control before force."),
 variants:()=>[B("Foule autour de la scène.","Crowd around the scene."),B("Sujet intoxiqué.","Intoxicated subject.")],
 mistakes:()=>[B("Monter immédiatement le ton.","Immediately raising voice."),B("Se rapprocher inutilement.","Unnecessarily closing distance.")],
 critical:()=>[B("Usage de force clairement disproportionné.","Clearly disproportionate use of force.")],
 questions:()=>[[B("Quel est ton premier objectif avant l'usage de force ?","What is your first objective before using force?"),B("Stabiliser la situation et obtenir la coopération si raisonnablement possible.","Stabilize the situation and gain cooperation when reasonably possible.")]],
 corrective:()=>B("Refaire le scénario sans force pendant 60 secondes sauf menace immédiate.","Replay the scenario with no force for 60 seconds unless there is an immediate threat.")
},
M08:{
 duration:"90 min",prereq:["M02","M03","M07"],
 objective:()=>B("Gérer une poursuite sans perdre sécurité, radio et coordination.","Manage a pursuit without losing safety, radio, or coordination."),
 steps:()=>[
  B("Briefing sur rôle primaire/secondaire et radio.","Brief primary/secondary roles and radio."),
  B("Faire une poursuite lente d'entraînement.","Run a low-speed training pursuit."),
  B("Ajouter changement de direction et perte visuelle temporaire.","Add direction changes and temporary loss of visual."),
  B("Faire décider si la poursuite doit continuer.","Require a decision on whether the pursuit should continue."),
  B("Débriefer risques et bénéfices.","Debrief risk versus benefit.")
 ],
 example:()=>B("Refus d'obtempérer après contrôle routier. La recrue devient unité primaire et donne les mises à jour utiles.","Failure to stop after traffic stop. Trainee becomes primary and provides useful updates."),
 variants:()=>[B("Trafic dense.","Heavy traffic."),B("Poursuite à pied dans des ruelles.","Foot pursuit through alleys."),B("Perte de visuel.","Loss of visual.")],
 mistakes:()=>[B("Radio trop détaillée.","Overly detailed radio."),B("Conduite tunnel vision.","Tunnel-vision driving.")],
 critical:()=>[B("Continuer une poursuite quand le risque dépasse clairement le bénéfice sans justification.","Continuing a pursuit when risk clearly outweighs benefit without justification.")],
 questions:()=>[[B("Quels éléments réévalues-tu pendant la poursuite ?","What factors do you reassess during a pursuit?"),B("Danger public, gravité, trafic, météo, visibilité, coordination et alternatives.","Public danger, severity, traffic, weather, visibility, coordination, and alternatives.")]],
 corrective:()=>B("Faire une poursuite où le bon choix est l'arrêt volontaire ; vérifier que la recrue sait renoncer.","Run a pursuit where voluntary termination is correct; verify the trainee can disengage.")
},
M09:{
 duration:"60 min",prereq:["M03"],
 objective:()=>B("Sécuriser une scène de crime et préserver les informations utiles.","Secure a crime scene and preserve useful information."),
 steps:()=>[
  B("Définir périmètre et points d'entrée/sortie.","Define perimeter and entry/exit points."),
  B("Séparer témoins et identifier les priorités.","Separate witnesses and identify priorities."),
  B("Lister les éléments à ne pas contaminer.","List items that must not be contaminated."),
  B("Créer une chronologie simple.","Build a simple timeline.")
 ],
 example:()=>B("Vol dans un commerce avec deux témoins et un objet abandonné. La recrue organise la scène avant les questions détaillées.","Store theft with two witnesses and an abandoned item. Trainee organizes the scene before detailed questioning."),
 variants:()=>[B("Scène extérieure sous pluie.","Outdoor scene in rain."),B("Plusieurs unités déjà présentes.","Multiple units already present.")],
 mistakes:()=>[B("Laisser les témoins discuter ensemble.","Allowing witnesses to discuss together."),B("Déplacer un élément sans nécessité.","Moving an item unnecessarily.")],
 critical:()=>[B("Contaminer une preuve importante par négligence RP.","Contaminating important evidence through RP negligence.")],
 questions:()=>[[B("Quelle est ta première priorité en arrivant ?","What is your first priority on arrival?"),B("Sécurité et stabilisation de la scène avant l'enquête détaillée.","Safety and scene stabilization before detailed investigation.")]],
 corrective:()=>B("Faire dessiner le périmètre et expliquer chaque zone avant de rejouer la scène.","Have trainee draw the perimeter and explain each zone before replaying.")
},
M10:{
 duration:"60 min",prereq:["M06","M09"],
 objective:()=>B("Rédiger un rapport factuel, chronologique et exploitable.","Write a factual, chronological, usable report."),
 steps:()=>[
  B("Comparer un mauvais et un bon rapport.","Compare a poor and a good report."),
  B("Faire écrire les faits sans conclusions inutiles.","Write facts without unnecessary conclusions."),
  B("Vérifier chronologie, personnes, actions et résultat.","Check chronology, people, actions, and outcome."),
  B("Faire relire par la recrue en cherchant ce qui manque.","Have trainee proofread looking for missing information.")
 ],
 example:()=>B("Mauvais : « Le suspect était bizarre donc je l'ai arrêté. » Bon : comportements observables, vérifications et motif précis.","Bad: “The suspect was weird so I arrested him.” Good: observable behavior, checks, and exact grounds."),
 variants:()=>[B("Rapport de poursuite.","Pursuit report."),B("Rapport d'usage de force.","Use-of-force report.")],
 mistakes:()=>[B("Opinion présentée comme fait.","Opinion stated as fact."),B("Chronologie incomplète.","Incomplete chronology.")],
 critical:()=>[B("Inventer un fait ou omettre volontairement un élément essentiel.","Inventing a fact or intentionally omitting an essential detail.")],
 questions:()=>[[B("Quelle différence entre fait et interprétation ?","What is the difference between fact and interpretation?"),B("Le fait est observable/vérifiable ; l'interprétation doit être justifiée ou identifiée comme telle.","A fact is observable/verifiable; interpretation must be justified or identified as such.")]],
 corrective:()=>B("Réécrire un ancien rapport avec une structure chronologique stricte.","Rewrite an older report using a strict chronological structure.")
},
M11:{
 duration:"90 min",prereq:["M07","M08"],
 objective:()=>B("Réagir aux interventions à haut risque avec discipline, renfort et coordination.","Respond to high-risk incidents with discipline, backup, and coordination."),
 steps:()=>[
  B("Définir menace, périmètre et ressources.","Define threat, perimeter, and resources."),
  B("Faire verbaliser le plan avant mouvement.","Require verbal plan before movement."),
  B("Attribuer les rôles à chaque unité.","Assign roles to each unit."),
  B("Introduire une information contradictoire.","Introduce conflicting information."),
  B("Débriefer les décisions clés.","Debrief key decisions.")
 ],
 example:()=>B("Appel pour individu armé dans un parking. La recrue évite l'entrée précipitée, demande ressources et structure la réponse.","Call for an armed subject in a parking lot. Trainee avoids rushing in, requests resources, and structures the response."),
 variants:()=>[B("Victime potentielle à proximité.","Potential victim nearby."),B("Information non confirmée sur l'arme.","Unconfirmed weapon information.")],
 mistakes:()=>[B("Entrer sans plan.","Entering without a plan."),B("Multiplier les ordres contradictoires.","Giving conflicting commands.")],
 critical:()=>[B("Exposer inutilement plusieurs unités à une menace connue.","Unnecessarily exposing multiple units to a known threat.")],
 questions:()=>[[B("Quand ralentir l'intervention ?","When should you slow the response?"),B("Quand le temps permet de gagner information, ressources et position sans augmenter le danger.","When time allows gaining information, resources, and position without increasing danger.")]],
 corrective:()=>B("Rejouer avec obligation d'attendre un briefing de 30 secondes avant engagement.","Replay with a mandatory 30-second briefing before engagement.")
},
M12:{
 duration:"90 min",prereq:["M11"],
 objective:()=>B("Prendre le contrôle d'une scène multi-unités et communiquer un plan clair.","Take control of a multi-unit scene and communicate a clear plan."),
 steps:()=>[
  B("Identifier commandement, menace et objectifs.","Identify command, threat, and objectives."),
  B("Nommer rôles : contact, périmètre, circulation, arrestation.","Assign contact, perimeter, traffic, and arrest roles."),
  B("Donner un briefing de moins de 60 secondes.","Deliver a briefing under 60 seconds."),
  B("Réévaluer après un changement de situation.","Reassess after a situation change.")
 ],
 example:()=>B("Accident + suspect recherché + foule. La recrue priorise, répartit les unités et garde une vue d'ensemble.","Crash + wanted suspect + crowd. Trainee prioritizes, assigns units, and maintains the big picture."),
 variants:()=>[B("Superviseur retardé.","Supervisor delayed."),B("Deux scènes proches simultanées.","Two nearby scenes at once.")],
 mistakes:()=>[B("Tout faire soi-même.","Trying to do everything personally."),B("Ne pas confirmer que les rôles sont compris.","Not confirming roles are understood.")],
 critical:()=>[B("Absence totale de commandement entraînant une confusion dangereuse.","Total lack of command causing dangerous confusion.")],
 questions:()=>[[B("Quel est le rôle principal du Scene Commander ?","What is the main role of a Scene Commander?"),B("Maintenir la vision globale, fixer les priorités et déléguer efficacement.","Maintain the big picture, set priorities, and delegate effectively.")]],
 corrective:()=>B("Refaire briefing et attribution des rôles jusqu'à ce qu'ils soient clairs et courts.","Repeat briefing and role assignment until clear and concise.")
},
M13:{
 duration:"90 min",prereq:["M01","M10"],
 objective:()=>B("Former une recrue avec une méthode cohérente, factuelle et constructive.","Train a recruit using a consistent, factual, constructive method."),
 steps:()=>[
  B("Utiliser : expliquer → démontrer → faire pratiquer → observer → débriefer.","Use: explain → demonstrate → practice → observe → debrief."),
  B("Séparer comportement observé et jugement personnel.","Separate observed behavior from personal judgment."),
  B("Donner un feedback avec un point fort, un point à corriger et une action concrète.","Give feedback with one strength, one correction, and one concrete action."),
  B("Documenter les progrès.","Document progress.")
 ],
 example:()=>B("Au lieu de « tu es mauvais en radio », dire : « sur trois appels, deux manquaient de localisation ; prochaine session on fait dix appels courts ».","Instead of “you are bad on radio,” say: “two of three calls lacked location; next session we'll do ten short calls.”"),
 variants:()=>[B("Recrue stressée.","Stressed trainee."),B("Recrue trop confiante.","Overconfident trainee.")],
 mistakes:()=>[B("Corriger sans expliquer.","Correcting without explaining."),B("Accumuler plusieurs critiques vagues.","Stacking multiple vague criticisms.")],
 critical:()=>[B("Humilier ou piéger volontairement la recrue au lieu de former.","Humiliating or intentionally trapping the trainee instead of teaching.")],
 questions:()=>[[B("Quel feedback est le plus utile ?","What feedback is most useful?"),B("Spécifique, observable, rapide et accompagné d'une action corrective.","Specific, observable, timely, and paired with a corrective action.")]],
 corrective:()=>B("Transformer cinq critiques vagues en feedbacks factuels.","Rewrite five vague criticisms into factual feedback.")
},
M14:{
 duration:"75 min",prereq:["M12","M13"],
 objective:()=>B("Superviser une équipe, contrôler la qualité et corriger sans micro-manager.","Supervise a team, maintain quality, and correct without micromanaging."),
 steps:()=>[
  B("Identifier risques et priorités de l'équipe.","Identify team risks and priorities."),
  B("Observer avant d'intervenir.","Observe before intervening."),
  B("Corriger au bon niveau : coaching, rappel ou décision.","Correct at the right level: coaching, reminder, or decision."),
  B("Documenter les décisions importantes.","Document important decisions.")
 ],
 example:()=>B("Deux officiers appliquent différemment une procédure. Le superviseur clarifie le standard puis suit l'application.","Two officers apply a procedure differently. Supervisor clarifies the standard and follows implementation."),
 variants:()=>[B("Sous-effectif.","Understaffing."),B("Conflit entre officiers.","Officer conflict.")],
 mistakes:()=>[B("Intervenir dans chaque détail.","Intervening in every detail."),B("Attendre trop longtemps sur une erreur répétée.","Waiting too long on a repeated error.")],
 critical:()=>[B("Ignorer un problème de sécurité connu.","Ignoring a known safety issue.")],
 questions:()=>[[B("Quand intervenir immédiatement ?","When should a supervisor intervene immediately?"),B("Quand sécurité, discipline majeure ou cohérence opérationnelle sont menacées.","When safety, major discipline, or operational coherence are threatened.")]],
 corrective:()=>B("Présenter trois problèmes d'équipe et demander quel niveau d'intervention est proportionné.","Present three team problems and ask what intervention level is proportionate.")
},
M15:{
 duration:"90 min",prereq:["M14"],
 objective:()=>B("Commander des opérations en gardant objectifs, ressources et communication alignés.","Command operations while keeping objectives, resources, and communication aligned."),
 steps:()=>[
  B("Définir l'intention du commandement.","Define command intent."),
  B("Prioriser objectifs et ressources.","Prioritize objectives and resources."),
  B("Déléguer des responsables.","Delegate leads."),
  B("Fixer des points de situation réguliers.","Set regular status checks."),
  B("Préparer une solution de repli.","Prepare a fallback option.")
 ],
 example:()=>B("Plusieurs incidents simultanés. Le commandement répartit les unités, conserve une réserve et évite de saturer une zone.","Multiple simultaneous incidents. Command distributes units, retains a reserve, and avoids overcommitting one area."),
 variants:()=>[B("Panne radio partielle.","Partial radio outage."),B("Unité spécialisée indisponible.","Specialized unit unavailable.")],
 mistakes:()=>[B("Changer de priorité sans l'annoncer.","Changing priority without communicating it."),B("Utiliser toutes les ressources immédiatement.","Using all resources immediately.")],
 critical:()=>[B("Absence de coordination lors d'un événement majeur.","Lack of coordination during a major event.")],
 questions:()=>[[B("Pourquoi garder une réserve ?","Why keep a reserve?"),B("Pour répondre aux imprévus et éviter que tout le dispositif soit figé.","To respond to unexpected events and avoid committing the entire force.")]],
 corrective:()=>B("Faire un tabletop de 10 minutes avec ressources limitées et deux imprévus.","Run a 10-minute tabletop with limited resources and two unexpected events.")
},
M16:{
 duration:"60 min",prereq:["M15"],
 objective:()=>B("Développer une culture de leadership cohérente, éthique et durable.","Build a consistent, ethical, sustainable leadership culture."),
 steps:()=>[
  B("Définir les standards attendus d'un leader.","Define expected leadership standards."),
  B("Analyser une décision impopulaire mais nécessaire.","Analyze an unpopular but necessary decision."),
  B("Identifier comment développer de futurs leaders.","Identify how to develop future leaders."),
  B("Créer un plan personnel d'amélioration.","Create a personal improvement plan.")
 ],
 example:()=>B("Un excellent officier opérationnel crée des tensions. Le leader protège la performance sans tolérer le comportement nocif.","An excellent operational officer creates team tension. Leader protects performance without tolerating harmful behavior."),
 variants:()=>[B("Décision contestée publiquement.","Decision challenged publicly."),B("Erreur du leader lui-même.","Leader's own mistake.")],
 mistakes:()=>[B("Confondre autorité et leadership.","Confusing authority with leadership."),B("Éviter toute décision difficile.","Avoiding every difficult decision.")],
 critical:()=>[B("Favoritisme manifeste ou standard différent selon les personnes.","Clear favoritism or different standards for different people.")],
 questions:()=>[[B("Comment un leader gagne-t-il de la crédibilité ?","How does a leader earn credibility?"),B("Par cohérence, compétence, responsabilité, respect et décisions explicables.","Through consistency, competence, accountability, respect, and explainable decisions.")]],
 corrective:()=>B("Rédiger trois engagements concrets de leadership et les réévaluer plus tard.","Write three concrete leadership commitments and review them later.")
}
};


function linesFrom(value){return String(value||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);}
function questionsFromLines(value){return linesFrom(value).map(line=>{const p=line.split("||");return [String(p[0]||"").trim(),String(p.slice(1).join("||")||"").trim()];}).filter(x=>x[0]&&x[1]);}
async function loadAcademyOverrides(force=false){
  if(isVisitor())return;
  if(!force && window.LSPD.academyOverridesLoaded)return;
  try{
    const snap=await getDocs(collection(db,"academy_content"));
    window.LSPD.academyOverrides={};
    snap.docs.forEach(d=>window.LSPD.academyOverrides[d.id]={id:d.id,...d.data()});
    window.LSPD.academyOverridesLoaded=true;
  }catch(err){console.warn("Academy overrides",err);}
}
async function loadCustomAcademyScenarios(force=false){
  if(isVisitor())return;
  if(!force && window.LSPD.customScenariosLoaded)return;
  try{
    const snap=await getDocs(collection(db,"academy_scenarios"));
    window.LSPD.customAcademyScenarios=snap.docs.map(d=>({id:d.id,...d.data()}));
    window.LSPD.customScenariosLoaded=true;
  }catch(err){console.warn("Academy scenarios",err);}
}
function getAcademyData(code){
  const base=ACADEMY_MODULES[code]; if(!base)return null;
  const o=window.LSPD.academyOverrides?.[code];
  if(!o || o.enabled===false)return base;
  const pick=(fr,en,fallback)=> currentLang==="en" ? (en||fallback()) : (fr||fallback());
  const arr=(fr,en,fallback)=> currentLang==="en" ? ((en&&en.length)?en:fallback()) : ((fr&&fr.length)?fr:fallback());
  const qs=()=> currentLang==="en" ? ((o.questionsEn&&o.questionsEn.length)?o.questionsEn:base.questions()) : ((o.questionsFr&&o.questionsFr.length)?o.questionsFr:base.questions());
  return {
    duration:o.duration||base.duration,
    prereq:(o.prereq&&o.prereq.length)?o.prereq:base.prereq,
    objective:()=>pick(o.objectiveFr,o.objectiveEn,base.objective),
    steps:()=>arr(o.stepsFr,o.stepsEn,base.steps),
    example:()=>pick(o.exampleFr,o.exampleEn,base.example),
    variants:()=>arr(o.variantsFr,o.variantsEn,base.variants),
    mistakes:()=>arr(o.mistakesFr,o.mistakesEn,base.mistakes),
    critical:()=>arr(o.criticalFr,o.criticalEn,base.critical),
    questions:qs,
    corrective:()=>pick(o.correctiveFr,o.correctiveEn,base.corrective)
  };
}

const RADIO_EXAMPLES=[
 {bad:()=>B("« Euh dispatch je poursuis une voiture là, elle va vite, je sais pas trop où on est... »","“Uh dispatch I'm chasing a car, it's going fast, not really sure where we are...”"),good:()=>B("« Adam-12, poursuite active, nord Alta St, Sultan rouge, vitesse élevée, trafic modéré. »","“Adam-12, active pursuit, north Alta St, red Sultan, high speed, moderate traffic.”"),why:()=>B("Le bon message donne indicatif, action, direction, rue, véhicule et niveau de risque sans saturer la radio.","The good message gives call sign, action, direction, street, vehicle, and risk level without clogging radio.")},
 {bad:()=>B("« J'ai besoin de quelqu'un ici. »","“I need someone here.”"),good:()=>B("« Adam-12, renfort demandé Mission Row parking nord, individu agressif, mains visibles. »","“Adam-12, backup requested Mission Row north lot, aggressive subject, hands visible.”"),why:()=>B("Le renfort sait où aller et à quoi s'attendre.","Backup knows where to go and what to expect.")}
];

const REPORT_EXAMPLES=[
 {bad:()=>B("« Le suspect était bizarre et dangereux donc je l'ai arrêté. »","“The suspect was weird and dangerous so I arrested him.”"),good:()=>B("« À 22:14, j'ai observé l'individu frapper trois fois la vitrine avec une barre métallique. Après sommations, il a lâché l'objet et a été menotté sans résistance. »","“At 22:14, I observed the individual strike the storefront window three times with a metal bar. After commands, he dropped the item and was handcuffed without resistance.”"),why:()=>B("Le bon exemple décrit des faits observables, une chronologie et les actions de l'officier.","The good example describes observable facts, chronology, and officer actions.")}
];

const SCENARIO_BANK=[
 {module:"M04",difficulty:"Facile",situation:()=>B("Conducteur coopératif arrêté pour excès de vitesse.","Cooperative driver stopped for speeding."),constraints:()=>B("Un seul occupant, trafic faible, documents valides.","One occupant, light traffic, valid documents."),success:()=>B("Radio complète, positionnement sûr, explication claire, décision proportionnée.","Complete radio call, safe positioning, clear explanation, proportionate disposition.")},
 {module:"M04",difficulty:"Difficile",situation:()=>B("Conducteur nerveux, passager qui filme et coupe la parole.","Nervous driver, passenger filming and interrupting."),constraints:()=>B("Trafic dense, véhicule partiellement sur la chaussée.","Heavy traffic, vehicle partially in roadway."),success:()=>B("Maintenir sécurité, contrôler la communication et ne pas escalader inutilement.","Maintain safety, control communication, and avoid unnecessary escalation.")},
 {module:"M08",difficulty:"Normal",situation:()=>B("Refus d'obtempérer après stop routier, vitesse modérée.","Failure to stop after a traffic stop, moderate speed."),constraints:()=>B("Deux unités disponibles, météo claire.","Two units available, clear weather."),success:()=>B("Bonne radio, coordination primaire/secondaire, réévaluation régulière du risque.","Good radio, primary/secondary coordination, regular risk reassessment.")},
 {module:"M08",difficulty:"Stress test",situation:()=>B("Poursuite véhicule puis suspect abandonne la voiture et fuit à pied.","Vehicle pursuit followed by suspect bailing out and fleeing on foot."),constraints:()=>B("Perte de visuel 10 secondes, ruelles étroites, radio chargée.","10-second loss of visual, narrow alleys, busy radio."),success:()=>B("Ne pas paniquer, annoncer dernière position, coordonner périmètre, éviter tunnel vision.","Stay composed, broadcast last known position, coordinate perimeter, avoid tunnel vision.")},
 {module:"M11",difficulty:"Difficile",situation:()=>B("Appel pour individu armé dans un parking souterrain.","Call for an armed subject in an underground garage."),constraints:()=>B("Information non confirmée, civils possibles, visibilité faible.","Unconfirmed information, possible civilians, low visibility."),success:()=>B("Périmètre, ressources, briefing, approche méthodique et réévaluation.","Perimeter, resources, briefing, methodical approach, and reassessment.")},
 {module:"M12",difficulty:"Stress test",situation:()=>B("Accident majeur, foule, suspect recherché et informations contradictoires.","Major crash, crowd, wanted suspect, and conflicting information."),constraints:()=>B("Ressources limitées pendant trois minutes.","Limited resources for three minutes."),success:()=>B("Créer commandement clair, attribuer rôles, prioriser et demander confirmations.","Establish clear command, assign roles, prioritize, and request confirmations.")},
 {module:"M02",difficulty:"Facile",situation:()=>B("Série de cinq appels radio de patrouille simples.","Series of five simple patrol radio calls."),constraints:()=>B("Chaque appel doit durer moins de 10 secondes.","Each call must last under 10 seconds."),success:()=>B("Indicatif, localisation, situation et besoin si nécessaire.","Call sign, location, situation, and need if applicable.")},
 {module:"M10",difficulty:"Normal",situation:()=>B("Rédiger le rapport d'une arrestation après contrôle routier.","Write the report for an arrest following a traffic stop."),constraints:()=>B("Le rapport doit être chronologique et uniquement factuel.","Report must be chronological and factual only."),success:()=>B("Motif, observations, actions, arrestation, fouille, transport et résultat présents.","Reason, observations, actions, arrest, search, transport, and outcome included.")}
];

function buildModuleScenarioPool(moduleCode){
  const code=modules.some(m=>m[0]===moduleCode)?moduleCode:"M01";
  const d=getAcademyData(code);
  const explicit=SCENARIO_BANK.filter(s=>s.module===code);
  const custom=(window.LSPD.customAcademyScenarios||[]).filter(s=>s.moduleCode===code && s.status!=="Archivé").map(s=>({
    module:code,difficulty:s.difficulty||"Normal",
    situation:()=>currentLang==="en"?(s.situationEn||s.situationFr):(s.situationFr||s.situationEn),
    constraints:()=>currentLang==="en"?(s.constraintsEn||s.constraintsFr):(s.constraintsFr||s.constraintsEn),
    success:()=>currentLang==="en"?(s.successEn||s.successFr):(s.successFr||s.successEn)
  }));
  const generated=[];

  if(d){
    generated.push({
      module:code,
      difficulty:"Normal",
      situation:()=>d.example(),
      constraints:()=>B(
        `Le FTO laisse la recrue prendre le lead. Il n'intervient que si une erreur critique apparaît. ${d.variants()[0] ? "Variante : "+d.variants()[0] : ""}`,
        `The FTO lets the trainee take the lead and only intervenes if a critical error appears. ${d.variants()[0] ? "Variant: "+d.variants()[0] : ""}`
      ),
      success:()=>B(
        `La recrue doit atteindre l'objectif du module : ${d.objective()} Le FTO contrôle particulièrement les erreurs critiques.`,
        `The trainee must meet the module objective: ${d.objective()} The FTO pays special attention to critical errors.`
      )
    });

    d.variants().forEach((variant,index)=>{
      const difficulties=["Facile","Normal","Difficile","Stress test"];
      const difficulty=difficulties[index%difficulties.length];
      generated.push({
        module:code,
        difficulty,
        situation:()=>B(
          `${d.example()} Variante pédagogique : ${variant}`,
          `${d.example()} Training variant: ${variant}`
        ),
        constraints:()=>{
          const common=[
            B("La recrue doit verbaliser ses décisions importantes.","The trainee must verbalize important decisions."),
            B("Le FTO ajoute une information nouvelle au milieu de l'exercice.","The FTO adds new information halfway through the exercise."),
            B("La recrue doit gérer la situation avec une intervention minimale du FTO.","The trainee must manage the situation with minimal FTO intervention."),
            B("Le FTO augmente la pression : radio chargée, temps limité ou changement soudain de situation.","The FTO increases pressure: busy radio, limited time, or a sudden situation change.")
          ];
          return common[index%common.length];
        },
        success:()=>B(
          `Respecter la procédure du ${code}, éviter les erreurs critiques et être capable d'expliquer les choix effectués.`,
          `Follow ${code} procedure, avoid critical errors, and be able to explain the decisions made.`
        )
      });
    });

    d.questions().slice(0,2).forEach(([question,answer],index)=>{
      generated.push({
        module:code,
        difficulty:index===0?"Normal":"Difficile",
        situation:()=>B(
          `${d.example()} Après l'action principale, le FTO modifie un élément de la situation et demande : « ${question} »`,
          `${d.example()} After the main action, the FTO changes one element of the situation and asks: “${question}”`
        ),
        constraints:()=>B(
          "La recrue doit agir puis justifier immédiatement sa décision au FTO.",
          "The trainee must act and immediately justify the decision to the FTO."
        ),
        success:()=>B(
          `La réponse attendue est proche de : « ${answer} », tout en appliquant correctement la procédure du module.`,
          `The expected answer is close to: “${answer}”, while correctly applying the module procedure.`
        )
      });
    });
  }

  // Strict isolation: no scenario from another module can enter this pool.
  return [...explicit,...custom,...generated].filter(s=>s.module===code);
}

const CAD_STATUSES = ["Disponible","En intervention","Transport","Pause","Hors service"];
const BOLO_TYPES = ["Personne","Véhicule","Autre"];
const BOLO_PRIORITIES = ["Normal","Important","Critique"];


const caseCategories = ["Enquête","Intervention","Renseignement","Administration"];
const divisionInfo = [
  ["Patrol","Patrouille générale et réponse aux appels."],
  ["Traffic","Circulation, contrôles routiers et poursuites."],
  ["Detective","Enquêtes, preuves et dossiers criminels."],
  ["SWAT","Interventions tactiques à haut risque."],
  ["Air Support","Support aérien et coordination aérienne."],
  ["Training","Formation, FTO et développement des officiers."],
  ["Command","Commandement et supervision du département."]
];


const criteria = [
["procedure","Procédure","Respect des étapes et SOP"],
["security","Sécurité","Sécurité personnelle, partenaires et public"],
["radio","Communication radio","Clarté, concision et pertinence"],
["judgment","Jugement","Décision adaptée à la situation"],
["attitude","Professionnalisme","Comportement et attitude"],
["report","Compte rendu","Qualité du rapport et traçabilité"]
];

const scenarios = [
["S01","Contrôle routier","Contrôle d'un véhicule suspect","Sécurité, radio, approche, identification, décision, rapport"],
["S02","Arrestation","Suspect coopératif","Contrôle, menottage, fouille, droits, transport"],
["S03","Poursuite véhicule","Fuite après refus d'obtempérer","Radio, sécurité, coordination, décision"],
["S04","Poursuite à pied","Suspect prend la fuite","Communication, trajectoire, renfort, arrestation"],
["S05","Intervention à risque","Appel avec menace","Périmètre, briefing, désescalade, commandement"],
["S06","Scène de crime","Vol avec plusieurs témoins","Sécurisation, témoins, preuves, chronologie"],
["S07","Gestion de scène","Incident multi-unités","Commandement, rôles, briefing, compte rendu"],
["S08","Évaluation FTO","Patrouille complète","Évaluation globale en conditions réalistes"]
];

Object.assign(I18N_EN,{
  "Handbook nouveaux arrivants":"Newcomer Handbook",
  "Guide opérationnel de prise de poste":"Operational onboarding guide",
  "Démarrage rapide":"Quick start",
  "Référentiel 10-codes":"10-code reference",
  "Procédures essentielles":"Essential procedures",
  "Recherche dans le handbook...":"Search the handbook...",
  "Imprimer le handbook":"Print handbook",
  "Ouvrir le CAD":"Open CAD",
  "Ouvrir le MDT":"Open MDT",
  "Centre Formation":"Training Center",
  "Grades & responsabilités":"Ranks & responsibilities",
  "Menus par grade":"Menus by rank",
  "Ajouter un officier":"Add an officer",
  "Ouverture recrutements":"Recruitment opening",
  "Ouvrir / fermer les candidatures LSPD":"Open / close LSPD applications",
  "Candidatures LSPD":"LSPD applications",
  "Ouvrir les candidatures":"Open applications",
  "Fermer les candidatures":"Close applications",
  "Adresse e-mail LSPD générée automatiquement":"Automatically generated LSPD email"
});

const pages = {
 dashboard:"Dashboard",profile:"Mon profil",mySpace:"Mon espace opérationnel",registrations:"Inscriptions",notifications:"Notifications",announcements:"Annonces",messages:"Messages",
 incidents:"Rapports d'incident",approvals:"Validations",mdt:"MDT / Dossiers",bolos:"BOLO / Avis",corrections:"Corrections & addenda",manual:"Manuel FTO",ftoAcademy:"FTO Academy",ftoJournal:"Journal FTO",ftoFinal:"Évaluation finale FTO",modules:"Formations",
 evaluations:"Évaluations",trainees:"Mes recrues",officers:"Officiers",assignments:"Affectations FTO",
 certifications:"Certifications",records:"Dossiers & distinctions",shifts:"Roster & shifts",dutyBoard:"Tableau de service",cad:"CAD / Dispatch",watchCommand:"Watch Commander",leave:"Congés",
 calendar:"Calendrier formations",trainingHub:"Inscriptions formations",requirements:"À valider",promotionAdvisor:"Promotion advisor",
 promotions:"Promotions",stats:"Statistiques",divisionsPage:"Divisions & candidatures",grades:"Grades & responsabilités",
 scenarios:"Scénarios",visitorPortal:"Portail visiteur",applicationPortal:"Ma candidature LSPD",handbook:"Handbook nouveaux arrivants",trainingCenter:"Centre Formation",trainingWorkspace:"Espace recrue FTO",ftoDossier:"Dossier FTO recrue",trainingAnalytics:"Stats formation",academyManager:"Gestion Academy",trainingQuiz:"Quiz formations",myTrainingFeedback:"Feedback formation",admin:"Admin",permissionsAdmin:"Permissions",navigationAdmin:"Menus par grade",recruitmentControl:"Ouverture recrutements",history:"Historique"
};

const NAV_GROUP_LABELS = {
  main:"Accueil & personnel",
  communication:"Communication & rapports",
  training:"Formation & FTO",
  personnel:"Personnel & carrière",
  operations:"Opérations & MDT",
  administration:"Commandement & administration"
};
const NAV_PAGE_GROUP = {
  dashboard:"main",profile:"main",mySpace:"main",visitorPortal:"main",applicationPortal:"main",
  announcements:"communication",messages:"communication",incidents:"communication",approvals:"communication",corrections:"communication",
  handbook:"training",trainingCenter:"training",evaluations:"training",academyManager:"training",trainingWorkspace:"training",ftoAcademy:"training",ftoJournal:"training",ftoFinal:"training",ftoDossier:"training",trainingAnalytics:"training",trainingQuiz:"training",myTrainingFeedback:"training",modules:"training",assignments:"training",calendar:"training",trainingHub:"training",scenarios:"training",manual:"training",
  officers:"personnel",certifications:"personnel",records:"personnel",leave:"personnel",requirements:"personnel",promotionAdvisor:"personnel",promotions:"personnel",divisionsPage:"personnel",grades:"personnel",trainees:"training",
  shifts:"operations",dutyBoard:"operations",cad:"operations",watchCommand:"operations",bolos:"operations",mdt:"operations",
  registrations:"administration",recruitmentControl:"administration",stats:"administration",admin:"administration",permissionsAdmin:"administration",navigationAdmin:"administration",history:"administration"
};
function navigationGradeList(){ return gradeList.filter(g=>g[0]!=="Visiteur").map(g=>g[0]); }
function canonicalizeGradeArray(values=[]){ return [...new Set((Array.isArray(values)?values:[]).map(canonicalGrade).filter(g=>gradeList.some(x=>x[0]===g)))]; }
function defaultNavigationConfig(){
  const all=navigationGradeList();
  return {groups:Object.fromEntries(Object.keys(NAV_GROUP_LABELS).map(k=>[k,[...all]])),catalogVersion:2};
}
function isNavGroupAllowed(group){
  if(!group || isChief()) return true;
  const allowed=window.LSPD.navigationConfig?.groups?.[group];
  if(!Array.isArray(allowed)) return true;
  return canonicalizeGradeArray(allowed).includes(canonicalGrade(window.LSPD.profile?.grade));
}
function isPageCategoryAllowed(page){
  if(page==="profile") return true;
  return isNavGroupAllowed(NAV_PAGE_GROUP[page]);
}

function role(){ return window.LSPD.profile?.role; }
function currentGrade(){ return canonicalGrade(window.LSPD.profile?.grade); }
function isChief(){ return currentGrade()==="Chief of Police"; }
function isVisitor(){ return role()==="Visiteur" || currentGrade()==="Visiteur"; }
function isApplicant(){ return role()==="Applicant"; }
function isInactive(){ return window.LSPD.profile?.status==="Inactif"; }
function isSuspended(){ return window.LSPD.profile?.status==="Suspendu"; }
function isInternal(){ return !!window.LSPD.profile && !isVisitor() && !isApplicant() && !isInactive() && !isSuspended(); }
function isFTO(){ return hasPerm("fto_tools"); }
function isCommand(){ return hasPerm("incident_review"); }
function canApproveIncidents(){ return hasPerm("incident_review"); }
function isSeniorCommand(){ return hasPerm("incident_review"); }

// Kept as a compatibility alias for older phase code. Permissions are now resolved by grade.
function permissionRoles(){ return window.LSPD.permissionConfig?.grades || DEFAULT_GRADE_PERMISSIONS; }
function permissionGrades(){ return permissionRoles(); }
function hasPerm(permission){
  if(!isInternal()) return false;
  // Chief bypass is absolute. Navigation visibility or an incomplete migrated matrix
  // can never remove a Chief of Police permission.
  if(isChief()) return true;
  const grade=currentGrade();
  const list=permissionGrades()[grade] || DEFAULT_GRADE_PERMISSIONS[grade] || [];
  return permissionMinimumAllows(permission,grade) && Array.isArray(list) && list.includes(permission);
}
function hasAnyPerm(...permissions){ return permissions.some(p=>hasPerm(p)); }
function canAccessRegistrations(){ return hasAnyPerm("registrations_manage","registrations_approve","registrations_reject"); }
function canAccessRecruitmentDesk(){ return hasAnyPerm("recruitment_view","recruitment_screening","recruitment_interview_schedule","recruitment_interview_evaluate","recruitment_command_decision","recruitment_incorporate"); }
function canAccessOfficerDirectory(){ return hasAnyPerm("personnel_view","personnel_manage","personnel_grade_manage","personnel_status_manage","personnel_create","personnel_delete","provisional_credentials_view"); }
function canAccessMdtCases(){ return hasAnyPerm("mdt_manage","mdt_case_create","mdt_case_close"); }
function canAccessPage(page){
  if(isApplicant()) return page==="applicationPortal";
  if(isVisitor()) return ["visitorPortal","profile","announcements"].includes(page);
  if(isInactive()) return ["profile","handbook","announcements"].includes(page);
  if(page==="applicationPortal") return false;
  if(isChief()) return true;
  if(!isPageCategoryAllowed(page)) return false;
  if(page==="registrations") return canAccessRegistrations();
  if(page==="officers") return canAccessOfficerDirectory();
  if(page==="assignments") return hasPerm("fto_assignments_view") || canManageFtoAssignments();
  if(page==="certifications") return hasAnyPerm("certifications_view","certifications_manage");
  if(page==="records") return hasAnyPerm("records_view","records_manage");
  if(page==="shifts") return hasAnyPerm("shifts_view","shifts_manage");
  if(page==="promotions") return hasAnyPerm("promotions_view","promotions_manage");
  if(page==="messages") return hasPerm("messages_access");
  if(page==="incidents") return hasAnyPerm("incident_create","incident_view_all","incident_review","incident_export");
  if(page==="corrections") return hasPerm("corrections_create") || hasPerm("corrections_review");
  if(page==="trainingCenter" || page==="trainingHub" || page==="calendar") return hasPerm("training_access") || hasPerm("training_manage") || hasPerm("training_invites_manage") || hasPerm("training_attendance_manage");
  if(page==="leave") return hasPerm("leave_request_create") || hasPerm("leave_review");
  if(page==="cad") return hasPerm("cad_access") || hasPerm("cad_manage");
  if(page==="bolos") return hasPerm("bolo_view") || hasPerm("bolo_manage");
  if(page==="watchCommand") return hasPerm("watch_view") || hasPerm("watch_manage");
  if(page==="trainingWorkspace") return hasPerm("academy_manage") || hasPerm("fto_tools");
  if(page==="ftoJournal") return hasAnyPerm("academy_manage","fto_sessions_manage","fto_objectives_manage");
  if(page==="ftoFinal") return hasPerm("academy_manage") || hasPerm("academy_final_review");
  if(page==="trainingQuiz" || page==="myTrainingFeedback") return hasPerm("training_access");
  if(page==="visitorPortal") return false;
  if(page==="permissionsAdmin" || page==="navigationAdmin" || page==="admin") return isChief();
  if(page==="mdt") return canAccessMdtCases() || canAccessRecruitmentDesk();
  const needed=PAGE_PERMISSIONS[page];
  return needed ? hasPerm(needed) : true;
}
const PHASE17_PERMISSION_DEFAULTS={
  Visiteur:[],
  FTO:["academy_content_manage"],
  Sergeant:["academy_content_manage","academy_final_review"],
  Lieutenant:["academy_content_manage","academy_final_review"],
  Captain:["academy_content_manage","academy_final_review"],
  "Deputy Chief":["academy_content_manage","academy_final_review"],
  "Assistant Chief":["academy_content_manage","academy_final_review"]
};

async function migrateLegacyOfficerGrades(){
  if(!isChief()) return 0;
  try{
    const snap=await getDocs(query(collection(db,"users"),where("role","!=","Visiteur")));
    let changed=0;
    for(const d of snap.docs){
      const raw=d.data().grade;
      const canonical=LEGACY_GRADE_ALIASES[raw];
      if(!canonical) continue;
      await updateDoc(doc(db,"users",d.id),{grade:canonical,updatedAt:serverTimestamp()});
      changed++;
    }
    if(changed){
      await addAudit("LEGACY_GRADES_MIGRATED","users",`${changed} ancien(s) grade(s) normalisé(s)`);
      if(LEGACY_GRADE_ALIASES[window.LSPD.profile?.grade]) window.LSPD.profile.grade=canonicalGrade(window.LSPD.profile.grade);
    }
    return changed;
  }catch(err){
    console.warn("Legacy grade migration skipped",err);
    return 0;
  }
}
async function loadNavigationConfig(){
  if(!isInternal()){ window.LSPD.navigationConfig=defaultNavigationConfig(); return; }
  try{
    const ref=doc(db,"settings","navigation_visibility"),snap=await getDoc(ref);
    if(snap.exists() && snap.data()?.groups){
      const raw=snap.data();
      const groups={};
      for(const key of Object.keys(NAV_GROUP_LABELS)) groups[key]=canonicalizeGradeArray(raw.groups?.[key]||navigationGradeList());
      window.LSPD.navigationConfig={...raw,groups,catalogVersion:2};
      if(isChief() && (raw.catalogVersion||0)<2) await setDoc(ref,{...window.LSPD.navigationConfig,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()});
      return;
    }
    window.LSPD.navigationConfig=defaultNavigationConfig();
    if(isChief()) await setDoc(ref,{...window.LSPD.navigationConfig,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()});
  }catch(err){
    console.warn("Navigation visibility config unavailable",err);
    window.LSPD.navigationConfig=defaultNavigationConfig();
  }
}

async function loadPermissionsConfig(){
  if(isVisitor() || isApplicant() || isInactive()){
    window.LSPD.permissionConfig={grades:{Visiteur:[]},catalogVersion:22};
    return;
  }
  try{
    const ref=doc(db,"settings","permissions");
    const snap=await getDoc(ref);
    let gradesMap=JSON.parse(JSON.stringify(DEFAULT_GRADE_PERMISSIONS));
    let migrated=false;
    let oldVersion=0;
    if(snap.exists()){
      const cfg=snap.data();oldVersion=Number(cfg.catalogVersion||0);
      if(cfg?.grades){
        gradesMap={};
        const legacyMigration=oldVersion<22;
        for(const [grade] of gradeList){
          gradesMap[grade]=expandPermissionSet(Array.isArray(cfg.grades[grade])?[...cfg.grades[grade]]:[],grade,{legacy:legacyMigration,assignmentDefault:legacyMigration});
        }
        for(const [legacyGrade,canonical] of Object.entries(LEGACY_GRADE_ALIASES)){
          if(Array.isArray(cfg.grades[legacyGrade])){
            gradesMap[canonical]=expandPermissionSet([...(gradesMap[canonical]||[]),...cfg.grades[legacyGrade]],canonical,{legacy:true,assignmentDefault:true});
            migrated=true;
          }
        }
      }else if(cfg?.roles){
        gradesMap=buildGradePermissionsFromRoleConfig(cfg.roles);migrated=true;
      }else migrated=true;
      if(oldVersion<22)migrated=true;
    }else migrated=true;
    // New self-service permissions introduced in v22 are granted once during migration.
    // After v22 is saved, the Chief can remove them and they stay removed.
    if(oldVersion<22){
      for(const [grade] of gradeList){
        gradesMap[grade]=[...new Set([...(gradesMap[grade]||[]),...migrationDefaultsForGrade(grade)])];
      }
    }
    // From v22 onward, do not silently re-add a permission the Chief unchecked.
    for(const [grade] of gradeList) gradesMap[grade]=expandPermissionSet(gradesMap[grade]||[],grade);
    gradesMap.Visiteur=[];
    gradesMap["Chief of Police"]=PERMISSION_CATALOG.map(x=>x[0]);
    window.LSPD.permissionConfig={grades:gradesMap,catalogVersion:22};
    if(isChief() && migrated){
      await setDoc(ref,{grades:gradesMap,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp(),catalogVersion:22});
    }
  }catch(err){
    console.warn("Permission configuration fallback",err);
    const fallback=JSON.parse(JSON.stringify(DEFAULT_GRADE_PERMISSIONS));
    fallback["Chief of Police"]=PERMISSION_CATALOG.map(x=>x[0]);
    window.LSPD.permissionConfig={grades:fallback,catalogVersion:22};
  }
}

function showForcedPasswordChange(){
  $("loginScreen")?.classList.add("hidden");
  $("approvalScreen")?.classList.add("hidden");
  $("appShell")?.classList.add("hidden");
  $("passwordChangeScreen")?.classList.remove("hidden");
  if($("passwordChangeIdentity")){
    $("passwordChangeIdentity").innerHTML=`<b>${esc(window.LSPD.profile?.name||"Utilisateur")}</b><span>${esc(window.LSPD.user?.email||window.LSPD.profile?.registeredEmail||"")}</span><span>${esc(window.LSPD.profile?.grade||"—")} • ${esc(window.LSPD.profile?.badge||"—")}</span>`;
  }
  if($("passwordChangeError"))$("passwordChangeError").textContent="";
}

async function handleImportedPasswordChange(e){
  e.preventDefault();
  const p1=$("newImportedPassword")?.value||"",p2=$("newImportedPassword2")?.value||"";
  const error=$("passwordChangeError");
  if(error)error.textContent="";
  if(p1.length<8){if(error)error.textContent="Le mot de passe doit contenir au moins 8 caractères.";return;}
  if(p1!==p2){if(error)error.textContent="Les mots de passe ne correspondent pas.";return;}
  try{
    await updatePassword(auth.currentUser,p1);
    await updateDoc(doc(db,"users",auth.currentUser.uid),{
      mustChangePassword:false,
      passwordChangedAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    // The temporary code is no longer readable once mustChangePassword=false.
    // Remove the separate protected credential document as cleanup.
    try{await deleteDoc(doc(db,"provisional_credentials",auth.currentUser.uid));}catch(cleanupErr){console.warn("Temporary credential cleanup",cleanupErr);}
    if(window.LSPD.profile)window.LSPD.profile.mustChangePassword=false;
    $("newImportedPassword").value="";$("newImportedPassword2").value="";
    showToast("Mot de passe enregistré.","success");
    await loadProfile(auth.currentUser);
  }catch(err){
    console.error("Imported account activation failed",err);
    if(error){
      if(err.code==="auth/requires-recent-login") error.textContent="Reconnecte-toi puis réessaie.";
      else if(err.code==="permission-denied" || err.code==="firestore/permission-denied") error.textContent="Le mot de passe Firebase a pu être modifié, mais l’activation du profil a été refusée par Firestore. Publie les règles 17.11.6 puis reconnecte-toi avec le NOUVEAU mot de passe et valide à nouveau.";
      else error.textContent="Erreur : "+(err.code||err.message);
    }
  }
}

async function loadProfile(user){
  window.LSPD.user=user;
  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    if(!snap.exists()){
      window.LSPD.profile={name:"Profil incomplet",badge:"—",grade:"Rookie",role:"Officer",status:"Profil manquant"};
      showApprovalGate("Profil incomplet","Ton compte Authentication existe, mais aucun profil LSPD valide n'est associé. Contacte le Chief of Police.");
      return;
    }
    window.LSPD.profile={...snap.data(),grade:canonicalGrade(snap.data().grade)};
  }catch(e){
    window.LSPD.profile={name:"Erreur profil",badge:"—",grade:"—",role:"Officer",status:"Erreur Firestore"};
    showApprovalGate("Erreur de profil","Impossible de charger ton profil LSPD. Réessaie ou contacte le commandement.");
    return;
  }

  if(window.LSPD.profile.status==="En attente"){
    showApprovalGate(
      "Inscription en attente",
      "Ta demande a bien été enregistrée. Le Chief of Police doit maintenant valider ton matricule, ton grade, ton rôle et ta division."
    );
    return;
  }

  if(window.LSPD.profile.status==="Refusé"){
    showApprovalGate(
      "Inscription refusée",
      "Ta demande d'inscription n'a pas été validée. Contacte le commandement LSPD si tu penses qu'il s'agit d'une erreur."
    );
    return;
  }

  if(window.LSPD.profile.status==="Archivé"){
    showApprovalGate(
      "Compte archivé",
      "Ton profil LSPD est archivé et l'accès au Command Center est désactivé."
    );
    return;
  }

  if(window.LSPD.profile.status==="Suspendu"){
    showApprovalGate(
      "Accès suspendu",
      "Ton accès aux systèmes internes du LSPD est suspendu. Contacte le Command Staff pour toute information."
    );
    return;
  }

  if(window.LSPD.profile.mustChangePassword===true){
    showForcedPasswordChange();
    return;
  }

  await loadPermissionsConfig();
  if(isChief()) await migrateLegacyOfficerGrades();
  await loadNavigationConfig();
  showApp();
  applyRoleVisibility();
  if(isInternal()){
    startNotificationListener();
    if(hasPerm("messages_access")) startMailListener();
    refreshNotificationBadge().catch(()=>{});
    if(hasPerm("messages_access")) refreshMailBadge().catch(()=>{});
    refreshRegistrationBadge().catch(()=>{});
    refreshRecruitmentBadge().catch(()=>{});
    generateUpcomingReminders().catch(()=>{});
    if(hasPerm("academy_manage")) generateTrainingAlerts().catch(()=>{});
  }else{
    $("notificationBellWrap")?.classList.add("hidden");
    $("notificationCount")?.classList.add("hidden");
    $("mailUnreadCount")?.classList.add("hidden");
    $("registrationCount")?.classList.add("hidden");
    $("recruitmentCount")?.classList.add("hidden");
  }
  render(isApplicant()?"applicationPortal":isVisitor()?"visitorPortal":isInactive()?"profile":"dashboard");
}
function showApp(){
  $("loginScreen")?.classList.add("hidden");
  $("approvalScreen")?.classList.add("hidden");
  $("passwordChangeScreen")?.classList.add("hidden");
  $("appShell")?.classList.remove("hidden");
  if($("currentUser")) $("currentUser").textContent=window.LSPD.user?.email||"Connecté";
  if($("userPill")) $("userPill").textContent=`${window.LSPD.profile?.grade||"Officer"} • ${window.LSPD.profile?.role||"Officer"}`;
  $("globalSearch")?.classList.toggle("hidden",isVisitor()||isApplicant()||isInactive()||(!isNavGroupAllowed("communication")&&!isNavGroupAllowed("training")&&!isNavGroupAllowed("personnel")&&!isNavGroupAllowed("operations")));
}
function showLogin(){
  $("approvalScreen")?.classList.add("hidden");
  $("passwordChangeScreen")?.classList.add("hidden");
  $("loginScreen")?.classList.remove("hidden");
  $("appShell")?.classList.add("hidden");
}
function showApprovalGate(title,message){
  $("loginScreen")?.classList.add("hidden");
  $("passwordChangeScreen")?.classList.add("hidden");
  $("appShell")?.classList.add("hidden");
  $("approvalScreen")?.classList.remove("hidden");
  if($("approvalTitle")) $("approvalTitle").textContent=title;
  if($("approvalMessage")) $("approvalMessage").textContent=message;
  if($("approvalIdentity")){
    $("approvalIdentity").innerHTML=`<b>${esc(window.LSPD.profile?.name||"Utilisateur")}</b><span>${esc(window.LSPD.user?.email||"")}</span><span>Statut : ${esc(window.LSPD.profile?.status||"—")}</span>`;
  }
}
async function handleLogin(e){
  e.preventDefault(); $("loginError").textContent="";
  try{ await signInWithEmailAndPassword(auth,$("loginEmail").value.trim(),$("loginPassword").value); }
  catch(err){ $("loginError").textContent="Email ou mot de passe incorrect."; }
}

function toggleAuthMode(mode){
  const login=mode==="login",signup=mode==="signup",apply=mode==="apply";
  $("loginForm")?.classList.toggle("hidden",!login);
  $("signupForm")?.classList.toggle("hidden",!signup);
  $("applicationForm")?.classList.toggle("hidden",!apply);
  $("showLoginBtn")?.classList.toggle("active",login);
  $("showSignupBtn")?.classList.toggle("active",signup);
  $("showApplicationBtn")?.classList.toggle("active",apply);
  document.querySelector(".login-card")?.classList.toggle("application-mode",apply);
  if(apply)setRecruitmentPublicStep(1);
  if($("loginError")) $("loginError").textContent="";
  if($("signupError")) $("signupError").textContent="";
  if($("applicationError")) $("applicationError").textContent="";
}

async function handleSignup(e){
  e.preventDefault();
  $("signupError").textContent="";

  const name=$("signupName").value.trim();
  const email=$("signupEmail").value.trim().toLowerCase();
  const password=$("signupPassword").value;
  const password2=$("signupPassword2").value;

  if(name.length<3){
    $("signupError").textContent="Entre un nom RP valide.";
    return;
  }
  if(password!==password2){
    $("signupError").textContent="Les mots de passe ne correspondent pas.";
    return;
  }

  try{
    const credential=await createUserWithEmailAndPassword(auth,email,password);
    const uid=credential.user.uid;

    await setDoc(doc(db,"users",uid),{
      name,
      badge:"—",
      grade:"PO1",
      role:"Officer",
      status:"En attente",
      division:"Patrol",
      registeredEmail:email,
      selfRegistered:true,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    window.LSPD.user=credential.user;
    window.LSPD.profile={
      name,badge:"—",grade:"PO1",role:"Officer",
      status:"En attente",division:"Patrol",
      registeredEmail:email,selfRegistered:true
    };

    showApprovalGate(
      "Inscription enregistrée",
      "Ton compte a été créé automatiquement. Tu n'as rien d'autre à faire : attends simplement la validation du Chief of Police."
    );
  }catch(err){
    const code=err.code||"";
    if(code==="auth/email-already-in-use") $("signupError").textContent="Cette adresse e-mail possède déjà un compte.";
    else if(code==="auth/weak-password") $("signupError").textContent="Le mot de passe doit contenir au moins 6 caractères.";
    else if(code==="auth/invalid-email") $("signupError").textContent="Adresse e-mail invalide.";
    else $("signupError").textContent="Erreur d'inscription : "+(err.message||code);
  }
}
let recruitmentPublicStep=1;
function setRecruitmentPublicStep(step){
  recruitmentPublicStep=Math.max(1,Math.min(4,Number(step)||1));
  document.querySelectorAll("[data-application-step]").forEach(s=>s.classList.toggle("active",Number(s.dataset.applicationStep)===recruitmentPublicStep));
  document.querySelectorAll("[data-app-step-indicator]").forEach(ind=>{
    const n=Number(ind.dataset.appStepIndicator);
    ind.classList.toggle("active",n===recruitmentPublicStep);
    ind.classList.toggle("done",n<recruitmentPublicStep);
  });
  const back=$("applicationBackBtn"),next=$("applicationNextBtn"),submit=$("applicationSubmitBtn"),hint=$("applicationStepHint");
  back?.classList.toggle("hidden",recruitmentPublicStep===1);
  next?.classList.toggle("hidden",recruitmentPublicStep===4);
  submit?.classList.toggle("hidden",recruitmentPublicStep!==4);
  if(hint)hint.textContent=["Présentation du candidat","Motivation & expérience","Jugement & mise en situation","Engagement & envoi"][recruitmentPublicStep-1];
  if($("applicationError"))$("applicationError").textContent="";
  document.querySelector(".login-card")?.scrollTo?.({top:0,behavior:"smooth"});
}
function validateRecruitmentPublicStep(step){
  const section=document.querySelector(`[data-application-step="${step}"]`);if(!section)return true;
  const fields=[...section.querySelectorAll("input,textarea,select")];
  for(const f of fields){
    if(!f.checkValidity()){f.reportValidity();return false;}
  }
  if(step===3 && $("applicationCriminalRecord")?.value==="Oui" && !$("applicationCriminalRecordDetails")?.value.trim()){
    $("applicationError").textContent="Précise la situation de ton casier judiciaire RP.";return false;
  }
  return true;
}
function catenaEmailFromRpName(name){
  const local=String(name||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,".")
    .replace(/^\.+|\.+$/g,"")
    .replace(/\.{2,}/g,".");
  return local?`${local}@catena.ma`:"";
}
function syncApplicationEmailFromName(){
  const email=catenaEmailFromRpName($("applicationName")?.value);
  if($("applicationEmail")) $("applicationEmail").value=email;
}
function setPublicRecruitmentUi(isOpen){
  window.LSPD.recruitmentOpen=isOpen!==false;
  $("showApplicationBtn")?.classList.toggle("hidden",!window.LSPD.recruitmentOpen);
  $("recruitmentClosedNotice")?.classList.toggle("hidden",window.LSPD.recruitmentOpen);
  if(!window.LSPD.recruitmentOpen && $("applicationForm") && !$("applicationForm").classList.contains("hidden")) toggleAuthMode("login");
}
function startPublicRecruitmentAvailabilityWatch(){
  try{
    window.LSPD.recruitmentPublicUnsub?.();
    window.LSPD.recruitmentPublicUnsub=onSnapshot(doc(db,"public_settings","recruitment"),snap=>{
      setPublicRecruitmentUi(!snap.exists() || snap.data()?.open!==false);
    },err=>{console.warn("Recruitment public status unavailable",err);setPublicRecruitmentUi(true);});
  }catch(err){console.warn(err);setPublicRecruitmentUi(true);}
}
async function recruitmentApplicationsAreOpen(){
  try{const snap=await getDoc(doc(db,"public_settings","recruitment"));return !snap.exists() || snap.data()?.open!==false;}catch{return true;}
}
async function getRecruitmentSettings(){
  try{const snap=await getDoc(doc(db,"public_settings","recruitment"));return snap.exists()?{open:snap.data()?.open!==false,...snap.data()}:{open:true};}
  catch{return {open:true};}
}
async function saveRecruitmentOpenState(open){
  if(!hasPerm("recruitment_settings_manage")) return;
  try{
    await setDoc(doc(db,"public_settings","recruitment"),{open:!!open,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()});
    await addAudit(open?"RECRUITMENT_OPENED":"RECRUITMENT_CLOSED","public_settings/recruitment",open?"Candidatures LSPD ouvertes":"Candidatures LSPD fermées");
    setPublicRecruitmentUi(!!open);
    showToast(open?"Les candidatures LSPD sont ouvertes.":"Les candidatures LSPD sont fermées.","success");
  }catch(err){showToast("Erreur : "+(err.code||err.message),"error");throw err;}
}
function initRecruitmentPublicWizard(){
  $("applicationNextBtn")?.addEventListener("click",()=>{if(validateRecruitmentPublicStep(recruitmentPublicStep))setRecruitmentPublicStep(recruitmentPublicStep+1);});
  $("applicationBackBtn")?.addEventListener("click",()=>setRecruitmentPublicStep(recruitmentPublicStep-1));
  $("applicationName")?.addEventListener("input",syncApplicationEmailFromName);
  syncApplicationEmailFromName();
  setRecruitmentPublicStep(1);
}

function recruitmentApplicationNumber(){
  const y=new Date().getFullYear();
  return `APP-${y}-${String(Date.now()).slice(-6)}`;
}

async function handleRecruitmentApplication(e){
  e.preventDefault();
  const error=$("applicationError");if(error)error.textContent="";
  if(!validateRecruitmentPublicStep(4))return;
  const name=$("applicationName").value.trim();
  syncApplicationEmailFromName();
  const email=catenaEmailFromRpName(name);
  const password=$("applicationPassword").value,password2=$("applicationPassword2").value;
  const age=Number($("applicationAge").value);
  if(name.length<3)return error.textContent="Entre un nom RP valide.";
  if(!email)return error.textContent="Impossible de générer une adresse e-mail depuis ce nom RP.";
  if(!(await recruitmentApplicationsAreOpen()))return error.textContent="Les candidatures LSPD sont actuellement fermées.";
  if(!Number.isFinite(age)||age<18||age>80)return error.textContent="L'âge RP doit être compris entre 18 et 80 ans.";
  if(password!==password2)return error.textContent="Les mots de passe ne correspondent pas.";
  if(password.length<8)return error.textContent="Le mot de passe doit contenir au moins 8 caractères.";
  if(!$("applicationConsentInterview").checked||!$("applicationConsentRules").checked||!$("applicationConsentRoleplay").checked)return error.textContent="Tu dois accepter les engagements du dossier.";

  const submit=$("applicationSubmitBtn");if(submit){submit.disabled=true;submit.textContent="Envoi du dossier...";}
  try{
    const credential=await createUserWithEmailAndPassword(auth,email,password);
    const uid=credential.user.uid,applicationNumber=recruitmentApplicationNumber();
    await setDoc(doc(db,"users",uid),{
      name,badge:"—",grade:"Candidat",role:"Applicant",status:"Candidature",division:"Recruitment",
      registeredEmail:email,selfRegistered:true,recruitmentApplicant:true,
      createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
    await setDoc(doc(db,"lspd_applications",uid),{
      applicationNumber,applicationVersion:2,applicantId:uid,applicantName:name,email,
      ageRP:age,phoneRP:$("applicationPhone").value.trim(),discord:$("applicationDiscord").value.trim(),
      presentation:$("applicationPresentation").value.trim(),background:$("applicationBackground").value.trim(),
      availability:$("applicationAvailability").value,scheduleDetails:$("applicationScheduleDetails").value.trim(),
      drivingLicense:$("applicationDriving").value,policeExperience:$("applicationPoliceExperience").value,
      whyLspd:$("applicationWhy").value.trim(),contribution:$("applicationContribution").value.trim(),
      experience:$("applicationExperience").value.trim(),strengths:$("applicationStrengths").value.trim(),weakness:$("applicationWeakness").value.trim(),
      criminalRecord:$("applicationCriminalRecord").value,criminalRecordDetails:$("applicationCriminalRecordDetails").value.trim(),
      citizenScenario:$("applicationCitizenScenario").value.trim(),colleagueScenario:$("applicationColleagueScenario").value.trim(),teamScenario:$("applicationTeamScenario").value.trim(),
      commitments:{interview:true,rules:true,roleplay:true},
      status:"Dossier reçu",interviewStatus:"À planifier",publicMessage:"Ton dossier a bien été reçu par le Bureau du recrutement.",
      createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
    await loadProfile(credential.user);
  }catch(err){
    const code=err.code||"";
    if(code==="auth/email-already-in-use")error.textContent="Cette adresse e-mail possède déjà un compte.";
    else if(code==="auth/invalid-email")error.textContent="Adresse e-mail invalide.";
    else if(code==="auth/weak-password")error.textContent="Mot de passe trop faible.";
    else error.textContent="Erreur : "+(err.message||code);
    if(submit){submit.disabled=false;submit.textContent="Envoyer officiellement ma candidature";}
  }
}

onAuthStateChanged(auth,async user=>{
  if(!user){window.LSPD.pageCleanup?.();window.LSPD.notificationUnsub?.();window.LSPD.mailUnsub?.();window.LSPD.pageCleanup=null;window.LSPD.notificationUnsub=null;window.LSPD.mailUnsub=null;window.LSPD.user=null;window.LSPD.profile=null;window.LSPD.permissionConfig=null;window.LSPD.navigationConfig=null;closeNotificationDropdown();closeMailWindow();showLogin();return;}
  await loadProfile(user);
});
function logout(){ return signOut(auth); }


function navGroupState(){
  try{return JSON.parse(localStorage.getItem("lspdNavGroups")||"{}");}catch{return {};}
}
function saveNavGroupState(){
  const state={};
  document.querySelectorAll("#nav .nav-group").forEach(group=>{
    state[group.dataset.navGroup]=group.classList.contains("collapsed");
  });
  localStorage.setItem("lspdNavGroups",JSON.stringify(state));
}
function setNavGroupCollapsed(group,collapsed,persist=true){
  if(!group)return;
  group.classList.toggle("collapsed",collapsed);
  const toggle=group.querySelector(".nav-group-toggle");
  toggle?.setAttribute("aria-expanded",collapsed?"false":"true");
  if(persist)saveNavGroupState();
}
function refreshNavGroups(){
  const state=navGroupState();
  document.querySelectorAll("#nav .nav-group").forEach(group=>{
    const visibleButtons=[...group.querySelectorAll("button[data-page]")].filter(btn=>!btn.classList.contains("hidden"));
    group.classList.toggle("hidden",visibleButtons.length===0);
    if(visibleButtons.length){
      const active=visibleButtons.some(btn=>btn.classList.contains("active"));
      const collapsed=active?false:Boolean(state[group.dataset.navGroup]);
      setNavGroupCollapsed(group,collapsed,false);
    }
  });
}
function ensureActiveNavGroup(page){
  const btn=document.querySelector(`#nav button[data-page="${page}"]`);
  const group=btn?.closest(".nav-group");
  if(group)setNavGroupCollapsed(group,false,false);
}
function initNavGroups(){
  document.querySelectorAll("#nav .nav-group-toggle").forEach(toggle=>{
    toggle.addEventListener("click",()=>{
      const group=toggle.closest(".nav-group");
      setNavGroupCollapsed(group,!group.classList.contains("collapsed"),true);
    });
  });
  refreshNavGroups();
}

function applyRoleVisibility(){
  document.querySelectorAll("#nav button[data-page]").forEach(btn=>{
    btn.classList.toggle("hidden",!canAccessPage(btn.dataset.page));
  });
  refreshNavGroups();
}

function render(page){
  closeNotificationDropdown();
  closeMailWindow();
  if(!canAccessPage(page)){
    showToast("Cette fonction n'est pas autorisée pour ton grade / tes permissions.","error");
    page=isApplicant()?"applicationPortal":isVisitor()?"visitorPortal":isInactive()?"profile":canAccessPage("dashboard")?"dashboard":"profile";
  }
  if(window.LSPD.pageCleanup){
    try{window.LSPD.pageCleanup();}catch{}
    window.LSPD.pageCleanup=null;
  }
  window.LSPD.currentPage=page;
  document.body.classList.remove("sidebar-open");
  $("sidebarBackdrop")?.classList.add("hidden");
  document.querySelectorAll("#nav button[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  ensureActiveNavGroup(page);
  $("pageTitle").textContent=pages[page]||"LSPD";
  const content=$("content");
  content?.classList.remove("page-enter");
  const pageResult=({
    dashboard,visitorPortal,applicationPortal,profile,mySpace,registrations,notifications,announcements,messages,incidents,approvals,mdt,bolos,corrections,manual,handbook,trainingCenter,trainingWorkspace,ftoAcademy,ftoJournal,ftoFinal,ftoDossier,trainingAnalytics,academyManager,trainingQuiz,myTrainingFeedback,modules:modulesPage,evaluations,trainees,officers,assignments,
    certifications,records,shifts,dutyBoard,cad,watchCommand,leave,calendar,trainingHub,requirements,promotionAdvisor,promotions,
    stats,divisionsPage,grades:gradesPage,scenarios:scenariosPage,admin,permissionsAdmin,navigationAdmin,recruitmentControl,history
  }[page]||dashboard)();
  Promise.resolve(pageResult).finally(()=>injectTrainingContextBar(page));
  requestAnimationFrame(()=>content?.classList.add("page-enter"));
}

async function getUser(uid){
  const s=await getDoc(doc(db,"users",uid));
  return s.exists()?{uid,...s.data(),grade:canonicalGrade(s.data().grade)}:null;
}
async function getUsers(){
  const s=await getDocs(query(collection(db,"users"),where("role","!=","Visiteur")));
  return s.docs.map(d=>({uid:d.id,...d.data(),grade:canonicalGrade(d.data().grade)})).filter(u=>u.role!=="Applicant");
}
async function getMyEvaluations(){
  const s=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
  return s.docs.map(d=>({id:d.id,...d.data()}));
}
async function addAudit(action,targetId,details){
  await addDoc(collection(db,"audit_logs"),{
    actorId:window.LSPD.user.uid,actorName:window.LSPD.profile.name,
    action,targetId,details,createdAt:serverTimestamp()
  });
}
function csvDownload(filename, rows){
  if(!rows.length) return alert("Aucune donnée à exporter.");
  const headers=Object.keys(rows[0]);
  const csv=[headers.join(","),...rows.map(r=>headers.map(h=>`"${String(r[h]??"").replaceAll('"','""')}"`).join(","))].join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}




const CATENA_TEN_CODES=[
  ["10-4","Reçu / compris","Copy / understood"],
  ["10-6","Occupé, sauf urgence","Busy unless urgent"],
  ["10-7","Hors service","Out of service"],
  ["10-8","En service / disponible","In service / available"],
  ["10-9","Répétez la transmission","Repeat transmission"],
  ["10-11","Contrôle routier","Traffic stop"],
  ["10-15","Suspect / détenu en garde","Prisoner / suspect in custody"],
  ["10-19","Retour au poste","Return to station"],
  ["10-20","Localisation","Location"],
  ["10-22","Annuler / ne pas tenir compte","Disregard / cancel"],
  ["10-23","Arrivé sur place","Arrived on scene"],
  ["10-27","Vérification permis / identité conducteur","Driver license / identity check"],
  ["10-28","Vérification plaque / véhicule","Plate / vehicle registration check"],
  ["10-29","Vérification mandats","Warrant check"],
  ["10-31","Infraction / crime en cours","Crime in progress"],
  ["10-32","Individu armé","Armed person"],
  ["10-33","Priorité radio / trafic d'urgence","Emergency radio traffic"],
  ["10-41","Début de service","Beginning tour of duty"],
  ["10-42","Fin de service","Ending tour of duty"],
  ["10-50","Accident de la circulation","Traffic collision"],
  ["10-52","EMS / assistance médicale demandée","EMS / medical assistance requested"],
  ["10-76","En route","En route"],
  ["10-78","Renfort urgent demandé","Urgent backup requested"],
  ["10-80","Poursuite véhicule","Vehicle pursuit"]
];

const NEWCOMER_HANDBOOK=[
  {
    id:"start",icon:"🛡️",titleFr:"1. Bienvenue & mission",titleEn:"1. Welcome & mission",
    summaryFr:"Ce que représente un officier LSPD et les priorités à garder dès la première prise de service.",
    summaryEn:"What an LSPD officer represents and the priorities to keep from the first shift.",
    bodyFr:[
      "La mission du département est de maintenir un environnement sûr, préserver l'ordre et fournir un service de police professionnel à la communauté.",
      "En service, tu représentes immédiatement le département : sécurité, professionnalisme, maîtrise de soi et qualité du RP passent avant la recherche d'action.",
      "Traite chaque appel sérieusement, enquête autant que la situation le permet et demande un superviseur lorsque la procédure n'est pas claire."
    ],
    bodyEn:[
      "The department mission is to maintain a safe environment, preserve order and provide professional policing to the community.",
      "While on duty you immediately represent the department: safety, professionalism, self-control and RP quality come before chasing action.",
      "Treat every call seriously, investigate as fully as the situation allows and request a supervisor when procedure is unclear."
    ],
    tipsFr:["Reste en personnage pendant le service.","La sécurité du public, de ton binôme et de toi-même est prioritaire.","En cas de doute : ralentis, sécurise, communique, demande un supérieur."],
    tipsEn:["Stay in character while on duty.","Public, partner and officer safety come first.","When unsure: slow down, secure, communicate and request a supervisor."]
  },
  {
    id:"conduct",icon:"⭐",titleFr:"2. Conduite & chaîne de commandement",titleEn:"2. Conduct & chain of command",
    summaryFr:"Les standards de comportement attendus et la manière d'utiliser la hiérarchie.",summaryEn:"Expected conduct standards and how to use the chain of command.",
    bodyFr:[
      "Le SOP impose un niveau élevé de professionnalisme et de discipline. Le manque de respect, la discrimination et les comportements qui nuisent au département ne sont pas tolérés.",
      "Respecte la chaîne de commandement. Les Sergeants et Lieutenants assurent notamment la supervision de terrain et peuvent reprendre une scène ou donner des directives opérationnelles.",
      "Les grades exacts et leurs responsabilités sont maintenus dans la page Grades & responsabilités du Command Center."
    ],
    bodyEn:[
      "The SOP requires a high standard of professionalism and discipline. Disrespect, discrimination and behavior that harms the department are not tolerated.",
      "Respect the chain of command. Sergeants and Lieutenants provide field supervision and may take over scenes or issue operational directions.",
      "The exact ranks and responsibilities are maintained in the Ranks & responsibilities page of the Command Center."
    ]
  },
  {
    id:"radio",icon:"📻",titleFr:"3. Radio & communications",titleEn:"3. Radio & communications",
    summaryFr:"Une bonne radio est courte, exploitable et donne aux autres unités les informations dont elles ont besoin.",summaryEn:"Good radio traffic is short, actionable and gives other units what they need.",
    bodyFr:[
      "Le SOP privilégie les transmissions courtes et précises en plain English/Darija. Donne d'abord qui tu es, où tu es, ce que tu as et ce dont tu as besoin.",
      "Pour un contrôle routier, annonce au minimum la localisation, la plaque si disponible, le type/couleur du véhicule et le nombre d'occupants.",
      "En situation urgente, évite de monopoliser la fréquence avec des informations secondaires."
    ],
    bodyEn:[
      "The SOP favors short and precise plain English/Darija transmissions. State who you are, where you are, what you have and what you need.",
      "For a traffic stop, transmit at least the location, plate if available, vehicle type/color and occupant count.",
      "During urgent situations, do not occupy the channel with secondary information."
    ],
    exampleFr:"Exemple simple : « 393 Traffic, Alta St / Adams Apple Blvd, sedan rouge, 3 occupants, plaque à suivre. »",
    exampleEn:"Simple example: “393 Traffic, Alta St / Adams Apple Blvd, red sedan, 3 occupants, plate to follow.”"
  },
  {
    id:"tenCodes",icon:"🔟",titleFr:"4. Référentiel 10-codes Catena",titleEn:"4. Catena 10-code reference",
    summaryFr:"Mémo radio ajouté pour ton serveur. Utilise toujours le plain language si un code risque d'être mal compris.",summaryEn:"Radio shorthand added for your server. Always use plain language if a code may be misunderstood.",
    custom:true
  },
  {
    id:"traffic",icon:"🚓",titleFr:"5. Contrôle routier",titleEn:"5. Traffic stop",
    summaryFr:"Préparer, annoncer, approcher, contrôler puis clôturer proprement un traffic stop.",summaryEn:"Prepare, call out, approach, control and properly clear a traffic stop.",
    bodyFr:[
      "Avant le stop : constate une infraction ou un motif légitime, choisis une zone sûre, active le lightbar et annonce le stop à la radio.",
      "À l'approche : surveille la circulation et les occupants, garde une position tactique et observe les mains ainsi que ce qui est visible dans l'habitacle.",
      "Présente-toi, indique la raison du contrôle et demande les documents nécessaires. Retourne ensuite au véhicule de service pour les vérifications MDT/NCIC.",
      "À la fin, donne clairement la disposition : avertissement, citation ou transport/arrestation, puis clear la scène à la radio."
    ],
    bodyEn:[
      "Before the stop: observe a violation or legitimate reason, choose a safe location, activate the lightbar and call the stop over radio.",
      "On approach: watch traffic and occupants, maintain a tactical position and observe hands and anything visible inside the vehicle.",
      "Introduce yourself, state the reason for the stop and request the necessary documents. Then return to the patrol vehicle for MDT/NCIC checks.",
      "At the end, clearly state the disposition: warning, citation or transport/arrest, then clear the scene over radio."
    ]
  },
  {
    id:"legal",icon:"⚖️",titleFr:"6. Suspicion, détention & arrestation",titleEn:"6. Suspicion, detention & arrest",
    summaryFr:"Comprendre la différence entre suspicion raisonnable, probable cause et interrogatoire sous garde.",summaryEn:"Understand reasonable suspicion, probable cause and custodial questioning.",
    bodyFr:[
      "La suspicion raisonnable permet une enquête/détention temporaire lorsque des faits permettent raisonnablement de soupçonner une infraction. Elle ne vaut pas automatiquement preuve d'un crime.",
      "La probable cause exige des faits plus solides et fiables et peut soutenir une arrestation ou certaines recherches selon la procédure RP du serveur.",
      "Si les éléments qui justifiaient la détention disparaissent, ne maintiens pas quelqu'un menotté sans motif.",
      "Avant un interrogatoire en garde où la personne n'est pas libre de partir, le SOP prévoit l'énoncé des droits Miranda et l'arrêt des questions si les droits sont invoqués."
    ],
    bodyEn:[
      "Reasonable suspicion supports a temporary investigation/detention when facts reasonably suggest an offense. It is not automatically proof of a crime.",
      "Probable cause requires stronger and trustworthy facts and may support arrest or certain searches under the server's RP procedure.",
      "If the facts supporting detention disappear, do not keep a person handcuffed without a reason.",
      "Before custodial questioning where the person is not free to leave, the SOP calls for Miranda warnings and questioning must stop if rights are invoked."
    ]
  },
  {
    id:"force",icon:"🛡️",titleFr:"7. Usage de la force",titleEn:"7. Use of force",
    summaryFr:"Toujours rechercher le niveau de force nécessaire le plus bas compatible avec la menace.",summaryEn:"Always seek the lowest necessary level of force consistent with the threat.",
    bodyFr:[
      "Le continuum du SOP va de la présence et des ordres verbaux au contrôle à mains nues, aux moyens less-lethal puis à la force létale.",
      "La force doit répondre à la menace et à la nécessité de reprendre le contrôle. La force létale est réservée aux situations de danger immédiat pour une vie.",
      "Après un usage de force important, documente précisément le contexte, les ordres donnés, la menace, la force utilisée et les blessures éventuelles."
    ],
    bodyEn:[
      "The SOP continuum runs from officer presence and verbal commands through empty-hand control, less-lethal options and lethal force.",
      "Force must match the threat and the need to regain control. Lethal force is reserved for immediate threats to life.",
      "After significant force, document the context, commands, threat, force used and any injuries precisely."
    ]
  },
  {
    id:"pursuit",icon:"🚨",titleFr:"8. Poursuites & BOLO",titleEn:"8. Pursuits & BOLO",
    summaryFr:"Une poursuite est un exercice de coordination : sécurité, radio, rôles Primary/Secondary et supervision.",summaryEn:"A pursuit is a coordination exercise: safety, radio, Primary/Secondary roles and supervision.",
    bodyFr:[
      "Annonce immédiatement la poursuite avec localisation, direction, véhicule/plaque et occupants si possible.",
      "Continue à fournir les éléments utiles comme vitesse, circulation et état de la route. Quand un Secondary est présent, il prend normalement les mises à jour radio afin que le Primary se concentre sur la conduite.",
      "Un superviseur peut ordonner l'arrêt de la poursuite. Si elle est terminée sans interpellation, publie les informations utiles en BOLO.",
      "Le SOP source encadre fortement le PIT et prévoit une autorisation/supervision ; suis toujours la politique Catena en vigueur avant de le tenter."
    ],
    bodyEn:[
      "Immediately call the pursuit with location, direction, vehicle/plate and occupants when possible.",
      "Continue providing useful information such as speed, traffic and road conditions. Once a Secondary is present, it normally handles radio updates so Primary can focus on driving.",
      "A supervisor may order the pursuit terminated. If it ends without apprehension, publish the useful information as a BOLO.",
      "The source SOP tightly controls PIT use and expects authorization/supervision; always follow current Catena policy before attempting it."
    ]
  },
  {
    id:"scene",icon:"🧭",titleFr:"9. Intervention & gestion de scène",titleEn:"9. Incident & scene management",
    summaryFr:"Le premier officier influence toute l'enquête : arriver sainement, sauver des vies, sécuriser et documenter.",summaryEn:"The first officer shapes the whole investigation: arrive safely, preserve life, secure and document.",
    bodyFr:[
      "Arrive rapidement mais sans créer un second incident. Observe avant de modifier la scène et note ce que tu vois, entends et constates.",
      "Neutralise les dangers immédiats, organise l'aide médicale, puis sécurise la scène et limite l'accès aux personnes autorisées.",
      "Sur une scène importante, mets en place un périmètre, note les unités/postes et conserve un log des entrées/sorties lorsque nécessaire.",
      "Demande les ressources adaptées : unités supplémentaires, superviseur, EMS, détective, technicien evidence ou autre unité spécialisée. Lors de la relève, fais un briefing clair au responsable qui reprend la scène."
    ],
    bodyEn:[
      "Arrive quickly but without creating a second incident. Observe before altering the scene and note what you see, hear and discover.",
      "Neutralize immediate dangers, arrange medical aid, then secure the scene and limit access to authorized personnel.",
      "On major scenes, establish a perimeter, record unit posts and maintain an entry/exit log when needed.",
      "Request the appropriate resources: additional units, supervisor, EMS, detective, evidence technician or another specialty unit. When relieved, brief the person taking command clearly."
    ]
  },
  {
    id:"mdt",icon:"💻",titleFr:"10. MDT / NCIC & confidentialité",titleEn:"10. MDT / NCIC & confidentiality",
    summaryFr:"Les données policières sont sensibles : consulte uniquement ce qui est nécessaire à ton service et ne diffuse rien à l'extérieur.",summaryEn:"Police data is sensitive: access only what is needed for duty and never disclose it outside law enforcement.",
    bodyFr:[
      "Le MDT/NCIC sert notamment à consulter des antécédents, citations, arrestations, warrants, caution codes et informations véhicule.",
      "Les informations du MDT sont confidentielles. Ne les transmet pas à un civil, une organisation criminelle ou une personne non autorisée.",
      "Chaque consultation et chaque rapport doit rester cohérent avec ton action RP : ne cherche pas des informations que ton personnage n'a aucune raison opérationnelle de consulter."
    ],
    bodyEn:[
      "The MDT/NCIC is used to check records, citations, arrests, warrants, caution codes and vehicle information.",
      "MDT information is confidential. Do not disclose it to civilians, criminal groups or unauthorized persons.",
      "Every lookup and report should match your RP action: do not search information your character has no operational reason to access."
    ]
  },
  {
    id:"equipment",icon:"🎒",titleFr:"11. Équipement & unités spécialisées",titleEn:"11. Equipment & specialty units",
    summaryFr:"Utilise uniquement les véhicules, armes et équipements autorisés pour ton grade, ta mission et tes certifications.",summaryEn:"Use only vehicles, weapons and equipment authorized for your rank, assignment and certifications.",
    bodyFr:[
      "Le SOP liste l'équipement courant comme baton, lampe, Taser, arme de service, matériel de signalisation et premiers secours, avec certains équipements réservés aux personnels certifiés.",
      "Les unités spécialisées décrites comprennent notamment Motor, CID, SWAT et Aviation. Elles ont des responsabilités et des exigences de formation spécifiques.",
      "Vérifie toujours les certifications et la politique actuelle du département avant d'utiliser un équipement ou véhicule spécialisé."
    ],
    bodyEn:[
      "The SOP lists common equipment such as baton, flashlight, Taser, service pistol, traffic equipment and first-aid supplies, with some equipment reserved for certified personnel.",
      "Specialty units described include Motor, CID, SWAT and Aviation. They have specific responsibilities and training requirements.",
      "Always check certifications and current department policy before using specialty equipment or vehicles."
    ]
  },
  {
    id:"firstShift",icon:"✅",titleFr:"12. Checklist première prise de service",titleEn:"12. First shift checklist",
    summaryFr:"Le minimum à vérifier avant de partir en patrouille.",summaryEn:"The minimum to verify before going on patrol.",
    checklistFr:[
      "Je connais mon matricule, mon grade et mon supérieur direct.",
      "Je sais rejoindre la bonne fréquence radio et utiliser les transmissions courtes.",
      "Je connais les 10-codes Catena essentiels ou je garde le mémo ouvert.",
      "Je sais créer/mettre à jour mon unité dans le CAD et indiquer mon statut.",
      "Je sais effectuer un traffic stop simple et demander un renfort.",
      "Je connais la différence entre suspicion raisonnable, probable cause, détention et arrestation.",
      "Je connais le principe du use-of-force continuum.",
      "Je sais où créer un Incident Report, un BOLO et consulter le MDT.",
      "Je sais que les informations MDT/NCIC sont confidentielles.",
      "Si je doute d'une procédure, je contacte mon FTO ou un superviseur."
    ],
    checklistEn:[
      "I know my badge number, rank and direct supervisor.",
      "I know how to join the correct radio channel and keep transmissions concise.",
      "I know the essential Catena 10-codes or keep the reference open.",
      "I know how to create/update my CAD unit and status.",
      "I know how to conduct a basic traffic stop and request backup.",
      "I understand reasonable suspicion, probable cause, detention and arrest.",
      "I understand the use-of-force continuum.",
      "I know where to create an Incident Report, BOLO and access the MDT.",
      "I know MDT/NCIC information is confidential.",
      "If I am unsure about a procedure, I contact my FTO or a supervisor."
    ]
  }
];

function handbook(){
  if(!(isInternal()||isInactive()))return;
  const lang=currentLang==="en"?"En":"Fr";
  const title=s=>s[`title${lang}`]||s.titleFr;
  const summary=s=>s[`summary${lang}`]||s.summaryFr;
  const sectionCards=NEWCOMER_HANDBOOK.map((s,i)=>`<button class="handbook-toc-item" data-handbook-target="${s.id}" type="button"><span>${s.icon}</span><div><b>${esc(title(s))}</b><small>${esc(summary(s))}</small></div><i>›</i></button>`).join("");
  const contentCards=NEWCOMER_HANDBOOK.map(s=>{
    const body=s[`body${lang}`]||s.bodyFr||[];
    const tips=s[`tips${lang}`]||s.tipsFr||[];
    const checklist=s[`checklist${lang}`]||s.checklistFr||[];
    if(s.id==="tenCodes"){
      return `<section class="handbook-section card" id="hb-${s.id}" data-handbook-search="${esc((title(s)+" "+summary(s)+" "+CATENA_TEN_CODES.flat().join(" ")).toLowerCase())}">
        <div class="handbook-section-head"><span>${s.icon}</span><div><h2>${esc(title(s))}</h2><p>${esc(summary(s))}</p></div></div>
        <div class="handbook-policy-note"><b>⚠️ ${currentLang==="en"?"Catena note":"Note Catena"}</b><p>${currentLang==="en"?"The source SOP favors plain English/Darija and even states not to use 10-codes. This separate reference was added for Catena at the department's request. If a code is unclear, use plain language.":"Le SOP source privilégie le plain English/Darija et indique même de ne pas utiliser les 10-codes. Ce référentiel séparé a été ajouté pour Catena à la demande du département. Si un code prête à confusion, utilise le langage clair."}</p></div>
        <div class="ten-code-tools"><input id="tenCodeSearch" type="search" placeholder="${currentLang==="en"?"Search a code or meaning...":"Rechercher un code ou une signification..."}"></div>
        <div class="ten-code-grid" id="tenCodeGrid">${CATENA_TEN_CODES.map(c=>`<div class="ten-code-row" data-ten-code="${esc((c[0]+" "+c[1]+" "+c[2]).toLowerCase())}"><b>${c[0]}</b><span>${esc(currentLang==="en"?c[2]:c[1])}</span><button type="button" class="copy-ten-code" data-code="${c[0]}" title="Copier">⧉</button></div>`).join("")}</div>
      </section>`;
    }
    return `<section class="handbook-section card" id="hb-${s.id}" data-handbook-search="${esc((title(s)+" "+summary(s)+" "+body.join(" ")+" "+tips.join(" ")+" "+checklist.join(" ")).toLowerCase())}">
      <div class="handbook-section-head"><span>${s.icon}</span><div><h2>${esc(title(s))}</h2><p>${esc(summary(s))}</p></div></div>
      ${body.length?`<div class="handbook-body">${body.map(x=>`<p>${esc(x)}</p>`).join("")}</div>`:""}
      ${s.exampleFr?`<div class="handbook-radio-example"><span>📻</span><p>${esc(currentLang==="en"?s.exampleEn:s.exampleFr)}</p></div>`:""}
      ${tips.length?`<div class="handbook-tips">${tips.map(x=>`<div><span>✓</span><p>${esc(x)}</p></div>`).join("")}</div>`:""}
      ${checklist.length?`<div class="handbook-checklist">${checklist.map((x,i)=>`<label><input type="checkbox" data-handbook-check="${s.id}-${i}"><span>${esc(x)}</span></label>`).join("")}</div>`:""}
    </section>`;
  }).join("");

  $("content").innerHTML=`<div class="handbook-hero card">
    <div><span class="eyebrow">LSPD • NEW OFFICER ORIENTATION</span><h1>📘 ${esc(B("Handbook nouveaux arrivants","Newcomer Handbook"))}</h1><p>${esc(B("Guide opérationnel de prise de poste basé sur le SOP du département et adapté au Command Center Catena.","Operational onboarding guide based on department SOP and adapted to the Catena Command Center."))}</p></div>
    <div class="handbook-hero-actions"><button class="btn" id="printHandbookBtn">🖨️ ${esc(B("Imprimer le handbook","Print handbook"))}</button></div>
  </div>
  <div class="handbook-quick-actions">
    <button data-go-page="cad">📡 <span>${esc(B("Ouvrir le CAD","Open CAD"))}</span></button>
    <button data-go-page="mdt">💻 <span>${esc(B("Ouvrir le MDT","Open MDT"))}</span></button>
    <button data-go-page="trainingCenter">🎓 <span>${esc(B("Centre Formation","Training Center"))}</span></button>
    <button data-go-page="grades">⭐ <span>${esc(B("Grades & responsabilités","Ranks & responsibilities"))}</span></button>
  </div>
  <div class="handbook-search card"><span>⌕</span><input id="handbookSearch" type="search" placeholder="${esc(B("Recherche dans le handbook...","Search the handbook..."))}"><button id="clearHandbookSearch" class="icon-btn" type="button">×</button></div>
  <div class="handbook-layout">
    <aside class="handbook-toc card"><div class="handbook-toc-title"><span>☰</span><div><b>${esc(B("Démarrage rapide","Quick start"))}</b><small>${NEWCOMER_HANDBOOK.length} ${esc(B("chapitres","chapters"))}</small></div></div>${sectionCards}</aside>
    <main class="handbook-content" id="handbookContent">${contentCards}</main>
  </div>`;

  document.querySelectorAll("[data-handbook-target]").forEach(b=>b.onclick=()=>document.querySelector(`#hb-${b.dataset.handbookTarget}`)?.scrollIntoView({behavior:"smooth",block:"start"}));
  document.querySelectorAll("[data-go-page]").forEach(b=>b.onclick=()=>render(b.dataset.goPage));
  $("printHandbookBtn")?.addEventListener("click",()=>window.print());
  const search=$("handbookSearch");
  const applyFilter=()=>{
    const q=(search?.value||"").trim().toLowerCase();
    let visible=0;
    document.querySelectorAll(".handbook-section").forEach(s=>{const show=!q||(s.dataset.handbookSearch||"").includes(q);s.classList.toggle("hidden",!show);if(show)visible++;});
    document.querySelectorAll(".handbook-toc-item").forEach(b=>{const target=document.querySelector(`#hb-${b.dataset.handbookTarget}`);b.classList.toggle("hidden",!!target?.classList.contains("hidden"));});
    const existing=$("handbookNoResult"); if(existing)existing.remove();
    if(!visible)$("handbookContent")?.insertAdjacentHTML("afterbegin",`<div id="handbookNoResult" class="training-empty-state card"><span>⌕</span><b>${esc(B("Aucun chapitre trouvé","No chapter found"))}</b></div>`);
  };
  search?.addEventListener("input",applyFilter);
  $("clearHandbookSearch")?.addEventListener("click",()=>{if(search){search.value="";applyFilter();search.focus();}});
  $("tenCodeSearch")?.addEventListener("input",e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll(".ten-code-row").forEach(r=>r.classList.toggle("hidden",!!q&&!(r.dataset.tenCode||"").includes(q)));});
  document.querySelectorAll(".copy-ten-code").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.code);showToast(`${b.dataset.code} copié.`,"success");}catch{showToast(b.dataset.code,"info");}});
  document.querySelectorAll("[data-handbook-check]").forEach(c=>{
    const key=`lspd_handbook_${window.LSPD.user?.uid||"local"}_${c.dataset.handbookCheck}`;
    c.checked=localStorage.getItem(key)==="1";
    c.onchange=()=>localStorage.setItem(key,c.checked?"1":"0");
  });
}

function recruitmentStatusClass(status){
  if(["Recruté","Admission approuvée","Entretien réussi"].includes(status))return "green";
  if(["Refusé","Retirée"].includes(status))return "red";
  return "orange";
}
function normalizedRecruitmentStage(status){
  if(status==="À convoquer")return "Pré-sélectionné";
  if(status==="Entretien réussi")return "Admission approuvée";
  return status;
}
function recruitmentStepState(current,step){
  current=normalizedRecruitmentStage(current);
  const order={"Dossier reçu":1,"En étude":2,"Pré-sélectionné":2,"Entretien planifié":3,"Entretien évalué":4,"Admission approuvée":5,"Recruté":6,"Refusé":0,"Retirée":0};
  const n=order[current]||1;return n>step?"done":n===step?"active":"";
}
async function applicationPortal(){
  if(!isApplicant())return;
  try{
    const snap=await getDoc(doc(db,"lspd_applications",window.LSPD.user.uid));
    if(!snap.exists()){$("content").innerHTML='<div class="card"><p class="error">Aucun dossier de candidature trouvé. Contacte le Bureau du recrutement.</p></div>';return;}
    const a={id:snap.id,...snap.data()},status=normalizedRecruitmentStage(a.status),finalState=["Refusé","Retirée"].includes(status);
    $("content").innerHTML=`<div class="candidate-official-header card">
      <div class="candidate-official-seal">LSPD</div><div><span class="eyebrow">BUREAU DU RECRUTEMENT</span><h2>Dossier candidat — ${esc(a.applicantName)}</h2><p>Référence <b>${esc(a.applicationNumber||"—")}</b> • Déposé ${formatDate(a.createdAt)}</p></div>
      <span class="tag ${recruitmentStatusClass(status)} candidate-status-badge">${esc(status)}</span>
    </div>
    <div class="candidate-official-process ${finalState?"final":""}">
      <div class="${recruitmentStepState(status,1)}"><i>1</i><b>Dossier</b><small>Candidature enregistrée</small></div><span>→</span>
      <div class="${recruitmentStepState(status,2)}"><i>2</i><b>Étude</b><small>Présélection du dossier</small></div><span>→</span>
      <div class="${recruitmentStepState(status,3)}"><i>3</i><b>Entretien</b><small>Oral obligatoire in-game</small></div><span>→</span>
      <div class="${recruitmentStepState(status,4)}"><i>4</i><b>Décision</b><small>Décision du Commandement</small></div><span>→</span>
      <div class="${recruitmentStepState(status,5)}"><i>5</i><b>Incorporation</b><small>Matricule & entrée au LSPD</small></div>
    </div>
    ${a.publicMessage?`<div class="candidate-public-message card"><span>INFORMATION DU BUREAU</span><p>${esc(a.publicMessage)}</p></div>`:""}
    ${status==="Entretien planifié"?`<div class="candidate-interview-card card"><span>🎙️ CONVOCATION — ENTRETIEN ORAL IN-GAME</span><h3>${esc(a.interviewDate||"Date à confirmer")} • ${esc(a.interviewTime||"Heure à confirmer")}</h3><p>${esc(a.interviewLocation||"Lieu à confirmer")}</p><small>Recruteur : ${esc(a.interviewerName||"Bureau du recrutement")}</small><div class="candidate-interview-advice">Présente-toi quelques minutes avant l'heure prévue, avec un micro fonctionnel et disponible pour un échange RP.</div></div>`:""}
    ${status==="Entretien évalué"?`<div class="candidate-decision-card pending"><h3>Entretien terminé</h3><p>Ton entretien a été enregistré. Ton dossier est maintenant transmis au Commandement pour décision finale.</p></div>`:""}
    ${status==="Refusé"?`<div class="candidate-decision-card rejected"><h3>Candidature non retenue</h3><p>${esc(a.publicDecisionMessage||a.decisionReason||"Le Bureau du recrutement ne donnera pas suite à cette candidature.")}</p></div>`:""}
    ${status==="Admission approuvée"?`<div class="candidate-decision-card passed"><h3>Admission approuvée</h3><p>Ta candidature est acceptée. Le Commandement finalise maintenant ton matricule, ton grade d'entrée et ton affectation.</p></div>`:""}
    ${status==="Recruté"?`<div class="candidate-decision-card hired"><h3>Bienvenue au Los Santos Police Department</h3><p>Ton incorporation est finalisée. Reconnecte-toi si nécessaire pour accéder à ton espace membre.</p></div>`:""}
    <div class="candidate-file-grid">
      <section class="card"><span class="eyebrow">IDENTITÉ RP</span><h3>Présentation</h3><div class="row"><span>Nom</span><b>${esc(a.applicantName)}</b></div><div class="row"><span>Âge RP</span><b>${esc(a.ageRP)}</b></div><div class="row"><span>Téléphone RP</span><b>${esc(a.phoneRP||"—")}</b></div><div class="row"><span>Disponibilités</span><b>${esc(a.availability)}</b></div><p class="candidate-answer">${esc(a.presentation||a.experience||"—")}</p></section>
      <section class="card"><span class="eyebrow">MOTIVATION</span><h3>Pourquoi le LSPD ?</h3><p class="candidate-answer">${esc(a.whyLspd)}</p><h4>Ce que je peux apporter</h4><p class="candidate-answer">${esc(a.contribution||"—")}</p></section>
      <section class="card"><span class="eyebrow">PARCOURS</span><h3>Expérience RP</h3><p class="candidate-answer">${esc(a.experience)}</p><div class="row"><span>Expérience police</span><b>${esc(a.policeExperience)}</b></div><div class="row"><span>Permis RP</span><b>${esc(a.drivingLicense)}</b></div></section>
      <section class="card"><span class="eyebrow">PROFIL</span><h3>Forces & progression</h3><h4>Qualités</h4><p class="candidate-answer">${esc(a.strengths)}</p><h4>Point à améliorer</h4><p class="candidate-answer">${esc(a.weakness)}</p></section>
    </div>
    <div class="candidate-portal-actions"><button class="btn secondary" id="refreshApplicationBtn">↻ Actualiser</button>${["Dossier reçu","En étude","Pré-sélectionné"].includes(status)?'<button class="btn danger" id="withdrawApplicationBtn">Retirer ma candidature</button>':""}<button class="btn secondary" id="candidateLogoutBtn">Se déconnecter</button></div>`;
    $("refreshApplicationBtn").onclick=applicationPortal;$("candidateLogoutBtn").onclick=logout;$("withdrawApplicationBtn")?.addEventListener("click",()=>withdrawRecruitmentApplication(a.id));
  }catch(err){$("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;}
}
async function withdrawRecruitmentApplication(id){
  if(!isApplicant()||!confirm("Retirer définitivement ta candidature ?"))return;
  try{await updateDoc(doc(db,"lspd_applications",id),{status:"Retirée",withdrawnAt:serverTimestamp(),updatedAt:serverTimestamp()});await applicationPortal();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}
async function refreshRecruitmentBadge(){
  if(!canAccessRecruitmentDesk())return;
  try{
    const snap=await getDocs(collection(db,"lspd_applications"));
    const count=snap.docs.filter(d=>!["Refusé","Retirée","Recruté"].includes(normalizedRecruitmentStage(d.data().status))).length;
    const el=$("recruitmentCount"); if(el){el.textContent=count?String(count):"";el.classList.toggle("hidden",!count);}
  }catch{}
}

async function refreshRegistrationBadge(){
  if(!canAccessRegistrations()) return;
  try{
    const snap=await getDocs(query(collection(db,"users"),where("status","==","En attente")));
    const count=snap.size;
    const el=$("registrationCount");
    if(el){
      el.textContent=count?String(count):"";
      el.classList.toggle("hidden",!count);
    }
  }catch{}
}

async function registrations(){
  if(!canAccessRegistrations()) return;
  try{
    const snap=await getDocs(query(collection(db,"users"),where("role","!=","Visiteur")));
    const data=snap.docs
      .map(d=>({uid:d.id,...d.data()}))
      .filter(u=>u.status==="En attente" || u.status==="Refusé")
      .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));

    $("content").innerHTML=`<div class="card">
      <h3>Demandes d'inscription</h3>
      <p class="muted">Les candidats créent eux-mêmes leur compte Firebase Authentication. Ici, tu valides uniquement leur accès LSPD : matricule, grade, rôle et division.</p>
    </div>
    <div class="card table-card" style="margin-top:14px">
      <table class="table"><thead><tr>
        <th>Date</th><th>Nom RP</th><th>Email</th><th>Statut</th><th>Profil proposé</th><th>Action</th>
      </tr></thead><tbody>
      ${data.length?data.map(u=>`<tr>
        <td>${formatDate(u.createdAt)}</td>
        <td><b>${esc(u.name)}</b></td>
        <td>${esc(u.registeredEmail||"—")}</td>
        <td><span class="tag ${u.status==="Refusé"?"red":"orange"}">${esc(u.status)}</span></td>
        <td>${esc(canonicalGrade(u.grade||"Rookie"))} • ${esc(u.role||"Officer")} • ${esc(u.division||"Patrol")}</td>
        <td>
          ${hasPerm("registrations_approve")?`<button class="btn approve-registration" data-uid="${u.uid}">${u.status==="Refusé"?"Réexaminer":"Approuver"}</button>`:""}
          ${u.status==="En attente"&&hasPerm("registrations_reject")?`<button class="btn secondary reject-registration" data-uid="${u.uid}">Refuser</button>`:""}
        </td>
      </tr>`).join(""):'<tr><td colspan="6">Aucune demande en attente.</td></tr>'}
      </tbody></table>
    </div>`;

    document.querySelectorAll(".approve-registration").forEach(b=>b.onclick=()=>openRegistrationApproval(b.dataset.uid));
    document.querySelectorAll(".reject-registration").forEach(b=>b.onclick=()=>rejectRegistration(b.dataset.uid));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function openRegistrationApproval(uid){
  if(!hasPerm("registrations_approve")) return;
  const u=await getUser(uid);
  if(!u) return;

  showModal(`<h2>Valider l'inscription</h2>
    <div class="card compact-info">
      <b>${esc(u.name)}</b>
      <p class="muted">${esc(u.registeredEmail||"")} • UID géré automatiquement par Firebase</p>
    </div>
    <form id="registrationApprovalForm">
      <input id="regUid" type="hidden" value="${esc(uid)}">
      <div class="formgrid">
        <label class="field"><span>Matricule</span><input id="regBadge" required placeholder="Ex. 625" value="${u.badge==="—"?"":esc(u.badge||"")}"></label>
        <label class="field"><span>Grade</span><select id="regGrade">${gradeList.map(g=>`<option ${g[0]===canonicalGrade(u.grade||"Rookie")?"selected":""}>${g[0]}</option>`).join("")}</select></label>
        <label class="field"><span>Rôle</span><select id="regRole">${roles.map(r=>`<option ${r===(u.role||"Officer")?"selected":""}>${r}</option>`).join("")}</select></label>
        <label class="field"><span>Division</span><select id="regDivision">${divisions.map(d=>`<option ${d===(u.division||"Patrol")?"selected":""}>${d}</option>`).join("")}</select></label>
      </div>
      <div id="regError" class="error"></div>
      <div class="modal-actions">
        <button class="btn" type="submit">Valider l'inscription</button>
        <button class="btn secondary" type="button" id="closeModal">Annuler</button>
      </div>
    </form>`);

  const syncVisitor=()=>{
    const visitor=$("regRole").value==="Visiteur" || $("regGrade").value==="Visiteur";
    if(visitor){
      $("regRole").value="Visiteur";$("regGrade").value="Visiteur";$("regDivision").value="External";
      if(!$("regBadge").value.trim()) $("regBadge").value=`VIS-${uid.slice(-4).toUpperCase()}`;
    }
  };
  $("regRole").onchange=syncVisitor;$("regGrade").onchange=syncVisitor;syncVisitor();
  $("registrationApprovalForm").onsubmit=approveRegistration;
}

async function approveRegistration(e){
  e.preventDefault();
  if(!hasPerm("registrations_approve")) return;
  const uid=$("regUid").value;
  const visitor=$("regRole").value==="Visiteur" || $("regGrade").value==="Visiteur";
  if(visitor){$("regRole").value="Visiteur";$("regGrade").value="Visiteur";$("regDivision").value="External";}
  const badge=$("regBadge").value.trim();

  if(!badge){
    $("regError").textContent="Le matricule est obligatoire.";
    return;
  }

  try{
    const before=await getUser(uid);
    await updateDoc(doc(db,"users",uid),{
      badge,
      grade:$("regGrade").value,
      role:$("regRole").value,
      division:$("regDivision").value,
      status:"Actif",
      approvedById:window.LSPD.user.uid,
      approvedByName:window.LSPD.profile.name,
      approvedAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    await addAudit(
      "REGISTRATION_APPROVED",
      uid,
      `${before?.name||uid} — ${badge} — ${$("regGrade").value} — ${$("regRole").value}`
    );

    try{
      await createNotification(
        uid,
        "Inscription LSPD approuvée",
        `Ton accès au Command Center est validé. Matricule ${badge}, grade ${$("regGrade").value}.`,
        "Validation",
        "dashboard"
      );
    }catch{}

    document.querySelector(".modal")?.remove();
    await refreshRegistrationBadge();
    registrations();
  }catch(err){
    $("regError").textContent="Erreur : "+(err.code||err.message);
  }
}

async function rejectRegistration(uid){
  if(!hasPerm("registrations_reject")) return;
  const u=await getUser(uid);
  if(!u) return;
  if(!confirm(`Refuser la demande de ${u.name} ?`)) return;

  try{
    await updateDoc(doc(db,"users",uid),{
      status:"Refusé",
      rejectedById:window.LSPD.user.uid,
      rejectedByName:window.LSPD.profile.name,
      rejectedAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    await addAudit("REGISTRATION_REJECTED",uid,`${u.name} — demande refusée`);
    await refreshRegistrationBadge();
    registrations();
  }catch(err){
    alert("Erreur : "+(err.code||err.message));
  }
}

async function createNotification(recipientId,title,body,type="Info",linkPage="",linkTargetId=""){
  if(!recipientId || recipientId===window.LSPD.user?.uid) return;
  const payload={
    recipientId,
    senderId:window.LSPD.user.uid,
    senderName:window.LSPD.profile.name,
    title,body,type,linkPage,
    read:false,
    createdAt:serverTimestamp()
  };
  if(linkTargetId) payload.linkTargetId=linkTargetId;
  await addDoc(collection(db,"notifications"),payload);
}


function notificationTypeIcon(type){
  if(type==="Urgent") return "🚨";
  if(type==="Validation") return "✅";
  if(type==="Message") return "✉️";
  if(type==="Formation") return "🎓";
  return "🔔";
}

function closeNotificationDropdown(){
  $("notificationDropdown")?.classList.add("hidden");
  $("notificationBellBtn")?.setAttribute("aria-expanded","false");
}

async function toggleNotificationDropdown(){
  const panel=$("notificationDropdown");
  if(!panel || isVisitor())return;
  if(!panel.classList.contains("hidden")){ closeNotificationDropdown(); return; }
  panel.classList.remove("hidden");
  $("notificationBellBtn")?.setAttribute("aria-expanded","true");
  await loadNotificationDropdown();
}

async function loadNotificationDropdown(){
  const host=$("notificationDropdownList"),summary=$("notificationDropdownSummary");
  if(!host||!summary||!window.LSPD.user||isVisitor())return;

  host.innerHTML=`<div class="notification-dropdown-loading"><div class="notification-loader"></div><span>Chargement...</span></div>`;
  try{
    const snap=await getDocs(query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid)));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const unread=data.filter(n=>n.read!==true).length;
    summary.textContent=unread?`${unread} ${unread===1?"non lue":"non lues"}`:B("Tout est à jour","You're all caught up");

    host.innerHTML=data.length?data.slice(0,30).map(n=>`
      <article class="notification-pop-item ${n.read===true?"is-read":"is-unread"}">
        <div class="notification-pop-icon ${n.type==="Urgent"?"urgent":n.type==="Validation"?"validation":""}">${notificationTypeIcon(n.type)}</div>
        <div class="notification-pop-body">
          <div class="notification-pop-meta"><span>${esc(n.type||"Info")}</span><span>${formatDate(n.createdAt)}</span></div>
          <h4>${esc(n.title||"Notification")}</h4>
          <p>${esc(n.body||"")}</p>
          <div class="notification-pop-footer">
            <span>${esc(n.senderName||"Système")}</span>
            <div>
              ${n.read!==true?`<button class="notification-item-action mark-dropdown-notification" data-id="${n.id}" type="button">Marquer comme lu</button>`:""}
              ${n.linkTargetId&&n.linkPage==="messages"?`<button class="notification-item-action open-mail-notification" data-id="${n.id}" data-target="${n.linkTargetId}" type="button">Ouvrir</button>`:
                n.linkPage&&canAccessPage(n.linkPage)?`<button class="notification-item-action open-page-notification" data-id="${n.id}" data-page="${esc(n.linkPage)}" type="button">Ouvrir</button>`:""}
            </div>
          </div>
        </div>
        ${n.read!==true?'<span class="notification-unread-dot"></span>':""}
      </article>`).join(""):`<div class="notification-dropdown-empty"><span>🔕</span><p>Aucune notification.</p></div>`;

    document.querySelectorAll(".mark-dropdown-notification").forEach(btn=>btn.onclick=async e=>{
      e.stopPropagation();
      await markNotificationRead(btn.dataset.id,false);
      await loadNotificationDropdown();
    });
    document.querySelectorAll(".open-page-notification").forEach(btn=>btn.onclick=async e=>{
      e.stopPropagation();
      await markNotificationRead(btn.dataset.id,false);
      closeNotificationDropdown();
      render(btn.dataset.page);
    });
    document.querySelectorAll(".open-mail-notification").forEach(btn=>btn.onclick=async e=>{
      e.stopPropagation();
      await markNotificationRead(btn.dataset.id,false);
      closeNotificationDropdown();
      await openMailMessage(btn.dataset.target);
    });
  }catch(err){
    host.innerHTML=`<div class="notification-dropdown-empty"><span>⚠️</span><p>${esc(err.code||err.message)}</p></div>`;
  }
}

async function markAllDropdownNotifications(){
  if(!window.LSPD.user||isVisitor())return;
  try{
    const snap=await getDocs(query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid)));
    await Promise.all(snap.docs.filter(d=>d.data().read!==true).map(d=>updateDoc(doc(db,"notifications",d.id),{read:true,readAt:serverTimestamp()})));
    await refreshNotificationBadge();
    await loadNotificationDropdown();
  }catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

function startNotificationListener(){
  window.LSPD.notificationUnsub?.();
  window.LSPD.notificationUnsub=null;
  if(!window.LSPD.user||isVisitor())return;
  const q=query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid));
  window.LSPD.notificationUnsub=onSnapshot(q,snap=>{
    const unread=snap.docs.filter(d=>d.data().read!==true).length;
    const el=$("notificationCount"),bell=$("notificationBellBtn");
    if(el){
      el.textContent=unread>99?"99+":unread?String(unread):"";
      el.classList.toggle("hidden",!unread);
    }
    bell?.classList.toggle("has-unread",unread>0);
    if(!$("notificationDropdown")?.classList.contains("hidden")) loadNotificationDropdown().catch(()=>{});
  },()=>{});
}

async function refreshNotificationBadge(){
  if(!window.LSPD.user) return;
  const wrap=$("notificationBellWrap");
  wrap?.classList.toggle("hidden",isVisitor());
  if(isVisitor()){closeNotificationDropdown();return;}
  try{
    const snap=await getDocs(query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid)));
    const unread=snap.docs.filter(d=>d.data().read!==true).length;
    const el=$("notificationCount"),bell=$("notificationBellBtn");
    if(el){
      el.textContent=unread>99?"99+":unread?String(unread):"";
      el.classList.toggle("hidden",!unread);
    }
    bell?.classList.toggle("has-unread",unread>0);
  }catch{}
}

async function notifications(){
  try{
    const snap=await getDocs(query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid)));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar">
      <button class="btn secondary" id="markAllNotificationsBtn">Tout marquer comme lu</button>
    </div>
    <div class="notification-list">${data.length?data.map(n=>`
      <div class="card notification-card ${n.read===true?"read":""}">
        <div class="notification-top">
          <span class="tag ${n.type==="Urgent"?"red":n.type==="Validation"?"orange":""}">${esc(n.type||"Info")}</span>
          <span class="muted">${formatDate(n.createdAt)}</span>
        </div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.body)}</p>
        <p class="muted">Par ${esc(n.senderName||"Système")}</p>
        ${n.read!==true?`<button class="btn secondary mark-notification" data-id="${n.id}">Marquer comme lu</button>`:""}
      </div>`).join(""):'<div class="card"><p class="muted">Aucune notification.</p></div>'}</div>`;
    document.querySelectorAll(".mark-notification").forEach(b=>b.onclick=()=>markNotificationRead(b.dataset.id));
    $("markAllNotificationsBtn")?.addEventListener("click",async()=>{
      const unread=data.filter(n=>n.read!==true);
      await Promise.all(unread.map(n=>updateDoc(doc(db,"notifications",n.id),{read:true,readAt:serverTimestamp()})));
      await refreshNotificationBadge();
      notifications();
    });
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function markNotificationRead(id,refreshLegacyPage=true){
  await updateDoc(doc(db,"notifications",id),{read:true,readAt:serverTimestamp()});
  await refreshNotificationBadge();
  if(refreshLegacyPage && window.LSPD.currentPage==="notifications") notifications();
}

async function uploadIncidentAttachments(files){
  const uploaded=[];
  for(const file of [...files]){
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const path=`incident_attachments/${window.LSPD.user.uid}/${Date.now()}_${safeName}`;
    const r=storageRef(storage,path);
    await uploadBytes(r,file,{contentType:file.type||"application/octet-stream"});
    const url=await getDownloadURL(r);
    uploaded.push({name:file.name,url,path,type:file.type||""});
  }
  return uploaded;
}


function dateTimeFromParts(date,time="00:00"){
  const d=new Date(`${date}T${time||"00:00"}:00`);
  return Number.isNaN(d.getTime())?null:d;
}
function todayISO(){ return new Date().toISOString().slice(0,10); }
function shiftOperationalStatus(s){
  if(s.status==="Annulé") return "Annulé";
  if(s.checkOutAt) return "Terminé";
  if(s.checkInAt) return "En service";
  const now=new Date(), end=dateTimeFromParts(s.date,s.end||"23:59");
  if(s.date===todayISO() && end && now>end) return "Absent / non pointé";
  return "À venir";
}

async function generateUpcomingReminders(){
  if(!window.LSPD.user) return;
  try{
    const [shiftSnap,regSnap,notifSnap,eventSnap]=await Promise.all([
      getDocs(query(collection(db,"shifts"),where("officerId","==",window.LSPD.user.uid))),
      getDocs(query(collection(db,"training_registrations"),where("officerId","==",window.LSPD.user.uid))),
      getDocs(query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid))),
      getDocs(collection(db,"training_events"))
    ]);
    const existing=new Set(notifSnap.docs.map(d=>d.data().reminderKey).filter(Boolean));
    const now=Date.now(), horizon=24*60*60*1000;

    for(const d of shiftSnap.docs){
      const s=d.data();
      if(s.status==="Annulé") continue;
      const dt=dateTimeFromParts(s.date,s.start);
      if(!dt) continue;
      const diff=dt.getTime()-now;
      const key=`shift:${d.id}`;
      if(diff>=0 && diff<=horizon && !existing.has(key)){
        await addDoc(collection(db,"notifications"),{
          recipientId:window.LSPD.user.uid,
          senderId:window.LSPD.user.uid,
          senderName:"Système LSPD",
          title:"Rappel de shift",
          body:`${s.date} • ${s.start}-${s.end} • ${s.division||"Patrol"}. Ton shift commence bientôt.`,
          type:"Info",linkPage:"mySpace",read:false,reminderKey:key,createdAt:serverTimestamp()
        });
        existing.add(key);
      }
    }

    const events=new Map(eventSnap.docs.map(d=>[d.id,{id:d.id,...d.data()}]));
    for(const d of regSnap.docs){
      const r=d.data();
      if(r.status==="Annulée") continue;
      const e=events.get(r.eventId);
      if(!e) continue;
      const dt=dateTimeFromParts(e.date,e.time);
      if(!dt) continue;
      const diff=dt.getTime()-now;
      const key=`training:${e.id}`;
      if(diff>=0 && diff<=horizon && !existing.has(key)){
        await addDoc(collection(db,"notifications"),{
          recipientId:window.LSPD.user.uid,
          senderId:window.LSPD.user.uid,
          senderName:"Système LSPD",
          title:"Rappel de formation",
          body:`${e.title} • ${e.date} ${e.time}. Ta formation commence bientôt.`,
          type:"Info",linkPage:"trainingHub",read:false,reminderKey:key,createdAt:serverTimestamp()
        });
        existing.add(key);
      }
    }
    refreshNotificationBadge().catch(()=>{});
  }catch(err){ console.warn("Reminder generation skipped",err); }
}

async function mySpace(){
  try{
    const uid=window.LSPD.user.uid;
    const emptySnap={docs:[]};
    const operationsVisible=isNavGroupAllowed("operations");
    const personnelVisible=isNavGroupAllowed("personnel");
    const trainingVisible=isNavGroupAllowed("training");
    const canSeeLeave=hasPerm("leave_request_create")||hasPerm("leave_review");
    const canSeeTraining=hasPerm("training_access")||hasPerm("training_self_register")||hasPerm("training_manage")||hasPerm("training_invites_manage")||hasPerm("training_attendance_manage");
    const [shiftSnap,certSnap,recordSnap,leaveSnap,regSnap,eventSnap]=await Promise.all([
      operationsVisible?getDocs(query(collection(db,"shifts"),where("officerId","==",uid))):Promise.resolve(emptySnap),
      personnelVisible?getDocs(query(collection(db,"certifications"),where("officerId","==",uid))):Promise.resolve(emptySnap),
      personnelVisible?getDocs(query(collection(db,"personnel_records"),where("officerId","==",uid))):Promise.resolve(emptySnap),
      personnelVisible&&canSeeLeave?getDocs(query(collection(db,"leave_requests"),where("officerId","==",uid))):Promise.resolve(emptySnap),
      trainingVisible&&canSeeTraining?getDocs(query(collection(db,"training_registrations"),where("officerId","==",uid))):Promise.resolve(emptySnap),
      trainingVisible&&canSeeTraining?getDocs(collection(db,"training_events")):Promise.resolve(emptySnap)
    ]);
    const today=todayISO();
    const shiftsData=shiftSnap.docs.map(d=>({id:d.id,...d.data()}))
      .filter(s=>s.date>=today && s.status!=="Annulé")
      .sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
    const certs=certSnap.docs.map(d=>d.data());
    const recordsData=recordSnap.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const leaves=leaveSnap.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const eventMap=new Map(eventSnap.docs.map(d=>[d.id,{id:d.id,...d.data()}]));
    const regs=regSnap.docs.map(d=>({id:d.id,...d.data()}))
      .filter(r=>r.status!=="Annulée")
      .map(r=>({r,event:eventMap.get(r.eventId)}))
      .filter(x=>x.event && x.event.date>=today)
      .sort((a,b)=>(a.event.date+a.event.time).localeCompare(b.event.date+b.event.time));

    $("content").innerHTML=`
      <div class="grid2">
        <div class="card">
          <h3>Mes prochains shifts</h3>
          ${shiftsData.length?shiftsData.slice(0,8).map(s=>{
            const st=shiftOperationalStatus(s);
            return `<div class="ops-item">
              <div><b>${esc(s.date)} • ${esc(s.start)}-${esc(s.end)}</b><span>${esc(s.division||"Patrol")} • ${esc(st)}</span></div>
              <div>${!s.checkInAt && s.date===today?`<button class="btn secondary my-checkin" data-id="${s.id}">Pointer l'entrée</button>`:""}
              ${s.checkInAt && !s.checkOutAt?`<button class="btn secondary my-checkout" data-id="${s.id}">Pointer la sortie</button>`:""}</div>
            </div>`;
          }).join(""):'<p class="muted">Aucun shift à venir.</p>'}
        </div>
        <div class="card">
          <h3>Mes formations</h3>
          ${regs.length?regs.slice(0,8).map(x=>`<div class="ops-item"><div><b>${esc(x.event.title)}</b><span>${esc(x.event.date)} • ${esc(x.event.time)} • ${esc(x.r.attendanceStatus||x.r.status||"Inscrit")}</span></div></div>`).join(""):'<p class="muted">Aucune formation inscrite.</p>'}
        </div>
      </div>
      <div class="grid2" style="margin-top:16px">
        <div class="card"><h3>Mes certifications</h3><div class="chip-row">${certs.length?certs.map(c=>`<span class="chip">${esc(c.certification)}</span>`).join(""):'<span class="muted">Aucune certification.</span>'}</div></div>
        <div class="card"><h3>Mes congés</h3>${leaves.length?leaves.slice(0,6).map(l=>`<div class="row"><span>${esc(l.startDate)} → ${esc(l.endDate)}</span><span class="tag ${l.status==="Approuvé"?"green":l.status==="Refusé"?"red":"orange"}">${esc(l.status)}</span></div>`).join(""):'<p class="muted">Aucune demande.</p>'}</div>
      </div>
      <div class="card" style="margin-top:16px"><h3>Mon dossier RH</h3>${recordsData.length?recordsData.slice(0,10).map(r=>`<div class="record ${r.type==="Sanction"?"negative":"positive"}"><b>${esc(r.type)} — ${esc(r.title)}</b><span>${formatDate(r.createdAt)} • ${esc(r.issuedByName)}</span><p>${esc(r.details||"")}</p></div>`).join(""):'<p class="muted">Aucun élément au dossier.</p>'}</div>`;

    document.querySelectorAll(".my-checkin").forEach(b=>b.onclick=()=>checkInShift(b.dataset.id));
    document.querySelectorAll(".my-checkout").forEach(b=>b.onclick=()=>checkOutShift(b.dataset.id));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function checkInShift(id){
  try{
    await updateDoc(doc(db,"shifts",id),{dutyStatus:"En service",checkInAt:serverTimestamp()});
    await addAudit("SHIFT_CHECK_IN",id,window.LSPD.profile.name);
    mySpace();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}
async function checkOutShift(id){
  try{
    await updateDoc(doc(db,"shifts",id),{dutyStatus:"Terminé",checkOutAt:serverTimestamp()});
    await addAudit("SHIFT_CHECK_OUT",id,window.LSPD.profile.name);
    mySpace();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

async function dutyBoard(){
  if(!hasPerm("duty_board")) return;
  try{
    const today=todayISO();
    const [shiftSnap,leaveSnap,eventSnap,regSnap]=await Promise.all([
      getDocs(collection(db,"shifts")),
      getDocs(collection(db,"leave_requests")),
      getDocs(collection(db,"training_events")),
      getDocs(collection(db,"training_registrations"))
    ]);
    const shiftsToday=shiftSnap.docs.map(d=>({id:d.id,...d.data()})).filter(s=>s.date===today);
    const leaves=leaveSnap.docs.map(d=>d.data()).filter(l=>l.status==="Approuvé" && l.startDate<=today && l.endDate>=today);
    const events=eventSnap.docs.map(d=>({id:d.id,...d.data()})).filter(e=>e.date===today);
    const eventIds=new Set(events.map(e=>e.id));
    const regs=regSnap.docs.map(d=>d.data()).filter(r=>eventIds.has(r.eventId) && r.status!=="Annulée");

    const onDuty=shiftsToday.filter(s=>shiftOperationalStatus(s)==="En service");
    const noShows=shiftsToday.filter(s=>shiftOperationalStatus(s)==="Absent / non pointé");

    $("content").innerHTML=`
      <div class="grid stats-grid">
        <div class="card accent-card"><div class="muted">Service en cours</div><div class="stat">${onDuty.length}</div></div>
        <div class="card accent-card"><div class="muted">Absences / non pointés</div><div class="stat">${noShows.length}</div></div>
        <div class="card accent-card"><div class="muted">En congé</div><div class="stat">${leaves.length}</div></div>
        <div class="card accent-card"><div class="muted">En formation aujourd'hui</div><div class="stat">${regs.length}</div></div>
      </div>
      <div class="section-title">Aujourd'hui</div>
      <div class="card table-card"><table class="table"><thead><tr><th>Officier</th><th>Horaire</th><th>Unité</th><th>Statut</th>${hasPerm("shifts_manage")?"<th>Action</th>":""}</tr></thead><tbody>
      ${shiftsToday.length?shiftsToday.map(s=>`<tr><td>${esc(s.officerName)}</td><td>${esc(s.start)}-${esc(s.end)}</td><td>${esc(s.division||"Patrol")}</td><td><span class="tag ${shiftOperationalStatus(s)==="En service"?"green":shiftOperationalStatus(s)==="Absent / non pointé"?"red":""}">${esc(shiftOperationalStatus(s))}</span></td>${hasPerm("shifts_manage")?`<td><button class="btn secondary edit-duty-shift" data-id="${s.id}">Modifier shift</button> ${s.status!=="Annulé"?`<button class="btn secondary cancel-duty-shift" data-id="${s.id}">Annuler shift</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="5">Aucun shift.</td></tr>'}
      </tbody></table></div>
      <div class="grid2" style="margin-top:16px">
        <div class="card"><h3>En congé</h3>${leaves.length?leaves.map(l=>`<div class="row"><span>${esc(l.officerName)}</span><b>${esc(l.startDate)} → ${esc(l.endDate)}</b></div>`).join(""):'<p class="muted">Aucune demande.</p>'}</div>
        <div class="card"><h3>En formation aujourd'hui</h3>${regs.length?regs.map(r=>`<div class="row"><span>${esc(r.officerName)}</span><b>${esc(r.attendanceStatus||r.status)}</b></div>`).join(""):'<p class="muted">Aucune formation planifiée.</p>'}</div>
      </div>`;

    document.querySelectorAll(".edit-duty-shift").forEach(b=>b.onclick=()=>openShiftEdit(b.dataset.id));
    document.querySelectorAll(".cancel-duty-shift").forEach(b=>b.onclick=()=>cancelShift(b.dataset.id));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function openShiftEdit(id){
  if(!hasPerm("shifts_manage")) return;
  const s=await getDoc(doc(db,"shifts",id));
  if(!s.exists()) return;
  const v=s.data();
  showModal(`<h2>Modifier le shift</h2><form id="shiftEditForm">
    <input id="seId" type="hidden" value="${esc(id)}">
    <div class="formgrid">
      <label class="field"><span>Date</span><input id="seDate" type="date" required value="${esc(v.date)}"></label>
      <label class="field"><span>Nouveau début</span><input id="seStart" type="time" required value="${esc(v.start)}"></label>
      <label class="field"><span>Nouvelle fin</span><input id="seEnd" type="time" required value="${esc(v.end)}"></label>
      <label class="field"><span>Division</span><select id="seDivision">${divisions.map(d=>`<option ${d===(v.division||"Patrol")?"selected":""}>${d}</option>`).join("")}</select></label>
    </div>
    <div id="seError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer les modifications</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div>
  </form>`);
  $("shiftEditForm").onsubmit=async e=>{
    e.preventDefault();
    try{
      await updateDoc(doc(db,"shifts",id),{date:$("seDate").value,start:$("seStart").value,end:$("seEnd").value,division:$("seDivision").value,updatedAt:serverTimestamp()});
      await addAudit("SHIFT_UPDATED",id,`${v.officerName} — ${$("seDate").value} ${$("seStart").value}-${$("seEnd").value}`);
      document.querySelector(".modal")?.remove(); dutyBoard();
    }catch(err){ $("seError").textContent="Erreur : "+(err.code||err.message); }
  };
}
async function cancelShift(id){
  if(!hasPerm("shifts_manage")) return;
  if(!confirm("Annuler shift ?")) return;
  try{
    await updateDoc(doc(db,"shifts",id),{status:"Annulé",updatedAt:serverTimestamp()});
    await addAudit("SHIFT_CANCELLED",id,"Shift annulé.");
    dutyBoard();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

async function trainingHub(){
  try{
    const [eventSnap,regSnap]=await Promise.all([
      getDocs(collection(db,"training_events")),
      hasAnyPerm("training_manage","training_invites_manage","training_attendance_manage")
        ? getDocs(collection(db,"training_registrations"))
        : getDocs(query(collection(db,"training_registrations"),where("officerId","==",window.LSPD.user.uid)))
    ]);
    const events=eventSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    const regs=regSnap.docs.map(d=>({id:d.id,...d.data()}));
    const today=todayISO();

    $("content").innerHTML=`<div class="card"><p class="muted">Inscriptions, capacité et suivi de présence aux formations.</p></div>
    <div class="calendar-grid" style="margin-top:14px">${events.filter(e=>e.date>=today).length?events.filter(e=>e.date>=today).map(e=>{
      const activeRegs=regs.filter(r=>r.eventId===e.id && r.status!=="Annulée");
      const mine=activeRegs.find(r=>r.officerId===window.LSPD.user.uid);
      const capacity=Number(e.capacity)||20;
      const full=activeRegs.length>=capacity;
      return `<div class="card event-card"><span class="number">${esc(e.date)} • ${esc(e.time)}</span><h3>${esc(e.title)}</h3>
        <p>${esc(e.moduleCode||"")}</p><p class="muted">${esc(e.location||"LSPD")} • Formateur: ${esc(e.trainerName)}</p>
        <div class="row"><span>Places</span><b>${activeRegs.length}/${capacity}</b></div>
        <div class="modal-actions">
          ${mine?mine.status==="Invité"
          ?`<span class="tag orange">Invité</span> <button class="btn training-invite-response" data-reg="${mine.id}" data-event="${e.id}" data-response="accept">Accepter</button> <button class="btn secondary training-invite-response" data-reg="${mine.id}" data-event="${e.id}" data-response="decline">Refuser</button>`
          :`<span class="tag ${mine.status==="Refusé"?"red":"green"}">${esc(mine.attendanceStatus||mine.status||"Inscrit")}</span> ${mine.status==="Inscrit"?`<button class="btn secondary training-cancel" data-reg="${mine.id}">Annuler mon inscription</button>`:""}`:
          `<button class="btn ${full?"secondary":""} training-register" data-event="${e.id}" data-title="${esc(e.title)}" ${full?"disabled":""}>${full?"Complet":"S'inscrire"}</button>`}
          ${hasPerm("training_attendance_manage")?`<button class="btn secondary training-attendance" data-event="${e.id}">Gérer les présences</button>`:""}
        </div>
      </div>`;
    }).join(""):'<div class="card">Aucune formation planifiée.</div>'}</div>`;

    document.querySelectorAll(".training-register").forEach(b=>b.onclick=()=>registerTraining(b.dataset.event,b.dataset.title));
    document.querySelectorAll(".training-invite-response").forEach(b=>b.onclick=()=>respondTrainingInvitation(b.dataset.reg,b.dataset.response,b.dataset.event));
    document.querySelectorAll(".training-cancel").forEach(b=>b.onclick=()=>cancelTrainingRegistration(b.dataset.reg));
    document.querySelectorAll(".training-attendance").forEach(b=>b.onclick=()=>openTrainingAttendance(b.dataset.event));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function registerTraining(eventId,title){
  if(!hasPerm("training_self_register"))return;
  try{
    const existing=await getDocs(query(collection(db,"training_registrations"),where("officerId","==",window.LSPD.user.uid)));
    if(existing.docs.some(d=>d.data().eventId===eventId && d.data().status!=="Annulée")){
      alert("Tu es déjà inscrit à cette formation."); return;
    }
    const eventSnap=await getDoc(doc(db,"training_events",eventId));
    if(!eventSnap.exists()) return;
    const e=eventSnap.data();
    const all=await getDocs(query(collection(db,"training_registrations"),where("eventId","==",eventId)));
    const count=all.docs.filter(d=>d.data().status!=="Annulée").length;
    const capacity=Number(e.capacity)||20;
    if(count>=capacity){ alert("Formation complète."); return; }

    await addDoc(collection(db,"training_registrations"),{
      eventId,officerId:window.LSPD.user.uid,officerName:window.LSPD.profile.name,
      status:"Inscrit",attendanceStatus:"Inscrit",createdAt:serverTimestamp()
    });
    await addAudit("TRAINING_REGISTER",eventId,`${window.LSPD.profile.name} — ${title}`);
    alert("Ton inscription est enregistrée.");
    trainingHub();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

async function cancelTrainingRegistration(regId){
  if(!hasPerm("training_self_register"))return;
  try{
    await updateDoc(doc(db,"training_registrations",regId),{status:"Annulée",attendanceStatus:"Inscription annulée",cancelledAt:serverTimestamp()});
    await addAudit("TRAINING_CANCEL_REGISTRATION",regId,window.LSPD.profile.name);
    trainingHub();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

async function openTrainingAttendance(eventId){
  if(!hasPerm("training_attendance_manage")) return;
  const [eventSnap,regSnap]=await Promise.all([
    getDoc(doc(db,"training_events",eventId)),
    getDocs(query(collection(db,"training_registrations"),where("eventId","==",eventId)))
  ]);
  if(!eventSnap.exists()) return;
  const e=eventSnap.data();
  const regs=regSnap.docs.map(d=>({id:d.id,...d.data()})).filter(r=>r.status!=="Annulée");
  showModal(`<h2>${esc(e.title)} — Participants</h2>
    <div class="attendance-list">${regs.length?regs.map(r=>`<div class="ops-item"><div><b>${esc(r.officerName)}</b><span>${esc(r.attendanceStatus||r.status)}</span></div><div>
      <button class="btn secondary attendance-set" data-id="${r.id}" data-status="Présent">Marquer présent</button>
      <button class="btn secondary attendance-set" data-id="${r.id}" data-status="Absent">Marquer absent</button>
    </div></div>`).join(""):'<p class="muted">Aucun participant.</p>'}</div>
    <div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
  document.querySelectorAll(".attendance-set").forEach(b=>b.onclick=()=>setTrainingAttendance(b.dataset.id,b.dataset.status,eventId));
}
async function setTrainingAttendance(regId,status,eventId){
  if(!hasPerm("training_attendance_manage"))return;
  try{
    await updateDoc(doc(db,"training_registrations",regId),{
      attendanceStatus:status,attendanceMarkedById:window.LSPD.user.uid,
      attendanceMarkedByName:window.LSPD.profile.name,attendanceMarkedAt:serverTimestamp()
    });
    await addAudit("TRAINING_ATTENDANCE",regId,status);
    alert("Présence mise à jour.");
    document.querySelector(".modal")?.remove();
    openTrainingAttendance(eventId);
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

async function mdt(){
  if(!isInternal())return;const canCases=canAccessMdtCases(),canRecruitment=canAccessRecruitmentDesk();if(!canCases&&!canRecruitment)return;
  if(!window.LSPD.mdtTab || (window.LSPD.mdtTab==="cases"&&!canCases) || (window.LSPD.mdtTab==="recruitment"&&!canRecruitment))window.LSPD.mdtTab=canCases?"cases":"recruitment";
  $("content").innerHTML=`<div class="mdt-pro-header card"><div><span class="eyebrow">MOBILE DATA TERMINAL</span><h2>MDT LSPD</h2><p>Dossiers opérationnels et recrutement centralisés.</p></div></div><div class="mdt-tabs">${canCases?`<button class="${window.LSPD.mdtTab==="cases"?"active":""}" data-mdt-tab="cases">💻 Dossiers MDT</button>`:""}${canRecruitment?`<button class="${window.LSPD.mdtTab==="recruitment"?"active":""}" data-mdt-tab="recruitment">🪪 Recrutement LSPD <span id="mdtRecruitmentInlineCount"></span></button>`:""}</div><div id="mdtTabContent"></div>`;
  document.querySelectorAll("[data-mdt-tab]").forEach(b=>b.onclick=()=>{window.LSPD.mdtTab=b.dataset.mdtTab;mdt();});if(window.LSPD.mdtTab==="recruitment")await renderRecruitmentDesk();else await renderMdtCaseFiles();
}

async function renderMdtCaseFiles(){
  if(!canAccessMdtCases())return;
  try{
    const incidentAccessAll=hasPerm("incident_view_all")||hasPerm("incident_review")||hasPerm("incident_export");
    const incidentOwn=hasPerm("incident_create");
    const [caseSnap,incidentSnap]=await Promise.all([
      getDocs(collection(db,"case_files")),
      incidentAccessAll?getDocs(collection(db,"incident_reports")):incidentOwn?getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid))):Promise.resolve({docs:[]})
    ]);
    const cases=caseSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)),incidentsData=incidentSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("mdtTabContent").innerHTML=`<div class="toolbar">${hasPerm("mdt_case_create")?'<button class="btn" id="newCaseBtn">+ Nouveau dossier</button>':""}<input id="mdtSearch" class="search" placeholder="Recherche globale..."></div><div class="section-title">Dossiers d'enquête</div><div class="card table-card"><table class="table"><thead><tr><th>Numéro</th><th>Titre</th><th>Catégorie</th><th>Auteur</th><th>Statut</th>${hasPerm("mdt_case_close")?"<th>Action</th>":""}</tr></thead><tbody id="mdtCaseRows"></tbody></table></div><div class="section-title">Rapports accessibles</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Auteur</th><th>Type</th><th>Titre</th><th>Statut</th><th></th></tr></thead><tbody>${incidentsData.length?incidentsData.slice(0,30).map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.authorName)}</td><td>${esc(r.type)}</td><td>${esc(r.title)}</td><td>${esc(r.status)}</td><td><button class="icon-btn incident-eye" data-id="${r.id}" title="Voir le rapport">👁</button></td></tr>`).join(""):'<tr><td colspan="6">Aucun rapport.</td></tr>'}</tbody></table></div>`;
    function renderCaseRows(rows){return rows.length?rows.map(c=>`<tr><td>${esc(c.caseNumber)}</td><td><b>${esc(c.title)}</b><div class="muted">${esc(c.summary||"")}</div></td><td>${esc(c.category)}</td><td>${esc(c.createdByName)}</td><td><span class="tag ${c.status==="Clos"?"green":"orange"}">${esc(c.status)}</span></td>${hasPerm("mdt_case_close")?`<td>${c.status!=="Clos"?`<button class="btn secondary close-case" data-id="${c.id}">Clôturer le dossier</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucun dossier MDT.</td></tr>';}
    function bindCaseButtons(){document.querySelectorAll(".close-case").forEach(b=>b.onclick=()=>closeCase(b.dataset.id));document.querySelectorAll(".incident-eye").forEach(b=>b.onclick=()=>openIncidentViewer(b.dataset.id));}$("mdtCaseRows").innerHTML=renderCaseRows(cases);bindCaseButtons();$("newCaseBtn")?.addEventListener("click",openCaseForm);$("mdtSearch").oninput=e=>{const q=e.target.value.toLowerCase();$("mdtCaseRows").innerHTML=renderCaseRows(cases.filter(c=>[c.caseNumber,c.title,c.category,c.createdByName,c.status,c.summary].some(v=>String(v||"").toLowerCase().includes(q))));bindCaseButtons();};
  }catch(err){$("mdtTabContent").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;}
}

function recruitmentManagerStatusBadge(status){status=normalizedRecruitmentStage(status);return `<span class="tag ${recruitmentStatusClass(status)}">${esc(status)}</span>`;}
function recruitmentScoreLabel(score,max){
  const pct=max?Math.round(Number(score||0)/max*100):0;
  return pct>=75?"Solide":pct>=55?"À approfondir":"Insuffisant";
}
function recruitmentScoreClass(score,max){const pct=max?Number(score||0)/max*100:0;return pct>=75?"green":pct>=55?"orange":"red";}
async function getRecruitmentReview(applicationId){
  try{const s=await getDoc(doc(db,"lspd_recruitment_reviews",applicationId));return s.exists()?{id:s.id,...s.data()}:null;}catch{return null;}
}
async function upsertRecruitmentReview(applicationId,patch){
  const ref=doc(db,"lspd_recruitment_reviews",applicationId),existing=await getDoc(ref);
  if(existing.exists())await updateDoc(ref,{...patch,updatedAt:serverTimestamp()});
  else await setDoc(ref,{applicationId,...patch,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
}
async function renderRecruitmentDesk(){
  if(!canAccessRecruitmentDesk())return;
  try{
    const [snap,reviewSnap,recruitmentSettings]=await Promise.all([getDocs(collection(db,"lspd_applications")),getDocs(collection(db,"lspd_recruitment_reviews")),getRecruitmentSettings()]);
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const reviews=new Map(reviewSnap.docs.map(d=>[d.id,{id:d.id,...d.data()}]));window.LSPD.recruitmentApplications=data;window.LSPD.recruitmentReviews=reviews;
    const statusCount=s=>data.filter(a=>normalizedRecruitmentStage(a.status)===s).length;
    const active=data.filter(a=>!["Refusé","Retirée","Recruté"].includes(normalizedRecruitmentStage(a.status)));
    $("mdtTabContent").innerHTML=`<div class="recruitment-bureau-header">
      <div><span class="eyebrow">LSPD — RECRUITMENT BUREAU</span><h2>Gestion des candidatures</h2><p>Présélection documentée, entretien oral, recommandation du recruteur et décision du Commandement.</p></div>
      <div class="recruitment-bureau-standard"><b>PROCESSUS OFFICIEL</b><span>Dossier → Étude → Entretien → Décision → Incorporation</span>${hasPerm("recruitment_settings_manage")?`<button class="btn tiny ${recruitmentSettings.open?"danger":""}" id="deskRecruitmentToggle">${recruitmentSettings.open?"🔒 Fermer les candidatures":"🟢 Ouvrir les candidatures"}</button>`:`<small>${recruitmentSettings.open?"🟢 Candidatures ouvertes":"🔒 Candidatures fermées"}</small>`}</div>
    </div>
    <div class="recruitment-desk-summary pro">
      <div><span>Nouveaux dossiers</span><b>${statusCount("Dossier reçu")}</b></div><div><span>En étude / présélection</span><b>${statusCount("En étude")+statusCount("Pré-sélectionné")}</b></div><div><span>Entretiens planifiés</span><b>${statusCount("Entretien planifié")}</b></div><div><span>Décision Commandement</span><b>${statusCount("Entretien évalué")}</b></div><div><span>Admissions approuvées</span><b>${statusCount("Admission approuvée")}</b></div>
    </div>
    <div class="toolbar recruitment-toolbar"><input id="recruitmentSearch" class="search" placeholder="Rechercher candidat, référence, statut..."><select id="recruitmentFilter"><option value="active">Candidatures actives</option><option value="all">Toutes</option><option>Dossier reçu</option><option>En étude</option><option>Pré-sélectionné</option><option>Entretien planifié</option><option>Entretien évalué</option><option>Admission approuvée</option><option>Refusé</option><option>Recruté</option></select><button class="btn secondary" id="exportRecruitmentBtn">Exporter CSV</button></div>
    <div id="recruitmentList" class="recruitment-list professional"></div>`;
    const draw=()=>{
      const q=$("recruitmentSearch").value.trim().toLowerCase(),filter=$("recruitmentFilter").value;
      const rows=data.filter(a=>{const st=normalizedRecruitmentStage(a.status),statusOk=filter==="all"||filter==="active"?filter==="all"||!["Refusé","Retirée","Recruté"].includes(st):st===filter;const searchOk=!q||[a.applicationNumber,a.applicantName,a.email,st,a.availability,a.policeExperience].some(v=>String(v||"").toLowerCase().includes(q));return statusOk&&searchOk;});
      $("recruitmentList").innerHTML=rows.length?rows.map(a=>{const r=reviews.get(a.id),st=normalizedRecruitmentStage(a.status);return `<article class="recruitment-application-card pro"><div class="recruitment-app-reference"><span>${esc(a.applicationNumber||"—")}</span><small>${formatDate(a.createdAt)}</small></div><div class="recruitment-app-main"><h3>${esc(a.applicantName)}</h3><p>${esc(a.ageRP)} ans RP • ${esc(a.availability)} • ${esc(a.policeExperience)}</p><small>${esc(a.email)}</small></div><div class="recruitment-score-mini">${r?.screeningTotal!=null?`<span>Dossier <b>${r.screeningTotal}/25</b></span>`:""}${r?.interviewTotal!=null?`<span>Entretien <b>${r.interviewTotal}/35</b></span>`:""}</div><div class="recruitment-app-status">${recruitmentManagerStatusBadge(st)}${st==="Entretien planifié"?`<small>${esc(a.interviewDate||"")} ${esc(a.interviewTime||"")}</small>`:""}</div><button class="btn recruitment-open" data-id="${a.id}">Ouvrir le dossier</button></article>`}).join(""):'<div class="card"><p class="muted">Aucune candidature dans ce filtre.</p></div>';
      document.querySelectorAll(".recruitment-open").forEach(b=>b.onclick=()=>openRecruitmentApplication(b.dataset.id));
    };
    $("recruitmentSearch").oninput=draw;$("recruitmentFilter").onchange=draw;draw();
    if($("deskRecruitmentToggle")) $("deskRecruitmentToggle").onclick=async()=>{await saveRecruitmentOpenState(!recruitmentSettings.open);await renderRecruitmentDesk();};
    $("exportRecruitmentBtn").onclick=()=>csvDownload("candidatures_lspd.csv",data.map(a=>{const r=reviews.get(a.id)||{};return {numero:a.applicationNumber,nom:a.applicantName,email:a.email,ageRP:a.ageRP,disponibilite:a.availability,experience:a.policeExperience,statut:normalizedRecruitmentStage(a.status),scoreDossier:r.screeningTotal??"",scoreEntretien:r.interviewTotal??"",recommandation:r.interviewRecommendation||""};}));
    const inline=$("mdtRecruitmentInlineCount");if(inline)inline.textContent=active.length?`(${active.length})`:"";refreshRecruitmentBadge().catch(()=>{});
  }catch(err){$("mdtTabContent").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;}
}
async function openRecruitmentApplication(id){
  if(!hasPerm("recruitment_view"))return;
  const [snap,review]=await Promise.all([getDoc(doc(db,"lspd_applications",id)),getRecruitmentReview(id)]);if(!snap.exists())return;
  const a={id:snap.id,...snap.data()},status=normalizedRecruitmentStage(a.status),screening=review?.screeningTotal,interview=review?.interviewTotal;
  showModal(`<div class="recruitment-review-modal official"><div class="recruitment-review-head"><div><span class="eyebrow">${esc(a.applicationNumber||"CANDIDATURE")}</span><h2>${esc(a.applicantName)}</h2><p>${esc(a.email)} • ${esc(a.ageRP)} ans RP • Déposé ${formatDate(a.createdAt)}</p></div>${recruitmentManagerStatusBadge(status)}</div>
    <div class="recruitment-internal-score-strip"><div><span>Présélection</span><b>${screening!=null?`${screening}/25`:'Non évalué'}</b>${screening!=null?`<small>${recruitmentScoreLabel(screening,25)}</small>`:""}</div><div><span>Entretien</span><b>${interview!=null?`${interview}/35`:'Non effectué'}</b>${review?.interviewRecommendation?`<small>${esc(review.interviewRecommendation)}</small>`:""}</div><div><span>Avis Commandement</span><b>${esc(review?.commandDecision||"En attente")}</b></div></div>
    <div class="recruitment-review-grid official-grid">
      <section><span class="eyebrow">PRÉSENTATION</span><h3>Identité & personnage</h3><div class="row"><span>Disponibilités</span><b>${esc(a.availability)}</b></div><div class="row"><span>Permis RP</span><b>${esc(a.drivingLicense)}</b></div><div class="row"><span>Expérience police</span><b>${esc(a.policeExperience)}</b></div><div class="row"><span>Casier RP</span><b>${esc(a.criminalRecord||"Non renseigné")}</b></div><h4>Présentation</h4><p>${esc(a.presentation||"—")}</p><h4>Background</h4><p>${esc(a.background||"—")}</p></section>
      <section><span class="eyebrow">MOTIVATION</span><h3>Projet LSPD</h3><h4>Pourquoi le LSPD ?</h4><p>${esc(a.whyLspd)}</p><h4>Apport au département</h4><p>${esc(a.contribution||"—")}</p><h4>Expérience RP</h4><p>${esc(a.experience)}</p><h4>Forces / axe d'amélioration</h4><p><b>${esc(a.strengths)}</b><br>${esc(a.weakness)}</p></section>
      <section><span class="eyebrow">JUGEMENT RP</span><h3>Mises en situation écrites</h3><h4>Citoyen provocateur</h4><p>${esc(a.citizenScenario||"Non renseigné (ancienne candidature)")}</p><h4>Collègue en difficulté</h4><p>${esc(a.colleagueScenario||"Non renseigné")}</p><h4>Chaîne de commandement</h4><p>${esc(a.teamScenario||"Non renseigné")}</p></section>
      <section><span class="eyebrow">ENTRETIEN ORAL</span><h3>Convocation</h3><div class="row"><span>Statut</span><b>${esc(a.interviewStatus||"À planifier")}</b></div><div class="row"><span>Date</span><b>${esc(a.interviewDate||"—")}</b></div><div class="row"><span>Heure</span><b>${esc(a.interviewTime||"—")}</b></div><div class="row"><span>Lieu</span><b>${esc(a.interviewLocation||"—")}</b></div><div class="row"><span>Recruteur</span><b>${esc(a.interviewerName||"—")}</b></div>${review?.interviewSummary?`<div class="internal-review-note"><b>Compte rendu interne</b><p>${esc(review.interviewSummary)}</p></div>`:""}</section>
    </div>
    ${review?.screeningNotes||review?.interviewStrengths||review?.interviewConcerns?`<div class="recruitment-internal-notes"><span>🔒 NOTES INTERNES — NON VISIBLES PAR LE CANDIDAT</span>${review?.screeningNotes?`<p><b>Présélection :</b> ${esc(review.screeningNotes)}</p>`:""}${review?.interviewStrengths?`<p><b>Points forts entretien :</b> ${esc(review.interviewStrengths)}</p>`:""}${review?.interviewConcerns?`<p><b>Points de vigilance :</b> ${esc(review.interviewConcerns)}</p>`:""}</div>`:""}
    <div class="recruitment-review-actions official-actions">
      ${["Dossier reçu","En étude"].includes(status)&&hasPerm("recruitment_screening")?`<button class="btn recruitment-action" data-action="screen" data-id="${id}">📋 Évaluer le dossier</button>`:""}
      ${status==="Pré-sélectionné"&&hasPerm("recruitment_interview_schedule")?`<button class="btn recruitment-action" data-action="schedule" data-id="${id}">🎙️ Planifier l'entretien</button>`:""}
      ${status==="Entretien planifié"?`${hasPerm("recruitment_interview_evaluate")?`<button class="btn recruitment-action" data-action="conduct" data-id="${id}">🎙️ Conduire / noter l'entretien</button>`:""}${hasPerm("recruitment_interview_schedule")?`<button class="btn secondary recruitment-action" data-action="reschedule" data-id="${id}">Replanifier</button>`:""}`:""}
      ${status==="Entretien évalué"?(hasPerm("recruitment_command_decision")?`<button class="btn recruitment-action" data-action="command" data-id="${id}">⚖️ Décision du Commandement</button>`:'<span class="recruitment-waiting-command">Entretien évalué — en attente du Commandement.</span>'):""}
      ${status==="Admission approuvée"||status==="Entretien réussi"?(hasPerm("recruitment_incorporate")?`<button class="btn recruitment-action" data-action="hire" data-id="${id}">🪪 Finaliser l'incorporation</button>`:'<span class="recruitment-waiting-command">Admission approuvée — incorporation à finaliser.</span>'):""}
      <button class="btn secondary" id="closeModal">Fermer</button>
    </div></div>`);
  document.querySelectorAll(".recruitment-action").forEach(b=>b.onclick=()=>handleRecruitmentAction(b.dataset.id,b.dataset.action));
}
async function handleRecruitmentAction(id,action){
  const permission={screen:"recruitment_screening",schedule:"recruitment_interview_schedule",reschedule:"recruitment_interview_schedule",conduct:"recruitment_interview_evaluate",command:"recruitment_command_decision",hire:"recruitment_incorporate",pass:"recruitment_command_decision",reject:"recruitment_screening",rejectInterview:"recruitment_interview_evaluate"}[action];
  if(permission&&!hasPerm(permission))return showToast("Permission insuffisante pour cette étape du recrutement.","error");
  if(action==="screen")return openRecruitmentScreeningForm(id);if(action==="schedule"||action==="reschedule")return openRecruitmentInterviewForm(id);if(action==="conduct")return openRecruitmentInterviewEvaluationForm(id);if(action==="command")return openRecruitmentCommandDecisionForm(id);if(action==="pass")return openRecruitmentDecisionForm(id,true);if(action==="reject"||action==="rejectInterview")return openRecruitmentDecisionForm(id,false);if(action==="hire")return openRecruitmentHireForm(id);
}
async function updateRecruitmentApplication(id,patch){try{await updateDoc(doc(db,"lspd_applications",id),{...patch,updatedAt:serverTimestamp()});document.querySelector(".modal")?.remove();await renderRecruitmentDesk();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}}
function recruitmentScoreInputs(prefix,criteria){return criteria.map((c,i)=>`<label class="recruitment-score-field"><span>${esc(c)}</span><select id="${prefix}${i}" required>${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===3?'selected':''}>${n} / 5</option>`).join('')}</select></label>`).join('');}
function readRecruitmentScores(prefix,count){return Array.from({length:count},(_,i)=>Number($(prefix+i).value));}
async function openRecruitmentScreeningForm(id){
  if(!hasPerm("recruitment_screening"))return;
  const s=await getDoc(doc(db,"lspd_applications",id));if(!s.exists())return;const a=s.data(),old=await getRecruitmentReview(id);
  const crit=["Présentation & cohérence du personnage","Motivation LSPD","Expérience / maturité RP","Disponibilités & implication","Jugement dans les mises en situation"];
  showModal(`<div class="recruitment-score-modal"><span class="eyebrow">PRÉSÉLECTION</span><h2>Évaluer le dossier — ${esc(a.applicantName)}</h2><p class="muted">Note chaque critère de 1 à 5. Le score aide la décision mais ne la remplace pas.</p><form id="screeningForm"><div class="recruitment-score-grid">${recruitmentScoreInputs('scr',crit)}</div><label class="field full"><span>Notes internes du recruteur</span><textarea id="screeningNotes" rows="5" required minlength="20" placeholder="Points forts, réserves, éléments à reprendre pendant l'entretien...">${esc(old?.screeningNotes||"")}</textarea></label><label class="field full"><span>Décision de présélection</span><select id="screeningOutcome"><option value="Pré-sélectionné">Retenir pour entretien</option><option value="En étude">Mettre en attente / réexaminer</option><option value="Refusé">Ne pas retenir le dossier</option></select></label><label class="field full" id="screeningPublicReasonWrap"><span>Message au candidat si refus</span><textarea id="screeningPublicReason" rows="3" placeholder="Message professionnel, sans notes internes."></textarea></label><div id="screeningError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer l'évaluation</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form></div>`);
  $("screeningPublicReasonWrap").classList.add("hidden");$("screeningOutcome").onchange=()=>$("screeningPublicReasonWrap").classList.toggle("hidden",$("screeningOutcome").value!=="Refusé");
  $("screeningForm").onsubmit=async e=>{e.preventDefault();const scores=readRecruitmentScores('scr',crit.length),total=scores.reduce((a,b)=>a+b,0),outcome=$("screeningOutcome").value,publicReason=$("screeningPublicReason").value.trim();if(outcome==="Refusé"&&!publicReason)return $("screeningError").textContent="Ajoute un message professionnel pour le candidat.";try{await upsertRecruitmentReview(id,{screeningScores:scores,screeningCriteria:crit,screeningTotal:total,screeningNotes:$("screeningNotes").value.trim(),screeningOutcome:outcome,screenedById:window.LSPD.user.uid,screenedByName:window.LSPD.profile.name,screenedAt:serverTimestamp()});await updateDoc(doc(db,"lspd_applications",id),{status:outcome,reviewedById:window.LSPD.user.uid,reviewedByName:window.LSPD.profile.name,reviewedAt:serverTimestamp(),publicMessage:outcome==="Pré-sélectionné"?"Ton dossier a été présélectionné. Le Bureau du recrutement va maintenant organiser ton entretien oral in-game.":outcome==="En étude"?"Ton dossier reste en cours d'étude par le Bureau du recrutement.":"Le Bureau du recrutement a rendu sa décision concernant ton dossier.",publicDecisionMessage:outcome==="Refusé"?publicReason:"",updatedAt:serverTimestamp()});document.querySelector(".modal")?.remove();await renderRecruitmentDesk();}catch(err){$("screeningError").textContent="Erreur : "+(err.code||err.message);}};
}
async function openRecruitmentInterviewForm(id){
  if(!hasPerm("recruitment_interview_schedule"))return;
  const s=await getDoc(doc(db,"lspd_applications",id));if(!s.exists())return;const a=s.data();
  showModal(`<div class="recruitment-schedule-modal"><span class="eyebrow">CONVOCATION OFFICIELLE</span><h2>Planifier l'entretien oral</h2><p class="muted">${esc(a.applicantName)} • rendez-vous in-game avec un recruteur LSPD.</p><form id="recruitmentInterviewForm"><div class="formgrid"><label class="field"><span>Date</span><input id="riDate" type="date" value="${esc(a.interviewDate||"")}" required></label><label class="field"><span>Heure</span><input id="riTime" type="time" value="${esc(a.interviewTime||"")}" required></label><label class="field full"><span>Lieu in-game</span><input id="riLocation" value="${esc(a.interviewLocation||"Mission Row — Bureau du recrutement")}" required></label></div><label class="field full"><span>Consigne visible par le candidat</span><textarea id="riPublic" rows="3" placeholder="Ex. Présente-toi 5 minutes avant l'heure, tenue correcte...">${esc(a.interviewPublicInstructions||"")}</textarea></label><div id="riError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Envoyer la convocation</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form></div>`);
  $("recruitmentInterviewForm").onsubmit=async e=>{e.preventDefault();try{await updateDoc(doc(db,"lspd_applications",id),{status:"Entretien planifié",interviewStatus:"Planifié",interviewDate:$("riDate").value,interviewTime:$("riTime").value,interviewLocation:$("riLocation").value.trim(),interviewPublicInstructions:$("riPublic").value.trim(),interviewerId:window.LSPD.user.uid,interviewerName:window.LSPD.profile.name,interviewScheduledAt:serverTimestamp(),publicMessage:`Tu es convoqué à un entretien oral in-game le ${$("riDate").value} à ${$("riTime").value}.`,updatedAt:serverTimestamp()});document.querySelector(".modal")?.remove();await renderRecruitmentDesk();}catch(err){$("riError").textContent="Erreur : "+(err.code||err.message);}};
}
async function openRecruitmentInterviewEvaluationForm(id){
  if(!hasPerm("recruitment_interview_evaluate"))return;
  const [s,old]=await Promise.all([getDoc(doc(db,"lspd_applications",id)),getRecruitmentReview(id)]);if(!s.exists())return;const a=s.data();
  const questions=["Présente ton personnage et son parcours.","Pourquoi le LSPD et pas un autre métier de service public ?","Qu'attends-tu du RP police au quotidien ?","Comment réagis-tu face à un citoyen agressif verbalement ?","Comment gères-tu un désaccord avec un collègue ?","Comment réagis-tu à un ordre d'un supérieur que tu ne comprends pas ?","Donne un exemple de scène RP où tu as privilégié le jeu des autres.","Quelles sont tes disponibilités réelles et ton niveau d'implication souhaité ?"];
  const crit=["Présentation & aisance orale","Motivation","Communication","Maturité / maîtrise de soi","Jugement RP","Esprit d'équipe","Professionnalisme"];
  showModal(`<div class="recruitment-interview-modal"><div class="recruitment-interview-title"><div><span class="eyebrow">ENTRETIEN ORAL IN-GAME</span><h2>${esc(a.applicantName)}</h2><p>Guide structuré pour garantir le même standard à tous les candidats.</p></div><span class="tag orange">Interne</span></div><div class="recruitment-interview-questions"><h3>Trame d'entretien</h3>${questions.map((q,i)=>`<div><i>${i+1}</i><span>${esc(q)}</span></div>`).join('')}</div><form id="interviewEvaluationForm"><label class="field full"><span>Notes prises pendant l'entretien</span><textarea id="interviewNotes" rows="8" required minlength="40" placeholder="Réponses importantes, comportement, cohérence, points à vérifier...">${esc(old?.interviewNotes||"")}</textarea></label><h3>Grille d'entretien</h3><div class="recruitment-score-grid">${recruitmentScoreInputs('int',crit)}</div><div class="formgrid"><label class="field full"><span>Points forts observés</span><textarea id="interviewStrengths" rows="3" required>${esc(old?.interviewStrengths||"")}</textarea></label><label class="field full"><span>Points de vigilance</span><textarea id="interviewConcerns" rows="3" required>${esc(old?.interviewConcerns||"")}</textarea></label><label class="field full"><span>Synthèse du recruteur</span><textarea id="interviewSummary" rows="4" required minlength="30">${esc(old?.interviewSummary||"")}</textarea></label><label class="field full"><span>Recommandation</span><select id="interviewRecommendation"><option>Avis favorable</option><option>Avis réservé</option><option>Avis défavorable</option></select></label></div><div id="interviewEvalError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Clôturer l'entretien et transmettre</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form></div>`);
  $("interviewEvaluationForm").onsubmit=async e=>{e.preventDefault();const scores=readRecruitmentScores('int',crit.length),total=scores.reduce((a,b)=>a+b,0);try{await upsertRecruitmentReview(id,{interviewQuestions:questions,interviewNotes:$("interviewNotes").value.trim(),interviewScores:scores,interviewCriteria:crit,interviewTotal:total,interviewStrengths:$("interviewStrengths").value.trim(),interviewConcerns:$("interviewConcerns").value.trim(),interviewSummary:$("interviewSummary").value.trim(),interviewRecommendation:$("interviewRecommendation").value,interviewedById:window.LSPD.user.uid,interviewedByName:window.LSPD.profile.name,interviewCompletedAt:serverTimestamp()});await updateDoc(doc(db,"lspd_applications",id),{status:"Entretien évalué",interviewStatus:"Effectué",publicMessage:"Ton entretien oral est terminé. Ton dossier a été transmis au Commandement pour décision finale.",updatedAt:serverTimestamp()});document.querySelector(".modal")?.remove();await renderRecruitmentDesk();}catch(err){$("interviewEvalError").textContent="Erreur : "+(err.code||err.message);}};
}
async function openRecruitmentCommandDecisionForm(id){
  if(!hasPerm("recruitment_command_decision"))return;
  const [s,r]=await Promise.all([getDoc(doc(db,"lspd_applications",id)),getRecruitmentReview(id)]);if(!s.exists())return;const a=s.data();
  showModal(`<div class="recruitment-command-decision"><span class="eyebrow">DÉCISION DU COMMANDEMENT</span><h2>${esc(a.applicantName)}</h2><div class="command-decision-summary"><div><span>Dossier</span><b>${r?.screeningTotal??'—'}/25</b></div><div><span>Entretien</span><b>${r?.interviewTotal??'—'}/35</b></div><div><span>Recommandation recruteur</span><b>${esc(r?.interviewRecommendation||"—")}</b></div></div><form id="commandDecisionForm"><label class="field full"><span>Décision</span><select id="commandDecision"><option value="Admission approuvée">Admission approuvée</option><option value="Refusé">Candidature refusée</option></select></label><label class="field full"><span>Justification interne</span><textarea id="commandDecisionNotes" rows="4" required minlength="20" placeholder="Motifs de la décision, réserves éventuelles..."></textarea></label><label class="field full"><span>Message communiqué au candidat</span><textarea id="commandPublicMessage" rows="3" required placeholder="Message professionnel et concis."></textarea></label><div id="commandDecisionError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer la décision</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form></div>`);
  $("commandDecisionForm").onsubmit=async e=>{e.preventDefault();const decision=$("commandDecision").value;try{await upsertRecruitmentReview(id,{commandDecision:decision,commandDecisionNotes:$("commandDecisionNotes").value.trim(),commandById:window.LSPD.user.uid,commandByName:window.LSPD.profile.name,commandDecisionAt:serverTimestamp()});await updateDoc(doc(db,"lspd_applications",id),{status:decision,publicDecisionMessage:$("commandPublicMessage").value.trim(),publicMessage:decision==="Admission approuvée"?"Le Commandement a approuvé ton admission. Ton incorporation administrative va maintenant être finalisée.":"Le Commandement a rendu sa décision finale concernant ta candidature.",decisionById:window.LSPD.user.uid,decisionByName:window.LSPD.profile.name,decisionAt:serverTimestamp(),updatedAt:serverTimestamp()});document.querySelector(".modal")?.remove();await renderRecruitmentDesk();}catch(err){$("commandDecisionError").textContent="Erreur : "+(err.code||err.message);}};
}
// Legacy entry point kept for backward compatibility with older buttons/data.
async function openRecruitmentDecisionForm(id,passed){
  if(!hasPerm("recruitment_command_decision"))return;
  if(passed)return openRecruitmentCommandDecisionForm(id);
  const s=await getDoc(doc(db,"lspd_applications",id));if(!s.exists())return;const a=s.data();
  showModal(`<h2>Refuser la candidature</h2><p class="muted">${esc(a.applicantName)}</p><form id="legacyRejectForm"><label class="field full"><span>Message au candidat</span><textarea id="legacyRejectReason" rows="4" required></textarea></label><div id="legacyRejectError" class="error"></div><div class="modal-actions"><button class="btn danger" type="submit">Confirmer le refus</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);$("legacyRejectForm").onsubmit=async e=>{e.preventDefault();try{await updateDoc(doc(db,"lspd_applications",id),{status:"Refusé",publicDecisionMessage:$("legacyRejectReason").value.trim(),publicMessage:"Le Bureau du recrutement a rendu sa décision concernant ton dossier.",decisionById:window.LSPD.user.uid,decisionByName:window.LSPD.profile.name,decisionAt:serverTimestamp(),updatedAt:serverTimestamp()});document.querySelector(".modal")?.remove();await renderRecruitmentDesk();}catch(err){$("legacyRejectError").textContent="Erreur : "+(err.code||err.message);}};
}
async function openRecruitmentHireForm(id){
  if(!hasPerm("recruitment_incorporate"))return;
  const s=await getDoc(doc(db,"lspd_applications",id));if(!s.exists())return;const a=s.data(),status=normalizedRecruitmentStage(a.status);if(!["Admission approuvée","Entretien réussi"].includes(status))return showToast("L'admission doit être approuvée avant l'incorporation.","warning");
  showModal(`<div class="recruitment-hire-modal"><span class="eyebrow">INCORPORATION LSPD</span><h2>Finaliser l'admission de ${esc(a.applicantName)}</h2><p class="muted">Cette étape transforme le compte candidat en compte membre actif.</p><form id="recruitmentHireForm"><div class="formgrid"><label class="field"><span>Matricule</span><input id="hireBadge" required placeholder="Ex. 0421"></label><label class="field"><span>Grade d'entrée</span><select id="hireGrade">${gradeList.filter(g=>g[0]!=="Visiteur"&&g[0]!=="Candidat").map(g=>`<option ${g[0]==="Rookie"?"selected":""}>${g[0]}</option>`).join("")}</select></label><label class="field"><span>Division initiale</span><select id="hireDivision">${divisions.filter(d=>d!=="External"&&d!=="Recruitment").map(d=>`<option ${d==="Patrol"?"selected":""}>${d}</option>`).join("")}</select></label></div><label class="field full"><span>Note d'incorporation</span><textarea id="hireNote" rows="3" placeholder="Ex. Affectation Patrol, orientation Academy à planifier..."></textarea></label><div id="hireError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Créer le profil LSPD actif</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form></div>`);
  $("recruitmentHireForm").onsubmit=async e=>{e.preventDefault();const badge=$("hireBadge").value.trim();if(!badge)return $("hireError").textContent="Le matricule est obligatoire.";try{const grade=$("hireGrade").value,division=$("hireDivision").value;await updateDoc(doc(db,"users",a.applicantId),{badge,grade,role:"Officer",status:"Actif",division,recruitmentApplicant:false,recruitedAt:serverTimestamp(),recruitedById:window.LSPD.user.uid,recruitedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()});await updateDoc(doc(db,"lspd_applications",id),{status:"Recruté",recruitmentBadge:badge,recruitmentGrade:grade,recruitmentDivision:division,recruitedById:window.LSPD.user.uid,recruitedByName:window.LSPD.profile.name,recruitedAt:serverTimestamp(),publicMessage:`Bienvenue au LSPD. Ton incorporation est finalisée avec le matricule ${badge}.`,updatedAt:serverTimestamp()});await upsertRecruitmentReview(id,{incorporationNote:$("hireNote").value.trim(),incorporatedById:window.LSPD.user.uid,incorporatedByName:window.LSPD.profile.name,incorporatedAt:serverTimestamp()});await addAudit("LSPD_RECRUITMENT",a.applicantId,`${a.applicantName} — ${badge} — ${grade}`);document.querySelector(".modal")?.remove();showToast("Incorporation finalisée.","success");await renderRecruitmentDesk();}catch(err){$("hireError").textContent="Erreur : "+(err.code||err.message);}};
}

function openCaseForm(){
  if(!hasPerm("mdt_case_create"))return;
  showModal(`<h2>Nouveau dossier MDT</h2><form id="caseForm"><div class="formgrid">
    <label class="field"><span>Titre</span><input id="caseTitle" required></label>
    <label class="field"><span>Catégorie</span><select id="caseCategory">${caseCategories.map(c=>`<option>${c}</option>`).join("")}</select></label>
    </div><label class="field full"><span>Résumé</span><textarea id="caseSummary" rows="6" required></textarea></label>
    <div id="caseError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Créer le dossier</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("caseForm").onsubmit=saveCase;
}
async function saveCase(e){
  e.preventDefault();if(!hasPerm("mdt_case_create"))return;
  try{
    const caseNumber=`LSPD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const ref=await addDoc(collection(db,"case_files"),{
      caseNumber,title:$("caseTitle").value.trim(),category:$("caseCategory").value,
      summary:$("caseSummary").value.trim(),status:"Ouvert",
      createdById:window.LSPD.user.uid,createdByName:window.LSPD.profile.name,createdAt:serverTimestamp()
    });
    await addAudit("CASE_CREATE",ref.id,`${caseNumber} — ${$("caseTitle").value.trim()}`);
    document.querySelector(".modal")?.remove(); mdt();
  }catch(err){ $("caseError").textContent="Erreur : "+(err.code||err.message); }
}
async function closeCase(id){
  if(!hasPerm("mdt_case_close")) return;
  try{
    await updateDoc(doc(db,"case_files",id),{status:"Clos",closedById:window.LSPD.user.uid,closedByName:window.LSPD.profile.name,closedAt:serverTimestamp()});
    await addAudit("CASE_CLOSE",id,"Clos");
    window.LSPD.mdtTab="cases"; mdt();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

async function divisionsPage(){
  try{
    const uid=window.LSPD.user.uid;
    const appSnap=hasPerm("division_review")
      ? await getDocs(collection(db,"division_applications"))
      : await getDocs(query(collection(db,"division_applications"),where("applicantId","==",uid)));
    const applications=appSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    let counts={};
    if(hasPerm("division_review")){
      const users=await getUsers();
      for(const d of divisions) counts[d]=users.filter(u=>u.division===d && !["Archivé","Refusé","En attente"].includes(u.status)).length;
    }
    $("content").innerHTML=`<div class="card"><div class="muted">Ma division actuelle</div><div class="stat">${esc(window.LSPD.profile.division||"Patrol")}</div></div>
      <div class="section-title">Divisions</div><div class="grid division-grid">${divisionInfo.map(d=>`<div class="card"><h3>${esc(d[0])}</h3><p class="muted">${esc(d[1])}</p>${hasPerm("division_review")?`<div class="row"><span>Effectif actuel</span><b>${counts[d[0]]||0}</b></div>`:""}${d[0]!==window.LSPD.profile.division?`<button class="btn secondary division-apply" data-division="${esc(d[0])}">Candidater</button>`:""}</div>`).join("")}</div>
      <div class="section-title">${hasPerm("division_review")?"Candidatures en attente":"Mes candidatures"}</div>
      <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Division</th><th>Motivation</th><th>Statut</th>${hasPerm("shifts_manage")?"<th>Action</th>":""}</tr></thead><tbody>
      ${applications.length?applications.map(a=>`<tr><td>${formatDate(a.createdAt)}</td><td>${esc(a.applicantName)}</td><td>${esc(a.targetDivision)}</td><td>${esc(a.motivation)}</td><td><span class="tag ${a.status==="Approuvé"?"green":a.status==="Refusé"?"red":"orange"}">${esc(a.status)}</span></td>${hasPerm("division_review")?`<td>${a.status==="En attente"?`<button class="btn secondary division-review" data-id="${a.id}" data-status="Approuvé">Approuver la candidature</button> <button class="btn secondary division-review" data-id="${a.id}" data-status="Refusé">Refuser la candidature</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucune candidature.</td></tr>'}
      </tbody></table></div>`;
    document.querySelectorAll(".division-apply").forEach(b=>b.onclick=()=>openDivisionApplication(b.dataset.division));
    document.querySelectorAll(".division-review").forEach(b=>b.onclick=()=>reviewDivisionApplication(b.dataset.id,b.dataset.status));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}
function openDivisionApplication(target){
  showModal(`<h2>Candidature division</h2><form id="divisionAppForm"><div class="detail-grid"><div><span>Ma division actuelle</span><b>${esc(window.LSPD.profile.division||"Patrol")}</b></div><div><span>Division souhaitée</span><b>${esc(target)}</b></div></div>
    <input id="divisionTarget" type="hidden" value="${esc(target)}">
    <label class="field full"><span>Motivation</span><textarea id="divisionMotivation" rows="6" required></textarea></label>
    <div id="divisionError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Envoyer ma candidature</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("divisionAppForm").onsubmit=saveDivisionApplication;
}
async function saveDivisionApplication(e){
  e.preventDefault();
  const target=$("divisionTarget").value;
  try{
    const mine=await getDocs(query(collection(db,"division_applications"),where("applicantId","==",window.LSPD.user.uid)));
    if(mine.docs.some(d=>d.data().targetDivision===target && d.data().status==="En attente")){
      $("divisionError").textContent="Une candidature est déjà en attente pour cette division."; return;
    }
    await addDoc(collection(db,"division_applications"),{
      applicantId:window.LSPD.user.uid,applicantName:window.LSPD.profile.name,
      currentDivision:window.LSPD.profile.division||"Patrol",targetDivision:target,
      motivation:$("divisionMotivation").value.trim(),status:"En attente",createdAt:serverTimestamp()
    });
    await addAudit("DIVISION_APPLICATION",window.LSPD.user.uid,target);
    document.querySelector(".modal")?.remove(); divisionsPage();
  }catch(err){ $("divisionError").textContent="Erreur : "+(err.code||err.message); }
}
async function reviewDivisionApplication(id,status){
  if(!hasPerm("division_review")) return;
  try{
    const s=await getDoc(doc(db,"division_applications",id));
    if(!s.exists()) return;
    const a=s.data();
    await updateDoc(doc(db,"division_applications",id),{
      status,reviewedById:window.LSPD.user.uid,reviewedByName:window.LSPD.profile.name,reviewedAt:serverTimestamp()
    });
    if(status==="Approuvé"){
      await updateDoc(doc(db,"users",a.applicantId),{division:a.targetDivision,updatedAt:serverTimestamp()});
      await createNotification(a.applicantId,"Candidature approuvée",`${a.targetDivision} — Ta division a été mise à jour.`,"Validation","divisionsPage");
    }else{
      await createNotification(a.applicantId,"Candidature refusée",a.targetDivision,"Validation","divisionsPage");
    }
    await addAudit("DIVISION_APPLICATION_"+(status==="Approuvé"?"APPROVED":"REJECTED"),a.applicantId,a.targetDivision);
    divisionsPage();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}


function updateClock(){
  const el=$("liveClock");
  if(!el) return;
  const now=new Date();
  el.textContent=now.toLocaleTimeString(currentLang==="en"?"en-US":"fr-FR",{hour:"2-digit",minute:"2-digit"});
}

function toggleSidebar(force){
  const collapsed=typeof force==="boolean" ? force : !document.body.classList.contains("sidebar-collapsed");
  document.body.classList.toggle("sidebar-collapsed",collapsed);
  localStorage.setItem("lspdSidebarCollapsed",collapsed?"1":"0");
}
function toggleMobileSidebar(open){
  const shouldOpen=typeof open==="boolean"?open:!document.body.classList.contains("sidebar-open");
  document.body.classList.toggle("sidebar-open",shouldOpen);
  $("sidebarBackdrop")?.classList.toggle("hidden",!shouldOpen);
}

function openCommandPalette(){
  const visible=[...document.querySelectorAll('#nav button[data-page]:not(.hidden)')].map(b=>({
    page:b.dataset.page,
    label:(b.querySelector(".nav-label")?.textContent||pages[b.dataset.page]||b.dataset.page).trim(),
    icon:(b.querySelector(".nav-icon")?.textContent||"").trim()
  }));
  showModal(`<div class="command-palette"><div class="command-palette-head"><span>⌘</span><input id="paletteInput" autofocus placeholder="Tape une page..."></div><div id="paletteResults" class="palette-results"></div></div>`);
  const input=$("paletteInput"), results=$("paletteResults");
  const paint=()=>{
    const q=(input.value||"").toLowerCase();
    const filtered=visible.filter(x=>x.label.toLowerCase().includes(q)).slice(0,12);
    results.innerHTML=filtered.length?filtered.map(x=>`<button class="palette-item" data-page="${x.page}"><span>${x.icon}</span><b>${esc(x.label)}</b></button>`).join(""):`<div class="palette-empty">Aucune page trouvée.</div>`;
    document.querySelectorAll(".palette-item").forEach(b=>b.onclick=()=>{document.querySelector(".modal")?.remove();render(b.dataset.page);});
  };
  input.oninput=paint;
  input.onkeydown=e=>{
    if(e.key==="Enter"){
      const first=results.querySelector(".palette-item");
      if(first){document.querySelector(".modal")?.remove();render(first.dataset.page);}
    }
  };
  paint();
  setTimeout(()=>input.focus(),30);
}

async function permissionsAdmin(){
  if(!isChief()) return;
  await loadPermissionsConfig();
  const gradesMap=permissionGrades();
  const permissionGradeList=gradeList.map(g=>g[0]);
  const renderGroup=group=>`<section class="permission-category-card card" data-permission-group="${esc(group.key)}">
    <div class="permission-category-head"><div><span class="eyebrow">${esc(group.label)}</span><h3>${esc(group.label)}</h3><p>${esc(group.description||"")}</p></div><div class="permission-category-actions"><span class="permission-count">${group.permissions.length} droits</span><button class="btn tiny secondary permission-group-grant" type="button" data-group="${esc(group.key)}">Autoriser catégorie</button><button class="btn tiny secondary permission-group-clear" type="button" data-group="${esc(group.key)}">Retirer catégorie</button></div></div>
    <div class="table-card permission-table-card"><table class="table permission-table"><thead><tr><th>Permission</th>${permissionGradeList.map(g=>`<th>${esc(g)}</th>`).join("")}</tr></thead><tbody>
    ${group.permissions.map(([key,label,description])=>`<tr><td class="permission-name"><b>${esc(label)}</b><small>${esc(description||key)}</small><code>${esc(key)}</code></td>${permissionGradeList.map(g=>{
      const minBlocked=!permissionMinimumAllows(key,g);
      const locked=g==="Chief of Police" || g==="Visiteur" || minBlocked;
      const checked=g==="Chief of Police" || (!locked && (gradesMap[g]||[]).includes(key));
      return `<td><label class="permission-check ${minBlocked?"minimum-blocked":""}" title="${minBlocked?`Réservé à ${PERMISSION_MIN_GRADE[key]} et plus`:""}"><input type="checkbox" data-grade="${esc(g)}" data-permission="${esc(key)}" ${checked?"checked":""} ${locked?"disabled":""}><span></span></label></td>`;
    }).join("")}</tr>`).join("")}
    </tbody></table></div></section>`;
  $("content").innerHTML=`<div class="card permission-hero"><div><span class="eyebrow">SECURITY & ACCESS — 17.11.6</span><h2>Centre de permissions par grade</h2><p class="muted">Les permissions sont séparées par action. <b>Chief of Police possède toujours un bypass complet</b>, même si une catégorie de menu est masquée.</p></div><div class="shield-mark">🔐</div></div>
  <div class="card permission-audit-banner"><b>Audit sécurité appliqué</b><span>Inscriptions, recrutement, personnel, FTO, rapports et MDT utilisent maintenant des droits dédiés. Les anciennes permissions ont été migrées automatiquement.</span></div>
  <div class="toolbar permission-toolbar"><button class="btn" id="savePermissionsBtn">Enregistrer les permissions</button><button class="btn secondary" id="resetPermissionsBtn">Réinitialiser les valeurs par défaut</button><select id="permissionBulkGrade" class="search">${permissionGradeList.filter(g=>!["Visiteur","Chief of Police"].includes(g)).map(g=>`<option>${esc(g)}</option>`).join("")}</select><button class="btn secondary" id="permissionGrantAll">Tout autoriser au grade</button><button class="btn secondary" id="permissionClearAll">Tout retirer du grade</button></div>
  <div class="permission-categories">${PERMISSION_GROUPS.map(renderGroup).join("")}</div>`;
  $("savePermissionsBtn").onclick=savePermissions;
  $("resetPermissionsBtn").onclick=resetPermissionsDefaults;
  $("permissionGrantAll").onclick=()=>{const g=$("permissionBulkGrade").value;document.querySelectorAll(`input[data-grade="${CSS.escape(g)}"][data-permission]`).forEach(x=>{if(!x.disabled)x.checked=true;});};
  $("permissionClearAll").onclick=()=>{const g=$("permissionBulkGrade").value;document.querySelectorAll(`input[data-grade="${CSS.escape(g)}"][data-permission]`).forEach(x=>{if(!x.disabled)x.checked=false;});};
  document.querySelectorAll(".permission-group-grant").forEach(btn=>btn.onclick=()=>{const g=$("permissionBulkGrade").value;const keys=PERMISSION_GROUPS.find(x=>x.key===btn.dataset.group)?.permissions.map(x=>x[0])||[];keys.forEach(key=>{const box=document.querySelector(`input[data-grade="${CSS.escape(g)}"][data-permission="${CSS.escape(key)}"]`);if(box&&!box.disabled)box.checked=true;});});
  document.querySelectorAll(".permission-group-clear").forEach(btn=>btn.onclick=()=>{const g=$("permissionBulkGrade").value;const keys=PERMISSION_GROUPS.find(x=>x.key===btn.dataset.group)?.permissions.map(x=>x[0])||[];keys.forEach(key=>{const box=document.querySelector(`input[data-grade="${CSS.escape(g)}"][data-permission="${CSS.escape(key)}"]`);if(box&&!box.disabled)box.checked=false;});});
}
async function savePermissions(){
  if(!isChief()) return;
  const gradesMap={};
  for(const [g] of gradeList){
    gradesMap[g]=g==="Chief of Police"?PERMISSION_CATALOG.map(x=>x[0]):g==="Visiteur"?[]:
      [...document.querySelectorAll(`input[data-grade="${CSS.escape(g)}"][data-permission]:checked`)].map(x=>x.dataset.permission).filter(p=>permissionMinimumAllows(p,g));
  }
  try{
    await setDoc(doc(db,"settings","permissions"),{grades:gradesMap,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp(),catalogVersion:22});
    window.LSPD.permissionConfig={grades:gradesMap,catalogVersion:22};
    await addAudit("PERMISSIONS_UPDATED","settings/permissions","Permissions détaillées par grade — catalog v22");
    applyRoleVisibility();showToast("Permissions par grade enregistrées.","success");
  }catch(err){ showToast("Erreur : "+(err.code||err.message),"error"); }
}
async function resetPermissionsDefaults(){
  if(!isChief()) return;
  if(!confirm("Réinitialiser les permissions par grade aux valeurs par défaut ?")) return;
  try{
    const gradesMap=JSON.parse(JSON.stringify(DEFAULT_GRADE_PERMISSIONS));
    for(const [g] of gradeList)gradesMap[g]=expandPermissionSet(gradesMap[g]||[],g);
    gradesMap["Chief of Police"]=PERMISSION_CATALOG.map(x=>x[0]);gradesMap.Visiteur=[];
    await setDoc(doc(db,"settings","permissions"),{grades:gradesMap,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp(),catalogVersion:22});
    window.LSPD.permissionConfig={grades:gradesMap,catalogVersion:22};showToast("Valeurs par défaut restaurées.","success");permissionsAdmin();
  }catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function cad(){
  if(!(hasPerm("cad_access")||hasPerm("cad_manage")))return;
  $("content").innerHTML=`<div class="cad-topline"><div><span class="eyebrow">COMPUTER AIDED DISPATCH</span><h2>CAD / Dispatch <span class="live-pill">● En direct</span></h2></div><button class="btn secondary" id="editMyCadBtn">Mon unité</button></div>
    <div id="cadUnitsGrid" class="cad-grid"><div class="card skeleton-card"></div><div class="card skeleton-card"></div></div>`;
  $("editMyCadBtn").onclick=()=>openMyCadUnit();

  const unsub=onSnapshot(collection(db,"cad_units"),snap=>{
    if(window.LSPD.currentPage!=="cad") return;
    const units=snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.active!==false).sort((a,b)=>(a.callSign||"").localeCompare(b.callSign||""));
    renderCadUnits(units);
  },err=>{
    $("cadUnitsGrid").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  });
  window.LSPD.pageCleanup=unsub;
}
function renderCadUnits(units){
  const host=$("cadUnitsGrid"); if(!host) return;
  host.innerHTML=units.length?units.map(u=>`<div class="cad-unit card ${u.status==="En intervention"?"cad-busy":u.status==="Disponible"?"cad-available":u.status==="Hors service"?"cad-off":""}">
    <div class="cad-unit-head"><div><span class="call-sign">${esc(u.callSign||"UNIT")}</span><h3>${esc(u.ownerName||"—")}${u.partnerName?` / ${esc(u.partnerName)}`:""}</h3></div><span class="unit-status">${esc(u.status||"Disponible")}</span></div>
    <div class="cad-meta"><span>📍 ${esc(u.location||"—")}</span><span>🏢 ${esc(u.division||"Patrol")}</span></div>
    ${u.note?`<p class="cad-note">${esc(u.note)}</p>`:""}
    <div class="cad-footer"><span class="muted">Actualisé ${formatDate(u.updatedAt||u.createdAt)}</span>${u.ownerId===window.LSPD.user.uid||hasPerm("cad_manage")?`<button class="btn secondary edit-cad-unit" data-id="${u.id}">Mettre à jour</button>`:""}</div>
  </div>`).join(""):'<div class="card"><p class="muted">Aucune unité active.</p></div>';
  document.querySelectorAll(".edit-cad-unit").forEach(b=>b.onclick=()=>openCadUnitEditor(b.dataset.id));
}
async function openMyCadUnit(){
  const snap=await getDocs(query(collection(db,"cad_units"),where("ownerId","==",window.LSPD.user.uid)));
  const current=snap.docs.map(d=>({id:d.id,...d.data()})).find(x=>x.active!==false);
  if(current) openCadUnitEditor(current.id);
  else openCadUnitEditor(null);
}
async function openCadUnitEditor(id=null){
  let u=null;
  if(id){
    const s=await getDoc(doc(db,"cad_units",id)); if(!s.exists()) return; u={id,...s.data()};
    if(u.ownerId!==window.LSPD.user.uid && !hasPerm("cad_manage")) return showToast("Accès refusé","error");
  }
  const defaultCall=`ADAM-${window.LSPD.profile.badge||"00"}`;
  showModal(`<h2>Unité CAD</h2><form id="cadUnitForm"><input id="cadUnitId" type="hidden" value="${esc(u?.id||"")}">
    <div class="formgrid">
      <label class="field"><span>Indicatif</span><input id="cadCallSign" required value="${esc(u?.callSign||defaultCall)}"></label>
      <label class="field"><span>Partenaire</span><input id="cadPartner" value="${esc(u?.partnerName||"")}"></label>
      <label class="field"><span>Division</span><select id="cadDivision">${divisions.map(d=>`<option ${d===(u?.division||window.LSPD.profile.division||"Patrol")?"selected":""}>${d}</option>`).join("")}</select></label>
      <label class="field"><span>État</span><select id="cadStatus">${CAD_STATUSES.map(s=>`<option ${s===(u?.status||"Disponible")?"selected":""}>${s}</option>`).join("")}</select></label>
      <label class="field full"><span>Localisation</span><input id="cadLocation" value="${esc(u?.location||"Mission Row")}"></label>
    </div>
    <label class="field full"><span>Note opérationnelle</span><textarea id="cadNote" rows="3">${esc(u?.note||"")}</textarea></label>
    <div id="cadError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">${u?"Mettre à jour":"Créer mon unité"}</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div>
  </form>`);
  $("cadUnitForm").onsubmit=saveCadUnit;
}
async function saveCadUnit(e){
  e.preventDefault();
  const id=$("cadUnitId").value;
  const payload={
    callSign:$("cadCallSign").value.trim(),partnerName:$("cadPartner").value.trim(),
    division:$("cadDivision").value,status:$("cadStatus").value,
    location:$("cadLocation").value.trim(),note:$("cadNote").value.trim(),
    active:true,updatedAt:serverTimestamp()
  };
  try{
    if(id){
      const s=await getDoc(doc(db,"cad_units",id)); if(!s.exists()) return;
      const u=s.data();
      if(u.ownerId!==window.LSPD.user.uid && !hasPerm("cad_manage")) return;
      await updateDoc(doc(db,"cad_units",id),payload);
      await addAudit("CAD_UNIT_UPDATE",id,`${payload.callSign} — ${payload.status}`);
    }else{
      await addDoc(collection(db,"cad_units"),{
        ...payload,ownerId:window.LSPD.user.uid,ownerName:window.LSPD.profile.name,createdAt:serverTimestamp()
      });
      await addAudit("CAD_UNIT_CREATE",window.LSPD.user.uid,payload.callSign);
    }
    document.querySelector(".modal")?.remove();
    showToast("Mettre à jour","success");
  }catch(err){$("cadError").textContent="Erreur : "+(err.code||err.message);}
}

async function bolos(){
  if(!(hasPerm("bolo_view")||hasPerm("bolo_manage")))return;
  try{
    const snap=await getDocs(collection(db,"bolos"));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const active=data.filter(x=>x.status!=="Clôturé");
    $("content").innerHTML=`<div class="toolbar"><div><span class="eyebrow">OFFICER SAFETY</span><h2>BOLO actifs</h2></div>${hasPerm("bolo_manage")?'<button class="btn danger-btn" id="newBoloBtn">+ Nouveau BOLO</button>':""}</div>
    <div class="bolo-grid">${active.length?active.map(b=>`<div class="card bolo-card priority-${String(b.priority||"Normal").toLowerCase()}"><div class="bolo-head"><span class="tag ${b.priority==="Critique"?"red":b.priority==="Important"?"orange":""}">${esc(b.priority||"Normal")}</span><span class="number">${esc(b.type)}</span></div><h3>${esc(b.title)}</h3><p>${esc(b.description)}</p>${b.plate?`<div class="plate-chip">🚘 ${esc(b.plate)}</div>`:""}<div class="cad-footer"><span class="muted">${esc(b.createdByName)} • ${formatDate(b.createdAt)}</span>${hasPerm("bolo_manage")?`<button class="btn secondary close-bolo" data-id="${b.id}">Clôturer le BOLO</button>`:""}</div></div>`).join(""):'<div class="card"><p class="muted">Aucun BOLO actif.</p></div>'}</div>`;
    $("newBoloBtn")?.addEventListener("click",openBoloForm);
    document.querySelectorAll(".close-bolo").forEach(b=>b.onclick=()=>closeBolo(b.dataset.id));
  }catch(err){$("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;}
}
function openBoloForm(){
  if(!hasPerm("bolo_manage")) return;
  showModal(`<h2>Nouveau BOLO</h2><form id="boloForm"><div class="formgrid">
    <label class="field"><span>Type</span><select id="boloType">${BOLO_TYPES.map(x=>`<option>${x}</option>`).join("")}</select></label>
    <label class="field"><span>Priorité</span><select id="boloPriority">${BOLO_PRIORITIES.map(x=>`<option>${x}</option>`).join("")}</select></label>
    <label class="field full"><span>Titre</span><input id="boloTitle" required></label>
    <label class="field"><span>Plaque</span><input id="boloPlate"></label>
  </div><label class="field full"><span>Description</span><textarea id="boloDescription" rows="6" required></textarea></label>
  <div id="boloError" class="error"></div><div class="modal-actions"><button class="btn danger-btn" type="submit">Publier le BOLO</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("boloForm").onsubmit=saveBolo;
}
async function saveBolo(e){
  e.preventDefault(); if(!hasPerm("bolo_manage")) return;
  try{
    const ref=await addDoc(collection(db,"bolos"),{
      type:$("boloType").value,priority:$("boloPriority").value,title:$("boloTitle").value.trim(),
      plate:$("boloPlate").value.trim(),description:$("boloDescription").value.trim(),status:"Actif",
      createdById:window.LSPD.user.uid,createdByName:window.LSPD.profile.name,createdAt:serverTimestamp()
    });
    await addAudit("BOLO_CREATE",ref.id,$("boloTitle").value.trim());
    document.querySelector(".modal")?.remove();bolos();
  }catch(err){$("boloError").textContent="Erreur : "+(err.code||err.message);}
}
async function closeBolo(id){
  if(!hasPerm("bolo_manage")) return;
  try{
    await updateDoc(doc(db,"bolos",id),{status:"Clôturé",closedById:window.LSPD.user.uid,closedByName:window.LSPD.profile.name,closedAt:serverTimestamp()});
    await addAudit("BOLO_CLOSE",id,"Clôturé"); bolos();
  }catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function watchCommand(){
  if(!(hasPerm("watch_view")||hasPerm("watch_manage")))return;
  try{
    const snap=await getDocs(collection(db,"watch_sessions"));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.startedAt?.seconds||0)-(a.startedAt?.seconds||0));
    const active=data.find(x=>x.status==="Actif");
    $("content").innerHTML=`<div class="watch-hero card">${active?`<div><span class="eyebrow">WATCH COMMAND</span><h2>Watch en cours</h2><div class="watch-commander">${esc(active.commanderName)}</div><p>${esc(active.briefing||"")}</p><span class="muted">${formatDate(active.startedAt)}</span></div>${hasPerm("watch_manage")?`<button class="btn" id="closeWatchBtn">Clôturer le watch</button>`:""}`:`<div><span class="eyebrow">WATCH COMMAND</span><h2>Aucun Watch Commander actif.</h2><p class="muted">Le commandement peut ouvrir un service et publier le briefing de prise de service.</p></div>${hasPerm("watch_manage")?`<button class="btn" id="startWatchBtn">Démarrer un watch</button>`:""}`}</div>
      <div class="section-title">Historique des watches</div><div class="card table-card"><table class="table"><thead><tr><th>Commander</th><th>Début</th><th>Statut</th><th>Briefing</th><th>Note de passation</th></tr></thead><tbody>${data.length?data.slice(0,20).map(w=>`<tr><td>${esc(w.commanderName)}</td><td>${formatDate(w.startedAt)}</td><td>${esc(w.status)}</td><td>${esc(w.briefing||"")}</td><td>${esc(w.passdown||"—")}</td></tr>`).join(""):'<tr><td colspan="5">Aucune entrée.</td></tr>'}</tbody></table></div>`;
    $("startWatchBtn")?.addEventListener("click",openStartWatch);
    $("closeWatchBtn")?.addEventListener("click",()=>openCloseWatch(active.id));
  }catch(err){$("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;}
}
async function openStartWatch(){
  if(!hasPerm("watch_manage")) return;
  let users=[{uid:window.LSPD.user.uid,...window.LSPD.profile}];
  if(hasPerm("personnel_view")){
    try{users=(await getUsers()).filter(u=>!["Visiteur","Applicant"].includes(u.role) && !["Archivé","Refusé","En attente"].includes(u.status));}catch{}
  }
  showModal(`<h2>Démarrer un watch</h2><form id="watchStartForm"><label class="field"><span>Commander</span><select id="watchCommander">${users.map(u=>`<option value="${u.uid}" data-name="${esc(u.name)}">${esc(u.badge||"—")} — ${esc(u.name)}</option>`).join("")}</select></label><label class="field full"><span>Briefing</span><textarea id="watchBriefing" rows="7" required></textarea></label><div id="watchError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Démarrer le service</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("watchStartForm").onsubmit=saveWatch;
}
async function saveWatch(e){
  e.preventDefault(); if(!hasPerm("watch_manage")) return;
  const s=$("watchCommander");
  try{
    const ref=await addDoc(collection(db,"watch_sessions"),{
      commanderId:s.value,commanderName:s.selectedOptions[0].dataset.name,
      briefing:$("watchBriefing").value.trim(),status:"Actif",
      startedById:window.LSPD.user.uid,startedByName:window.LSPD.profile.name,startedAt:serverTimestamp()
    });
    await addAudit("WATCH_START",ref.id,s.selectedOptions[0].dataset.name);
    document.querySelector(".modal")?.remove();watchCommand();
  }catch(err){$("watchError").textContent="Erreur : "+(err.code||err.message);}
}
function openCloseWatch(id){
  if(!hasPerm("watch_manage")) return;
  showModal(`<h2>Clôturer le watch</h2><form id="watchCloseForm"><label class="field full"><span>Note de passation</span><textarea id="watchPassdown" rows="7" required></textarea></label><div id="watchCloseError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Clôturer le watch</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("watchCloseForm").onsubmit=async e=>{
    e.preventDefault();
    try{
      await updateDoc(doc(db,"watch_sessions",id),{status:"Clôturé",passdown:$("watchPassdown").value.trim(),closedById:window.LSPD.user.uid,closedByName:window.LSPD.profile.name,closedAt:serverTimestamp()});
      await addAudit("WATCH_CLOSE",id,$("watchPassdown").value.trim());
      document.querySelector(".modal")?.remove();watchCommand();
    }catch(err){$("watchCloseError").textContent="Erreur : "+(err.code||err.message);}
  };
}



const TRAINING_CONTEXT_PAGES=new Set([
  "trainingCenter","trainingWorkspace","modules","trainingQuiz","trainingHub","calendar",
  "manual","ftoAcademy","ftoJournal","ftoFinal","ftoDossier","trainingAnalytics",
  "academyManager","myTrainingFeedback","evaluations","trainees","assignments","scenarios"
]);

function injectTrainingContextBar(page){
  // Phase 17.5: intentionally empty.
  // Navigation is centralized in the Training Center to keep onboarding simple.
}

function latestTrainingEvaluations(evals){
  const latest={};
  for(const e of evals){
    if(!e.moduleCode)continue;
    if(!latest[e.moduleCode] || (e.createdAt?.seconds||0)>(latest[e.moduleCode].createdAt?.seconds||0)){
      latest[e.moduleCode]=e;
    }
  }
  return latest;
}

function trainingModuleState(code,latest,sessions=[]){
  const evaluation=latest[code];
  if(evaluation?.result==="Validé")return {key:"validated",label:"Formation validée",score:Number(evaluation.score)||0};
  if(evaluation?.result==="Échec" || evaluation?.result==="À revoir")return {key:"retry",label:"Formation à refaire",score:Number(evaluation.score)||0};
  return {key:"ready",label:"Non évaluée",score:null};
}

function recommendTrainingModule(evals,sessions=[]){
  const latest=latestTrainingEvaluations(evals);
  for(const m of modules){
    const e=latest[m[0]];
    if(e && (e.result==="Échec"||e.result==="À revoir"))return m[0];
  }
  return modules.find(m=>!latest[m[0]])?.[0] || modules.find(m=>latest[m[0]]?.result!=="Validé")?.[0] || "M01";
}

function trainingProgressStats(evals,sessions=[]){
  const latest=latestTrainingEvaluations(evals);
  const scored=Object.values(latest).filter(e=>Number.isFinite(Number(e.score)));
  const validated=Object.values(latest).filter(e=>e.result==="Validé").length;
  const retry=Object.values(latest).filter(e=>e.result==="Échec"||e.result==="À revoir").length;
  return {
    latest,
    validated,
    retry,
    evaluated:Object.keys(latest).length,
    notEvaluated:Math.max(0,modules.length-Object.keys(latest).length),
    avg:scored.length?Math.round(scored.reduce((a,e)=>a+Number(e.score),0)/scored.length):0,
    next:recommendTrainingModule(evals,sessions)
  };
}

function trainingStageStrip(active=0){
  const stages=[["1","Formation"],["2","Évaluation"],["3","Résultat"]];
  return `<div class="training-stage-strip training-stage-strip-simple">${stages.map((s,i)=>`<div class="training-stage ${i<active?"done":i===active?"active":""}"><i>${i<active?"✓":s[0]}</i><span>${esc(s[1])}</span></div>`).join("")}</div>`;
}

function openTrainingWorkspace(uid){
  if(!uid)return;
  window.LSPD.selectedTraineeId=uid;
  render("trainingWorkspace");
}

function setTrainingCenterTab(tab){
  window.LSPD.trainingCenterTab=tab||"overview";
  trainingCenter();
}

function trainingCenterTabs(){
  const tabs=[
    ["overview","🏠","Vue d'ensemble",true],
    ["myTraining","🗓️","Mes formations",true],
    ["path","🛣️","Mon parcours",true],
    ["trainees","👥","Mes recrues",hasPerm("fto_tools")||hasPerm("academy_manage")],
    ["management","📊","Pilotage",hasPerm("fto_assignments_view")||hasPerm("training_manage")||hasPerm("academy_final_review")]
  ].filter(x=>x[3]);

  return `<div class="training-hub-tabs">${tabs.map(([id,icon,label])=>`
    <button type="button" class="${(window.LSPD.trainingCenterTab||"overview")===id?"active":""}" data-training-tab="${id}">
      <span>${icon}</span>${esc(label)}
    </button>`).join("")}</div>`;
}

async function loadTrainingCenterData(){
  const uid=window.LSPD.user.uid;
  const [eventSnap,myRegSnap,myEvalSnap,mySessionSnap,myObjectiveSnap,myQuizSnap,myAssignmentSnap]=await Promise.all([
    getDocs(collection(db,"training_events")),
    getDocs(query(collection(db,"training_registrations"),where("officerId","==",uid))),
    getDocs(query(collection(db,"evaluations"),where("officerId","==",uid))),
    getDocs(query(collection(db,"fto_sessions"),where("traineeId","==",uid))),
    getDocs(query(collection(db,"training_objectives"),where("traineeId","==",uid))),
    getDocs(query(collection(db,"academy_quiz_attempts"),where("officerId","==",uid))),
    getDocs(query(collection(db,"fto_assignments"),where("traineeId","==",uid)))
  ]);

  return {
    events:eventSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),
    myRegs:myRegSnap.docs.map(d=>({id:d.id,...d.data()})),
    myEvals:myEvalSnap.docs.map(d=>({id:d.id,...d.data()})),
    mySessions:mySessionSnap.docs.map(d=>({id:d.id,...d.data()})),
    myObjectives:myObjectiveSnap.docs.map(d=>({id:d.id,...d.data()})),
    myQuizzes:myQuizSnap.docs.map(d=>({id:d.id,...d.data()})),
    myAssignments:myAssignmentSnap.docs.map(d=>({id:d.id,...d.data()}))
  };
}

function trainingEventDateLabel(e){
  return `${esc(e.date||"—")} • ${esc(e.time||"—")}`;
}

function trainingEventCard(e,registration=null,{trainerView=false,participantCount=null}={}){
  const pending=registration?.status==="Invité";
  const declined=registration?.status==="Refusé";
  const confirmed=registration?.status==="Inscrit";
  return `<article class="training-event-pro-card ${pending?"invited":declined?"declined":confirmed?"confirmed":""}">
    <div class="training-event-pro-date">
      <b>${esc((e.date||"").slice(8,10)||"—")}</b>
      <span>${esc((e.date||"").slice(5,7)||"")}</span>
    </div>
    <div class="training-event-pro-main">
      <div class="training-event-pro-top">
        <span class="module-code">${esc(e.moduleCode||"—")}</span>
        ${pending?'<span class="tag orange">Invitation en attente</span>':declined?'<span class="tag red">Invitation refusée</span>':confirmed?'<span class="tag green">Inscrit</span>':""}
      </div>
      <h3>${esc(e.title||"Formation")}</h3>
      <p>${trainingEventDateLabel(e)} • ${esc(e.location||"LSPD")}</p>
      <small>Formateur : ${esc(e.trainerName||"—")}${participantCount!==null?` • ${participantCount}/${Number(e.capacity)||20} participants`:""}</small>
    </div>
    <div class="training-event-pro-actions">
      ${pending?`<button class="btn training-invite-response" data-reg="${registration.id}" data-event="${e.id}" data-response="accept">Accepter</button>
        <button class="btn secondary training-invite-response" data-reg="${registration.id}" data-event="${e.id}" data-response="decline">Refuser</button>`:""}
      ${confirmed?`<button class="btn secondary training-event-detail" data-event="${e.id}">Voir</button>`:""}
      ${trainerView?`<button class="btn training-manage-event" data-event="${e.id}">Gérer la formation</button>`:""}
    </div>
  </article>`;
}

async function renderTrainingOverview(data){
  const today=todayISO();
  const activeAssignment=data.myAssignments.filter(a=>a.status==="Active").sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))[0];
  const stats=trainingProgressStats(data.myEvals,data.mySessions);
  const nextModule=modules.find(m=>m[0]===stats.next);
  const pending=data.myRegs.filter(r=>r.status==="Invité");
  const confirmed=data.myRegs.filter(r=>r.status==="Inscrit");
  const nextEvent=data.events
    .filter(e=>e.date>=today && confirmed.some(r=>r.eventId===e.id))
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];

  let trainerUpcoming=[],trainerPendingCount=0;
  if(hasPerm("training_manage")){
    try{
      const allRegs=(await getDocs(collection(db,"training_registrations"))).docs.map(d=>d.data());
      trainerUpcoming=data.events.filter(e=>e.trainerId===window.LSPD.user.uid&&e.date>=today);
      trainerPendingCount=allRegs.filter(r=>r.status==="Invité"&&trainerUpcoming.some(e=>e.id===r.eventId)).length;
    }catch{}
  }

  $("trainingHubContent").innerHTML=`<div class="training-home-grid">
    <section class="training-home-main">
      ${pending.length?`<div class="training-priority-card">
        <div><span class="eyebrow">À FAIRE</span><h2>${pending.length} invitation${pending.length===1?"":"s"} à une formation</h2><p>Réponds aux invitations pour confirmer ta place.</p></div>
        <button class="btn" data-open-tab="myTraining">Voir mes invitations</button>
      </div>`:""}

      <div class="training-simple-cards">
        <button class="training-simple-card" data-open-tab="path">
          <span>🛣️</span><div><small>Mes validations</small><b>${stats.validated} formation(s) validée(s)</b><p>Suggestion : ${esc(stats.next)} — ${esc(nextModule?.[1]||"Formation")} • non obligatoire</p></div>
        </button>
        <button class="training-simple-card" data-open-tab="myTraining">
          <span>🗓️</span><div><small>Formation à venir</small><b>${nextEvent?esc(nextEvent.title):"Aucune formation confirmée"}</b><p>${nextEvent?`${esc(nextEvent.date)} • ${esc(nextEvent.time)} • ${esc(nextEvent.location||"LSPD")}`:"Consulte les formations disponibles ou attends une invitation."}</p></div>
        </button>
        <div class="training-simple-card static">
          <span>👮</span><div><small>Mon FTO</small><b>${esc(activeAssignment?.ftoName||"Aucun FTO actif")}</b><p>${data.myObjectives.filter(o=>o.status==="Ouvert").length} objectif(s) pédagogique(s) ouvert(s)</p></div>
        </div>
      </div>

      <div class="training-section-heading"><div><span class="eyebrow">PARCOURS</span><h2>Progression rapide</h2></div><button class="link-btn" data-open-tab="path">Voir les 16 modules →</button></div>
      <div class="training-progress-compact">${modules.map(m=>{
        const s=trainingModuleState(m[0],stats.latest,data.mySessions);
        return `<button class="${s.key}" data-module="${m[0]}" title="${esc(m[1])}"><b>${m[0]}</b><span>${s.key==="validated"?"✓":s.key==="locked"?"🔒":""}</span></button>`;
      }).join("")}</div>
    </section>

    <aside class="training-home-side">
      ${hasPerm("training_manage")?`<button class="training-create-primary" id="createTrainingPrimary"><span>＋</span><div><b>Créer une formation</b><small>Planifier + inviter directement les participants</small></div></button>
      <div class="card training-fto-summary"><h3>Mon activité FTO</h3><div class="row"><span>Formations à venir</span><b>${trainerUpcoming.length}</b></div><div class="row"><span>Invitations sans réponse</span><b>${trainerPendingCount}</b></div><button class="btn secondary" data-open-tab="trainees">Mes recrues</button></div>`:""}
      <div class="card training-shortcuts"><h3>Raccourcis</h3>
        <button data-action="quiz">🧠 Quiz & connaissances</button>
        <button data-action="feedback">💬 Donner un feedback</button>
        ${hasPerm("fto_evaluations_create")?'<button data-action="eval">✅ Nouvelle évaluation</button>':""}
        ${hasPerm("academy_manage")?'<button data-action="academy">📚 Guide FTO / Academy</button>':""}
      </div>
    </aside>
  </div>`;

  document.querySelectorAll("[data-open-tab]").forEach(b=>b.onclick=()=>setTrainingCenterTab(b.dataset.openTab));
  document.querySelectorAll(".training-progress-compact [data-module]").forEach(b=>b.onclick=()=>openTrainingModuleContext(b.dataset.module,window.LSPD.user.uid));
  $("createTrainingPrimary")?.addEventListener("click",openTrainingCreationWizard);
  document.querySelector('[data-action="quiz"]')?.addEventListener("click",()=>render("trainingQuiz"));
  document.querySelector('[data-action="feedback"]')?.addEventListener("click",()=>render("myTrainingFeedback"));
  document.querySelector('[data-action="eval"]')?.addEventListener("click",()=>openEvaluationForm());
  document.querySelector('[data-action="academy"]')?.addEventListener("click",()=>render("ftoAcademy"));
}

async function renderMyTrainingTab(data){
  const today=todayISO();
  const regMap=new Map(data.myRegs.map(r=>[r.eventId,r]));
  const myEvents=data.events.filter(e=>regMap.has(e.id)&&e.date>=today);
  const pending=myEvents.filter(e=>regMap.get(e.id)?.status==="Invité");
  const confirmed=myEvents.filter(e=>regMap.get(e.id)?.status==="Inscrit");
  const declined=myEvents.filter(e=>regMap.get(e.id)?.status==="Refusé");

  let trainerEvents=[],allRegs=[];
  if(hasPerm("training_manage")){
    try{
      allRegs=(await getDocs(collection(db,"training_registrations"))).docs.map(d=>({id:d.id,...d.data()}));
      trainerEvents=data.events.filter(e=>e.trainerId===window.LSPD.user.uid&&e.date>=today);
    }catch{}
  }

  $("trainingHubContent").innerHTML=`<div class="training-section-heading"><div><span class="eyebrow">MES FORMATIONS</span><h2>Invitations & planning</h2><p>Tout ce qui te concerne est regroupé ici.</p></div>${hasPerm("training_manage")?'<button class="btn" id="createTrainingFromTab">+ Créer une formation</button>':""}</div>
  ${pending.length?`<section class="training-block"><h3>🔔 Invitations en attente <span class="count-pill">${pending.length}</span></h3><div class="training-event-pro-list">${pending.map(e=>trainingEventCard(e,regMap.get(e.id))).join("")}</div></section>`:""}
  <section class="training-block"><h3>✅ Formations confirmées</h3><div class="training-event-pro-list">${confirmed.length?confirmed.map(e=>trainingEventCard(e,regMap.get(e.id))).join(""):'<div class="training-empty-state"><span>🗓️</span><b>Aucune formation confirmée</b><p>Une invitation acceptée apparaîtra ici.</p></div>'}</div></section>
  ${declined.length?`<details class="training-declined"><summary>Invitations refusées (${declined.length})</summary><div class="training-event-pro-list">${declined.map(e=>trainingEventCard(e,regMap.get(e.id))).join("")}</div></details>`:""}
  ${hasPerm("training_manage")?`<section class="training-block"><div class="training-section-heading compact"><div><h3>🎓 Mes formations créées</h3><p>Gère les invités et les présences.</p></div></div><div class="training-event-pro-list">${trainerEvents.length?trainerEvents.map(e=>{
    const count=allRegs.filter(r=>r.eventId===e.id&&r.status!=="Annulée"&&r.status!=="Refusé").length;
    return trainingEventCard(e,null,{trainerView:true,participantCount:count});
  }).join(""):'<div class="training-empty-state"><span>＋</span><b>Aucune formation créée</b><p>Crée ta première formation et invite directement les participants.</p></div>'}</div></section>`:""}`;

  $("createTrainingFromTab")?.addEventListener("click",openTrainingCreationWizard);
  document.querySelectorAll(".training-invite-response").forEach(b=>b.onclick=()=>respondTrainingInvitation(b.dataset.reg,b.dataset.response,b.dataset.event));
  document.querySelectorAll(".training-event-detail").forEach(b=>b.onclick=()=>openTrainingEventDetail(b.dataset.event));
  document.querySelectorAll(".training-manage-event").forEach(b=>b.onclick=()=>openTrainingEventManager(b.dataset.event));
}

async function renderTrainingPathTab(data){
  const stats=trainingProgressStats(data.myEvals,[]);
  $("trainingHubContent").innerHTML=`<div class="training-section-heading">
    <div><span class="eyebrow">MES FORMATIONS</span><h2>M01–M16</h2><p>Chaque formation est indépendante. Tu peux valider M03 même si M01 n'est pas encore faite.</p></div>
    <div class="training-independent-score"><b>${stats.validated}</b><span>validée(s)</span></div>
  </div>
  <div class="training-path-legend simple">
    <span class="validated">● Formation validée</span>
    <span class="ready">● Non évaluée</span>
    <span class="review">● Formation à refaire</span>
  </div>
  <div class="training-path-cards professional">${modules.map((m,i)=>{
    const e=stats.latest[m[0]];
    const state=trainingModuleState(m[0],stats.latest,[]);
    const quiz=data.myQuizzes.filter(q=>q.moduleCode===m[0]).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))[0];
    return `<button class="training-path-card ${state.key}" data-module="${m[0]}" type="button">
      <div class="training-path-index">${String(i+1).padStart(2,"0")}</div>
      <div class="training-path-content">
        <div><span class="module-code">${m[0]}</span></div>
        <h3>${esc(m[1])}</h3>
        <p>${esc(m[2])}</p>
        <small>${e?`Dernière évaluation : ${e.score}/100 • ${esc(e.result)}`:"Pas encore évaluée"}${quiz?` • Quiz ${quiz.percentage}%`:""}</small>
      </div>
      <div class="training-path-state"><span>${state.key==="validated"?"✓":state.key==="retry"?"↻":"→"}</span><b>${esc(state.label)}</b></div>
    </button>`;
  }).join("")}</div>`;
  document.querySelectorAll(".training-path-card").forEach(b=>b.onclick=()=>openTrainingModuleContext(b.dataset.module,window.LSPD.user.uid));
}
async function renderTrainingTraineesTab(){
  if(!(hasPerm("fto_tools")||hasPerm("academy_manage"))){
    $("trainingHubContent").innerHTML='<div class="training-empty-state"><span>🔒</span><b>Accès FTO requis</b></div>';
    return;
  }

  const trainees=await accessibleTrainees();
  const [es,os,as]=await Promise.all([
    getDocs(collection(db,"evaluations")),
    getDocs(collection(db,"training_objectives")),
    getDocs(collection(db,"fto_assignments"))
  ]);
  const evals=es.docs.map(d=>d.data()),objectives=os.docs.map(d=>d.data()),assignments=as.docs.map(d=>d.data());

  $("trainingHubContent").innerHTML=`<div class="training-section-heading">
    <div><span class="eyebrow">MES RECRUES</span><h2>Suivi pédagogique</h2><p>Pour chaque recrue : planifier une formation, la réaliser une fois, puis l'évaluer.</p></div>
    <button class="btn" id="quickNewSession">+ Créer une formation</button>
  </div>
  <div class="training-trainee-grid simplified">${trainees.length?trainees.map(t=>{
    const te=evals.filter(e=>e.officerId===t.uid),to=objectives.filter(o=>o.traineeId===t.uid&&o.status==="Ouvert"),st=trainingProgressStats(te,[]),next=modules.find(m=>m[0]===st.next),assignment=assignments.find(a=>a.traineeId===t.uid&&a.status==="Active");
    return `<article class="training-trainee-pro-card">
      <header>
        <div class="training-workspace-avatar small">${esc((t.name||"?").slice(0,1).toUpperCase())}</div>
        <div><span>${esc(t.badge)}</span><h3>${esc(t.name)}</h3><p>${esc(t.grade)} • ${esc(t.division||"Patrol")}</p></div>
        <div class="training-trainee-percent"><b>${st.validated}</b><small>validée(s)</small></div>
      </header>
      <div class="training-trainee-pro-info">
        <div><span>FTO actif</span><b>${esc(assignment?.ftoName||"—")}</b></div>
        <div><span>Suggestion</span><b>${esc(st.next)} — ${esc(next?.[1]||"")}</b></div>
        <div><span>À refaire</span><b>${st.retry}</b></div>
      </div>
      <footer>
        <button class="btn trainee-open-workspace" data-id="${t.uid}">Ouvrir le dossier</button>
        <button class="btn secondary trainee-start-session" data-id="${t.uid}" data-module="${st.next}">🗓️ Planifier</button>
        <button class="btn secondary trainee-evaluate" data-id="${t.uid}" data-module="${st.next}">✅ Évaluer</button>
      </footer>
    </article>`;
  }).join(""):'<div class="training-empty-state"><span>👥</span><b>Aucune recrue assignée</b><p>Le Commandement doit d’abord créer une affectation FTO.</p></div>'}</div>`;

  $("quickNewSession")?.addEventListener("click",()=>openTrainingCreationWizard());
  document.querySelectorAll(".trainee-open-workspace").forEach(b=>b.onclick=()=>openTrainingWorkspace(b.dataset.id));
  document.querySelectorAll(".trainee-start-session").forEach(b=>b.onclick=()=>openTrainingCreationWizard(b.dataset.module,[b.dataset.id]));
  document.querySelectorAll(".trainee-evaluate").forEach(b=>b.onclick=()=>openEvaluationForm(b.dataset.id,b.dataset.module,null));
}
async function renderTrainingManagementTab(){
  $("trainingHubContent").innerHTML=`<div class="training-section-heading"><div><span class="eyebrow">PILOTAGE</span><h2>Gestion du programme</h2><p>Les fonctions avancées restent disponibles, sans encombrer l’utilisation quotidienne.</p></div>${hasPerm("training_manage")?'<button class="btn" id="managementCreateTraining">+ Créer une formation</button>':""}</div>
  <div class="training-management-grid">
    ${canAccessPage("assignments")?'<button data-page="assignments"><span>🔗</span><b>Affectations FTO</b><p>Relier une recrue à un FTO.</p></button>':""}
    ${canAccessPage("ftoFinal")?'<button data-page="ftoFinal"><span>🏁</span><b>Validations finales</b><p>Décision de fin de parcours.</p></button>':""}
    ${canAccessPage("trainingAnalytics")?'<button data-page="trainingAnalytics"><span>📊</span><b>Statistiques formation</b><p>Performance modules et activité FTO.</p></button>':""}
    ${canAccessPage("ftoJournal")?'<button data-page="ftoJournal"><span>📝</span><b>Sessions & objectifs</b><p>Journal pédagogique global.</p></button>':""}
    ${canAccessPage("ftoAcademy")?'<button data-page="ftoAcademy"><span>📚</span><b>Academy / Guide FTO</b><p>Contenu pédagogique détaillé.</p></button>':""}
    ${canAccessPage("academyManager")?'<button data-page="academyManager"><span>⚙️</span><b>Configuration Academy</b><p>Modifier modules et scénarios.</p></button>':""}
    ${canAccessPage("calendar")?'<button data-page="calendar"><span>🗓️</span><b>Ancien calendrier</b><p>Vue détaillée des événements.</p></button>':""}
    ${canAccessPage("manual")?'<button data-page="manual"><span>📖</span><b>Manuel FTO</b><p>Standards et doctrine.</p></button>':""}
  </div>`;

  $("managementCreateTraining")?.addEventListener("click",openTrainingCreationWizard);
  document.querySelectorAll(".training-management-grid [data-page]").forEach(b=>b.onclick=()=>render(b.dataset.page));
}

async function trainingCenter(){
  if(!isInternal() || !(hasPerm("training_access")||hasPerm("training_manage")||hasPerm("training_invites_manage")||hasPerm("training_attendance_manage")))return;
  await loadAcademyOverrides();
  window.LSPD.trainingCenterTab??="overview";

  $("content").innerHTML=`<div class="training-hub-pro">
    <header class="training-hub-pro-header">
      <div><span class="eyebrow">LSPD TRAINING</span><h1>Centre Formation</h1><p>Formations, invitations, parcours et suivi FTO — au même endroit.</p></div>
      ${hasPerm("training_manage")?'<button class="btn training-create-header" id="trainingCreateHeader">＋ Créer une formation</button>':""}
    </header>
    ${trainingCenterTabs()}
    <main id="trainingHubContent" class="training-hub-content"><div class="training-loading"><div class="notification-loader"></div><span>Chargement...</span></div></main>
  </div>`;

  document.querySelectorAll("[data-training-tab]").forEach(b=>b.onclick=()=>setTrainingCenterTab(b.dataset.trainingTab));
  $("trainingCreateHeader")?.addEventListener("click",openTrainingCreationWizard);

  try{
    const data=await loadTrainingCenterData();
    const tab=window.LSPD.trainingCenterTab||"overview";
    if(tab==="overview")await renderTrainingOverview(data);
    else if(tab==="myTraining")await renderMyTrainingTab(data);
    else if(tab==="path")await renderTrainingPathTab(data);
    else if(tab==="trainees")await renderTrainingTraineesTab();
    else if(tab==="management")await renderTrainingManagementTab();
    else {window.LSPD.trainingCenterTab="overview";await renderTrainingOverview(data);}
  }catch(err){
    $("trainingHubContent").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}
async function trainingWorkspace(){
  if(!(hasPerm("academy_manage")||hasPerm("fto_tools")))return;
  await loadAcademyOverrides();

  const uid=window.LSPD.selectedTraineeId;
  if(!uid){showToast("Sélectionne une recrue depuis le Centre Formation.","warning");return render("trainingCenter");}

  const trainees=await accessibleTrainees();
  const trainee=trainees.find(t=>t.uid===uid);
  if(!trainee){showToast("Cette recrue n'est pas accessible.","error");window.LSPD.selectedTraineeId=null;return render("trainingCenter");}

  const [es,os,qs,hs,fbs,as,eventSnap,regSnap,legacySessionSnap]=await Promise.all([
    getDocs(collection(db,"evaluations")),
    getDocs(collection(db,"training_objectives")),
    getDocs(collection(db,"academy_quiz_attempts")),
    getDocs(collection(db,"fto_handoffs")),
    getDocs(collection(db,"fto_feedback")),
    getDocs(collection(db,"fto_assignments")),
    getDocs(collection(db,"training_events")),
    getDocs(query(collection(db,"training_registrations"),where("officerId","==",uid))),
    getDocs(collection(db,"fto_sessions"))
  ]);

  const evals=es.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.officerId===uid);
  const objectives=os.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.traineeId===uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const quizzes=qs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.officerId===uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const handoffs=hs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.traineeId===uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const feedback=fbs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.traineeId===uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const assignment=as.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.traineeId===uid&&x.status==="Active").sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))[0];
  const events=eventSnap.docs.map(d=>({id:d.id,...d.data()}));
  const regs=regSnap.docs.map(d=>({id:d.id,...d.data()}));
  const legacySessions=legacySessionSnap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.traineeId===uid);

  const stats=trainingProgressStats(evals,[]);
  const next=modules.find(m=>m[0]===stats.next);
  const openObjectives=objectives.filter(o=>o.status==="Ouvert");
  const today=todayISO();

  const activeRegs=regs.filter(r=>["Invité","Inscrit"].includes(r.status));
  const upcomingEvents=events.filter(e=>e.date>=today&&activeRegs.some(r=>r.eventId===e.id)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const nextEvent=upcomingEvents[0];
  const nextReg=nextEvent?activeRegs.find(r=>r.eventId===nextEvent.id):null;

  const moduleRows=modules.map(m=>{
    const ev=stats.latest[m[0]];
    let key="ready",label="Non évaluée";
    if(ev?.result==="Validé"){key="validated";label="Formation validée";}
    else if(ev){key="retry";label="Formation à refaire";}
    const scheduled=upcomingEvents.find(e=>e.moduleCode===m[0]);
    if(!ev&&scheduled){key="scheduled";label="Formation planifiée";}
    return {m,ev,key,label,scheduled};
  });

  $("content").innerHTML=`<div class="training-workspace-head card simplified-workspace-head">
    <button class="training-back-btn" id="trainingBackBtn">← Retour au Centre Formation</button>
    <div class="training-workspace-person">
      <div class="training-workspace-avatar">${esc((trainee.name||"?").slice(0,1).toUpperCase())}</div>
      <div><span class="number">${esc(trainee.badge)}</span><h2>${esc(trainee.name)}</h2><p>${esc(trainee.grade)} • ${esc(trainee.division||"Patrol")} • ${esc(trainee.status)}</p></div>
    </div>
    <div class="training-workspace-assignment"><span>FTO actif</span><b>${esc(assignment?.ftoName||"Aucune affectation active")}</b></div>
  </div>

  <div class="one-training-philosophy card">
    <div><span>1</span><b>Une formation</b><small>Contenu + pratique réalisés en une fois.</small></div>
    <i>→</i>
    <div><span>2</span><b>Une évaluation</b><small>Le FTO évalue à la fin.</small></div>
    <i>→</i>
    <div><span>3</span><b>Un résultat</b><small>Validée ou à refaire, indépendamment des autres.</small></div>
  </div>

  <section class="continue-training-card ${nextEvent?"scheduled":""}">
    <div class="continue-training-copy">
      <span class="eyebrow">ACTION PRINCIPALE</span>
      <h2>Continuer la formation de ${esc(trainee.name)}</h2>
      ${nextEvent
        ?`<p><b>${esc(nextEvent.moduleCode)} — ${esc(nextEvent.title)}</b> est ${nextReg?.status==="Invité"?"en attente de réponse":"planifiée"} le ${esc(nextEvent.date)} à ${esc(nextEvent.time)}.</p>`
        :`<p>Aucune formation n'est planifiée. Suggestion : <b>${esc(stats.next)} — ${esc(next?.[1]||"Formation")}</b>. Tu peux choisir n'importe quelle autre formation.</p>`}
    </div>
    <div class="continue-training-actions">
      ${nextEvent
        ?`<button class="btn" id="workspaceManageTrainingBtn">${nextEvent.trainerId===window.LSPD.user.uid?"Gérer la formation":"Voir la formation"}</button>`
        :`<button class="btn" id="workspacePlanTrainingBtn">＋ Planifier ${esc(stats.next)} pour ${esc(trainee.name)}</button>`}
      <button class="btn secondary" id="workspaceChooseTrainingBtn">Choisir une autre formation</button>
    </div>
  </section>

  <div class="training-result-summary">
    <div class="validated"><span>✅ Formations validées</span><b>${stats.validated}</b></div>
    <div class="retry"><span>↻ À refaire</span><b>${stats.retry}</b></div>
    <div class="neutral"><span>○ Non évaluées</span><b>${stats.notEvaluated}</b></div>
    <div class="score"><span>Moyenne des évaluations</span><b>${stats.avg?stats.avg+"/100":"—"}</b></div>
  </div>

  <div class="workspace-secondary-actions">
    <button id="workspaceEvalBtn">✅ Évaluer une formation</button>
    <button id="workspaceObjectiveBtn">🎯 Ajouter un objectif</button>
    <button id="workspaceDossierBtn">🗂️ Dossier complet</button>
    <button id="workspaceHandoffBtn">🔄 Passation FTO</button>
  </div>

  <div class="training-section-heading"><div><span class="eyebrow">FORMATIONS</span><h2>Résultats par formation</h2><p>Chaque formation est indépendante. Aucune formation ne bloque les autres.</p></div></div>
  <div class="independent-training-grid">${moduleRows.map(({m,ev,key,label,scheduled})=>`
    <button class="independent-training-tile ${key}" data-module="${m[0]}" type="button">
      <div class="independent-training-code">${m[0]}</div>
      <div><b>${esc(m[1])}</b><small>${esc(label)}${ev?` • ${ev.score}/100`:scheduled?` • ${esc(scheduled.date)} ${esc(scheduled.time)}`:""}</small></div>
      <span>${key==="validated"?"✓":key==="retry"?"↻":key==="scheduled"?"🗓️":"→"}</span>
    </button>`).join("")}</div>

  <div class="grid2 training-workspace-columns simplified-history">
    <div class="card">
      <div class="training-card-title"><h3>🎯 Objectifs de correction</h3><button class="link-btn" id="workspaceObjectiveSmall">+ Ajouter</button></div>
      ${openObjectives.length?openObjectives.slice(0,8).map(o=>`<div class="objective-item compact"><div><span class="tag ${o.priority==="Critique"?"red":o.priority==="Haute"?"orange":""}">${esc(o.priority)}</span><p>${esc(o.text)}</p></div><span class="tag orange">${esc(o.status)}</span></div>`).join(""):'<p class="muted">Aucun objectif ouvert.</p>'}
    </div>
    <div class="card">
      <h3>✅ Derniers résultats</h3>
      ${evals.length?evals.slice().sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,8).map(e=>`<div class="training-history-row"><span><b>${esc(e.moduleCode)} • ${esc(e.moduleTitle)}</b><small>${esc(e.ftoName)} • ${formatDate(e.createdAt)}</small></span><span class="tag ${e.result==="Validé"?"green":e.result==="Échec"?"red":"orange"}">${esc(e.result)} • ${e.score}/100</span></div>`).join(""):'<p class="muted">Aucune formation évaluée.</p>'}
    </div>
    ${legacySessions.length?`<details class="card legacy-fto-history"><summary>Ancien historique FTO (${legacySessions.length})</summary><p class="muted">Ces anciennes séances sont conservées, mais ne sont plus utilisées dans le nouveau workflow.</p></details>`:""}
    <div class="card">
      <h3>💬 Feedback & passation</h3>
      ${feedback.length?`<div class="training-note"><b>Dernier feedback • ${feedback[0].understanding}/5</b><p>${esc(feedback[0].difficulty||"—")}</p></div>`:'<p class="muted">Aucun feedback.</p>'}
      ${handoffs.length?`<div class="training-note"><b>Dernière passation • ${esc(handoffs[0].authorName)}</b><p>${esc(handoffs[0].note)}</p></div>`:""}
    </div>
  </div>`;

  $("trainingBackBtn").onclick=()=>{window.LSPD.trainingCenterTab="trainees";render("trainingCenter");};
  $("workspacePlanTrainingBtn")?.addEventListener("click",()=>openTrainingCreationWizard(stats.next,[uid]));
  $("workspaceManageTrainingBtn")?.addEventListener("click",()=>{
    if(nextEvent.trainerId===window.LSPD.user.uid||hasPerm("training_manage"))openTrainingEventManager(nextEvent.id);
    else openTrainingEventDetail(nextEvent.id);
  });
  $("workspaceChooseTrainingBtn").onclick=()=>openTraineeTrainingPicker(uid);
  $("workspaceEvalBtn").onclick=()=>openEvaluationForm(uid,null,null);
  $("workspaceObjectiveBtn").onclick=()=>openObjectiveForm(uid);
  $("workspaceObjectiveSmall").onclick=()=>openObjectiveForm(uid);
  $("workspaceDossierBtn").onclick=()=>{window.LSPD.selectedTraineeId=uid;render("ftoDossier");};
  $("workspaceHandoffBtn").onclick=()=>openHandoffForm(uid,trainees);
  document.querySelectorAll(".independent-training-tile").forEach(b=>b.onclick=()=>openTrainingModuleContext(b.dataset.module,uid));
}

function openTraineeTrainingPicker(traineeId){
  showModal(`<h2>Choisir une formation</h2>
    <p class="muted">Toutes les formations sont accessibles indépendamment.</p>
    <div class="training-picker-grid">${modules.map(m=>`<button class="training-picker-module" data-module="${m[0]}"><span>${m[0]}</span><b>${esc(m[1])}</b></button>`).join("")}</div>
    <div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
  document.querySelectorAll(".training-picker-module").forEach(b=>b.onclick=()=>{
    document.querySelector(".modal")?.remove();
    openTrainingCreationWizard(b.dataset.module,[traineeId]);
  });
}

async function openTrainingModuleContext(code,traineeId=null){
  await loadAcademyOverrides();
  const m=modules.find(x=>x[0]===code),data=getAcademyData(code);
  if(!m||!data)return;

  const targetId=traineeId||window.LSPD.user.uid;
  let evals=[],quizzes=[],targetName=window.LSPD.profile.name;
  try{
    const [es,qs]=await Promise.all([
      getDocs(query(collection(db,"evaluations"),where("officerId","==",targetId))),
      getDocs(query(collection(db,"academy_quiz_attempts"),where("officerId","==",targetId)))
    ]);
    evals=es.docs.map(d=>d.data());
    quizzes=qs.docs.map(d=>d.data());
    if(targetId!==window.LSPD.user.uid){
      const trainees=await accessibleTrainees();
      targetName=trainees.find(t=>t.uid===targetId)?.name||"Recrue";
    }
  }catch{}

  const latest=latestTrainingEvaluations(evals);
  const ev=latest[code];
  const resultLabel=ev?(ev.result==="Validé"?"Formation validée":"Formation à refaire"):"Non évaluée";
  const moduleQuizzes=quizzes.filter(q=>q.moduleCode===code).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));

  showModal(`<div class="training-module-modal independent-module-modal">
    <div class="academy-guide-head">
      <div><span class="module-code large">${esc(code)}</span><h2>${esc(m[1])}</h2><p>${esc(data.objective())}</p></div>
      <span class="tag ${ev?.result==="Validé"?"green":ev?"orange":""}">${esc(resultLabel)}${ev?` • ${ev.score}/100`:""}</span>
    </div>

    ${targetId!==window.LSPD.user.uid?`<div class="training-target-banner">👤 ${esc(targetName)}</div>`:""}

    <div class="independent-module-rule">
      <b>Une formation = un passage complet</b>
      <span>Contenu + pratique + scénario si besoin, puis une évaluation. Le résultat concerne uniquement ${esc(code)}.</span>
    </div>

    <div class="training-module-summary">
      <div><span>Durée indicative</span><b>${esc(data.duration||"—")}</b></div>
      <div><span>Résultat</span><b>${ev?`${esc(ev.result)} • ${ev.score}/100`:"Non évaluée"}</b></div>
      <div><span>Quiz</span><b>${moduleQuizzes[0]?`${moduleQuizzes[0].percentage}%`:"—"}</b></div>
      <div><span>Prérequis</span><b>Aucun prérequis bloquant</b></div>
    </div>

    <div class="grid2">
      <div class="guide-section"><h3>Déroulé de la formation</h3>${data.steps().map((x,i)=>`<div class="training-step-line"><i>${i+1}</i><span>${esc(x)}</span></div>`).join("")}</div>
      <div class="guide-section"><h3>Erreurs critiques</h3>${data.critical().map(x=>`<div class="warning-line">🚨 ${esc(x)}</div>`).join("")}<h3>Si la formation n'est pas validée</h3><p>${esc(data.corrective())}</p></div>
    </div>

    <div class="modal-actions training-module-actions">
      ${hasPerm("academy_manage")?`<button class="btn secondary" id="moduleGuideBtn">📚 Guide complet</button><button class="btn secondary" id="moduleScenarioBtn">🎲 Scénario</button>`:""}
      ${hasPerm("training_manage")&&targetId!==window.LSPD.user.uid?`<button class="btn" id="modulePlanBtn">🗓️ Planifier cette formation</button>`:""}
      ${hasPerm("fto_evaluations_create")&&targetId!==window.LSPD.user.uid?`<button class="btn secondary" id="moduleEvalBtn">✅ Évaluer cette formation</button>`:""}
      ${targetId===window.LSPD.user.uid?`<button class="btn" id="moduleQuizBtn">🧠 Faire le quiz</button><button class="btn secondary" id="modulePlanningBtn">🗓️ Mes formations</button>`:""}
      <button class="btn secondary" id="closeModal">Fermer</button>
    </div>
  </div>`);

  $("moduleGuideBtn")?.addEventListener("click",()=>openAcademyGuide(code));
  $("moduleScenarioBtn")?.addEventListener("click",()=>openRandomScenario(code));
  $("modulePlanBtn")?.addEventListener("click",()=>{document.querySelector(".modal")?.remove();openTrainingCreationWizard(code,[targetId]);});
  $("moduleEvalBtn")?.addEventListener("click",()=>openEvaluationForm(targetId,code,null));
  $("moduleQuizBtn")?.addEventListener("click",()=>startTrainingQuiz(code));
  $("modulePlanningBtn")?.addEventListener("click",()=>{document.querySelector(".modal")?.remove();window.LSPD.trainingCenterTab="myTraining";render("trainingCenter");});
}

async function accessibleTrainees(scope="assigned"){
  const users=await getUsers();
  // A global trainee list is reserved for Lieutenant+ command workflows.
  // "Mes recrues" and FTO creation tools always remain limited to active
  // assignments belonging to the current FTO and respect grade hierarchy.
  if(scope==="all" && (isChief() || isLieutenantPlusGrade())){
    return users.filter(u=>!["Visiteur","Applicant"].includes(u.role) && !["Archivé","Refusé","En attente","Inactif","Suspendu"].includes(u.status));
  }
  const me=users.find(u=>u.uid===window.LSPD.user.uid)||{uid:window.LSPD.user.uid,grade:currentGrade(),role:role(),status:window.LSPD.profile?.status};
  const snap=await getDocs(query(collection(db,"fto_assignments"),where("ftoId","==",window.LSPD.user.uid)));
  const ids=new Set(snap.docs.map(d=>d.data()).filter(x=>x.status==="Active").map(x=>x.traineeId));
  return users.filter(u=>ids.has(u.uid) && validTraineeForFto(u,me));
}
function academyModuleTitle(code){
  const m=modules.find(x=>x[0]===code);
  return m?`${m[0]} — ${translateSystemText(m[1],currentLang)}`:code;
}

async function ftoAcademy(){
  if(!hasPerm("academy_manage"))return;
  await Promise.all([loadAcademyOverrides(),loadCustomAcademyScenarios()]);
  const trainees=await accessibleTrainees("all");
  let rec="";
  try{
    const s=await getDocs(collection(db,"evaluations")),evals=s.docs.map(d=>d.data());
    rec=trainees.slice(0,6).map(t=>{
      const te=evals.filter(e=>e.officerId===t.uid),avg=te.length?Math.round(te.reduce((a,e)=>a+(Number(e.score)||0),0)/te.length):0;
      const by={};te.forEach(e=>(by[e.moduleCode]??=[]).push(Number(e.score)||0));
      const weak=Object.entries(by).map(([m,a])=>[m,Math.round(a.reduce((x,y)=>x+y,0)/a.length)]).sort((a,b)=>a[1]-b[1])[0];
      return `<div class="academy-rec card"><span class="number">${esc(t.badge)}</span><h3>${esc(t.name)}</h3><div class="row"><span>Score moyen</span><b>${avg}/100</b></div><div class="row"><span>Module faible</span><b>${weak?`${esc(weak[0])} • ${weak[1]}/100`:"—"}</b></div><div class="row"><span>Prochaine priorité</span><b>${weak?esc(academyModuleTitle(weak[0])):esc(B("Commencer M01","Start M01"))}</b></div><button class="btn secondary academy-open-trainee" data-id="${t.uid}">Ouvrir l'espace recrue</button></div>`;
    }).join("");
  }catch{}
  $("content").innerHTML=`<div class="academy-hero card"><div><span class="eyebrow">FIELD TRAINING PROGRAM</span><h2>FTO Academy</h2><p class="muted">${esc(B("Un guide opérationnel pour savoir quoi expliquer, démontrer, faire pratiquer et évaluer.","An operational guide showing what to explain, demonstrate, practice, and evaluate."))}</p></div><div class="academy-hero-actions">
    <button class="btn" id="academyNewSessionBtn">Créer une session</button>${hasPerm("academy_content_manage")?'<button class="btn secondary" id="academyManageBtn">🧰 Gestion Academy</button>':""}
    <div class="scenario-module-picker">
      <label for="academyScenarioModule">Choisir la formation</label>
      <select id="academyScenarioModule">${modules.map(m=>`<option value="${m[0]}">${esc(academyModuleTitle(m[0]))}</option>`).join("")}</select>
    </div>
    <button class="btn secondary" id="academyRandomScenarioBtn">Générer un scénario</button>
  </div></div>
  <div class="section-title">Recommandations FTO</div><div class="academy-recommendations">${rec||'<div class="card"><p class="muted">Aucune recrue assignée.</p></div>'}</div>
  <div class="section-title">Programme guidé</div><div class="academy-module-grid">${modules.map(m=>`<div class="academy-module card"><div class="academy-module-top"><span class="module-code">${m[0]}</span><span class="tag">${esc(translateSystemText(m[3],currentLang))}</span></div><h3>${esc(translateSystemText(m[1],currentLang))}</h3><p class="muted">${esc(translateSystemText(m[2],currentLang))}</p><div class="row"><span>Durée conseillée</span><b>${esc(getAcademyData(m[0])?.duration||"—")}</b></div><button class="btn secondary academy-guide-btn" data-module="${m[0]}">Voir le guide</button></div>`).join("")}</div>
  <div class="section-title">Bibliothèque pédagogique</div><div class="grid2"><div class="card"><h3>Exemples radio</h3>${RADIO_EXAMPLES.map(x=>`<div class="training-example"><span class="tag red">Mauvais exemple</span><p>${esc(x.bad())}</p><span class="tag green">Bon exemple</span><p>${esc(x.good())}</p><small>${esc(x.why())}</small></div>`).join("")}</div><div class="card"><h3>Exemples de rapports</h3>${REPORT_EXAMPLES.map(x=>`<div class="training-example"><span class="tag red">Mauvais exemple</span><p>${esc(x.bad())}</p><span class="tag green">Bon exemple</span><p>${esc(x.good())}</p><small>${esc(x.why())}</small></div>`).join("")}</div></div>`;
  document.querySelectorAll(".academy-guide-btn").forEach(b=>b.onclick=()=>openAcademyGuide(b.dataset.module));
  document.querySelectorAll(".academy-open-trainee").forEach(b=>b.onclick=()=>openTrainingWorkspace(b.dataset.id));
  $("academyNewSessionBtn").onclick=()=>openTrainingCreationWizard();
  $("academyManageBtn")?.addEventListener("click",()=>render("academyManager"));
  $("academyRandomScenarioBtn").onclick=()=>openRandomScenario($("academyScenarioModule").value);
}

async function openAcademyGuide(code){
  await loadAcademyOverrides();
  const d=getAcademyData(code),m=modules.find(x=>x[0]===code);if(!d||!m)return;
  showModal(`<div class="academy-guide"><div class="academy-guide-head"><div><span class="module-code large">${code}</span><h2>${esc(translateSystemText(m[1],currentLang))}</h2><p>${esc(d.objective())}</p></div><span class="tag">${esc(d.duration)}</span></div>
  <div class="guide-section"><h3>Prérequis</h3><div class="chip-row">${d.prereq.map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div></div>
  <div class="guide-section"><h3>Ce que le FTO doit faire</h3><ol class="academy-steps">${d.steps().map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div>
  <div class="guide-section guide-example"><h3>Exemple RP</h3><p>${esc(d.example())}</p></div>
  <div class="grid2"><div class="guide-section"><h3>Variantes</h3>${d.variants().map(x=>`<div class="guide-line">↳ ${esc(x)}</div>`).join("")}</div><div class="guide-section"><h3>Erreurs fréquentes</h3>${d.mistakes().map(x=>`<div class="guide-line warning-line">⚠ ${esc(x)}</div>`).join("")}</div></div>
  <div class="guide-section critical-box"><h3>Erreurs critiques</h3>${d.critical().map(x=>`<div>🚨 ${esc(x)}</div>`).join("")}</div>
  <div class="guide-section"><h3>Questions à poser / Réponses attendues</h3>${d.questions().map(([q,a])=>`<details class="qa-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  <div class="guide-section corrective-box"><h3>Action corrective</h3><p>${esc(d.corrective())}</p></div>
  <div class="modal-actions"><button class="btn" id="guideScenarioBtn">Générer un scénario</button><button class="btn secondary" id="closeModal">Fermer</button></div></div>`);
  $("guideScenarioBtn").onclick=()=>openRandomScenario(code);
}

async function openRandomScenario(moduleCode="M01"){
  await Promise.all([loadAcademyOverrides(),loadCustomAcademyScenarios()]);
  const code=modules.some(m=>m[0]===moduleCode)?moduleCode:"M01";
  const choices=buildModuleScenarioPool(code);
  if(!choices.length){
    showToast(B("Aucun scénario disponible pour ce module.","No scenario is available for this module."),"warning");
    return;
  }

  const s=choices[Math.floor(Math.random()*choices.length)];
  const moduleTitle=academyModuleTitle(code);

  showModal(`<div class="scenario-generated">
    <div class="scenario-stamp">SCENARIO</div>
    <div class="scenario-scope">
      <span class="tag">${esc(code)}</span>
      <span class="tag orange">${esc(translateSystemText(s.difficulty,currentLang))}</span>
    </div>
    <h2>Scénario de formation</h2>
    <div class="scenario-selected-module">
      <span>Formation sélectionnée</span>
      <b>${esc(moduleTitle)}</b>
      <small>Le générateur reste limité à la formation sélectionnée.</small>
    </div>
    <div class="scenario-block"><span>Situation</span><p>${esc(s.situation())}</p></div>
    <div class="scenario-block"><span>Contraintes</span><p>${esc(s.constraints())}</p></div>
    <div class="scenario-block"><span>Réussite attendue</span><p>${esc(s.success())}</p></div>
    <div class="modal-actions">
      <button class="btn" id="regenScenarioBtn">Générer un scénario pour ce module</button>
      <button class="btn secondary" id="closeModal">Fermer</button>
    </div>
  </div>`);

  $("regenScenarioBtn").onclick=()=>openRandomScenario(code);
}

async function openAcademySessionForm(prefillTraineeId=null,prefillModuleCode=null){
  if(!hasPerm("fto_sessions_manage")) return showToast("Tu n’as pas la permission de gérer les sessions FTO.","warning");
  const trainees=await accessibleTrainees();if(!trainees.length){showToast("Aucune recrue assignée.","warning");return;}
  showModal(`<h2>Créer une session</h2><form id="academySessionForm"><div class="formgrid"><label class="field"><span>Recrue</span><select id="academyTrainee">${trainees.map(t=>`<option value="${t.uid}" data-name="${esc(t.name)}" ${t.uid===prefillTraineeId?"selected":""}>${esc(t.badge)} — ${esc(t.name)}</option>`).join("")}</select></label><label class="field"><span>Module</span><select id="academyModule">${modules.map(m=>`<option value="${m[0]}" ${m[0]===prefillModuleCode?"selected":""}>${esc(academyModuleTitle(m[0]))}</option>`).join("")}</select></label><label class="field"><span>Phase FTO</span><select id="academyPhase"><option value="P1">Phase 1 — Observation</option><option value="P2">Phase 2 — Assistance</option><option value="P3">Phase 3 — Autonomie supervisée</option><option value="P4">Phase 4 — Évaluation finale</option></select></label></div><div id="academySessionError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Commencer une session</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("academySessionForm").onsubmit=createAcademySession;
}
async function createAcademySession(e){
  e.preventDefault();if(!hasPerm("fto_sessions_manage"))return;
  const t=$("academyTrainee"),code=$("academyModule").value,phase=$("academyPhase").value;
  try{
    const ref=await addDoc(collection(db,"fto_sessions"),{traineeId:t.value,traineeName:t.selectedOptions[0].dataset.name,ftoId:window.LSPD.user.uid,ftoName:window.LSPD.profile.name,moduleCode:code,moduleTitle:modules.find(m=>m[0]===code)?.[1]||code,phase,status:"En cours",checklist:{briefing:false,demonstration:false,practice:false,observation:false,debrief:false},createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await addAudit("FTO_SESSION_CREATE",t.value,`${code} • ${phase}`);
    document.querySelector(".modal")?.remove();showToast("Session créée.","success");openGuidedSession(ref.id);
  }catch(err){$("academySessionError").textContent="Erreur : "+(err.code||err.message);}
}

async function openGuidedSession(id){
  const s=await getDoc(doc(db,"fto_sessions",id));if(!s.exists())return;
  await loadAcademyOverrides();
  const v={id,...s.data()},d=getAcademyData(v.moduleCode);if(!d)return;const c=v.checklist||{};
  const pct=Math.round(["briefing","demonstration","practice","observation","debrief"].filter(k=>c[k]).length/5*100);
  const steps=d.steps();
  showModal(`<div class="guided-session"><div class="academy-guide-head"><div><span class="module-code large">${esc(v.moduleCode)}</span><h2>Session guidée — ${esc(v.traineeName)}</h2><p>${esc(d.objective())}</p></div><span class="tag">${esc(v.phase)}</span></div><div class="guided-progress"><i style="width:${pct}%"></i></div><div class="guided-checks">${[["briefing","Briefing",steps[0]||""],["demonstration","Démonstration",steps[1]||""],["practice","Pratique",steps[2]||""],["observation","Observation",steps[3]||""],["debrief","Débrief",steps[4]||d.corrective()]].map(([key,label,desc])=>`<label class="guided-step ${c[key]?"done":""}"><input type="checkbox" class="session-check" data-key="${key}" ${c[key]?"checked":""}><span><b>${esc(label)}</b><small>${esc(desc)}</small></span></label>`).join("")}</div><div class="grid2"><div class="guide-section"><h3>Erreurs critiques</h3>${d.critical().map(x=>`<div class="warning-line">🚨 ${esc(x)}</div>`).join("")}</div><div class="guide-section"><h3>Questions à poser</h3>${d.questions().map(([q,a])=>`<details class="qa-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></div><label class="field full"><span>Résumé de session</span><textarea id="sessionSummary" rows="4">${esc(v.summary||"")}</textarea></label><label class="field full"><span>Points forts</span><textarea id="sessionStrengths" rows="3">${esc(v.strengths||"")}</textarea></label><label class="field full"><span>Points à améliorer</span><textarea id="sessionImprove" rows="3">${esc(v.improvements||"")}</textarea></label><label class="field full"><span>Objectifs prochaine session</span><textarea id="sessionNext" rows="3">${esc(v.nextGoals||"")}</textarea></label><div class="modal-actions"><button class="btn secondary" id="sessionScenarioBtn">Générer un scénario pour ce module</button><button class="btn secondary" id="sessionSaveBtn">Enregistrer le journal</button><button class="btn" id="sessionFinishBtn">Terminer la session</button><button class="btn secondary" id="closeModal">Fermer</button></div></div>`);
  $("sessionScenarioBtn").onclick=()=>openRandomScenario(v.moduleCode);$("sessionSaveBtn").onclick=()=>saveGuidedSession(id,false);$("sessionFinishBtn").onclick=()=>saveGuidedSession(id,true);
}
async function saveGuidedSession(id,finish=false){
  if(!hasPerm("fto_sessions_manage"))return;
  const checklist={};document.querySelectorAll(".session-check").forEach(x=>checklist[x.dataset.key]=x.checked);
  try{
    const payload={checklist,summary:$("sessionSummary").value.trim(),strengths:$("sessionStrengths").value.trim(),improvements:$("sessionImprove").value.trim(),nextGoals:$("sessionNext").value.trim(),updatedAt:serverTimestamp()};
    if(finish){payload.status="Terminée";payload.completedAt=serverTimestamp();}
    await updateDoc(doc(db,"fto_sessions",id),payload);await addAudit(finish?"FTO_SESSION_COMPLETE":"FTO_SESSION_UPDATE",id,finish?"Terminée":"Journal");showToast("Journal enregistré.","success");
    if(finish){document.querySelector(".modal")?.remove();ftoJournal();}else openGuidedSession(id);
  }catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function ftoJournal(){
  if(!hasAnyPerm("academy_manage","fto_sessions_manage","fto_objectives_manage"))return;
  const trainees=await accessibleTrainees("all"),ids=new Set(trainees.map(t=>t.uid));
  const [ss,os]=await Promise.all([getDocs(collection(db,"fto_sessions")),getDocs(collection(db,"training_objectives"))]);
  const sessions=ss.docs.map(d=>({id:d.id,...d.data()})).filter(s=>hasPerm("personnel_view")||s.ftoId===window.LSPD.user.uid||ids.has(s.traineeId)).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const objectives=os.docs.map(d=>({id:d.id,...d.data()})).filter(o=>hasPerm("personnel_view")||o.createdById===window.LSPD.user.uid||ids.has(o.traineeId)).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("fto_objectives_manage")?'<button class="btn" id="newObjectiveBtn">Ajouter un objectif</button>':""}${hasPerm("fto_sessions_manage")?'<button class="btn secondary" id="journalNewSessionBtn">Créer une session</button>':""}</div><div class="grid2"><div class="card"><h3>Objectifs de la recrue</h3>${objectives.length?objectives.map(o=>`<div class="objective-item"><div><span class="tag ${o.priority==="Critique"?"red":o.priority==="Haute"?"orange":""}">${esc(o.priority)}</span><b>${esc(o.traineeName)}</b><p>${esc(o.text)}</p></div><div><span class="tag ${o.status==="Atteint"?"green":""}">${esc(o.status)}</span>${o.status==="Ouvert"&&hasPerm("fto_objectives_manage")?`<button class="btn secondary objective-done" data-id="${o.id}">Atteint</button>`:""}</div></div>`).join(""):'<p class="muted">Aucun objectif.</p>'}</div><div class="card"><h3>Historique pédagogique</h3><div class="row"><span>Sessions terminées</span><b>${sessions.filter(s=>s.status==="Terminée").length}</b></div><div class="row"><span>Sessions en cours</span><b>${sessions.filter(s=>s.status==="En cours").length}</b></div></div></div><div class="section-title">Journal FTO</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Recrue</th><th>Module</th><th>Phase FTO</th><th>Statut</th><th>Résumé de session</th><th></th></tr></thead><tbody>${sessions.length?sessions.map(s=>`<tr><td>${formatDate(s.createdAt)}</td><td>${esc(s.traineeName)}</td><td>${esc(s.moduleCode)}</td><td>${esc(s.phase)}</td><td><span class="tag ${s.status==="Terminée"?"green":"orange"}">${esc(s.status)}</span></td><td>${esc(s.summary||"—")}</td><td>${hasPerm("fto_sessions_manage")?`<button class="btn secondary journal-open" data-id="${s.id}">Continuer</button>`:"—"}</td></tr>`).join(""):'<tr><td colspan="7">Aucune session.</td></tr>'}</tbody></table></div>`;
  $("newObjectiveBtn")?.addEventListener("click",openObjectiveForm);$("journalNewSessionBtn")?.addEventListener("click",openAcademySessionForm);
  document.querySelectorAll(".journal-open").forEach(b=>b.onclick=()=>openGuidedSession(b.dataset.id));
  document.querySelectorAll(".objective-done").forEach(b=>b.onclick=()=>markObjectiveDone(b.dataset.id));
}
async function openObjectiveForm(prefillTraineeId=null){
  if(!hasPerm("fto_objectives_manage"))return;
  const trainees=await accessibleTrainees();if(!trainees.length){showToast("Aucune recrue assignée.","warning");return;}
  showModal(`<h2>Ajouter un objectif</h2><form id="objectiveForm"><div class="formgrid"><label class="field"><span>Recrue</span><select id="objTrainee">${trainees.map(t=>`<option value="${t.uid}" data-name="${esc(t.name)}" ${t.uid===prefillTraineeId?"selected":""}>${esc(t.badge)} — ${esc(t.name)}</option>`).join("")}</select></label><label class="field"><span>Priorité</span><select id="objPriority"><option>Faible</option><option selected>Moyenne</option><option>Haute</option><option>Critique</option></select></label></div><label class="field full"><span>Objectif pédagogique</span><textarea id="objText" rows="5" required></textarea></label><div id="objError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Ajouter un objectif</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("objectiveForm").onsubmit=saveObjective;
}
async function saveObjective(e){
  if(!hasPerm("fto_objectives_manage"))return;
  e.preventDefault();const t=$("objTrainee");
  try{await addDoc(collection(db,"training_objectives"),{traineeId:t.value,traineeName:t.selectedOptions[0].dataset.name,text:$("objText").value.trim(),priority:$("objPriority").value,status:"Ouvert",createdById:window.LSPD.user.uid,createdByName:window.LSPD.profile.name,createdAt:serverTimestamp()});await addAudit("TRAINING_OBJECTIVE_CREATE",t.value,$("objText").value.trim());document.querySelector(".modal")?.remove();showToast("Objectif ajouté.","success");ftoJournal();}catch(err){$("objError").textContent="Erreur : "+(err.code||err.message);}
}
async function markObjectiveDone(id){
  if(!hasPerm("fto_objectives_manage"))return;
  try{await updateDoc(doc(db,"training_objectives",id),{status:"Atteint",completedById:window.LSPD.user.uid,completedByName:window.LSPD.profile.name,completedAt:serverTimestamp()});await addAudit("TRAINING_OBJECTIVE_COMPLETE",id,"Atteint");ftoJournal();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function ftoFinal(){
  if(!(hasPerm("academy_manage")||hasPerm("academy_final_review")))return;
  const trainees=await accessibleTrainees("all"),[es,fs,ss]=await Promise.all([getDocs(collection(db,"evaluations")),getDocs(collection(db,"final_fto_reviews")),getDocs(collection(db,"fto_sessions"))]);
  const evals=es.docs.map(d=>d.data()),finals=fs.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)),sessions=ss.docs.map(d=>d.data());
  $("content").innerHTML=`<div class="academy-hero card"><div><span class="eyebrow">FINAL REVIEW</span><h2>Évaluation finale FTO</h2><p class="muted">${esc(B("Le FTO recommande, puis le commandement valide définitivement.","The FTO recommends, then command gives final approval."))}</p></div>${hasPerm("academy_manage")?'<button class="btn" id="newFinalReviewBtn">Créer l\'évaluation finale</button>':""}</div><div class="section-title">Recrues</div><div class="academy-module-grid">${trainees.map(t=>{const te=evals.filter(e=>e.officerId===t.uid),valid=[...new Set(te.filter(e=>e.result==="Validé").map(e=>e.moduleCode))],avg=te.length?Math.round(te.reduce((s,e)=>s+(Number(e.score)||0),0)/te.length):0,ts=sessions.filter(s=>s.traineeId===t.uid&&s.status==="Terminée").length;return `<div class="card final-card"><span class="number">${esc(t.badge)}</span><h3>${esc(t.name)}</h3><div class="row"><span>Modules validés</span><b>${valid.length}/${modules.length}</b></div><div class="row"><span>Moyenne globale</span><b>${avg}/100</b></div><div class="row"><span>Sessions terminées</span><b>${ts}</b></div><button class="btn secondary final-review-person" data-id="${t.uid}">Évaluation finale</button></div>`;}).join("")||'<div class="card"><p class="muted">Aucune recrue assignée.</p></div>'}</div><div class="section-title">Validation commandement</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Recrue</th><th>Décision FTO</th><th>Statut</th><th>Moyenne</th><th>FTO</th><th>Action</th></tr></thead><tbody>${finals.length?finals.map(f=>`<tr><td>${formatDate(f.createdAt)}</td><td>${esc(f.traineeName)}</td><td><span class="tag ${f.decision==="Validation FTO"?"green":f.decision==="Échec FTO"?"red":"orange"}">${esc(f.decision)}</span></td><td><span class="tag ${f.status==="Validée"?"green":f.status==="Refusée"?"red":"orange"}">${esc(f.status||"En attente Commandement")}</span></td><td>${esc(f.averageScore)}/100</td><td>${esc(f.ftoName)}</td><td>${hasPerm("academy_final_review")&&(f.status||"En attente Commandement")==="En attente Commandement"?`<button class="btn final-approve" data-id="${f.id}">Valider définitivement</button> <button class="btn secondary final-reject" data-id="${f.id}">Refuser la validation</button>`:"—"}</td></tr>`).join(""):'<tr><td colspan="7">Aucune entrée.</td></tr>'}</tbody></table></div>`;
  $("newFinalReviewBtn")?.addEventListener("click",()=>openFinalReviewForm());document.querySelectorAll(".final-review-person").forEach(b=>b.onclick=()=>openFinalReviewForm(b.dataset.id));document.querySelectorAll(".final-approve").forEach(b=>b.onclick=()=>reviewFinalFto(b.dataset.id,"Validée"));document.querySelectorAll(".final-reject").forEach(b=>b.onclick=()=>reviewFinalFto(b.dataset.id,"Refusée"));
}
async function openFinalReviewForm(prefillId=null){
  if(!hasPerm("academy_manage")) return;
  const trainees=await accessibleTrainees();if(!trainees.length)return;
  const [es,ss]=await Promise.all([getDocs(collection(db,"evaluations")),getDocs(collection(db,"fto_sessions"))]),evals=es.docs.map(d=>d.data()),sessions=ss.docs.map(d=>d.data()),selected=prefillId||trainees[0].uid;
  showModal(`<h2>Créer l'évaluation finale</h2><form id="finalReviewForm"><label class="field"><span>Recrue</span><select id="finalTrainee">${trainees.map(t=>`<option value="${t.uid}" data-name="${esc(t.name)}" ${t.uid===selected?"selected":""}>${esc(t.badge)} — ${esc(t.name)}</option>`).join("")}</select></label><div id="finalStats" class="final-summary"></div><label class="field"><span>Recommandation finale</span><select id="finalDecision"><option>Validation FTO</option><option>Prolongation FTO</option><option>Échec FTO</option></select></label><label class="field full"><span>Commentaire final</span><textarea id="finalComment" rows="6" required></textarea></label><div id="finalError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Créer l'évaluation finale</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  const refresh=()=>{const id=$("finalTrainee").value,te=evals.filter(e=>e.officerId===id),valid=[...new Set(te.filter(e=>e.result==="Validé").map(e=>e.moduleCode))],avg=te.length?Math.round(te.reduce((s,e)=>s+(Number(e.score)||0),0)/te.length):0,ts=sessions.filter(s=>s.traineeId===id&&s.status==="Terminée").length;$("finalStats").innerHTML=`<div><span>Modules validés</span><b>${valid.length}/${modules.length}</b></div><div><span>Moyenne globale</span><b>${avg}/100</b></div><div><span>Sessions terminées</span><b>${ts}</b></div>`;$("finalStats").dataset.valid=valid.length;$("finalStats").dataset.avg=avg;$("finalStats").dataset.sessions=ts;};
  $("finalTrainee").onchange=refresh;refresh();$("finalReviewForm").onsubmit=saveFinalReview;
}
async function saveFinalReview(e){
  e.preventDefault();
  if(!hasPerm("academy_manage"))return;const t=$("finalTrainee");
  try{await addDoc(collection(db,"final_fto_reviews"),{traineeId:t.value,traineeName:t.selectedOptions[0].dataset.name,validatedModules:Number($("finalStats").dataset.valid)||0,averageScore:Number($("finalStats").dataset.avg)||0,completedSessions:Number($("finalStats").dataset.sessions)||0,decision:$("finalDecision").value,comment:$("finalComment").value.trim(),status:"En attente Commandement",ftoId:window.LSPD.user.uid,ftoName:window.LSPD.profile.name,createdAt:serverTimestamp()});await addAudit("FTO_FINAL_REVIEW",t.value,$("finalDecision").value);document.querySelector(".modal")?.remove();showToast("Évaluation finale enregistrée.","success");ftoFinal();}catch(err){$("finalError").textContent="Erreur : "+(err.code||err.message);}
}



function weekKey(date=new Date()){
  const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
  const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));const week=Math.ceil((((d-yearStart)/86400000)+1)/7);return `${d.getUTCFullYear()}-W${String(week).padStart(2,"0")}`;
}
async function generateTrainingAlerts(){
  if(!hasPerm("academy_manage"))return;
  try{
    const [as,es,os,ns]=await Promise.all([getDocs(collection(db,"fto_assignments")),getDocs(collection(db,"evaluations")),getDocs(collection(db,"training_objectives")),getDocs(query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid)))]);
    const assignments=as.docs.map(d=>d.data()).filter(a=>a.status==="Active" && (hasPerm("personnel_view")||a.ftoId===window.LSPD.user.uid));
    const evals=es.docs.map(d=>d.data()),objectives=os.docs.map(d=>({id:d.id,...d.data()})),existing=new Set(ns.docs.map(d=>d.data().reminderKey).filter(Boolean));
    const now=Date.now(),wk=weekKey();
    for(const a of assignments){
      const own=evals.filter(e=>e.officerId===a.traineeId).sort((x,y)=>(y.createdAt?.seconds||0)-(x.createdAt?.seconds||0));
      const last=own[0]?.createdAt?.seconds?own[0].createdAt.seconds*1000:0;
      if(!last || now-last>7*86400000){const key=`fto-stale:${a.traineeId}:${wk}`;if(!existing.has(key)){await addDoc(collection(db,"notifications"),{recipientId:window.LSPD.user.uid,senderId:window.LSPD.user.uid,senderName:"Système LSPD",title:"Rappel FTO",body:`${a.traineeName} n'a pas été évalué récemment.`,type:"Formation",linkPage:"ftoDossier",read:false,reminderKey:key,createdAt:serverTimestamp()});existing.add(key);}}
    }
    for(const o of objectives.filter(o=>o.status==="Ouvert"&&o.priority==="Critique")){const key=`fto-critical:${o.id}`;if(!existing.has(key)){await addDoc(collection(db,"notifications"),{recipientId:window.LSPD.user.uid,senderId:window.LSPD.user.uid,senderName:"Système LSPD",title:"Objectif critique FTO",body:`${o.traineeName} : ${o.text}`,type:"Formation",linkPage:"ftoDossier",read:false,reminderKey:key,createdAt:serverTimestamp()});existing.add(key);}}
  }catch(err){console.warn("Training alerts skipped",err);}
}
async function trainingAnalytics(){
  if(!hasPerm("academy_manage"))return;
  const [us,es,ss,fs,qs]=await Promise.all([getDocs(query(collection(db,"users"),where("role","!=","Visiteur"))),getDocs(collection(db,"evaluations")),getDocs(collection(db,"fto_sessions")),getDocs(collection(db,"final_fto_reviews")),getDocs(collection(db,"academy_quiz_attempts"))]);
  const users=us.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>!["Visiteur","Applicant"].includes(u.role)),evals=es.docs.map(d=>d.data()),sessions=ss.docs.map(d=>d.data()),finals=fs.docs.map(d=>d.data()),quizzes=qs.docs.map(d=>d.data());
  const moduleRows=modules.map(m=>{const e=evals.filter(x=>x.moduleCode===m[0]),avg=e.length?Math.round(e.reduce((a,x)=>a+(Number(x.score)||0),0)/e.length):0,fail=e.filter(x=>x.result==="Échec").length,review=e.filter(x=>x.result==="À revoir").length;return {code:m[0],title:m[1],count:e.length,avg,fail,review};});
  const byFto={};for(const e of evals){const k=e.ftoId||e.ftoName||"—";byFto[k]??={name:e.ftoName||"—",count:0,total:0,trainees:new Set()};byFto[k].count++;byFto[k].total+=Number(e.score)||0;byFto[k].trainees.add(e.officerId);}const ftoRows=Object.values(byFto).map(x=>({...x,avg:x.count?Math.round(x.total/x.count):0})).sort((a,b)=>b.count-a.count);
  const validFinals=finals.filter(f=>f.status==="Validée").length,finalRate=finals.length?Math.round(validFinals/finals.length*100):0;
  const stale=[];for(const u of users){const ue=evals.filter(e=>e.officerId===u.uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));if(ue.length){const days=Math.floor((Date.now()-(ue[0].createdAt?.seconds||0)*1000)/86400000);if(days>=7)stale.push({u,days});}}
  $("content").innerHTML=`<div class="grid stats-grid"><div class="card accent-card"><div class="muted">Évaluations</div><div class="stat">${evals.length}</div></div><div class="card accent-card"><div class="muted">Sessions terminées</div><div class="stat">${sessions.filter(s=>s.status==="Terminée").length}</div></div><div class="card accent-card"><div class="muted">Quiz réalisés</div><div class="stat">${quizzes.length}</div></div><div class="card accent-card"><div class="muted">Taux de validation finale</div><div class="stat">${finalRate}%</div></div></div><div class="section-title">Performance par module</div><div class="card table-card"><table class="table"><thead><tr><th>Module</th><th>Évaluations</th><th>Moyenne</th><th>À revoir</th><th>Échecs</th></tr></thead><tbody>${moduleRows.map(x=>`<tr><td><b>${x.code}</b> — ${esc(x.title)}</td><td>${x.count}</td><td>${x.avg}/100</td><td>${x.review}</td><td>${x.fail}</td></tr>`).join("")}</tbody></table></div><div class="grid2"><div class="card"><h3>Performance FTO</h3>${ftoRows.length?ftoRows.slice(0,10).map(x=>`<div class="row"><span>${esc(x.name)} <small>${x.trainees.size} recrue(s)</small></span><b>${x.count} eval • ${x.avg}/100</b></div>`).join(""):'<p class="muted">Aucune donnée.</p>'}</div><div class="card"><h3>Alertes pédagogiques</h3>${stale.length?stale.slice(0,10).map(x=>`<div class="row"><span>${esc(x.u.badge)} — ${esc(x.u.name)}</span><span class="tag orange">${x.days} jours</span></div>`).join(""):'<p class="muted">Aucune recrue sans évaluation récente.</p>'}</div></div>`;
}

async function visitorPortal(){
  if(!isVisitor())return render("dashboard");
  let anns=[];
  try{const s=await getDocs(query(collection(db,"announcements"),where("visibility","==","Public")));anns=s.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));}catch{}
  const publicDivisions=[
    ["Patrol",B("Patrouille générale et réponse aux appels.","General patrol and calls for service.")],
    ["Traffic",B("Circulation et sécurité routière.","Traffic and road safety.")],
    ["Detective",B("Enquêtes et suivi des dossiers.","Investigations and case follow-up.")],
    ["Training",B("Formation et développement des officiers.","Officer training and development.")]
  ];
  $("content").innerHTML=`<div class="visitor-hero card"><div><span class="eyebrow">EXTERNAL ACCESS</span><h2>Accès visiteur sécurisé</h2><p>${esc(B("Bienvenue sur l'espace public du LSPD Command Center.","Welcome to the public area of the LSPD Command Center."))}</p><p class="muted">Aucune donnée opérationnelle ou personnelle n’est accessible avec ce compte.</p></div><div class="visitor-seal">🏛️</div></div>
  <div class="grid stats-grid"><div class="card"><div class="muted">Compte externe</div><div class="stat">${esc(window.LSPD.profile.name)}</div><div class="muted">${esc(window.LSPD.profile.grade)} • ${esc(window.LSPD.profile.role)}</div></div><div class="card"><div class="muted">Accès</div><div class="stat">PUBLIC</div><div class="muted">Lecture limitée</div></div></div>
  <div class="section-title">Annonces publiques</div><div class="grid2">${anns.length?anns.slice(0,8).map(a=>`<div class="card notice"><span class="tag green">Public</span><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><p class="muted">${esc(a.authorName)} • ${formatDate(a.createdAt)}</p></div>`).join(""):'<div class="card"><p class="muted">Aucune annonce publique.</p></div>'}</div>
  <div class="section-title">Structure du département</div><div class="visitor-public-grid">${publicDivisions.map(([n,d])=>`<div class="card"><h3>${esc(n)}</h3><p class="muted">${esc(d)}</p></div>`).join("")}</div>
  <div class="section-title">Catalogue de formation</div><div class="visitor-training-list">${modules.map(m=>`<div><span class="module-code">${m[0]}</span><b>${esc(translateSystemText(m[1],currentLang))}</b><small>${esc(translateSystemText(m[3],currentLang))}</small></div>`).join("")}</div>`;
}

async function academyManager(){
  if(!hasPerm("academy_content_manage"))return;
  await Promise.all([loadAcademyOverrides(true),loadCustomAcademyScenarios(true)]);
  const customCount=Object.values(window.LSPD.academyOverrides||{}).filter(x=>x.enabled!==false).length;
  const scenarios=(window.LSPD.customAcademyScenarios||[]).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="academy-hero card"><div><span class="eyebrow">TRAINING CMS</span><h2>Gestion contenu Academy</h2><p class="muted">${esc(B("Modifie les modules et ajoute des scénarios sans changer app.js.","Edit modules and add scenarios without changing app.js."))}</p></div><div class="academy-cms-stat"><b>${customCount}</b><span>modules personnalisés</span></div></div>
  <div class="section-title">Modules M01–M16</div><div class="academy-manager-grid">${modules.map(m=>{const o=window.LSPD.academyOverrides?.[m[0]];return `<div class="card academy-manager-module"><div><span class="module-code">${m[0]}</span> ${o&&o.enabled!==false?'<span class="tag green">Personnalisé</span>':'<span class="tag">Contenu d’origine</span>'}</div><h3>${esc(m[1])}</h3><button class="btn secondary academy-edit-content" data-code="${m[0]}">Modifier le module</button></div>`}).join("")}</div>
  <div class="toolbar academy-scenario-toolbar"><div><h2>Scénarios personnalisés</h2><p class="muted">${scenarios.filter(s=>s.status!=="Archivé").length} actifs</p></div><button class="btn" id="newCustomScenarioBtn">+ Nouveau scénario personnalisé</button></div>
  <div class="card table-card"><table class="table"><thead><tr><th>Module</th><th>Difficulté</th><th>Situation</th><th>Statut</th><th></th></tr></thead><tbody>${scenarios.length?scenarios.map(s=>`<tr><td>${esc(s.moduleCode)}</td><td>${esc(s.difficulty)}</td><td>${esc(s.situationFr||s.situationEn||"—")}</td><td><span class="tag ${s.status==="Archivé"?"":"green"}">${esc(s.status||"Actif")}</span></td><td>${s.status!=="Archivé"?`<button class="btn secondary archive-custom-scenario" data-id="${s.id}">Archiver</button>`:""}</td></tr>`).join(""):'<tr><td colspan="5">Aucun scénario personnalisé.</td></tr>'}</tbody></table></div>`;
  document.querySelectorAll(".academy-edit-content").forEach(b=>b.onclick=()=>openAcademyContentEditor(b.dataset.code));
  $("newCustomScenarioBtn").onclick=openCustomScenarioForm;
  document.querySelectorAll(".archive-custom-scenario").forEach(b=>b.onclick=()=>archiveCustomScenario(b.dataset.id));
}
function fieldList(arr){return (arr||[]).join("\n");}
function questionLines(arr){return (arr||[]).map(x=>`${x[0]} || ${x[1]}`).join("\n");}
async function openAcademyContentEditor(code){
  if(!hasPerm("academy_content_manage"))return;
  await loadAcademyOverrides();
  const o=window.LSPD.academyOverrides?.[code]||{},m=modules.find(x=>x[0]===code),base=ACADEMY_MODULES[code];if(!m||!base)return;
  showModal(`<div class="academy-content-editor"><h2>${esc(code)} — ${esc(m[1])}</h2><p class="muted">${esc(B("Laisse un champ vide pour conserver le contenu d'origine.","Leave a field empty to keep the original content."))}</p><form id="academyContentForm"><input id="acCode" type="hidden" value="${code}"><div class="formgrid"><label class="field"><span>Durée conseillée</span><input id="acDuration" value="${esc(o.duration||"")}" placeholder="${esc(base.duration)}"></label><label class="field"><span>Prérequis</span><input id="acPrereq" value="${esc((o.prereq||[]).join(", "))}" placeholder="M01, M02"></label></div>
  ${academyLangEditor("FR",o,"Fr")}${academyLangEditor("EN",o,"En")}
  <div id="acError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer le contenu</button>${o.id?'<button class="btn secondary" type="button" id="restoreAcademyContentBtn">Contenu d’origine</button>':""}<button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form></div>`);
  $("academyContentForm").onsubmit=saveAcademyContent;
  $("restoreAcademyContentBtn")?.addEventListener("click",()=>restoreAcademyContent(code));
}
function academyLangEditor(label,o,suffix){
  const lower=suffix.toLowerCase();
  return `<div class="academy-language-editor"><h3>${label}</h3><label class="field full"><span>Objectif pédagogique</span><textarea id="acObjective${suffix}" rows="3">${esc(o[`objective${suffix}`]||"")}</textarea></label><label class="field full"><span>Étapes FTO — une par ligne</span><textarea id="acSteps${suffix}" rows="6">${esc(fieldList(o[`steps${suffix}`]))}</textarea></label><label class="field full"><span>Exemple RP</span><textarea id="acExample${suffix}" rows="3">${esc(o[`example${suffix}`]||"")}</textarea></label><label class="field full"><span>Variantes — une par ligne</span><textarea id="acVariants${suffix}" rows="4">${esc(fieldList(o[`variants${suffix}`]))}</textarea></label><label class="field full"><span>Erreurs fréquentes — une par ligne</span><textarea id="acMistakes${suffix}" rows="4">${esc(fieldList(o[`mistakes${suffix}`]))}</textarea></label><label class="field full"><span>Erreurs critiques — une par ligne</span><textarea id="acCritical${suffix}" rows="4">${esc(fieldList(o[`critical${suffix}`]))}</textarea></label><label class="field full"><span>Questions — Question || Réponse</span><textarea id="acQuestions${suffix}" rows="5">${esc(questionLines(o[`questions${suffix}`]))}</textarea></label><label class="field full"><span>Action corrective</span><textarea id="acCorrective${suffix}" rows="3">${esc(o[`corrective${suffix}`]||"")}</textarea></label></div>`;
}
async function saveAcademyContent(e){
  e.preventDefault();if(!hasPerm("academy_content_manage"))return;const code=$("acCode").value;
  const payload={moduleCode:code,enabled:true,duration:$("acDuration").value.trim(),prereq:$("acPrereq").value.split(",").map(x=>x.trim()).filter(Boolean),objectiveFr:$("acObjectiveFr").value.trim(),objectiveEn:$("acObjectiveEn").value.trim(),stepsFr:linesFrom($("acStepsFr").value),stepsEn:linesFrom($("acStepsEn").value),exampleFr:$("acExampleFr").value.trim(),exampleEn:$("acExampleEn").value.trim(),variantsFr:linesFrom($("acVariantsFr").value),variantsEn:linesFrom($("acVariantsEn").value),mistakesFr:linesFrom($("acMistakesFr").value),mistakesEn:linesFrom($("acMistakesEn").value),criticalFr:linesFrom($("acCriticalFr").value),criticalEn:linesFrom($("acCriticalEn").value),questionsFr:questionsFromLines($("acQuestionsFr").value),questionsEn:questionsFromLines($("acQuestionsEn").value),correctiveFr:$("acCorrectiveFr").value.trim(),correctiveEn:$("acCorrectiveEn").value.trim(),updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()};
  try{await setDoc(doc(db,"academy_content",code),payload,{merge:true});await addAudit("ACADEMY_CONTENT_UPDATE",code,academyModuleTitle(code));window.LSPD.academyOverridesLoaded=false;document.querySelector(".modal")?.remove();showToast("Contenu Academy enregistré.","success");academyManager();}catch(err){$("acError").textContent="Erreur : "+(err.code||err.message);}
}
async function restoreAcademyContent(code){
  if(!hasPerm("academy_content_manage")||!confirm("Revenir au contenu d'origine pour ce module ?"))return;
  try{await setDoc(doc(db,"academy_content",code),{enabled:false,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()},{merge:true});window.LSPD.academyOverridesLoaded=false;document.querySelector(".modal")?.remove();academyManager();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}
function openCustomScenarioForm(){
  if(!hasPerm("academy_content_manage"))return;
  showModal(`<h2>Nouveau scénario personnalisé</h2><form id="customScenarioForm"><div class="formgrid"><label class="field"><span>Module</span><select id="csModule">${modules.map(m=>`<option value="${m[0]}">${esc(academyModuleTitle(m[0]))}</option>`).join("")}</select></label><label class="field"><span>Difficulté</span><select id="csDifficulty"><option>Facile</option><option selected>Normal</option><option>Difficile</option><option>Stress test</option></select></label></div><div class="grid2"><div><h3>FR</h3><label class="field full"><span>Situation</span><textarea id="csSituationFr" rows="4" required></textarea></label><label class="field full"><span>Contraintes</span><textarea id="csConstraintsFr" rows="4" required></textarea></label><label class="field full"><span>Réussite attendue</span><textarea id="csSuccessFr" rows="4" required></textarea></label></div><div><h3>EN (optionnel)</h3><label class="field full"><span>Situation</span><textarea id="csSituationEn" rows="4"></textarea></label><label class="field full"><span>Contraintes</span><textarea id="csConstraintsEn" rows="4"></textarea></label><label class="field full"><span>Réussite attendue</span><textarea id="csSuccessEn" rows="4"></textarea></label></div></div><div id="csError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);$("customScenarioForm").onsubmit=saveCustomScenario;
}
async function saveCustomScenario(e){
  e.preventDefault();if(!hasPerm("academy_content_manage"))return;
  try{const ref=await addDoc(collection(db,"academy_scenarios"),{moduleCode:$("csModule").value,difficulty:$("csDifficulty").value,situationFr:$("csSituationFr").value.trim(),situationEn:$("csSituationEn").value.trim(),constraintsFr:$("csConstraintsFr").value.trim(),constraintsEn:$("csConstraintsEn").value.trim(),successFr:$("csSuccessFr").value.trim(),successEn:$("csSuccessEn").value.trim(),status:"Actif",createdById:window.LSPD.user.uid,createdByName:window.LSPD.profile.name,createdAt:serverTimestamp()});await addAudit("ACADEMY_SCENARIO_CREATE",ref.id,$("csModule").value);window.LSPD.customScenariosLoaded=false;document.querySelector(".modal")?.remove();showToast("Scénario enregistré.","success");academyManager();}catch(err){$("csError").textContent="Erreur : "+(err.code||err.message);}
}
async function archiveCustomScenario(id){
  if(!hasPerm("academy_content_manage"))return;try{await updateDoc(doc(db,"academy_scenarios",id),{status:"Archivé",archivedById:window.LSPD.user.uid,archivedByName:window.LSPD.profile.name,archivedAt:serverTimestamp()});window.LSPD.customScenariosLoaded=false;academyManager();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

function shuffleArray(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function quizQuestionPool(code){
  const d=getAcademyData(code);if(!d)return[];const allAnswers=[];for(const m of modules){const md=getAcademyData(m[0]);if(md)md.questions().forEach(q=>allAnswers.push(q[1]));}
  return d.questions().map(([q,a],idx)=>{const distract=shuffleArray([...new Set(allAnswers.filter(x=>x!==a))]).slice(0,3);const choices=shuffleArray([a,...distract]).slice(0,4);return {id:`${code}-${idx}`,question:q,answer:a,choices,correctIndex:choices.indexOf(a)};});
}
async function trainingQuiz(){
  if(!hasPerm("training_access"))return;
  await loadAcademyOverrides();
  const [es,as]=await Promise.all([
    getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid))),
    getDocs(query(collection(db,"academy_quiz_attempts"),where("officerId","==",window.LSPD.user.uid)))
  ]);
  const evals=es.docs.map(d=>d.data()),attempts=as.docs.map(d=>d.data());
  const latest=latestTrainingEvaluations(evals);
  $("content").innerHTML=`<div class="academy-hero card"><div><span class="eyebrow">KNOWLEDGE CHECK</span><h2>Quiz par formation</h2><p class="muted">Tous les quiz sont accessibles indépendamment. Un quiz ne bloque pas une autre formation.</p></div></div>
  <div class="quiz-module-grid">${modules.map(m=>{
    const last=attempts.filter(a=>a.moduleCode===m[0]).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))[0];
    const ev=latest[m[0]];
    return `<div class="card quiz-module"><div class="academy-module-top"><span class="module-code">${m[0]}</span>${last?`<span class="tag ${last.passed?"green":"orange"}">${last.percentage}%</span>`:""}</div><h3>${esc(m[1])}</h3><p class="muted">${ev?`Formation : ${esc(ev.result)} • ${ev.score}/100`:"Formation non évaluée"}</p><button class="btn secondary start-training-quiz" data-code="${m[0]}">Commencer le quiz</button></div>`;
  }).join("")}</div>`;
  document.querySelectorAll(".start-training-quiz").forEach(b=>b.onclick=()=>startTrainingQuiz(b.dataset.code));
}
async function startTrainingQuiz(code){
  await loadAcademyOverrides();const questions=quizQuestionPool(code);if(!questions.length){showToast("Aucune question disponible.","warning");return;}
  window.LSPD.activeQuiz={code,questions};showModal(`<div class="training-quiz"><h2>${esc(academyModuleTitle(code))}</h2><form id="trainingQuizForm">${questions.map((q,qi)=>`<div class="quiz-question"><b>${qi+1}. ${esc(q.question)}</b>${q.choices.map((c,ci)=>`<label><input type="radio" name="quiz${qi}" value="${ci}" required> ${esc(c)}</label>`).join("")}</div>`).join("")}<div id="quizError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Soumettre le quiz</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form></div>`);$("trainingQuizForm").onsubmit=submitTrainingQuiz;
}
async function submitTrainingQuiz(e){
  e.preventDefault();const qz=window.LSPD.activeQuiz;if(!qz)return;let score=0;const results=qz.questions.map((q,i)=>{const v=Number(document.querySelector(`input[name="quiz${i}"]:checked`)?.value);const ok=v===q.correctIndex;if(ok)score++;return {...q,selected:v,ok};});const pct=Math.round(score/results.length*100),passed=pct>=75;
  try{await addDoc(collection(db,"academy_quiz_attempts"),{officerId:window.LSPD.user.uid,officerName:window.LSPD.profile.name,moduleCode:qz.code,score,total:results.length,percentage:pct,passed,createdAt:serverTimestamp()});showModal(`<h2>${passed?"✅ Quiz réussi":"🟠 Quiz à refaire"}</h2><div class="final-summary"><div><span>Score</span><b>${score}/${results.length}</b></div><div><span>Résultat</span><b>${pct}%</b></div></div>${results.map(r=>`<div class="quiz-result ${r.ok?"ok":"bad"}"><b>${esc(r.question)}</b><p>${r.ok?"✓":"✕"} ${esc(r.answer)}</p></div>`).join("")}<div class="modal-actions"><button class="btn" id="quizDoneBtn">Fermer</button></div>`);$("quizDoneBtn").onclick=()=>{document.querySelector(".modal")?.remove();trainingQuiz();};}catch(err){$("quizError").textContent="Erreur : "+(err.code||err.message);}
}

async function ftoDossier(){
  if(!hasPerm("academy_manage"))return;const trainees=await accessibleTrainees("all");
  $("content").innerHTML=`<div class="toolbar"><label class="field dossier-select"><span>Recrue</span><select id="dossierTrainee">${trainees.map(t=>`<option value="${t.uid}" ${t.uid===window.LSPD.selectedTraineeId?"selected":""}>${esc(t.badge)} — ${esc(t.name)}</option>`).join("")}</select></label><button class="btn secondary" id="printDossierBtn">Imprimer le rapport final</button>${hasPerm("fto_handoffs_manage")?'<button class="btn" id="addHandoffBtn">Ajouter une note de passation</button>':""}</div><div id="dossierBody">${trainees.length?'<div class="card skeleton-card"></div>':'<div class="card"><p class="muted">Aucune recrue assignée.</p></div>'}</div>`;
  if(!trainees.length)return;const refresh=()=>loadTraineeDossier($("dossierTrainee").value,trainees);$("dossierTrainee").onchange=refresh;$("printDossierBtn").onclick=()=>printTrainingReport($("dossierTrainee").value,trainees);$("addHandoffBtn")?.addEventListener("click",()=>openHandoffForm($("dossierTrainee").value,trainees));refresh();
}
async function loadTraineeDossier(uid,trainees){
  const trainee=trainees.find(t=>t.uid===uid);if(!trainee)return;const [es,ss,os,qs,fs,hs,fbs]=await Promise.all([getDocs(collection(db,"evaluations")),getDocs(collection(db,"fto_sessions")),getDocs(collection(db,"training_objectives")),getDocs(collection(db,"academy_quiz_attempts")),getDocs(collection(db,"final_fto_reviews")),getDocs(collection(db,"fto_handoffs")),getDocs(collection(db,"fto_feedback"))]);
  const evals=es.docs.map(d=>d.data()).filter(x=>x.officerId===uid),sessions=ss.docs.map(d=>d.data()).filter(x=>x.traineeId===uid),objectives=os.docs.map(d=>d.data()).filter(x=>x.traineeId===uid),quizzes=qs.docs.map(d=>d.data()).filter(x=>x.officerId===uid),finals=fs.docs.map(d=>d.data()).filter(x=>x.traineeId===uid),handoffs=hs.docs.map(d=>d.data()).filter(x=>x.traineeId===uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)),feedback=fbs.docs.map(d=>d.data()).filter(x=>x.traineeId===uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const latest={};evals.forEach(e=>{if(!latest[e.moduleCode]||(e.createdAt?.seconds||0)>(latest[e.moduleCode].createdAt?.seconds||0))latest[e.moduleCode]=e;});const scored=Object.values(latest).filter(e=>Number.isFinite(Number(e.score))),avg=scored.length?Math.round(scored.reduce((a,e)=>a+Number(e.score),0)/scored.length):0;const weak=scored.filter(e=>Number(e.score)<75).sort((a,b)=>a.score-b.score).slice(0,3);
  $("dossierBody").innerHTML=`<div class="dossier-header card"><div><span class="number">${esc(trainee.badge)}</span><h2>${esc(trainee.name)}</h2><p class="muted">${esc(trainee.grade)} • ${esc(trainee.division||"Patrol")}</p></div><div class="dossier-kpis"><div><span>Moyenne</span><b>${avg}/100</b></div><div><span>Sessions</span><b>${sessions.filter(s=>s.status==="Terminée").length}</b></div><div><span>Objectifs ouverts</span><b>${objectives.filter(o=>o.status==="Ouvert").length}</b></div></div></div><div class="section-title">Progression M01–M16</div><div class="training-heatmap">${modules.map(m=>{const e=latest[m[0]],score=e?Number(e.score):null,cls=score===null?"none":score>=75?"good":score>=55?"warn":"bad";return `<div class="heat-cell ${cls}" title="${esc(m[1])}"><b>${m[0]}</b><span>${score===null?"—":score}</span></div>`}).join("")}</div><div class="grid2"><div class="card"><h3>Plan de rattrapage</h3>${weak.length?weak.map(e=>`<div class="remedial-item"><span class="tag ${e.score<55?"red":"orange"}">${e.moduleCode} • ${e.score}/100</span><p>${esc(getAcademyData(e.moduleCode)?.corrective()||"Nouvelle session recommandée.")}</p></div>`).join(""):'<p class="muted">Aucun module faible détecté.</p>'}</div><div class="card"><h3>Objectifs de la recrue</h3>${objectives.length?objectives.slice(0,8).map(o=>`<div class="row"><span>${esc(o.text)}</span><span class="tag ${o.status==="Atteint"?"green":"orange"}">${esc(o.status)}</span></div>`).join(""):'<p class="muted">Aucun objectif.</p>'}</div></div><div class="grid2"><div class="card"><h3>Passation FTO</h3>${handoffs.length?handoffs.slice(0,5).map(h=>`<div class="timeline-entry"><b>${esc(h.authorName)}</b><small>${formatDate(h.createdAt)}</small><p>${esc(h.note)}</p></div>`).join(""):'<p class="muted">Aucune note de passation.</p>'}</div><div class="card"><h3>Feedback de la recrue</h3>${feedback.length?feedback.slice(0,5).map(f=>`<div class="timeline-entry"><b>${f.understanding}/5</b><small>${formatDate(f.createdAt)}</small><p>${esc(f.difficulty||"—")}</p><p class="muted">${esc(f.question||"")}</p></div>`).join(""):'<p class="muted">Aucun feedback.</p>'}</div></div><div class="card"><h3>Historique pédagogique</h3><div class="row"><span>Évaluations</span><b>${evals.length}</b></div><div class="row"><span>Quiz</span><b>${quizzes.length}</b></div><div class="row"><span>Sessions FTO</span><b>${sessions.length}</b></div><div class="row"><span>Évaluations finales</span><b>${finals.length}</b></div></div>`;
}
function openHandoffForm(uid,trainees){if(!hasPerm("fto_handoffs_manage"))return;const t=trainees.find(x=>x.uid===uid);if(!t)return;showModal(`<h2>Ajouter une note de passation</h2><p class="muted">${esc(t.name)}</p><form id="handoffForm"><label class="field full"><span>Passation FTO</span><textarea id="handoffNote" rows="7" required placeholder="Ce qui a été travaillé, difficultés, points de vigilance, priorité de la prochaine session..."></textarea></label><div id="handoffError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);$("handoffForm").onsubmit=e=>saveHandoff(e,uid,t.name);}
async function saveHandoff(e,uid,name){e.preventDefault();if(!hasPerm("fto_handoffs_manage"))return;try{await addDoc(collection(db,"fto_handoffs"),{traineeId:uid,traineeName:name,note:$("handoffNote").value.trim(),authorId:window.LSPD.user.uid,authorName:window.LSPD.profile.name,createdAt:serverTimestamp()});await addAudit("FTO_HANDOFF",uid,name);document.querySelector(".modal")?.remove();showToast("Note de passation enregistrée.","success");ftoDossier();}catch(err){$("handoffError").textContent="Erreur : "+(err.code||err.message);}}
async function printTrainingReport(uid,trainees){
  const t=trainees.find(x=>x.uid===uid);if(!t)return;const [es,ss,os,fs]=await Promise.all([getDocs(collection(db,"evaluations")),getDocs(collection(db,"fto_sessions")),getDocs(collection(db,"training_objectives")),getDocs(collection(db,"final_fto_reviews"))]);const evals=es.docs.map(d=>d.data()).filter(x=>x.officerId===uid),sessions=ss.docs.map(d=>d.data()).filter(x=>x.traineeId===uid),objs=os.docs.map(d=>d.data()).filter(x=>x.traineeId===uid),finals=fs.docs.map(d=>d.data()).filter(x=>x.traineeId===uid);const avg=evals.length?Math.round(evals.reduce((a,e)=>a+(Number(e.score)||0),0)/evals.length):0;const w=window.open("","_blank");if(!w)return;w.document.write(`<!doctype html><html><head><title>FTO ${esc(t.name)}</title><style>body{font-family:Arial;padding:32px;color:#17202a}h1{margin-bottom:0}.meta{color:#667}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.box{border:1px solid #ccd5df;padding:12px;border-radius:8px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ccd5df;padding:8px;text-align:left}small{color:#667}</style></head><body><h1>LSPD — Rapport final FTO</h1><p class="meta">Développé par Walead</p><h2>${esc(t.badge)} — ${esc(t.name)}</h2><div class="grid"><div class="box">Moyenne<br><b>${avg}/100</b></div><div class="box">Sessions terminées<br><b>${sessions.filter(s=>s.status==="Terminée").length}</b></div><div class="box">Objectifs atteints<br><b>${objs.filter(o=>o.status==="Atteint").length}/${objs.length}</b></div></div><h3>Évaluations</h3><table><tr><th>Module</th><th>Score</th><th>Résultat</th><th>FTO</th></tr>${evals.map(e=>`<tr><td>${esc(e.moduleCode)}</td><td>${e.score}/100</td><td>${esc(e.result)}</td><td>${esc(e.ftoName)}</td></tr>`).join("")}</table><h3>Décision finale</h3>${finals.length?finals.map(f=>`<p><b>${esc(f.decision)}</b> — ${esc(f.status||"En attente Commandement")}<br>${esc(f.comment||"")}</p>`).join(""):'<p>Aucune évaluation finale.</p>'}<script>window.onload=()=>window.print();<\/script></body></html>`);w.document.close();
}

async function myTrainingFeedback(){
  if(!hasPerm("training_access"))return;const uid=window.LSPD.user.uid;const [ss,fs]=await Promise.all([getDocs(query(collection(db,"fto_sessions"),where("traineeId","==",uid))),getDocs(query(collection(db,"fto_feedback"),where("traineeId","==",uid)))]);const sessions=ss.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)),feedback=fs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="grid2"><div class="card"><h2>Feedback de la recrue</h2>${sessions.length?`<form id="trainingFeedbackForm"><label class="field"><span>Session</span><select id="fbSession">${sessions.map(s=>`<option value="${s.id}" data-fto="${s.ftoId}" data-ftoname="${esc(s.ftoName)}">${esc(s.moduleCode)} — ${esc(s.ftoName)} — ${formatDate(s.createdAt)}</option>`).join("")}</select></label><label class="field"><span>Compréhension</span><select id="fbUnderstanding"><option value="1">1/5</option><option value="2">2/5</option><option value="3">3/5</option><option value="4">4/5</option><option value="5" selected>5/5</option></select></label><label class="field full"><span>Difficulté rencontrée</span><textarea id="fbDifficulty" rows="4"></textarea></label><label class="field full"><span>Question au FTO</span><textarea id="fbQuestion" rows="4"></textarea></label><div id="fbError" class="error"></div><button class="btn" type="submit">Envoyer le feedback</button></form>`:'<p class="muted">Aucune session FTO disponible.</p>'}</div><div class="card"><h3>Mes feedbacks</h3>${feedback.length?feedback.slice(0,10).map(f=>`<div class="timeline-entry"><b>${esc(f.moduleCode)} • ${f.understanding}/5</b><small>${formatDate(f.createdAt)}</small><p>${esc(f.difficulty||"—")}</p></div>`).join(""):'<p class="muted">Aucun feedback.</p>'}</div></div>`;$("trainingFeedbackForm")?.addEventListener("submit",saveTrainingFeedback);
}
async function saveTrainingFeedback(e){e.preventDefault();if(!hasPerm("training_access"))return;const s=$("fbSession"),o=s.selectedOptions[0];try{await addDoc(collection(db,"fto_feedback"),{traineeId:window.LSPD.user.uid,traineeName:window.LSPD.profile.name,sessionId:s.value,moduleCode:sessionsafe(s.value),ftoId:o.dataset.fto,ftoName:o.dataset.ftoname,understanding:Number($("fbUnderstanding").value),difficulty:$("fbDifficulty").value.trim(),question:$("fbQuestion").value.trim(),createdAt:serverTimestamp()});showToast("Feedback envoyé.","success");myTrainingFeedback();}catch(err){$("fbError").textContent="Erreur : "+(err.code||err.message);}}
function sessionsafe(sessionId){const option=$("fbSession")?.selectedOptions?.[0];return option?option.textContent.trim().split(" — ")[0]:"—";}

async function reviewFinalFto(id,status){
  if(!hasPerm("academy_final_review"))return;try{await updateDoc(doc(db,"final_fto_reviews",id),{status,reviewedById:window.LSPD.user.uid,reviewedByName:window.LSPD.profile.name,reviewedAt:serverTimestamp()});await addAudit("FTO_FINAL_COMMAND_REVIEW",id,status);showToast("Validation finale mise à jour.","success");ftoFinal();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function dashboard(){
  if(isVisitor()){return visitorPortal();}
  const p=window.LSPD.profile;
  let evals=[]; try{evals=await getMyEvaluations();}catch{}
  const validated=[...new Set(evals.filter(e=>e.result==="Validé").map(e=>e.moduleCode))];
  const pct=Math.round(validated.length/modules.length*100);
  let extra="";

  if(hasPerm("analytics")){
    try{
      const [usersSnap,leaveSnap,shiftSnap,evalSnap]=await Promise.all([
        getDocs(query(collection(db,"users"),where("role","!=","Visiteur"))),
        getDocs(collection(db,"leave_requests")),
        getDocs(collection(db,"shifts")),
        getDocs(collection(db,"evaluations"))
      ]);
      const users=usersSnap.docs.map(d=>d.data());
      const pending=leaveSnap.docs.map(d=>d.data()).filter(x=>x.status==="En attente").length;
      const today=new Date().toISOString().slice(0,10);
      const todayShifts=shiftSnap.docs.map(d=>d.data()).filter(x=>x.date===today).length;
      const active=users.filter(u=>!["Visiteur","Applicant"].includes(u.role)&&u.status==="Actif").length;
      const evalCount=evalSnap.size;
      extra=`<div class="section-title">Command overview</div>
      <div class="grid stats-grid">
        <div class="card accent-card"><div class="muted">Effectif actif</div><div class="stat">${active}</div></div>
        <div class="card accent-card"><div class="muted">Congés en attente</div><div class="stat">${pending}</div></div>
        <div class="card accent-card"><div class="muted">Shifts aujourd'hui</div><div class="stat">${todayShifts}</div></div>
        <div class="card accent-card"><div class="muted">Évaluations totales</div><div class="stat">${evalCount}</div></div>
      </div>`;
    }catch{}
  }

  $("content").innerHTML=`
  <div class="grid stats-grid">
    <div class="card"><div class="muted">Identité</div><div class="stat">${esc(p?.name)}</div><div class="muted">${esc(p?.badge)}</div></div>
    <div class="card"><div class="muted">Grade</div><div class="stat">${esc(p?.grade)}</div><div class="muted">${esc(p?.role)}</div></div>
    <div class="card"><div class="muted">Progression</div><div class="stat">${pct}%</div><div class="muted">${validated.length}/${modules.length} modules validés</div></div>
    <div class="card"><div class="muted">Statut</div><div class="stat">${esc(p?.status)}</div><div class="muted">${esc(p?.division||"Patrol")}</div></div>
  </div>
  ${extra}
  <div class="section-title">Progression personnelle</div>
  <div class="grid2">
    <div class="card"><div class="progress"><i style="width:${pct}%"></i></div>
      ${modules.slice(0,8).map(m=>`<div class="row"><span>${m[0]} — ${m[1]}</span><span class="tag ${validated.includes(m[0])?"green":""}">${validated.includes(m[0])?"Validé":"À faire"}</span></div>`).join("")}
    </div>
    <div class="card"><h3>Dossier</h3><p><b>${esc(p?.name)}</b></p><p class="muted">${esc(window.LSPD.user?.email)}</p><p class="muted">${(hasPerm("fto_tools")||hasPerm("academy_manage"))?"Accès FTO/Command actif":"Accès Officer"}</p></div>
  </div>`;
}

function profile(){
  const p=window.LSPD.profile;
  $("content").innerHTML=`<div class="grid2">
    <div class="card">
      <h2>${esc(p.name)}</h2>
      <div class="detail-grid">
        <div><span>Matricule</span><b>${esc(p.badge)}</b></div>
        <div><span>Grade</span><b>${esc(p.grade)}</b></div>
        <div><span>Rôle</span><b>${esc(p.role)}</b></div>
        <div><span>Unité</span><b>${esc(p.division||"Patrol")}</b></div>
        <div><span>Statut</span><b>${esc(p.status)}</b></div>
        <div><span>Email</span><b>${esc(window.LSPD.user.email)}</b></div>
      </div>
    </div>
    <div class="card">
      <h3>Sécurité du compte</h3>
      <p class="muted">Tu peux recevoir un e-mail Firebase pour réinitialiser ton mot de passe.</p>
      <button class="btn" id="resetPasswordBtn">Envoyer l'e-mail de réinitialisation</button>
      <p id="profileMsg" class="muted"></p>
    </div>
  </div>`;
  $("resetPasswordBtn").onclick=async()=>{
    try{
      await sendPasswordResetEmail(auth,window.LSPD.user.email);
      $("profileMsg").textContent="E-mail de réinitialisation envoyé.";
    }catch(e){$("profileMsg").textContent="Erreur : "+(e.code||e.message);}
  };
}


async function announcements(){
  try{
    const snap=isVisitor()
      ? await getDocs(query(collection(db,"announcements"),where("visibility","==","Public")))
      : await getDocs(collection(db,"announcements"));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar">${hasPerm("announcements_manage")?'<button class="btn" id="newAnnouncementBtn">+ Nouvelle annonce</button>':""}</div>
    <div class="grid2">${data.length?data.map(a=>`<div class="card notice ${a.active===false?"muted-card":""}"><span class="tag ${a.priority==="Urgent"?"red":a.priority==="Important"?"orange":""}">${esc(a.priority||"Normal")}</span> ${a.visibility==="Public"?'<span class="tag green">Public</span>':''}<h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><p class="muted">${esc(a.authorName)} • ${formatDate(a.createdAt)}</p></div>`).join(""):'<div class="card"><p class="muted">Aucune annonce.</p></div>'}</div>`;
    $("newAnnouncementBtn")?.addEventListener("click",openAnnouncementForm);
  }catch(err){ $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`; }
}
function openAnnouncementForm(){
  showModal(`<h2>Nouvelle annonce</h2><form id="announcementForm"><label class="field"><span>Titre</span><input id="anTitle" required></label><label class="field"><span>Priorité</span><select id="anPriority"><option>Normal</option><option>Important</option><option>Urgent</option></select></label><label class="field"><span>Visibilité</span><select id="anVisibility"><option>Interne</option><option>Public</option></select></label><label class="field full"><span>Message</span><textarea id="anBody" rows="6" required></textarea></label><div id="anError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Publier</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("announcementForm").onsubmit=saveAnnouncement;
}
async function saveAnnouncement(e){
  e.preventDefault();
  if(!hasPerm("announcements_manage"))return;
  try{
    await addDoc(collection(db,"announcements"),{title:$("anTitle").value.trim(),priority:$("anPriority").value,visibility:$("anVisibility").value,body:$("anBody").value.trim(),authorId:window.LSPD.user.uid,authorName:window.LSPD.profile.name,active:true,createdAt:serverTimestamp()});
    await addAudit("ANNOUNCEMENT_CREATE","announcement",$("anTitle").value.trim());
    try{
      const users=(await getUsers()).filter(u=>u.uid!==window.LSPD.user.uid && !["Visiteur","Applicant"].includes(u.role) && u.status!=="Archivé");
      await Promise.all(users.map(u=>createNotification(
        u.uid,
        `Annonce LSPD : ${$("anTitle").value.trim()}`,
        $("anBody").value.trim(),
        $("anPriority").value==="Urgent"?"Urgent":"Annonce",
        "announcements"
      )));
    }catch{}
    document.querySelector(".modal")?.remove(); announcements();
  }catch(err){ $("anError").textContent="Erreur : "+(err.code||err.message); }
}

async function loadMyMessages(){
  const [sentSnap,receivedSnap]=await Promise.all([
    getDocs(query(collection(db,"messages"),where("senderId","==",window.LSPD.user.uid))),
    getDocs(query(collection(db,"messages"),where("recipientId","==",window.LSPD.user.uid)))
  ]);
  const map=new Map();
  [...sentSnap.docs,...receivedSnap.docs].forEach(d=>map.set(d.id,{id:d.id,...d.data()}));
  return [...map.values()].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
}

function mailCounter(data){
  return data.filter(m=>m.recipientId===window.LSPD.user.uid && m.read!==true).length;
}

function refreshMailBadgeFromData(data){
  const unread=mailCounter(data);
  const el=$("mailUnreadCount");
  if(el){
    el.textContent=unread>99?"99+":unread?String(unread):"";
    el.classList.toggle("hidden",!unread);
  }
}

async function refreshMailBadge(){
  if(!window.LSPD.user||!hasPerm("messages_access")){
    $("mailUnreadCount")?.classList.add("hidden");
    return;
  }
  try{refreshMailBadgeFromData(await loadMyMessages());}catch{}
}

function startMailListener(){
  window.LSPD.mailUnsub?.();
  window.LSPD.mailUnsub=null;
  if(!window.LSPD.user||!hasPerm("messages_access")){
    $("mailUnreadCount")?.classList.add("hidden");
    return;
  }
  const q=query(collection(db,"messages"),where("recipientId","==",window.LSPD.user.uid));
  window.LSPD.mailUnsub=onSnapshot(q,snap=>{
    const unread=snap.docs.filter(d=>d.data().read!==true).length;
    const el=$("mailUnreadCount");
    if(el){
      el.textContent=unread>99?"99+":unread?String(unread):"";
      el.classList.toggle("hidden",!unread);
    }
    if(window.LSPD.currentPage==="messages") messages().catch(()=>{});
  },()=>{});
}

function mailFilteredData(data,folder,search=""){
  const q=(search||"").trim().toLowerCase();
  let result=data;
  if(folder==="inbox") result=result.filter(m=>m.recipientId===window.LSPD.user.uid);
  if(folder==="sent") result=result.filter(m=>m.senderId===window.LSPD.user.uid);
  if(q) result=result.filter(m=>[
    m.senderName,m.recipientName,m.subject,m.body
  ].some(v=>String(v||"").toLowerCase().includes(q)));
  return result;
}

function renderMailRows(){
  const host=$("mailList");
  if(!host)return;
  const data=mailFilteredData(window.LSPD.mailData||[],window.LSPD.mailFolder||"inbox",$("mailSearch")?.value||"");
  host.innerHTML=data.length?data.map(m=>{
    const incoming=m.recipientId===window.LSPD.user.uid;
    const unread=incoming&&m.read!==true;
    const counterpart=incoming?m.senderName:m.recipientName;
    return `<button class="outlook-mail-row ${unread?"unread":""}" type="button" data-id="${m.id}">
      <span class="mail-row-dot">${unread?"●":""}</span>
      <span class="mail-row-person">${esc(counterpart||"—")}</span>
      <span class="mail-row-main"><b>${esc(m.subject||"(Sans sujet)")}</b><small>${esc(String(m.body||"").replace(/\s+/g," ").slice(0,115))}</small></span>
      <span class="mail-row-date">${formatDate(m.createdAt)}</span>
    </button>`;
  }).join(""):`<div class="outlook-empty"><span>📭</span><p>Aucun message.</p></div>`;

  document.querySelectorAll(".outlook-mail-row").forEach(row=>row.onclick=()=>openMailMessage(row.dataset.id));
}

async function messages(){
  if(isVisitor() || !hasPerm("messages_access"))return;
  try{
    const data=await loadMyMessages();
    window.LSPD.mailData=data;
    refreshMailBadgeFromData(data);
    const inbox=data.filter(m=>m.recipientId===window.LSPD.user.uid).length;
    const sent=data.filter(m=>m.senderId===window.LSPD.user.uid).length;
    const unread=mailCounter(data);

    $("content").innerHTML=`<div class="outlook-shell card">
      <aside class="outlook-folders">
        <div class="outlook-brand"><span>✉️</span><b>Boîte LSPD</b></div>
        <button class="btn outlook-compose" id="newMessageBtn">＋ Nouveau message</button>
        <button class="outlook-folder ${window.LSPD.mailFolder==="inbox"?"active":""}" data-folder="inbox"><span>📥 Boîte de réception</span><b>${unread||inbox}</b></button>
        <button class="outlook-folder ${window.LSPD.mailFolder==="sent"?"active":""}" data-folder="sent"><span>📤 Envoyés</span><b>${sent}</b></button>
        <button class="outlook-folder ${window.LSPD.mailFolder==="all"?"active":""}" data-folder="all"><span>🗂️ Tous les messages</span><b>${data.length}</b></button>
      </aside>
      <section class="outlook-mailbox">
        <div class="outlook-toolbar">
          <div>
            <span class="eyebrow">LSPD INTERNAL MAIL</span>
            <h2>${window.LSPD.mailFolder==="sent"?"Envoyés":window.LSPD.mailFolder==="all"?"Tous les messages":"Boîte de réception"}</h2>
          </div>
          <button class="icon-btn" id="refreshMailBtn" title="Actualiser">↻</button>
        </div>
        <div class="outlook-search-wrap">🔎 <input id="mailSearch" placeholder="Rechercher dans les messages..."></div>
        <div id="mailList" class="outlook-mail-list"></div>
      </section>
    </div>`;

    document.querySelectorAll(".outlook-folder").forEach(btn=>btn.onclick=()=>{
      window.LSPD.mailFolder=btn.dataset.folder;
      messages();
    });
    $("newMessageBtn").onclick=()=>openMessageForm();
    $("refreshMailBtn").onclick=()=>messages();
    $("mailSearch").oninput=renderMailRows;
    renderMailRows();
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

function closeMailWindow(){
  const root=$("mailOverlayRoot");
  if(root) root.innerHTML="";
  document.body.classList.remove("mail-window-open");
}

async function openMailMessage(id){
  if(!hasPerm("messages_access")) return;
  if(!id||isVisitor())return;
  try{
    let data=window.LSPD.mailData||[];
    let message=data.find(m=>m.id===id);
    if(!message){
      const snap=await getDoc(doc(db,"messages",id));
      if(!snap.exists())return;
      message={id:snap.id,...snap.data()};
      if(message.senderId!==window.LSPD.user.uid && message.recipientId!==window.LSPD.user.uid)return;
      data=await loadMyMessages();
      window.LSPD.mailData=data;
    }

    if(message.recipientId===window.LSPD.user.uid && message.read!==true){
      await updateDoc(doc(db,"messages",message.id),{read:true,readAt:serverTimestamp()});
      message.read=true;
      const cached=window.LSPD.mailData.find(m=>m.id===message.id);
      if(cached)cached.read=true;
      refreshMailBadgeFromData(window.LSPD.mailData);
    }

    const threadId=message.threadId||message.id;
    const thread=(window.LSPD.mailData||[])
      .filter(m=>(m.threadId||m.id)===threadId)
      .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));

    const root=$("mailOverlayRoot");
    root.innerHTML=`<div class="mail-window-backdrop" data-mail-close="1"></div>
      <section class="mail-reader-window" role="dialog" aria-label="${esc(message.subject||"Message")}">
        <header class="mail-window-header">
          <div class="mail-window-title"><span>✉️</span><div><small>${message.recipientId===window.LSPD.user.uid?"Boîte de réception":"Envoyés"}</small><h2>${esc(message.subject||"(Sans sujet)")}</h2></div></div>
          <button class="mail-window-close" id="closeMailWindowBtn" type="button">✕</button>
        </header>
        <div class="mail-action-bar">
          <button class="mail-action" id="replyMailBtn" type="button">↩ Répondre</button>
          <button class="mail-action" id="forwardMailBtn" type="button">↪ Transférer</button>
          ${message.recipientId===window.LSPD.user.uid?`<button class="mail-action" id="unreadMailBtn" type="button">◉ Marquer comme non lu</button>`:""}
        </div>
        <div class="mail-reader-scroll">
          ${message.broadcastSize>1?`<div class="mail-broadcast-banner">📨 Envoi groupé • ${message.broadcastSize} destinataires</div>`:""}
          <div class="mail-message-envelope">
            <div class="mail-avatar">${esc((message.senderName||"?").slice(0,1).toUpperCase())}</div>
            <div class="mail-envelope-info">
              <b>${esc(message.senderName||"—")}</b>
              <span>À : ${esc(message.recipientName||"—")}</span>
            </div>
            <time>${formatDate(message.createdAt)}</time>
          </div>
          <article class="mail-reader-body">${esc(message.body||"").replace(/\n/g,"<br>")}</article>
          ${thread.length>1?`<section class="mail-thread"><h3>Conversation</h3>${thread.map(t=>`<div class="mail-thread-item ${t.id===message.id?"current":""}"><div><b>${esc(t.senderName)}</b><span> → ${esc(t.recipientName)}</span></div><small>${formatDate(t.createdAt)}</small><p>${esc(String(t.body||"").slice(0,240))}</p></div>`).join("")}</section>`:""}
        </div>
      </section>`;
    document.body.classList.add("mail-window-open");

    $("closeMailWindowBtn").onclick=closeMailWindow;
    root.querySelector(".mail-window-backdrop").onclick=closeMailWindow;
    $("replyMailBtn").onclick=()=>openMailComposer("reply",message);
    $("forwardMailBtn").onclick=()=>openMailComposer("forward",message);
    $("unreadMailBtn")?.addEventListener("click",async()=>{
      await updateDoc(doc(db,"messages",message.id),{read:false,readAt:null});
      const cached=window.LSPD.mailData.find(m=>m.id===message.id);if(cached){cached.read=false;cached.readAt=null;}
      refreshMailBadgeFromData(window.LSPD.mailData);
      closeMailWindow();
      if(window.LSPD.currentPage==="messages")messages();
    });
  }catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function mailDirectory(){
  // IMPORTANT: Firestore rules are not filters. The query explicitly excludes
  // Visitor profiles so every internal user can safely use the mail directory.
  const snap=await getDocs(query(collection(db,"users"),where("role","!=","Visiteur")));
  return snap.docs
    .map(d=>({uid:d.id,...d.data()}))
    .filter(u=>
      u.uid!==window.LSPD.user.uid &&
      !["Visiteur","Applicant"].includes(u.role) &&
      !["Archivé","Refusé","En attente"].includes(u.status)
    )
    .sort((a,b)=>(a.name||"").localeCompare(b.name||""));
}

async function loadMailAudienceDirectory(){
  const users=await mailDirectory();
  let certDocs=[];
  try{
    const certSnap=await getDocs(collection(db,"certifications"));
    certDocs=certSnap.docs.map(d=>({id:d.id,...d.data()}));
  }catch(err){
    console.warn("Certification directory unavailable",err);
  }

  const byOfficer=new Map();
  certDocs.forEach(c=>{
    if(!c.officerId||!c.certification)return;
    if(!byOfficer.has(c.officerId))byOfficer.set(c.officerId,new Set());
    byOfficer.get(c.officerId).add(c.certification);
  });

  return users.map(u=>({
    ...u,
    mailCertifications:[...(byOfficer.get(u.uid)||new Set())].sort()
  }));
}

function getSelectedMailRecipients(){
  const directory=window.LSPD.mailAudienceDirectory||[];
  const selectedIds=new Set(
    [...document.querySelectorAll(".mail-person-check:checked")].map(x=>x.value)
  );
  const selectedGrades=new Set(
    [...document.querySelectorAll(".mail-grade-check:checked")].map(x=>x.value)
  );
  const selectedCerts=new Set(
    [...document.querySelectorAll(".mail-cert-check:checked")].map(x=>x.value)
  );

  directory.forEach(u=>{
    if(selectedGrades.has(u.grade))selectedIds.add(u.uid);
    if((u.mailCertifications||[]).some(c=>selectedCerts.has(c)))selectedIds.add(u.uid);
  });

  return directory.filter(u=>selectedIds.has(u.uid));
}

function renderMailPeopleFilter(){
  const host=$("mailPeopleList"),search=$("mailPeopleSearch");
  if(!host)return;

  const q=(search?.value||"").trim().toLowerCase();
  const directory=(window.LSPD.mailAudienceDirectory||[]).filter(u=>
    !q || [u.name,u.badge,u.grade,u.division,...(u.mailCertifications||[])]
      .some(v=>String(v||"").toLowerCase().includes(q))
  );

  host.innerHTML=directory.length?directory.map(u=>`
    <label class="mail-recipient-row">
      <input class="mail-person-check" type="checkbox" value="${u.uid}" ${window.LSPD.mailManualRecipientIds?.has(u.uid)?"checked":""}>
      <span class="mail-recipient-avatar">${esc((u.name||"?").slice(0,1).toUpperCase())}</span>
      <span class="mail-recipient-info">
        <b>${esc(u.badge||"—")} — ${esc(u.name||"—")}</b>
        <small>${esc(u.grade||"—")} • ${esc(u.division||"—")}${u.mailCertifications?.length?` • ${esc(u.mailCertifications.join(", "))}`:""}</small>
      </span>
    </label>`).join(""):`<div class="mail-audience-empty">Aucun membre trouvé.</div>`;

  document.querySelectorAll(".mail-person-check").forEach(cb=>cb.onchange=()=>{
    window.LSPD.mailManualRecipientIds??=new Set();
    cb.checked?window.LSPD.mailManualRecipientIds.add(cb.value):window.LSPD.mailManualRecipientIds.delete(cb.value);
    updateMailAudiencePreview();
  });
}

function updateMailAudiencePreview(){
  const recipients=getSelectedMailRecipients();
  const summary=$("mailAudienceSummary"),chips=$("mailAudienceChips");
  if(summary){
    summary.textContent=recipients.length
      ? `${recipients.length} ${recipients.length===1?"destinataire sélectionné":"destinataires sélectionnés"}`
      : "Aucun destinataire sélectionné.";
  }
  if(chips){
    const shown=recipients.slice(0,14);
    chips.innerHTML=shown.map(u=>`<span class="mail-audience-chip">${esc(u.name)} <small>${esc(u.grade||"")}</small></span>`).join("")
      +(recipients.length>shown.length?`<span class="mail-audience-chip more">+${recipients.length-shown.length}</span>`:"");
  }
}

function clearMailAudience(){
  window.LSPD.mailManualRecipientIds=new Set();
  document.querySelectorAll(".mail-person-check,.mail-grade-check,.mail-cert-check").forEach(x=>x.checked=false);
  renderMailPeopleFilter();
  updateMailAudiencePreview();
}

async function openMailComposer(mode="new",source=null){
  try{
    const isReply=mode==="reply";
    const directory=isReply?[]:await loadMailAudienceDirectory();
    window.LSPD.mailAudienceDirectory=directory;
    window.LSPD.mailManualRecipientIds=new Set();

    const counterpartId=source?(source.senderId===window.LSPD.user.uid?source.recipientId:source.senderId):"";
    const counterpartName=source?(source.senderId===window.LSPD.user.uid?source.recipientName:source.senderName):"";
    const baseSubject=source?.subject||"";
    const subject=mode==="reply"
      ? (/^RE:/i.test(baseSubject)?baseSubject:`RE: ${baseSubject}`)
      : mode==="forward"
        ? (/^FW:/i.test(baseSubject)?baseSubject:`FW: ${baseSubject}`)
        : "";
    const quote=source?`\n\n------------------------------\n${mode==="forward"?"Message transféré":"Message d'origine"}\nDe: ${source.senderName}\nÀ: ${source.recipientName}\nSujet: ${source.subject}\n\n${source.body}`:"";

    const gradeOptions=gradeList
      .filter(g=>g[0]!=="Visiteur")
      .map(g=>{
        const count=directory.filter(u=>u.grade===g[0]).length;
        return `<label class="mail-group-option ${count?"":"disabled"}">
          <input class="mail-grade-check" type="checkbox" value="${esc(g[0])}" ${count?"":"disabled"}>
          <span><b>${esc(g[0])}</b><small>${count} membre${count===1?"":"s"}</small></span>
        </label>`;
      }).join("");

    const certValues=[...new Set([
      ...certificationsCatalog,
      ...directory.flatMap(u=>u.mailCertifications||[])
    ])].sort();

    const certOptions=certValues.map(cert=>{
      const count=directory.filter(u=>(u.mailCertifications||[]).includes(cert)).length;
      return `<label class="mail-group-option ${count?"":"disabled"}">
        <input class="mail-cert-check" type="checkbox" value="${esc(cert)}" ${count?"":"disabled"}>
        <span><b>${esc(cert)}</b><small>${count} membre${count===1?"":"s"}</small></span>
      </label>`;
    }).join("");

    const recipientBlock=isReply
      ? `<div class="mail-direct-reply">
          <span>Réponse directe</span>
          <b>${esc(counterpartName||"—")}</b>
          <small>Le destinataire de la réponse est verrouillé sur l'expéditeur du message.</small>
          <input id="mFixedRecipientId" type="hidden" value="${esc(counterpartId)}">
          <input id="mFixedRecipientName" type="hidden" value="${esc(counterpartName)}">
        </div>`
      : `<section class="mail-audience-builder">
          <div class="mail-audience-top">
            <div>
              <span class="eyebrow">DESTINATAIRES</span>
              <h3>Choisir une ou plusieurs personnes</h3>
            </div>
            <button class="mail-clear-audience" id="clearMailAudienceBtn" type="button">Effacer la sélection</button>
          </div>
          <p class="mail-audience-help">Les sélections se cumulent. Les doublons sont supprimés automatiquement.</p>

          <div class="mail-audience-grid">
            <div class="mail-audience-panel people">
              <div class="mail-audience-panel-head"><b>👤 Personnes</b><span>Sélection directe</span></div>
              <div class="mail-people-search">🔎 <input id="mailPeopleSearch" placeholder="Rechercher un membre..."></div>
              <div id="mailPeopleList" class="mail-people-list"></div>
            </div>

            <div class="mail-audience-groups">
              <div class="mail-audience-panel">
                <div class="mail-audience-panel-head"><b>⭐ Grades</b><span>Sélection par grade</span></div>
                <div class="mail-group-grid">${gradeOptions}</div>
              </div>

              <div class="mail-audience-panel">
                <div class="mail-audience-panel-head"><b>🏅 Certifications</b><span>Sélection par certification</span></div>
                <div class="mail-group-grid">${certOptions||'<div class="mail-audience-empty">Aucune certification disponible.</div>'}</div>
              </div>
            </div>
          </div>

          <div class="mail-audience-selection">
            <b id="mailAudienceSummary">Aucun destinataire sélectionné.</b>
            <div id="mailAudienceChips" class="mail-audience-chips"></div>
          </div>
        </section>`;

    const root=$("mailOverlayRoot");
    root.innerHTML=`<div class="mail-window-backdrop" data-mail-close="1"></div>
      <section class="mail-compose-window group-mail-compose" role="dialog" aria-label="Nouveau message">
        <header class="mail-window-header">
          <div class="mail-window-title"><span>✉️</span><div><small>LSPD INTERNAL MAIL</small><h2>${mode==="reply"?"Répondre":mode==="forward"?"Transférer":"Nouveau message"}</h2></div></div>
          <div class="mail-compose-header-actions"><button class="mail-send-header" id="sendMailHeaderBtn" type="button">➤ Envoyer</button><button class="mail-window-close" id="closeMailWindowBtn" type="button">✕</button></div>
        </header>
        <form id="messageForm" class="mail-compose-form group-mail-form">
          <input id="mMode" type="hidden" value="${esc(mode)}">
          <input id="mSourceId" type="hidden" value="${esc(source?.id||"")}">
          <input id="mThreadId" type="hidden" value="${esc(source?.threadId||source?.id||"")}">
          ${recipientBlock}
          <label class="mail-compose-line"><span>Sujet</span><input id="mSubject" value="${esc(subject)}" required></label>
          <textarea id="mBody" class="mail-compose-body" placeholder="Écrire votre message..." required>${esc(quote)}</textarea>
          <div id="mError" class="error mail-compose-error"></div>
          <footer class="mail-compose-footer">
            <button class="btn" id="sendMailBtn" type="submit">Envoyer</button>
            <button class="btn secondary" id="cancelMailCompose" type="button">Annuler</button>
          </footer>
        </form>
      </section>`;

    document.body.classList.add("mail-window-open");
    $("messageForm").onsubmit=saveMessage;
    $("sendMailHeaderBtn")?.addEventListener("click",()=>$("messageForm")?.requestSubmit());
    $("closeMailWindowBtn").onclick=closeMailWindow;
    $("cancelMailCompose").onclick=closeMailWindow;
    root.querySelector(".mail-window-backdrop").onclick=closeMailWindow;

    if(!isReply){
      renderMailPeopleFilter();
      $("mailPeopleSearch").oninput=renderMailPeopleFilter;
      document.querySelectorAll(".mail-grade-check,.mail-cert-check").forEach(cb=>cb.onchange=updateMailAudiencePreview);
      $("clearMailAudienceBtn").onclick=clearMailAudience;
      updateMailAudiencePreview();
    }

    setTimeout(()=>$("mBody")?.focus(),40);
  }catch(err){
    showToast("Erreur : "+(err.code||err.message),"error");
  }
}
function openMessageForm(){
  return openMailComposer("new",null);
}

async function saveMessage(e){
  e.preventDefault();
  if(!hasPerm("messages_access"))return;

  const mode=$("mMode")?.value||"new";
  const sourceId=$("mSourceId")?.value||"";
  const inheritedThread=$("mThreadId")?.value||"";

  let recipients=[];
  if(mode==="reply"){
    const uid=$("mFixedRecipientId")?.value||"";
    const name=$("mFixedRecipientName")?.value||"";
    if(uid)recipients=[{uid,name}];
  }else{
    recipients=getSelectedMailRecipients();
  }

  if(!recipients.length){
    $("mError").textContent="Aucun destinataire sélectionné.";
    return;
  }

  const subject=$("mSubject").value.trim();
  const body=$("mBody").value.trim();
  if(!subject||!body){
    $("mError").textContent="Le sujet et le message sont obligatoires.";
    return;
  }

  const sendBtn=$("sendMailBtn");
  if(sendBtn){
    sendBtn.disabled=true;
    sendBtn.textContent=recipients.length>1?`Envoi à ${recipients.length} destinataires...`:"Envoi...";
  }
  $("mError").textContent="";

  try{
    const broadcastId=recipients.length>1?doc(collection(db,"messages")).id:"";
    let sent=0;
    const failures=[];

    for(const recipient of recipients){
      try{
        const ref=doc(collection(db,"messages"));
        const payload={
          senderId:window.LSPD.user.uid,
          senderName:window.LSPD.profile.name,
          recipientId:recipient.uid,
          recipientName:recipient.name,
          subject,
          body,
          read:false,
          // Reply keeps the existing one-to-one thread.
          // New/forward messages get an independent thread for each recipient,
          // so a group email never leaks other recipients' conversations.
          threadId:mode==="reply"?(inheritedThread||ref.id):ref.id,
          messageType:mode==="reply"?"Reply":mode==="forward"?"Forward":"Message",
          createdAt:serverTimestamp()
        };

        if(mode==="reply"&&sourceId)payload.replyToId=sourceId;
        if(mode==="forward"&&sourceId)payload.forwardedFromId=sourceId;
        if(broadcastId){
          payload.broadcastId=broadcastId;
          payload.broadcastSize=recipients.length;
        }

        await setDoc(ref,payload);
        await createNotification(
          recipient.uid,
          `Nouveau message : ${subject}`,
          `Message de ${window.LSPD.profile.name}`,
          "Message",
          "messages",
          ref.id
        );
        sent++;
      }catch(err){
        failures.push({recipient,error:err});
      }
    }

    if(!sent){
      const first=failures[0]?.error;
      throw first||new Error("Aucun message n'a pu être envoyé.");
    }

    closeMailWindow();
    showToast(
      recipients.length===1
        ? "Message envoyé."
        : `${sent} messages envoyés${failures.length?` • ${failures.length} échec(s)`:""}.`,
      failures.length?"warning":"success"
    );

    if(window.LSPD.currentPage==="messages")await messages();
  }catch(err){
    $("mError").textContent="Erreur : "+(err.code||err.message);
    if(sendBtn){
      sendBtn.disabled=false;
      sendBtn.textContent="Envoyer";
    }
  }
}
async function incidents(){
  if(!(hasPerm("incident_create")||hasPerm("incident_view_all")||hasPerm("incident_review")||hasPerm("incident_export")))return;
  try{
    const seeAll=hasPerm("incident_view_all")||hasPerm("incident_review")||hasPerm("incident_export");const snap=seeAll?await getDocs(collection(db,"incident_reports")):await getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid)));const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar">${hasPerm("incident_create")?'<button class="btn" id="newIncidentBtn">+ Nouveau rapport</button>':""}${hasPerm("incident_export")?'<button class="btn secondary" id="exportIncidentsBtn">Exporter CSV</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Auteur</th><th>Type</th><th>Titre</th><th>Pièces</th><th>Statut</th><th>Validation</th><th></th></tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.authorName)}</td><td>${esc(r.type)}</td><td>${esc(r.title)}</td><td>${(r.attachments||[]).length}</td><td><span class="tag ${r.status==="Approuvé"?"green":r.status==="Refusé"?"red":"orange"}">${esc(r.status)}</span></td><td>${esc(r.approvedByName||"—")}</td><td><button class="icon-btn incident-eye" data-id="${r.id}" title="Voir le rapport">👁</button></td></tr>`).join(""):'<tr><td colspan="8">Aucun rapport.</td></tr>'}</tbody></table></div>`;
    $("newIncidentBtn")?.addEventListener("click",openIncidentForm);$("exportIncidentsBtn")?.addEventListener("click",()=>csvDownload("incidents_lspd.csv",data.map(r=>({date:formatDate(r.createdAt),auteur:r.authorName,type:r.type,titre:r.title,statut:r.status,validation:r.approvedByName||""}))));document.querySelectorAll(".incident-eye").forEach(b=>b.onclick=()=>openIncidentViewer(b.dataset.id));
  }catch(err){$("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;}
}
async function openIncidentViewer(id){
  try{const snap=await getDoc(doc(db,"incident_reports",id));if(!snap.exists())return showToast("Rapport introuvable.","error");const r={id:snap.id,...snap.data()};showViewerModal(`<article class="incident-document"><div class="incident-document-head"><div><span class="eyebrow">LSPD INCIDENT REPORT</span><h2>${esc(r.title||"Rapport")}</h2><p>${esc(r.type||"—")} • ${formatDate(r.createdAt)}</p></div><span class="tag ${r.status==="Approuvé"?"green":r.status==="Refusé"?"red":"orange"}">${esc(r.status||"—")}</span></div><div class="detail-grid"><div><span>Auteur</span><b>${esc(r.authorName||"—")}</b></div><div><span>Validation</span><b>${esc(r.approvedByName||"En attente")}</b></div></div><section><h3>Résumé</h3><p class="incident-document-text">${esc(r.summary||"—")}</p></section><section><h3>Détails du rapport</h3><p class="incident-document-text preline">${esc(r.details||"—")}</p></section>${(r.attachments||[]).length?`<section><h3>Pièces jointes</h3><div class="attachment-list">${r.attachments.map(a=>`<a class="attachment-link" href="${esc(a.url)}" target="_blank" rel="noopener">📎 ${esc(a.name)}</a>`).join("")}</div></section>`:""}</article>`);}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}
function showViewerModal(html){document.querySelector(".viewer-modal")?.remove();document.body.insertAdjacentHTML("beforeend",`<div class="viewer-modal" role="dialog" aria-modal="true"><div class="viewer-modalbox"><button class="viewer-close" type="button" title="Fermer" aria-label="Fermer">×</button>${html}</div></div>`);const modal=document.querySelector(".viewer-modal");modal.querySelector(".viewer-close").onclick=()=>modal.remove();modal.addEventListener("click",e=>{if(e.target===modal)modal.remove();});}

function openIncidentForm(){
  if(!hasPerm("incident_create"))return;
  showModal(`<h2>Nouveau rapport d'incident</h2><form id="incidentForm"><div class="formgrid"><label class="field"><span>Type</span><select id="iType">${incidentTypes.map(x=>`<option>${x}</option>`).join("")}</select></label><label class="field"><span>Titre</span><input id="iTitle" required></label></div><label class="field full"><span>Résumé</span><textarea id="iSummary" rows="4" required></textarea></label><label class="field full"><span>Détails</span><textarea id="iDetails" rows="8" required></textarea></label><label class="field full"><span>Pièces jointes (optionnel : images/PDF, max 10 Mo par fichier)</span><input id="iAttachments" type="file" multiple accept="image/*,.pdf,application/pdf"></label><div id="iError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Soumettre pour validation</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("incidentForm").onsubmit=saveIncident;
}
async function saveIncident(e){
  e.preventDefault();
  if(!hasPerm("incident_create"))return;
  try{
    const files=$("iAttachments")?.files||[];
    let attachments=[];
    if(files.length){
      try{ attachments=await uploadIncidentAttachments(files); }
      catch(uploadErr){
        $("iError").textContent="Pièce jointe non envoyée. Vérifie Firebase Storage et storage.rules : "+(uploadErr.code||uploadErr.message);
        return;
      }
    }
    const ref=await addDoc(collection(db,"incident_reports"),{authorId:window.LSPD.user.uid,authorName:window.LSPD.profile.name,type:$("iType").value,title:$("iTitle").value.trim(),summary:$("iSummary").value.trim(),details:$("iDetails").value.trim(),attachments,status:"En attente",createdAt:serverTimestamp()});
    await addAudit("INCIDENT_SUBMIT",ref.id,$("iTitle").value.trim());
    document.querySelector(".modal")?.remove(); incidents();
  }catch(err){ $("iError").textContent="Erreur : "+(err.code||err.message); }
}

async function approvals(){
  if(!hasPerm("incident_review")) return;
  try{
    const snap=await getDocs(collection(db,"incident_reports"));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).filter(r=>r.status==="En attente").sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="grid2">${data.length?data.map(r=>`<div class="card"><span class="number">${esc(r.type)}</span><div class="report-card-title"><h3>${esc(r.title)}</h3><button class="icon-btn incident-eye" data-id="${r.id}" title="Voir le rapport">👁</button></div><p>${esc(r.summary)}</p><p class="muted">Par ${esc(r.authorName)} • ${formatDate(r.createdAt)}</p><div class="approval-box"><p>${esc(r.details)}</p>${(r.attachments||[]).length?`<div class="attachment-list">${r.attachments.map(a=>`<a class="attachment-link" href="${esc(a.url)}" target="_blank" rel="noopener">📎 ${esc(a.name)}</a>`).join("")}</div>`:""}</div><div class="modal-actions incident-approval-actions"><button class="btn approve-incident" data-id="${r.id}" data-status="Approuvé">✓ Approuver le rapport</button><button class="btn secondary approve-incident" data-id="${r.id}" data-status="Refusé">✕ Refuser le rapport</button></div></div>`).join(""):'<div class="card">Aucune validation en attente.</div>'}</div>`;
    document.querySelectorAll(".approve-incident").forEach(b=>b.onclick=()=>reviewIncident(b.dataset.id,b.dataset.status));document.querySelectorAll(".incident-eye").forEach(b=>b.onclick=()=>openIncidentViewer(b.dataset.id));
  }catch(err){ $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`; }
}
async function reviewIncident(id,status){
  if(!hasPerm("incident_review"))return;
  try{
    const incidentSnap=await getDoc(doc(db,"incident_reports",id));
    const incident=incidentSnap.exists()?incidentSnap.data():null;
    await updateDoc(doc(db,"incident_reports",id),{status,approvedById:window.LSPD.user.uid,approvedByName:window.LSPD.profile.name,approvedAt:serverTimestamp(),signature:`${window.LSPD.profile.name} / ${window.LSPD.profile.badge}`});
    await addAudit("INCIDENT_"+(status==="Approuvé"?"APPROVED":"REJECTED"),id,status);
    if(incident?.authorId){
      await createNotification(incident.authorId,`Rapport ${status}`,`${incident.title||"Rapport"} a été ${status.toLowerCase()} par ${window.LSPD.profile.name}.`,"Validation","incidents");
    }
    approvals();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}


async function corrections(){
  if(!(hasPerm("corrections_create")||hasPerm("corrections_review")))return;
  try{
    const snap=hasPerm("corrections_review")
      ? await getDocs(collection(db,"correction_requests"))
      : await getDocs(query(collection(db,"correction_requests"),where("requestedById","==",window.LSPD.user.uid)));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar">${hasPerm("corrections_create")?'<button class="btn" id="newCorrectionBtn">+ Demander une correction</button>':""}</div>
    <div class="card"><p class="muted">Les documents d'origine restent intacts. Une correction approuvée crée un <b>addendum</b> traçable.</p></div>
    <div class="card table-card" style="margin-top:14px"><table class="table"><thead><tr><th>Date</th><th>Demandeur</th><th>Cible</th><th>Motif</th><th>Statut</th><th>Révision</th>${hasPerm("corrections_review")?"<th></th>":""}</tr></thead><tbody>
    ${data.length?data.map(c=>`<tr><td>${formatDate(c.createdAt)}</td><td>${esc(c.requestedByName)}</td><td>${esc(c.targetType)} — ${esc(c.targetLabel)}</td><td>${esc(c.reason)}</td><td><span class="tag ${c.status==="Approuvé"?"green":c.status==="Refusé"?"red":"orange"}">${esc(c.status)}</span></td><td>${esc(c.reviewedByName||"—")}</td>${hasPerm("corrections_review")?`<td>${c.status==="En attente"?`<button class="btn secondary correction-review" data-id="${c.id}" data-status="Approuvé">Approuver</button> <button class="btn secondary correction-review" data-id="${c.id}" data-status="Refusé">Refuser</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="7">Aucune demande.</td></tr>'}
    </tbody></table></div>`;
    $("newCorrectionBtn")?.addEventListener("click",openCorrectionForm);
    document.querySelectorAll(".correction-review").forEach(b=>b.onclick=()=>reviewCorrection(b.dataset.id,b.dataset.status));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function openCorrectionForm(){
  try{
    const incidentSnap=(hasPerm("incident_view_all")||hasPerm("incident_review")||hasPerm("incident_export"))
      ? await getDocs(collection(db,"incident_reports"))
      : hasPerm("incident_create")
        ? await getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid)))
        : {docs:[]};
    let evalDocs=[];
    if(hasPerm("personnel_view")||hasPerm("academy_manage")){
      const s=await getDocs(collection(db,"evaluations")); evalDocs=s.docs;
    }else if(hasPerm("fto_tools")){
      const s=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid))); evalDocs=s.docs;
    }

    const targets=[
      ...incidentSnap.docs.map(d=>({value:`Incident:${d.id}`,label:`Incident — ${d.data().title||d.id}`})),
      ...evalDocs.map(d=>({value:`Évaluation:${d.id}`,label:`Évaluation — ${d.data().officerName||""} ${d.data().moduleCode||""}`}))
    ];

    showModal(`<h2>Demande de correction / addendum</h2><form id="correctionForm">
      <label class="field"><span>Document concerné</span><select id="crTarget">${targets.map(t=>`<option value="${esc(t.value)}">${esc(t.label)}</option>`).join("")}</select></label>
      <label class="field full"><span>Motif</span><textarea id="crReason" rows="3" required placeholder="Pourquoi une correction est nécessaire ?"></textarea></label>
      <label class="field full"><span>Texte proposé pour l'addendum</span><textarea id="crText" rows="7" required placeholder="Correction précise, sans effacer l'original..."></textarea></label>
      <div id="crError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Envoyer la demande</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div>
    </form>`);
    if(!targets.length){
      $("crError").textContent="Aucun document disponible pour une demande de correction.";
      $("correctionForm").querySelector('button[type="submit"]').disabled=true;
    }
    $("correctionForm").onsubmit=saveCorrection;
  }catch(err){
    alert("Erreur : "+(err.code||err.message));
  }
}

async function saveCorrection(e){
  e.preventDefault();
  if(!hasPerm("corrections_create"))return;
  const raw=$("crTarget").value;
  const [targetType,targetId]=raw.split(":");
  const label=$("crTarget").selectedOptions[0].textContent.trim();
  try{
    await addDoc(collection(db,"correction_requests"),{
      targetType,targetId,targetLabel:label,
      reason:$("crReason").value.trim(),
      proposedText:$("crText").value.trim(),
      requestedById:window.LSPD.user.uid,
      requestedByName:window.LSPD.profile.name,
      status:"En attente",
      createdAt:serverTimestamp()
    });
    await addAudit("CORRECTION_REQUEST",targetId,label);
    document.querySelector(".modal")?.remove(); corrections();
  }catch(err){ $("crError").textContent="Erreur : "+(err.code||err.message); }
}

async function reviewCorrection(id,status){
  if(!hasPerm("corrections_review")) return;
  try{
    const s=await getDoc(doc(db,"correction_requests",id));
    if(!s.exists()) return;
    const c=s.data();
    await updateDoc(doc(db,"correction_requests",id),{
      status,
      reviewedById:window.LSPD.user.uid,
      reviewedByName:window.LSPD.profile.name,
      reviewedAt:serverTimestamp()
    });
    if(status==="Approuvé"){
      await addDoc(collection(db,"amendments"),{
        targetType:c.targetType,targetId:c.targetId,targetLabel:c.targetLabel,
        text:c.proposedText,
        sourceCorrectionId:id,
        requestedById:c.requestedById,
        requestedByName:c.requestedByName,
        approvedById:window.LSPD.user.uid,
        approvedByName:window.LSPD.profile.name,
        createdAt:serverTimestamp()
      });
    }
    await addAudit("CORRECTION_"+(status==="Approuvé"?"APPROVED":"REJECTED"),c.targetId,c.targetLabel);
    await createNotification(c.requestedById,`Correction ${status}`,`${c.targetLabel} : ta demande a été ${status.toLowerCase()} par ${window.LSPD.profile.name}.`,"Validation","corrections");
    corrections();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

function manual(){
  $("content").innerHTML=`<div class="card"><h2>Manuel FTO LSPD</h2><p class="muted">Briefing → démonstration → pratique → observation → feedback → validation → traçabilité.</p></div>
  <div class="grid2" style="margin-top:16px">${["Sécurité avant performance","Expliquer le pourquoi","Erreur critique = correction immédiate","Feedback factuel","Validation traçable","Même standard pour tous"].map(x=>`<div class="card"><b>${x}</b></div>`).join("")}</div>`;
}

async function modulesPage(){
  await loadAcademyOverrides();
  let evals=[];
  try{
    const es=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
    evals=es.docs.map(d=>d.data());
  }catch{}
  const stats=trainingProgressStats(evals,[]);
  $("content").innerHTML=`<div class="training-path-hero card">
    <div><span class="eyebrow">MES FORMATIONS</span><h2>Validations M01–M16</h2><p class="muted">Chaque formation est indépendante. Il n'est pas nécessaire d'avoir 16/16 pour être considéré « OK ».</p></div>
    <div class="training-path-total"><b>${stats.validated}</b><span>validée(s)</span></div>
  </div>
  <div class="training-path-legend"><span class="validated">● Formation validée</span><span class="ready">● Non évaluée</span><span class="review">● À refaire</span></div>
  <div class="training-path-cards">${modules.map((m,i)=>{
    const state=trainingModuleState(m[0],stats.latest,[]),e=stats.latest[m[0]];
    return `<button class="training-path-card ${state.key}" data-module="${m[0]}" type="button">
      <div class="training-path-index">${i+1}</div>
      <div class="training-path-content"><div><span class="module-code">${m[0]}</span><span class="tag">${esc(m[3])}</span></div><h3>${esc(m[1])}</h3><p>${esc(m[2])}</p><small>${e?`Dernier résultat : ${e.score}/100 • ${esc(e.result)}`:"Pas encore évaluée"}</small></div>
      <div class="training-path-state"><span>${state.key==="validated"?"✓":state.key==="retry"?"↻":"→"}</span><b>${esc(state.label)}</b></div>
    </button>`;
  }).join("")}</div>`;
  document.querySelectorAll(".training-path-card").forEach(c=>c.onclick=()=>openTrainingModuleContext(c.dataset.module,window.LSPD.user.uid));
}
function openModule(id){
  return openTrainingModuleContext(id,window.LSPD.user.uid);
}

async function evaluations(){
  let snap;
  if(hasPerm("personnel_view")) snap=await getDocs(collection(db,"evaluations"));
  else if(hasPerm("fto_tools")) snap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
  else snap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));

  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">
    ${hasPerm("fto_evaluations_create")?'<button class="btn" id="newEvalBtn">+ Nouvelle évaluation</button>':""}
    <button class="btn secondary" id="exportEvalBtn">Exporter CSV</button>
  </div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>FTO</th><th>Module</th><th>Score</th><th>Résultat</th><th></th></tr></thead><tbody>
  ${data.length?data.map(e=>`<tr><td>${formatDate(e.createdAt)}</td><td>${esc(e.officerName)}</td><td>${esc(e.ftoName)}</td><td>${esc(e.moduleCode)} — ${esc(e.moduleTitle)}</td><td>${esc(e.score)}/100</td><td><span class="tag ${e.result==="Validé"?"green":e.result==="Échec"?"red":"orange"}">${esc(e.result)}</span></td><td><button class="btn secondary print-eval" data-id="${e.id}">Voir / Imprimer</button></td></tr>`).join(""):'<tr><td colspan="7">Aucune évaluation.</td></tr>'}
  </tbody></table></div>`;
  $("newEvalBtn")?.addEventListener("click",openEvaluationForm);
  $("exportEvalBtn").onclick=()=>csvDownload("evaluations_lspd.csv",data.map(e=>({
    date:formatDate(e.createdAt),officier:e.officerName,fto:e.ftoName,module:e.moduleCode,score:e.score,resultat:e.result,commentaire:e.comments||""
  })));
  document.querySelectorAll(".print-eval").forEach(b=>b.onclick=()=>openEvaluationDetail(data.find(x=>x.id===b.dataset.id)));
}

async function openEvaluationForm(prefillOfficerId=null,prefillModuleCode=null,prefillTrainingEventId=null){
  if(!hasPerm("fto_evaluations_create"))return;
  const officers=(await getUsers()).filter(o=>!["Visiteur","Applicant"].includes(o.role) && !["Inactif","Archivé"].includes(o.status));
  showModal(`<h2>Évaluer la formation</h2><form id="evalForm"><input id="eTrainingEventId" type="hidden" value="${esc(prefillTrainingEventId||"")}"><div class="formgrid">
  <label class="field"><span>Officier évalué</span><select id="eOfficer">${officers.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}" ${o.uid===prefillOfficerId?"selected":""}>${esc(o.badge)} — ${esc(o.name)} — ${esc(o.grade)}</option>`).join("")}</select></label>
  <label class="field"><span>Module</span><select id="eModule">${modules.map(m=>`<option value="${m[0]}" ${m[0]===prefillModuleCode?"selected":""}>${m[0]} — ${m[1]}</option>`).join("")}</select></label></div>
  <h3>Critères</h3><div class="criteria-grid">${criteria.map(c=>`<label class="criterion"><span><b>${c[1]}</b><small>${c[2]}</small></span><select class="criterion-score" data-key="${c[0]}"><option value="5">5 — Excellent</option><option value="4">4 — Très bien</option><option value="3" selected>3 — Conforme</option><option value="2">2 — À améliorer</option><option value="1">1 — Insuffisant</option></select></label>`).join("")}</div>
  <label class="field full"><span>Commentaires FTO</span><textarea id="eComments" rows="5"></textarea></label>
  <div class="score-preview">Score : <b id="scorePreview">60/100</b> — <span id="resultPreview">À revoir</span></div>
  <div id="evalError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  document.querySelectorAll(".criterion-score").forEach(s=>s.onchange=updateEvalPreview);
  updateEvalPreview(); $("evalForm").onsubmit=saveEvaluation;
}
function updateEvalPreview(){
  const vals=[...document.querySelectorAll(".criterion-score")].map(s=>Number(s.value));
  const score=Math.round(vals.reduce((a,b)=>a+b,0)/(vals.length*5)*100);
  $("scorePreview").textContent=`${score}/100`; $("resultPreview").textContent=score>=75?"Validé":score>=55?"À revoir":"Échec";
}
async function saveEvaluation(e){
  e.preventDefault();
  if(!hasPerm("fto_evaluations_create"))return;
  const s=$("eOfficer"),officerId=s.value,officerName=s.selectedOptions[0].dataset.name,moduleCode=$("eModule").value,module=modules.find(m=>m[0]===moduleCode);
  const values={};document.querySelectorAll(".criterion-score").forEach(x=>values[x.dataset.key]=Number(x.value));
  const vals=Object.values(values),score=Math.round(vals.reduce((a,b)=>a+b,0)/(vals.length*5)*100),result=score>=75?"Validé":score>=55?"À revoir":"Échec";
  try{
    const trainingEventId=$("eTrainingEventId")?.value||"";
    const payload={officerId,officerName,ftoId:window.LSPD.user.uid,ftoName:window.LSPD.profile.name,moduleCode,moduleTitle:module[1],criteria:values,score,result,comments:$("eComments").value.trim(),createdAt:serverTimestamp()};
    if(trainingEventId)payload.trainingEventId=trainingEventId;
    await addDoc(collection(db,"evaluations"),payload);
    if(trainingEventId){
      const regs=await getDocs(query(collection(db,"training_registrations"),where("eventId","==",trainingEventId)));
      const reg=regs.docs.find(d=>d.data().officerId===officerId);
      if(reg){
        await updateDoc(doc(db,"training_registrations",reg.id),{
          attendanceStatus:`Évalué — ${result}`,
          attendanceMarkedById:window.LSPD.user.uid,
          attendanceMarkedByName:window.LSPD.profile.name,
          attendanceMarkedAt:serverTimestamp()
        });
      }
    }
    await addAudit("CREATE_EVALUATION",officerId,`${moduleCode} — ${result} — ${score}/100`);
    document.querySelector(".modal")?.remove();
    if(trainingEventId)openTrainingEventManager(trainingEventId);else evaluations();
  }catch(err){$("evalError").textContent="Erreur : "+(err.code||err.message);}
}
function openEvaluationDetail(e){
  const c=e.criteria||{};
  showModal(`<div class="print-sheet"><div class="print-header"><div class="badge small">LSPD</div><div><h2>Fiche d'évaluation FTO</h2><p>Los Santos Police Department</p></div></div>
  <div class="detail-grid"><div><span>Officier</span><b>${esc(e.officerName)}</b></div><div><span>FTO</span><b>${esc(e.ftoName)}</b></div><div><span>Module</span><b>${esc(e.moduleCode)} — ${esc(e.moduleTitle)}</b></div><div><span>Date</span><b>${formatDate(e.createdAt)}</b></div><div><span>Score</span><b>${esc(e.score)}/100</b></div><div><span>Résultat</span><b>${esc(e.result)}</b></div></div>
  <table class="table compact"><tbody>${criteria.map(x=>`<tr><td>${x[1]}</td><td>${esc(c[x[0]]||"—")}/5</td></tr>`).join("")}</tbody></table><h3>Commentaires</h3><div class="comment-box">${esc(e.comments||"Aucun commentaire.")}</div></div>
  <div class="modal-actions no-print"><button class="btn" id="printEvalBtn">Imprimer / PDF</button><button class="btn secondary" id="closeModal">Fermer</button></div>`);
  $("printEvalBtn").onclick=()=>window.print();
}

async function trainees(){
  if(!hasPerm("fto_tools"))return;await loadAcademyOverrides();
  const [a,es,ss,os]=await Promise.all([getDocs(query(collection(db,"fto_assignments"),where("ftoId","==",window.LSPD.user.uid))),getDocs(collection(db,"evaluations")),getDocs(collection(db,"fto_sessions")),getDocs(collection(db,"training_objectives"))]);
  const users=await getUsers(),me=users.find(u=>u.uid===window.LSPD.user.uid)||{uid:window.LSPD.user.uid,grade:currentGrade(),role:role(),status:window.LSPD.profile.status};
  const allAssignments=a.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.status==="Active");
  const assignments=allAssignments.filter(x=>{const trainee=users.find(u=>u.uid===x.traineeId);return validTraineeForFto(trainee,me);});
  const evals=es.docs.map(d=>d.data()),sessions=ss.docs.map(d=>d.data()),objectives=os.docs.map(d=>d.data());
  const cards=()=>assignments.map(x=>{const o=users.find(u=>u.uid===x.traineeId);if(!o)return null;const te=evals.filter(e=>e.officerId===o.uid),ts=sessions.filter(s=>s.traineeId===o.uid),to=objectives.filter(v=>v.traineeId===o.uid&&v.status==="Ouvert"),stats=trainingProgressStats(te,ts),next=modules.find(m=>m[0]===stats.next);return {o,html:`<div class="card training-trainee-card" data-trainee-search="${esc((o.name+' '+o.badge+' '+o.grade).toLowerCase())}"><div class="training-trainee-head"><div><span class="number">${esc(o.badge)}</span><h3>${esc(o.name)}</h3><p>${esc(o.grade)} • ${esc(o.status)}</p></div><span class="training-progress-ring">${stats.validated}<small>/16</small></span></div><div class="training-mini-progress"><i style="width:${Math.round(stats.validated/16*100)}%"></i></div><div class="row"><span>Moyenne</span><b>${stats.avg}/100</b></div><div class="row"><span>Module recommandé</span><b>${esc(stats.next)} — ${esc(next?.[1]||"")}</b></div><div class="row"><span>Objectifs ouverts</span><b>${to.length}</b></div><div class="training-card-actions"><button class="btn trainee-workspace" data-id="${o.uid}">Ouvrir l'espace recrue</button>${hasPerm("fto_sessions_manage")?`<button class="btn secondary trainee-session" data-id="${o.uid}" data-module="${stats.next}">Session ${stats.next}</button>`:""}</div></div>`};}).filter(Boolean);
  const data=cards();
  $("content").innerHTML=`<div class="training-center-section-head"><div><span class="eyebrow">MES RECRUES</span><h2>Suivi FTO</h2><p class="muted">Seules les affectations actives valides apparaissent ici. Un officier de grade supérieur à son FTO n'est jamais affiché comme recrue.</p></div>${hasPerm("fto_sessions_manage")?`<button class="btn" id="traineeNewSessionBtn">+ Démarrer une session</button>`:""}</div><div class="toolbar trainee-search-toolbar"><input id="traineeSearch" class="search" placeholder="Rechercher une recrue par nom, matricule ou grade..."><span id="traineeSearchCount" class="muted">${data.length} recrue(s)</span></div><div class="training-trainee-grid" id="traineeGrid">${data.length?data.map(x=>x.html).join(""):'<div class="card"><p class="muted">Aucune recrue assignée. Un Lieutenant ou plus doit créer une affectation FTO.</p></div>'}</div>`;
  const bind=()=>{document.querySelectorAll(".trainee-workspace").forEach(b=>b.onclick=()=>openTrainingWorkspace(b.dataset.id));document.querySelectorAll(".trainee-session").forEach(b=>b.onclick=()=>openAcademySessionForm(b.dataset.id,b.dataset.module));};bind();
  $("traineeSearch").oninput=e=>{const q=e.target.value.trim().toLowerCase();let shown=0;document.querySelectorAll(".training-trainee-card").forEach(card=>{const ok=!q||card.dataset.traineeSearch.includes(q);card.classList.toggle("hidden",!ok);if(ok)shown++;});$("traineeSearchCount").textContent=`${shown} recrue(s)`;};
  $("traineeNewSessionBtn")?.addEventListener("click",()=>openAcademySessionForm());
}
function canEditOfficerProfile(){return hasPerm("personnel_manage")||hasPerm("personnel_grade_manage")||hasPerm("personnel_status_manage");}
function canCreateOfficer(){return hasPerm("personnel_create");}
function canDeleteOfficer(){return hasPerm("personnel_delete");}
function isLieutenantPlusGrade(grade=currentGrade()){return ["Lieutenant","Commander","Captain","Deputy Chief of Police","Assistant Chief","Chief of Police","Commissioner"].includes(canonicalGrade(grade));}
function canManageFtoAssignments(){return isChief() || (isLieutenantPlusGrade() && hasPerm("fto_assignments_manage"));}
function isFtoCandidateUser(u){return !!u && !["Visiteur","Applicant"].includes(u.role) && !["Inactif","Archivé","Suspendu"].includes(u.status) && (u.role==="FTO" || gradeIndex(u.grade)>=gradeIndex("Sergeant1"));}
function validTraineeForFto(trainee,fto){return !!trainee&&!!fto&&trainee.uid!==fto.uid&&!["Visiteur","Applicant"].includes(trainee.role)&&!["Inactif","Archivé","Suspendu"].includes(trainee.status)&&gradeIndex(trainee.grade)<=gradeIndex(fto.grade);}

async function officers(){
  if(!canAccessOfficerDirectory())return;
  const data=(await getUsers()).sort((a,b)=>(a.badge||"").localeCompare(b.badge||"",undefined,{numeric:true}));
  const unique=key=>[...new Set(data.map(o=>String(o?.[key]||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr",{numeric:true}));
  const gradeOptions=unique("grade"),roleOptions=unique("role"),divisionOptions=unique("division"),statusOptions=unique("status");
  $("content").innerHTML=`<div class="toolbar officer-filter-toolbar">
    <input id="officerSearch" class="search officer-filter-search" placeholder="Rechercher nom, matricule, e-mail...">
    <select id="officerGradeFilter" class="search"><option value="">Tous grades</option>${gradeOptions.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("")}</select>
    <select id="officerRoleFilter" class="search"><option value="">Tous rôles</option>${roleOptions.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("")}</select>
    <select id="officerDivisionFilter" class="search"><option value="">Toutes unités</option>${divisionOptions.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("")}</select>
    <select id="officerStatusFilter" class="search"><option value="">Tous statuts</option>${statusOptions.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("")}</select>
    <button class="btn secondary" id="officerResetFilters">Réinitialiser</button><button class="btn secondary" id="exportOfficersBtn">Exporter CSV</button>
    ${canCreateOfficer()?'<button class="btn" id="addOfficerBtn">+ Ajouter un officier</button>':""}
  </div>
  ${hasPerm("provisional_credentials_view")?`<div class="card credential-access-note"><b>Accès aux codes provisoires</b><span>Le code est visible uniquement tant que le compte est À activer.</span></div>`:""}
  ${canCreateOfficer()?`<div class="card chief-provision-note"><b>Création simplifiée</b><span>Nom RP + adresse e-mail. Firebase crée automatiquement l'UID et un mot de passe provisoire.</span></div>`:""}
  <div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Unité</th><th>Statut</th><th>E-mail</th><th>Compte</th><th></th>${canEditOfficerProfile()?"<th></th>":""}${canDeleteOfficer()?"<th></th>":""}</tr></thead><tbody id="officerRows">${officerRows(data)}</tbody></table></div>`;
  function refresh(){
    const term=$("officerSearch").value.trim().toLowerCase(),grade=$("officerGradeFilter").value,roleFilter=$("officerRoleFilter").value,div=$("officerDivisionFilter").value,st=$("officerStatusFilter").value;
    const filtered=data.filter(o=>[o.badge,o.name,o.grade,o.role,o.status,o.division,o.registeredEmail].some(v=>String(v||"").toLowerCase().includes(term))&&(!grade||o.grade===grade)&&(!roleFilter||o.role===roleFilter)&&(!div||o.division===div)&&(!st||o.status===st));
    $("officerRows").innerHTML=officerRows(filtered);bindOfficerButtons(data);
  }
  ["officerGradeFilter","officerRoleFilter","officerDivisionFilter","officerStatusFilter"].forEach(id=>$(id).onchange=refresh);$("officerSearch").oninput=refresh;
  $("officerResetFilters").onclick=()=>{$("officerSearch").value="";["officerGradeFilter","officerRoleFilter","officerDivisionFilter","officerStatusFilter"].forEach(id=>$(id).value="");refresh();};
  $("exportOfficersBtn").onclick=()=>csvDownload("officiers_lspd.csv",data.map(o=>({matricule:o.badge,nom:o.name,grade:o.grade,role:o.role,unite:o.division||"",statut:o.status,email:o.registeredEmail||"",compte:o.importedAccount?(o.mustChangePassword?"À activer":"Activé"):"Standard"})));
  $("addOfficerBtn")?.addEventListener("click",openOfficerProvisionForm);bindOfficerButtons(data);
}

function officerRows(data){
  const cols=9+(canEditOfficerProfile()?1:0)+(canDeleteOfficer()?1:0);
  return data.length?data.map(o=>{
    const activation=o.importedAccount?`<span class="tag ${o.mustChangePassword?"orange":"green"}">${o.mustChangePassword?"À activer":"Activé"}</span>`:'<span class="tag">Standard</span>';
    const codeButton=o.importedAccount&&o.mustChangePassword&&hasPerm("provisional_credentials_view")?`<button class="btn tiny secondary temporary-code-officer" data-uid="${o.uid}" data-name="${esc(o.name)}">Voir le code provisoire</button>`:"";
    return `<tr><td>${esc(o.badge)}</td><td><b>${esc(o.name)}</b></td><td>${esc(o.grade)}</td><td><span class="tag">${esc(o.role)}</span></td><td>${esc(o.division||"Patrol")}</td><td>${esc(o.status)}</td><td>${esc(o.registeredEmail||"—")}</td><td><div class="account-state-cell">${activation}${codeButton}</div></td><td><button class="btn secondary view-officer" data-uid="${o.uid}">Dossier</button></td>${canEditOfficerProfile()?`<td><button class="btn secondary edit-officer" data-uid="${o.uid}">Modifier</button></td>`:""}${canDeleteOfficer()?`<td>${o.uid!==window.LSPD.user.uid?`<button class="btn danger delete-officer" data-uid="${o.uid}" data-name="${esc(o.name)}">Supprimer</button>`:'<span class="muted">Compte actuel</span>'}</td>`:""}</tr>`;
  }).join(""):`<tr><td colspan="${cols}">Aucun officier.</td></tr>`;
}
function bindOfficerButtons(data){
  document.querySelectorAll(".view-officer").forEach(b=>b.onclick=()=>officerFile(b.dataset.uid));
  document.querySelectorAll(".edit-officer").forEach(b=>b.onclick=()=>openOfficerForm(data.find(o=>o.uid===b.dataset.uid)));
  document.querySelectorAll(".delete-officer").forEach(b=>b.onclick=()=>deleteOfficerProfile(b.dataset.uid,b.dataset.name));
  document.querySelectorAll(".temporary-code-officer").forEach(b=>b.onclick=()=>revealTemporaryOfficerPassword(b.dataset.uid,b.dataset.name));
}

async function revealTemporaryOfficerPassword(uid,name){
  if(!hasPerm("provisional_credentials_view"))return showToast("Permission refusée.","error");
  try{
    const officer=await getUser(uid);
    if(!officer?.importedAccount || officer?.mustChangePassword!==true)return showToast("Ce compte n'est plus en attente d'activation.","error");
    const snap=await getDoc(doc(db,"provisional_credentials",uid));
    if(!snap.exists()){
      showModal(`<h2>Code provisoire indisponible</h2><div class="security-note"><b>${esc(name||officer.name)}</b><span>Ce compte est bien à activer, mais son code n'est pas enregistré dans le coffre Firestore. C'est normal pour les comptes importés avant la Phase 17.11.1.</span></div><p class="muted">Pour les anciens comptes, lance une seule fois l'outil privé <b>SYNC_CODES_PROVISOIRES.bat</b> fourni avec cette phase. Il ne change aucun mot de passe Firebase et n'importe que les codes des comptes encore à activer.</p><div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
      return;
    }
    const cred=snap.data();
    await addAudit("VIEW_PROVISIONAL_CODE",uid,`${officer.name} — code provisoire consulté`).catch(()=>{});
    showModal(`<h2>Code provisoire — ${esc(officer.name)}</h2><div class="activation-success"><div class="detail-grid"><div><span>Adresse professionnelle</span><b>${esc(officer.registeredEmail||cred.email||"—")}</b></div><div><span>État</span><b>À activer</b></div></div><label class="field full"><span>Code provisoire</span><div class="temporary-secret-row"><input id="temporaryOfficerCredential" type="password" readonly value="${esc(cred.temporaryPassword||"")}"><button class="btn secondary" id="toggleTemporaryCredential" type="button">Afficher</button></div></label><p class="muted">Information sensible. Transmets-la uniquement à l'officier concerné. Le code devient inaccessible dès qu'il choisit son propre mot de passe.</p></div><div class="modal-actions"><button class="btn" id="copyTemporaryCredential">Copier les identifiants</button><button class="btn secondary" id="closeModal">Fermer</button></div>`);
    $("toggleTemporaryCredential").onclick=()=>{const input=$("temporaryOfficerCredential");const show=input.type==="password";input.type=show?"text":"password";$("toggleTemporaryCredential").textContent=show?"Masquer":"Afficher";};
    $("copyTemporaryCredential").onclick=async()=>{const text=`LSPD — Compte provisoire\nNom RP : ${officer.name}\nE-mail : ${officer.registeredEmail||cred.email||""}\nCode provisoire : ${cred.temporaryPassword||""}\n\nLe mot de passe doit être changé à la première connexion.`;try{await navigator.clipboard.writeText(text);showToast("Identifiants copiés.","success");}catch{showToast("Copie impossible.","error");}};
  }catch(err){showToast("Impossible de lire le code provisoire : "+(err.code||err.message),"error");}
}

async function officerFile(uid){
  const o=await getUser(uid);if(!o)return;
  const [ev,certs,recs]=await Promise.all([
    getDocs(query(collection(db,"evaluations"),where("officerId","==",uid))),
    getDocs(query(collection(db,"certifications"),where("officerId","==",uid))),
    getDocs(query(collection(db,"personnel_records"),where("officerId","==",uid)))
  ]);
  const evals=ev.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const certData=certs.docs.map(d=>d.data()),recordData=recs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const validated=[...new Set(evals.filter(e=>e.result==="Validé").map(e=>e.moduleCode))],pct=Math.round(validated.length/modules.length*100);
  showModal(`<h2>Dossier officier — ${esc(o.name)}</h2><div class="detail-grid"><div><span>Matricule</span><b>${esc(o.badge)}</b></div><div><span>Grade</span><b>${esc(o.grade)}</b></div><div><span>Rôle</span><b>${esc(o.role)}</b></div><div><span>Unité</span><b>${esc(o.division||"Patrol")}</b></div><div><span>Statut</span><b>${esc(o.status)}</b></div><div><span>Adresse professionnelle</span><b>${esc(o.registeredEmail||"—")}</b></div><div><span>Compte</span><b>${o.importedAccount?(o.mustChangePassword?"À activer":"Activé"):"Standard"}</b></div><div><span>Progression</span><b>${pct}%</b></div></div>
  <div class="progress"><i style="width:${pct}%"></i></div><h3>Certifications</h3><div class="chip-row">${certData.length?certData.map(c=>`<span class="chip">${esc(c.certification)}</span>`).join(""):'<span class="muted">Aucune certification.</span>'}</div>
  <h3>Distinctions / sanctions</h3><div class="record-list">${recordData.length?recordData.map(r=>`<div class="record ${r.type==="Sanction"?"negative":"positive"}"><b>${esc(r.type)} — ${esc(r.title)}</b><span>${formatDate(r.createdAt)} • ${esc(r.issuedByName)}</span><p>${esc(r.details||"")}</p></div>`).join(""):'<p class="muted">Aucune entrée.</p>'}</div>
  <h3>Dernières évaluations</h3><div class="table-card"><table class="table"><thead><tr><th>Date</th><th>Module</th><th>FTO</th><th>Score</th><th>Résultat</th></tr></thead><tbody>${evals.slice(0,10).map(e=>`<tr><td>${formatDate(e.createdAt)}</td><td>${esc(e.moduleCode)}</td><td>${esc(e.ftoName)}</td><td>${esc(e.score)}/100</td><td>${esc(e.result)}</td></tr>`).join("")||'<tr><td colspan="5">Aucune évaluation.</td></tr>'}</tbody></table></div><div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
}
function generateTemporaryOfficerPassword(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes=new Uint8Array(14);crypto.getRandomValues(bytes);
  return `LSPD!${[...bytes].map(b=>chars[b%chars.length]).join("")}9a`;
}
async function openOfficerProvisionForm(){
  if(!canCreateOfficer())return;
  showModal(`<h2>Ajouter un nouvel officier</h2><p class="muted">Entre uniquement son nom RP et son adresse e-mail. Le compte Firebase Authentication, l'UID et le mot de passe provisoire sont générés automatiquement.</p><form id="officerProvisionForm"><label class="field full"><span>Nom RP</span><input id="opName" required maxlength="60" placeholder="Ex. John Smith"></label><label class="field full"><span>Adresse e-mail</span><input id="opEmail" type="email" required autocomplete="off" placeholder="john.smith@catena.ma"></label><div class="invite-default-profile"><b>Profil initial automatique</b><span>Rookie • Officer • En formation • Patrol</span></div><div id="officerProvisionError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Créer le compte</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("officerProvisionForm").onsubmit=provisionOfficerAccount;
}
async function provisionOfficerAccount(e){
  e.preventDefault();if(!canCreateOfficer())return;
  const error=$("officerProvisionError"),name=$("opName").value.trim(),email=$("opEmail").value.trim().toLowerCase();if(error)error.textContent="";
  if(name.length<3){error.textContent="Nom RP invalide.";return;}
  let secondaryApp=null,secondaryAuth=null,createdUser=null,profileCreated=false;
  try{
    const existingUsers=await getDocs(query(collection(db,"users"),where("registeredEmail","==",email)));
    if(!existingUsers.empty){error.textContent="Un profil LSPD utilise déjà cette adresse e-mail.";return;}
    const tempPassword=generateTemporaryOfficerPassword();
    secondaryApp=initializeApp(firebaseConfig,`officer-provision-${Date.now()}-${crypto.randomUUID?.()||Math.random().toString(36).slice(2)}`);
    secondaryAuth=getAuth(secondaryApp);
    const credential=await createUserWithEmailAndPassword(secondaryAuth,email,tempPassword);
    createdUser=credential.user;
    const uid=createdUser.uid;
    await setDoc(doc(db,"users",uid),{
      name,badge:"—",grade:"Rookie",role:"Officer",status:"En formation",division:"Patrol",registeredEmail:email,
      importedAccount:true,mustChangePassword:true,chiefProvisioned:isChief(),managerProvisioned:true,selfRegistered:false,
      provisionedById:window.LSPD.user.uid,provisionedByName:window.LSPD.profile.name,
      createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
    await setDoc(doc(db,"provisional_credentials",uid),{
      userId:uid,name,email,temporaryPassword:tempPassword,createdById:window.LSPD.user.uid,createdByName:window.LSPD.profile.name,createdAt:serverTimestamp()
    });
    profileCreated=true;
    try{await addAudit("CREATE_OFFICER",uid,`${name} — ${email} — UID automatique`);}catch(auditErr){console.warn("Audit CREATE_OFFICER non enregistré",auditErr);}
    try{await signOut(secondaryAuth);}catch{}
    try{await deleteApp(secondaryApp);}catch{}
    secondaryApp=null;secondaryAuth=null;createdUser=null;
    document.querySelector(".modal")?.remove();
    const credentials=`LSPD — Compte provisoire\nNom RP : ${name}\nE-mail : ${email}\nMot de passe provisoire : ${tempPassword}\n\nLe mot de passe devra être changé à la première connexion.`;
    showModal(`<h2>Compte officier créé</h2><div class="activation-success"><p><b>${esc(name)}</b></p><p>${esc(email)}</p><div class="detail-grid"><div><span>UID Firebase automatique</span><b class="uid-value">${esc(uid)}</b></div><div><span>Profil initial</span><b>Rookie • En formation</b></div></div><label class="field full"><span>Mot de passe provisoire</span><input id="generatedOfficerPassword" readonly value="${esc(tempPassword)}"></label><p class="muted">Transmets ce mot de passe uniquement à l'officier. À sa première connexion, le Command Center l'obligera à en choisir un nouveau.</p></div><div class="modal-actions"><button class="btn" id="copyOfficerCredentials">Copier les identifiants</button><button class="btn secondary" id="closeModal">Fermer</button></div>`);
    $("copyOfficerCredentials").onclick=async()=>{try{await navigator.clipboard.writeText(credentials);showToast("Identifiants copiés.","success");}catch{showToast("Copie impossible : sélectionne le mot de passe manuellement.","error");}};
  }catch(err){
    if(createdUser && !profileCreated){try{await deleteAuthUser(createdUser);}catch{}}
    if(secondaryAuth){try{await signOut(secondaryAuth);}catch{}}
    if(secondaryApp){try{await deleteApp(secondaryApp);}catch{}}
    if(error)error.textContent=err.code==="auth/email-already-in-use"?"Cette adresse possède déjà un compte Firebase Authentication. Utilise son inscription existante ou une autre adresse.":"Erreur : "+(err.code||err.message);
  }
}

async function deleteOfficerProfile(uid,name){
  if(!canDeleteOfficer() || uid===window.LSPD.user.uid)return;
  if(!confirm(`Supprimer définitivement ${name} de la base LSPD ?\n\nSon profil Firestore sera supprimé et son accès au Command Center sera immédiatement bloqué. Les rapports et historiques déjà créés sont conservés pour la traçabilité.`))return;
  if(!confirm(`CONFIRMATION FINALE : supprimer le profil de ${name} ?`))return;
  try{try{await deleteDoc(doc(db,"provisional_credentials",uid));}catch{}await deleteDoc(doc(db,"users",uid));await addAudit("DELETE_OFFICER",uid,`${name} — profil supprimé`);showToast("Officier supprimé de la base LSPD.","success");officers();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

function openOfficerForm(o=null){
  if(!canEditOfficerProfile())return;
  if(!o){if(canCreateOfficer())return openOfficerProvisionForm();return;}
  const basic=hasPerm("personnel_manage"),gradeRight=hasPerm("personnel_grade_manage"),statusRight=hasPerm("personnel_status_manage");
  showModal(`<h2>Modifier un profil</h2><form id="officerForm"><input id="fUid" type="hidden" value="${esc(o.uid)}"><div class="formgrid">
  <label class="field"><span>Matricule</span><input id="fBadge" required value="${esc(o?.badge||"")}" ${basic?"":"disabled"}></label>
  <label class="field"><span>Nom RP</span><input id="fName" required value="${esc(o?.name||"")}" ${basic?"":"disabled"}></label>
  <label class="field"><span>Grade</span><select id="fGrade" ${gradeRight?"":"disabled"}>${gradeList.map(g=>`<option ${g[0]===canonicalGrade(o?.grade)?"selected":""}>${g[0]}</option>`).join("")}</select></label>
  <label class="field"><span>Rôle</span><select id="fRole" ${basic?"":"disabled"}>${roles.map(r=>`<option ${r===o?.role?"selected":""}>${r}</option>`).join("")}</select></label>
  <label class="field"><span>Statut</span><select id="fStatus" ${statusRight?"":"disabled"}>${statuses.map(s=>`<option ${s===o?.status?"selected":""}>${s}</option>`).join("")}</select></label>
  <label class="field"><span>Unité / Division</span><select id="fDivision" ${basic?"":"disabled"}>${divisions.map(d=>`<option ${d===(o?.division||"Patrol")?"selected":""}>${d}</option>`).join("")}</select></label>
  </div><div class="permission-edit-summary">${basic?"Identité / rôle / unité":""}${gradeRight?" • Grade":""}${statusRight?" • Statut":""}</div><div id="formError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  if(basic){
    const syncOfficerRole=()=>{if($("fRole").value==="Visiteur"){$("fGrade").value="Visiteur";$("fDivision").value="External";}};
    $("fRole").onchange=syncOfficerRole;
  }
  $("officerForm").onsubmit=saveOfficerProfile;
}
async function saveOfficerProfile(e){
  e.preventDefault();const uid=$("fUid").value.trim();
  try{
    const ref=doc(db,"users",uid),existing=await getDoc(ref);if(!existing.exists())throw new Error("Profil introuvable");
    const current=existing.data(),payload={updatedAt:serverTimestamp()};
    if(hasPerm("personnel_manage")){payload.badge=$("fBadge").value.trim();payload.name=$("fName").value.trim();payload.role=$("fRole").value;payload.division=$("fDivision").value;}
    if(hasPerm("personnel_grade_manage"))payload.grade=$("fGrade").value;
    if(hasPerm("personnel_status_manage"))payload.status=$("fStatus").value;
    if(Object.keys(payload).length===1)throw new Error("Aucune permission de modification.");
    await updateDoc(ref,payload);await addAudit("UPDATE_OFFICER",uid,`${current.name||uid} — profil modifié`);document.querySelector(".modal")?.remove();if(uid===window.LSPD.user.uid)await loadProfile(auth.currentUser);else officers();
  }catch(err){$("formError").textContent="Erreur : "+(err.code||err.message);}
}

async function assignments(){
  if(!(hasPerm("fto_assignments_view")||canManageFtoAssignments()))return;
  const as=await getDocs(collection(db,"fto_assignments"));
  const data=as.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const manage=canManageFtoAssignments();
  $("content").innerHTML=`<div class="card assignment-policy"><b>Gestion des affectations FTO</b><span>La création, l'affectation groupée et la clôture sont réservées aux grades Lieutenant et supérieurs disposant de la permission dédiée.</span></div><div class="toolbar">${manage?'<button class="btn" id="newAssignmentBtn">+ Affectation individuelle</button><button class="btn secondary" id="bulkAssignmentBtn">👥 Affectation groupée</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>FTO</th><th>Recrue</th><th>Statut</th><th>Commentaire</th>${manage?"<th></th>":""}</tr></thead><tbody>${data.length?data.map(a=>`<tr><td>${formatDate(a.createdAt)}</td><td>${esc(a.ftoName)}</td><td>${esc(a.traineeName)}</td><td><span class="tag ${a.status==="Active"?"green":""}">${esc(a.status)}</span></td><td>${esc(a.comment||"")}</td>${manage?`<td>${a.status==="Active"?`<button class="btn secondary close-assignment" data-id="${a.id}">Clôturer</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucune affectation.</td></tr>'}</tbody></table></div>`;
  $("newAssignmentBtn")?.addEventListener("click",openAssignmentForm);$("bulkAssignmentBtn")?.addEventListener("click",openBulkAssignmentForm);document.querySelectorAll(".close-assignment").forEach(b=>b.onclick=()=>closeAssignment(b.dataset.id));
}
async function openAssignmentForm(){
  if(!canManageFtoAssignments())return;
  const users=await getUsers(),activeSnap=await getDocs(collection(db,"fto_assignments")),active=activeSnap.docs.map(d=>d.data()).filter(a=>a.status==="Active");
  const ftos=users.filter(isFtoCandidateUser);
  const fto=ftos[0];const trainees=fto?users.filter(u=>validTraineeForFto(u,fto)&&!active.some(a=>a.traineeId===u.uid)):[];
  showModal(`<h2>Nouvelle affectation FTO</h2><form id="assignmentForm"><div class="formgrid"><label class="field"><span>FTO</span><select id="aFto">${ftos.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)} (${esc(o.grade)})</option>`).join("")}</select></label><label class="field"><span>Recrue</span><select id="aTrainee"></select></label></div><label class="field full"><span>Commentaire</span><textarea id="aComment" rows="4"></textarea></label><div id="assignmentError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Affecter</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  const refresh=()=>{const selected=users.find(u=>u.uid===$("aFto").value),rows=users.filter(u=>validTraineeForFto(u,selected)&&!active.some(a=>a.traineeId===u.uid));$("aTrainee").innerHTML=rows.length?rows.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)} (${esc(o.grade)})</option>`).join(""):'<option value="">Aucune recrue disponible</option>';};$("aFto").onchange=refresh;refresh();$("assignmentForm").onsubmit=saveAssignment;
}
async function saveAssignment(e){
  e.preventDefault();if(!canManageFtoAssignments())return;const f=$("aFto"),t=$("aTrainee");if(!f?.value||!t?.value)return $("assignmentError").textContent="Sélectionne un FTO et une recrue disponibles.";
  try{await addDoc(collection(db,"fto_assignments"),{ftoId:f.value,ftoName:f.selectedOptions[0].dataset.name,traineeId:t.value,traineeName:t.selectedOptions[0].dataset.name,status:"Active",comment:$("aComment").value.trim(),createdAt:serverTimestamp(),createdById:window.LSPD.user.uid,createdByName:window.LSPD.profile.name});await addAudit("FTO_ASSIGNMENT",t.value,`${t.selectedOptions[0].dataset.name} → ${f.selectedOptions[0].dataset.name}`);document.querySelector(".modal")?.remove();assignments();}catch(err){$("assignmentError").textContent="Erreur : "+(err.code||err.message);}
}
async function closeAssignment(id){
  if(!canManageFtoAssignments())return;try{await updateDoc(doc(db,"fto_assignments",id),{status:"Clôturée",closedAt:serverTimestamp(),closedById:window.LSPD.user.uid,closedByName:window.LSPD.profile.name});await addAudit("FTO_ASSIGNMENT_CLOSED",id,"Affectation clôturée");assignments();}catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function openBulkAssignmentForm(){
  if(!canManageFtoAssignments())return;
  const users=await getUsers(),activeSnap=await getDocs(collection(db,"fto_assignments")),active=activeSnap.docs.map(d=>({id:d.id,...d.data()})).filter(a=>a.status==="Active"),ftos=users.filter(isFtoCandidateUser);
  showModal(`<div class="bulk-assignment-modal"><h2>👥 Affectation FTO groupée</h2><p class="muted">Choisis un FTO puis plusieurs recrues. Une recrue déjà affectée activement est indiquée et n'est pas sélectionnable tant que son affectation n'est pas clôturée.</p><label class="field full"><span>FTO responsable</span><select id="bulkFto">${ftos.map(o=>`<option value="${o.uid}">${esc(o.badge)} — ${esc(o.name)} (${esc(o.grade)})</option>`).join("")}</select></label><div class="toolbar"><input id="bulkTraineeSearch" class="search" placeholder="Rechercher nom ou matricule..."><button class="btn tiny secondary" id="bulkSelectAll" type="button">Tout sélectionner</button><button class="btn tiny secondary" id="bulkClearAll" type="button">Tout retirer</button></div><div id="bulkTraineeList" class="bulk-trainee-list"></div><label class="field full"><span>Commentaire commun</span><textarea id="bulkAssignmentComment" rows="3"></textarea></label><div id="bulkAssignmentError" class="error"></div><div class="modal-actions"><button class="btn" id="bulkAssignmentSave" type="button">Créer les affectations</button><button class="btn secondary" id="closeModal" type="button">Annuler</button></div></div>`);
  const paint=()=>{const fto=users.find(u=>u.uid===$("bulkFto").value),q=$("bulkTraineeSearch").value.trim().toLowerCase();const candidates=users.filter(u=>validTraineeForFto(u,fto)&&(!q||`${u.name} ${u.badge} ${u.grade}`.toLowerCase().includes(q)));$("bulkTraineeList").innerHTML=candidates.length?candidates.map(u=>{const existing=active.find(a=>a.traineeId===u.uid);return `<label class="bulk-trainee-row ${existing?"disabled":""}"><input type="checkbox" class="bulk-trainee-check" value="${u.uid}" ${existing?"disabled":""}><span><b>${esc(u.badge)} — ${esc(u.name)}</b><small>${esc(u.grade)}${existing?` • déjà affecté à ${esc(existing.ftoName)}`:""}</small></span></label>`;}).join(""):'<p class="muted">Aucune recrue disponible pour ce FTO.</p>';};
  $("bulkFto").onchange=paint;$("bulkTraineeSearch").oninput=paint;paint();
  $("bulkSelectAll").onclick=()=>document.querySelectorAll(".bulk-trainee-check:not(:disabled)").forEach(x=>x.checked=true);$("bulkClearAll").onclick=()=>document.querySelectorAll(".bulk-trainee-check").forEach(x=>x.checked=false);
  $("bulkAssignmentSave").onclick=async()=>{const fto=users.find(u=>u.uid===$("bulkFto").value),selected=[...document.querySelectorAll(".bulk-trainee-check:checked")].map(x=>x.value);if(!fto||!selected.length)return $("bulkAssignmentError").textContent="Sélectionne au moins une recrue.";const btn=$("bulkAssignmentSave");btn.disabled=true;let ok=0,fail=[];for(const uid of selected){const u=users.find(x=>x.uid===uid);try{await addDoc(collection(db,"fto_assignments"),{ftoId:fto.uid,ftoName:fto.name,traineeId:u.uid,traineeName:u.name,status:"Active",comment:$("bulkAssignmentComment").value.trim(),createdAt:serverTimestamp(),createdById:window.LSPD.user.uid,createdByName:window.LSPD.profile.name,groupAssignment:true});ok++;}catch(err){fail.push(`${u?.name||uid}: ${err.code||err.message}`);}}try{await addAudit("FTO_ASSIGNMENT_BULK",fto.uid,`${ok} recrue(s) → ${fto.name}`);}catch{}if(fail.length){$("bulkAssignmentError").textContent=`${ok} créée(s), ${fail.length} échec(s): ${fail.join(" | ")}`;btn.disabled=false;}else{document.querySelector(".modal")?.remove();showToast(`${ok} affectation(s) créée(s).`,"success");assignments();}};
}

async function certifications(){
  if(!hasAnyPerm("certifications_view","certifications_manage"))return;
  const cs=await getDocs(collection(db,"certifications")),data=cs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("certifications_manage")?'<button class="btn" id="newCertificationBtn">+ Ajouter une certification</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Certification</th><th>Attribuée par</th></tr></thead><tbody>${data.length?data.map(c=>`<tr><td>${formatDate(c.createdAt)}</td><td>${esc(c.officerName)}</td><td><span class="chip">${esc(c.certification)}</span></td><td>${esc(c.issuedByName)}</td></tr>`).join(""):'<tr><td colspan="4">Aucune certification.</td></tr>'}</tbody></table></div>`;
  $("newCertificationBtn")?.addEventListener("click",openCertificationForm);
}
async function openCertificationForm(){
  if(!hasPerm("certifications_manage")) return;
  const users=(await getUsers()).filter(u=>!["Visiteur","Applicant"].includes(u.role));
  showModal(`<h2>Ajouter une certification</h2><form id="certForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="cOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Certification</span><select id="cName">${certificationsCatalog.map(c=>`<option>${c}</option>`).join("")}</select></label></div><div id="certError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Attribuer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("certForm").onsubmit=saveCertification;
}
async function saveCertification(e){
  if(!hasPerm("certifications_manage")) return;
  e.preventDefault();const s=$("cOfficer");
  try{
    await addDoc(collection(db,"certifications"),{officerId:s.value,officerName:s.selectedOptions[0].dataset.name,certification:$("cName").value,issuedById:window.LSPD.user.uid,issuedByName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("CERTIFICATION",s.value,`${s.selectedOptions[0].dataset.name} — ${$("cName").value}`);
    document.querySelector(".modal")?.remove();certifications();
  }catch(err){$("certError").textContent="Erreur : "+(err.code||err.message);}
}

async function records(){
  if(!hasAnyPerm("records_view","records_manage"))return;
  const rs=await getDocs(collection(db,"personnel_records")),data=rs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("records_manage")?'<button class="btn" id="newRecordBtn">+ Nouvelle entrée</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Type</th><th>Titre</th><th>Émis par</th><th>Détails</th></tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.officerName)}</td><td><span class="tag ${r.type==="Sanction"?"red":"green"}">${esc(r.type)}</span></td><td>${esc(r.title)}</td><td>${esc(r.issuedByName)}</td><td>${esc(r.details||"")}</td></tr>`).join(""):'<tr><td colspan="6">Aucune entrée.</td></tr>'}</tbody></table></div>`;
  $("newRecordBtn")?.addEventListener("click",openRecordForm);
}
async function openRecordForm(){
  if(!hasPerm("records_manage")) return;
  const users=(await getUsers()).filter(u=>!["Visiteur","Applicant"].includes(u.role));
  showModal(`<h2>Nouvelle entrée au dossier</h2><form id="recordForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="rOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Type</span><select id="rType"><option>Commendation</option><option>Sanction</option></select></label><label class="field full"><span>Titre</span><input id="rTitle" required></label></div><label class="field full"><span>Détails</span><textarea id="rDetails" rows="5"></textarea></label><div id="recordError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("recordForm").onsubmit=saveRecord;
}
async function saveRecord(e){
  if(!hasPerm("records_manage")) return;
  e.preventDefault();const s=$("rOfficer");
  try{
    await addDoc(collection(db,"personnel_records"),{officerId:s.value,officerName:s.selectedOptions[0].dataset.name,type:$("rType").value,title:$("rTitle").value.trim(),details:$("rDetails").value.trim(),issuedById:window.LSPD.user.uid,issuedByName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("PERSONNEL_RECORD",s.value,`${$("rType").value} — ${$("rTitle").value.trim()}`);
    document.querySelector(".modal")?.remove();records();
  }catch(err){$("recordError").textContent="Erreur : "+(err.code||err.message);}
}

async function shifts(){
  if(!hasAnyPerm("shifts_view","shifts_manage"))return;
  const ss=await getDocs(collection(db,"shifts")),data=ss.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("shifts_manage")?'<button class="btn" id="newShiftBtn">+ Ajouter un shift</button>':""}<button class="btn secondary" id="exportShiftsBtn">Exporter CSV</button></div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Début</th><th>Fin</th><th>Unité</th><th>Statut</th></tr></thead><tbody>${data.length?data.map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.officerName)}</td><td>${esc(s.start)}</td><td>${esc(s.end)}</td><td>${esc(s.division||"Patrol")}</td><td>${esc(s.status||"Planifié")}</td></tr>`).join(""):'<tr><td colspan="6">Aucun shift.</td></tr>'}</tbody></table></div>`;
  $("newShiftBtn")?.addEventListener("click",openShiftForm);
  $("exportShiftsBtn").onclick=()=>csvDownload("shifts_lspd.csv",data.map(s=>({date:s.date,officier:s.officerName,debut:s.start,fin:s.end,unite:s.division,statut:s.status})));
}
async function openShiftForm(){
  if(!hasPerm("shifts_manage")) return;
  const users=(await getUsers()).filter(u=>!["Visiteur","Applicant"].includes(u.role));
  showModal(`<h2>Ajouter un shift</h2><form id="shiftForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="sOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}" data-division="${esc(o.division||"Patrol")}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Date</span><input id="sDate" type="date" required></label><label class="field"><span>Début</span><input id="sStart" type="time" required></label><label class="field"><span>Fin</span><input id="sEnd" type="time" required></label></div><div id="shiftError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Ajouter</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("shiftForm").onsubmit=saveShift;
}
async function saveShift(e){
  if(!hasPerm("shifts_manage")) return;
  e.preventDefault();const s=$("sOfficer"),opt=s.selectedOptions[0];
  try{
    await addDoc(collection(db,"shifts"),{officerId:s.value,officerName:opt.dataset.name,date:$("sDate").value,start:$("sStart").value,end:$("sEnd").value,division:opt.dataset.division,status:"Planifié",createdById:window.LSPD.user.uid,createdAt:serverTimestamp()});
    await addAudit("SHIFT_CREATED",s.value,`${opt.dataset.name} — ${$("sDate").value} ${$("sStart").value}-${$("sEnd").value}`);
    document.querySelector(".modal")?.remove();shifts();
  }catch(err){$("shiftError").textContent="Erreur : "+(err.code||err.message);}
}

async function leave(){
  if(!(hasPerm("leave_request_create")||hasPerm("leave_review")))return;
  const mine=!hasPerm("leave_review");
  const snap=mine?await getDocs(query(collection(db,"leave_requests"),where("officerId","==",window.LSPD.user.uid))):await getDocs(collection(db,"leave_requests"));
  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("leave_request_create")?'<button class="btn" id="newLeaveBtn">+ Demander un congé</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Officier</th><th>Du</th><th>Au</th><th>Motif</th><th>Statut</th>${hasPerm("leave_review")?"<th></th>":""}</tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${esc(r.officerName)}</td><td>${esc(r.startDate)}</td><td>${esc(r.endDate)}</td><td>${esc(r.reason||"")}</td><td><span class="tag ${r.status==="Approuvé"?"green":r.status==="Refusé"?"red":"orange"}">${esc(r.status)}</span></td>${hasPerm("leave_review")?`<td>${r.status==="En attente"?`<button class="btn secondary leave-approve" data-id="${r.id}" data-status="Approuvé">Approuver</button> <button class="btn secondary leave-approve" data-id="${r.id}" data-status="Refusé">Refuser</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucune demande.</td></tr>'}</tbody></table></div>`;
  $("newLeaveBtn")?.addEventListener("click",openLeaveForm);
  document.querySelectorAll(".leave-approve").forEach(b=>b.onclick=()=>reviewLeave(b.dataset.id,b.dataset.status));
}
function openLeaveForm(){
  if(!hasPerm("leave_request_create"))return;
  showModal(`<h2>Demande de congé</h2><form id="leaveForm"><div class="formgrid"><label class="field"><span>Du</span><input id="lStart" type="date" required></label><label class="field"><span>Au</span><input id="lEnd" type="date" required></label></div><label class="field full"><span>Motif</span><textarea id="lReason" rows="4"></textarea></label><div id="leaveError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Envoyer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("leaveForm").onsubmit=saveLeave;
}
async function saveLeave(e){
  e.preventDefault();
  if(!hasPerm("leave_request_create"))return;
  try{
    await addDoc(collection(db,"leave_requests"),{officerId:window.LSPD.user.uid,officerName:window.LSPD.profile.name,startDate:$("lStart").value,endDate:$("lEnd").value,reason:$("lReason").value.trim(),status:"En attente",createdAt:serverTimestamp()});
    document.querySelector(".modal")?.remove();leave();
  }catch(err){$("leaveError").textContent="Erreur : "+(err.code||err.message);}
}
async function reviewLeave(id,status){
  if(!hasPerm("leave_review"))return;
  await updateDoc(doc(db,"leave_requests",id),{status,reviewedById:window.LSPD.user.uid,reviewedByName:window.LSPD.profile.name,reviewedAt:serverTimestamp()});
  await addAudit("LEAVE_"+status.toUpperCase(),id,status);leave();
}

async function calendar(){
  if(!(hasPerm("training_access")||hasPerm("training_manage")))return;
  const snap=await getDocs(collection(db,"training_events")),data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("training_manage")?'<button class="btn" id="newTrainingBtn">+ Planifier une formation</button>':""}</div>
  <div class="calendar-grid">${data.length?data.map(e=>`<div class="card event-card"><span class="number">${esc(e.date)} • ${esc(e.time)}</span><h3>${esc(e.title)}</h3><p>${esc(e.moduleCode||"")}</p><p class="muted">${esc(e.location||"LSPD")} • Formateur: ${esc(e.trainerName)}</p><p class="muted">${esc(e.notes||"")}</p></div>`).join(""):'<div class="card">Aucune formation planifiée.</div>'}</div>`;
  $("newTrainingBtn")?.addEventListener("click",openTrainingForm);
}

async function loadTrainingInviteDirectory(){
  const snap=await getDocs(query(collection(db,"users"),where("role","!=","Visiteur")));
  const users=snap.docs.map(d=>({uid:d.id,...d.data()}))
    .filter(u=>
      u.uid!==window.LSPD.user.uid &&
      !["Visiteur","Applicant"].includes(u.role) &&
      !["Archivé","Refusé","En attente","Inactif","Suspendu"].includes(u.status)
    )
    .sort((a,b)=>(a.name||"").localeCompare(b.name||""));

  let certs=[];
  try{
    const cs=await getDocs(collection(db,"certifications"));
    certs=cs.docs.map(d=>d.data());
  }catch{}

  const certMap=new Map();
  certs.forEach(c=>{
    if(!c.officerId||!c.certification)return;
    if(!certMap.has(c.officerId))certMap.set(c.officerId,new Set());
    certMap.get(c.officerId).add(c.certification);
  });

  return users.map(u=>({...u,trainingCertifications:[...(certMap.get(u.uid)||new Set())].sort()}));
}

function selectedTrainingInvitees(){
  const directory=window.LSPD.trainingInviteDirectory||[];
  const manual=new Set([...(window.LSPD.trainingWizardPresetIds||new Set()),...[...document.querySelectorAll(".training-person-check:checked")].map(x=>x.value)]);
  const grades=new Set([...document.querySelectorAll(".training-grade-check:checked")].map(x=>x.value));
  const certs=new Set([...document.querySelectorAll(".training-cert-check:checked")].map(x=>x.value));

  directory.forEach(u=>{
    if(grades.has(u.grade))manual.add(u.uid);
    if((u.trainingCertifications||[]).some(c=>certs.has(c)))manual.add(u.uid);
  });
  return directory.filter(u=>manual.has(u.uid));
}

function updateTrainingInvitePreview(){
  const people=selectedTrainingInvitees();
  const count=$("trainingInviteCount"),chips=$("trainingInviteChips");
  if(count)count.textContent=`${people.length} ${people.length===1?"personne invitée":"personnes invitées"}`;
  if(chips){
    const shown=people.slice(0,12);
    chips.innerHTML=shown.map(u=>`<span>${esc(u.name)} <small>${esc(u.grade||"")}</small></span>`).join("")
      +(people.length>shown.length?`<span class="more">+${people.length-shown.length}</span>`:"");
  }
}

function renderTrainingInvitePeople(){
  const host=$("trainingInvitePeople"),search=$("trainingInviteSearch");
  if(!host)return;
  const q=(search?.value||"").trim().toLowerCase();
  const directory=(window.LSPD.trainingInviteDirectory||[]).filter(u=>
    !q || [u.name,u.badge,u.grade,u.division,...(u.trainingCertifications||[])]
      .some(v=>String(v||"").toLowerCase().includes(q))
  );
  host.innerHTML=directory.length?directory.map(u=>`<label class="training-invite-person">
    <input class="training-person-check" type="checkbox" value="${u.uid}" ${window.LSPD.trainingWizardPresetIds?.has(u.uid)?"checked":""}>
    <span class="training-invite-avatar">${esc((u.name||"?").slice(0,1).toUpperCase())}</span>
    <span><b>${esc(u.badge||"—")} — ${esc(u.name)}</b><small>${esc(u.grade||"—")} • ${esc(u.division||"Patrol")}</small></span>
  </label>`).join(""):'<div class="training-empty-mini">Aucun membre trouvé.</div>';
  document.querySelectorAll(".training-person-check").forEach(c=>c.onchange=()=>{window.LSPD.trainingWizardPresetIds??=new Set();c.checked?window.LSPD.trainingWizardPresetIds.add(c.value):window.LSPD.trainingWizardPresetIds.delete(c.value);updateTrainingInvitePreview();});
}

async function openTrainingCreationWizard(prefillModuleCode=null,prefillInviteeIds=[]){
  if(!hasPerm("training_manage"))return;

  window.LSPD.trainingWizard={
    step:1,
    title:"",
    moduleCode:prefillModuleCode||"M01",
    date:"",
    time:"",
    location:"LSPD",
    capacity:Math.max(20,(prefillInviteeIds||[]).length),
    notes:""
  };
  window.LSPD.trainingWizardPresetIds=new Set(prefillInviteeIds||[]);
  window.LSPD.trainingInviteDirectory=await loadTrainingInviteDirectory();
  renderTrainingWizard();
}

function readTrainingWizardStep1(){
  const w=window.LSPD.trainingWizard;
  if(!$("twTitle"))return true;
  w.title=$("twTitle").value.trim();
  w.moduleCode=$("twModule").value;
  w.date=$("twDate").value;
  w.time=$("twTime").value;
  w.location=$("twLocation").value.trim()||"LSPD";
  w.capacity=Math.max(1,Math.min(100,Number($("twCapacity").value)||20));
  w.notes=$("twNotes").value.trim();
  if(!w.title||!w.date||!w.time){
    $("twError").textContent="Titre, date et heure sont obligatoires.";
    return false;
  }
  return true;
}

function renderTrainingWizard(){
  const w=window.LSPD.trainingWizard;
  const root=$("mailOverlayRoot");
  if(!root||!w)return;

  let body="";
  if(w.step===1){
    body=`<div class="training-wizard-step">
      <div class="training-wizard-progress"><i class="active">1</i><span></span><i>2</i><span></span><i>3</i></div>
      <div class="training-wizard-step-title"><span>Étape 1 sur 3</span><h2>Informations de la formation</h2><p>Commence par l'essentiel. Les participants seront choisis ensuite.</p></div>
      <div class="training-wizard-form">
        <label><span>Module</span><select id="twModule">${modules.map(m=>`<option value="${m[0]}" ${m[0]===w.moduleCode?"selected":""}>${m[0]} — ${esc(m[1])}</option>`).join("")}</select></label>
        <label><span>Titre</span><input id="twTitle" value="${esc(w.title)}" placeholder="Ex. M04 — Contrôle routier pratique"></label>
        <label><span>Date</span><input id="twDate" type="date" value="${esc(w.date)}"></label>
        <label><span>Heure</span><input id="twTime" type="time" value="${esc(w.time)}"></label>
        <label><span>Lieu</span><input id="twLocation" value="${esc(w.location)}"></label>
        <label><span>Capacité</span><input id="twCapacity" type="number" min="1" max="100" value="${w.capacity}"></label>
        <label class="full"><span>Notes / objectif de la session</span><textarea id="twNotes" rows="4">${esc(w.notes)}</textarea></label>
      </div>
      <div id="twError" class="error"></div>
    </div>`;
  }else if(w.step===2){
    const directory=window.LSPD.trainingInviteDirectory||[];
    const grades=[...new Set(directory.map(u=>u.grade).filter(Boolean))].sort((a,b)=>gradeIndex(a)-gradeIndex(b));
    const certs=[...new Set(directory.flatMap(u=>u.trainingCertifications||[]))].sort();
    body=`<div class="training-wizard-step">
      <div class="training-wizard-progress"><i class="done">✓</i><span class="done"></span><i class="active">2</i><span></span><i>3</i></div>
      <div class="training-wizard-step-title"><span>Étape 2 sur 3</span><h2>Qui veux-tu inviter ?</h2><p>Tu peux mélanger personnes, grades et certifications. Les doublons sont supprimés.</p></div>
      <div class="training-invite-builder">
        <section>
          <header><b>👤 Sélection individuelle</b></header>
          <div class="training-invite-search">🔎 <input id="trainingInviteSearch" placeholder="Rechercher un membre..."></div>
          <div id="trainingInvitePeople" class="training-invite-people"></div>
        </section>
        <aside>
          <div class="training-invite-group"><header><b>⭐ Par grade</b></header><div>${grades.map(g=>{const c=directory.filter(u=>u.grade===g).length;return `<label><input class="training-grade-check" type="checkbox" value="${esc(g)}"><span><b>${esc(g)}</b><small>${c} membre${c===1?"":"s"}</small></span></label>`}).join("")}</div></div>
          <div class="training-invite-group"><header><b>🏅 Par certification</b></header><div>${certs.length?certs.map(c=>{const n=directory.filter(u=>(u.trainingCertifications||[]).includes(c)).length;return `<label><input class="training-cert-check" type="checkbox" value="${esc(c)}"><span><b>${esc(c)}</b><small>${n} membre${n===1?"":"s"}</small></span></label>`}).join(""):'<p class="training-empty-mini">Aucune certification disponible.</p>'}</div></div>
        </aside>
      </div>
      <div class="training-invite-preview"><b id="trainingInviteCount">0 personne invitée</b><div id="trainingInviteChips"></div></div>
    </div>`;
  }else{
    const invitees=window.LSPD.trainingWizardInvitees||[];
    const finalCapacity=Math.max(w.capacity,invitees.length);
    body=`<div class="training-wizard-step">
      <div class="training-wizard-progress"><i class="done">✓</i><span class="done"></span><i class="done">✓</i><span class="done"></span><i class="active">3</i></div>
      <div class="training-wizard-step-title"><span>Étape 3 sur 3</span><h2>Confirmation</h2><p>Vérifie avant de créer la formation et d'envoyer les invitations.</p></div>
      <div class="training-review-card">
        <div><span>Formation</span><b>${esc(w.moduleCode)} — ${esc(w.title)}</b></div>
        <div><span>Date / heure</span><b>${esc(w.date)} • ${esc(w.time)}</b></div>
        <div><span>Lieu</span><b>${esc(w.location)}</b></div>
        <div><span>Formateur</span><b>${esc(window.LSPD.profile.name)}</b></div>
        <div><span>Invitations</span><b>${invitees.length}</b></div>
        <div><span>Capacité</span><b>${finalCapacity}${finalCapacity!==w.capacity?` <small>(ajustée automatiquement)</small>`:""}</b></div>
      </div>
      ${invitees.length?`<div class="training-review-people">${invitees.map(u=>`<span>${esc(u.name)} <small>${esc(u.grade)}</small></span>`).join("")}</div>`:'<div class="training-wizard-notice">Aucune invitation sélectionnée. La formation sera créée et les membres pourront s’inscrire eux-mêmes.</div>'}
      ${w.notes?`<div class="training-wizard-notice"><b>Notes :</b> ${esc(w.notes)}</div>`:""}
      <div id="twError" class="error"></div>
    </div>`;
  }

  root.innerHTML=`<div class="mail-window-backdrop"></div><section class="training-wizard-window" role="dialog">
    <header class="training-wizard-header"><div><span class="eyebrow">LSPD TRAINING</span><h2>Créer une formation</h2></div><button id="closeTrainingWizard" type="button">✕</button></header>
    <div class="training-wizard-body">${body}</div>
    <footer class="training-wizard-footer">
      ${w.step>1?'<button class="btn secondary" id="trainingWizardBack">Retour</button>':""}
      <span></span>
      ${w.step<3?'<button class="btn" id="trainingWizardNext">Continuer</button>':'<button class="btn" id="trainingWizardCreate">Créer et envoyer les invitations</button>'}
    </footer>
  </section>`;
  document.body.classList.add("mail-window-open");

  $("closeTrainingWizard").onclick=closeMailWindow;
  root.querySelector(".mail-window-backdrop").onclick=closeMailWindow;

  if(w.step===2){
    renderTrainingInvitePeople();
    $("trainingInviteSearch").oninput=renderTrainingInvitePeople;
    document.querySelectorAll(".training-grade-check,.training-cert-check").forEach(c=>c.onchange=updateTrainingInvitePreview);
    updateTrainingInvitePreview();
  }

  $("trainingWizardBack")?.addEventListener("click",()=>{
    w.step--;
    renderTrainingWizard();
  });

  $("trainingWizardNext")?.addEventListener("click",()=>{
    if(w.step===1 && !readTrainingWizardStep1())return;
    if(w.step===2)window.LSPD.trainingWizardInvitees=selectedTrainingInvitees();
    w.step++;
    renderTrainingWizard();
  });

  $("trainingWizardCreate")?.addEventListener("click",createTrainingFromWizard);
}

async function createTrainingFromWizard(){
  if(!hasPerm("training_manage"))return;
  const w=window.LSPD.trainingWizard;
  const invitees=window.LSPD.trainingWizardInvitees||[];
  const btn=$("trainingWizardCreate");
  if(btn){btn.disabled=true;btn.textContent="Création...";}

  try{
    const capacity=Math.max(w.capacity,invitees.length,1);
    const eventRef=await addDoc(collection(db,"training_events"),{
      title:w.title,moduleCode:w.moduleCode,date:w.date,time:w.time,location:w.location,
      notes:w.notes,capacity,status:"Planifié",trainerId:window.LSPD.user.uid,
      trainerName:window.LSPD.profile.name,invitedCount:invitees.length,
      createdAt:serverTimestamp()
    });

    let invited=0,failed=0;
    for(const u of invitees){
      try{
        await addDoc(collection(db,"training_registrations"),{
          eventId:eventRef.id,
          officerId:u.uid,
          officerName:u.name,
          status:"Invité",
          attendanceStatus:"Invité",
          invitedById:window.LSPD.user.uid,
          invitedByName:window.LSPD.profile.name,
          invitedAt:serverTimestamp(),
          createdAt:serverTimestamp()
        });
        await createNotification(
          u.uid,
          `Invitation formation : ${w.moduleCode} — ${w.title}`,
          `${w.date} à ${w.time} • ${w.location} • Formateur : ${window.LSPD.profile.name}`,
          "Formation",
          "trainingCenter",
          eventRef.id
        );
        invited++;
      }catch(err){
        console.warn("Training invitation failed",u.uid,err);
        failed++;
      }
    }

    await addAudit("TRAINING_EVENT_CREATE",eventRef.id,`${w.moduleCode} — ${w.title} — ${invitees.length} invitation(s)`);
    closeMailWindow();
    window.LSPD.trainingCenterTab="myTraining";
    showToast(`Formation créée${invited?` • ${invited} invitation(s) envoyée(s)`:""}${failed?` • ${failed} échec(s)`:""}.`,failed?"warning":"success");
    await trainingCenter();
  }catch(err){
    $("twError").textContent="Erreur : "+(err.code||err.message);
    if(btn){btn.disabled=false;btn.textContent="Créer et envoyer les invitations";}
  }
}

async function respondTrainingInvitation(regId,response,eventId){
  try{
    const accept=response==="accept";
    await updateDoc(doc(db,"training_registrations",regId),{
      status:accept?"Inscrit":"Refusé",
      attendanceStatus:accept?"Inscrit":"Invitation refusée",
      respondedAt:serverTimestamp()
    });
    await addAudit(accept?"TRAINING_INVITATION_ACCEPT":"TRAINING_INVITATION_DECLINE",eventId,window.LSPD.profile.name);
    showToast("Réponse enregistrée.","success");
    await trainingCenter();
  }catch(err){
    showToast("Erreur : "+(err.code||err.message),"error");
  }
}

async function openTrainingEventDetail(eventId){
  const [eventSnap,regSnap]=await Promise.all([
    getDoc(doc(db,"training_events",eventId)),
    getDocs(query(collection(db,"training_registrations"),where("officerId","==",window.LSPD.user.uid)))
  ]);
  if(!eventSnap.exists())return;
  const e={id:eventSnap.id,...eventSnap.data()};
  const mine=regSnap.docs.map(d=>({id:d.id,...d.data()})).find(r=>r.eventId===eventId);

  showModal(`<div class="training-event-detail-modal">
    <div class="training-event-detail-head"><span class="module-code large">${esc(e.moduleCode||"—")}</span><div><h2>${esc(e.title)}</h2><p>${esc(e.date)} • ${esc(e.time)} • ${esc(e.location||"LSPD")}</p></div></div>
    <div class="training-review-card compact"><div><span>Formateur</span><b>${esc(e.trainerName)}</b></div><div><span>Statut</span><b>${esc(mine?.status||"—")}</b></div><div><span>Capacité</span><b>${Number(e.capacity)||20}</b></div></div>
    ${e.notes?`<div class="training-wizard-notice">${esc(e.notes)}</div>`:""}
    <div class="modal-actions">
      ${e.moduleCode?`<button class="btn secondary" id="eventProgramBtn">Voir le programme</button>`:""}
      <button class="btn secondary" id="closeModal">Fermer</button>
    </div>
  </div>`);
  $("eventProgramBtn")?.addEventListener("click",()=>openTrainingModuleContext(e.moduleCode,window.LSPD.user.uid));
}

async function openTrainingEventManager(eventId){
  if(!hasPerm("training_manage"))return;
  const [eventSnap,regsSnap,evalSnap]=await Promise.all([
    getDoc(doc(db,"training_events",eventId)),
    getDocs(query(collection(db,"training_registrations"),where("eventId","==",eventId))),
    getDocs(collection(db,"evaluations"))
  ]);
  if(!eventSnap.exists())return;
  const e={id:eventSnap.id,...eventSnap.data()};
  if(e.trainerId!==window.LSPD.user.uid && !hasPerm("training_manage"))return;

  const regs=regsSnap.docs.map(d=>({id:d.id,...d.data()})).filter(r=>r.status!=="Annulée");
  const eventEvals=evalSnap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.trainingEventId===eventId);
  const invited=regs.filter(r=>r.status==="Invité");
  const confirmed=regs.filter(r=>r.status==="Inscrit");
  const declined=regs.filter(r=>r.status==="Refusé");
  const isDone=e.status==="Terminée";

  const participantRows=confirmed.map(r=>{
    const evaluation=eventEvals.find(ev=>ev.officerId===r.officerId);
    return `<div class="training-participant-eval-row">
      <div><b>${esc(r.officerName)}</b><small>${esc(r.attendanceStatus||r.status)}</small></div>
      ${evaluation
        ?`<span class="tag ${evaluation.result==="Validé"?"green":evaluation.result==="Échec"?"red":"orange"}">${esc(evaluation.result)} • ${evaluation.score}/100</span>`
        :isDone
          ?`<button class="btn evaluate-training-participant" data-officer="${r.officerId}" data-event="${eventId}" data-module="${esc(e.moduleCode)}">✅ Évaluer</button>`
          :'<span class="tag">À évaluer après la formation</span>'}
    </div>`;
  }).join("");

  showModal(`<div class="training-event-manager one-training-manager">
    <div class="training-event-detail-head">
      <span class="module-code large">${esc(e.moduleCode)}</span>
      <div><span class="eyebrow">FORMATION UNIQUE</span><h2>${esc(e.title)}</h2><p>${esc(e.date)} • ${esc(e.time)} • ${esc(e.location)}</p></div>
      <span class="tag ${isDone?"green":"orange"}">${isDone?"Formation terminée":"Planifiée"}</span>
    </div>

    <div class="one-training-rule">
      <span>1</span><b>Formation</b><i>→</i><span>2</span><b>Évaluation</b><i>→</i><span>3</span><b>Validée / À refaire</b>
    </div>

    <div class="training-manager-stats">
      <div><span>Confirmés</span><b>${confirmed.length}</b></div>
      <div><span>En attente</span><b>${invited.length}</b></div>
      <div><span>Refus</span><b>${declined.length}</b></div>
      <div><span>Évalués</span><b>${eventEvals.length}/${confirmed.length}</b></div>
    </div>

    <div class="training-manager-actions">
      ${!isDone?'<button class="btn" id="completeTrainingEventBtn">✓ Terminer la formation</button>':""}
      ${hasPerm("training_invites_manage")?`<button class="btn secondary" id="eventInviteMoreBtn">+ Inviter des membres</button>`:""}
      ${hasPerm("training_attendance_manage")?`<button class="btn secondary" id="eventAttendanceBtn">Présences</button>`:""}
      ${e.moduleCode?'<button class="btn secondary" id="eventScenarioBtn">🎲 Scénario</button>':""}
      ${e.moduleCode?'<button class="btn secondary" id="eventProgramBtn">📚 Programme</button>':""}
    </div>

    ${isDone?'<div class="training-completed-callout">Formation terminée, évalue maintenant chaque participant. Le résultat de cette évaluation valide ou non cette formation uniquement.</div>':""}

    <section class="training-evaluation-participants">
      <h3>Participants & résultat de la formation</h3>
      ${participantRows||'<p class="muted">Aucun participant confirmé.</p>'}
    </section>

    ${invited.length?`<details class="training-manager-details"><summary>Invitations sans réponse (${invited.length})</summary>${invited.map(r=>`<div class="training-participant-line"><b>${esc(r.officerName)}</b><span>Invité</span></div>`).join("")}</details>`:""}
    ${declined.length?`<details class="training-manager-details"><summary>Refus (${declined.length})</summary>${declined.map(r=>`<div class="training-participant-line"><b>${esc(r.officerName)}</b><span>Refusé</span></div>`).join("")}</details>`:""}

    <div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>
  </div>`);

  $("completeTrainingEventBtn")?.addEventListener("click",()=>completeTrainingEvent(eventId));
  $("eventInviteMoreBtn")?.addEventListener("click",()=>openAdditionalTrainingInvites(eventId));
  $("eventAttendanceBtn")?.addEventListener("click",()=>openTrainingAttendance(eventId));
  $("eventScenarioBtn")?.addEventListener("click",()=>openRandomScenario(e.moduleCode));
  $("eventProgramBtn")?.addEventListener("click",()=>openAcademyGuide(e.moduleCode));
  document.querySelectorAll(".evaluate-training-participant").forEach(b=>b.onclick=()=>{
    document.querySelector(".modal")?.remove();
    openEvaluationForm(b.dataset.officer,b.dataset.module,b.dataset.event);
  });
}

async function completeTrainingEvent(eventId){
  if(!hasPerm("training_manage"))return;
  try{
    await updateDoc(doc(db,"training_events",eventId),{
      status:"Terminée",
      completedAt:serverTimestamp(),
      completedById:window.LSPD.user.uid,
      completedByName:window.LSPD.profile.name
    });
    await addAudit("TRAINING_EVENT_COMPLETE",eventId,window.LSPD.profile.name);
    showToast("Formation terminée. Passe maintenant aux évaluations.","success");
    document.querySelector(".modal")?.remove();
    await openTrainingEventManager(eventId);
  }catch(err){
    showToast("Erreur : "+(err.code||err.message),"error");
  }
}

async function openAdditionalTrainingInvites(eventId){
  if(!hasPerm("training_invites_manage"))return;
  const [eventSnap,existingSnap]=await Promise.all([
    getDoc(doc(db,"training_events",eventId)),
    getDocs(query(collection(db,"training_registrations"),where("eventId","==",eventId)))
  ]);
  if(!eventSnap.exists())return;
  const e={id:eventSnap.id,...eventSnap.data()};
  const existingIds=new Set(existingSnap.docs.map(d=>d.data().officerId));
  const directory=(await loadTrainingInviteDirectory()).filter(u=>!existingIds.has(u.uid));
  window.LSPD.trainingInviteDirectory=directory;

  showModal(`<h2>Inviter des membres — ${esc(e.title)}</h2>
    <p class="muted">Sélectionne les personnes supplémentaires.</p>
    <div class="training-invite-search">🔎 <input id="trainingInviteSearch" placeholder="Rechercher un membre..."></div>
    <div id="trainingInvitePeople" class="training-invite-people standalone"></div>
    <div class="training-invite-preview"><b id="trainingInviteCount">0 personne invitée</b><div id="trainingInviteChips"></div></div>
    <div id="additionalInviteError" class="error"></div>
    <div class="modal-actions"><button class="btn" id="sendAdditionalInvites">Envoyer les invitations</button><button class="btn secondary" id="closeModal">Annuler</button></div>`);
  renderTrainingInvitePeople();
  $("trainingInviteSearch").oninput=renderTrainingInvitePeople;
  updateTrainingInvitePreview();

  $("sendAdditionalInvites").onclick=async()=>{
    const invitees=selectedTrainingInvitees();
    if(!invitees.length){$("additionalInviteError").textContent="Sélectionne au moins une personne.";return;}
    try{
      for(const u of invitees){
        await addDoc(collection(db,"training_registrations"),{
          eventId,officerId:u.uid,officerName:u.name,status:"Invité",attendanceStatus:"Invité",
          invitedById:window.LSPD.user.uid,invitedByName:window.LSPD.profile.name,
          invitedAt:serverTimestamp(),createdAt:serverTimestamp()
        });
        await createNotification(u.uid,`Invitation formation : ${e.moduleCode} — ${e.title}`,`${e.date} à ${e.time} • ${e.location} • Formateur : ${e.trainerName}`,"Formation","trainingCenter",eventId);
      }
      document.querySelector(".modal")?.remove();
      showToast(`${invitees.length} invitation(s) envoyée(s).`,"success");
      openTrainingEventManager(eventId);
    }catch(err){$("additionalInviteError").textContent="Erreur : "+(err.code||err.message);}
  };
}

function openTrainingForm(){
  if(!hasPerm("training_manage")) return;
  showModal(`<h2>Planifier une formation</h2><form id="trainingForm"><div class="formgrid"><label class="field"><span>Titre</span><input id="tTitle" required></label><label class="field"><span>Module</span><select id="tModule">${modules.map(m=>`<option value="${m[0]}">${m[0]} — ${m[1]}</option>`).join("")}</select></label><label class="field"><span>Date</span><input id="tDate" type="date" required></label><label class="field"><span>Heure</span><input id="tTime" type="time" required></label><label class="field"><span>Lieu</span><input id="tLocation" value="LSPD"></label><label class="field"><span>Capacité</span><input id="tCapacity" type="number" min="1" max="100" value="20" required></label></div><label class="field full"><span>Notes</span><textarea id="tNotes" rows="4"></textarea></label><div id="trainingError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Planifier</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("trainingForm").onsubmit=saveTrainingEvent;
}
async function saveTrainingEvent(e){
  if(!hasPerm("training_manage")) return;
  e.preventDefault();
  try{
    const capacity=Number($("tCapacity").value);
    if(!Number.isInteger(capacity)||capacity<1||capacity>100){$("trainingError").textContent="La capacité doit être comprise entre 1 et 100.";return;}
    await addDoc(collection(db,"training_events"),{title:$("tTitle").value.trim(),moduleCode:$("tModule").value,date:$("tDate").value,time:$("tTime").value,location:$("tLocation").value.trim(),notes:$("tNotes").value.trim(),capacity,status:"Planifié",trainerId:window.LSPD.user.uid,trainerName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("TRAINING_EVENT",window.LSPD.user.uid,`${$("tDate").value} — ${$("tTitle").value.trim()}`);
    document.querySelector(".modal")?.remove();calendar();
  }catch(err){$("trainingError").textContent="Erreur : "+(err.code||err.message);}
}

async function requirements(){
  if(!hasPerm("analytics"))return;
  const [us,ev]=await Promise.all([getDocs(query(collection(db,"users"),where("role","!=","Visiteur"))),getDocs(collection(db,"evaluations"))]);
  const users=us.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>!["Visiteur","Applicant"].includes(u.role) && !["Inactif","Archivé"].includes(u.status));
  const evals=ev.docs.map(d=>d.data());
  const rows=users.map(o=>{
    const validated=[...new Set(evals.filter(e=>e.officerId===o.uid&&e.result==="Validé").map(e=>e.moduleCode))];
    const missing=modules.filter(m=>!validated.includes(m[0]));
    return {o,validated:validated.length,missing};
  }).sort((a,b)=>a.validated-b.validated);

  $("content").innerHTML=`<div class="card table-card"><table class="table"><thead><tr><th>Officier</th><th>Grade</th><th>Progression</th><th>Modules restants</th></tr></thead><tbody>
  ${rows.map(x=>`<tr><td>${esc(x.o.badge)} — <b>${esc(x.o.name)}</b></td><td>${esc(x.o.grade)}</td><td>${x.validated}/${modules.length}</td><td>${x.missing.slice(0,6).map(m=>`<span class="chip">${m[0]}</span>`).join(" ")}${x.missing.length>6?` <span class="muted">+${x.missing.length-6}</span>`:""}</td></tr>`).join("")}
  </tbody></table></div>`;
}

async function promotionAdvisor(){
  if(!hasPerm("analytics"))return;
  const [us,ev,rs]=await Promise.all([getDocs(query(collection(db,"users"),where("role","!=","Visiteur"))),getDocs(collection(db,"evaluations")),getDocs(collection(db,"personnel_records"))]);
  const users=us.docs.map(d=>({uid:d.id,...d.data()})),evals=ev.docs.map(d=>d.data()),recordsData=rs.docs.map(d=>d.data());
  const rows=users.filter(o=>!["Visiteur","Applicant"].includes(o.role)&&o.status!=="Archivé").map(o=>{
    const oe=evals.filter(e=>e.officerId===o.uid),valid=[...new Set(oe.filter(e=>e.result==="Validé").map(e=>e.moduleCode))],avg=oe.length?Math.round(oe.reduce((s,e)=>s+(Number(e.score)||0),0)/oe.length):0;
    const sanctions=recordsData.filter(r=>r.officerId===o.uid&&r.type==="Sanction").length;
    let readiness=Math.max(0,Math.min(100,Math.min(50,Math.round(valid.length/modules.length*50))+Math.min(40,Math.round(avg*0.4))-sanctions*10));
    return {o,valid:valid.length,avg,sanctions,readiness,label:readiness>=80?"Fort candidat":readiness>=65?"À considérer":"Pas encore"};
  }).sort((a,b)=>b.readiness-a.readiness);

  $("content").innerHTML=`<div class="card"><p class="muted">Indicateur d'aide à la décision. Il ne remplace pas le jugement du commandement.</p></div>
  <div class="card table-card" style="margin-top:14px"><table class="table"><thead><tr><th>Officier</th><th>Grade</th><th>Modules</th><th>Moyenne FTO</th><th>Sanctions</th><th>Indice</th><th>Lecture</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.o.badge)} — <b>${esc(x.o.name)}</b></td><td>${esc(x.o.grade)}</td><td>${x.valid}/${modules.length}</td><td>${x.avg}/100</td><td>${x.sanctions}</td><td><div class="mini-progress"><i style="width:${x.readiness}%"></i></div>${x.readiness}%</td><td><span class="tag ${x.readiness>=80?"green":x.readiness>=65?"orange":""}">${x.label}</span></td></tr>`).join("")}</tbody></table></div>`;
}

async function promotions(){
  if(!hasAnyPerm("promotions_view","promotions_manage"))return;
  const ps=await getDocs(collection(db,"promotions")),data=ps.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("promotions_manage")?'<button class="btn" id="newPromotionBtn">+ Enregistrer une promotion</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Ancien grade</th><th>Nouveau grade</th><th>Validé par</th></tr></thead><tbody>${data.length?data.map(p=>`<tr><td>${formatDate(p.createdAt)}</td><td>${esc(p.officerName)}</td><td>${esc(p.oldGrade)}</td><td>${esc(p.newGrade)}</td><td>${esc(p.approvedByName)}</td></tr>`).join(""):'<tr><td colspan="5">Aucune promotion.</td></tr>'}</tbody></table></div>`;
  $("newPromotionBtn")?.addEventListener("click",openPromotionForm);
}
async function openPromotionForm(){
  if(!hasPerm("promotions_manage")) return;
  const users=(await getUsers()).filter(u=>!["Visiteur","Applicant"].includes(u.role));
  showModal(`<h2>Enregistrer une promotion</h2><form id="promotionForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="pOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}" data-grade="${esc(o.grade)}">${esc(o.badge)} — ${esc(o.name)} — ${esc(o.grade)}</option>`).join("")}</select></label><label class="field"><span>Nouveau grade</span><select id="pNewGrade">${gradeList.map(g=>`<option>${g[0]}</option>`).join("")}</select></label></div><label class="field full"><span>Motif</span><textarea id="pComment" rows="4"></textarea></label><div id="promotionError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Valider</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("promotionForm").onsubmit=savePromotion;
}
async function savePromotion(e){
  if(!hasPerm("promotions_manage")) return;
  e.preventDefault();const s=$("pOfficer"),uid=s.value,name=s.selectedOptions[0].dataset.name,oldGrade=s.selectedOptions[0].dataset.grade,newGrade=$("pNewGrade").value;
  try{
    await updateDoc(doc(db,"users",uid),{grade:newGrade,updatedAt:serverTimestamp()});
    await addDoc(collection(db,"promotions"),{officerId:uid,officerName:name,oldGrade,newGrade,comment:$("pComment").value.trim(),approvedById:window.LSPD.user.uid,approvedByName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("PROMOTION",uid,`${name}: ${oldGrade} → ${newGrade}`);document.querySelector(".modal")?.remove();promotions();
  }catch(err){$("promotionError").textContent="Erreur : "+(err.code||err.message);}
}

async function stats(){
  if(!hasPerm("analytics"))return;
  const [us,ev,as,cs,rs,lv,sh]=await Promise.all([
    getDocs(query(collection(db,"users"),where("role","!=","Visiteur"))),getDocs(collection(db,"evaluations")),
    getDocs(collection(db,"fto_assignments")),getDocs(collection(db,"certifications")),
    getDocs(collection(db,"personnel_records")),getDocs(collection(db,"leave_requests")),
    getDocs(collection(db,"shifts"))
  ]);
  const users=us.docs.map(d=>d.data()).filter(u=>!["Visiteur","Applicant"].includes(u.role)),evals=ev.docs.map(d=>d.data()),assign=as.docs.map(d=>d.data()),certs=cs.docs.map(d=>d.data()),recordsData=rs.docs.map(d=>d.data()),leaves=lv.docs.map(d=>d.data()),shiftsData=sh.docs.map(d=>d.data());
  const avg=evals.length?Math.round(evals.reduce((s,e)=>s+(Number(e.score)||0),0)/evals.length):0;

  $("content").innerHTML=`<div class="grid stats-grid">
    <div class="card accent-card"><div class="muted">Effectif</div><div class="stat">${users.length}</div></div>
    <div class="card accent-card"><div class="muted">Évaluations</div><div class="stat">${evals.length}</div></div>
    <div class="card accent-card"><div class="muted">Affectations actives</div><div class="stat">${assign.filter(a=>a.status==="Active").length}</div></div>
    <div class="card accent-card"><div class="muted">Score moyen</div><div class="stat">${avg}/100</div></div>
  </div>
  <div class="grid2" style="margin-top:16px">
    <div class="card"><h3>Effectif par grade</h3>${gradeList.map(g=>`<div class="row"><span>${g[0]}</span><b>${users.filter(u=>u.grade===g[0]).length}</b></div>`).join("")}</div>
    <div class="card"><h3>Operations & RH</h3><div class="row"><span>Certifications</span><b>${certs.length}</b></div><div class="row"><span>Commendations</span><b>${recordsData.filter(r=>r.type==="Commendation").length}</b></div><div class="row"><span>Sanctions</span><b>${recordsData.filter(r=>r.type==="Sanction").length}</b></div><div class="row"><span>Congés en attente</span><b>${leaves.filter(r=>r.status==="En attente").length}</b></div><div class="row"><span>Shifts enregistrés</span><b>${shiftsData.length}</b></div></div>
  </div>
  <div class="section-title">Par unité</div>
  <div class="grid">${divisions.map(d=>`<div class="card"><div class="muted">${d}</div><div class="stat">${users.filter(u=>u.division===d&&u.status!=="Archivé").length}</div><div class="muted">officiers</div></div>`).join("")}</div>`;
}

function gradesPage(){
  $("content").innerHTML=`<div class="grid2">${gradeList.map((g,i)=>`<div class="card grade"><span class="number">${String(i+1).padStart(2,"0")}</span><h3>${g[0]}</h3><p><b>${g[1]}</b></p><p class="muted">${g[2]}</p></div>`).join("")}</div>`;
}
function scenariosPage(){
  $("content").innerHTML=`<div class="grid module-grid">${scenarios.map(s=>`<div class="card"><span class="number">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p><p class="muted">${s[3]}</p><button class="btn secondary scenario-btn" data-id="${s[0]}">Lancer</button></div>`).join("")}</div>`;
  document.querySelectorAll(".scenario-btn").forEach(b=>b.onclick=()=>startScenario(b.dataset.id));
}
function startScenario(id){
  const s=scenarios.find(x=>x[0]===id);showModal(`<h2>${s[0]} — ${s[1]}</h2><p>${s[2]}</p><h3>Points à observer</h3>${s[3].split(",").map(x=>`<label class="check"><input type="checkbox">${x.trim()}</label>`).join("")}<button class="btn" id="closeModal">Terminer</button>`);
}

async function admin(){
  if(!isChief())return;
  const [users,recruitmentSettings]=await Promise.all([getUsers(),getRecruitmentSettings()]);
  $("content").innerHTML=`<div class="grid2">
    <div class="card admin-feature"><span class="eyebrow">SYSTEM</span><h3>Gestion système</h3><div class="row"><span>Profils</span><b>${users.length}</b></div><div class="row"><span>Authentication</span><b>Firebase Console</b></div><div class="row"><span>Rôles & unités</span><b>Onglet Officiers</b></div></div>
    <div class="card admin-feature"><span class="eyebrow">ACCOUNT PROVISIONING</span><h3>Comptes importés</h3><div class="row"><span>Total importé</span><b>${users.filter(u=>u.importedAccount).length}</b></div><div class="row"><span>Jamais activés</span><b>${users.filter(u=>u.importedAccount&&u.mustChangePassword).length}</b></div><div class="row"><span>Activés</span><b>${users.filter(u=>u.importedAccount&&!u.mustChangePassword).length}</b></div><p class="muted">Les codes provisoires des comptes à activer sont conservés dans un coffre Firestore séparé, lisible uniquement avec la permission dédiée, puis deviennent inaccessibles après activation.</p></div>
    <div class="card admin-feature recruitment-admin-card"><span class="eyebrow">RECRUITMENT CONTROL</span><h3>Candidatures LSPD</h3><div class="recruitment-open-state ${recruitmentSettings.open?"open":"closed"}"><b>${recruitmentSettings.open?"🟢 OUVERTES":"🔒 FERMÉES"}</b><span>${recruitmentSettings.open?"Les candidats peuvent déposer un nouveau dossier.":"Aucun nouveau dossier ne peut être déposé."}</span></div><div class="admin-recruitment-actions"><button class="btn ${recruitmentSettings.open?"danger":""}" id="adminRecruitmentToggle">${recruitmentSettings.open?"Fermer les candidatures":"Ouvrir les candidatures"}</button><button class="btn secondary" id="openRecruitmentControlBtn">Gestion avancée</button></div></div>
    <div class="card admin-feature"><span class="eyebrow">ACCESS CONTROL</span><h3>Permissions</h3><p class="muted">Configure les droits de chaque grade sans modifier app.js.</p><button class="btn" id="openPermissionsBtn">🔐 Permissions</button></div>
    <div class="card admin-feature"><span class="eyebrow">NAVIGATION</span><h3>Menus par grade</h3><p class="muted">Affiche ou masque chaque grande catégorie du menu selon le grade exact de l'officier.</p><button class="btn" id="openNavigationAdminBtn">🧭 Configurer les menus</button></div>
    <div class="card admin-feature"><span class="eyebrow">OPERATIONS</span><h3>CAD & Watch</h3><p class="muted">Unités live, BOLO et Watch Commander sont intégrés au Command Center.</p></div>
    <div class="card admin-feature"><span class="eyebrow">ARCHIVE</span><h3>Archivage</h3><p class="muted">Pour retirer un officier des listes actives sans supprimer son historique, passe son statut à <b>Archivé</b>.</p></div>
  </div>`;
  $("openPermissionsBtn").onclick=()=>render("permissionsAdmin");
  $("openNavigationAdminBtn").onclick=()=>render("navigationAdmin");
  $("openRecruitmentControlBtn").onclick=()=>render("recruitmentControl");
  $("adminRecruitmentToggle").onclick=async()=>{await saveRecruitmentOpenState(!recruitmentSettings.open);await admin();};
}

async function recruitmentControl(){
  if(!hasPerm("recruitment_settings_manage"))return;
  const settings=await getRecruitmentSettings();
  $("content").innerHTML=`<div class="card recruitment-control-panel"><div class="recruitment-control-hero"><div><span class="eyebrow">BUREAU DU RECRUTEMENT</span><h2>Ouverture des candidatures</h2><p>Ce contrôle agit immédiatement sur le portail public et sur les règles Firestore.</p></div><div class="recruitment-open-state large ${settings.open?"open":"closed"}"><b>${settings.open?"🟢 CANDIDATURES OUVERTES":"🔒 CANDIDATURES FERMÉES"}</b><span>${settings.open?"Les nouveaux candidats peuvent créer leur dossier.":"Les nouveaux dépôts sont bloqués."}</span></div></div><div class="recruitment-control-actions"><button class="btn ${settings.open?"danger":""}" id="recruitmentMainToggle">${settings.open?"🔒 Fermer les candidatures":"🟢 Ouvrir les candidatures"}</button></div><div class="security-note"><b>Permission dédiée</b><span>Le droit <code>recruitment_settings_manage</code> peut être accordé depuis Permissions à Captain, Lieutenant ou tout autre grade. La visibilité du groupe Commandement & administration reste également soumise à Menus par grade.</span></div>${settings.updatedByName?`<p class="muted recruitment-last-update">Dernière modification : ${esc(settings.updatedByName)} • ${formatDate(settings.updatedAt)}</p>`:""}</div>`;
  $("recruitmentMainToggle").onclick=async()=>{await saveRecruitmentOpenState(!settings.open);await recruitmentControl();};
}

async function navigationAdmin(){
  if(!isChief())return;
  const users=await getUsers(),cfg=window.LSPD.navigationConfig?.groups?window.LSPD.navigationConfig:defaultNavigationConfig();
  const grades=navigationGradeList();
  const counts=Object.fromEntries(grades.map(g=>[g,users.filter(u=>u.grade===g && u.status!=="Archivé").length]));
  $("content").innerHTML=`<div class="navigation-admin-head card"><div><span class="eyebrow">CHIEF ACCESS CONTROL</span><h2>Visibilité des catégories par grade</h2><p>Décide quels grades voient chacune des grandes catégories du menu gauche. Ce filtre s'ajoute aux permissions existantes : un menu visible ne donne jamais un droit que le grade ne possède pas.</p></div><div class="nav-admin-actions"><button class="btn secondary" id="navResetAll">Réinitialiser</button><button class="btn" id="navSaveAll">Enregistrer</button></div></div><div class="nav-visibility-grid">${Object.entries(NAV_GROUP_LABELS).map(([key,label])=>{const allowed=cfg.groups?.[key]||grades;return `<section class="card nav-visibility-card" data-nav-config-group="${key}"><header><div><span class="eyebrow">CATÉGORIE</span><h3>${esc(label)}</h3></div><div><button class="btn tiny secondary nav-group-all" type="button">Tous</button> <button class="btn tiny secondary nav-group-none" type="button">Aucun</button></div></header><div class="grade-visibility-list">${grades.map(g=>`<label class="grade-visibility-item"><input type="checkbox" value="${esc(g)}" ${allowed.includes(g)?"checked":""}><span><b>${esc(g)}</b><small>${counts[g]||0} membre${counts[g]===1?"":"s"}</small></span></label>`).join("")}</div></section>`}).join("")}</div><div class="card security-note"><b>Important</b><span>Le Chief garde toujours accès à toutes les catégories pour éviter un verrouillage administratif. Mon profil reste accessible à tous. Un membre Inactif reste limité à Profil + Handbook + Annonces ; un membre Suspendu est bloqué.</span></div>`;
  document.querySelectorAll(".nav-visibility-card").forEach(card=>{
    card.querySelector(".nav-group-all").onclick=()=>card.querySelectorAll('input[type="checkbox"]').forEach(c=>c.checked=true);
    card.querySelector(".nav-group-none").onclick=()=>card.querySelectorAll('input[type="checkbox"]').forEach(c=>c.checked=false);
  });
  $("navSaveAll").onclick=()=>saveNavigationVisibility(false);
  $("navResetAll").onclick=async()=>{if(!confirm("Réafficher toutes les catégories à tous les grades ?"))return;window.LSPD.navigationConfig=defaultNavigationConfig();await saveNavigationVisibility(true);navigationAdmin();};
}
async function saveNavigationVisibility(useCurrent=false){
  if(!isChief())return;
  let groups;
  if(useCurrent)groups=window.LSPD.navigationConfig.groups;
  else{
    groups={};
    document.querySelectorAll("[data-nav-config-group]").forEach(card=>{groups[card.dataset.navConfigGroup]=[...card.querySelectorAll('input[type="checkbox"]:checked')].map(c=>c.value);});
  }
  const payload={groups,catalogVersion:1,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()};
  try{await setDoc(doc(db,"settings","navigation_visibility"),payload);window.LSPD.navigationConfig=payload;applyRoleVisibility();showToast("Visibilité des menus enregistrée.","success");}
  catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function history(){
  if(!hasPerm("audit"))return;
  const s=await getDocs(collection(db,"audit_logs")),data=s.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar"><button class="btn secondary" id="exportHistoryBtn">Exporter CSV</button></div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détails</th></tr></thead><tbody>${data.length?data.map(h=>`<tr><td>${formatDate(h.createdAt)}</td><td>${esc(h.actorName)}</td><td>${esc(h.action)}</td><td>${esc(h.details)}</td></tr>`).join(""):'<tr><td colspan="4">Aucun historique.</td></tr>'}</tbody></table></div>`;
  $("exportHistoryBtn").onclick=()=>csvDownload("historique_lspd.csv",data.map(h=>({date:formatDate(h.createdAt),utilisateur:h.actorName,action:h.action,details:h.details})));
}

async function globalSearch(term){
  if(isApplicant()||isInactive())return;
  term=term.trim().toLowerCase();
  if(term.length<2) return;
  try{
    if(isVisitor()){
      const annSnap=await getDocs(query(collection(db,"announcements"),where("visibility","==","Public")));
      const anns=annSnap.docs.map(d=>d.data()).filter(a=>[a.title,a.body,a.authorName].some(v=>String(v||"").toLowerCase().includes(term)));
      showModal(`<h2>Recherche</h2><h3>Annonces publiques</h3>${anns.length?anns.slice(0,10).map(a=>`<div class="search-result"><b>${esc(a.title)}</b><span>${esc(a.authorName)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}<div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
      return;
    }
    const emptySnap={docs:[]};
    const personnelVisible=isNavGroupAllowed("personnel"),trainingVisible=isNavGroupAllowed("training"),communicationVisible=isNavGroupAllowed("communication");
    const usersSnap=personnelVisible?await getDocs(query(collection(db,"users"),where("role","!=","Visiteur"))):emptySnap;
    let evalSnap=emptySnap;
    if(trainingVisible){
      if(hasPerm("personnel_view")) evalSnap=await getDocs(collection(db,"evaluations"));
      else if(hasPerm("fto_tools")) evalSnap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
      else evalSnap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
    }
    const annSnap=communicationVisible?await getDocs(collection(db,"announcements")):emptySnap;
    const incSnap=communicationVisible?(hasPerm("incident_review")
      ? await getDocs(collection(db,"incident_reports"))
      : await getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid)))):emptySnap;

    const users=usersSnap.docs.map(d=>({uid:d.id,...d.data()})).filter(o=>[o.badge,o.name,o.grade,o.role,o.division,o.status].some(v=>String(v||"").toLowerCase().includes(term)));
    const evals=evalSnap.docs.map(d=>({id:d.id,...d.data()})).filter(e=>[e.officerName,e.ftoName,e.moduleCode,e.moduleTitle,e.result].some(v=>String(v||"").toLowerCase().includes(term)));
    const anns=annSnap.docs.map(d=>d.data()).filter(a=>[a.title,a.body,a.authorName].some(v=>String(v||"").toLowerCase().includes(term)));
    const incs=incSnap.docs.map(d=>d.data()).filter(a=>[a.title,a.type,a.authorName,a.status].some(v=>String(v||"").toLowerCase().includes(term)));

    showModal(`<h2>Recherche globale</h2>${personnelVisible?`<h3>Officiers</h3>${users.length?users.slice(0,8).map(o=>`<div class="search-result"><b>${esc(o.badge)} — ${esc(o.name)}</b><span>${esc(o.grade)} • ${esc(o.division||"Patrol")} • ${esc(o.status)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}`:""}${trainingVisible?`<h3>Évaluations accessibles</h3>${evals.length?evals.slice(0,8).map(e=>`<div class="search-result"><b>${esc(e.officerName)} — ${esc(e.moduleCode)}</b><span>${esc(e.result)} • ${esc(e.score)}/100 • FTO ${esc(e.ftoName)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}`:""}${communicationVisible?`<h3>Annonces</h3>${anns.length?anns.slice(0,8).map(a=>`<div class="search-result"><b>${esc(a.title)}</b><span>${esc(a.authorName)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}<h3>Incidents accessibles</h3>${incs.length?incs.slice(0,8).map(a=>`<div class="search-result"><b>${esc(a.title)}</b><span>${esc(a.type)} • ${esc(a.status)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}`:""}<div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
  }catch(err){ console.error(err); }
}

function formatDate(ts){
  if(!ts)return"—";
  try{const d=ts.toDate?ts.toDate():new Date(ts.seconds*1000);return d.toLocaleString(currentLang==="en"?"en-US":"fr-FR",{dateStyle:"short",timeStyle:"short"});}catch{return"—";}
}
function showModal(html){
  document.querySelector(".modal")?.remove();
  document.body.insertAdjacentHTML("beforeend",`<div class="modal"><div class="modalbox">${html}</div></div>`);
  $("closeModal")?.addEventListener("click",()=>document.querySelector(".modal")?.remove());
}

document.addEventListener("DOMContentLoaded",()=>{
  document.documentElement.lang=currentLang;
  document.querySelectorAll("[data-language]").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.language)));
  i18nObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
  setLanguage(currentLang);

  // Phase 17.1 grouped navigation
  initNavGroups();

  // Phase 14 UX controls
  document.body.classList.toggle("sidebar-collapsed",localStorage.getItem("lspdSidebarCollapsed")==="1");
  $("sidebarCollapseBtn")?.addEventListener("click",()=>toggleSidebar());
  $("mobileMenuBtn")?.addEventListener("click",()=>toggleMobileSidebar());
  $("sidebarBackdrop")?.addEventListener("click",()=>toggleMobileSidebar(false));
  $("commandPaletteBtn")?.addEventListener("click",openCommandPalette);
  $("notificationBellBtn")?.addEventListener("click",e=>{e.stopPropagation();toggleNotificationDropdown();});
  $("closeNotificationDropdown")?.addEventListener("click",e=>{e.stopPropagation();closeNotificationDropdown();});
  $("markAllDropdownNotificationsBtn")?.addEventListener("click",e=>{e.stopPropagation();markAllDropdownNotifications();});
  $("notificationDropdown")?.addEventListener("click",e=>e.stopPropagation());
  document.addEventListener("click",()=>closeNotificationDropdown());
  document.addEventListener("keydown",e=>{
  if(e.key==="Escape") document.querySelector(".viewer-modal")?.remove();
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="k"){e.preventDefault();openCommandPalette();}
    if(e.key==="Escape" && document.body.classList.contains("sidebar-open")) toggleMobileSidebar(false);
    if(e.key==="Escape"){closeNotificationDropdown();closeMailWindow();}
  });
  updateClock();
  setInterval(updateClock,15000);

  $("loginForm")?.addEventListener("submit",handleLogin);
  $("signupForm")?.addEventListener("submit",handleSignup);
  $("applicationForm")?.addEventListener("submit",handleRecruitmentApplication);
  initRecruitmentPublicWizard();
  startPublicRecruitmentAvailabilityWatch();
  $("showLoginBtn")?.addEventListener("click",()=>toggleAuthMode("login"));
  $("showSignupBtn")?.addEventListener("click",()=>toggleAuthMode("signup"));
  $("showApplicationBtn")?.addEventListener("click",()=>toggleAuthMode("apply"));
  $("approvalLogoutBtn")?.addEventListener("click",logout);
  $("passwordChangeForm")?.addEventListener("submit",handleImportedPasswordChange);
  $("passwordChangeLogoutBtn")?.addEventListener("click",logout);
  $("logoutBtn")?.addEventListener("click",logout);
  $("nav")?.addEventListener("click",e=>{const b=e.target.closest("button[data-page]");if(b)render(b.dataset.page);});
  let timer;
  $("globalSearch")?.addEventListener("input",e=>{
    clearTimeout(timer);
    if(e.target.value.trim().length<2) return;
    timer=setTimeout(()=>globalSearch(e.target.value),450);
  });
});
