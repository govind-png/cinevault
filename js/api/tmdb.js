import { TMDB_TOKEN, TMDB_BASE_URL } from "../config.js";

async function request(endpoint) {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
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

export function getMovieDetails(id) {
  return request(`/movie/${id}?append_to_response=credits,videos`);
}

export function searchMovies(query) {
  return request(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false`);
}
