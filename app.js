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
  getFirestore,
  doc,
  getDoc
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
        <p class="muted">La connexion Firebase est active. Les données FTO et les permissions seront branchées à Firestore dans la prochaine étape.</p>
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

function officers() {
  el("content").innerHTML = `
    <div class="card"><h2>Base des officiers</h2>
    <p class="muted">Les profils seront chargés depuis Firestore selon les permissions du compte connecté.</p>
    <div class="notice">Aucun officier supplémentaire n'est encore chargé.</div></div>`;
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
