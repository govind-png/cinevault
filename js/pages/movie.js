import { getMovieDetails } from "../api/tmdb.js";
import { TMDB_IMAGE_BASE_URL } from "../config.js";
import { renderHeader } from "../components/header.js";
import { createCastCard } from "../components/castCard.js";
import { showLoader, showError } from "../components/feedback.js";
import { createElement } from "../utils/dom.js";
import { getYear, formatRating, formatRuntime } from "../utils/format.js";

const PLACEHOLDER_POSTER = "assets/images/no-poster.svg";
const MAX_CAST = 12;

const container = document.querySelector("#movie-details");

function getMovieId() {
  const id = new URLSearchParams(window.location.search).get("id");
  return /^\d+$/.test(id ?? "") ? id : null;
}

function findTrailer(videos) {
  const trailers = videos.filter((video) => video.site === "YouTube" && video.type === "Trailer");
  return trailers.find((video) => video.official) ?? trailers[0];
}

function createHero(movie) {
  const hero = createElement("section", "movie-hero");

  if (movie.backdrop_path) {
    const backdrop = createElement("img", "movie-hero__backdrop");
    backdrop.src = `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}`;
    backdrop.alt = "";
    hero.append(backdrop);
  }

  const content = createElement("div", "movie-hero__content container");

  const poster = createElement("img", "movie-hero__poster");
  poster.src = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}`
    : PLACEHOLDER_POSTER;
  poster.alt = `Poster for ${movie.title}`;

  const info = createElement("div", "movie-hero__info");
  info.append(createElement("h1", "movie-hero__title", movie.title));

  if (movie.tagline) {
    info.append(createElement("p", "movie-hero__tagline", movie.tagline));
  }

  const meta = createElement("p", "movie-hero__meta");
  meta.append(
    createElement("span", "", getYear(movie.release_date)),
    createElement("span", "", formatRuntime(movie.runtime)),
    createElement("span", "movie-hero__rating", `★ ${formatRating(movie.vote_average)}`),
  );
  info.append(meta);

  if (movie.genres.length) {
    const genres = createElement("ul", "movie-hero__genres");
    movie.genres.forEach((genre) => genres.append(createElement("li", "genre-tag", genre.name)));
    info.append(genres);
  }

  info.append(
    createElement("h2", "movie-hero__heading", "Overview"),
    createElement("p", "movie-hero__overview", movie.overview || "No overview available."),
  );

  content.append(poster, info);
  hero.append(content);
  return hero;
}

function createSection(title) {
  const section = createElement("section", "details-section container");
  section.append(createElement("h2", "section-title", title));
  return section;
}

function createCastSection(cast) {
  const section = createSection("Top Cast");

  if (!cast.length) {
    section.append(createElement("p", "details-section__empty", "No cast information available."));
    return section;
  }

  const list = createElement("ul", "cast-list");
  cast.slice(0, MAX_CAST).forEach((person) => list.append(createCastCard(person)));
  section.append(list);
  return section;
}

function createTrailerSection(trailer) {
  const section = createSection("Trailer");

  if (!trailer) {
    section.append(createElement("p", "details-section__empty", "No trailer available."));
    return section;
  }

  const wrapper = createElement("div", "trailer");
  const iframe = createElement("iframe", "trailer__video");
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}`;
  iframe.title = trailer.name;
  iframe.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";

  wrapper.append(iframe);
  section.append(wrapper);
  return section;
}

function renderMovie(movie) {
  document.title = `${movie.title} — CineVault`;
  container.replaceChildren(
    createHero(movie),
    createCastSection(movie.credits.cast),
    createTrailerSection(findTrailer(movie.videos.results)),
  );
}

async function loadMovie() {
  const id = getMovieId();
  if (!id) {
    showError(container, "No movie selected. Head back to the home page and pick one!");
    return;
  }

  showLoader(container);

  try {
    const movie = await getMovieDetails(id);
    renderMovie(movie);
  } catch (error) {
    console.error(error);
    const message = error.status === 404
      ? "We couldn't find that movie."
      : "Couldn't load this movie. Please try again later.";
    showError(container, message);
  }
}

renderHeader();
loadMovie();
