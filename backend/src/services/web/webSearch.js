// services/web/webSearch.js

/**
 * Basic Web Search (V1)
 *
 * Right now:
 * - Just fetch search results (titles + snippets)
 * - NO scraping yet
 *
 * Later:
 * - We'll add scraping + structured extraction
 */

export const searchRecipes = async (query) => {
  try {
    const res = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(
        query + " recipe",
      )}`,
    );

    const html = await res.text();

    const links = [];
    const regex =
      /<a rel="nofollow" class="result__a" href="(.*?)">(.*?)<\/a>/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
      links.push({
        url: match[1],
        title: match[2].replace(/<[^>]+>/g, ""),
      });
    }

    return links.slice(0, 5);
  } catch (err) {
    console.error("Web search failed:", err.message);
    return [];
  }
};
