import { getMovieDetails } from "../api/tmdb.js";
import { TMDB_IMAGE_BASE_URL } from "../config.js";
import { renderHeader } from "../components/header.js";
import { createCastCard } from "../components/castCard.js";
import { createWatchlistButton } from "../components/watchlistButton.js";
import { createRating } from "../components/rating.js";
import { showLoader, showError } from "../components/feedback.js";
import { createElement } from "../utils/dom.js";
import { getYear, formatRuntime } from "../utils/format.js";

const PLACEHOLDER_POSTER = "assets/images/no-poster.svg";
const MAX_CAST = 12;

const container = document.querySelector("#movie-details");

function showNotFound(message) {
  document.title = "Movie not found — CineVault";

  const notFound = createElement("section", "not-found container");
  const homeLink = createElement("a", "not-found__link", "Back to home");
  homeLink.href = "index.html";

  notFound.append(
    createElement("h1", "not-found__title", "Movie not found"),
    createElement("p", "not-found__text", message),
    homeLink,
  );
  container.replaceChildren(notFound);
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
    backdrop.srcset = `${TMDB_IMAGE_BASE_URL}/w780${movie.backdrop_path} 780w, ${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path} 1280w`;
    backdrop.sizes = "100vw";
    backdrop.alt = "";
    hero.append(backdrop);
  }

  const content = createElement("div", "movie-hero__content container");

  const poster = createElement("img", "movie-hero__poster");
  if (movie.poster_path) {
    poster.src = `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}`;
    poster.srcset = `${TMDB_IMAGE_BASE_URL}/w185${movie.poster_path} 185w, ${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path} 342w`;
    poster.sizes = "(min-width: 768px) 240px, 200px";
  } else {
    poster.src = PLACEHOLDER_POSTER;
  }
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
    createRating("movie-hero__rating", movie.vote_average),
  );
  info.append(meta);

  if (movie.genres.length) {
    const genres = createElement("ul", "movie-hero__genres");
    movie.genres.forEach((genre) => genres.append(createElement("li", "genre-tag", genre.name)));
    info.append(genres);
  }

  info.append(createWatchlistButton(movie));

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
  if (movie.overview) {
    document.querySelector('meta[name="description"]').content = movie.overview;
  }
  container.replaceChildren(
    createHero(movie),
    createCastSection(movie.credits.cast),
    createTrailerSection(findTrailer(movie.videos.results)),
  );
}

async function loadMovie() {
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    showNotFound("No movie was chosen. Pick one from the home page to see its details.");
    return;
  }
  if (!/^\d+$/.test(id)) {
    showNotFound("This link doesn't point to a valid movie. It may have been mistyped.");
    return;
  }

  showLoader(container);

  try {
    const movie = await getMovieDetails(id);
    renderMovie(movie);
  } catch (error) {
    console.error(error);
    if (error.status === 404) {
      showNotFound("We couldn't find a movie with that ID. It may have been removed.");
    } else {
      showError(container, "Couldn't load this movie. Please try again later.");
    }
  }
}

renderHeader();
loadMovie();
