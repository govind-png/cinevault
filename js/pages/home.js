import { getTrendingMovies } from "../api/tmdb.js";

async function init() {
  try {
    const data = await getTrendingMovies();
    console.log("Trending movies:", data.results);
  } catch (error) {
    console.error(error);
  }
}

init();