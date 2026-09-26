// Serverless proxy for the TMDB API.
//
// The browser calls /api/tmdb/<tmdb-path>?<params>. This function runs on
// Netlify's servers, checks the request against an allowlist, adds the secret
// token from the TMDB_TOKEN environment variable, and forwards it to TMDB.
// The token never reaches the browser.

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const MAX_VALUE_LENGTH = 100;

// Every TMDB endpoint CineVault uses, and the query parameters each one may send.
// Anything else is rejected, so this can't be used as an open proxy.
const ALLOWED_ROUTES = [
  { pattern: /^\/trending\/movie\/week$/, params: [] },
  { pattern: /^\/movie\/popular$/, params: [] },
  { pattern: /^\/movie\/top_rated$/, params: [] },
  // Movie details, with credits and videos bundled in via append_to_response
  { pattern: /^\/movie\/\d+$/, params: ["append_to_response"] },
  { pattern: /^\/search\/movie$/, params: ["query", "include_adult"] },
  { pattern: /^\/genre\/movie\/list$/, params: [] },
  {
    pattern: /^\/discover\/movie$/,
    params: [
      "sort_by",
      "page",
      "include_adult",
      "with_genres",
      "primary_release_year",
      "vote_count.gte",
      "primary_release_date.lte",
    ],
  },
];

// Parameters that may only ever have one value.
const FIXED_VALUES = {
  include_adult: "false",
  append_to_response: "credits,videos",
};

function errorResponse(status, message, headers = {}) {
  return Response.json({ error: message }, { status, headers });
}

function buildTmdbQuery(searchParams, allowedParams) {
  const query = new URLSearchParams();

  for (const [key, value] of searchParams) {
    const isAllowed = allowedParams.includes(key);
    const isValidValue = key in FIXED_VALUES
      ? value === FIXED_VALUES[key]
      : value.length > 0 && value.length <= MAX_VALUE_LENGTH;

    if (!isAllowed || !isValidValue || query.has(key)) return null;
    query.set(key, value);
  }

  return query;
}

export default async (req) => {
  if (req.method !== "GET") {
    return errorResponse(405, "Method not allowed", { Allow: "GET" });
  }

  const token = process.env.TMDB_TOKEN;
  if (!token) {
    console.error("TMDB_TOKEN environment variable is not set");
    return errorResponse(500, "Server is not configured");
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/tmdb/, "");

  const route = ALLOWED_ROUTES.find(({ pattern }) => pattern.test(path));
  if (!route) {
    return errorResponse(404, "Not found");
  }

  const query = buildTmdbQuery(url.searchParams, route.params);
  if (!query) {
    return errorResponse(400, "Bad request");
  }

  let tmdbResponse;
  try {
    tmdbResponse = await fetch(`${TMDB_BASE_URL}${path}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });
  } catch (error) {
    console.error("Could not reach TMDB:", error);
    return errorResponse(502, "Could not reach the movie service");
  }

  if (!tmdbResponse.ok) {
    // Log the details here (visible in Netlify's function logs), but only send
    // the browser a generic message. 404 and 429 pass through because the
    // site handles them; anything else (like a bad token) becomes a 502.
    console.error(`TMDB responded ${tmdbResponse.status} for ${path}`);
    if (tmdbResponse.status === 404) return errorResponse(404, "Not found");
    if (tmdbResponse.status === 429) return errorResponse(429, "Too many requests");
    return errorResponse(502, "The movie service returned an error");
  }

  return new Response(tmdbResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
};

export const config = {
  path: "/api/tmdb/*",
};
