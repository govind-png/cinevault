import { createElement } from "../utils/dom.js";
import { getWatchlist, onWatchlistChange } from "../utils/storage.js";

function createLogo() {
  const logo = createElement("a", "logo", "Cine");
  logo.href = "index.html";
  logo.append(createElement("span", "", "Vault"));
  return logo;
}

function createNav() {
  const nav = createElement("nav", "site-nav");
  nav.setAttribute("aria-label", "Main");

  const link = createElement("a", "site-nav__link", "Watchlist ");
  link.href = "watchlist.html";

  const count = createElement("span", "site-nav__count");
  const countLabel = createElement("span", "visually-hidden");
  const countNumber = document.createTextNode("");
  count.append(countNumber, countLabel);
  link.append(count);

  function updateCount() {
    const total = getWatchlist().length;
    countNumber.textContent = total;
    countLabel.textContent = total === 1 ? " saved movie" : " saved movies";
  }
  updateCount();
  onWatchlistChange(updateCount);
  if (window.location.pathname.endsWith("/watchlist.html")) {
    link.setAttribute("aria-current", "page");
  }

  nav.append(link);
  return nav;
}

function createSearchForm(query) {
  const form = createElement("form", "search-form");
  form.action = "search.html";
  form.method = "get";
  form.setAttribute("role", "search");

  const label = createElement("label", "visually-hidden", "Search movies");
  label.htmlFor = "site-search";

  const input = createElement("input", "search-form__input");
  input.type = "search";
  input.id = "site-search";
  input.name = "query";
  input.placeholder = "Search movies…";
  input.autocomplete = "off";
  input.value = query;

  const button = createElement("button", "search-form__button", "Search");
  button.type = "submit";

  form.addEventListener("submit", (event) => {
    input.value = input.value.trim();
    if (!input.value) {
      event.preventDefault();
      input.focus();
    }
  });

  form.append(label, input, button);
  return { form, input };
}

export function renderHeader({ query = "" } = {}) {
  const header = createElement("header", "site-header");
  const inner = createElement("div", "site-header__inner container");
  const { form, input } = createSearchForm(query);

  inner.append(createLogo(), createNav(), form);
  header.append(inner);
  document.body.prepend(header);

  return { form, input };
}
