const modules=[
["M01","Fondamentaux LSPD","Structure, chaîne de commandement, radio, code de conduite","Débutant"],
["M02","Radio & communications","Codes radio, transmissions, priorités, dispatch","Débutant"],
["M03","Patrouille","Positionnement, observation, contrôles, contacts citoyens","Débutant"],
["M04","Code de la route","Contrôles routiers, infractions, conduite professionnelle","Débutant"],
["M05","Contrôle d'identité","Procédure de contact, vérifications, sécurité","Débutant"],
["M06","Arrestation","Menottage, fouille, droits, transport et remise en garde","Intermédiaire"],
["M07","Usage de la force","Proportionnalité, désescalade, justification et rapport","Intermédiaire"],
["M08","Poursuites","Poursuite véhicule/pied, coordination, sécurité","Intermédiaire"],
["M09","Scènes de crime","Sécurisation, témoins, preuves, préservation","Intermédiaire"],
["M10","Rapports","Rédaction factuelle, chronologie, preuves et transmission","Intermédiaire"],
["M11","Interventions à risque","Renfort, périmètre, négociation et coordination","Avancé"],
["M12","Gestion de scène","Commandement tactique, briefing, ressources","Avancé"],
["M13","FTO & pédagogie","Démonstration, observation, feedback et validation","FTO"],
["M14","Supervision","Contrôle qualité, discipline, coaching et décisions","Commandement"],
["M15","Commandement","Gestion opérationnelle, priorités, effectifs et crises","Commandement"],
["M16","Leadership","Culture LSPD, éthique, développement et succession","Commandement"]
];
const grades=[
["PO1","Police Officer I","Apprend et applique les procédures sous supervision. Patrouille, radio, contrôles, rapports et interventions de base."],
["PO2","Police Officer II","Officier autonome sur les missions courantes. Guide les PO1 et démontre les procédures."],
["PO3","Police Officer III","Officier expérimenté. Peut servir de senior/mentor et prendre des responsabilités opérationnelles ponctuelles."],
["Sergent","Sergent","Premier niveau de supervision. Dirige une équipe, valide les rapports, corrige les écarts et réalise des évaluations FTO."],
["Lieutenant","Lieutenant","Supervise plusieurs équipes/secteurs, organise les opérations, suit les performances et assiste le commandement."],
["Captain","Captain","Responsable d'une division/unité. Fixe les objectifs, pilote les FTO, la discipline et les standards de qualité."],
["Deputy Chief","Deputy Chief","Supervise plusieurs divisions, coordonne les commandements et contrôle la cohérence opérationnelle."],
["Assistant Chief","Assistant Chief","Direction stratégique du département, politiques internes, ressources, promotions et grands objectifs."],
["Chief of Police","Chief of Police","Autorité finale. Définit la doctrine, la culture, les priorités et représente le LSPD."]
];
const scenarios=[
["S01","Contrôle routier","Contrôle d'un véhicule suspect","Sécurité, radio, approche, identification, décision et rapport."],
["S02","Arrestation","Suspect coopératif","Contrôle, menottage, fouille, droits, transport."],
["S03","Poursuite véhicule","Fuite après refus d'obtempérer","Radio, sécurité, coordination, décision de poursuite."],
["S04","Poursuite à pied","Suspect prend la fuite","Communication, trajectoire, renfort, arrestation."],
["S05","Intervention à risque","Appel avec menace","Périmètre, briefing, désescalade, commandement."],
["S06","Scène de crime","Vol avec plusieurs témoins","Sécurisation, témoins, preuves, chronologie."],
["S07","Gestion de scène","Incident multi-unités","Commandement, répartition des rôles, briefing et compte rendu."],
["S08","Évaluation FTO","Patrouille complète","Évaluation globale en conditions réalistes."]
];
const defaultOfficers=[
["001","Exemple Officier","PO1","FTO","En formation"],
["002","Exemple Senior","PO3","FTO","Actif"],
["003","Exemple Sergent","Sergent","Superviseur","Actif"]
];
let state=JSON.parse(localStorage.getItem("lspd_state")||"null")||{officers:defaultOfficers,evaluations:[],history:[]};
function save(){localStorage.setItem("lspd_state",JSON.stringify(state));document.getElementById("storageStatus").textContent="Données locales sauvegardées";}
function pageTitle(t){document.getElementById("pageTitle").textContent=t}
function render(name){
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
 const titles={dashboard:"Dashboard",manual:"Manuel FTO",modules:"Formations",evaluations:"Évaluations",officers:"Officiers",grades:"Grades & responsabilités",scenarios:"Scénarios",history:"Historique"};
 pageTitle(titles[name]||"LSPD");
 ({dashboard,manual,modules:modulesPage,evaluations,officers,grades:gradesPage,scenarios,history}[name])();
}
document.getElementById("nav").onclick=e=>{if(e.target.dataset.page)render(e.target.dataset.page)}
function dashboard(){let done=state.evaluations.filter(x=>x.result==="Validé").length;document.getElementById("content").innerHTML=`
<div class="grid">
<div class="card"><div class="muted">Officiers</div><div class="stat">${state.officers.length}</div><div class="muted">dans la base</div></div>
<div class="card"><div class="muted">Modules</div><div class="stat">${modules.length}</div><div class="muted">programme LSPD</div></div>
<div class="card"><div class="muted">Évaluations</div><div class="stat">${state.evaluations.length}</div><div class="muted">${done} validées</div></div>
<div class="card"><div class="muted">Scénarios</div><div class="stat">${scenarios.length}</div><div class="muted">entraînements</div></div>
</div>
<div class="section-title">Centre FTO</div><div class="grid2">
<div class="card"><h3>Parcours recommandé PO1</h3>${modules.slice(0,8).map((m,i)=>`<div class="row"><span>${m[0]} — ${m[1]}</span><span class="tag">${i<3?"Prioritaire":"À faire"}</span></div>`).join("")}</div>
<div class="card"><h3>Dernières évaluations</h3>${state.evaluations.slice(-5).reverse().map(e=>`<div class="row"><span>${e.officer}</span><span class="tag ${e.result==="Validé"?"green":"orange"}">${e.result}</span></div>`).join("")||'<p class="muted">Aucune évaluation.</p>'}</div>
</div>`}
function manual(){document.getElementById("content").innerHTML=`
<div class="card"><h2>Manuel FTO LSPD</h2><p class="muted">Référentiel commun pour former, observer, corriger et valider les officiers. Chaque formation suit le cycle : briefing → démonstration → pratique → observation → feedback → validation → traçabilité.</p></div>
<div class="section-title">Règles de formation</div><div class="grid2">
${["Sécurité avant performance","Le FTO explique le pourquoi, pas seulement le geste","Une erreur critique doit être traitée immédiatement","Le feedback est factuel et orienté amélioration","Chaque compétence validée doit être traçable","Les standards s'appliquent aux anciens comme aux nouveaux"].map(x=>`<div class="card"><b>${x}</b><p class="muted">Standard FTO</p></div>`).join("")}</div>`}
function modulesPage(){document.getElementById("content").innerHTML=`<div class="toolbar"><input class="search" id="moduleSearch" placeholder="Rechercher un module..."></div><div class="grid">${modules.map(m=>`<div class="card module" onclick="openModule('${m[0]}')"><span class="number">${m[0]} • ${m[3]}</span><h3>${m[1]}</h3><p class="muted">${m[2]}</p><span class="tag">Ouvrir la fiche</span></div>`).join("")}</div>`}
function openModule(id){let m=modules.find(x=>x[0]===id);document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal"><div class="modalbox"><h2>${m[0]} — ${m[1]}</h2><p>${m[2]}</p><hr><h3>Déroulé FTO</h3><div class="check"><input type="checkbox"> Briefing et objectifs expliqués</div><div class="check"><input type="checkbox"> Démonstration réalisée par le FTO</div><div class="check"><input type="checkbox"> Mise en pratique par l'officier</div><div class="check"><input type="checkbox"> Questions et correction</div><div class="check"><input type="checkbox"> Compétence observée en situation</div><h3>Critères de validation</h3><ul><li>Procédure comprise et appliquée</li><li>Communication claire</li><li>Sécurité respectée</li><li>Décisions justifiables</li><li>Rapport/compte rendu exploitable</li></ul><button class="btn" onclick="document.getElementById('modal').remove()">Fermer</button></div></div>`)}
function evaluations(){document.getElementById("content").innerHTML=`<div class="toolbar"><button class="btn" onclick="newEval()">+ Nouvelle évaluation</button></div><div class="card"><table class="table"><thead><tr><th>Date</th><th>Officier</th><th>FTO</th><th>Module</th><th>Score</th><th>Résultat</th><th>Note</th></tr></thead><tbody>${state.evaluations.map(e=>`<tr><td>${e.date}</td><td>${e.officer}</td><td>${e.fto}</td><td>${e.module}</td><td>${e.score}/100</td><td><span class="tag ${e.result==="Validé"?"green":"orange"}">${e.result}</span></td><td>${e.note||""}</td></tr>`).join("")||'<tr><td colspan="7" class="muted">Aucune donnée.</td></tr>'}</tbody></table></div>`}
function newEval(){document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal"><div class="modalbox"><h2>Nouvelle évaluation FTO</h2><div class="formgrid">
<label class="field"><span>Officier</span><select id="eo">${state.officers.map(o=>`<option>${o[1]}</option>`).join("")}</select></label>
<label class="field"><span>FTO / évaluateur</span><input id="ef" placeholder="Nom du FTO"></label>
<label class="field"><span>Module</span><select id="em">${modules.map(m=>`<option>${m[0]} — ${m[1]}</option>`).join("")}</select></label>
<label class="field"><span>Score /100</span><input id="es" type="number" min="0" max="100" value="80"></label>
<label class="field full"><span>Observation</span><textarea id="en" rows="4" placeholder="Points forts, axes d'amélioration, actions de suivi..."></textarea></label></div><br><button class="btn" onclick="saveEval()">Enregistrer</button> <button class="btn secondary" onclick="document.getElementById('modal').remove()">Annuler</button></div></div>`)}
function saveEval(){let score=+document.getElementById("es").value;let e={date:new Date().toLocaleDateString("fr-FR"),officer:document.getElementById("eo").value,fto:document.getElementById("ef").value,module:document.getElementById("em").value,score,result:score>=75?"Validé":"À revoir",note:document.getElementById("en").value};state.evaluations.push(e);state.history.push({date:e.date,type:"Évaluation",detail:`${e.officer} — ${e.module}`});save();document.getElementById("modal").remove();render("evaluations")}
function officers(){document.getElementById("content").innerHTML=`<div class="toolbar"><button class="btn" onclick="newOfficer()">+ Ajouter un officier</button></div><div class="card"><table class="table"><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Fonction</th><th>Statut</th></tr></thead><tbody>${state.officers.map(o=>`<tr><td>${o[0]}</td><td>${o[1]}</td><td>${o[2]}</td><td>${o[3]}</td><td><span class="tag green">${o[4]}</span></td></tr>`).join("")}</tbody></table></div>`}
function newOfficer(){document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal"><div class="modalbox"><h2>Ajouter un officier</h2><div class="formgrid"><label class="field"><span>Matricule</span><input id="oid"></label><label class="field"><span>Nom</span><input id="on"></label><label class="field"><span>Grade</span><select id="og">${grades.map(g=>`<option>${g[0]}</option>`).join("")}</select><label class="field"><span>Fonction</span><input id="of" value="Officier"></label></div><br><button class="btn" onclick="saveOfficer()">Enregistrer</button></div></div>`)}
function saveOfficer(){state.officers.push([oid.value,on.value,og.value,of.value,"Actif"]);state.history.push({date:new Date().toLocaleDateString("fr-FR"),type:"Officier",detail:`Ajout de ${on.value}`});save();modal.remove();render("officers")}
function gradesPage(){document.getElementById("content").innerHTML=`<div class="grid2">${grades.map((g,i)=>`<div class="card grade"><span class="number">${String(i+1).padStart(2,"0")}</span><h3>${g[0]}</h3><p><b>${g[1]}</b></p><p class="muted">${g[2]}</p><h4>Attendus</h4><ul><li>Respect des SOP et de la chaîne de commandement</li><li>Leadership adapté au niveau de grade</li><li>Documentation et responsabilité</li></ul></div>`).join("")}</div>`}
function scenarios(){document.getElementById("content").innerHTML=`<div class="grid">${scenarios.map(s=>`<div class="card"><span class="number">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p><p class="muted">${s[3]}</p><button class="btn secondary" onclick="startScenario('${s[0]}')">Lancer l'évaluation</button></div>`).join("")}</div>`}
function startScenario(id){let s=scenarios.find(x=>x[0]===id);document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal"><div class="modalbox"><h2>${s[0]} — ${s[1]}</h2><p>${s[2]}</p><h3>Points à observer</h3>${s[3].split(",").map(x=>`<div class="check"><input type="checkbox"><span>${x.trim()}</span></div>`).join("")}<br><button class="btn" onclick="document.getElementById('modal').remove()">Terminer</button></div></div>`)}
function history(){document.getElementById("content").innerHTML=`<div class="card"><h3>Journal d'activité</h3><table class="table"><thead><tr><th>Date</th><th>Type</th><th>Détail</th></tr></thead><tbody>${state.history.slice().reverse().map(h=>`<tr><td>${h.date}</td><td>${h.type}</td><td>${h.detail}</td></tr>`).join("")||'<tr><td colspan="3">Aucune activité.</td></tr>'}</tbody></table></div>`}
render("dashboard");save();