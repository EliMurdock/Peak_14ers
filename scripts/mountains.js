// mountain.js

// TODO: Adjust if your JSON is in another folder
const MOUNTAINS_URL = "data/mountains.json";

async function loadMountainDetails() {
  const params = new URLSearchParams(window.location.search);
  const mountainId = params.get("mountain-id");

  if (!mountainId) {
    document.getElementById("mountain-details").innerHTML = "<p>Mountain ID not found in URL.</p>";
    return;
  }

  try {
    const response = await fetch(MOUNTAINS_URL);
    const mountains = await response.json();
    const mountain = mountains.find(m => m.id == mountainId);

    if (!mountain) {
      document.getElementById("mountain-details").innerHTML = "<p>Mountain not found.</p>";
      return;
    }

    displayMountainDetails(mountain);
  } catch (error) {
    console.error("Error loading mountain data:", error);
    document.getElementById("mountain-details").innerHTML = "<p>Error loading data. Please try again later.</p>";
  }
}

function displayMountainDetails(mountain) {
  const container = document.getElementById("mountain-details");

  container.innerHTML = `
    <div class="mountain-header">
      <img src="${mountain.image}" alt="${mountain.name}" class="mountain-banner">
      <h1>${mountain.name}</h1>
      <p>${mountain.location || "Unknown location"}</p>
    </div>

    <div class="mountain-info-section">
      <div class="info-box">
        <h3>Elevation</h3>
        <p>${mountain.elevation} ft</p>
      </div>
      <div class="info-box">
        <h3>Difficulty</h3>
        <p>${mountain.difficulty}</p>
      </div>
      <div class="info-box">
        <h3>Prominence</h3>
        <p>${mountain.prominence || "N/A"}</p>
      </div>
    </div>

    <div class="mountain-description">
      <h2>About ${mountain.name}</h2>
      <p>${mountain.description || "No description available for this mountain."}</p>
    </div>

    <div class="return-link">
      <a href="explore.html" class="btn">← Back to Explore</a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", loadMountainDetails);
