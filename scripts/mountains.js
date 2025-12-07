// mountains.js

const MOUNTAINS_URL = "data/fourteeners.json";

/**
 * Load mountain details based on URL param
 */
/**
 * Load mountain details based on URL param
 */
async function loadMountainDetails() {
  const params = new URLSearchParams(window.location.search);
  const mountainNameParam = params.get("mountain-name");

  if (!mountainNameParam) {
    document.getElementById("mountain-details").innerHTML =
      "<p>Mountain name not found in URL.</p>";
    return;
  }

  const mountainName = decodeURIComponent(mountainNameParam).toLowerCase();

  try {
    // Load local JSON for basic info
    const response = await fetch(MOUNTAINS_URL);
    if (!response.ok) throw new Error("Could not fetch local mountain data.");
    const mountains = await response.json();

    const localMountain = mountains.find(
      m => m.name.toLowerCase() === mountainName
    );

    if (!localMountain) {
      document.getElementById("mountain-details").innerHTML =
        "<p>Mountain not found.</p>";
      return;
    }

    // Attempt to fetch additional data from Wikipedia/Wikidata
    let details = {};
    try {
      details = await fetchMountainDetails(localMountain.name);
    } catch (err) {
      console.warn("Could not fetch Wikipedia data for", localMountain.name, err);
    }

    // Merge local and fetched details
    const mountain = {
      ...localMountain,
      image: details.image || localMountain.image,
      description: details.summary || localMountain.summary || localMountain.description,
      prominence: details.prominence || localMountain.prominence,
      coords: details.coords || localMountain.coords,
      wikidataId: details.wikidataId || localMountain.wikidataId
    };

    displayMountainDetails(mountain);

  } catch (error) {
    console.error("Error loading mountain data:", error);
    document.getElementById("mountain-details").innerHTML =
      `<p>Error loading data: ${error.message}</p>`;
  }
}

/**
 * Render the mountain details in the page
 */
function displayMountainDetails(mountain) {
  const container = document.getElementById("mountain-details");

  container.innerHTML = `
    <div class="mountain-header">
      ${mountain.image ? `<img src="${mountain.image}" alt="${mountain.name}" class="mountain-banner">` : ""}
      <div class="mountain-subheader">
        <div class="mountain-title">
          <h1>${mountain.name}</h1>
          <p>${mountain.state || "Unknown location"}</p>
        </div>
        <button id="hike-btn" class="hike-btn">
          <span class="label">Hike it!</span>
          <img src="data/hiker.gif" alt="hiker" class="hiker-gif">
        </button>
      </div>
    </div>

    <div class="mountain-info-section">
      <div class="info-box">
        <h3>Elevation</h3>
        <p>${mountain.elevation || "N/A"} ft</p>
      </div>
      <div class="info-box">
        <h3>Difficulty</h3>
        <p>${mountain.difficulty || "N/A"}</p>
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

  // Attach behavior for the Hike it button
  const hikeBtn = document.getElementById('hike-btn');
  if (hikeBtn) {
    // Update state based on cookie
    if (isMountainAdded(mountain.name)) {
      hikeBtn.innerHTML = '<span class="label">Added to my hikes</span>';
      hikeBtn.disabled = true;
      hikeBtn.classList.add('added');
    }

    hikeBtn.addEventListener('click', () => {
      addMountainNameToMyHikes(mountain.name);
      hikeBtn.innerHTML = '<span class="label">Added to my hikes</span>';
      hikeBtn.disabled = true;
      hikeBtn.classList.add('added');
    });
  }
}

document.addEventListener("DOMContentLoaded", loadMountainDetails);

/* Add mountain to the my-hikes cookie*/
// New cookie helpers for `my-hikes` cookie (stores array of mountain names)
function getMyHikesNames() {
  const cookie = document.cookie.split('; ').find(r => r.startsWith('my-hikes='));
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch (e) {
    return [];
  }
}

function setMyHikesNames(names) {
  const val = encodeURIComponent(JSON.stringify(names));
  // 30 days
  document.cookie = `my-hikes=${val}; path=/; max-age=${60 * 60 * 24 * 30}`;
}

function addMountainNameToMyHikes(name) {
  if (!name) return;
  const names = getMyHikesNames();
  if (!names.includes(name)) {
    names.push(name);
    setMyHikesNames(names);
  }
}

function isMountainAdded(name) {
  const names = getMyHikesNames();
  return names.includes(name);
}

document.addEventListener("DOMContentLoaded", loadMountainDetails);
