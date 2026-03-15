// === Données initiales === 
const teams = [
  "FC Asnières",
  "ES Colombienne Foot 3",
  "Bagneux COM 2",
  "AS Cheminots de l'ouest",
  "FC Chaville",
  "FC Rueil Malmaison",
  "AS Meudon FC",
  "CSM Gennevilliers 2",
  "AS Ararat Issy 3",
  "AJSC Nanterre"
];

const logos = {
  "FC Asnières": "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=224,fit=crop,q=95/AMq41Gq7pRUQ0lVX/img-20211126-wa0003-AE04Pe2w36hP8v6V.PNG",
  "ES Colombienne Foot 3": "https://d1e67q5w736kt2.cloudfront.net/france/clubs/es-colombienne-football.jpg",
  "Bagneux COM 2": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS09X78bsZtc3SGvPnM-CuswXqSPo0NqTpCdg&s",
  "AS Cheminots de l'ouest": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUATOsI7xQLfJovyZYz4CYuyIfetfcp3y3BQ&s",
  "FC Chaville": "https://s3.static-footeo.com/1200/uploads/fcchaville/logo__sjjk1x.png",
  "FC Rueil Malmaison": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4p-70QB4hVyuK6kQL0DaeQtvBsKbThtdxIg&s",
  "AS Meudon FC": "https://d1e67q5w736kt2.cloudfront.net/france/clubs/as-meudon-football.jpg",
  "CSM Gennevilliers 2": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJz3jf6qiudZkUzC5T40NWSzxwrTPnFDTwLA&s",
  "AS Ararat Issy 3": "https://tmssl.akamaized.net//images/wappen/head/23389.png?lm=1505673476",
  "AJSC Nanterre": "https://d1e67q5w736kt2.cloudfront.net/france/clubs/jsc-nanterre.jpg"
};

let classement = JSON.parse(localStorage.getItem("classement")) || teams.map(name => ({
  name, pts: 0, j: 0, g: 0, n: 0, p: 0, f: 0, pe: 0, bp: 0, bc: 0, forme: []
}));

let history = JSON.parse(localStorage.getItem("historique")) || [];

function saveClassement() {
  localStorage.setItem("classement", JSON.stringify(classement));
  localStorage.setItem("historique", JSON.stringify(history));
}

function renderForme(arr) {
  return arr.slice(-4).map(r => `<span class="form ${r}"></span>`).join("");
}

function countMatchsBetween(teamA, teamB) {
  return history.filter(h => 
    h.type === "match" || h.type === "forfeit"
  ).filter(h => {
    const a = h.data.teamA || h.data.winner;
    const b = h.data.teamB || h.data.loser;
    return (
      (a === teamA && b === teamB) || 
      (a === teamB && b === teamA)
    );
  }).length;
}

function updateTable() {
  classement.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;

    // tri spécifique par confrontation directe (buts cumulés sur aller/retour)
    const aVsB = history.filter(h =>
      h.type === "match" && (
        (h.data.teamA === a.name && h.data.teamB === b.name) ||
        (h.data.teamA === b.name && h.data.teamB === a.name)
      )
    );

    if (aVsB.length === 2) {
      let aTotal = 0, bTotal = 0;
      aVsB.forEach(match => {
        const aScore = match.data.teamA === a.name ? match.data.sA : match.data.sB;
        const bScore = match.data.teamA === a.name ? match.data.sB : match.data.sA;
        aTotal += aScore;
        bTotal += bScore;
      });
      if (aTotal !== bTotal) return bTotal - aTotal;
    }

    const diffA = a.bp - a.bc, diffB = b.bp - b.bc;
    if (diffB !== diffA) return diffB - diffA;

    if (b.bp !== a.bp) return b.bp - a.bp;

    if (a.bc !== b.bc) return a.bc - b.bc;

    return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
  });

  const tbody = document.querySelector(".league-table tbody");
  tbody.innerHTML = "";
  classement.forEach((team, i) => {
    const tr = document.createElement("tr");
    if (team.name === "FC Asnières") tr.classList.add("highlight-fc-asnieres");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="team-cell">
        <img src="${logos[team.name] || 'logos/default.png'}" class="team-logo" alt="${team.name}">
        <span>${team.name}</span>
      </td>
      <td>${team.pts}</td>
      <td>${team.j}</td>
      <td>${team.g}</td>
      <td>${team.n}</td>
      <td>${team.p}</td>
      <td>${team.f}</td>
      <td>${team.pe}</td>
      <td>${team.bp}</td>
      <td>${team.bc}</td>
      <td>${team.bp - team.bc}</td>
      <td>${renderForme(team.forme)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStats(teamA, sA, teamB, sB) {
  if (!teamA || !teamB || teamA === teamB) return alert("Sélection invalide.");
  if (sA < 0 || sB < 0) return alert("Scores invalides.");
  if (countMatchsBetween(teamA, teamB) >= 2) return alert("Ces équipes ont déjà joué deux fois.");

  const t1 = classement.find(t => t.name === teamA);
  const t2 = classement.find(t => t.name === teamB);
  history.push({ type: "match", before: [structuredClone(t1), structuredClone(t2)], data: { teamA, sA, teamB, sB } });

  t1.j++; t2.j++;
  t1.bp += sA; t1.bc += sB;
  t2.bp += sB; t2.bc += sA;

  let r1, r2;
  if (sA > sB) { t1.g++; t2.p++; t1.pts += 3; r1 = "V"; r2 = "D"; }
  else if (sA < sB) { t2.g++; t1.p++; t2.pts += 3; r1 = "D"; r2 = "V"; }
  else { t1.n++; t2.n++; t1.pts++; t2.pts++; r1 = r2 = "N"; }

  t1.forme.push(r1);
  t2.forme.push(r2);

  saveClassement();
  updateTable();
}

function addPenalty() {
  const teamName = prompt("Équipe pénalisée ?");
  if (!teams.includes(teamName)) return alert("Équipe inconnue.");
  const pts = parseInt(prompt("Points à retirer ?"), 10);
  if (isNaN(pts) || pts <= 0) return alert("Valeur invalide.");

  const team = classement.find(t => t.name === teamName);
  history.push({ type: "penalty", before: { pts: team.pts, pe: team.pe }, data: { teamName, pts } });

  team.pts -= pts;
  team.pe += 1;

  alert(`Pénalité appliquée : -${pts} pts pour ${teamName}. Aucun but modifié.`);
  saveClassement();
  updateTable();
}

function addForfeit() {
  const loser = prompt("Équipe forfait ?");
  if (!teams.includes(loser)) return alert("Équipe inconnue.");
  const winner = prompt("Adversaire ?");
  if (!teams.includes(winner) || winner === loser) return alert("Équipe invalide.");

  if (countMatchsBetween(loser, winner) >= 2) return alert("Ces équipes ont déjà joué deux fois.");

  const tL = classement.find(t => t.name === loser);
  const tW = classement.find(t => t.name === winner);
  history.push({ type: "forfeit", before: [structuredClone(tW), structuredClone(tL)], data: { loser, winner } });

  tL.j++; tL.f++; tL.bc += 5; tL.pts -= 1; tL.forme.push("F");
  tW.j++; tW.g++; tW.bp += 5; tW.pts += 3; tW.forme.push("V");

  saveClassement();
  updateTable();
}

function resetClassement() {
  if (!confirm("Réinitialiser le classement ?")) return;
  classement = teams.map(name => ({
    name, pts: 0, j: 0, g: 0, n: 0, p: 0, f: 0, pe: 0, bp: 0, bc: 0, forme: []
  }));
  history = [];
  saveClassement();
  updateTable();
}

function undoLast() {
  if (!history.length) return alert("Rien à annuler.");
  const last = history.pop();
  if (last.type === "match" || last.type === "forfeit") {
    const [b1, b2] = last.before;
    Object.assign(classement.find(t => t.name === b1.name), b1);
    Object.assign(classement.find(t => t.name === b2.name), b2);
  } else if (last.type === "penalty") {
    const team = classement.find(t => t.name === last.data.teamName);
    team.pts = last.before.pts;
    team.pe = last.before.pe;
  }
  saveClassement();
  updateTable();
}

function createForm() {
  const form = document.createElement("form");
  form.innerHTML = `
    <h2>Ajouter un résultat</h2>
    <label>Équipe 1 
      <select name="teamA" required>
        <option value="">Aucun résultat</option>
        ${teams.map(t => `<option>${t}</option>`).join("")}
      </select>
    </label>
    <input type="number" name="scoreA" value="0" min="0" required>
    <label>Équipe 2 
      <select name="teamB" required>
        <option value="">Aucun résultat</option>
        ${teams.map(t => `<option>${t}</option>`).join("")}
      </select>
    </label>
    <input type="number" name="scoreB" value="0" min="0" required>
    <button type="submit">Valider</button>
    <button type="button" id="resetBtn">Réinitialiser</button>
    <button type="button" id="undoBtn">Annuler</button>
    <button type="button" id="penaltyBtn">Pénalité</button>
    <button type="button" id="forfeitBtn">Forfait</button>
  `;
  document.body.insertBefore(form, document.querySelector("footer"));

  form.addEventListener("submit", e => {
    e.preventDefault();
    updateStats(form.teamA.value, +form.scoreA.value, form.teamB.value, +form.scoreB.value);
    form.reset();
    form.scoreA.value = form.scoreB.value = 0;
  });

  document.getElementById("resetBtn").onclick = resetClassement;
  document.getElementById("undoBtn").onclick = undoLast;
  document.getElementById("penaltyBtn").onclick = addPenalty;
  document.getElementById("forfeitBtn").onclick = addForfeit;
}

// ============================================================
//  MINI CLASSEMENT — page d'accueil (asn.html)
// ============================================================
function renderMiniClassement() {
  const tbody = document.getElementById("leagueTableBody");
  if (!tbody) return; // on n'est pas sur asn.html

  // Copie triée (même logique que updateTable)
  const sorted = [...classement].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const aVsB = history.filter(h =>
      h.type === "match" && (
        (h.data.teamA === a.name && h.data.teamB === b.name) ||
        (h.data.teamA === b.name && h.data.teamB === a.name)
      )
    );
    if (aVsB.length === 2) {
      let aTotal = 0, bTotal = 0;
      aVsB.forEach(match => {
        aTotal += match.data.teamA === a.name ? match.data.sA : match.data.sB;
        bTotal += match.data.teamA === a.name ? match.data.sB : match.data.sA;
      });
      if (aTotal !== bTotal) return bTotal - aTotal;
    }
    const diffA = a.bp - a.bc, diffB = b.bp - b.bc;
    if (diffB !== diffA) return diffB - diffA;
    if (b.bp !== a.bp) return b.bp - a.bp;
    if (a.bc !== b.bc) return a.bc - b.bc;
    return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
  });

  const asnPos = sorted.findIndex(t => t.name === "FC Asnières");

  // Lignes à afficher
  let indices;
  if (asnPos <= 2) {
    indices = [0, 1, 2].filter(i => i < sorted.length);
  } else {
    indices = [0, 1, asnPos];
  }

  tbody.innerHTML = "";
  indices.forEach((i, rank) => {
    // Séparateur "···" si on saute des lignes
    if (rank === 2 && asnPos > 2) {
      const sep = document.createElement("tr");
      sep.innerHTML = `<td colspan="8" style="text-align:center;font-size:12px;color:#999;padding:2px;border:none;">·  ·  ·</td>`;
      tbody.appendChild(sep);
    }
    const team = sorted[i];
    const tr = document.createElement("tr");
    if (team.name === "FC Asnières") tr.classList.add("highlight-fc-asnieres");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="team-cell">
        <img src="${logos[team.name] || ''}" class="team-logo" alt="${team.name}">
        <span>${team.name}</span>
      </td>
      <td>${team.pts}</td>
      <td>${team.j}</td>
      <td>${team.g}</td>
      <td>${team.n}</td>
      <td>${team.p}</td>
      <td>${team.bp - team.bc}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
//  INIT
// ============================================================
if (document.querySelector(".league-table.full-ranking")) {
  // Page classement-complet.html
  createForm();
  updateTable();
} else {
  // Page asn.html ou autre
  renderMiniClassement();
}