// LSPD Command Center — Firebase version
// Single Firebase entry point. index.html should ONLY load this file as a module.

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, collection, serverTimestamp
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

window.LSPD = window.LSPD || {};
window.LSPD.auth = auth;
window.LSPD.db = db;
window.LSPD.user = null;
window.LSPD.profile = null;

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const officerRoles = ["Officer","FTO","Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"];
const officerStatuses = ["Actif","En formation","Suspendu","Inactif"];
function isChief(){ return window.LSPD?.profile?.role === "Chief"; }
function isCommand(){ return ["Sergeant","Lieutenant","Captain","Deputy Chief","Assistant Chief","Chief"].includes(window.LSPD?.profile?.role); }

async function loadOfficerProfile(user) {
  window.LSPD.user = user;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      window.LSPD.profile = snap.data();
    } else {
      window.LSPD.profile = {
        name: "Profil non configuré",
        badge: "—",
        grade: "—",
        role: "—",
        status: "Profil Firestore manquant"
      };
      console.warn("Document users/" + user.uid + " introuvable.");
    }
  } catch (error) {
    console.error("Erreur Firestore :", error);
    window.LSPD.profile = {
      name: "Erreur de profil",
      badge: "—",
      grade: "—",
      role: "—",
      status: "Erreur Firestore"
    };
  }

  const loginScreen = $("loginScreen");
  const appShell = $("appShell");

  if (loginScreen) loginScreen.classList.add("hidden");
  if (appShell) appShell.classList.remove("hidden");

  if ($("currentUser")) $("currentUser").textContent = user.email || "Connecté";
  if ($("userPill")) $("userPill").textContent = `${window.LSPD.profile?.grade || "Officer"} • ${window.LSPD.profile?.role || "Officer"}`;

  if (typeof window.initLSPD === "function") {
    window.initLSPD();
  }
}

function showLogin() {
  const loginScreen = $("loginScreen");
  const appShell = $("appShell");

  if (loginScreen) loginScreen.classList.remove("hidden");
  if (appShell) appShell.classList.add("hidden");
}

async function handleLogin(event) {
  event.preventDefault();

  const email = $("loginEmail")?.value?.trim();
  const password = $("loginPassword")?.value;
  const error = $("loginError");

  if (error) error.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    if (error) error.textContent = "Email ou mot de passe incorrect.";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.LSPD.user = null;
    window.LSPD.profile = null;
    showLogin();
    return;
  }

  await loadOfficerProfile(user);
});

window.logoutLSPD = async () => {
  await signOut(auth);
};

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

const grades = [
  ["PO1","Police Officer I","Applique les procédures et progresse sous supervision."],
  ["PO2","Police Officer II","Officier autonome sur les missions courantes."],
  ["PO3","Police Officer III","Officier expérimenté, senior et mentor."],
  ["Sergent","Sergent","Premier niveau de supervision et gestion d'équipe."],
  ["Lieutenant","Lieutenant","Supervise plusieurs équipes et opérations."],
  ["Captain","Captain","Responsable d'une division ou unité."],
  ["Deputy Chief","Deputy Chief","Supervise plusieurs divisions."],
  ["Assistant Chief","Assistant Chief","Direction stratégique et gestion des ressources."],
  ["Chief of Police","Chief of Police","Autorité finale et direction du département."]
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
  dashboard: "Dashboard",
  manual: "Manuel FTO",
  modules: "Formations",
  evaluations: "Évaluations",
  officers: "Officiers",
  grades: "Grades & responsabilités",
  scenarios: "Scénarios",
  history: "Historique"
};

function el(id) { return document.getElementById(id); }

function render(page) {
  document.querySelectorAll("#nav button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
  el("pageTitle").textContent = pageNames[page] || "LSPD";
  const pages = { dashboard, manual, modulesPage, evaluations, officers, gradesPage, scenariosPage, history };
  (pages[page] || dashboard)();
}

function dashboard() {
  const p = window.LSPD?.profile;
  el("content").innerHTML = `
    <div class="grid stats-grid">
      <div class="card"><div class="muted">Identité</div><div class="stat">${p?.name || "À configurer"}</div><div class="muted">${p?.badge || "Matricule non configuré"}</div></div>
      <div class="card"><div class="muted">Grade</div><div class="stat">${p?.grade || "—"}</div><div class="muted">${p?.role || "Rôle non configuré"}</div></div>
      <div class="card"><div class="muted">Formations</div><div class="stat">${modules.length}</div><div class="muted">modules disponibles</div></div>
      <div class="card"><div class="muted">Statut</div><div class="stat">${p?.status || "—"}</div><div class="muted">profil Firebase</div></div>
    </div>
    <div class="section-title">Centre de formation</div>
    <div class="grid2">
      <div class="card">
        <h3>Parcours recommandé</h3>
        ${modules.slice(0,8).map((m,i) => `<div class="row"><span>${m[0]} — ${m[1]}</span><span class="tag">${i < 3 ? "Prioritaire" : "À faire"}</span></div>`).join("")}
      </div>
      <div class="card">
        <h3>Compte connecté</h3>
        <p class="muted">${window.LSPD?.user?.email || "Compte Firebase"}</p>
        <p class="muted">Firebase est connecté. Le Chief peut maintenant gérer les profils depuis l’onglet Officiers.</p>
      </div>
    </div>`;
}

function manual() {
  const standards = [
    "Sécurité avant performance",
    "Le FTO explique le pourquoi de la procédure",
    "Une erreur critique est traitée immédiatement",
    "Feedback factuel et orienté amélioration",
    "Chaque compétence validée est traçable",
    "Les standards s'appliquent aux nouveaux comme aux anciens"
  ];
  el("content").innerHTML = `
    <div class="card"><h2>Manuel FTO LSPD</h2>
    <p class="muted">Référentiel commun : briefing → démonstration → pratique → observation → feedback → validation → traçabilité.</p></div>
    <div class="section-title">Standards FTO</div>
    <div class="grid2">${standards.map(x => `<div class="card"><b>${x}</b><p class="muted">Standard FTO</p></div>`).join("")}</div>`;
}

function modulesPage() {
  el("content").innerHTML = `<div class="grid module-grid">${modules.map(m => `
    <div class="card module" data-module="${m[0]}">
      <span class="number">${m[0]} • ${m[3]}</span><h3>${m[1]}</h3>
      <p class="muted">${m[2]}</p><span class="tag">Ouvrir</span>
    </div>`).join("")}</div>`;
  document.querySelectorAll(".module").forEach(card => card.onclick = () => openModule(card.dataset.module));
}

function openModule(id) {
  const m = modules.find(x => x[0] === id);
  showModal(`
    <h2>${m[0]} — ${m[1]}</h2><p>${m[2]}</p>
    <h3>Déroulé FTO</h3>
    ${["Briefing et objectifs","Démonstration FTO","Mise en pratique","Questions et correction","Observation en situation"].map(x => `<label class="check"><input type="checkbox">${x}</label>`).join("")}
    <h3>Critères</h3>
    <ul><li>Procédure comprise</li><li>Communication claire</li><li>Sécurité respectée</li><li>Décisions justifiables</li></ul>
    <button class="btn" id="closeModal">Fermer</button>`);
}

function evaluations() {
  el("content").innerHTML = `
    <div class="card"><h2>Évaluations FTO</h2>
    <p class="muted">Création et historique des évaluations seront reliés à Firestore après configuration des profils et règles.</p>
    <button class="btn" onclick="alert('La création d’évaluation sera activée avec Firestore.')">+ Nouvelle évaluation</button></div>`;
}

async function officers() {
  if (!isCommand()) {
    el("content").innerHTML = `<div class="card"><h2>Accès restreint</h2><p class="muted">La liste complète des officiers est réservée au commandement.</p></div>`;
    return;
  }
  el("content").innerHTML = `<div class="card"><p class="muted">Chargement des officiers...</p></div>`;
  try {
    const snap = await getDocs(collection(db,"users"));
    const officersData = snap.docs.map(d=>({uid:d.id,...d.data()})).sort((a,b)=>String(a.badge||"").localeCompare(String(b.badge||""),undefined,{numeric:true}));
    el("content").innerHTML = `<div class="toolbar"><input class="search" id="officerSearch" placeholder="Rechercher un officier...">${isChief()?'<button class="btn" id="addOfficerBtn">+ Ajouter un profil</button>':''}</div><div class="card table-card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Rôle</th><th>Statut</th>${isChief()?'<th></th>':''}</tr></thead><tbody id="officerRows"></tbody></table></div>`;
    const draw=(list)=>{ el("officerRows").innerHTML=list.map(o=>`<tr><td>${esc(o.badge)}</td><td><b>${esc(o.name)}</b></td><td>${esc(o.grade)}</td><td><span class="tag">${esc(o.role)}</span></td><td>${esc(o.status)}</td>${isChief()?`<td><button class="btn secondary editOfficer" data-uid="${esc(o.uid)}">Modifier</button></td>`:''}</tr>`).join('') || `<tr><td colspan="6" class="muted">Aucun officier.</td></tr>`; bindEdits(list); };
    const bindEdits=(list)=>document.querySelectorAll('.editOfficer').forEach(b=>b.onclick=()=>openOfficerForm(list.find(o=>o.uid===b.dataset.uid)));
    window.bindEdits=bindEdits; draw(officersData);
    el("officerSearch").addEventListener("input",e=>{ const s=e.target.value.toLowerCase(); draw(officersData.filter(o=>[o.badge,o.name,o.grade,o.role,o.status].some(v=>String(v||"").toLowerCase().includes(s)))); });
    el("addOfficerBtn")?.addEventListener("click",()=>openOfficerForm());
  } catch(err) {
    console.error(err); el("content").innerHTML=`<div class="card"><h2>Accès Firestore refusé</h2><p class="muted">${esc(err.code||err.message)}</p><p>Publie le fichier <b>firestore.rules</b> fourni dans Firebase → Firestore → Règles.</p></div>`;
  }
}

function openOfficerForm(o=null){
  if(!isChief()) return;
  const gradeOptions=grades.map(g=>`<option ${g[0]===o?.grade?'selected':''}>${g[0]}</option>`).join('');
  const roleOptions=officerRoles.map(r=>`<option ${r===o?.role?'selected':''}>${r}</option>`).join('');
  const statusOptions=officerStatuses.map(s=>`<option ${s===o?.status?'selected':''}>${s}</option>`).join('');
  showModal(`<h2>${o?'Modifier':'Ajouter'} un profil</h2><p class="muted">Pour un nouveau membre, crée d'abord son compte dans Firebase Authentication puis copie son UID ici.</p><form id="officerForm"><div class="formgrid"><label class="field full"><span>UID Firebase</span><input id="fUid" required ${o?'readonly':''} value="${esc(o?.uid||'')}"></label><label class="field"><span>Matricule</span><input id="fBadge" required value="${esc(o?.badge||'')}"></label><label class="field"><span>Nom RP</span><input id="fName" required value="${esc(o?.name||'')}"></label><label class="field"><span>Grade</span><select id="fGrade">${gradeOptions}</select></label><label class="field"><span>Rôle</span><select id="fRole">${roleOptions}</select></label><label class="field"><span>Statut</span><select id="fStatus">${statusOptions}</select></label><label class="field"><span>Division</span><input id="fDivision" value="${esc(o?.division||'Patrol')}"></label></div><p id="formError" class="error"></p><div class="modal-actions"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="closeModal">Annuler</button></div></form>`);
  el("officerForm").addEventListener("submit",saveOfficerProfile);
}

async function saveOfficerProfile(e){
  e.preventDefault(); const uid=el("fUid").value.trim();
  const data={badge:el("fBadge").value.trim(),name:el("fName").value.trim(),grade:el("fGrade").value,role:el("fRole").value,status:el("fStatus").value,division:el("fDivision").value.trim(),updatedAt:serverTimestamp()};
  try { const ref=doc(db,"users",uid); const snap=await getDoc(ref); if(snap.exists()) await updateDoc(ref,data); else await setDoc(ref,{...data,createdAt:serverTimestamp()}); document.querySelector('.modal')?.remove(); officers(); }
  catch(err){ console.error(err); el("formError").textContent="Enregistrement impossible : "+(err.code||err.message); }
}

function gradesPage() {
  el("content").innerHTML = `<div class="grid2">${grades.map((g,i) => `
    <div class="card grade"><span class="number">${String(i+1).padStart(2,"0")}</span>
      <h3>${g[0]}</h3><p><b>${g[1]}</b></p><p class="muted">${g[2]}</p>
    </div>`).join("")}</div>`;
}

function scenariosPage() {
  el("content").innerHTML = `<div class="grid module-grid">${scenarios.map(s => `
    <div class="card"><span class="number">${s[0]}</span><h3>${s[1]}</h3>
      <p>${s[2]}</p><p class="muted">${s[3]}</p>
      <button class="btn secondary scenario-btn" data-id="${s[0]}">Lancer</button>
    </div>`).join("")}</div>`;
  document.querySelectorAll(".scenario-btn").forEach(btn => btn.onclick = () => startScenario(btn.dataset.id));
}

function startScenario(id) {
  const s = scenarios.find(x => x[0] === id);
  showModal(`<h2>${s[0]} — ${s[1]}</h2><p>${s[2]}</p>
    <h3>Points à observer</h3>
    ${s[3].split(",").map(x => `<label class="check"><input type="checkbox">${x.trim()}</label>`).join("")}
    <br><button class="btn" id="closeModal">Terminer</button>`);
}

function history() {
  el("content").innerHTML = `<div class="card"><h2>Historique</h2><p class="muted">L'audit log sera connecté à Firestore pour conserver les actions importantes.</p></div>`;
}

function showModal(html) {
  const old = document.querySelector(".modal");
  if (old) old.remove();
  document.body.insertAdjacentHTML("beforeend", `<div class="modal"><div class="modalbox">${html}</div></div>`);
  document.querySelector("#closeModal")?.addEventListener("click", () => document.querySelector(".modal")?.remove());
}

document.addEventListener("DOMContentLoaded", () => {
  $("loginForm")?.addEventListener("submit", handleLogin);

  $("logoutBtn")?.addEventListener("click", window.logoutLSPD);

  $("nav")?.addEventListener("click", e => {
    const btn = e.target.closest("button[data-page]");
    if (btn) render(btn.dataset.page);
  });
});

window.initLSPD = () => render("dashboard");
