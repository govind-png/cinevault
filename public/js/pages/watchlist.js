import { renderHeader } from "../components/header.js";
import { createMovieCard } from "../components/movieCard.js";
import { getWatchlist, removeFromWatchlist, onWatchlistChange } from "../utils/storage.js";
import { createElement } from "../utils/dom.js";

const grid = document.querySelector("#watchlist-grid");
const statusText = document.querySelector("#watchlist-status");
const title = document.querySelector("#watchlist-title");

function countText(count) {
  return `${count} ${count === 1 ? "movie" : "movies"} saved`;
}

function createEmptyState() {
  const message = createElement("p", "feedback-message", "Your watchlist is empty. ");
  const link = createElement("a", "feedback-message__link", "Find something to watch");
  link.href = "index.html";
  message.append(link);
  return message;
}

function handleRemove(movie, item) {
  if (!removeFromWatchlist(movie.id)) {
    statusText.textContent = "Couldn't update your watchlist. Please try again.";
    return;
  }

  // Keep keyboard focus nearby instead of losing it when the item disappears.
  const neighbour = item.nextElementSibling ?? item.previousElementSibling;
  item.remove();

  const remaining = getWatchlist().length;
  statusText.textContent = `Removed “${movie.title}”. ${countText(remaining)}.`;

  if (remaining) {
    neighbour.querySelector(".watchlist-item__remove").focus();
  } else {
    grid.replaceChildren(createEmptyState());
    title.focus();
  }
}

function createWatchlistItem(movie) {
  const item = createElement("div", "watchlist-item");

  const removeButton = createElement("button", "watchlist-item__remove", "Remove");
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove ${movie.title} from watchlist`);
  removeButton.addEventListener("click", () => handleRemove(movie, item));

  item.append(createMovieCard(movie), removeButton);
  return item;
}

function renderWatchlist() {
  const watchlist = getWatchlist();

  if (!watchlist.length) {
    statusText.textContent = "";
    grid.replaceChildren(createEmptyState());
    return;
  }

  statusText.textContent = countText(watchlist.length);
  const fragment = document.createDocumentFragment();
  watchlist.forEach((movie) => fragment.append(createWatchlistItem(movie)));
  grid.replaceChildren(fragment);
}

renderHeader();
renderWatchlist();
// This page already updates itself when you click Remove; only redraw
// everything when another tab changed the list.
onWatchlistChange(({ fromOtherTab }) => {
  if (fromOtherTab) renderWatchlist();
});
