import { TMDB_IMAGE_BASE_URL } from "../config.js";
import { createElement } from "../utils/dom.js";

const PLACEHOLDER_PROFILE = "assets/images/no-poster.svg";

export function createCastCard(person) {
  const card = createElement("li", "cast-card");

  const photo = createElement("img", "cast-card__photo");
  photo.loading = "lazy";
  photo.src = person.profile_path
    ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
    : PLACEHOLDER_PROFILE;
  // The name is printed right below, so the photo doesn't need to repeat it.
  photo.alt = "";

  const name = createElement("p", "cast-card__name", person.name);
  const character = createElement("p", "cast-card__character", person.character || "—");

  card.append(photo, name, character);
  return card;
}
