import { searchMovies } from "../api/tmdb.js";
import { renderHeader } from "../components/header.js";
import { createMovieCard } from "../components/movieCard.js";
import { showLoader, showError } from "../components/feedback.js";
import { debounce } from "../utils/debounce.js";

const SEARCH_DELAY_MS = 400;

const resultsGrid = document.querySelector("#search-results");
const statusText = document.querySelector("#search-status");

// Every search gets a new id. Only the newest search may update the page,
// so a slow older response can never overwrite newer results.
let latestSearchId = 0;
let currentQuery = "";

function getQueryFromUrl() {
  return (new URLSearchParams(window.location.search).get("query") ?? "").trim();
}

function updateUrl(query) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set("query", query);
  } else {
    url.searchParams.delete("query");
  }
  history.replaceState(null, "", url);
}

function renderMovies(movies) {
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => fragment.append(createMovieCard(movie)));
  resultsGrid.replaceChildren(fragment);
}

function describeResults(shown, total, query) {
  if (total > shown) {
    return `Showing ${shown} of ${total.toLocaleString()} results for “${query}”`;
  }
  return `${total} ${total === 1 ? "result" : "results"} for “${query}”`;
}

async function runSearch(rawQuery) {
  const query = rawQuery.trim();
  const searchId = ++latestSearchId;
  currentQuery = query;

  updateUrl(query);
  document.title = query ? `“${query}” — CineVault Search` : "Search — CineVault";

  if (!query) {
    statusText.textContent = "Type a movie title to start searching.";
    resultsGrid.replaceChildren();
    return;
  }

  statusText.textContent = `Searching for “${query}”…`;
  showLoader(resultsGrid);

  try {
    const data = await searchMovies(query);
    if (searchId !== latestSearchId) return;

    if (!data.results.length) {
      statusText.textContent = `No movies found for “${query}”. Check the spelling or try another title.`;
      resultsGrid.replaceChildren();
      return;
    }

    statusText.textContent = describeResults(data.results.length, data.total_results, query);
    renderMovies(data.results);
  } catch (error) {
    if (searchId !== latestSearchId) return;
    console.error(error);
    statusText.textContent = "";
    showError(resultsGrid, "Couldn't search right now. Please try again later.");
  }
}

const initialQuery = getQueryFromUrl();
const { form, input } = renderHeader({ query: initialQuery });

const searchAfterTyping = debounce(runSearch, SEARCH_DELAY_MS);

input.addEventListener("input", () => {
  if (input.value.trim() === currentQuery) {
    searchAfterTyping.cancel();
    return;
  }
  searchAfterTyping(input.value);
});

// On this page, submitting searches instantly instead of reloading.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchAfterTyping.cancel();
  runSearch(input.value);
});

runSearch(initialQuery);
