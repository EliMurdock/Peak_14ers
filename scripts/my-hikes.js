// log.js
// This page reads hikes from cookies and displays them dynamically.

document.addEventListener("DOMContentLoaded", loadMyHikes);

function getHikesFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("myHikes="));
  if (!cookie) return [];

  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch {
    return [];
  }
}

function loadMyHikes() {
  const hikes = getHikesFromCookie();
  const emptySection = document.getElementById("empty-hikes");
  const listSection = document.getElementById("hike-list-section");
  const listContainer = document.getElementById("hike-list");

  if (hikes.length === 0) {
    emptySection.classList.remove("hidden");
    listSection.classList.add("hidden");
    return;
  }

  // Hide the "empty" message
  emptySection.classList.add("hidden");
  listSection.classList.remove("hidden");

  // Display hikes
  listContainer.innerHTML = "";
  hikes.forEach((hike) => {
    const hikeItem = document.createElement("div");
    hikeItem.classList.add("hike-item");

    hikeItem.innerHTML = `
      <div class="hike-info">
        <h3>${hike.name}</h3>
        <p>Status: <span class="status ${hike.status.replace(" ", "-").toLowerCase()}">${hike.status}</span></p>
      </div>
      <a href="mountain.html?mountain-id=${hike.id}" class="btn small">View</a>
    `;

    listContainer.appendChild(hikeItem);
  });
}
