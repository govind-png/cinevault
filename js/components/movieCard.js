import { TMDB_IMAGE_BASE_URL } from "../config.js";
import { getYear } from "../utils/format.js";
import { createRating } from "./rating.js";

const PLACEHOLDER_POSTER = "assets/images/no-poster.svg";

export function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";

  card.innerHTML = `
    <a class="movie-card__link">
      <img class="movie-card__poster" loading="lazy">
      <div class="movie-card__info">
        <h3 class="movie-card__title"></h3>
        <p class="movie-card__meta">
          <span class="movie-card__year"></span>
          <span class="movie-card__rating"></span>
        </p>
      </div>
    </a>
  `;

  const poster = card.querySelector(".movie-card__poster");
  if (movie.poster_path) {
    // The browser picks the smallest file that looks sharp at the card's width:
    // two cards per row on phones (about 45% of the screen), about 185px from tablets up.
    poster.src = `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}`;
    poster.srcset = `${TMDB_IMAGE_BASE_URL}/w185${movie.poster_path} 185w, ${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path} 342w`;
    poster.sizes = "(min-width: 768px) 185px, 45vw";
  } else {
    poster.src = PLACEHOLDER_POSTER;
  }
  // The title is right below and inside the same link, so the poster is decorative here.
  poster.alt = "";

  card.querySelector(".movie-card__link").href = `movie.html?id=${movie.id}`;
  card.querySelector(".movie-card__title").textContent = movie.title;
  card.querySelector(".movie-card__year").textContent = getYear(movie.release_date);
  card.querySelector(".movie-card__rating").replaceWith(createRating("movie-card__rating", movie.vote_average));

  return card;
}