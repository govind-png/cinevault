const WATCHLIST_KEY = "cinevault:watchlist";
const CHANGE_EVENT = "watchlist:change";

function isValidMovie(movie) {
  return Number.isInteger(movie?.id) && typeof movie.title === "string";
}

export function getWatchlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY));
    return Array.isArray(saved) ? saved.filter(isValidMovie) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(watchlist) {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch (error) {
    console.error("Couldn't save the watchlist", error);
    return false;
  }
}

export function isInWatchlist(id) {
  return getWatchlist().some((movie) => movie.id === id);
}

// Saves only what a movie card needs, newest first.
export function addToWatchlist(movie) {
  const { id, title, poster_path, release_date, vote_average } = movie;
  const others = getWatchlist().filter((saved) => saved.id !== id);
  return saveWatchlist([{ id, title, poster_path, release_date, vote_average }, ...others]);
}

export function removeFromWatchlist(id) {
  return saveWatchlist(getWatchlist().filter((movie) => movie.id !== id));
}

// Runs `callback` whenever the watchlist changes, in this tab or another one.
// The browser's "storage" event only fires in *other* tabs, so this tab
// announces its own changes with a custom event.
export function onWatchlistChange(callback) {
  window.addEventListener(CHANGE_EVENT, () => callback({ fromOtherTab: false }));
  window.addEventListener("storage", (event) => {
    if (event.key === WATCHLIST_KEY || event.key === null) callback({ fromOtherTab: true });
  });
}
