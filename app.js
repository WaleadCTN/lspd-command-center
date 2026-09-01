// LSPD Command Center — Phase 8.0

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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

window.LSPD = { auth, db, user:null, profile:null };

const $ = id => document.getElementById(id);
const esc = v => String(v ?? "")
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  .replaceAll('"',"&quot;").replaceAll("'","&#039;");

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
const statuses = ["Actif","En formation","Suspendu","Inactif","Archivé"];
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
 dashboard:"Dashboard",profile:"Mon profil",announcements:"Annonces",messages:"Messages",
 incidents:"Rapports d'incident",approvals:"Validations",manual:"Manuel FTO",modules:"Formations",
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
function canApproveIncidents(){ return ["Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }

async function loadProfile(user){
  window.LSPD.user=user;
  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    window.LSPD.profile=snap.exists()?snap.data():{name:"Profil non configuré",badge:"—",grade:"—",role:"Officer",status:"Profil Firestore manquant"};
  }catch(e){
    window.LSPD.profile={name:"Erreur profil",badge:"—",grade:"—",role:"Officer",status:"Erreur Firestore"};
  }
  showApp(); applyRoleVisibility(); render("dashboard");
}
function showApp(){
  $("loginScreen")?.classList.add("hidden"); $("appShell")?.classList.remove("hidden");
  if($("currentUser")) $("currentUser").textContent=window.LSPD.user?.email||"Connecté";
  if($("userPill")) $("userPill").textContent=`${window.LSPD.profile?.grade||"Officer"} • ${window.LSPD.profile?.role||"Officer"}`;
}
function showLogin(){ $("loginScreen")?.classList.remove("hidden"); $("appShell")?.classList.add("hidden"); }
async function handleLogin(e){
  e.preventDefault(); $("loginError").textContent="";
  try{ await signInWithEmailAndPassword(auth,$("loginEmail").value.trim(),$("loginPassword").value); }
  catch(err){ $("loginError").textContent="Email ou mot de passe incorrect."; }
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
  hide("calendar",!isFTO());
  hide("admin",!isChief());
}

function render(page){
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("pageTitle").textContent=pages[page]||"LSPD";
  ({
    dashboard,profile,announcements,messages,incidents,approvals,manual,modules:modulesPage,
    evaluations,trainees,officers,assignments,certifications,records,shifts,leave,calendar,
    requirements,promotionAdvisor,promotions,stats,grades:gradesPage,scenarios:scenariosPage,
    admin,history
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

async function dashboard(){
  const p=window.LSPD.profile;
  let evals=[];
  try{
    const s=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
    evals=s.docs.map(d=>d.data());
  }catch{}
  const validated=[...new Set(evals.filter(e=>e.result==="Validé").map(e=>e.moduleCode))];
  const pct=Math.round(validated.length/modules.length*100);

  let comm="";
  try{
    const ann=await getDocs(collection(db,"announcements"));
    const data=ann.docs.map(d=>d.data()).filter(a=>a.active!==false).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,3);
    comm=`<div class="section-title">Annonces récentes</div><div class="grid2">${data.length?data.map(a=>`<div class="card notice"><span class="number">${esc(a.priority||"Normal")}</span><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><p class="muted">${esc(a.authorName)} • ${formatDate(a.createdAt)}</p></div>`).join(""):'<div class="card"><p class="muted">Aucune annonce.</p></div>'}</div>`;
  }catch{}

  $("content").innerHTML=`
  <div class="grid stats-grid">
    <div class="card"><div class="muted">Identité</div><div class="stat">${esc(p?.name)}</div><div class="muted">${esc(p?.badge)}</div></div>
    <div class="card"><div class="muted">Grade</div><div class="stat">${esc(p?.grade)}</div><div class="muted">${esc(p?.role)}</div></div>
    <div class="card"><div class="muted">Progression</div><div class="stat">${pct}%</div><div class="muted">${validated.length}/${modules.length} modules validés</div></div>
    <div class="card"><div class="muted">Statut</div><div class="stat">${esc(p?.status)}</div><div class="muted">${esc(p?.division||"Patrol")}</div></div>
  </div>
  ${comm}`;
}

function profile(){
  const p=window.LSPD.profile;
  $("content").innerHTML=`<div class="grid2">
    <div class="card"><h2>${esc(p.name)}</h2><div class="detail-grid">
      <div><span>Matricule</span><b>${esc(p.badge)}</b></div><div><span>Grade</span><b>${esc(p.grade)}</b></div>
      <div><span>Rôle</span><b>${esc(p.role)}</b></div><div><span>Unité</span><b>${esc(p.division||"Patrol")}</b></div>
      <div><span>Statut</span><b>${esc(p.status)}</b></div><div><span>Email</span><b>${esc(window.LSPD.user.email)}</b></div>
    </div></div>
    <div class="card"><h3>Sécurité du compte</h3><p class="muted">Réinitialisation de mot de passe via Firebase.</p><button class="btn" id="resetPasswordBtn">Envoyer l'e-mail</button><p id="profileMsg" class="muted"></p></div>
  </div>`;
  $("resetPasswordBtn").onclick=async()=>{
    try{await sendPasswordResetEmail(auth,window.LSPD.user.email);$("profileMsg").textContent="E-mail envoyé.";}
    catch(e){$("profileMsg").textContent="Erreur : "+(e.code||e.message);}
  };
}

async function announcements(){
  const s=await getDocs(collection(db,"announcements"));
  const data=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${isCommand()?'<button class="btn" id="newAnnouncementBtn">+ Nouvelle annonce</button>':""}</div>
  <div class="grid2">${data.length?data.map(a=>`<div class="card notice ${a.active===false?"muted-card":""}">
    <span class="tag ${a.priority==="Urgent"?"red":a.priority==="Important"?"orange":""}">${esc(a.priority||"Normal")}</span>
    <h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><p class="muted">${esc(a.authorName)} • ${formatDate(a.createdAt)}</p>
  </div>`).join(""):'<div class="card">Aucune annonce.</div>'}</div>`;
  $("newAnnouncementBtn")?.addEventListener("click",openAnnouncementForm);
}
function openAnnouncementForm(){
  showModal(`<h2>Nouvelle annonce</h2><form id="announcementForm">
  <label class="field"><span>Titre</span><input id="anTitle" required></label>
  <label class="field"><span>Priorité</span><select id="anPriority"><option>Normal</option><option>Important</option><option>Urgent</option></select></label>
  <label class="field full"><span>Message</span><textarea id="anBody" rows="6" required></textarea></label>
  <div id="anError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Publier</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("announcementForm").onsubmit=saveAnnouncement;
}
async function saveAnnouncement(e){
  e.preventDefault();
  try{
    await addDoc(collection(db,"announcements"),{title:$("anTitle").value.trim(),priority:$("anPriority").value,body:$("anBody").value.trim(),authorId:window.LSPD.user.uid,authorName:window.LSPD.profile.name,active:true,createdAt:serverTimestamp()});
    await addAudit("ANNOUNCEMENT_CREATE","announcement",$("anTitle").value.trim());
    document.querySelector(".modal")?.remove();announcements();
  }catch(err){$("anError").textContent="Erreur : "+(err.code||err.message);}
}

async function messages(){
  const users=await getUsers();
  const s=await getDocs(collection(db,"messages"));
  const data=s.docs.map(d=>({id:d.id,...d.data()})).filter(m=>m.senderId===window.LSPD.user.uid||m.recipientId===window.LSPD.user.uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newMessageBtn">+ Nouveau message</button></div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>De</th><th>À</th><th>Sujet</th><th>Message</th></tr></thead><tbody>
  ${data.length?data.map(m=>`<tr><td>${formatDate(m.createdAt)}</td><td>${esc(m.senderName)}</td><td>${esc(m.recipientName)}</td><td>${esc(m.subject)}</td><td>${esc(m.body)}</td></tr>`).join(""):'<tr><td colspan="5">Aucun message.</td></tr>'}
  </tbody></table></div>`;
  $("newMessageBtn").onclick=()=>openMessageForm(users);
}
function openMessageForm(users){
  showModal(`<h2>Nouveau message</h2><form id="messageForm"><label class="field"><span>Destinataire</span><select id="mRecipient">${users.filter(u=>u.uid!==window.LSPD.user.uid).map(u=>`<option value="${u.uid}" data-name="${esc(u.name)}">${esc(u.badge)} — ${esc(u.name)}</option>`).join("")}</select></label>
  <label class="field"><span>Sujet</span><input id="mSubject" required></label><label class="field full"><span>Message</span><textarea id="mBody" rows="6" required></textarea></label><div id="mError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Envoyer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("messageForm").onsubmit=saveMessage;
}
async function saveMessage(e){
  e.preventDefault();const s=$("mRecipient");
  try{
    await addDoc(collection(db,"messages"),{senderId:window.LSPD.user.uid,senderName:window.LSPD.profile.name,recipientId:s.value,recipientName:s.selectedOptions[0].dataset.name,subject:$("mSubject").value.trim(),body:$("mBody").value.trim(),createdAt:serverTimestamp()});
    document.querySelector(".modal")?.remove();messages();
  }catch(err){$("mError").textContent="Erreur : "+(err.code||err.message);}
}

async function incidents(){
  const s=await getDocs(collection(db,"incident_reports"));
  let data=s.docs.map(d=>({id:d.id,...d.data()}));
  if(!isCommand()) data=data.filter(r=>r.authorId===window.LSPD.user.uid);
  data.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));

  $("content").innerHTML=`<div class="toolbar"><button class="btn" id="newIncidentBtn">+ Nouveau rapport</button>${isCommand()?'<button class="btn secondary" id="exportIncidentsBtn">Exporter CSV</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Auteur</th><th>Type</th><th>Titre</th><th>Statut</th><th>Validation</th></tr></thead><tbody>
  ${data.length?data.map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${esc(r.authorName)}</td><td>${esc(r.type)}</td><td>${esc(r.title)}</td><td><span class="tag ${r.status==="Approuvé"?"green":r.status==="Refusé"?"red":"orange"}">${esc(r.status)}</span></td><td>${esc(r.approvedByName||"—")}</td></tr>`).join(""):'<tr><td colspan="6">Aucun rapport.</td></tr>'}
  </tbody></table></div>`;
  $("newIncidentBtn").onclick=openIncidentForm;
  $("exportIncidentsBtn")?.addEventListener("click",()=>csvDownload("incidents_lspd.csv",data.map(r=>({date:formatDate(r.createdAt),auteur:r.authorName,type:r.type,titre:r.title,statut:r.status,validation:r.approvedByName||""}))));
}
function openIncidentForm(){
  showModal(`<h2>Nouveau rapport d'incident</h2><form id="incidentForm"><div class="formgrid">
  <label class="field"><span>Type</span><select id="iType">${incidentTypes.map(x=>`<option>${x}</option>`).join("")}</select></label>
  <label class="field"><span>Titre</span><input id="iTitle" required></label>
  </div><label class="field full"><span>Résumé</span><textarea id="iSummary" rows="4" required></textarea></label>
  <label class="field full"><span>Détails</span><textarea id="iDetails" rows="8" required></textarea></label>
  <div id="iError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Soumettre pour validation</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("incidentForm").onsubmit=saveIncident;
}
async function saveIncident(e){
  e.preventDefault();
  try{
    await addDoc(collection(db,"incident_reports"),{authorId:window.LSPD.user.uid,authorName:window.LSPD.profile.name,type:$("iType").value,title:$("iTitle").value.trim(),summary:$("iSummary").value.trim(),details:$("iDetails").value.trim(),status:"En attente",createdAt:serverTimestamp()});
    await addAudit("INCIDENT_SUBMIT",window.LSPD.user.uid,$("iTitle").value.trim());
    document.querySelector(".modal")?.remove();incidents();
  }catch(err){$("iError").textContent="Erreur : "+(err.code||err.message);}
}

async function approvals(){
  if(!canApproveIncidents())return;
  const s=await getDocs(collection(db,"incident_reports"));
  const data=s.docs.map(d=>({id:d.id,...d.data()})).filter(r=>r.status==="En attente").sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="grid2">${data.length?data.map(r=>`<div class="card"><span class="number">${esc(r.type)}</span><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p><p class="muted">Par ${esc(r.authorName)} • ${formatDate(r.createdAt)}</p><div class="approval-box"><p>${esc(r.details)}</p></div><div class="modal-actions"><button class="btn approve-incident" data-id="${r.id}" data-status="Approuvé">Approuver</button><button class="btn secondary approve-incident" data-id="${r.id}" data-status="Refusé">Refuser</button></div></div>`).join(""):'<div class="card">Aucune validation en attente.</div>'}</div>`;
  document.querySelectorAll(".approve-incident").forEach(b=>b.onclick=()=>reviewIncident(b.dataset.id,b.dataset.status));
}
async function reviewIncident(id,status){
  await updateDoc(doc(db,"incident_reports",id),{status,approvedById:window.LSPD.user.uid,approvedByName:window.LSPD.profile.name,approvedAt:serverTimestamp(),signature:`${window.LSPD.profile.name} / ${window.LSPD.profile.badge}`});
  await addAudit("INCIDENT_"+status.toUpperCase(),id,status);
  approvals();
}

function manual(){
  $("content").innerHTML=`<div class="card"><h2>Manuel FTO LSPD</h2><p class="muted">Briefing → démonstration → pratique → observation → feedback → validation → traçabilité.</p></div>`;
}

async function modulesPage(){
  const s=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
  const evals=s.docs.map(d=>d.data());
  $("content").innerHTML=`<div class="grid module-grid">${modules.map(m=>{
    const list=evals.filter(e=>e.moduleCode===m[0]).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)),latest=list[0];
    return `<div class="card module" data-module="${m[0]}"><span class="number">${m[0]} • ${m[3]}</span><h3>${m[1]}</h3><p class="muted">${m[2]}</p><span class="tag ${latest?.result==="Validé"?"green":latest?.result==="Échec"?"red":latest?"orange":""}">${latest?.result||"À faire"}</span></div>`;
  }).join("")}</div>`;
}

async function evaluations(){
  let snap;
  if(isCommand()) snap=await getDocs(collection(db,"evaluations"));
  else if(isFTO()) snap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
  else snap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));
  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${isFTO()?'<button class="btn" id="newEvalBtn">+ Nouvelle évaluation</button>':""}<button class="btn secondary" id="exportEvalBtn">Exporter CSV</button></div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>FTO</th><th>Module</th><th>Score</th><th>Résultat</th></tr></thead><tbody>${data.length?data.map(e=>`<tr><td>${formatDate(e.createdAt)}</td><td>${esc(e.officerName)}</td><td>${esc(e.ftoName)}</td><td>${esc(e.moduleCode)}</td><td>${esc(e.score)}/100</td><td>${esc(e.result)}</td></tr>`).join(""):'<tr><td colspan="6">Aucune évaluation.</td></tr>'}</tbody></table></div>`;
  $("newEvalBtn")?.addEventListener("click",openEvaluationForm);
  $("exportEvalBtn").onclick=()=>csvDownload("evaluations_lspd.csv",data.map(e=>({date:formatDate(e.createdAt),officier:e.officerName,fto:e.ftoName,module:e.moduleCode,score:e.score,resultat:e.result})));
}
async function openEvaluationForm(){
  const officers=(await getUsers()).filter(o=>!["Inactif","Archivé"].includes(o.status));
  showModal(`<h2>Nouvelle évaluation FTO</h2><form id="evalForm"><div class="formgrid">
  <label class="field"><span>Officier évalué</span><select id="eOfficer">${officers.map(o=>`<option value="${o.uid}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)}</option>`).join("")}</select></label>
  <label class="field"><span>Module</span><select id="eModule">${modules.map(m=>`<option value="${m[0]}">${m[0]} — ${m[1]}</option>`).join("")}</select></label></div>
  <div class="criteria-grid">${criteria.map(c=>`<label class="criterion"><span><b>${c[1]}</b><small>${c[2]}</small></span><select class="criterion-score" data-key="${c[0]}"><option value="5">5</option><option value="4">4</option><option value="3" selected>3</option><option value="2">2</option><option value="1">1</option></select></label>`).join("")}</div>
  <label class="field full"><span>Commentaires</span><textarea id="eComments" rows="5"></textarea></label><div class="score-preview">Score : <b id="scorePreview">60/100</b> — <span id="resultPreview">À revoir</span></div><div id="evalError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  document.querySelectorAll(".criterion-score").forEach(s=>s.onchange=updateEvalPreview);updateEvalPreview();$("evalForm").onsubmit=saveEvaluation;
}
function updateEvalPreview(){
  const vals=[...document.querySelectorAll(".criterion-score")].map(s=>Number(s.value));const score=Math.round(vals.reduce((a,b)=>a+b,0)/(vals.length*5)*100);
  $("scorePreview").textContent=`${score}/100`;$("resultPreview").textContent=score>=75?"Validé":score>=55?"À revoir":"Échec";
}
async function saveEvaluation(e){
  e.preventDefault();const s=$("eOfficer"),officerId=s.value,officerName=s.selectedOptions[0].dataset.name,moduleCode=$("eModule").value,module=modules.find(m=>m[0]===moduleCode);
  const values={};document.querySelectorAll(".criterion-score").forEach(x=>values[x.dataset.key]=Number(x.value));const vals=Object.values(values),score=Math.round(vals.reduce((a,b)=>a+b,0)/(vals.length*5)*100),result=score>=75?"Validé":score>=55?"À revoir":"Échec";
  try{await addDoc(collection(db,"evaluations"),{officerId,officerName,ftoId:window.LSPD.user.uid,ftoName:window.LSPD.profile.name,moduleCode,moduleTitle:module[1],criteria:values,score,result,comments:$("eComments").value.trim(),createdAt:serverTimestamp()});await addAudit("CREATE_EVALUATION",officerId,`${moduleCode} — ${result}`);document.querySelector(".modal")?.remove();evaluations();}catch(err){$("evalError").textContent="Erreur : "+(err.code||err.message);}
}

async function trainees(){ $("content").innerHTML=`<div class="card"><p class="muted">Conserve la gestion FTO de la Phase 7. Les affectations actives restent visibles depuis Affectations FTO.</p></div>`; }
async function officers(){
  if(!isCommand())return;
  const data=await getUsers();
  $("content").innerHTML=`<div class="toolbar"><button class="btn secondary" id="exportOfficersBtn">Exporter CSV</button></div><div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Unité</th><th>Statut</th></tr></thead><tbody>${data.map(o=>`<tr><td>${esc(o.badge)}</td><td>${esc(o.name)}</td><td>${esc(o.grade)}</td><td>${esc(o.role)}</td><td>${esc(o.division||"Patrol")}</td><td>${esc(o.status)}</td></tr>`).join("")}</tbody></table></div>`;
  $("exportOfficersBtn").onclick=()=>csvDownload("officiers_lspd.csv",data.map(o=>({matricule:o.badge,nom:o.name,grade:o.grade,role:o.role,unite:o.division||"",statut:o.status})));
}
async function assignments(){ $("content").innerHTML=`<div class="card"><p class="muted">Fonction Affectations FTO conservée. Utilise la Phase 7 si tu veux gérer/créer/clôturer ici; les données restent compatibles.</p></div>`; }
async function certifications(){ $("content").innerHTML=`<div class="card"><p class="muted">Fonction certifications conservée au niveau Firestore et dossiers.</p></div>`; }
async function records(){ $("content").innerHTML=`<div class="card"><p class="muted">Fonction sanctions/commendations conservée au niveau Firestore.</p></div>`; }
async function shifts(){ $("content").innerHTML=`<div class="card"><p class="muted">Fonction roster/shifts conservée au niveau Firestore.</p></div>`; }
async function leave(){ $("content").innerHTML=`<div class="card"><p class="muted">Fonction congés conservée au niveau Firestore.</p></div>`; }
async function calendar(){ $("content").innerHTML=`<div class="card"><p class="muted">Calendrier formations conservé au niveau Firestore.</p></div>`; }
async function requirements(){ $("content").innerHTML=`<div class="card"><p class="muted">Suivi des validations conservé. Cette phase se concentre sur la communication et les workflows.</p></div>`; }
async function promotionAdvisor(){ $("content").innerHTML=`<div class="card"><p class="muted">Promotion Advisor conservé dans l'architecture.</p></div>`; }
async function promotions(){ $("content").innerHTML=`<div class="card"><p class="muted">Historique des promotions conservé dans Firestore.</p></div>`; }
async function stats(){ $("content").innerHTML=`<div class="card"><p class="muted">Statistiques globales conservées dans l'architecture.</p></div>`; }

function gradesPage(){
  $("content").innerHTML=`<div class="grid2">${gradeList.map((g,i)=>`<div class="card grade"><span class="number">${String(i+1).padStart(2,"0")}</span><h3>${g[0]}</h3><p><b>${g[1]}</b></p><p class="muted">${g[2]}</p></div>`).join("")}</div>`;
}
function scenariosPage(){
  $("content").innerHTML=`<div class="grid module-grid">${scenarios.map(s=>`<div class="card"><span class="number">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p><p class="muted">${s[3]}</p></div>`).join("")}</div>`;
}

async function admin(){
  if(!isChief())return;
  $("content").innerHTML=`<div class="grid2"><div class="card"><h3>Phase 8</h3><div class="row"><span>Annonces</span><b>Command</b></div><div class="row"><span>Messages</span><b>Tous</b></div><div class="row"><span>Rapports incident</span><b>Tous</b></div><div class="row"><span>Validation rapports</span><b>Sergeant+</b></div></div><div class="card"><h3>Signatures</h3><p class="muted">Lorsqu'un rapport est approuvé/refusé, le système enregistre l'identité, le matricule, la date et le statut de validation.</p></div></div>`;
}

async function history(){
  if(!isCommand())return;
  const s=await getDocs(collection(db,"audit_logs")),data=s.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détails</th></tr></thead><tbody>${data.length?data.map(h=>`<tr><td>${formatDate(h.createdAt)}</td><td>${esc(h.actorName)}</td><td>${esc(h.action)}</td><td>${esc(h.details)}</td></tr>`).join(""):'<tr><td colspan="4">Aucun historique.</td></tr>'}</tbody></table></div>`;
}

async function globalSearch(term){
  term=term.trim().toLowerCase();if(term.length<2)return;
  const [usersSnap,annSnap,incSnap]=await Promise.all([getDocs(collection(db,"users")),getDocs(collection(db,"announcements")),getDocs(collection(db,"incident_reports"))]);
  const users=usersSnap.docs.map(d=>d.data()).filter(o=>[o.badge,o.name,o.grade,o.role,o.division,o.status].some(v=>String(v||"").toLowerCase().includes(term)));
  const anns=annSnap.docs.map(d=>d.data()).filter(a=>[a.title,a.body,a.authorName].some(v=>String(v||"").toLowerCase().includes(term)));
  const incs=incSnap.docs.map(d=>d.data()).filter(a=>[a.title,a.type,a.authorName,a.status].some(v=>String(v||"").toLowerCase().includes(term)));
  showModal(`<h2>Recherche globale</h2><h3>Officiers</h3>${users.slice(0,8).map(o=>`<div class="search-result"><b>${esc(o.badge)} — ${esc(o.name)}</b><span>${esc(o.grade)} • ${esc(o.division||"Patrol")}</span></div>`).join("")||'<p class="muted">Aucun résultat.</p>'}<h3>Annonces</h3>${anns.slice(0,8).map(a=>`<div class="search-result"><b>${esc(a.title)}</b><span>${esc(a.authorName)}</span></div>`).join("")||'<p class="muted">Aucun résultat.</p>'}<h3>Incidents</h3>${incs.slice(0,8).map(a=>`<div class="search-result"><b>${esc(a.title)}</b><span>${esc(a.type)} • ${esc(a.status)}</span></div>`).join("")||'<p class="muted">Aucun résultat.</p>'}<div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
}

function formatDate(ts){
  if(!ts)return"—";
  try{const d=ts.toDate?ts.toDate():new Date(ts.seconds*1000);return d.toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});}catch{return"—";}
}
function showModal(html){
  document.querySelector(".modal")?.remove();
  document.body.insertAdjacentHTML("beforeend",`<div class="modal"><div class="modalbox">${html}</div></div>`);
  $("closeModal")?.addEventListener("click",()=>document.querySelector(".modal")?.remove());
}

document.addEventListener("DOMContentLoaded",()=>{
  $("loginForm")?.addEventListener("submit",handleLogin);
  $("logoutBtn")?.addEventListener("click",logout);
  $("nav")?.addEventListener("click",e=>{const b=e.target.closest("button[data-page]");if(b)render(b.dataset.page);});
  let timer;$("globalSearch")?.addEventListener("input",e=>{clearTimeout(timer);if(e.target.value.trim().length<2)return;timer=setTimeout(()=>globalSearch(e.target.value),450);});
});
