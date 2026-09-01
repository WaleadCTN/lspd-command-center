// LSPD Command Center — Phase 14+15 UI/UX + CAD + Dynamic Permissions — Phase 12+13 fully preserved

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, onSnapshot,
  collection, query, where, serverTimestamp
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

window.LSPD = { auth, db, storage, user:null, profile:null, permissionConfig:null, pageCleanup:null, currentPage:"dashboard" };

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

Object.assign(I18N_EN,{"BOLO / Avis":"BOLO / Alerts","CAD / Dispatch":"CAD / Dispatch","Watch Commander":"Watch Commander","Permissions":"Permissions","Réduire le menu":"Collapse menu","Navigation rapide":"Quick navigation","Accès refusé":"Access denied","Cette fonction n'est pas autorisée pour ton rôle.":"This feature is not allowed for your role.","Permissions & rôles":"Permissions & roles","Les permissions sont enregistrées dans Firestore. Le Chief peut les modifier ici sans changer le code.":"Permissions are stored in Firestore. The Chief can edit them here without changing code.","Enregistrer les permissions":"Save permissions","Réinitialiser les valeurs par défaut":"Reset defaults","Permission":"Permission","Lecture / gestion FTO":"FTO tools","Voir tous les officiers":"View all officers","Modifier les profils officiers":"Manage officer profiles","Voir les affectations FTO":"View FTO assignments","Gérer les affectations FTO":"Manage FTO assignments","Voir les certifications":"View certifications","Gérer les certifications":"Manage certifications","Voir les dossiers RH":"View personnel records","Gérer les dossiers RH":"Manage personnel records","Voir tous les shifts":"View all shifts","Gérer les shifts":"Manage shifts","Voir le tableau de service":"View duty board","Valider les congés":"Review leave","Gérer les formations":"Manage training","Valider les incidents":"Review incidents","Gérer le MDT":"Manage MDT","Valider les candidatures divisions":"Review division applications","Voir les promotions":"View promotions","Gérer les promotions":"Manage promotions","Statistiques & Promotion Advisor":"Statistics & Promotion Advisor","Voir l'historique audit":"View audit history","Publier des annonces":"Publish announcements","Valider les inscriptions":"Review registrations","Gérer toutes les unités CAD":"Manage all CAD units","Gérer les BOLO":"Manage BOLOs","Gérer Watch Commander":"Manage Watch Commander","Permissions enregistrées.":"Permissions saved.","Valeurs par défaut restaurées.":"Default values restored.","Le Chief conserve toujours tous les droits.":"The Chief always keeps all permissions.","Unité CAD":"CAD unit","Mon unité":"My unit","Toutes les unités":"All units","Indicatif":"Call sign","Partenaire":"Partner","Localisation":"Location","État":"Status","Note opérationnelle":"Operational note","Disponible":"Available","En intervention":"On call","Transport":"Transport","Pause":"Break","Hors service":"Off duty","Créer mon unité":"Create my unit","Mettre à jour":"Update","Actualisé":"Updated","Aucune unité active.":"No active units.","BOLO actifs":"Active BOLOs","+ Nouveau BOLO":"+ New BOLO","Personne":"Person","Véhicule":"Vehicle","Plaque":"Plate","Description":"Description","Actif":"Active","Clôturé":"Closed","Clôturer le BOLO":"Close BOLO","Aucun BOLO actif.":"No active BOLO.","Nouveau BOLO":"New BOLO","Publier le BOLO":"Publish BOLO","Priorité":"Priority","Critique":"Critical","Watch en cours":"Current watch","Aucun Watch Commander actif.":"No active Watch Commander.","Démarrer un watch":"Start a watch","Commander":"Commander","Briefing":"Briefing","Démarrer le service":"Start watch","Clôturer le watch":"Close watch","Note de passation":"Pass-down note","Historique des watches":"Watch history","Service actif":"Active watch","Service clôturé":"Closed watch","Tape une page...":"Type a page...","Aucune page trouvée.":"No page found.","Interface améliorée":"Improved interface","En direct":"Live"});
Object.assign(I18N_FR,{"Command Center":"Centre de commandement","Training & Operations":"Formation & opérations"});

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
["PO1","Police Officer I","Applique les procédures sous supervision."],
["PO2","Police Officer II","Officier autonome sur les missions courantes."],
["PO3","Police Officer III","Officier expérimenté, senior et mentor."],
["Sergent","Sergent","Premier niveau de supervision."],
["Lieutenant","Lieutenant","Supervise plusieurs équipes et opérations."],
["Captain","Captain","Responsable d'une division ou unité."],
["Deputy Chief","Deputy Chief","Supervise plusieurs divisions."],
["Assistant Chief","Assistant Chief","Direction stratégique du département."],
["Chief of Police","Chief of Police","Autorité finale du département."]
];

const roles = ["Officer","FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"];
const statuses = ["Actif","En formation","Suspendu","Inactif","Archivé","En attente","Refusé"];
const divisions = ["Patrol","Traffic","Detective","SWAT","Air Support","Training","Command"];
const certificationsCatalog = ["FTO","Pursuit","Traffic","Detective","SWAT","Air Support","Supervisor"];
const incidentTypes = ["Use of Force","Vehicle Pursuit","Arrestation sensible","Accident service","Plainte citoyen","Incident interne","Autre"];

const PERMISSION_CATALOG = [
  ["fto_tools","Lecture / gestion FTO"],
  ["personnel_view","Voir tous les officiers"],
  ["personnel_manage","Modifier les profils officiers"],
  ["fto_assignments_view","Voir les affectations FTO"],
  ["fto_assignments_manage","Gérer les affectations FTO"],
  ["certifications_view","Voir les certifications"],
  ["certifications_manage","Gérer les certifications"],
  ["records_view","Voir les dossiers RH"],
  ["records_manage","Gérer les dossiers RH"],
  ["shifts_view","Voir tous les shifts"],
  ["shifts_manage","Gérer les shifts"],
  ["duty_board","Voir le tableau de service"],
  ["leave_review","Valider les congés"],
  ["training_manage","Gérer les formations"],
  ["incident_review","Valider les incidents"],
  ["mdt_manage","Gérer le MDT"],
  ["division_review","Valider les candidatures divisions"],
  ["promotions_view","Voir les promotions"],
  ["promotions_manage","Gérer les promotions"],
  ["analytics","Statistiques & Promotion Advisor"],
  ["audit","Voir l'historique audit"],
  ["announcements_manage","Publier des annonces"],
  ["registrations_manage","Valider les inscriptions"],
  ["cad_manage","Gérer toutes les unités CAD"],
  ["bolo_manage","Gérer les BOLO"],
  ["watch_manage","Gérer Watch Commander"]
];

const DEFAULT_PERMISSIONS = {
  Officer: [],
  FTO: ["fto_tools","training_manage"],
  Sergeant: ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage"],
  Lieutenant: ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage"],
  Captain: ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage"],
  "Deputy Chief": ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage"],
  "Assistant Chief": ["fto_tools","personnel_view","fto_assignments_view","certifications_view","records_view","shifts_view","duty_board","leave_review","training_manage","incident_review","mdt_manage","promotions_view","analytics","audit","announcements_manage","cad_manage","bolo_manage","watch_manage"],
  Chief: PERMISSION_CATALOG.map(x=>x[0])
};

const PAGE_PERMISSIONS = {
  registrations:"registrations_manage",
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
  history:"audit"
};

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

const pages = {
 dashboard:"Dashboard",profile:"Mon profil",mySpace:"Mon espace opérationnel",registrations:"Inscriptions",notifications:"Notifications",announcements:"Annonces",messages:"Messages",
 incidents:"Rapports d'incident",approvals:"Validations",mdt:"MDT / Dossiers",bolos:"BOLO / Avis",corrections:"Corrections & addenda",manual:"Manuel FTO",modules:"Formations",
 evaluations:"Évaluations",trainees:"Mes recrues",officers:"Officiers",assignments:"Affectations FTO",
 certifications:"Certifications",records:"Dossiers & distinctions",shifts:"Roster & shifts",dutyBoard:"Tableau de service",cad:"CAD / Dispatch",watchCommand:"Watch Commander",leave:"Congés",
 calendar:"Calendrier formations",trainingHub:"Inscriptions formations",requirements:"À valider",promotionAdvisor:"Promotion advisor",
 promotions:"Promotions",stats:"Statistiques",divisionsPage:"Divisions & candidatures",grades:"Grades & responsabilités",
 scenarios:"Scénarios",admin:"Admin",permissionsAdmin:"Permissions",history:"Historique"
};

function role(){ return window.LSPD.profile?.role; }
function isChief(){ return role()==="Chief"; }
function isFTO(){ return ["FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }
function isCommand(){ return ["Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }
function canApproveIncidents(){ return isCommand(); }
function isSeniorCommand(){ return ["Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }

function permissionRoles(){
  return window.LSPD.permissionConfig?.roles || DEFAULT_PERMISSIONS;
}
function hasPerm(permission){
  if(isChief()) return true;
  const list=permissionRoles()[role()] || DEFAULT_PERMISSIONS[role()] || [];
  return Array.isArray(list) && list.includes(permission);
}
function canAccessPage(page){
  if(page==="permissionsAdmin" || page==="admin") return isChief();
  const needed=PAGE_PERMISSIONS[page];
  return needed ? hasPerm(needed) : true;
}
async function loadPermissionsConfig(){
  try{
    const ref=doc(db,"settings","permissions");
    const snap=await getDoc(ref);
    if(snap.exists() && snap.data()?.roles){
      window.LSPD.permissionConfig=snap.data();
      return;
    }
    window.LSPD.permissionConfig={roles:JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))};
    if(isChief()){
      await setDoc(ref,{
        roles:JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
        updatedById:window.LSPD.user.uid,
        updatedByName:window.LSPD.profile.name,
        updatedAt:serverTimestamp()
      });
    }
  }catch(err){
    console.warn("Permission configuration fallback",err);
    window.LSPD.permissionConfig={roles:JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))};
  }
}

async function loadProfile(user){
  window.LSPD.user=user;
  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    if(!snap.exists()){
      window.LSPD.profile={name:"Profil incomplet",badge:"—",grade:"PO1",role:"Officer",status:"Profil manquant"};
      showApprovalGate("Profil incomplet","Ton compte Authentication existe, mais aucun profil LSPD valide n'est associé. Contacte le Chief of Police.");
      return;
    }
    window.LSPD.profile=snap.data();
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

  await loadPermissionsConfig();
  showApp();
  applyRoleVisibility();
  refreshNotificationBadge().catch(()=>{});
  refreshRegistrationBadge().catch(()=>{});
  generateUpcomingReminders().catch(()=>{});
  render("dashboard");
}
function showApp(){
  $("loginScreen")?.classList.add("hidden");
  $("approvalScreen")?.classList.add("hidden");
  $("appShell")?.classList.remove("hidden");
  if($("currentUser")) $("currentUser").textContent=window.LSPD.user?.email||"Connecté";
  if($("userPill")) $("userPill").textContent=`${window.LSPD.profile?.grade||"Officer"} • ${window.LSPD.profile?.role||"Officer"}`;
}
function showLogin(){
  $("approvalScreen")?.classList.add("hidden");
  $("loginScreen")?.classList.remove("hidden");
  $("appShell")?.classList.add("hidden");
}
function showApprovalGate(title,message){
  $("loginScreen")?.classList.add("hidden");
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
  const signup=mode==="signup";
  $("loginForm")?.classList.toggle("hidden",signup);
  $("signupForm")?.classList.toggle("hidden",!signup);
  $("showLoginBtn")?.classList.toggle("active",!signup);
  $("showSignupBtn")?.classList.toggle("active",signup);
  if($("loginError")) $("loginError").textContent="";
  if($("signupError")) $("signupError").textContent="";
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
onAuthStateChanged(auth,async user=>{
  if(!user){window.LSPD.pageCleanup?.();window.LSPD.pageCleanup=null;window.LSPD.user=null;window.LSPD.profile=null;window.LSPD.permissionConfig=null;showLogin();return;}
  await loadProfile(user);
});
function logout(){ return signOut(auth); }

function applyRoleVisibility(){
  document.querySelectorAll("#nav button[data-page]").forEach(btn=>{
    btn.classList.toggle("hidden",!canAccessPage(btn.dataset.page));
  });
}

function render(page){
  if(!canAccessPage(page)){
    showToast("Cette fonction n'est pas autorisée pour ton rôle.","error");
    page="dashboard";
  }
  if(window.LSPD.pageCleanup){
    try{window.LSPD.pageCleanup();}catch{}
    window.LSPD.pageCleanup=null;
  }
  window.LSPD.currentPage=page;
  document.body.classList.remove("sidebar-open");
  $("sidebarBackdrop")?.classList.add("hidden");
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("pageTitle").textContent=pages[page]||"LSPD";
  const content=$("content");
  content?.classList.remove("page-enter");
  ({
    dashboard,profile,mySpace,registrations,notifications,announcements,messages,incidents,approvals,mdt,bolos,corrections,manual,modules:modulesPage,evaluations,trainees,officers,assignments,
    certifications,records,shifts,dutyBoard,cad,watchCommand,leave,calendar,trainingHub,requirements,promotionAdvisor,promotions,
    stats,divisionsPage,grades:gradesPage,scenarios:scenariosPage,admin,permissionsAdmin,history
  }[page]||dashboard)();
  requestAnimationFrame(()=>content?.classList.add("page-enter"));
}

async function getUser(uid){
  const s=await getDoc(doc(db,"users",uid));
  return s.exists()?{uid,...s.data()}:null;
}
async function getUsers(){
  const s=await getDocs(collection(db,"users"));
  return s.docs.map(d=>({uid:d.id,...d.data()}));
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



async function refreshRegistrationBadge(){
  if(!isChief()) return;
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
  if(!hasPerm("registrations_manage")) return;
  try{
    const snap=await getDocs(collection(db,"users"));
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
        <td>${esc(u.grade||"PO1")} • ${esc(u.role||"Officer")} • ${esc(u.division||"Patrol")}</td>
        <td>
          <button class="btn approve-registration" data-uid="${u.uid}">${u.status==="Refusé"?"Réexaminer":"Approuver"}</button>
          ${u.status==="En attente"?`<button class="btn secondary reject-registration" data-uid="${u.uid}">Refuser</button>`:""}
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
  if(!hasPerm("registrations_manage")) return;
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
        <label class="field"><span>Grade</span><select id="regGrade">${gradeList.map(g=>`<option ${g[0]===(u.grade||"PO1")?"selected":""}>${g[0]}</option>`).join("")}</select></label>
        <label class="field"><span>Rôle</span><select id="regRole">${roles.map(r=>`<option ${r===(u.role||"Officer")?"selected":""}>${r}</option>`).join("")}</select></label>
        <label class="field"><span>Division</span><select id="regDivision">${divisions.map(d=>`<option ${d===(u.division||"Patrol")?"selected":""}>${d}</option>`).join("")}</select></label>
      </div>
      <div id="regError" class="error"></div>
      <div class="modal-actions">
        <button class="btn" type="submit">Valider l'inscription</button>
        <button class="btn secondary" type="button" id="closeModal">Annuler</button>
      </div>
    </form>`);

  $("registrationApprovalForm").onsubmit=approveRegistration;
}

async function approveRegistration(e){
  e.preventDefault();
  if(!hasPerm("registrations_manage")) return;
  const uid=$("regUid").value;
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
  if(!hasPerm("registrations_manage")) return;
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

async function createNotification(recipientId,title,body,type="Info",linkPage=""){
  if(!recipientId || recipientId===window.LSPD.user?.uid) return;
  await addDoc(collection(db,"notifications"),{
    recipientId,
    senderId:window.LSPD.user.uid,
    senderName:window.LSPD.profile.name,
    title,body,type,linkPage,
    read:false,
    createdAt:serverTimestamp()
  });
}

async function refreshNotificationBadge(){
  if(!window.LSPD.user) return;
  try{
    const snap=await getDocs(query(collection(db,"notifications"),where("recipientId","==",window.LSPD.user.uid)));
    const unread=snap.docs.map(d=>d.data()).filter(n=>n.read!==true).length;
    const el=$("notificationCount");
    if(el){
      el.textContent=unread?String(unread):"";
      el.classList.toggle("hidden",!unread);
    }
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

async function markNotificationRead(id){
  await updateDoc(doc(db,"notifications",id),{read:true,readAt:serverTimestamp()});
  await refreshNotificationBadge();
  notifications();
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
    const [shiftSnap,certSnap,recordSnap,leaveSnap,regSnap,eventSnap]=await Promise.all([
      getDocs(query(collection(db,"shifts"),where("officerId","==",uid))),
      getDocs(query(collection(db,"certifications"),where("officerId","==",uid))),
      getDocs(query(collection(db,"personnel_records"),where("officerId","==",uid))),
      getDocs(query(collection(db,"leave_requests"),where("officerId","==",uid))),
      getDocs(query(collection(db,"training_registrations"),where("officerId","==",uid))),
      getDocs(collection(db,"training_events"))
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
      isFTO()||isCommand()
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
          ${mine?`<span class="tag green">${esc(mine.attendanceStatus||mine.status||"Inscrit")}</span> ${mine.status!=="Annulée"?`<button class="btn secondary training-cancel" data-reg="${mine.id}">Annuler mon inscription</button>`:""}`:
          `<button class="btn ${full?"secondary":""} training-register" data-event="${e.id}" data-title="${esc(e.title)}" ${full?"disabled":""}>${full?"Complet":"S'inscrire"}</button>`}
          ${hasPerm("training_manage")?`<button class="btn secondary training-attendance" data-event="${e.id}">Gérer les présences</button>`:""}
        </div>
      </div>`;
    }).join(""):'<div class="card">Aucune formation planifiée.</div>'}</div>`;

    document.querySelectorAll(".training-register").forEach(b=>b.onclick=()=>registerTraining(b.dataset.event,b.dataset.title));
    document.querySelectorAll(".training-cancel").forEach(b=>b.onclick=()=>cancelTrainingRegistration(b.dataset.reg));
    document.querySelectorAll(".training-attendance").forEach(b=>b.onclick=()=>openTrainingAttendance(b.dataset.event));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function registerTraining(eventId,title){
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
  try{
    await updateDoc(doc(db,"training_registrations",regId),{status:"Annulée",attendanceStatus:"Inscription annulée",cancelledAt:serverTimestamp()});
    await addAudit("TRAINING_CANCEL_REGISTRATION",regId,window.LSPD.profile.name);
    trainingHub();
  }catch(err){ alert("Erreur : "+(err.code||err.message)); }
}

async function openTrainingAttendance(eventId){
  if(!hasPerm("training_manage")) return;
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
  try{
    const [caseSnap,incidentSnap]=await Promise.all([
      getDocs(collection(db,"case_files")),
      isCommand()?getDocs(collection(db,"incident_reports")):getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid)))
    ]);
    const cases=caseSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const incidentsData=incidentSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));

    $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newCaseBtn">+ Nouveau dossier</button><input id="mdtSearch" class="search" placeholder="Recherche globale..."></div>
      <div class="section-title">Dossiers d'enquête</div>
      <div class="card table-card"><table class="table"><thead><tr><th>Numéro</th><th>Titre</th><th>Catégorie</th><th>Auteur</th><th>Statut</th>${hasPerm("mdt_manage")?"<th>Action</th>":""}</tr></thead><tbody id="mdtCaseRows">${renderCaseRows(cases)}</tbody></table></div>
      <div class="section-title">Rapports accessibles</div>
      <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Auteur</th><th>Type</th><th>Titre</th><th>Statut</th></tr></thead><tbody>${incidentsData.length?incidentsData.slice(0,30).map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.authorName)}</td><td>${esc(r.type)}</td><td>${esc(r.title)}</td><td>${esc(r.status)}</td></tr>`).join(""):'<tr><td colspan="5">Aucun rapport.</td></tr>'}</tbody></table></div>`;

    $("newCaseBtn").onclick=openCaseForm;
    $("mdtSearch").oninput=e=>{
      const q=e.target.value.toLowerCase();
      $("mdtCaseRows").innerHTML=renderCaseRows(cases.filter(c=>[c.caseNumber,c.title,c.category,c.createdByName,c.status,c.summary].some(v=>String(v||"").toLowerCase().includes(q))));
      bindCaseButtons();
    };
    bindCaseButtons();

    function renderCaseRows(rows){
      return rows.length?rows.map(c=>`<tr><td>${esc(c.caseNumber)}</td><td><b>${esc(c.title)}</b><div class="muted">${esc(c.summary||"")}</div></td><td>${esc(c.category)}</td><td>${esc(c.createdByName)}</td><td><span class="tag ${c.status==="Clos"?"green":"orange"}">${esc(c.status)}</span></td>${hasPerm("mdt_manage")?`<td>${c.status!=="Clos"?`<button class="btn secondary close-case" data-id="${c.id}">Clôturer le dossier</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucun dossier MDT.</td></tr>';
    }
    function bindCaseButtons(){
      document.querySelectorAll(".close-case").forEach(b=>b.onclick=()=>closeCase(b.dataset.id));
    }
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}
function openCaseForm(){
  showModal(`<h2>Nouveau dossier MDT</h2><form id="caseForm"><div class="formgrid">
    <label class="field"><span>Titre</span><input id="caseTitle" required></label>
    <label class="field"><span>Catégorie</span><select id="caseCategory">${caseCategories.map(c=>`<option>${c}</option>`).join("")}</select></label>
    </div><label class="field full"><span>Résumé</span><textarea id="caseSummary" rows="6" required></textarea></label>
    <div id="caseError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Créer le dossier</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("caseForm").onsubmit=saveCase;
}
async function saveCase(e){
  e.preventDefault();
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
  if(!hasPerm("mdt_manage")) return;
  try{
    await updateDoc(doc(db,"case_files",id),{status:"Clos",closedById:window.LSPD.user.uid,closedByName:window.LSPD.profile.name,closedAt:serverTimestamp()});
    await addAudit("CASE_CLOSE",id,"Clos");
    mdt();
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
    if(isCommand()){
      const users=await getUsers();
      for(const d of divisions) counts[d]=users.filter(u=>u.division===d && !["Archivé","Refusé","En attente"].includes(u.status)).length;
    }
    $("content").innerHTML=`<div class="card"><div class="muted">Ma division actuelle</div><div class="stat">${esc(window.LSPD.profile.division||"Patrol")}</div></div>
      <div class="section-title">Divisions</div><div class="grid division-grid">${divisionInfo.map(d=>`<div class="card"><h3>${esc(d[0])}</h3><p class="muted">${esc(d[1])}</p>${isCommand()?`<div class="row"><span>Effectif actuel</span><b>${counts[d[0]]||0}</b></div>`:""}${d[0]!==window.LSPD.profile.division?`<button class="btn secondary division-apply" data-division="${esc(d[0])}">Candidater</button>`:""}</div>`).join("")}</div>
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
  const rolesMap=permissionRoles();
  $("content").innerHTML=`<div class="card permission-hero">
    <div><span class="eyebrow">SECURITY & ACCESS</span><h2>Permissions & rôles</h2>
    <p class="muted">Les permissions sont enregistrées dans Firestore. Le Chief peut les modifier ici sans changer le code.</p></div>
    <div class="shield-mark">🔐</div>
  </div>
  <div class="toolbar permission-toolbar">
    <button class="btn" id="savePermissionsBtn">Enregistrer les permissions</button>
    <button class="btn secondary" id="resetPermissionsBtn">Réinitialiser les valeurs par défaut</button>
    <span class="muted">Le Chief conserve toujours tous les droits.</span>
  </div>
  <div class="card table-card permission-table-card"><table class="table permission-table"><thead><tr><th>Permission</th>${roles.map(r=>`<th>${esc(r)}</th>`).join("")}</tr></thead><tbody>
  ${PERMISSION_CATALOG.map(([key,label])=>`<tr><td><b>${esc(label)}</b><small>${esc(key)}</small></td>${roles.map(r=>{
    const checked=r==="Chief" || (rolesMap[r]||[]).includes(key);
    return `<td><label class="permission-check"><input type="checkbox" data-role="${esc(r)}" data-permission="${esc(key)}" ${checked?"checked":""} ${r==="Chief"?"disabled":""}><span></span></label></td>`;
  }).join("")}</tr>`).join("")}
  </tbody></table></div>`;
  $("savePermissionsBtn").onclick=savePermissions;
  $("resetPermissionsBtn").onclick=resetPermissionsDefaults;
}
async function savePermissions(){
  if(!isChief()) return;
  const rolesMap={};
  for(const r of roles){
    rolesMap[r]=r==="Chief"?PERMISSION_CATALOG.map(x=>x[0]):
      [...document.querySelectorAll(`input[data-role="${CSS.escape(r)}"][data-permission]:checked`)].map(x=>x.dataset.permission);
  }
  try{
    await setDoc(doc(db,"settings","permissions"),{
      roles:rolesMap,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()
    });
    window.LSPD.permissionConfig={roles:rolesMap};
    await addAudit("PERMISSIONS_UPDATED","settings/permissions","Permissions & rôles");
    applyRoleVisibility();
    showToast("Permissions enregistrées.","success");
  }catch(err){ showToast("Erreur : "+(err.code||err.message),"error"); }
}
async function resetPermissionsDefaults(){
  if(!isChief()) return;
  if(!confirm("Réinitialiser les valeurs par défaut ?")) return;
  try{
    const rolesMap=JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
    await setDoc(doc(db,"settings","permissions"),{
      roles:rolesMap,updatedById:window.LSPD.user.uid,updatedByName:window.LSPD.profile.name,updatedAt:serverTimestamp()
    });
    window.LSPD.permissionConfig={roles:rolesMap};
    showToast("Valeurs par défaut restaurées.","success");
    permissionsAdmin();
  }catch(err){showToast("Erreur : "+(err.code||err.message),"error");}
}

async function cad(){
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
    try{users=(await getUsers()).filter(u=>!["Archivé","Refusé","En attente"].includes(u.status));}catch{}
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

async function dashboard(){
  const p=window.LSPD.profile;
  let evals=[]; try{evals=await getMyEvaluations();}catch{}
  const validated=[...new Set(evals.filter(e=>e.result==="Validé").map(e=>e.moduleCode))];
  const pct=Math.round(validated.length/modules.length*100);
  let extra="";

  if(isCommand()){
    try{
      const [usersSnap,leaveSnap,shiftSnap,evalSnap]=await Promise.all([
        getDocs(collection(db,"users")),
        getDocs(collection(db,"leave_requests")),
        getDocs(collection(db,"shifts")),
        getDocs(collection(db,"evaluations"))
      ]);
      const users=usersSnap.docs.map(d=>d.data());
      const pending=leaveSnap.docs.map(d=>d.data()).filter(x=>x.status==="En attente").length;
      const today=new Date().toISOString().slice(0,10);
      const todayShifts=shiftSnap.docs.map(d=>d.data()).filter(x=>x.date===today).length;
      const active=users.filter(u=>u.status==="Actif").length;
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
    <div class="card"><h3>Dossier</h3><p><b>${esc(p?.name)}</b></p><p class="muted">${esc(window.LSPD.user?.email)}</p><p class="muted">${isFTO()?"Accès FTO/Command actif":"Accès Officer"}</p></div>
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
    const snap=await getDocs(collection(db,"announcements"));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar">${hasPerm("announcements_manage")?'<button class="btn" id="newAnnouncementBtn">+ Nouvelle annonce</button>':""}</div>
    <div class="grid2">${data.length?data.map(a=>`<div class="card notice ${a.active===false?"muted-card":""}"><span class="tag ${a.priority==="Urgent"?"red":a.priority==="Important"?"orange":""}">${esc(a.priority||"Normal")}</span><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><p class="muted">${esc(a.authorName)} • ${formatDate(a.createdAt)}</p></div>`).join(""):'<div class="card"><p class="muted">Aucune annonce.</p></div>'}</div>`;
    $("newAnnouncementBtn")?.addEventListener("click",openAnnouncementForm);
  }catch(err){ $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`; }
}
function openAnnouncementForm(){
  showModal(`<h2>Nouvelle annonce</h2><form id="announcementForm"><label class="field"><span>Titre</span><input id="anTitle" required></label><label class="field"><span>Priorité</span><select id="anPriority"><option>Normal</option><option>Important</option><option>Urgent</option></select></label><label class="field full"><span>Message</span><textarea id="anBody" rows="6" required></textarea></label><div id="anError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Publier</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("announcementForm").onsubmit=saveAnnouncement;
}
async function saveAnnouncement(e){
  e.preventDefault();
  try{
    await addDoc(collection(db,"announcements"),{title:$("anTitle").value.trim(),priority:$("anPriority").value,body:$("anBody").value.trim(),authorId:window.LSPD.user.uid,authorName:window.LSPD.profile.name,active:true,createdAt:serverTimestamp()});
    await addAudit("ANNOUNCEMENT_CREATE","announcement",$("anTitle").value.trim());
    try{
      const users=(await getUsers()).filter(u=>u.uid!==window.LSPD.user.uid && u.status!=="Archivé");
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

async function messages(){
  try{
    const users=await getUsers();
    const [sentSnap,receivedSnap]=await Promise.all([
      getDocs(query(collection(db,"messages"),where("senderId","==",window.LSPD.user.uid))),
      getDocs(query(collection(db,"messages"),where("recipientId","==",window.LSPD.user.uid)))
    ]);
    const map=new Map();
    [...sentSnap.docs,...receivedSnap.docs].forEach(d=>map.set(d.id,{id:d.id,...d.data()}));
    const data=[...map.values()].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newMessageBtn">+ Nouveau message</button></div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>De</th><th>À</th><th>Sujet</th><th>Message</th></tr></thead><tbody>${data.length?data.map(m=>`<tr><td>${formatDate(m.createdAt)}</td><td>${esc(m.senderName)}</td><td>${esc(m.recipientName)}</td><td>${esc(m.subject)}</td><td>${esc(m.body)}</td></tr>`).join(""):'<tr><td colspan="5">Aucun message.</td></tr>'}</tbody></table></div>`;
    $("newMessageBtn").onclick=()=>openMessageForm(users);
  }catch(err){ $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`; }
}
function openMessageForm(users){
  showModal(`<h2>Nouveau message</h2><form id="messageForm"><label class="field"><span>Destinataire</span><select id="mRecipient">${users.filter(u=>u.uid!==window.LSPD.user.uid&&u.status!=="Archivé").map(u=>`<option value="${u.uid}" data-name="${esc(u.name)}">${esc(u.badge)} — ${esc(u.name)}</option>`).join("")}</select></label><label class="field"><span>Sujet</span><input id="mSubject" required></label><label class="field full"><span>Message</span><textarea id="mBody" rows="6" required></textarea></label><div id="mError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Envoyer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("messageForm").onsubmit=saveMessage;
}
async function saveMessage(e){
  e.preventDefault(); const sel=$("mRecipient");
  if(!sel?.value){ $("mError").textContent="Aucun destinataire disponible."; return; }
  try{
    await addDoc(collection(db,"messages"),{senderId:window.LSPD.user.uid,senderName:window.LSPD.profile.name,recipientId:sel.value,recipientName:sel.selectedOptions[0].dataset.name,subject:$("mSubject").value.trim(),body:$("mBody").value.trim(),createdAt:serverTimestamp()});
    await createNotification(sel.value,`Nouveau message : ${$("mSubject").value.trim()}`,`Message de ${window.LSPD.profile.name}`,"Message","messages");
    document.querySelector(".modal")?.remove(); messages();
    refreshNotificationBadge().catch(()=>{});
  }catch(err){ $("mError").textContent="Erreur : "+(err.code||err.message); }
}

async function incidents(){
  try{
    const snap=isCommand()
      ? await getDocs(collection(db,"incident_reports"))
      : await getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid)));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newIncidentBtn">+ Nouveau rapport</button>${isCommand()?'<button class="btn secondary" id="exportIncidentsBtn">Exporter CSV</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Auteur</th><th>Type</th><th>Titre</th><th>Pièces</th><th>Statut</th><th>Validation</th></tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.authorName)}</td><td>${esc(r.type)}</td><td>${esc(r.title)}</td><td>${(r.attachments||[]).length}</td><td><span class="tag ${r.status==="Approuvé"?"green":r.status==="Refusé"?"red":"orange"}">${esc(r.status)}</span></td><td>${esc(r.approvedByName||"—")}</td></tr>`).join(""):'<tr><td colspan="7">Aucun rapport.</td></tr>'}</tbody></table></div>`;
    $("newIncidentBtn").onclick=openIncidentForm;
    $("exportIncidentsBtn")?.addEventListener("click",()=>csvDownload("incidents_lspd.csv",data.map(r=>({date:formatDate(r.createdAt),auteur:r.authorName,type:r.type,titre:r.title,statut:r.status,validation:r.approvedByName||""}))));
  }catch(err){ $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`; }
}
function openIncidentForm(){
  showModal(`<h2>Nouveau rapport d'incident</h2><form id="incidentForm"><div class="formgrid"><label class="field"><span>Type</span><select id="iType">${incidentTypes.map(x=>`<option>${x}</option>`).join("")}</select></label><label class="field"><span>Titre</span><input id="iTitle" required></label></div><label class="field full"><span>Résumé</span><textarea id="iSummary" rows="4" required></textarea></label><label class="field full"><span>Détails</span><textarea id="iDetails" rows="8" required></textarea></label><label class="field full"><span>Pièces jointes (optionnel : images/PDF, max 10 Mo par fichier)</span><input id="iAttachments" type="file" multiple accept="image/*,.pdf,application/pdf"></label><div id="iError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Soumettre pour validation</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("incidentForm").onsubmit=saveIncident;
}
async function saveIncident(e){
  e.preventDefault();
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
    $("content").innerHTML=`<div class="grid2">${data.length?data.map(r=>`<div class="card"><span class="number">${esc(r.type)}</span><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p><p class="muted">Par ${esc(r.authorName)} • ${formatDate(r.createdAt)}</p><div class="approval-box"><p>${esc(r.details)}</p>${(r.attachments||[]).length?`<div class="attachment-list">${r.attachments.map(a=>`<a class="attachment-link" href="${esc(a.url)}" target="_blank" rel="noopener">📎 ${esc(a.name)}</a>`).join("")}</div>`:""}</div><div class="modal-actions><button class="btn approve-incident" data-id="${r.id}" data-status="Approuvé">Approuver</button><button class="btn secondary approve-incident" data-id="${r.id}" data-status="Refusé">Refuser</button></div></div>`).join(""):'<div class="card">Aucune validation en attente.</div>'}</div>`;
    document.querySelectorAll(".approve-incident").forEach(b=>b.onclick=()=>reviewIncident(b.dataset.id,b.dataset.status));
  }catch(err){ $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`; }
}
async function reviewIncident(id,status){
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
  try{
    const snap=isCommand()
      ? await getDocs(collection(db,"correction_requests"))
      : await getDocs(query(collection(db,"correction_requests"),where("requestedById","==",window.LSPD.user.uid)));
    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newCorrectionBtn">+ Demander une correction</button></div>
    <div class="card"><p class="muted">Les documents d'origine restent intacts. Une correction approuvée crée un <b>addendum</b> traçable.</p></div>
    <div class="card table-card" style="margin-top:14px"><table class="table"><thead><tr><th>Date</th><th>Demandeur</th><th>Cible</th><th>Motif</th><th>Statut</th><th>Révision</th>${isSeniorCommand()?"<th></th>":""}</tr></thead><tbody>
    ${data.length?data.map(c=>`<tr><td>${formatDate(c.createdAt)}</td><td>${esc(c.requestedByName)}</td><td>${esc(c.targetType)} — ${esc(c.targetLabel)}</td><td>${esc(c.reason)}</td><td><span class="tag ${c.status==="Approuvé"?"green":c.status==="Refusé"?"red":"orange"}">${esc(c.status)}</span></td><td>${esc(c.reviewedByName||"—")}</td>${isSeniorCommand()?`<td>${c.status==="En attente"?`<button class="btn secondary correction-review" data-id="${c.id}" data-status="Approuvé">Approuver</button> <button class="btn secondary correction-review" data-id="${c.id}" data-status="Refusé">Refuser</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="7">Aucune demande.</td></tr>'}
    </tbody></table></div>`;
    $("newCorrectionBtn").onclick=openCorrectionForm;
    document.querySelectorAll(".correction-review").forEach(b=>b.onclick=()=>reviewCorrection(b.dataset.id,b.dataset.status));
  }catch(err){
    $("content").innerHTML=`<div class="card"><p class="error">${esc(err.code||err.message)}</p></div>`;
  }
}

async function openCorrectionForm(){
  try{
    const incidentSnap=isCommand()
      ? await getDocs(collection(db,"incident_reports"))
      : await getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid)));
    let evalDocs=[];
    if(isCommand()){
      const s=await getDocs(collection(db,"evaluations")); evalDocs=s.docs;
    }else if(isFTO()){
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
  if(!isSeniorCommand()) return;
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
  let evals=[];try{evals=await getMyEvaluations();}catch{}
  $("content").innerHTML=`<div class="grid module-grid">${modules.map(m=>{
    const list=evals.filter(e=>e.moduleCode===m[0]).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const latest=list[0];
    return `<div class="card module" data-module="${m[0]}"><span class="number">${m[0]} • ${m[3]}</span><h3>${m[1]}</h3><p class="muted">${m[2]}</p><span class="tag ${latest?.result==="Validé"?"green":latest?.result==="Échec"?"red":latest?"orange":""}">${latest?.result||"À faire"}</span></div>`;
  }).join("")}</div>`;
  document.querySelectorAll(".module").forEach(c=>c.onclick=()=>openModule(c.dataset.module));
}
function openModule(id){
  const m=modules.find(x=>x[0]===id);
  showModal(`<h2>${m[0]} — ${m[1]}</h2><p>${m[2]}</p><h3>Déroulé FTO</h3>${["Briefing et objectifs","Démonstration FTO","Mise en pratique","Questions/correction","Observation en situation"].map(x=>`<label class="check"><input type="checkbox">${x}</label>`).join("")}<button class="btn" id="closeModal">Fermer</button>`);
}

async function evaluations(){
  let snap;
  if(hasPerm("personnel_view")) snap=await getDocs(collection(db,"evaluations"));
  else if(hasPerm("fto_tools")) snap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
  else snap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));

  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">
    ${hasPerm("fto_tools")?'<button class="btn" id="newEvalBtn">+ Nouvelle évaluation</button>':""}
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

async function openEvaluationForm(){
  if(!hasPerm("fto_tools"))return;
  const officers=(await getUsers()).filter(o=>!["Inactif","Archivé"].includes(o.status));
  showModal(`<h2>Nouvelle évaluation FTO</h2><form id="evalForm"><div class="formgrid">
  <label class="field"><span>Officier évalué</span><select id="eOfficer">${officers.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)} — ${esc(o.grade)}</option>`).join("")}</select></label>
  <label class="field"><span>Module</span><select id="eModule">${modules.map(m=>`<option value="${m[0]}">${m[0]} — ${m[1]}</option>`).join("")}</select></label></div>
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
  const s=$("eOfficer"),officerId=s.value,officerName=s.selectedOptions[0].dataset.name,moduleCode=$("eModule").value,module=modules.find(m=>m[0]===moduleCode);
  const values={};document.querySelectorAll(".criterion-score").forEach(x=>values[x.dataset.key]=Number(x.value));
  const vals=Object.values(values),score=Math.round(vals.reduce((a,b)=>a+b,0)/(vals.length*5)*100),result=score>=75?"Validé":score>=55?"À revoir":"Échec";
  try{
    await addDoc(collection(db,"evaluations"),{officerId,officerName,ftoId:window.LSPD.user.uid,ftoName:window.LSPD.profile.name,moduleCode,moduleTitle:module[1],criteria:values,score,result,comments:$("eComments").value.trim(),createdAt:serverTimestamp()});
    await addAudit("CREATE_EVALUATION",officerId,`${moduleCode} — ${result} — ${score}/100`);
    document.querySelector(".modal")?.remove();evaluations();
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
  if(!hasPerm("fto_tools"))return;
  const a=await getDocs(query(collection(db,"fto_assignments"),where("ftoId","==",window.LSPD.user.uid)));
  const assignments=a.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.status==="Active");
  const users=await getUsers();
  $("content").innerHTML=`<div class="grid2">${assignments.length?assignments.map(x=>{
    const o=users.find(u=>u.uid===x.traineeId);return o?`<div class="card"><span class="number">${esc(o.badge)}</span><h3>${esc(o.name)}</h3><p class="muted">${esc(o.grade)} • ${esc(o.status)}</p><button class="btn secondary trainee-file" data-id="${o.uid}">Ouvrir le dossier</button></div>`:"";
  }).join(""):'<div class="card">Aucune recrue assignée.</div>'}</div>`;
  document.querySelectorAll(".trainee-file").forEach(b=>b.onclick=()=>officerFile(b.dataset.id));
}

async function officers(){
  if(!hasPerm("personnel_view"))return;
  const data=(await getUsers()).sort((a,b)=>(a.badge||"").localeCompare(b.badge||"",undefined,{numeric:true}));
  $("content").innerHTML=`<div class="toolbar">
    <input id="officerSearch" class="search" placeholder="Rechercher...">
    <select id="officerStatusFilter" class="search"><option value="">Tous statuts</option>${statuses.map(s=>`<option>${s}</option>`).join("")}</select>
    <select id="officerDivisionFilter" class="search"><option value="">Toutes unités</option>${divisions.map(s=>`<option>${s}</option>`).join("")}</select>
    <button class="btn secondary" id="exportOfficersBtn">Exporter CSV</button>
    ${hasPerm("personnel_manage")?'<button class="btn" id="addOfficerBtn">+ Ajouter un profil</button>':""}
  </div>
  <div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Unité</th><th>Statut</th><th></th>${hasPerm("personnel_manage")?"<th></th>":""}</tr></thead><tbody id="officerRows">${officerRows(data)}</tbody></table></div>`;

  function refresh(){
    const s=$("officerSearch").value.toLowerCase(),st=$("officerStatusFilter").value,div=$("officerDivisionFilter").value;
    const filtered=data.filter(o=>
      [o.badge,o.name,o.grade,o.role,o.status,o.division].some(v=>String(v||"").toLowerCase().includes(s))
      && (!st||o.status===st) && (!div||o.division===div)
    );
    $("officerRows").innerHTML=officerRows(filtered);bindOfficerButtons(data);
  }

  $("officerSearch").oninput=refresh;$("officerStatusFilter").onchange=refresh;$("officerDivisionFilter").onchange=refresh;
  $("exportOfficersBtn").onclick=()=>csvDownload("officiers_lspd.csv",data.map(o=>({
    matricule:o.badge,nom:o.name,grade:o.grade,role:o.role,unite:o.division||"",statut:o.status
  })));
  $("addOfficerBtn")?.addEventListener("click",()=>openOfficerForm());bindOfficerButtons(data);
}
function officerRows(data){
  return data.length?data.map(o=>`<tr><td>${esc(o.badge)}</td><td><b>${esc(o.name)}</b></td><td>${esc(o.grade)}</td><td><span class="tag">${esc(o.role)}</span></td><td>${esc(o.division||"Patrol")}</td><td>${esc(o.status)}</td><td><button class="btn secondary view-officer" data-uid="${o.uid}">Dossier</button></td>${hasPerm("personnel_manage")?`<td><button class="btn secondary edit-officer" data-uid="${o.uid}">Modifier</button></td>`:""}</tr>`).join(""):'<tr><td colspan="8">Aucun officier.</td></tr>';
}
function bindOfficerButtons(data){
  document.querySelectorAll(".view-officer").forEach(b=>b.onclick=()=>officerFile(b.dataset.uid));
  document.querySelectorAll(".edit-officer").forEach(b=>b.onclick=()=>openOfficerForm(data.find(o=>o.uid===b.dataset.uid)));
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
  showModal(`<h2>Dossier officier — ${esc(o.name)}</h2><div class="detail-grid"><div><span>Matricule</span><b>${esc(o.badge)}</b></div><div><span>Grade</span><b>${esc(o.grade)}</b></div><div><span>Rôle</span><b>${esc(o.role)}</b></div><div><span>Unité</span><b>${esc(o.division||"Patrol")}</b></div><div><span>Statut</span><b>${esc(o.status)}</b></div><div><span>Progression</span><b>${pct}%</b></div></div>
  <div class="progress"><i style="width:${pct}%"></i></div><h3>Certifications</h3><div class="chip-row">${certData.length?certData.map(c=>`<span class="chip">${esc(c.certification)}</span>`).join(""):'<span class="muted">Aucune certification.</span>'}</div>
  <h3>Distinctions / sanctions</h3><div class="record-list">${recordData.length?recordData.map(r=>`<div class="record ${r.type==="Sanction"?"negative":"positive"}"><b>${esc(r.type)} — ${esc(r.title)}</b><span>${formatDate(r.createdAt)} • ${esc(r.issuedByName)}</span><p>${esc(r.details||"")}</p></div>`).join(""):'<p class="muted">Aucune entrée.</p>'}</div>
  <h3>Dernières évaluations</h3><div class="table-card"><table class="table"><thead><tr><th>Date</th><th>Module</th><th>FTO</th><th>Score</th><th>Résultat</th></tr></thead><tbody>${evals.slice(0,10).map(e=>`<tr><td>${formatDate(e.createdAt)}</td><td>${esc(e.moduleCode)}</td><td>${esc(e.ftoName)}</td><td>${esc(e.score)}/100</td><td>${esc(e.result)}</td></tr>`).join("")||'<tr><td colspan="5">Aucune évaluation.</td></tr>'}</tbody></table></div><div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
}
function openOfficerForm(o=null){
  if(!hasPerm("personnel_manage"))return;
  showModal(`<h2>${o?"Modifier":"Ajouter"} un profil</h2><form id="officerForm"><div class="formgrid">
  <label class="field full"><span>UID Firebase Authentication</span><input id="fUid" ${o?"readonly":""} required value="${esc(o?.uid||"")}"></label>
  <label class="field"><span>Matricule</span><input id="fBadge" required value="${esc(o?.badge||"")}"></label>
  <label class="field"><span>Nom RP</span><input id="fName" required value="${esc(o?.name||"")}"></label>
  <label class="field"><span>Grade</span><select id="fGrade">${gradeList.map(g=>`<option ${g[0]===o?.grade?"selected":""}>${g[0]}</option>`).join("")}</select></label>
  <label class="field"><span>Rôle</span><select id="fRole">${roles.map(r=>`<option ${r===o?.role?"selected":""}>${r}</option>`).join("")}</select></label>
  <label class="field"><span>Statut</span><select id="fStatus">${statuses.map(s=>`<option ${s===o?.status?"selected":""}>${s}</option>`).join("")}</select></label>
  <label class="field"><span>Unité / Division</span><select id="fDivision">${divisions.map(d=>`<option ${d===(o?.division||"Patrol")?"selected":""}>${d}</option>`).join("")}</select></label>
  </div><div id="formError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("officerForm").onsubmit=saveOfficerProfile;
}
async function saveOfficerProfile(e){
  e.preventDefault();
  const uid=$("fUid").value.trim(),payload={badge:$("fBadge").value.trim(),name:$("fName").value.trim(),grade:$("fGrade").value,role:$("fRole").value,status:$("fStatus").value,division:$("fDivision").value,updatedAt:serverTimestamp()};
  try{
    const ref=doc(db,"users",uid),existing=await getDoc(ref);
    if(existing.exists())await updateDoc(ref,payload);else await setDoc(ref,{...payload,createdAt:serverTimestamp()});
    await addAudit(existing.exists()?"UPDATE_OFFICER":"CREATE_OFFICER",uid,`${payload.badge} — ${payload.name} — ${payload.grade}`);
    document.querySelector(".modal")?.remove();officers();
  }catch(err){$("formError").textContent="Erreur : "+(err.code||err.message);}
}

async function assignments(){
  if(!hasPerm("fto_assignments_view"))return;
  const as=await getDocs(collection(db,"fto_assignments"));
  const data=as.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("fto_assignments_manage")?'<button class="btn" id="newAssignmentBtn">+ Nouvelle affectation</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>FTO</th><th>Recrue</th><th>Statut</th><th>Commentaire</th>${hasPerm("personnel_manage")?"<th></th>":""}</tr></thead><tbody>${data.length?data.map(a=>`<tr><td>${formatDate(a.createdAt)}</td><td>${esc(a.ftoName)}</td><td>${esc(a.traineeName)}</td><td><span class="tag ${a.status==="Active"?"green":""}">${esc(a.status)}</span></td><td>${esc(a.comment||"")}</td>${isChief()?`<td>${a.status==="Active"?`<button class="btn secondary close-assignment" data-id="${a.id}">Clôturer</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucune affectation.</td></tr>'}</tbody></table></div>`;
  $("newAssignmentBtn")?.addEventListener("click",openAssignmentForm);
  document.querySelectorAll(".close-assignment").forEach(b=>b.onclick=()=>closeAssignment(b.dataset.id));
}
async function openAssignmentForm(){
  if(!hasPerm("fto_assignments_manage")) return;
  const users=await getUsers(),ftos=users.filter(u=>["FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(u.role)),trainees=users.filter(u=>!["Inactif","Archivé"].includes(u.status));
  showModal(`<h2>Nouvelle affectation FTO</h2><form id="assignmentForm"><div class="formgrid"><label class="field"><span>FTO</span><select id="aFto">${ftos.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Recrue</span><select id="aTrainee">${trainees.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label></div><label class="field full"><span>Commentaire</span><textarea id="aComment" rows="4"></textarea></label><div id="assignmentError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Affecter</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("assignmentForm").onsubmit=saveAssignment;
}
async function saveAssignment(e){
  if(!hasPerm("fto_assignments_manage")) return;
  e.preventDefault();const f=$("aFto"),t=$("aTrainee");
  try{
    await addDoc(collection(db,"fto_assignments"),{ftoId:f.value,ftoName:f.selectedOptions[0].dataset.name,traineeId:t.value,traineeName:t.selectedOptions[0].dataset.name,status:"Active",comment:$("aComment").value.trim(),createdAt:serverTimestamp(),createdById:window.LSPD.user.uid});
    await addAudit("FTO_ASSIGNMENT",t.value,`${t.selectedOptions[0].dataset.name} → ${f.selectedOptions[0].dataset.name}`);
    document.querySelector(".modal")?.remove();assignments();
  }catch(err){$("assignmentError").textContent="Erreur : "+(err.code||err.message);}
}
async function closeAssignment(id){
  if(!hasPerm("fto_assignments_manage"))return;
  await updateDoc(doc(db,"fto_assignments",id),{status:"Clôturée",closedAt:serverTimestamp(),closedById:window.LSPD.user.uid});
  await addAudit("FTO_ASSIGNMENT_CLOSED",id,"Affectation clôturée");
  assignments();
}

async function certifications(){
  if(!hasPerm("certifications_view"))return;
  const cs=await getDocs(collection(db,"certifications")),data=cs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("certifications_manage")?'<button class="btn" id="newCertificationBtn">+ Ajouter une certification</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Certification</th><th>Attribuée par</th></tr></thead><tbody>${data.length?data.map(c=>`<tr><td>${formatDate(c.createdAt)}</td><td>${esc(c.officerName)}</td><td><span class="chip">${esc(c.certification)}</span></td><td>${esc(c.issuedByName)}</td></tr>`).join(""):'<tr><td colspan="4">Aucune certification.</td></tr>'}</tbody></table></div>`;
  $("newCertificationBtn")?.addEventListener("click",openCertificationForm);
}
async function openCertificationForm(){
  if(!hasPerm("certifications_manage")) return;
  const users=await getUsers();
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
  if(!hasPerm("records_view"))return;
  const rs=await getDocs(collection(db,"personnel_records")),data=rs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("records_manage")?'<button class="btn" id="newRecordBtn">+ Nouvelle entrée</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Type</th><th>Titre</th><th>Émis par</th><th>Détails</th></tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.officerName)}</td><td><span class="tag ${r.type==="Sanction"?"red":"green"}">${esc(r.type)}</span></td><td>${esc(r.title)}</td><td>${esc(r.issuedByName)}</td><td>${esc(r.details||"")}</td></tr>`).join(""):'<tr><td colspan="6">Aucune entrée.</td></tr>'}</tbody></table></div>`;
  $("newRecordBtn")?.addEventListener("click",openRecordForm);
}
async function openRecordForm(){
  if(!hasPerm("records_manage")) return;
  const users=await getUsers();
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
  if(!hasPerm("shifts_view"))return;
  const ss=await getDocs(collection(db,"shifts")),data=ss.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("shifts_manage")?'<button class="btn" id="newShiftBtn">+ Ajouter un shift</button>':""}<button class="btn secondary" id="exportShiftsBtn">Exporter CSV</button></div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Début</th><th>Fin</th><th>Unité</th><th>Statut</th></tr></thead><tbody>${data.length?data.map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.officerName)}</td><td>${esc(s.start)}</td><td>${esc(s.end)}</td><td>${esc(s.division||"Patrol")}</td><td>${esc(s.status||"Planifié")}</td></tr>`).join(""):'<tr><td colspan="6">Aucun shift.</td></tr>'}</tbody></table></div>`;
  $("newShiftBtn")?.addEventListener("click",openShiftForm);
  $("exportShiftsBtn").onclick=()=>csvDownload("shifts_lspd.csv",data.map(s=>({date:s.date,officier:s.officerName,debut:s.start,fin:s.end,unite:s.division,statut:s.status})));
}
async function openShiftForm(){
  if(!hasPerm("shifts_manage")) return;
  const users=await getUsers();
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
  const mine=!hasPerm("leave_review");
  const snap=mine?await getDocs(query(collection(db,"leave_requests"),where("officerId","==",window.LSPD.user.uid))):await getDocs(collection(db,"leave_requests"));
  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newLeaveBtn">+ Demander un congé</button></div>
  <div class="card table-card"><table class="table"><thead><tr><th>Officier</th><th>Du</th><th>Au</th><th>Motif</th><th>Statut</th>${hasPerm("personnel_manage")?"<th></th>":""}</tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${esc(r.officerName)}</td><td>${esc(r.startDate)}</td><td>${esc(r.endDate)}</td><td>${esc(r.reason||"")}</td><td><span class="tag ${r.status==="Approuvé"?"green":r.status==="Refusé"?"red":"orange"}">${esc(r.status)}</span></td>${hasPerm("leave_review")?`<td>${r.status==="En attente"?`<button class="btn secondary leave-approve" data-id="${r.id}" data-status="Approuvé">Approuver</button> <button class="btn secondary leave-approve" data-id="${r.id}" data-status="Refusé">Refuser</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucune demande.</td></tr>'}</tbody></table></div>`;
  $("newLeaveBtn").onclick=openLeaveForm;
  document.querySelectorAll(".leave-approve").forEach(b=>b.onclick=()=>reviewLeave(b.dataset.id,b.dataset.status));
}
function openLeaveForm(){
  showModal(`<h2>Demande de congé</h2><form id="leaveForm"><div class="formgrid"><label class="field"><span>Du</span><input id="lStart" type="date" required></label><label class="field"><span>Au</span><input id="lEnd" type="date" required></label></div><label class="field full"><span>Motif</span><textarea id="lReason" rows="4"></textarea></label><div id="leaveError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Envoyer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("leaveForm").onsubmit=saveLeave;
}
async function saveLeave(e){
  e.preventDefault();
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
  const snap=await getDocs(collection(db,"training_events")),data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("training_manage")?'<button class="btn" id="newTrainingBtn">+ Planifier une formation</button>':""}</div>
  <div class="calendar-grid">${data.length?data.map(e=>`<div class="card event-card"><span class="number">${esc(e.date)} • ${esc(e.time)}</span><h3>${esc(e.title)}</h3><p>${esc(e.moduleCode||"")}</p><p class="muted">${esc(e.location||"LSPD")} • Formateur: ${esc(e.trainerName)}</p><p class="muted">${esc(e.notes||"")}</p></div>`).join(""):'<div class="card">Aucune formation planifiée.</div>'}</div>`;
  $("newTrainingBtn")?.addEventListener("click",openTrainingForm);
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
  const [us,ev]=await Promise.all([getDocs(collection(db,"users")),getDocs(collection(db,"evaluations"))]);
  const users=us.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>!["Inactif","Archivé"].includes(u.status));
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
  const [us,ev,rs]=await Promise.all([getDocs(collection(db,"users")),getDocs(collection(db,"evaluations")),getDocs(collection(db,"personnel_records"))]);
  const users=us.docs.map(d=>({uid:d.id,...d.data()})),evals=ev.docs.map(d=>d.data()),recordsData=rs.docs.map(d=>d.data());
  const rows=users.filter(o=>o.status!=="Archivé").map(o=>{
    const oe=evals.filter(e=>e.officerId===o.uid),valid=[...new Set(oe.filter(e=>e.result==="Validé").map(e=>e.moduleCode))],avg=oe.length?Math.round(oe.reduce((s,e)=>s+(Number(e.score)||0),0)/oe.length):0;
    const sanctions=recordsData.filter(r=>r.officerId===o.uid&&r.type==="Sanction").length;
    let readiness=Math.max(0,Math.min(100,Math.min(50,Math.round(valid.length/modules.length*50))+Math.min(40,Math.round(avg*0.4))-sanctions*10));
    return {o,valid:valid.length,avg,sanctions,readiness,label:readiness>=80?"Fort candidat":readiness>=65?"À considérer":"Pas encore"};
  }).sort((a,b)=>b.readiness-a.readiness);

  $("content").innerHTML=`<div class="card"><p class="muted">Indicateur d'aide à la décision. Il ne remplace pas le jugement du commandement.</p></div>
  <div class="card table-card" style="margin-top:14px"><table class="table"><thead><tr><th>Officier</th><th>Grade</th><th>Modules</th><th>Moyenne FTO</th><th>Sanctions</th><th>Indice</th><th>Lecture</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.o.badge)} — <b>${esc(x.o.name)}</b></td><td>${esc(x.o.grade)}</td><td>${x.valid}/${modules.length}</td><td>${x.avg}/100</td><td>${x.sanctions}</td><td><div class="mini-progress"><i style="width:${x.readiness}%"></i></div>${x.readiness}%</td><td><span class="tag ${x.readiness>=80?"green":x.readiness>=65?"orange":""}">${x.label}</span></td></tr>`).join("")}</tbody></table></div>`;
}

async function promotions(){
  if(!hasPerm("promotions_view"))return;
  const ps=await getDocs(collection(db,"promotions")),data=ps.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${hasPerm("promotions_manage")?'<button class="btn" id="newPromotionBtn">+ Enregistrer une promotion</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Ancien grade</th><th>Nouveau grade</th><th>Validé par</th></tr></thead><tbody>${data.length?data.map(p=>`<tr><td>${formatDate(p.createdAt)}</td><td>${esc(p.officerName)}</td><td>${esc(p.oldGrade)}</td><td>${esc(p.newGrade)}</td><td>${esc(p.approvedByName)}</td></tr>`).join(""):'<tr><td colspan="5">Aucune promotion.</td></tr>'}</tbody></table></div>`;
  $("newPromotionBtn")?.addEventListener("click",openPromotionForm);
}
async function openPromotionForm(){
  if(!hasPerm("promotions_manage")) return;
  const users=await getUsers();
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
    getDocs(collection(db,"users")),getDocs(collection(db,"evaluations")),
    getDocs(collection(db,"fto_assignments")),getDocs(collection(db,"certifications")),
    getDocs(collection(db,"personnel_records")),getDocs(collection(db,"leave_requests")),
    getDocs(collection(db,"shifts"))
  ]);
  const users=us.docs.map(d=>d.data()),evals=ev.docs.map(d=>d.data()),assign=as.docs.map(d=>d.data()),certs=cs.docs.map(d=>d.data()),recordsData=rs.docs.map(d=>d.data()),leaves=lv.docs.map(d=>d.data()),shiftsData=sh.docs.map(d=>d.data());
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
  const users=await getUsers();
  $("content").innerHTML=`<div class="grid2">
    <div class="card admin-feature"><span class="eyebrow">SYSTEM</span><h3>Gestion système</h3><div class="row"><span>Profils</span><b>${users.length}</b></div><div class="row"><span>Authentication</span><b>Firebase Console</b></div><div class="row"><span>Rôles & unités</span><b>Onglet Officiers</b></div></div>
    <div class="card admin-feature"><span class="eyebrow">ACCESS CONTROL</span><h3>Permissions</h3><p class="muted">Configure les droits de chaque rôle sans modifier app.js.</p><button class="btn" id="openPermissionsBtn">🔐 Permissions</button></div>
    <div class="card admin-feature"><span class="eyebrow">OPERATIONS</span><h3>CAD & Watch</h3><p class="muted">Unités live, BOLO et Watch Commander sont intégrés au Command Center.</p></div>
    <div class="card admin-feature"><span class="eyebrow">ARCHIVE</span><h3>Archivage</h3><p class="muted">Pour retirer un officier des listes actives sans supprimer son historique, passe son statut à <b>Archivé</b>.</p></div>
  </div>`;
  $("openPermissionsBtn").onclick=()=>render("permissionsAdmin");
}

async function history(){
  if(!hasPerm("audit"))return;
  const s=await getDocs(collection(db,"audit_logs")),data=s.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar"><button class="btn secondary" id="exportHistoryBtn">Exporter CSV</button></div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détails</th></tr></thead><tbody>${data.length?data.map(h=>`<tr><td>${formatDate(h.createdAt)}</td><td>${esc(h.actorName)}</td><td>${esc(h.action)}</td><td>${esc(h.details)}</td></tr>`).join(""):'<tr><td colspan="4">Aucun historique.</td></tr>'}</tbody></table></div>`;
  $("exportHistoryBtn").onclick=()=>csvDownload("historique_lspd.csv",data.map(h=>({date:formatDate(h.createdAt),utilisateur:h.actorName,action:h.action,details:h.details})));
}

async function globalSearch(term){
  term=term.trim().toLowerCase();
  if(term.length<2) return;
  try{
    const usersSnap=await getDocs(collection(db,"users"));
    let evalSnap;
    if(hasPerm("personnel_view")) evalSnap=await getDocs(collection(db,"evaluations"));
    else if(hasPerm("fto_tools")) evalSnap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
    else evalSnap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
    const annSnap=await getDocs(collection(db,"announcements"));
    const incSnap=hasPerm("incident_review")
      ? await getDocs(collection(db,"incident_reports"))
      : await getDocs(query(collection(db,"incident_reports"),where("authorId","==",window.LSPD.user.uid)));

    const users=usersSnap.docs.map(d=>({uid:d.id,...d.data()})).filter(o=>[o.badge,o.name,o.grade,o.role,o.division,o.status].some(v=>String(v||"").toLowerCase().includes(term)));
    const evals=evalSnap.docs.map(d=>({id:d.id,...d.data()})).filter(e=>[e.officerName,e.ftoName,e.moduleCode,e.moduleTitle,e.result].some(v=>String(v||"").toLowerCase().includes(term)));
    const anns=annSnap.docs.map(d=>d.data()).filter(a=>[a.title,a.body,a.authorName].some(v=>String(v||"").toLowerCase().includes(term)));
    const incs=incSnap.docs.map(d=>d.data()).filter(a=>[a.title,a.type,a.authorName,a.status].some(v=>String(v||"").toLowerCase().includes(term)));

    showModal(`<h2>Recherche globale</h2><h3>Officiers</h3>${users.length?users.slice(0,8).map(o=>`<div class="search-result"><b>${esc(o.badge)} — ${esc(o.name)}</b><span>${esc(o.grade)} • ${esc(o.division||"Patrol")} • ${esc(o.status)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}<h3>Évaluations accessibles</h3>${evals.length?evals.slice(0,8).map(e=>`<div class="search-result"><b>${esc(e.officerName)} — ${esc(e.moduleCode)}</b><span>${esc(e.result)} • ${esc(e.score)}/100 • FTO ${esc(e.ftoName)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}<h3>Annonces</h3>${anns.length?anns.slice(0,8).map(a=>`<div class="search-result"><b>${esc(a.title)}</b><span>${esc(a.authorName)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}<h3>Incidents accessibles</h3>${incs.length?incs.slice(0,8).map(a=>`<div class="search-result"><b>${esc(a.title)}</b><span>${esc(a.type)} • ${esc(a.status)}</span></div>`).join(""):'<p class="muted">Aucun résultat.</p>'}<div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
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

  // Phase 14 UX controls
  document.body.classList.toggle("sidebar-collapsed",localStorage.getItem("lspdSidebarCollapsed")==="1");
  $("sidebarCollapseBtn")?.addEventListener("click",()=>toggleSidebar());
  $("mobileMenuBtn")?.addEventListener("click",()=>toggleMobileSidebar());
  $("sidebarBackdrop")?.addEventListener("click",()=>toggleMobileSidebar(false));
  $("commandPaletteBtn")?.addEventListener("click",openCommandPalette);
  document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="k"){e.preventDefault();openCommandPalette();}
    if(e.key==="Escape" && document.body.classList.contains("sidebar-open")) toggleMobileSidebar(false);
  });
  updateClock();
  setInterval(updateClock,15000);

  $("loginForm")?.addEventListener("submit",handleLogin);
  $("signupForm")?.addEventListener("submit",handleSignup);
  $("showLoginBtn")?.addEventListener("click",()=>toggleAuthMode("login"));
  $("showSignupBtn")?.addEventListener("click",()=>toggleAuthMode("signup"));
  $("approvalLogoutBtn")?.addEventListener("click",logout);
  $("logoutBtn")?.addEventListener("click",logout);
  $("nav")?.addEventListener("click",e=>{const b=e.target.closest("button[data-page]");if(b)render(b.dataset.page);});
  let timer;
  $("globalSearch")?.addEventListener("input",e=>{
    clearTimeout(timer);
    if(e.target.value.trim().length<2) return;
    timer=setTimeout(()=>globalSearch(e.target.value),450);
  });
});
