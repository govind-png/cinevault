import { TMDB_TOKEN, TMDB_BASE_URL } from "../config.js";

async function request(endpoint) {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function getTrendingMovies() {
  return request("/trending/movie/week");
}
export function getPopularMovies() {
  return request("/movie/popular");
}

export function getTopRatedMovies() {
  return request("/movie/top_rated");
}