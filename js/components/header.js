import { createElement } from "../utils/dom.js";

function createLogo() {
  const logo = createElement("a", "logo", "Cine");
  logo.href = "index.html";
  logo.append(createElement("span", "", "Vault"));
  return logo;
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

  inner.append(createLogo(), form);
  header.append(inner);
  document.body.prepend(header);

  return { form, input };
}
