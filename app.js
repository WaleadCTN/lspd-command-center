// LSPD Command Center — Phase 4.0
// Auth + Personnel + FTO Evaluations + Officer Files + Trainees + Promotions + Command Stats

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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
const statuses = ["Actif","En formation","Suspendu","Inactif"];
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
 dashboard:"Dashboard", manual:"Manuel FTO", modules:"Formations",
 evaluations:"Évaluations", trainees:"Mes recrues", officers:"Officiers",
 promotions:"Promotions", stats:"Statistiques", grades:"Grades & responsabilités",
 scenarios:"Scénarios", history:"Historique"
};

function role(){ return window.LSPD.profile?.role; }
function isChief(){ return role()==="Chief"; }
function isFTO(){ return ["FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }
function isCommand(){ return ["Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(role()); }

async function loadProfile(user){
  window.LSPD.user=user;
  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    window.LSPD.profile=snap.exists()?snap.data():{name:"Profil non configuré",badge:"—",grade:"—",role:"Officer",status:"Profil Firestore manquant"};
  }catch(e){
    console.error(e);
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
  catch(err){ console.error(err); $("loginError").textContent="Email ou mot de passe incorrect."; }
}
onAuthStateChanged(auth,async user=>{
  if(!user){window.LSPD.user=null;window.LSPD.profile=null;showLogin();return;}
  await loadProfile(user);
});
function logout(){ return signOut(auth); }

function applyRoleVisibility(){
  const hide=(page,yes)=>document.querySelector(`#nav button[data-page="${page}"]`)?.classList.toggle("hidden",yes);
  hide("trainees",!isFTO());
  hide("officers",!isCommand());
  hide("promotions",!isCommand());
  hide("stats",!isCommand());
  hide("history",!isCommand());
}

function render(page){
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("pageTitle").textContent=pages[page]||"LSPD";
  ({
    dashboard,manual,modules:modulesPage,evaluations,trainees,officers,
    promotions,stats,grades:gradesPage,scenarios:scenariosPage,history
  }[page]||dashboard)();
}

async function getMyEvaluations(){
  const q1=query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid));
  const snap=await getDocs(q1);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

async function dashboard(){
  const p=window.LSPD.profile;
  let evals=[]; try{evals=await getMyEvaluations();}catch{}
  const validated=[...new Set(evals.filter(e=>e.result==="Validé").map(e=>e.moduleCode))];
  const pct=Math.round(validated.length/modules.length*100);

  $("content").innerHTML=`
  <div class="grid stats-grid">
    <div class="card"><div class="muted">Identité</div><div class="stat">${esc(p?.name)}</div><div class="muted">${esc(p?.badge)}</div></div>
    <div class="card"><div class="muted">Grade</div><div class="stat">${esc(p?.grade)}</div><div class="muted">${esc(p?.role)}</div></div>
    <div class="card"><div class="muted">Progression</div><div class="stat">${pct}%</div><div class="muted">${validated.length}/${modules.length} modules validés</div></div>
    <div class="card"><div class="muted">Statut</div><div class="stat">${esc(p?.status)}</div><div class="muted">${esc(p?.division||"Patrol")}</div></div>
  </div>
  <div class="section-title">Progression personnelle</div>
  <div class="grid2">
    <div class="card">
      <div class="progress"><i style="width:${pct}%"></i></div>
      ${modules.slice(0,8).map(m=>`<div class="row"><span>${m[0]} — ${m[1]}</span><span class="tag ${validated.includes(m[0])?"green":""}">${validated.includes(m[0])?"Validé":"À faire"}</span></div>`).join("")}
    </div>
    <div class="card"><h3>Dossier</h3><p><b>${esc(p?.name)}</b></p><p class="muted">${esc(window.LSPD.user?.email)}</p><p class="muted">${isFTO()?"Accès FTO/Command actif":"Accès Officer"}</p></div>
  </div>`;
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
  $("content").innerHTML=`<div class="card"><p class="muted">Chargement...</p></div>`;
  try{
    let snap;
    if(isCommand()) snap=await getDocs(collection(db,"evaluations"));
    else if(isFTO()) snap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
    else snap=await getDocs(query(collection(db,"evaluations"),where("officerId","==",window.LSPD.user.uid)));

    const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    $("content").innerHTML=`<div class="toolbar">${isFTO()?'<button class="btn" id="newEvalBtn">+ Nouvelle évaluation</button>':""}</div>
    <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>FTO</th><th>Module</th><th>Score</th><th>Résultat</th><th></th></tr></thead><tbody>
    ${data.length?data.map(e=>`<tr><td>${formatDate(e.createdAt)}</td><td>${esc(e.officerName)}</td><td>${esc(e.ftoName)}</td><td>${esc(e.moduleCode)} — ${esc(e.moduleTitle)}</td><td>${esc(e.score)}/100</td><td><span class="tag ${e.result==="Validé"?"green":e.result==="Échec"?"red":"orange"}">${esc(e.result)}</span></td><td><button class="btn secondary print-eval" data-id="${e.id}">Voir / Imprimer</button></td></tr>`).join(""):'<tr><td colspan="7">Aucune évaluation.</td></tr>'}
    </tbody></table></div>`;
    $("newEvalBtn")?.addEventListener("click",openEvaluationForm);
    document.querySelectorAll(".print-eval").forEach(b=>b.onclick=()=>openEvaluationDetail(data.find(x=>x.id===b.dataset.id)));
  }catch(err){console.error(err);$("content").innerHTML=`<div class="card"><h2>Erreur</h2><p>${esc(err.code||err.message)}</p></div>`;}
}

async function openEvaluationForm(){
  if(!isFTO()) return;
  const snap=await getDocs(collection(db,"users"));
  const officers=snap.docs.map(d=>({uid:d.id,...d.data()})).filter(o=>o.status!=="Inactif");
  showModal(`<h2>Nouvelle évaluation FTO</h2><form id="evalForm"><div class="formgrid">
  <label class="field"><span>Officier évalué</span><select id="eOfficer">${officers.map(o=>`<option value="${esc(o.uid)}" data-name="${esc(o.name)}">${esc(o.badge)} — ${esc(o.name)} — ${esc(o.grade)}</option>`).join("")}</select></label>
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
  const result=score>=75?"Validé":score>=55?"À revoir":"Échec";
  $("scorePreview").textContent=`${score}/100`; $("resultPreview").textContent=result;
}

async function saveEvaluation(e){
  e.preventDefault();
  const officerSelect=$("eOfficer"), officerId=officerSelect.value, officerName=officerSelect.selectedOptions[0].dataset.name;
  const moduleCode=$("eModule").value, module=modules.find(m=>m[0]===moduleCode);
  const values={}; document.querySelectorAll(".criterion-score").forEach(s=>values[s.dataset.key]=Number(s.value));
  const vals=Object.values(values), score=Math.round(vals.reduce((a,b)=>a+b,0)/(vals.length*5)*100);
  const result=score>=75?"Validé":score>=55?"À revoir":"Échec";
  try{
    await addDoc(collection(db,"evaluations"),{
      officerId,officerName,ftoId:window.LSPD.user.uid,ftoName:window.LSPD.profile.name,
      moduleCode,moduleTitle:module[1],criteria:values,score,result,comments:$("eComments").value.trim(),createdAt:serverTimestamp()
    });
    await addDoc(collection(db,"audit_logs"),{actorId:window.LSPD.user.uid,actorName:window.LSPD.profile.name,action:"CREATE_EVALUATION",targetId:officerId,details:`${moduleCode} — ${result} — ${score}/100`,createdAt:serverTimestamp()});
    document.querySelector(".modal")?.remove(); evaluations();
  }catch(err){console.error(err);$("evalError").textContent="Erreur : "+(err.code||err.message);}
}

function openEvaluationDetail(e){
  const crit=e.criteria||{};
  showModal(`<div id="printArea" class="print-sheet">
  <div class="print-header"><div class="badge small">LSPD</div><div><h2>Fiche d'évaluation FTO</h2><p>Los Santos Police Department</p></div></div>
  <div class="detail-grid"><div><span>Officier</span><b>${esc(e.officerName)}</b></div><div><span>FTO</span><b>${esc(e.ftoName)}</b></div><div><span>Module</span><b>${esc(e.moduleCode)} — ${esc(e.moduleTitle)}</b></div><div><span>Date</span><b>${formatDate(e.createdAt)}</b></div><div><span>Score</span><b>${esc(e.score)}/100</b></div><div><span>Résultat</span><b>${esc(e.result)}</b></div></div>
  <h3>Critères</h3><table class="table compact"><tbody>${criteria.map(c=>`<tr><td>${c[1]}</td><td>${esc(crit[c[0]]||"—")}/5</td></tr>`).join("")}</tbody></table>
  <h3>Commentaires</h3><div class="comment-box">${esc(e.comments||"Aucun commentaire.")}</div>
  </div><div class="modal-actions no-print"><button class="btn" id="printEvalBtn">Imprimer / PDF</button><button class="btn secondary" id="closeModal">Fermer</button></div>`);
  $("printEvalBtn").onclick=()=>window.print();
}

async function trainees(){
  if(!isFTO()){ $("content").innerHTML=`<div class="card">Accès FTO requis.</div>`; return; }
  try{
    const evalSnap=await getDocs(query(collection(db,"evaluations"),where("ftoId","==",window.LSPD.user.uid)));
    const evals=evalSnap.docs.map(d=>d.data());
    const userSnap=await getDocs(collection(db,"users"));
    const users=userSnap.docs.map(d=>({uid:d.id,...d.data()}));
    const ids=[...new Set(evals.map(e=>e.officerId))];
    const data=ids.map(id=>users.find(u=>u.uid===id)).filter(Boolean);
    $("content").innerHTML=`<div class="grid2">${data.length?data.map(o=>{
      const oe=evals.filter(e=>e.officerId===o.uid), validated=[...new Set(oe.filter(e=>e.result==="Validé").map(e=>e.moduleCode))], pct=Math.round(validated.length/modules.length*100);
      return `<div class="card"><span class="number">${esc(o.badge)}</span><h3>${esc(o.name)}</h3><p class="muted">${esc(o.grade)} • ${esc(o.status)}</p><div class="progress"><i style="width:${pct}%"></i></div><p class="muted">${validated.length}/${modules.length} modules validés • ${oe.length} évaluations</p><button class="btn secondary trainee-file" data-id="${o.uid}">Ouvrir le dossier</button></div>`;
    }).join(""):'<div class="card"><p class="muted">Aucune recrue évaluée pour le moment.</p></div>'}</div>`;
    document.querySelectorAll(".trainee-file").forEach(b=>b.onclick=()=>officerFile(b.dataset.id));
  }catch(e){$("content").innerHTML=`<div class="card"><p>${esc(e.code||e.message)}</p></div>`;}
}

async function officers(){
  if(!isCommand()){ $("content").innerHTML=`<div class="card">Accès restreint.</div>`; return; }
  const snap=await getDocs(collection(db,"users"));
  const data=snap.docs.map(d=>({uid:d.id,...d.data()})).sort((a,b)=>(a.badge||"").localeCompare(b.badge||"",undefined,{numeric:true}));
  $("content").innerHTML=`<div class="toolbar"><input id="officerSearch" class="search" placeholder="Rechercher...">${isChief()?'<button class="btn" id="addOfficerBtn">+ Ajouter un profil</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Statut</th><th></th>${isChief()?"<th></th>":""}</tr></thead><tbody id="officerRows">${officerRows(data)}</tbody></table></div>`;
  $("officerSearch").oninput=()=>{const s=$("officerSearch").value.toLowerCase();$("officerRows").innerHTML=officerRows(data.filter(o=>[o.badge,o.name,o.grade,o.role,o.status].some(v=>String(v||"").toLowerCase().includes(s))));bindOfficerButtons(data);};
  $("addOfficerBtn")?.addEventListener("click",()=>openOfficerForm()); bindOfficerButtons(data);
}

function officerRows(data){
  return data.length?data.map(o=>`<tr><td>${esc(o.badge)}</td><td><b>${esc(o.name)}</b></td><td>${esc(o.grade)}</td><td><span class="tag">${esc(o.role)}</span></td><td>${esc(o.status)}</td><td><button class="btn secondary view-officer" data-uid="${esc(o.uid)}">Dossier</button></td>${isChief()?`<td><button class="btn secondary edit-officer" data-uid="${esc(o.uid)}">Modifier</button></td>`:""}</tr>`).join(""):'<tr><td colspan="7">Aucun officier.</td></tr>';
}
function bindOfficerButtons(data){
  document.querySelectorAll(".view-officer").forEach(b=>b.onclick=()=>officerFile(b.dataset.uid));
  document.querySelectorAll(".edit-officer").forEach(b=>b.onclick=()=>openOfficerForm(data.find(o=>o.uid===b.dataset.uid)));
}

async function officerFile(uid){
  const us=await getDoc(doc(db,"users",uid)); if(!us.exists()) return;
  const o={uid,...us.data()};
  const ev=await getDocs(query(collection(db,"evaluations"),where("officerId","==",uid)));
  const evals=ev.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const validated=[...new Set(evals.filter(e=>e.result==="Validé").map(e=>e.moduleCode))], pct=Math.round(validated.length/modules.length*100);
  showModal(`<h2>Dossier officier — ${esc(o.name)}</h2>
  <div class="detail-grid"><div><span>Matricule</span><b>${esc(o.badge)}</b></div><div><span>Grade</span><b>${esc(o.grade)}</b></div><div><span>Rôle</span><b>${esc(o.role)}</b></div><div><span>Division</span><b>${esc(o.division||"Patrol")}</b></div><div><span>Statut</span><b>${esc(o.status)}</b></div><div><span>Progression</span><b>${pct}%</b></div></div>
  <div class="progress"><i style="width:${pct}%"></i></div><h3>Modules</h3><div class="module-status-grid">${modules.map(m=>`<div class="mini-status ${validated.includes(m[0])?"ok":""}"><b>${m[0]}</b><span>${m[1]}</span><small>${validated.includes(m[0])?"Validé":"Non validé"}</small></div>`).join("")}</div>
  <h3>Dernières évaluations</h3><div class="table-card"><table class="table"><thead><tr><th>Date</th><th>Module</th><th>FTO</th><th>Score</th><th>Résultat</th></tr></thead><tbody>${evals.slice(0,10).map(e=>`<tr><td>${formatDate(e.createdAt)}</td><td>${esc(e.moduleCode)}</td><td>${esc(e.ftoName)}</td><td>${esc(e.score)}/100</td><td>${esc(e.result)}</td></tr>`).join("")||'<tr><td colspan="5">Aucune évaluation.</td></tr>'}</tbody></table></div><div class="modal-actions"><button class="btn secondary" id="closeModal">Fermer</button></div>`);
}

function openOfficerForm(o=null){
  if(!isChief()) return;
  showModal(`<h2>${o?"Modifier":"Ajouter"} un profil</h2><form id="officerForm"><div class="formgrid">
  <label class="field full"><span>UID Firebase Authentication</span><input id="fUid" ${o?"readonly":""} required value="${esc(o?.uid||"")}"></label>
  <label class="field"><span>Matricule</span><input id="fBadge" required value="${esc(o?.badge||"")}"></label>
  <label class="field"><span>Nom RP</span><input id="fName" required value="${esc(o?.name||"")}"></label>
  <label class="field"><span>Grade</span><select id="fGrade">${gradeList.map(g=>`<option ${g[0]===o?.grade?"selected":""}>${g[0]}</option>`).join("")}</select></label>
  <label class="field"><span>Rôle</span><select id="fRole">${roles.map(r=>`<option ${r===o?.role?"selected":""}>${r}</option>`).join("")}</select></label>
  <label class="field"><span>Statut</span><select id="fStatus">${statuses.map(s=>`<option ${s===o?.status?"selected":""}>${s}</option>`).join("")}</select></label>
  <label class="field"><span>Division</span><input id="fDivision" value="${esc(o?.division||"Patrol")}"></label>
  </div><div id="formError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("officerForm").onsubmit=saveOfficerProfile;
}

async function saveOfficerProfile(e){
  e.preventDefault();
  const uid=$("fUid").value.trim();
  const payload={badge:$("fBadge").value.trim(),name:$("fName").value.trim(),grade:$("fGrade").value,role:$("fRole").value,status:$("fStatus").value,division:$("fDivision").value.trim(),updatedAt:serverTimestamp()};
  try{
    const ref=doc(db,"users",uid),existing=await getDoc(ref);
    if(existing.exists()) await updateDoc(ref,payload); else await setDoc(ref,{...payload,createdAt:serverTimestamp()});
    await addDoc(collection(db,"audit_logs"),{actorId:window.LSPD.user.uid,actorName:window.LSPD.profile.name,action:existing.exists()?"UPDATE_OFFICER":"CREATE_OFFICER",targetId:uid,details:`${payload.badge} — ${payload.name} — ${payload.grade}`,createdAt:serverTimestamp()});
    document.querySelector(".modal")?.remove();officers();
  }catch(err){$("formError").textContent="Erreur : "+(err.code||err.message);}
}

async function promotions(){
  if(!isCommand()){ $("content").innerHTML=`<div class="card">Accès restreint.</div>`;return; }
  const ps=await getDocs(collection(db,"promotions"));
  const data=ps.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="toolbar">${isChief()?'<button class="btn" id="newPromotionBtn">+ Enregistrer une promotion</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Ancien grade</th><th>Nouveau grade</th><th>Validé par</th></tr></thead><tbody>${data.length?data.map(p=>`<tr><td>${formatDate(p.createdAt)}</td><td>${esc(p.officerName)}</td><td>${esc(p.oldGrade)}</td><td>${esc(p.newGrade)}</td><td>${esc(p.approvedByName)}</td></tr>`).join(""):'<tr><td colspan="5">Aucune promotion.</td></tr>'}</tbody></table></div>`;
  $("newPromotionBtn")?.addEventListener("click",openPromotionForm);
}

async function openPromotionForm(){
  const us=await getDocs(collection(db,"users"));
  const officers=us.docs.map(d=>({uid:d.id,...d.data()}));
  showModal(`<h2>Enregistrer une promotion</h2><form id="promotionForm"><div class="formgrid">
  <label class="field"><span>Officier</span><select id="pOfficer">${officers.map(o=>`<option value="${esc(o.uid)}" data-name="${esc(o.name)}" data-grade="${esc(o.grade)}">${esc(o.badge)} — ${esc(o.name)} — ${esc(o.grade)}</option>`).join("")}</select></label>
  <label class="field"><span>Nouveau grade</span><select id="pNewGrade">${gradeList.map(g=>`<option>${g[0]}</option>`).join("")}</select></label></div>
  <label class="field full"><span>Motif / commentaire</span><textarea id="pComment" rows="4"></textarea></label><div id="promotionError" class="error"></div><div class="modal-actions"><button class="btn" type="submit">Valider la promotion</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  $("promotionForm").onsubmit=savePromotion;
}

async function savePromotion(e){
  e.preventDefault();
  const sel=$("pOfficer"),uid=sel.value,name=sel.selectedOptions[0].dataset.name,oldGrade=sel.selectedOptions[0].dataset.grade,newGrade=$("pNewGrade").value;
  try{
    await updateDoc(doc(db,"users",uid),{grade:newGrade,updatedAt:serverTimestamp()});
    await addDoc(collection(db,"promotions"),{officerId:uid,officerName:name,oldGrade,newGrade,comment:$("pComment").value.trim(),approvedById:window.LSPD.user.uid,approvedByName:window.LSPD.profile.name,createdAt:serverTimestamp()});
    await addDoc(collection(db,"audit_logs"),{actorId:window.LSPD.user.uid,actorName:window.LSPD.profile.name,action:"PROMOTION",targetId:uid,details:`${name}: ${oldGrade} → ${newGrade}`,createdAt:serverTimestamp()});
    document.querySelector(".modal")?.remove();promotions();
  }catch(err){$("promotionError").textContent="Erreur : "+(err.code||err.message);}
}

async function stats(){
  if(!isCommand()){ $("content").innerHTML=`<div class="card">Accès restreint.</div>`;return; }
  const [us,ev]=await Promise.all([getDocs(collection(db,"users")),getDocs(collection(db,"evaluations"))]);
  const users=us.docs.map(d=>d.data()), evals=ev.docs.map(d=>d.data());
  const active=users.filter(u=>u.status==="Actif").length, traineesCount=users.filter(u=>u.status==="En formation").length;
  const valid=evals.filter(e=>e.result==="Validé").length, avg=evals.length?Math.round(evals.reduce((s,e)=>s+(Number(e.score)||0),0)/evals.length):0;
  const gradeCounts=gradeList.map(g=>[g[0],users.filter(u=>u.grade===g[0]).length]);
  const moduleStats=modules.map(m=>[m[0],m[1],evals.filter(e=>e.moduleCode===m[0]&&e.result==="Validé").length]);
  $("content").innerHTML=`<div class="grid stats-grid">
  <div class="card"><div class="muted">Effectif total</div><div class="stat">${users.length}</div></div>
  <div class="card"><div class="muted">Actifs</div><div class="stat">${active}</div></div>
  <div class="card"><div class="muted">En formation</div><div class="stat">${traineesCount}</div></div>
  <div class="card"><div class="muted">Score moyen FTO</div><div class="stat">${avg}/100</div></div></div>
  <div class="grid2" style="margin-top:16px"><div class="card"><h3>Effectif par grade</h3>${gradeCounts.map(x=>`<div class="row"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</div>
  <div class="card"><h3>Validations par module</h3>${moduleStats.map(x=>`<div class="row"><span>${x[0]} — ${x[1]}</span><b>${x[2]}</b></div>`).join("")}</div></div>`;
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
  if(!isCommand()){ $("content").innerHTML=`<div class="card">Accès restreint.</div>`;return; }
  const snap=await getDocs(collection(db,"audit_logs"));
  const data=snap.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $("content").innerHTML=`<div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détails</th></tr></thead><tbody>${data.length?data.map(h=>`<tr><td>${formatDate(h.createdAt)}</td><td>${esc(h.actorName)}</td><td>${esc(h.action)}</td><td>${esc(h.details)}</td></tr>`).join(""):'<tr><td colspan="4">Aucun historique.</td></tr>'}</tbody></table></div>`;
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
});
