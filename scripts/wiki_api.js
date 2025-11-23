import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

const WIKIPEDIA_BASE = "https://en.wikipedia.org";
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_REST = "https://en.wikipedia.org/api/rest_v1/page/summary";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";

/**
 * Fetches the main fourteener table from Wikipedia
 * Returns a list of { name, state, elevation, wikiPageUrl }
 */
async function fetchFourteenerTable() {
  const params = new URLSearchParams({
    action: "parse",
    page: "Fourteener",
    prop: "wikitext",
    format: "json",
    origin: "*"
  });

  const url = `${WIKI_API}?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  const wikitext = data.parse.wikitext["*"];

  // Very simple parsing for the wikitable rows
  const rows = wikitext.split("|-"); // split table rows
  const peaks = [];

  for (let i = 1; i < rows.length; i++) { // skip header
    const row = rows[i];
    const cols = row.split("\n|").map(c => c.trim());

    if (cols.length < 5) continue;

    // Extract name and link
    const nameMatch = /\[\[(.*?)\]\]/.exec(cols[1]);
    if (!nameMatch) continue;

    const name = nameMatch[1].split("|")[0];
    const href = `/wiki/${name.replace(/ /g, "_")}`;
    const wikiPageUrl = `${WIKIPEDIA_BASE}${href}`;

    const state = cols[2];
    const range = cols[3];
    const elevation = cols[4];

    peaks.push({ name, state, range, elevation, wikiPageUrl });
  }

  return peaks;
}


/**
 * Fetches supplemental information for a mountain using Wikipedia REST + Wikidata
 */
async function fetchMountainDetails(name) {
  // REST Summary API
  const restUrl = `${WIKI_REST}/${encodeURIComponent(name)}`;
  const restResp = await fetch(restUrl);
  const restData = await restResp.json();

  // Extract title → used to find Wikidata item
  const wikidataId = restData.wikidata_id || restData.pageprops?.wikibase_item;

  let wikidata = {};
  if (wikidataId) {
    const wdParams = new URLSearchParams({
      action: "wbgetentities",
      ids: wikidataId,
      format: "json",
      origin: "*",
      props: "claims"
    });

    const wdUrl = `${WIKIDATA_API}?${wdParams.toString()}`;
    const wdResp = await fetch(wdUrl);
    const wdJson = await wdResp.json();

    wikidata = wdJson.entities[wikidataId]?.claims || {};
  }

  // Coordinates
  let coords = null;
  if (wikidata.P625) {
    const val = wikidata.P625[0].mainsnak.datavalue.value;
    coords = { lat: val.latitude, lon: val.longitude };
  }

  // Prominence (P2660)
  let prominence = null;
  if (wikidata.P2660) {
    prominence = wikidata.P2660[0].mainsnak.datavalue.value.amount;
  }

  return {
    summary: restData.extract,
    image: restData.thumbnail?.source || null,
    coords,
    prominence,
    wikidataId: wikidataId || null,
  };
}

/**
 * Main generator function
 */
async function generateDataset() {
  console.log("Fetching fourteener table...");
  const peaks = await fetchFourteenerTable();

  const results = [];

  for (const peak of peaks) {
    console.log(`Fetching details for: ${peak.name}`);

    const details = await fetchMountainDetails(peak.name);

    results.push({
      ...peak,
      ...details
    });

    // To be polite to Wikipedia API
    await new Promise(r => setTimeout(r, 250));
  }

  console.log("Saving dataset to fourteeners.json...");
  fs.writeFileSync("fourteeners.json", JSON.stringify(results, null, 2));

  console.log("Done! 🎉 Generated fourteeners.json");
}

generateDataset().catch(err => console.error(err));
