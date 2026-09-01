// LSPD Command Center — Phase 6.0

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
const divisions = ["Patrol","Traffic","Detective","SWAT","Air Support","Training","Command"];
const certificationsCatalog = ["FTO","Pursuit","Traffic","Detective","SWAT","Air Support","Supervisor"];
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
 dashboard:"Dashboard",manual:"Manuel FTO",modules:"Formations",evaluations:"Évaluations",
 trainees:"Mes recrues",officers:"Officiers",assignments:"Affectations FTO",
 certifications:"Certifications",records:"Dossiers & distinctions",shifts:"Roster & shifts",
 leave:"Congés",calendar:"Calendrier formations",promotionAdvisor:"Promotion advisor",
 promotions:"Promotions",stats:"Statistiques",grades:"Grades & responsabilités",
 scenarios:"Scénarios",admin:"Admin",history:"Historique"
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
  ["officers","assignments","certifications","records","shifts","promotions","stats","history","promotionAdvisor"].forEach(p=>hide(p,!isCommand()));
  hide("calendar",!isFTO());
  hide("admin",!isChief());
}

function render(page){
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("pageTitle").textContent=pages[page]||"LSPD";
  ({
    dashboard,manual,modules:modulesPage,evaluations,trainees,officers,assignments,
    certifications,records,shifts,leave,calendar,promotionAdvisor,promotions,
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

async function dashboard(){
  const p=window.LSPD.profile;
  let evals=[]; try{evals=await getMyEvaluations();}catch{}
  const validated=[...new Set(evals.filter(e=>e.result==="Validé").map(e=>e.moduleCode))];
  const pct=Math.round(validated.length/modules.length*100);

  let extra="";
  if(isCommand()){
    try{
      const [usersSnap,leaveSnap,shiftSnap]=await Promise.all([
        getDocs(collection(db,"users")),
        getDocs(collection(db,"leave_requests")),
        getDocs(collection(db,"shifts"))
      ]);
      const pending=leaveSnap.docs.map(d=>d.data()).filter(x=>x.status==="En attente").length;
      const today=new Date().toISOString().slice(0,10);
      const todayShifts=shiftSnap.docs.map(d=>d.data()).filter(x=>x.date===today).length;
      extra=`<div class="section-title">Command overview</div><div class="grid stats-grid">
        <div class="card"><div class="muted">Effectif</div><div class="stat">${usersSnap.size}</div></div>
        <div class="card"><div class="muted">Congés en attente</div><div class="stat">${pending}</div></div>
        <div class="card"><div class="muted">Shifts aujourd'hui</div><div class="stat">${todayShifts}</div></div>
        <div class="card"><div class="muted">Évaluations personnelles</div><div class="stat">${evals.length}</div></div>
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
  $("content").innerHTML=`<div class="toolbar">${isFTO()?'<button class="btn" id="newEvalBtn">+ Nouvelle évaluation</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>FTO</th><th>Module</th><th>Score</th><th>Résultat</th><th></th></tr></thead><tbody>
  ${data.length?data.map(e=>`<tr><td>${formatDate(e.createdAt)}</td><td>${esc(e.officerName)}</td><td>${esc(e.ftoName)}</td><td>${esc(e.moduleCode)} — ${esc(e.moduleTitle)}</td><td>${esc(e.score)}/100</td><td><span class="tag ${e.result==="Validé"?"green":e.result==="Échec"?"red":"orange"}">${esc(e.result)}</span></td><td><button class="btn secondary print-eval" data-id="${e.id}">Voir / Imprimer</button></td></tr>`).join(""):'<tr><td colspan="7">Aucune évaluation.</td></tr>'}
  </tbody></table></div>`;
  $("newEvalBtn")?.addEventListener("click",openEvaluationForm);
  document.querySelectorAll(".print-eval").forEach(b=>b.onclick=()=>openEvaluationDetail(data.find(x=>x.id===b.dataset.id)));
}

async function openEvaluationForm(){
  if(!isFTO())return;
  const officers=(await getUsers()).filter(o=>o.status!=="Inactif");
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
  $("content").innerHTML=`<div class="toolbar"><input id="officerSearch" class="search" placeholder="Rechercher...">${isChief()?'<button class="btn" id="addOfficerBtn">+ Ajouter un profil</button>':""}</div>
  <div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Unité</th><th>Statut</th><th></th>${isChief()?"<th></th>":""}</tr></thead><tbody id="officerRows">${officerRows(data)}</tbody></table></div>`;
  $("officerSearch").oninput=()=>{const s=$("officerSearch").value.toLowerCase();$("officerRows").innerHTML=officerRows(data.filter(o=>[o.badge,o.name,o.grade,o.role,o.status,o.division].some(v=>String(v||"").toLowerCase().includes(s))));bindOfficerButtons(data);};
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
  <div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>FTO</th><th>Recrue</th><th>Statut</th><th>Commentaire</th></tr></thead><tbody>${data.length?data.map(a=>`<tr><td>${formatDate(a.createdAt)}</td><td>${esc(a.ftoName)}</td><td>${esc(a.traineeName)}</td><td><span class="tag ${a.status==="Active"?"green":""}">${esc(a.status)}</span></td><td>${esc(a.comment||"")}</td></tr>`).join(""):'<tr><td colspan="5">Aucune affectation.</td></tr>'}</tbody></table></div>`;
  $("newAssignmentBtn")?.addEventListener("click",openAssignmentForm);
}
async function openAssignmentForm(){
  const users=await getUsers(),ftos=users.filter(u=>["FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(u.role)),trainees=users.filter(u=>u.status!=="Inactif");
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
  $("content").innerHTML=`<div class="toolbar">${isChief()?'<button class="btn" id="newShiftBtn">+ Ajouter un shift</button>':""}</div><div class="card table-card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>Début</th><th>Fin</th><th>Unité</th><th>Statut</th></tr></thead><tbody>${data.length?data.map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.officerName)}</td><td>${esc(s.start)}</td><td>${esc(s.end)}</td><td>${esc(s.division||"Patrol")}</td><td>${esc(s.status||"Planifié")}</td></tr>`).join(""):'<tr><td colspan="6">Aucun shift.</td></tr>'}</tbody></table></div>`;
  $("newShiftBtn")?.addEventListener("click",openShiftForm);
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
  const snap=mine
    ? await getDocs(query(collection(db,"leave_requests"),where("officerId","==",window.LSPD.user.uid)))
    : await getDocs(collection(db,"leave_requests"));
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
  await addAudit("LEAVE_"+status.toUpperCase(),id,status);
  leave();
}

async function calendar(){
  const snap=await getDocs(collection(db,"training_events"));
  const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
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

async function promotionAdvisor(){
  if(!isCommand())return;
  const [us,ev,rs]=await Promise.all([getDocs(collection(db,"users")),getDocs(collection(db,"evaluations")),getDocs(collection(db,"personnel_records"))]);
  const users=us.docs.map(d=>({uid:d.id,...d.data()})),evals=ev.docs.map(d=>d.data()),recordsData=rs.docs.map(d=>d.data());
  const rows=users.map(o=>{
    const oe=evals.filter(e=>e.officerId===o.uid),valid=[...new Set(oe.filter(e=>e.result==="Validé").map(e=>e.moduleCode))],avg=oe.length?Math.round(oe.reduce((s,e)=>s+(Number(e.score)||0),0)/oe.length):0;
    const sanctions=recordsData.filter(r=>r.officerId===o.uid&&r.type==="Sanction").length;
    let readiness=0;
    readiness += Math.min(50,Math.round(valid.length/modules.length*50));
    readiness += Math.min(40,Math.round(avg*0.4));
    readiness -= sanctions*10;
    readiness=Math.max(0,Math.min(100,readiness));
    const label=readiness>=80?"Fort candidat":readiness>=65?"À considérer":"Pas encore";
    return {o,valid:valid.length,avg,sanctions,readiness,label};
  }).sort((a,b)=>b.readiness-a.readiness);
  $("content").innerHTML=`<div class="card"><p class="muted">Indicateur d'aide à la décision basé sur progression, moyenne FTO et sanctions. Ce n'est pas une décision automatique.</p></div>
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
  $("content").innerHTML=`<div class="grid stats-grid"><div class="card"><div class="muted">Effectif</div><div class="stat">${users.length}</div></div><div class="card"><div class="muted">Évaluations</div><div class="stat">${evals.length}</div></div><div class="card"><div class="muted">Affectations actives</div><div class="stat">${assign.filter(a=>a.status==="Active").length}</div></div><div class="card"><div class="muted">Score moyen</div><div class="stat">${avg}/100</div></div></div>
  <div class="grid2" style="margin-top:16px"><div class="card"><h3>Effectif par grade</h3>${gradeList.map(g=>`<div class="row"><span>${g[0]}</span><b>${users.filter(u=>u.grade===g[0]).length}</b></div>`).join("")}</div><div class="card"><h3>Operations & RH</h3><div class="row"><span>Certifications</span><b>${certs.length}</b></div><div class="row"><span>Commendations</span><b>${recordsData.filter(r=>r.type==="Commendation").length}</b></div><div class="row"><span>Sanctions</span><b>${recordsData.filter(r=>r.type==="Sanction").length}</b></div><div class="row"><span>Congés en attente</span><b>${leaves.filter(r=>r.status==="En attente").length}</b></div><div class="row"><span>Shifts enregistrés</span><b>${shiftsData.length}</b></div></div></div>`;
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
  $("content").innerHTML=`<div class="grid2"><div class="card"><h3>Gestion système</h3><div class="row"><span>Profils</span><b>${users.length}</b></div><div class="row"><span>Authentication</span><b>Firebase Console</b></div><div class="row"><span>Rôles & unités</span><b>Onglet Officiers</b></div></div><div class="card"><h3>Phase 6</h3><p class="muted">Roster, congés, calendrier de formations et indicateur d'aide à la promotion sont activés.</p></div></div>`;
}
async function history(){
  if(!isCommand())return;
  const s=await getDocs(collection(db,"audit_logs")),data=s.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
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
