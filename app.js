// LSPD Command Center — Phase 3
// Firebase Auth + Firestore officers + FTO evaluations + training progress + role-based UI.

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  collection, query, where, orderBy, serverTimestamp, Timestamp
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

window.LSPD = { auth, db, user: null, profile: null };

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
const statuses = ["Actif","En formation","Suspendu","Inactif"];

const criteria = [
  ["procedure","Procédure","Respect des étapes et SOP"],
  ["security","Sécurité","Sécurité personnelle, partenaires et public"],
  ["radio","Communication radio","Clarté, concision et pertinence"],
  ["judgment","Jugement","Décision adaptée à la situation"],
  ["attitude","Professionnalisme","Comportement, RP et attitude"],
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

const pageNames = {
  dashboard:"Dashboard", manual:"Manuel FTO", modules:"Formations",
  evaluations:"Évaluations", officers:"Officiers", grades:"Grades & responsabilités",
  scenarios:"Scénarios", history:"Historique"
};

function isChief(){ return window.LSPD.profile?.role === "Chief"; }
function isFTO(){ return ["FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(window.LSPD.profile?.role); }
function isCommand(){ return ["Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(window.LSPD.profile?.role); }

async function loadProfile(user){
  window.LSPD.user = user;
  try{
    const snap = await getDoc(doc(db,"users",user.uid));
    window.LSPD.profile = snap.exists() ? snap.data() : {
      name:"Profil non configuré", badge:"—", grade:"—", role:"Officer", status:"Profil Firestore manquant"
    };
  }catch(e){
    console.error(e);
    window.LSPD.profile = {name:"Erreur profil",badge:"—",grade:"—",role:"Officer",status:"Erreur Firestore"};
  }
  showApp();
  applyRoleVisibility();
  render("dashboard");
}

function showApp(){
  $("loginScreen")?.classList.add("hidden");
  $("appShell")?.classList.remove("hidden");
  if($("currentUser")) $("currentUser").textContent = window.LSPD.user?.email || "Connecté";
  if($("userPill")) $("userPill").textContent = `${window.LSPD.profile?.grade || "Officer"} • ${window.LSPD.profile?.role || "Officer"}`;
}
function showLogin(){
  $("loginScreen")?.classList.remove("hidden");
  $("appShell")?.classList.add("hidden");
}
async function handleLogin(e){
  e.preventDefault();
  $("loginError").textContent="";
  try{
    await signInWithEmailAndPassword(auth,$("loginEmail").value.trim(),$("loginPassword").value);
  }catch(err){
    console.error(err); $("loginError").textContent="Email ou mot de passe incorrect.";
  }
}
onAuthStateChanged(auth, async user=>{
  if(!user){ window.LSPD.user=null; window.LSPD.profile=null; showLogin(); return; }
  await loadProfile(user);
});
window.logoutLSPD = ()=>signOut(auth);

function applyRoleVisibility(){
  const buttons = [...document.querySelectorAll("#nav button")];
  buttons.forEach(b=>b.classList.remove("hidden"));
  if(!isFTO()){
    document.querySelector('#nav button[data-page="evaluations"]')?.classList.remove("hidden");
  }
  if(!isCommand()){
    document.querySelector('#nav button[data-page="officers"]')?.classList.add("hidden");
    document.querySelector('#nav button[data-page="history"]')?.classList.add("hidden");
  }
}

function render(page){
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("pageTitle").textContent=pageNames[page]||"LSPD";
  ({dashboard,manual,modules:modulesPage,evaluations,officers,grades:gradesPage,scenarios:scenariosPage,history}[page]||dashboard)();
}

async function dashboard(){
  const p=window.LSPD.profile;
  let myEvals = [];
  try{
    const q1 = query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid));
    const snap=await getDocs(q1);
    myEvals=snap.docs.map(d=>d.data());
  }catch(e){ console.warn(e); }
  const validated = myEvals.filter(e=>e.result==="Validé").length;
  const pct = Math.round((validated/modules.length)*100);

  $("content").innerHTML=`
  <div class="grid stats-grid">
    <div class="card"><div class="muted">Identité</div><div class="stat">${esc(p?.name)}</div><div class="muted">${esc(p?.badge)}</div></div>
    <div class="card"><div class="muted">Grade</div><div class="stat">${esc(p?.grade)}</div><div class="muted">${esc(p?.role)}</div></div>
    <div class="card"><div class="muted">Progression</div><div class="stat">${pct}%</div><div class="muted">${validated}/${modules.length} modules validés</div></div>
    <div class="card"><div class="muted">Statut</div><div class="stat">${esc(p?.status)}</div><div class="muted">profil Firebase</div></div>
  </div>
  <div class="section-title">Centre de formation</div>
  <div class="grid2">
    <div class="card">
      <h3>Progression personnelle</h3>
      <div class="progress"><i style="width:${pct}%"></i></div>
      <div class="muted" style="margin-top:8px">${validated} modules validés sur ${modules.length}</div>
      ${modules.slice(0,8).map(m=>{
        const ok=myEvals.some(e=>e.moduleCode===m[0] && e.result==="Validé");
        return `<div class="row"><span>${m[0]} — ${m[1]}</span><span class="tag ${ok?"green":""}">${ok?"Validé":"À faire"}</span></div>`;
      }).join("")}
    </div>
    <div class="card">
      <h3>Session</h3>
      <p><b>${esc(p?.name)}</b></p><p class="muted">${esc(window.LSPD.user?.email)}</p>
      <p class="muted">${isFTO()?"Accès FTO/Command actif.":"Accès Officer : consultation personnelle."}</p>
    </div>
  </div>`;
}

function manual(){
  $("content").innerHTML=`<div class="card"><h2>Manuel FTO LSPD</h2>
  <p class="muted">Briefing → démonstration → pratique → observation → feedback → validation → traçabilité.</p></div>
  <div class="section-title">Standards</div><div class="grid2">
  ${["Sécurité avant performance","Expliquer le pourquoi de chaque procédure","Traiter immédiatement les erreurs critiques","Feedback factuel et précis","Chaque validation doit être traçable","Même standard pour nouveaux et anciens"].map(x=>`<div class="card"><b>${x}</b></div>`).join("")}
  </div>`;
}

async function modulesPage(){
  let evals=[];
  try{
    const q1=query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid));
    const snap=await getDocs(q1); evals=snap.docs.map(d=>d.data());
  }catch(e){}
  $("content").innerHTML=`<div class="grid module-grid">${modules.map(m=>{
    const latest = evals.filter(e=>e.moduleCode===m[0]).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))[0];
    return `<div class="card module" data-module="${m[0]}"><span class="number">${m[0]} • ${m[3]}</span>
    <h3>${m[1]}</h3><p class="muted">${m[2]}</p>
    <span class="tag ${latest?.result==="Validé"?"green":latest?"orange":""}">${latest?.result||"À faire"}</span></div>`;
  }).join("")}</div>`;
  document.querySelectorAll(".module").forEach(c=>c.onclick=()=>openModule(c.dataset.module));
}

function openModule(id){
  const m=modules.find(x=>x[0]===id);
  showModal(`<h2>${m[0]} — ${m[1]}</h2><p>${m[2]}</p><h3>Déroulé FTO</h3>
  ${["Briefing et objectifs","Démonstration FTO","Mise en pratique","Questions/correction","Observation en situation"].map(x=>`<label class="check"><input type="checkbox">${x}</label>`).join("")}
  <button class="btn" id="closeModal">Fermer</button>`);
}

async function evaluations(){
  $("content").innerHTML=`<div class="card"><p class="muted">Chargement des évaluations...</p></div>`;
  try{
    let snap;
    if(isCommand()){
      snap=await getDocs(collection(db,"evaluations"));
    }else if(isFTO()){
      const q1=query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid));
      snap=await getDocs(q1);
    }else{
      const q1=query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid));
      snap=await getDocs(q1);
    }
    const data=snap.docs.map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));

    $("content").innerHTML=`
      <div class="toolbar">${isFTO()?'<button class="btn" id="newEvalBtn">+ Nouvelle évaluation</button>':""}</div>
      <div class="card table-card"><table class="table">
      <thead><tr><th>Date</th><th>Officier</th><th>FTO</th><th>Module</th><th>Score</th><th>Résultat</th><th>Commentaire</th></tr></thead>
      <tbody>${data.length?data.map(e=>`<tr>
        <td>${formatDate(e.createdAt)}</td><td>${esc(e.officerName)}</td><td>${esc(e.ftoName)}</td>
        <td>${esc(e.moduleCode)} — ${esc(e.moduleTitle)}</td><td>${esc(e.score)}/100</td>
        <td><span class="tag ${e.result==="Validé"?"green":e.result==="Échec"?"red":"orange"}">${esc(e.result)}</span></td>
        <td>${esc(e.comments||"")}</td></tr>`).join(""):'<tr><td colspan="7" class="muted">Aucune évaluation.</td></tr>'}
      </tbody></table></div>`;
    $("newEvalBtn")?.addEventListener("click",openEvaluationForm);
  }catch(e){
    console.error(e);
    $("content").innerHTML=`<div class="card"><h2>Erreur évaluations</h2><p class="muted">${esc(e.code||e.message)}</p></div>`;
  }
}

async function openEvaluationForm(){
  if(!isFTO()) return;
  const snap=await getDocs(collection(db,"users"));
  const officers=snap.docs.map(d=>({uid:d.id,...d.data()})).filter(o=>o.status!=="Inactif");
  showModal(`<h2>Nouvelle évaluation FTO</h2>
  <form id="evalForm">
    <div class="formgrid">
      <label class="field"><span>Officier évalué</span><select id="eOfficer" required>
        ${officers.map(o=>`<option value="${esc(o.uid)}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)} — ${esc(o.grade)}</option>`).join("")}
      </select></label>
      <label class="field"><span>Module</span><select id="eModule">
        ${modules.map(m=>`<option value="${m[0]}">${m[0]} — ${m[1]}</option>`).join("")}
      </select></label>
    </div>
    <h3>Critères</h3>
    <div class="criteria-grid">
      ${criteria.map(c=>`<label class="criterion"><span><b>${c[1]}</b><small>${c[2]}</small></span>
      <select class="criterion-score" data-key="${c[0]}">
        <option value="5">5 — Excellent</option><option value="4">4 — Très bien</option>
        <option value="3" selected>3 — Conforme</option><option value="2">2 — À améliorer</option>
        <option value="1">1 — Insuffisant</option>
      </select></label>`).join("")}
    </div>
    <label class="field full"><span>Commentaires FTO</span><textarea id="eComments" rows="5" placeholder="Points forts, erreurs, axes d'amélioration, actions à suivre..."></textarea></label>
    <div class="score-preview">Score calculé : <b id="scorePreview">60/100</b> — <span id="resultPreview">À revoir</span></div>
    <div id="evalError" class="error"></div>
    <div class="modal-actions"><button class="btn" type="submit">Enregistrer l'évaluation</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div>
  </form>`);
  document.querySelectorAll(".criterion-score").forEach(s=>s.addEventListener("change",updateEvalPreview));
  updateEvalPreview();
  $("evalForm").addEventListener("submit",saveEvaluation);
}

function updateEvalPreview(){
  const vals=[...document.querySelectorAll(".criterion-score")].map(s=>Number(s.value));
  const score=Math.round((vals.reduce((a,b)=>a+b,0)/(vals.length*5))*100);
  const result=score>=75?"Validé":score>=55?"À revoir":"Échec";
  $("scorePreview").textContent=`${score}/100`;
  $("resultPreview").textContent=result;
}

async function saveEvaluation(e){
  e.preventDefault();
  const officerSelect=$("eOfficer");
  const officerId=officerSelect.value;
  const officerName=officerSelect.selectedOptions[0].dataset.name;
  const moduleCode=$("eModule").value;
  const module=modules.find(m=>m[0]===moduleCode);
  const values={};
  [...document.querySelectorAll(".criterion-score")].forEach(s=>values[s.dataset.key]=Number(s.value));
  const vals=Object.values(values);
  const score=Math.round((vals.reduce((a,b)=>a+b,0)/(vals.length*5))*100);
  const result=score>=75?"Validé":score>=55?"À revoir":"Échec";
  const payload={
    officerId, officerName, ftoId:window.LSPD.user.uid, ftoName:window.LSPD.profile.name,
    moduleCode, moduleTitle:module[1], criteria:values, score, result,
    comments:$("eComments").value.trim(), createdAt:serverTimestamp()
  };
  try{
    await addDoc(collection(db,"evaluations"),payload);
    await addDoc(collection(db,"audit_logs"),{
      actorId:window.LSPD.user.uid, actorName:window.LSPD.profile.name,
      action:"CREATE_EVALUATION", targetId:officerId,
      details:`${moduleCode} — ${result} — ${score}/100`, createdAt:serverTimestamp()
    });
    document.querySelector(".modal")?.remove();
    evaluations();
  }catch(err){
    console.error(err); $("evalError").textContent="Enregistrement impossible : "+(err.code||err.message);
  }
}

async function officers(){
  if(!isCommand()){
    $("content").innerHTML=`<div class="card"><h2>Accès restreint</h2><p class="muted">Réservé au commandement.</p></div>`;return;
  }
  try{
    const snap=await getDocs(collection(db,"users"));
    const data=snap.docs.map(d=>({uid:d.id,...d.data()})).sort((a,b)=>(a.badge||"").localeCompare(b.badge||"",undefined,{numeric:true}));
    $("content").innerHTML=`<div class="toolbar"><input id="officerSearch" class="search" placeholder="Rechercher un officier...">${isChief()?'<button class="btn" id="addOfficerBtn">+ Ajouter un profil</button>':""}</div>
    <div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Statut</th>${isChief()?"<th></th>":""}</tr></thead><tbody id="officerRows">${officerRows(data)}</tbody></table></div>`;
    $("officerSearch").addEventListener("input",()=>{
      const s=$("officerSearch").value.toLowerCase();
      $("officerRows").innerHTML=officerRows(data.filter(o=>[o.badge,o.name,o.grade,o.role,o.status].some(v=>String(v||"").toLowerCase().includes(s))));
      bindOfficerEdit(data);
    });
    $("addOfficerBtn")?.addEventListener("click",()=>openOfficerForm());
    bindOfficerEdit(data);
  }catch(e){ $("content").innerHTML=`<div class="card"><p class="muted">${esc(e.code||e.message)}</p></div>`; }
}
function officerRows(data){
  return data.length?data.map(o=>`<tr><td>${esc(o.badge)}</td><td><b>${esc(o.name)}</b></td><td>${esc(o.grade)}</td><td><span class="tag">${esc(o.role)}</span></td><td>${esc(o.status)}</td>${isChief()?`<td><button class="btn secondary edit-officer" data-uid="${esc(o.uid)}">Modifier</button></td>`:""}</tr>`).join(""):'<tr><td colspan="6">Aucun officier.</td></tr>';
}
function bindOfficerEdit(data){
  document.querySelectorAll(".edit-officer").forEach(btn=>btn.onclick=()=>openOfficerForm(data.find(o=>o.uid===btn.dataset.uid)));
}
function openOfficerForm(o=null){
  if(!isChief()) return;
  showModal(`<h2>${o?"Modifier":"Ajouter"} un profil</h2>
  <form id="officerForm"><div class="formgrid">
  <label class="field full"><span>UID Firebase Authentication</span><input id="fUid" ${o?"readonly":""} required value="${esc(o?.uid||"")}"></label>
  <label class="field"><span>Matricule</span><input id="fBadge" required value="${esc(o?.badge||"")}"></label>
  <label class="field"><span>Nom RP</span><input id="fName" required value="${esc(o?.name||"")}"></label>
  <label class="field"><span>Grade</span><select id="fGrade">${gradeList.map(g=>`<option ${g[0]===o?.grade?"selected":""}>${g[0]}</option>`).join("")}</select></label>
  <label class="field"><span>Rôle</span><select id="fRole">${roles.map(r=>`<option ${r===o?.role?"selected":""}>${r}</option>`).join("")}</select></label>
  <label class="field"><span>Statut</span><select id="fStatus">${statuses.map(s=>`<option ${s===o?.status?"selected":""}>${s}</option>`).join("")}</select></label>
  <label class="field"><span>Division</span><input id="fDivision" value="${esc(o?.division||"Patrol")}"></label>
  </div><div id="formError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("officerForm").addEventListener("submit",saveOfficerProfile);
}
async function saveOfficerProfile(e){
  e.preventDefault();
  const uid=$("fUid").value.trim();
  const payload={badge:$("fBadge").value.trim(),name:$("fName").value.trim(),grade:$("fGrade").value,role:$("fRole").value,status:$("fStatus").value,division:$("fDivision").value.trim(),updatedAt:serverTimestamp()};
  try{
    const ref=doc(db,"users",uid), existing=await getDoc(ref);
    if(existing.exists()) await updateDoc(ref,payload); else await setDoc(ref,{...payload,createdAt:serverTimestamp()});
    await addDoc(collection(db,"audit_logs"),{actorId:window.LSPD.user.uid,actorName:window.LSPD.profile.name,action:existing.exists()?"UPDATE_OFFICER":"CREATE_OFFICER",targetId:uid,details:`${payload.badge} — ${payload.name} — ${payload.grade}`,createdAt:serverTimestamp()});
    document.querySelector(".modal")?.remove(); officers();
  }catch(err){ $("formError").textContent="Erreur : "+(err.code||err.message); }
}

function gradesPage(){
  $("content").innerHTML=`<div class="grid2">${gradeList.map((g,i)=>`<div class="card grade"><span class="number">${String(i+1).padStart(2,"0")}</span><h3>${g[0]}</h3><p><b>${g[1]}</b></p><p class="muted">${g[2]}</p></div>`).join("")}</div>`;
}
function scenariosPage(){
  $("content").innerHTML=`<div class="grid module-grid">${scenarios.map(s=>`<div class="card"><span class="number">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p><p class="muted">${s[3]}</p><button class="btn secondary scenario-btn" data-id="${s[0]}">Lancer</button></div>`).join("")}</div>`;
  document.querySelectorAll(".scenario-btn").forEach(b=>b.onclick=()=>startScenario(b.dataset.id));
}
function startScenario(id){
  const s=scenarios.find(x=>x[0]===id);
  showModal(`<h2>${s[0]} — ${s[1]}</h2><p>${s[2]}</p><h3>Points à observer</h3>${s[3].split(",").map(x=>`<label class="check"><input type="checkbox">${x.trim()}</label>`).join("")}<button class="btn" id="closeModal">Terminer</button>`);
}

async function history(){
  if(!isCommand()){
    $("content").innerHTML=`<div class="card"><h2>Accès restreint</h2></div>`;return;
  }
  try{
    const snap=await getDocs(collection(db,"audit_logs"));
    const data=snap.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détails</th></tr></thead><tbody>
    ${data.length?data.map(h=>`<tr><td>${formatDate(h.createdAt)}</td><td>${esc(h.actorName)}</td><td>${esc(h.action)}</td><td>${esc(h.details)}</td></tr>`).join(""):'<tr><td colspan="4">Aucun historique.</td></tr>'}
    </tbody></table></div>`;
  }catch(e){ $("content").innerHTML=`<div class="card"><p>${esc(e.code||e.message)}</p></div>`; }
}

function formatDate(ts){
  if(!ts) return "—";
  try{
    const d=ts.toDate?ts.toDate():new Date(ts.seconds*1000);
    return d.toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});
  }catch(e){ return "—"; }
}
function showModal(html){
  document.querySelector(".modal")?.remove();
  document.body.insertAdjacentHTML("beforeend",`<div class="modal"><div class="modalbox">${html}</div></div>`);
  $("closeModal")?.addEventListener("click",()=>document.querySelector(".modal")?.remove());
}

document.addEventListener("DOMContentLoaded",()=>{
  $("loginForm")?.addEventListener("submit",handleLogin);
  $("logoutBtn")?.addEventListener("click",window.logoutLSPD);
  $("nav")?.addEventListener("click",e=>{const b=e.target.closest("button[data-page]");if(b)render(b.dataset.page);});
});
