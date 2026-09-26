import { TMDB_IMAGE_BASE_URL } from "../config.js";
import { getYear, formatRating } from "../utils/format.js";

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
  poster.src = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}`
    : PLACEHOLDER_POSTER;
  poster.alt = `Poster for ${movie.title}`;

  card.querySelector(".movie-card__link").href = `movie.html?id=${movie.id}`;
  card.querySelector(".movie-card__title").textContent = movie.title;
  card.querySelector(".movie-card__year").textContent = getYear(movie.release_date);
  card.querySelector(".movie-card__rating").textContent = `★ ${formatRating(movie.vote_average)}`;

  return card;
}