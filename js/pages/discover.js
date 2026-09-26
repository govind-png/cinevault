import { getGenres, discoverMovies, MAX_DISCOVER_PAGES } from "../api/tmdb.js";
import { renderHeader } from "../components/header.js";
import { createMovieCard } from "../components/movieCard.js";
import { showLoader, showError } from "../components/feedback.js";
import { createElement } from "../utils/dom.js";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most popular" },
  // Without a minimum, movies with a single 10/10 vote would top the list.
  { value: "vote_average.desc", label: "Highest rated", minVotes: 300 },
  // Without a cutoff, placeholder entries dated years in the future come first.
  { value: "primary_release_date.desc", label: "Newest releases", releasedUpToToday: true },
];
const DEFAULT_SORT = SORT_OPTIONS[0].value;
const OLDEST_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();

const title = document.querySelector("#discover-title");
const sortSelect = document.querySelector("#sort-select");
const yearSelect = document.querySelector("#year-select");
const genreChips = document.querySelector("#genre-chips");
const statusText = document.querySelector("#discover-status");
const grid = document.querySelector("#discover-grid");
const loadMoreButton = document.querySelector("#load-more");
const loadMoreFeedback = document.querySelector("#load-more-feedback");

// The filters live in the URL. These variables only describe what's on screen.
let filters = readFiltersFromUrl();
let currentPage = 0;
let totalPages = 0;
let shownIds = new Set();
let latestRequestId = 0;

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  const genres = (params.get("genres") ?? "").split(",").filter((id) => /^\d+$/.test(id));

  const sort = params.get("sort");
  const isKnownSort = SORT_OPTIONS.some((option) => option.value === sort);

  const year = params.get("year") ?? "";
  const yearNumber = Number(year);
  const isValidYear = /^\d{4}$/.test(year) && yearNumber >= OLDEST_YEAR && yearNumber <= CURRENT_YEAR;

  return {
    genres: [...new Set(genres)],
    sort: isKnownSort ? sort : DEFAULT_SORT,
    year: isValidYear ? year : "",
  };
}

function writeFiltersToUrl({ replace = false } = {}) {
  const params = new URLSearchParams();
  if (filters.genres.length) params.set("genres", filters.genres.join(","));
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  if (filters.year) params.set("year", filters.year);

  // URLSearchParams writes commas as %2C; plain commas are valid and easier to read.
  const query = params.toString().replaceAll("%2C", ",");
  const url = query ? `?${query}` : window.location.pathname;

  if (replace) {
    history.replaceState(null, "", url);
  } else {
    history.pushState(null, "", url);
  }
}

function hasActiveFilters() {
  return filters.genres.length > 0 || filters.year !== "" || filters.sort !== DEFAULT_SORT;
}

function syncControls() {
  sortSelect.value = filters.sort;
  yearSelect.value = filters.year;
  genreChips.querySelectorAll(".genre-chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(filters.genres.includes(chip.dataset.genreId)));
  });
}

function applyFilters(changes) {
  filters = { ...filters, ...changes };
  writeFiltersToUrl();
  syncControls();
  loadMovies({ reset: true });
}

function clearFilters() {
  applyFilters({ genres: [], sort: DEFAULT_SORT, year: "" });
  title.focus();
}

function toggleGenre(id) {
  const genres = filters.genres.includes(id)
    ? filters.genres.filter((genreId) => genreId !== id)
    : [...filters.genres, id];
  applyFilters({ genres });
}

function buildSelectOptions() {
  SORT_OPTIONS.forEach(({ value, label }) => sortSelect.append(new Option(label, value)));

  yearSelect.append(new Option("Any year", ""));
  for (let year = CURRENT_YEAR; year >= OLDEST_YEAR; year--) {
    yearSelect.append(new Option(year, year));
  }
}

function renderGenreChips(genres) {
  const fragment = document.createDocumentFragment();
  genres.forEach((genre) => {
    const chip = createElement("button", "genre-chip", genre.name);
    chip.type = "button";
    chip.dataset.genreId = String(genre.id);
    chip.addEventListener("click", () => toggleGenre(chip.dataset.genreId));
    fragment.append(chip);
  });
  genreChips.replaceChildren(fragment);
  syncControls();
}

async function loadGenres() {
  showLoader(genreChips);
  try {
    const data = await getGenres();
    renderGenreChips(data.genres);
  } catch (error) {
    console.error(error);
    showError(genreChips, "Couldn't load genres.");
  }
}

function showNoMatches() {
  statusText.textContent = "No movies match these filters.";

  const message = createElement("div", "feedback-message");
  message.append(createElement("p", "", "Try removing a genre or choosing a different year."));

  if (hasActiveFilters()) {
    const clearButton = createElement("button", "discover-page__clear", "Clear filters");
    clearButton.type = "button";
    clearButton.addEventListener("click", clearFilters);
    message.append(clearButton);
  }

  grid.replaceChildren(message);
}

function getRequestOptions(page) {
  const sortOption = SORT_OPTIONS.find((option) => option.value === filters.sort);
  return {
    genres: filters.genres,
    sortBy: filters.sort,
    year: filters.year,
    minVotes: sortOption.minVotes ?? 0,
    releasedBefore: sortOption.releasedUpToToday ? new Date().toISOString().slice(0, 10) : "",
    page,
  };
}

// reset: true  → a filter changed, start again from page 1
// reset: false → "Load more", append the next page
async function loadMovies({ reset }) {
  const requestId = ++latestRequestId;
  const page = reset ? 1 : currentPage + 1;

  if (reset) {
    currentPage = 0;
    totalPages = 0;
    shownIds = new Set();
    loadMoreButton.hidden = true;
    loadMoreFeedback.replaceChildren();
    statusText.textContent = "Loading movies…";
    showLoader(grid);
  } else {
    loadMoreButton.disabled = true;
    showLoader(loadMoreFeedback);
  }

  try {
    const data = await discoverMovies(getRequestOptions(page));
    if (requestId !== latestRequestId) return;

    currentPage = page;
    totalPages = Math.min(data.total_pages, MAX_DISCOVER_PAGES);

    // Rankings can shift between requests, so a movie may appear on two pages.
    const newMovies = data.results.filter((movie) => !shownIds.has(movie.id));
    newMovies.forEach((movie) => shownIds.add(movie.id));

    loadMoreFeedback.replaceChildren();
    loadMoreButton.disabled = false;
    loadMoreButton.hidden = currentPage >= totalPages;

    if (reset && !newMovies.length) {
      showNoMatches();
      return;
    }

    const cards = newMovies.map(createMovieCard);
    if (reset) {
      grid.replaceChildren(...cards);
    } else {
      grid.append(...cards);
      // Move keyboard focus to the first new movie so it isn't lost on the button.
      cards[0]?.querySelector("a").focus();
    }

    statusText.textContent = `Showing ${shownIds.size} ${shownIds.size === 1 ? "movie" : "movies"}`;
  } catch (error) {
    if (requestId !== latestRequestId) return;
    console.error(error);
    loadMoreButton.disabled = false;

    if (reset) {
      statusText.textContent = "";
      showError(grid, "Couldn't load movies. Please try again later.");
    } else {
      showError(loadMoreFeedback, "Couldn't load more movies. Please try again.");
    }
  }
}

renderHeader();
buildSelectOptions();
syncControls();
writeFiltersToUrl({ replace: true });

sortSelect.addEventListener("change", () => applyFilters({ sort: sortSelect.value }));
yearSelect.addEventListener("change", () => applyFilters({ year: yearSelect.value }));
loadMoreButton.addEventListener("click", () => loadMovies({ reset: false }));

// Back/forward buttons: the URL changed, so read the filters from it again.
window.addEventListener("popstate", () => {
  filters = readFiltersFromUrl();
  syncControls();
  loadMovies({ reset: true });
});

loadGenres();
loadMovies({ reset: true });
