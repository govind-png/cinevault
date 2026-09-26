import { TMDB_TOKEN, TMDB_BASE_URL } from "../config.js";

// Last page TMDB's /discover endpoint will return, whatever total_pages says.
export const MAX_DISCOVER_PAGES = 500;

async function request(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${TMDB_BASE_URL}${endpoint}${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
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
  return request(`/movie/${id}`, { append_to_response: "credits,videos" });
}

export function searchMovies(query) {
  return request("/search/movie", { query, include_adult: false });
}

export function getGenres() {
  return request("/genre/movie/list");
}

export function discoverMovies({
  genres = [],
  sortBy = "popularity.desc",
  year = "",
  minVotes = 0,
  releasedBefore = "",
  page = 1,
} = {}) {
  const params = new URLSearchParams({ sort_by: sortBy, page, include_adult: false });

  // A comma means AND: every selected genre must match.
  if (genres.length) params.set("with_genres", genres.join(","));
  if (year) params.set("primary_release_year", year);
  if (minVotes) params.set("vote_count.gte", minVotes);
  if (releasedBefore) params.set("primary_release_date.lte", releasedBefore);

  return request("/discover/movie", params);
}
