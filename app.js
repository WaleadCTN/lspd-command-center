// LSPD Command Center — Phase 11.0 BILINGUAL — Phase 10 fully preserved + FR/EN display layer

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
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

window.LSPD = { auth, db, storage, user:null, profile:null };

const $ = id => document.getElementById(id);
const esc = v => String(v ?? "")
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  .replaceAll('"',"&quot;").replaceAll("'","&#039;");

// Phase 11 bilingual display layer.
// Firestore values remain canonical/original; only visible labels are translated.
const I18N_EN = {"Command Center":"Command Center","Training & Operations":"Training & Operations","Training • Personnel • Operations • Communication":"Training • Personnel • Operations • Communication","Connexion":"Login","Créer un compte":"Create account","Adresse e-mail":"Email address","Mot de passe":"Password","Se connecter":"Log in","Nom RP":"RP name","Confirmer le mot de passe":"Confirm password","Créer ma demande d'inscription":"Submit my registration request","Le compte Firebase est créé automatiquement. L'accès LSPD reste bloqué jusqu'à validation par le Chief.":"The Firebase account is created automatically. LSPD access remains locked until approval by the Chief.","Inscription en attente":"Registration pending","Votre demande doit être validée par le commandement LSPD.":"Your request must be approved by LSPD Command.","Se déconnecter":"Log out","Déconnecté":"Logged out","Connecté":"Connected","Compte LSPD":"LSPD account","Dashboard":"Dashboard","Mon profil":"My profile","Inscriptions":"Registrations","Notifications":"Notifications","Annonces":"Announcements","Messages":"Messages","Rapports d'incident":"Incident reports","Validations":"Approvals","Corrections & addenda":"Corrections & addenda","Manuel FTO":"FTO Manual","Formations":"Training","Évaluations":"Evaluations","Mes recrues":"My trainees","Officiers":"Officers","Affectations FTO":"FTO assignments","Certifications":"Certifications","Dossiers & distinctions":"Personnel records & distinctions","Roster & shifts":"Roster & shifts","Congés":"Leave","Calendrier formations":"Training calendar","À valider":"To validate","Promotion advisor":"Promotion advisor","Promotions":"Promotions","Statistiques":"Statistics","Grades & responsabilités":"Ranks & responsibilities","Scénarios":"Scenarios","Admin":"Admin","Historique":"History","Recherche globale...":"Global search...","Profil incomplet":"Incomplete profile","Ton compte Authentication existe, mais aucun profil LSPD valide n'est associé. Contacte le Chief of Police.":"Your Authentication account exists, but no valid LSPD profile is linked to it. Contact the Chief of Police.","Erreur profil":"Profile error","Erreur de profil":"Profile error","Impossible de charger ton profil LSPD. Réessaie ou contacte le commandement.":"Unable to load your LSPD profile. Try again or contact Command.","Ta demande a bien été enregistrée. Le Chief of Police doit maintenant valider ton matricule, ton grade, ton rôle et ta division.":"Your request has been recorded. The Chief of Police must now approve your badge number, rank, role, and division.","Inscription refusée":"Registration rejected","Ta demande d'inscription n'a pas été validée. Contacte le commandement LSPD si tu penses qu'il s'agit d'une erreur.":"Your registration request was not approved. Contact LSPD Command if you believe this is an error.","Compte archivé":"Archived account","Ton profil LSPD est archivé et l'accès au Command Center est désactivé.":"Your LSPD profile is archived and access to the Command Center is disabled.","Utilisateur":"User","Statut :":"Status:","Entre un nom RP valide.":"Enter a valid RP name.","Les mots de passe ne correspondent pas.":"Passwords do not match.","Inscription enregistrée":"Registration submitted","Ton compte a été créé automatiquement. Tu n'as rien d'autre à faire : attends simplement la validation du Chief of Police.":"Your account was created automatically. You do not need to do anything else; simply wait for approval by the Chief of Police.","Cette adresse e-mail possède déjà un compte.":"This email address already has an account.","Le mot de passe doit contenir au moins 6 caractères.":"The password must contain at least 6 characters.","Adresse e-mail invalide.":"Invalid email address.","Demandes d'inscription":"Registration requests","Les candidats créent eux-mêmes leur compte Firebase Authentication. Ici, tu valides uniquement leur accès LSPD : matricule, grade, rôle et division.":"Applicants create their own Firebase Authentication account. Here, you only approve their LSPD access: badge number, rank, role, and division.","Date":"Date","Email":"Email","Statut":"Status","Profil proposé":"Proposed profile","Action":"Action","Réexaminer":"Review again","Approuver":"Approve","Refuser":"Reject","Aucune demande en attente.":"No pending requests.","Valider l'inscription":"Approve registration","UID géré automatiquement par Firebase":"UID managed automatically by Firebase","Matricule":"Badge number","Grade":"Rank","Rôle":"Role","Division":"Division","Annuler":"Cancel","Le matricule est obligatoire.":"Badge number is required.","Inscription LSPD approuvée":"LSPD registration approved","Tout marquer comme lu":"Mark all as read","Aucune notification.":"No notifications.","Marquer comme lu":"Mark as read","Par":"By","Système":"System","Info":"Info","Validation":"Approval","Command overview":"Command overview","Effectif actif":"Active personnel","Congés en attente":"Pending leave","Shifts aujourd'hui":"Today's shifts","Évaluations totales":"Total evaluations","Identité":"Identity","Progression":"Progress","Progression personnelle":"Personal progress","Dossier":"Record","Accès FTO/Command actif":"FTO/Command access active","Accès Officer":"Officer access","Unité":"Unit","Sécurité du compte":"Account security","Tu peux recevoir un e-mail Firebase pour réinitialiser ton mot de passe.":"You can receive a Firebase email to reset your password.","Envoyer l'e-mail de réinitialisation":"Send password reset email","E-mail de réinitialisation envoyé.":"Password reset email sent.","+ Nouvelle annonce":"+ New announcement","Aucune annonce.":"No announcements.","Nouvelle annonce":"New announcement","Titre":"Title","Priorité":"Priority","Message":"Message","Publier":"Publish","Normal":"Normal","Important":"Important","Urgent":"Urgent","+ Nouveau message":"+ New message","De":"From","À":"To","Sujet":"Subject","Aucun message.":"No messages.","Nouveau message":"New message","Destinataire":"Recipient","Envoyer":"Send","+ Nouveau rapport":"+ New report","Exporter CSV":"Export CSV","Auteur":"Author","Type":"Type","Pièces":"Attachments","Aucun rapport.":"No reports.","Nouveau rapport d'incident":"New incident report","Résumé":"Summary","Détails":"Details","Pièces jointes (optionnel : images/PDF, max 10 Mo par fichier)":"Attachments (optional: images/PDF, max 10 MB per file)","Soumettre pour validation":"Submit for approval","Aucune validation en attente.":"No approvals pending.","Use of Force":"Use of Force","Vehicle Pursuit":"Vehicle Pursuit","Arrestation sensible":"Sensitive arrest","Accident service":"On-duty accident","Plainte citoyen":"Citizen complaint","Incident interne":"Internal incident","Autre":"Other","Approuvé":"Approved","Refusé":"Rejected","+ Demander une correction":"+ Request a correction","Les documents d'origine restent intacts. Une correction approuvée crée un":"Original documents remain unchanged. An approved correction creates a","addendum":"addendum","traçable.":"with a full audit trail.","Demandeur":"Requester","Cible":"Target","Motif":"Reason","Révision":"Review","Demande de correction / addendum":"Correction / addendum request","Document concerné":"Affected document","Pourquoi une correction est nécessaire ?":"Why is a correction needed?","Texte proposé pour l'addendum":"Proposed addendum text","Correction précise, sans effacer l'original...":"Precise correction without deleting the original...","Envoyer la demande":"Submit request","Aucun document disponible pour une demande de correction.":"No document is available for a correction request.","Manuel FTO LSPD":"LSPD FTO Manual","Briefing → démonstration → pratique → observation → feedback → validation → traçabilité.":"Briefing → demonstration → practice → observation → feedback → validation → audit trail.","Sécurité avant performance":"Safety before performance","Expliquer le pourquoi":"Explain the why","Erreur critique = correction immédiate":"Critical error = immediate correction","Feedback factuel":"Factual feedback","Validation traçable":"Traceable validation","Même standard pour tous":"Same standard for everyone","Débutant":"Beginner","Intermédiaire":"Intermediate","Avancé":"Advanced","Commandement":"Command","À faire":"To do","Validé":"Validated","À revoir":"Needs review","Échec":"Failed","Déroulé FTO":"FTO process","Briefing et objectifs":"Briefing and objectives","Démonstration FTO":"FTO demonstration","Mise en pratique":"Practical exercise","Questions/correction":"Questions/correction","Observation en situation":"Field observation","Fermer":"Close","Fondamentaux LSPD":"LSPD Fundamentals","Structure, chaîne de commandement, radio et code de conduite":"Structure, chain of command, radio, and code of conduct","Radio & communications":"Radio & Communications","Codes radio, transmissions, priorités et dispatch":"Radio codes, transmissions, priorities, and dispatch","Patrouille":"Patrol","Positionnement, observation, contrôles et contacts citoyens":"Positioning, observation, stops, and citizen contacts","Code de la route":"Traffic Code","Contrôles routiers, infractions et conduite professionnelle":"Traffic stops, violations, and professional driving","Contrôle d'identité":"Identity Check","Procédure de contact, vérifications et sécurité":"Contact procedure, checks, and safety","Arrestation":"Arrest","Menottage, fouille, droits, transport et remise en garde":"Handcuffing, search, rights, transport, and custody handoff","Usage de la force":"Use of Force","Proportionnalité, désescalade et justification":"Proportionality, de-escalation, and justification","Poursuites":"Pursuits","Poursuite véhicule/pied, coordination et sécurité":"Vehicle/foot pursuit, coordination, and safety","Scènes de crime":"Crime Scenes","Sécurisation, témoins, preuves et préservation":"Scene security, witnesses, evidence, and preservation","Rapports":"Reports","Rédaction factuelle, chronologie, preuves et transmission":"Factual writing, chronology, evidence, and submission","Interventions à risque":"High-Risk Incidents","Renfort, périmètre, négociation et coordination":"Backup, perimeter, negotiation, and coordination","Gestion de scène":"Scene Management","Commandement tactique, briefing et ressources":"Tactical command, briefing, and resources","FTO & pédagogie":"FTO & Training Methods","Démonstration, observation, feedback et validation":"Demonstration, observation, feedback, and validation","Supervision":"Supervision","Contrôle qualité, discipline, coaching et décisions":"Quality control, discipline, coaching, and decisions","Gestion opérationnelle, effectifs et crises":"Operational management, staffing, and crises","Leadership":"Leadership","Culture LSPD, éthique, développement et succession":"LSPD culture, ethics, development, and succession","+ Nouvelle évaluation":"+ New evaluation","Officier":"Officer","FTO":"FTO","Module":"Module","Score":"Score","Résultat":"Result","Aucune évaluation.":"No evaluations.","Nouvelle évaluation FTO":"New FTO evaluation","Officier évalué":"Officer evaluated","Critères":"Criteria","Procédure":"Procedure","Respect des étapes et SOP":"Compliance with steps and SOPs","Sécurité":"Safety","Sécurité personnelle, partenaires et public":"Personal, partner, and public safety","Communication radio":"Radio communication","Clarté, concision et pertinence":"Clarity, concision, and relevance","Jugement":"Judgment","Décision adaptée à la situation":"Decision appropriate to the situation","Professionnalisme":"Professionalism","Comportement et attitude":"Behavior and attitude","Compte rendu":"Report","Qualité du rapport et traçabilité":"Report quality and traceability","Commentaires FTO":"FTO comments","Score :":"Score:","1 — Insuffisant":"1 — Unsatisfactory","2 — À améliorer":"2 — Needs improvement","3 — Conforme":"3 — Meets standard","4 — Très bien":"4 — Very good","5 — Excellent":"5 — Excellent","Enregistrer":"Save","Fiche d'évaluation FTO":"FTO Evaluation Form","Commentaires":"Comments","Aucun commentaire.":"No comments.","Imprimer / PDF":"Print / PDF","Voir / Imprimer":"View / Print","Aucune recrue assignée.":"No trainee assigned.","Ouvrir le dossier":"Open record","Rechercher...":"Search...","Tous statuts":"All statuses","Toutes unités":"All units","+ Ajouter un profil":"+ Add profile","Nom":"Name","Aucun officier.":"No officers.","Modifier":"Edit","Dossier officier":"Officer record","Distinctions / sanctions":"Commendations / sanctions","Dernières évaluations":"Latest evaluations","Ajouter un profil":"Add profile","UID Firebase Authentication":"Firebase Authentication UID","Unité / Division":"Unit / Division","Actif":"Active","En formation":"In training","Suspendu":"Suspended","Inactif":"Inactive","Archivé":"Archived","En attente":"Pending","Officer":"Officer","Sergeant":"Sergeant","Lieutenant":"Lieutenant","Captain":"Captain","Deputy Chief":"Deputy Chief","Assistant Chief":"Assistant Chief","Chief":"Chief","Sergent":"Sergeant","Chief of Police":"Chief of Police","Patrol":"Patrol","Traffic":"Traffic","Detective":"Detective","SWAT":"SWAT","Air Support":"Air Support","Training":"Training","Command":"Command","Police Officer I":"Police Officer I","Police Officer II":"Police Officer II","Police Officer III":"Police Officer III","Applique les procédures sous supervision.":"Applies procedures under supervision.","Officier autonome sur les missions courantes.":"Independent officer on routine duties.","Officier expérimenté, senior et mentor.":"Experienced senior officer and mentor.","Premier niveau de supervision.":"First level of supervision.","Supervise plusieurs équipes et opérations.":"Supervises multiple teams and operations.","Responsable d'une division ou unité.":"Responsible for a division or unit.","Supervise plusieurs divisions.":"Supervises multiple divisions.","Direction stratégique du département.":"Strategic leadership of the department.","Autorité finale du département.":"Final authority of the department.","+ Nouvelle affectation":"+ New assignment","Recrue":"Trainee","Commentaire":"Comment","Aucune affectation.":"No assignments.","Clôturer":"Close assignment","Nouvelle affectation FTO":"New FTO assignment","Affecter":"Assign","+ Ajouter une certification":"+ Add certification","Certification":"Certification","Attribuée par":"Issued by","Aucune certification.":"No certifications.","Ajouter une certification":"Add certification","Attribuer":"Issue","Pursuit":"Pursuit","Supervisor":"Supervisor","+ Nouvelle entrée":"+ New entry","Émis par":"Issued by","Aucune entrée.":"No entries.","Nouvelle entrée au dossier":"New personnel record entry","Commendation":"Commendation","Sanction":"Sanction","+ Ajouter un shift":"+ Add shift","Début":"Start","Fin":"End","Aucun shift.":"No shifts.","Ajouter un shift":"Add shift","Planifié":"Scheduled","+ Demander un congé":"+ Request leave","Du":"From","Au":"To","Aucune demande.":"No requests.","Demande de congé":"Leave request","+ Planifier une formation":"+ Schedule training","Aucune formation planifiée.":"No training scheduled.","Planifier une formation":"Schedule training","Heure":"Time","Lieu":"Location","Notes":"Notes","Planifier":"Schedule","Formateur:":"Trainer:","Modules restants":"Remaining modules","Indicateur d'aide à la décision. Il ne remplace pas le jugement du commandement.":"Decision-support indicator. It does not replace Command judgment.","Moyenne FTO":"FTO average","Sanctions":"Sanctions","Indice":"Index","Lecture":"Assessment","Fort candidat":"Strong candidate","À considérer":"Consider","Pas encore":"Not yet","+ Enregistrer une promotion":"+ Record promotion","Ancien grade":"Previous rank","Nouveau grade":"New rank","Validé par":"Approved by","Aucune promotion.":"No promotions.","Enregistrer une promotion":"Record promotion","Effectif":"Personnel","Affectations actives":"Active assignments","Score moyen":"Average score","Effectif par grade":"Personnel by rank","Operations & RH":"Operations & HR","Commendations":"Commendations","Shifts enregistrés":"Recorded shifts","Par unité":"By unit","officiers":"officers","Contrôle routier":"Traffic Stop","Contrôle d'un véhicule suspect":"Stop of a suspicious vehicle","Sécurité, radio, approche, identification, décision, rapport":"Safety, radio, approach, identification, decision, report","Suspect coopératif":"Cooperative suspect","Contrôle, menottage, fouille, droits, transport":"Control, handcuffing, search, rights, transport","Poursuite véhicule":"Vehicle Pursuit","Fuite après refus d'obtempérer":"Flight after failure to stop","Radio, sécurité, coordination, décision":"Radio, safety, coordination, decision","Poursuite à pied":"Foot Pursuit","Suspect prend la fuite":"Suspect flees","Communication, trajectoire, renfort, arrestation":"Communication, route, backup, arrest","Intervention à risque":"High-Risk Incident","Appel avec menace":"Call involving a threat","Périmètre, briefing, désescalade, commandement":"Perimeter, briefing, de-escalation, command","Scène de crime":"Crime Scene","Vol avec plusieurs témoins":"Theft with multiple witnesses","Sécurisation, témoins, preuves, chronologie":"Scene security, witnesses, evidence, chronology","Incident multi-unités":"Multi-unit incident","Commandement, rôles, briefing, compte rendu":"Command, roles, briefing, report","Évaluation FTO":"FTO Evaluation","Patrouille complète":"Full patrol","Évaluation globale en conditions réalistes":"Overall evaluation under realistic conditions","Lancer":"Start","Points à observer":"Observation points","Terminer":"Finish","Gestion système":"System management","Profils":"Profiles","Authentication":"Authentication","Rôles & unités":"Roles & units","Onglet Officiers":"Officers tab","Archivage":"Archiving","Pour retirer un officier des listes actives sans supprimer son historique, passe son statut à":"To remove an officer from active lists without deleting their history, set their status to","Aucun historique.":"No history.","Recherche globale":"Global search","Aucun résultat.":"No results.","Erreur :":"Error:","Aucune donnée à exporter.":"No data to export."};
const I18N_FR = {"Command Center":"Centre de commandement","Training & Operations":"Formation & opérations","Training • Personnel • Operations • Communication":"Formation • Personnel • Opérations • Communication","Dashboard":"Tableau de bord","Roster & shifts":"Planning & services","Promotion advisor":"Conseiller promotions","Admin":"Administration","Email":"E-mail","Authentication":"Authentification","Operations & RH":"Opérations & RH","Officer":"Officier","Sergeant":"Sergent","Captain":"Capitaine","Deputy Chief":"Chef adjoint","Assistant Chief":"Chef assistant","Chief":"Chef","Chief of Police":"Chef de la police","Police Officer I":"Officier de police I","Police Officer II":"Officier de police II","Police Officer III":"Officier de police III","Patrol":"Patrouille","Traffic":"Circulation","Detective":"Enquêtes","Air Support":"Support aérien","Training":"Formation","Command":"Commandement","Pursuit":"Poursuite","Supervisor":"Superviseur","Use of Force":"Usage de la force","Vehicle Pursuit":"Poursuite véhicule"};

let currentLang = localStorage.getItem("lspdLanguage")
  || ((navigator.language||"").toLowerCase().startsWith("en") ? "en" : "fr");

function translateSystemText(source, lang=currentLang){
  if(source == null) return source;
  const text=String(source);
  const dict=lang==="en"?I18N_EN:I18N_FR;
  if(Object.prototype.hasOwnProperty.call(dict,text)) return dict[text];

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

// Translate native alert/confirm messages too.
const nativeAlert=window.alert.bind(window);
const nativeConfirm=window.confirm.bind(window);
window.alert=(message)=>nativeAlert(translateSystemText(String(message),currentLang));
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
 dashboard:"Dashboard",profile:"Mon profil",registrations:"Inscriptions",notifications:"Notifications",announcements:"Annonces",messages:"Messages",
 incidents:"Rapports d'incident",approvals:"Validations",corrections:"Corrections & addenda",manual:"Manuel FTO",modules:"Formations",
 evaluations:"Évaluations",trainees:"Mes recrues",officers:"Officiers",assignments:"Affectations FTO",
 certifications:"Certifications",records:"Dossiers & distinctions",shifts:"Roster & shifts",leave:"Congés",
 calendar:"Calendrier formations",requirements:"À valider",promotionAdvisor:"Promotion advisor",
 promotions:"Promotions",stats:"Statistiques",grades:"Grades & responsabilités",
 scenarios:"Scénarios",admin:"Admin",history:"Historique"
};

function role(){ return window.LSPD.profile?.role; }
function isChief(){ return role()==="Chief"; }
function isFTO(){ return ["FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }
function isCommand(){ return ["Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }
function canApproveIncidents(){ return isCommand(); }
function isSeniorCommand(){ return ["Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }

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

  showApp();
  applyRoleVisibility();
  refreshNotificationBadge().catch(()=>{});
  refreshRegistrationBadge().catch(()=>{});
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
  if(!user){window.LSPD.user=null;window.LSPD.profile=null;showLogin();return;}
  await loadProfile(user);
});
function logout(){ return signOut(auth); }

function applyRoleVisibility(){
  const hide=(p,y)=>document.querySelector(`#nav button[data-page="${p}"]`)?.classList.toggle("hidden",y);
  hide("trainees",!isFTO());
  ["officers","assignments","certifications","records","shifts","requirements","promotions","stats","history","promotionAdvisor","approvals"].forEach(p=>hide(p,!isCommand()));
  hide("corrections",false);
  hide("registrations",!isChief());
  hide("calendar",!isFTO());
  hide("admin",!isChief());
}

function render(page){
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("pageTitle").textContent=pages[page]||"LSPD";
  ({
    dashboard,profile,registrations,notifications,announcements,messages,incidents,approvals,corrections,manual,modules:modulesPage,evaluations,trainees,officers,assignments,
    certifications,records,shifts,leave,calendar,requirements,promotionAdvisor,promotions,
    stats,grades:gradesPage,scenarios:scenariosPage,admin,history
  }[page]||dashboard)();
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
  if(!isChief()) return;
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
  if(!isChief()) return;
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
  if(!isChief()) return;
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
  if(!isChief()) return;
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
    $("content").innerHTML=`<div class="toolbar">${isCommand()?'<button class="btn" id="newAnnouncementBtn">+ Nouvelle annonce</button>':""}</div>
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
  if(!canApproveIncidents()) return;
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
  if(isCommand()) snap=await getDocs(collection(db,"evaluations"));
  else if(isFTO()) snap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
  else snap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));

  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">
    ${isFTO()?'<button class="btn" id="newEvalBtn">+ Nouvelle évaluation</button>':""}
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
  if(!isFTO())return;
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
  if(!isFTO())return;
  const a=await getDocs(query(collection(db,"fto_assignments"),where("ftoId","==",window.LSPD.user.uid)));
  const assignments=a.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.status==="Active");
  const users=await getUsers();
  $("content").innerHTML=`<div class="grid2">${assignments.length?assignments.map(x=>{
    const o=users.find(u=>u.uid===x.traineeId);return o?`<div class="card"><span class="number">${esc(o.badge)}</span><h3>${esc(o.name)}</h3><p class="muted">${esc(o.grade)} • ${esc(o.status)}</p><button class="btn secondary trainee-file" data-id="${o.uid}">Ouvrir le dossier</button></div>`:"";
  }).join(""):'<div class="card">Aucune recrue assignée.</div>'}</div>`;
  document.querySelectorAll(".trainee-file").forEach(b=>b.onclick=()=>officerFile(b.dataset.id));
}

async function officers(){
  if(!isCommand())return;
  const data=(await getUsers()).sort((a,b)=>(a.badge||"").localeCompare(b.badge||"",undefined,{numeric:true}));
  $("content").innerHTML=`<div class="toolbar">
    <input id="officerSearch" class="search" placeholder="Rechercher...">
    <select id="officerStatusFilter" class="search"><option value="">Tous statuts</option>${statuses.map(s=>`<option>${s}</option>`).join("")}</select>
    <select id="officerDivisionFilter" class="search"><option value="">Toutes unités</option>${divisions.map(s=>`<option>${s}</option>`).join("")}</select>
    <button class="btn secondary" id="exportOfficersBtn">Exporter CSV</button>
    ${isChief()?'<button class="btn" id="addOfficerBtn">+ Ajouter un profil</button>':""}
  </div>
  <div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Unité</th><th>Statut</th><th></th>${isChief()?"<th></th>":""}</tr></thead><tbody id="officerRows">${officerRows(data)}</tbody></table></div>`;

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
  return data.length?data.map(o=>`<tr><td>${esc(o.badge)}</td><td><b>${esc(o.name)}</b></td><td>${esc(o.grade)}</td><td><span class="tag">${esc(o.role)}</span></td><td>${esc(o.division||"Patrol")}</td><td>${esc(o.status)}</td><td><button class="btn secondary view-officer" data-uid="${o.uid}">Dossier</button></td>${isChief()?`<td><button class="btn secondary edit-officer" data-uid="${o.uid}">Modifier</button></td>`:""}</tr>`).join(""):'<tr><td colspan="8">Aucun officier.</td></tr>';
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
  if(!isChief())return;
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
  if(!isCommand())return;
  const as=await getDocs(collection(db,"fto_assignments"));
  const data=as.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${isChief()?'<button class="btn" id="newAssignmentBtn">+ Nouvelle affectation</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>FTO</th><th>Recrue</th><th>Statut</th><th>Commentaire</th>${isChief()?"<th></th>":""}</tr></thead><tbody>${data.length?data.map(a=>`<tr><td>${formatDate(a.createdAt)}</td><td>${esc(a.ftoName)}</td><td>${esc(a.traineeName)}</td><td><span class="tag ${a.status==="Active"?"green":""}">${esc(a.status)}</span></td><td>${esc(a.comment||"")}</td>${isChief()?`<td>${a.status==="Active"?`<button class="btn secondary close-assignment" data-id="${a.id}">Clôturer</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucune affectation.</td></tr>'}</tbody></table></div>`;
  $("newAssignmentBtn")?.addEventListener("click",openAssignmentForm);
  document.querySelectorAll(".close-assignment").forEach(b=>b.onclick=()=>closeAssignment(b.dataset.id));
}
async function openAssignmentForm(){
  const users=await getUsers(),ftos=users.filter(u=>["FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(u.role)),trainees=users.filter(u=>!["Inactif","Archivé"].includes(u.status));
  showModal(`<h2>Nouvelle affectation FTO</h2><form id="assignmentForm"><div class="formgrid"><label class="field"><span>FTO</span><select id="aFto">${ftos.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Recrue</span><select id="aTrainee">${trainees.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label></div><label class="field full"><span>Commentaire</span><textarea id="aComment" rows="4"></textarea></label><div id="assignmentError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Affecter</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("assignmentForm").onsubmit=saveAssignment;
}
async function saveAssignment(e){
  e.preventDefault();const f=$("aFto"),t=$("aTrainee");
  try{
    await addDoc(collection(db,"fto_assignments"),{ftoId:f.value,ftoName:f.selectedOptions[0].dataset.name,traineeId:t.value,traineeName:t.selectedOptions[0].dataset.name,status:"Active",comment:$("aComment").value.trim(),createdAt:serverTimestamp(),createdById:window.LSPD.user.uid});
    await addAudit("FTO_ASSIGNMENT",t.value,`${t.selectedOptions[0].dataset.name} → ${f.selectedOptions[0].dataset.name}`);
    document.querySelector(".modal")?.remove();assignments();
  }catch(err){$("assignmentError").textContent="Erreur : "+(err.code||err.message);}
}
async function closeAssignment(id){
  if(!isChief())return;
  await updateDoc(doc(db,"fto_assignments",id),{status:"Clôturée",closedAt:serverTimestamp(),closedById:window.LSPD.user.uid});
  await addAudit("FTO_ASSIGNMENT_CLOSED",id,"Affectation clôturée");
  assignments();
}

async function certifications(){
  if(!isCommand())return;
  const cs=await getDocs(collection(db,"certifications")),data=cs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${isChief()?'<button class="btn" id="newCertificationBtn">+ Ajouter une certification</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Certification</th><th>Attribuée par</th></tr></thead><tbody>${data.length?data.map(c=>`<tr><td>${formatDate(c.createdAt)}</td><td>${esc(c.officerName)}</td><td><span class="chip">${esc(c.certification)}</span></td><td>${esc(c.issuedByName)}</td></tr>`).join(""):'<tr><td colspan="4">Aucune certification.</td></tr>'}</tbody></table></div>`;
  $("newCertificationBtn")?.addEventListener("click",openCertificationForm);
}
async function openCertificationForm(){
  const users=await getUsers();
  showModal(`<h2>Ajouter une certification</h2><form id="certForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="cOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Certification</span><select id="cName">${certificationsCatalog.map(c=>`<option>${c}</option>`).join("")}</select></label></div><div id="certError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Attribuer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("certForm").onsubmit=saveCertification;
}
async function saveCertification(e){
  e.preventDefault();const s=$("cOfficer");
  try{
    await addDoc(collection(db,"certifications"),{officerId:s.value,officerName:s.selectedOptions[0].dataset.name,certification:$("cName").value,issuedById:window.LSPD.user.uid,issuedByName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("CERTIFICATION",s.value,`${s.selectedOptions[0].dataset.name} — ${$("cName").value}`);
    document.querySelector(".modal")?.remove();certifications();
  }catch(err){$("certError").textContent="Erreur : "+(err.code||err.message);}
}

async function records(){
  if(!isCommand())return;
  const rs=await getDocs(collection(db,"personnel_records")),data=rs.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${isChief()?'<button class="btn" id="newRecordBtn">+ Nouvelle entrée</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Type</th><th>Titre</th><th>Émis par</th><th>Détails</th></tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.officerName)}</td><td><span class="tag ${r.type==="Sanction"?"red":"green"}">${esc(r.type)}</span></td><td>${esc(r.title)}</td><td>${esc(r.issuedByName)}</td><td>${esc(r.details||"")}</td></tr>`).join(""):'<tr><td colspan="6">Aucune entrée.</td></tr>'}</tbody></table></div>`;
  $("newRecordBtn")?.addEventListener("click",openRecordForm);
}
async function openRecordForm(){
  const users=await getUsers();
  showModal(`<h2>Nouvelle entrée au dossier</h2><form id="recordForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="rOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Type</span><select id="rType"><option>Commendation</option><option>Sanction</option></select></label><label class="field full"><span>Titre</span><input id="rTitle" required></label></div><label class="field full"><span>Détails</span><textarea id="rDetails" rows="5"></textarea></label><div id="recordError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("recordForm").onsubmit=saveRecord;
}
async function saveRecord(e){
  e.preventDefault();const s=$("rOfficer");
  try{
    await addDoc(collection(db,"personnel_records"),{officerId:s.value,officerName:s.selectedOptions[0].dataset.name,type:$("rType").value,title:$("rTitle").value.trim(),details:$("rDetails").value.trim(),issuedById:window.LSPD.user.uid,issuedByName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("PERSONNEL_RECORD",s.value,`${$("rType").value} — ${$("rTitle").value.trim()}`);
    document.querySelector(".modal")?.remove();records();
  }catch(err){$("recordError").textContent="Erreur : "+(err.code||err.message);}
}

async function shifts(){
  if(!isCommand())return;
  const ss=await getDocs(collection(db,"shifts")),data=ss.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  $("content").innerHTML=`<div class="toolbar">${isChief()?'<button class="btn" id="newShiftBtn">+ Ajouter un shift</button>':""}<button class="btn secondary" id="exportShiftsBtn">Exporter CSV</button></div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Début</th><th>Fin</th><th>Unité</th><th>Statut</th></tr></thead><tbody>${data.length?data.map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.officerName)}</td><td>${esc(s.start)}</td><td>${esc(s.end)}</td><td>${esc(s.division||"Patrol")}</td><td>${esc(s.status||"Planifié")}</td></tr>`).join(""):'<tr><td colspan="6">Aucun shift.</td></tr>'}</tbody></table></div>`;
  $("newShiftBtn")?.addEventListener("click",openShiftForm);
  $("exportShiftsBtn").onclick=()=>csvDownload("shifts_lspd.csv",data.map(s=>({date:s.date,officier:s.officerName,debut:s.start,fin:s.end,unite:s.division,statut:s.status})));
}
async function openShiftForm(){
  const users=await getUsers();
  showModal(`<h2>Ajouter un shift</h2><form id="shiftForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="sOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}" data-division="${esc(o.division||"Patrol")}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label><label class="field"><span>Date</span><input id="sDate" type="date" required></label><label class="field"><span>Début</span><input id="sStart" type="time" required></label><label class="field"><span>Fin</span><input id="sEnd" type="time" required></label></div><div id="shiftError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Ajouter</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("shiftForm").onsubmit=saveShift;
}
async function saveShift(e){
  e.preventDefault();const s=$("sOfficer"),opt=s.selectedOptions[0];
  try{
    await addDoc(collection(db,"shifts"),{officerId:s.value,officerName:opt.dataset.name,date:$("sDate").value,start:$("sStart").value,end:$("sEnd").value,division:opt.dataset.division,status:"Planifié",createdById:window.LSPD.user.uid,createdAt:serverTimestamp()});
    await addAudit("SHIFT_CREATED",s.value,`${opt.dataset.name} — ${$("sDate").value} ${$("sStart").value}-${$("sEnd").value}`);
    document.querySelector(".modal")?.remove();shifts();
  }catch(err){$("shiftError").textContent="Erreur : "+(err.code||err.message);}
}

async function leave(){
  const mine=!isCommand();
  const snap=mine?await getDocs(query(collection(db,"leave_requests"),where("officerId","==",window.LSPD.user.uid))):await getDocs(collection(db,"leave_requests"));
  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newLeaveBtn">+ Demander un congé</button></div>
  <div class="card table-card"><table class="table"><thead><tr><th>Officier</th><th>Du</th><th>Au</th><th>Motif</th><th>Statut</th>${isChief()?"<th></th>":""}</tr></thead><tbody>${data.length?data.map(r=>`<tr><td>${esc(r.officerName)}</td><td>${esc(r.startDate)}</td><td>${esc(r.endDate)}</td><td>${esc(r.reason||"")}</td><td><span class="tag ${r.status==="Approuvé"?"green":r.status==="Refusé"?"red":"orange"}">${esc(r.status)}</span></td>${isChief()?`<td>${r.status==="En attente"?`<button class="btn secondary leave-approve" data-id="${r.id}" data-status="Approuvé">Approuver</button> <button class="btn secondary leave-approve" data-id="${r.id}" data-status="Refusé">Refuser</button>`:""}</td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucune demande.</td></tr>'}</tbody></table></div>`;
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
  if(!isChief())return;
  await updateDoc(doc(db,"leave_requests",id),{status,reviewedById:window.LSPD.user.uid,reviewedByName:window.LSPD.profile.name,reviewedAt:serverTimestamp()});
  await addAudit("LEAVE_"+status.toUpperCase(),id,status);leave();
}

async function calendar(){
  const snap=await getDocs(collection(db,"training_events")),data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  $("content").innerHTML=`<div class="toolbar">${isFTO()?'<button class="btn" id="newTrainingBtn">+ Planifier une formation</button>':""}</div>
  <div class="calendar-grid">${data.length?data.map(e=>`<div class="card event-card"><span class="number">${esc(e.date)} • ${esc(e.time)}</span><h3>${esc(e.title)}</h3><p>${esc(e.moduleCode||"")}</p><p class="muted">${esc(e.location||"LSPD")} • Formateur: ${esc(e.trainerName)}</p><p class="muted">${esc(e.notes||"")}</p></div>`).join(""):'<div class="card">Aucune formation planifiée.</div>'}</div>`;
  $("newTrainingBtn")?.addEventListener("click",openTrainingForm);
}
function openTrainingForm(){
  showModal(`<h2>Planifier une formation</h2><form id="trainingForm"><div class="formgrid"><label class="field"><span>Titre</span><input id="tTitle" required></label><label class="field"><span>Module</span><select id="tModule">${modules.map(m=>`<option value="${m[0]}">${m[0]} — ${m[1]}</option>`).join("")}</select></label><label class="field"><span>Date</span><input id="tDate" type="date" required></label><label class="field"><span>Heure</span><input id="tTime" type="time" required></label><label class="field"><span>Lieu</span><input id="tLocation" value="LSPD"></label></div><label class="field full"><span>Notes</span><textarea id="tNotes" rows="4"></textarea></label><div id="trainingError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Planifier</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("trainingForm").onsubmit=saveTrainingEvent;
}
async function saveTrainingEvent(e){
  e.preventDefault();
  try{
    await addDoc(collection(db,"training_events"),{title:$("tTitle").value.trim(),moduleCode:$("tModule").value,date:$("tDate").value,time:$("tTime").value,location:$("tLocation").value.trim(),notes:$("tNotes").value.trim(),trainerId:window.LSPD.user.uid,trainerName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("TRAINING_EVENT",window.LSPD.user.uid,`${$("tDate").value} — ${$("tTitle").value.trim()}`);
    document.querySelector(".modal")?.remove();calendar();
  }catch(err){$("trainingError").textContent="Erreur : "+(err.code||err.message);}
}

async function requirements(){
  if(!isCommand())return;
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
  if(!isCommand())return;
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
  if(!isCommand())return;
  const ps=await getDocs(collection(db,"promotions")),data=ps.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${isChief()?'<button class="btn" id="newPromotionBtn">+ Enregistrer une promotion</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Ancien grade</th><th>Nouveau grade</th><th>Validé par</th></tr></thead><tbody>${data.length?data.map(p=>`<tr><td>${formatDate(p.createdAt)}</td><td>${esc(p.officerName)}</td><td>${esc(p.oldGrade)}</td><td>${esc(p.newGrade)}</td><td>${esc(p.approvedByName)}</td></tr>`).join(""):'<tr><td colspan="5">Aucune promotion.</td></tr>'}</tbody></table></div>`;
  $("newPromotionBtn")?.addEventListener("click",openPromotionForm);
}
async function openPromotionForm(){
  const users=await getUsers();
  showModal(`<h2>Enregistrer une promotion</h2><form id="promotionForm"><div class="formgrid"><label class="field"><span>Officier</span><select id="pOfficer">${users.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}" data-grade="${esc(o.grade)}">${esc(o.badge)} — ${esc(o.name)} — ${esc(o.grade)}</option>`).join("")}</select></label><label class="field"><span>Nouveau grade</span><select id="pNewGrade">${gradeList.map(g=>`<option>${g[0]}</option>`).join("")}</select></label></div><label class="field full"><span>Motif</span><textarea id="pComment" rows="4"></textarea></label><div id="promotionError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Valider</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("promotionForm").onsubmit=savePromotion;
}
async function savePromotion(e){
  e.preventDefault();const s=$("pOfficer"),uid=s.value,name=s.selectedOptions[0].dataset.name,oldGrade=s.selectedOptions[0].dataset.grade,newGrade=$("pNewGrade").value;
  try{
    await updateDoc(doc(db,"users",uid),{grade:newGrade,updatedAt:serverTimestamp()});
    await addDoc(collection(db,"promotions"),{officerId:uid,officerName:name,oldGrade,newGrade,comment:$("pComment").value.trim(),approvedById:window.LSPD.user.uid,approvedByName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addAudit("PROMOTION",uid,`${name}: ${oldGrade} → ${newGrade}`);document.querySelector(".modal")?.remove();promotions();
  }catch(err){$("promotionError").textContent="Erreur : "+(err.code||err.message);}
}

async function stats(){
  if(!isCommand())return;
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
    <div class="card"><h3>Gestion système</h3><div class="row"><span>Profils</span><b>${users.length}</b></div><div class="row"><span>Authentication</span><b>Firebase Console</b></div><div class="row"><span>Rôles & unités</span><b>Onglet Officiers</b></div></div>
    <div class="card"><h3>Archivage</h3><p class="muted">Pour retirer un officier des listes actives sans supprimer son historique, passe son statut à <b>Archivé</b>.</p></div>
  </div>`;
}

async function history(){
  if(!isCommand())return;
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
    if(isCommand()) evalSnap=await getDocs(collection(db,"evaluations"));
    else if(isFTO()) evalSnap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
    else evalSnap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
    const annSnap=await getDocs(collection(db,"announcements"));
    const incSnap=isCommand()
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
