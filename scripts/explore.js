// explore.js

// TODO: adjust the path below if your JSON file is in another folder
const MOUNTAINS_URL = "data/mountains.json";

async function loadMountains() {
  try {
    const response = await fetch(MOUNTAINS_URL);
    const mountains = await response.json();
    displayMountains(mountains);
  } catch (error) {
    console.error("Error loading mountain data:", error);
    const listContainer = document.getElementById("mountain-list");
    listContainer.innerHTML = "<p>Failed to load mountain data. Please try again later.</p>";
  }
}

function displayMountains(mountains) {
  const listContainer = document.getElementById("mountain-list");
  listContainer.innerHTML = ""; // clear any existing content

  mountains.forEach(mountain => {
    const mountainLink = document.createElement("a");
    mountainLink.href = `mountains.html?mountain-id=${mountain.id}`;
    mountainLink.classList.add("mountain-item");

    mountainLink.innerHTML = `
      <div class="mountain-card">
        <img src="${mountain.image}" alt="${mountain.name}" class="mountain-thumb" />
        <div class="mountain-info">
          <h3>${mountain.name}</h3>
          <p>Elevation: ${mountain.elevation} ft</p>
          <p>Difficulty: ${mountain.difficulty}</p>
        </div>
      </div>
    `;

    listContainer.appendChild(mountainLink);
  });
}

// Load mountains when page loads
document.addEventListener("DOMContentLoaded", loadMountains);
