import asyncio
import aiohttp
import json
from bs4 import BeautifulSoup
from urllib.parse import urlencode, urljoin

WIKI_BASE = "https://en.wikipedia.org"
FOURTEENERS_URL = f"{WIKI_BASE}/wiki/Fourteener"
WIKI_API = "https://en.wikipedia.org/w/api.php"

HEADERS = {
    "User-Agent": "FourteenerAsyncScraper/1.0 (educational use)"
}


def clean_text(cell):
    """Remove footnotes and trim whitespace."""
    for sup in cell.find_all("sup"):
        sup.decompose()
    return cell.get_text(strip=True)


def build_full_api_endpoint(page_title):
    """
    Returns a Wikipedia API endpoint that retrieves:
    - Full page extract (description + sections)
    - Page metadata
    - Images
    - Page URL
    """
    params = {
        "action": "query",
        "titles": page_title,
        "prop": "extracts|pageimages|info|images",
        "explaintext": 1,
        "exsectionformat": "wiki",
        "piprop": "thumbnail|original",
        "pithumbsize": 300,
        "inprop": "url",
        "format": "json"
    }
    return f"{WIKI_API}?{urlencode(params)}"


async def fetch_json(session, url):
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.json()


async def fetch_mountain_api_data(session, page_title):
    api_endpoint = build_full_api_endpoint(page_title)
    data = await fetch_json(session, api_endpoint)

    pages = data["query"]["pages"]
    page = next(iter(pages.values()))

    thumbnail_url = None
    full_image_url = None

    if "thumbnail" in page:
        thumbnail_url = page["thumbnail"]["source"]

    if "original" in page:
        full_image_url = page["original"]["source"]

    return thumbnail_url, full_image_url, api_endpoint


async def scrape_fourteeners():
    async with aiohttp.ClientSession(headers=HEADERS) as session:
        async with session.get(FOURTEENERS_URL) as response:
            html = await response.text()

        soup = BeautifulSoup(html, "html.parser")
        table = soup.find("table", class_="wikitable sortable")
        rows = table.find_all("tr")[1:]

        tasks = []
        mountains = []

        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 8:
                continue

            peak_link = cells[1].find("a")
            peak_name = clean_text(cells[1])
            page_title = peak_link["title"] if peak_link else peak_name
            peak_url = urljoin(WIKI_BASE, peak_link["href"]) if peak_link else None

            mountain = {
                "rank": clean_text(cells[0]),
                "mountain_peak": peak_name,
                "state": clean_text(cells[2]),
                "mountain_range": clean_text(cells[3]),
                "elevation": clean_text(cells[4]),
                "prominence": clean_text(cells[5]),
                "isolation": clean_text(cells[6]),
                "location": clean_text(cells[7]),
                "wikipedia_page": peak_url,
            }

            task = asyncio.create_task(
                fetch_mountain_api_data(session, page_title)
            )
            tasks.append((mountain, task))

        for mountain, task in tasks:
            thumbnail, full_image, api_endpoint = await task
            mountain["thumbnail_image_url"] = thumbnail
            mountain["full_image_url"] = full_image
            mountain["wikipedia_api_endpoint"] = api_endpoint
            mountains.append(mountain)

        return mountains


async def main():
    data = await scrape_fourteeners()

    with open("fourteeners.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Scraped {len(data)} fourteeners.")
    print("Saved to fourteeners.json")


if __name__ == "__main__":
    asyncio.run(main())
