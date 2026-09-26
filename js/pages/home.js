import { getTrendingMovies } from "../api/tmdb.js";
import { createMovieCard } from "../components/movieCard.js";

const trendingGrid = document.querySelector("#trending-grid");

function renderMovies(movies, container) {
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => fragment.append(createMovieCard(movie)));
  container.replaceChildren(fragment);
}

async function init() {
  try {
    const data = await getTrendingMovies();
    renderMovies(data.results, trendingGrid);
  } catch (error) {
    console.error(error);
    trendingGrid.textContent = "Couldn't load movies. Please try again later.";
  }
}

init();