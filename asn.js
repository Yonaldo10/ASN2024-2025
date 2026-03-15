const nextMatch = {
  date: "Samedi 20 juin 2025 - 15h00",
  homeTeam: {
    name: "FC Asnières",
    logo: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=60,fit=crop,q=95/AMq41Gq7pRUQ0lVX/img-20211126-wa0003-AE04Pe2w36hP8v6V.PNG"
  },
  awayTeam: {
    name: "FC Chaville",
    logo: "https://s3.static-footeo.com/1200/uploads/fcchaville/logo__tayu1b.png"
  },
  location: "Stade Blaise Matuidi, Asnières-sur-Seine"
};

function displayNextMatch() {
  const container = document.getElementById("nextMatchContainer");
  container.innerHTML = `
    <div class="match-date">${nextMatch.date}</div>
    <div class="match-teams">
      <div>
        <img src="${nextMatch.homeTeam.logo}" alt="${nextMatch.homeTeam.name}" />
        <div>${nextMatch.homeTeam.name}</div>
      </div>
      <div class="vs">VS</div>
      <div>
        <img src="${nextMatch.awayTeam.logo}" alt="${nextMatch.awayTeam.name}" />
        <div>${nextMatch.awayTeam.name}</div>
      </div>
    </div>
    <div class="match-location">${nextMatch.location}</div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  displayNextMatch();
});
