// Public settings only. This file is committed, so it must never contain secrets.
// The TMDB token lives in the TMDB_TOKEN environment variable and is only used
// by the serverless proxy in netlify/functions/tmdb.mjs.
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
