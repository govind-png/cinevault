import { isInWatchlist, addToWatchlist, removeFromWatchlist, onWatchlistChange } from "../utils/storage.js";
import { createElement } from "../utils/dom.js";

export function createWatchlistButton(movie) {
  const button = createElement("button", "watchlist-button");
  button.type = "button";

  function update() {
    const saved = isInWatchlist(movie.id);
    button.textContent = saved ? "Remove from Watchlist" : "Add to Watchlist";
    button.setAttribute("aria-pressed", String(saved));
    button.classList.toggle("watchlist-button--active", saved);
  }

  button.addEventListener("click", () => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
    update();
  });

  onWatchlistChange(update);
  update();
  return button;
}
