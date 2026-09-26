import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from "../api/tmdb.js";
import { createMovieCard } from "../components/movieCard.js";
import { showLoader, showError } from "../components/feedback.js";

const sections = [
  { selector: "#trending-grid", fetchMovies: getTrendingMovies },
  { selector: "#popular-grid", fetchMovies: getPopularMovies },
  { selector: "#top-rated-grid", fetchMovies: getTopRatedMovies },
];

function renderMovies(movies, container) {
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => fragment.append(createMovieCard(movie)));
  container.replaceChildren(fragment);
}

async function loadSection({ selector, fetchMovies }) {
  const container = document.querySelector(selector);
  showLoader(container);

  try {
    const data = await fetchMovies();
    renderMovies(data.results, container);
  } catch (error) {
    console.error(error);
    showError(container, "Couldn't load these movies. Please try again later.");
  }
}

sections.forEach(loadSection);