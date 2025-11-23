// explore.js

// TODO: adjust the path below if your JSON file is in another folder
const MOUNTAINS_URL = "data/fourteeners.json";

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
  listContainer.innerHTML = "";

  mountains.forEach(mountain => {
    const mountainLink = document.createElement("a");

    // Use encoded mountain name in URL
    mountainLink.href = `mountains.html?mountain-name=${encodeURIComponent(mountain.name)}`;
    mountainLink.classList.add("mountain-item");

    const elevation = mountain.elevation
      ? `${mountain.elevation} ft`
      : "Unknown";

    const state = mountain.state || "Unknown";

    mountainLink.innerHTML = `
      <div class="mountain-card">
        <img src="${mountain.image || 'data/placeholder.jpg'}"
             alt="${mountain.name}"
             class="mountain-thumb" />

        <div class="mountain-info">
          <h3>${mountain.name}</h3>
          <p><strong>Elevation:</strong> ${elevation}</p>
          <p><strong>State:</strong> ${state}</p>
        </div>
      </div>
    `;

    listContainer.appendChild(mountainLink);
  });
}


document.addEventListener("DOMContentLoaded", loadMountains);

