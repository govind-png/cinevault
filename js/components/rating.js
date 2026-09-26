import { createElement } from "../utils/dom.js";
import { formatRating } from "../utils/format.js";

// Shows "★ 8.4" on screen, but screen readers hear "Rating 8.4" instead of "black star 8.4".
export function createRating(className, voteAverage) {
  const rating = createElement("span", className);
  const star = createElement("span", "", "★ ");
  star.setAttribute("aria-hidden", "true");

  rating.append(createElement("span", "visually-hidden", "Rating "), star, formatRating(voteAverage));
  return rating;
}
