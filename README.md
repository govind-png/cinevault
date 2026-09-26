# CineVault

A multi-page movie discovery site built with vanilla JavaScript and the TMDB API.

![CineVault home page](docs/screenshots/home.png)

## Features

- **Home page** – Trending this week, Popular right now, and Top rated of all time, each with loading and error states.
- **Movie details** – Backdrop, poster, tagline, release year, runtime, rating, genres, overview, the top 12 cast members, and the official YouTube trailer. Missing, invalid or unknown movie IDs show a "Movie not found" page with a link back home.
- **Search** – A search box in the header on every page. On the search page, results update as you type (debounced), and the query lives in the URL (`search.html?query=dune`) so searches can be bookmarked and shared.
- **Discover** – Filter by one or more genres, release year, and sort order (most popular, highest rated, newest). Filters are stored in the URL and work with the back button. "Load more" appends the next page without duplicates.
- **Watchlist** – Save movies from the details page and manage them on the watchlist page. The header shows a live count, and changes sync across open tabs. Stored in `localStorage`, so no account is needed.
- **Mobile-first and responsive** – Layouts are built for phones first and expand at wider screens, with 44px tap targets and smaller images on small screens.
- **Accessible** – Skip to main content link, labelled inputs, visible focus styles on every control, sensible alt text, screen-reader announcements for results and state changes, and support for the reduced-motion setting.

## Tech stack

- HTML, CSS (custom properties, BEM naming)
- Vanilla JavaScript with ES modules
- [TMDB API](https://developer.themoviedb.org/docs), called through a [Netlify Function](https://docs.netlify.com/build/functions/overview/) so the token stays on the server
- No frameworks, libraries, or build tools

## Project structure

```
cinevault/
├── public/                # The website (the only folder Netlify publishes)
│   ├── *.html             # One page per view: index, movie, search, discover, watchlist
│   ├── assets/images/     # Static images: favicon and placeholder poster
│   ├── css/
│   │   ├── variables.css  # Design tokens: colors, spacing, radius
│   │   ├── base.css       # Resets and global element styles
│   │   ├── layout.css     # Container, header, and grid layout
│   │   ├── components.css # Styles for reusable components
│   │   └── pages/         # Styles used by a single page
│   └── js/
│       ├── config.js      # Public settings only (image URL), no secrets
│       ├── api/           # tmdb.js: the only file that requests movie data
│       ├── components/    # Reusable UI: header, movie card, cast card, rating, feedback, watchlist button
│       ├── pages/         # One controller per HTML page
│       └── utils/         # Helpers: DOM, formatting, debounce, localStorage
├── netlify/functions/     # tmdb.mjs: serverless proxy that adds the token and calls TMDB
├── netlify.toml           # Netlify settings: publish folder, functions folder, local dev
├── .env.example           # Template for .env, which holds your token locally (gitignored)
└── docs/screenshots/      # Images for this README
```

## Getting started

You need [Node.js](https://nodejs.org) (the LTS version) to run the Netlify CLI, which serves the site and runs the proxy function locally.

1. **Clone the repo**

   ```bash
   git clone https://github.com/govind-png/cinevault.git
   cd cinevault
   ```

2. **Install the Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

3. **Add your TMDB token.** Create a free account on [themoviedb.org](https://www.themoviedb.org), go to [Settings → API](https://www.themoviedb.org/settings/api), and copy the **API Read Access Token**. Then create your `.env` file and paste the token in place of `YOUR_TMDB_READ_ACCESS_TOKEN`:

   ```bash
   cp .env.example .env
   ```

4. **Start the dev server** from the project folder

   ```bash
   netlify dev
   ```

5. Open **http://localhost:8888**.

> **Why `netlify dev` and not a simple file server?** The pages load movie data from `/api/tmdb/...`, which only exists when the serverless function is running. `netlify dev` serves the `public/` folder, runs the function, and loads your token from `.env`. A plain server like `python3 -m http.server` would show the pages, but no movies would load.

## Deployment

The site is set up for [Netlify](https://www.netlify.com):

1. Import the GitHub repo into Netlify. `netlify.toml` already tells it to publish `public/` and where the function lives, and no build command is needed.
2. In **Site configuration → Environment variables**, add `TMDB_TOKEN` with your TMDB API Read Access Token (with the Functions scope included).
3. Deploy. The site is served from Netlify's CDN, and movie requests go through the function.

## Security note

- The TMDB token is only ever read on the server, from the `TMDB_TOKEN` environment variable: from `.env` locally (gitignored) and from Netlify's environment variables in production. It is never in the repo or sent to the browser.
- Never put a real token in `.env.example`, which is committed.
- The proxy only accepts `GET` requests for the TMDB endpoints and query parameters this site uses, and rejects everything else, so it can't be used as an open proxy. Error responses are generic; details only go to the function logs.
- Only the `public/` folder is published, so files like `.env` and the function source are never served as web pages.
- Images still load directly from `image.tmdb.org`, because they don't need a token.

## What I learned

- **Data layer** – Keeping every API call in one module (`js/api/tmdb.js`) so pages never deal with URLs, headers, or error codes directly.
- **Reusable components** – Functions like `createMovieCard` and `renderHeader` that build UI once and get used on every page.
- **fetch with async/await** – Loading data, checking `response.ok`, and handling errors with `try`/`catch`, including loading and error states in the UI.
- **XSS-safe rendering** – Putting API data on the page with `textContent` instead of `innerHTML`, so text from the API can never run as HTML or script.
- **Debouncing** – Waiting until the user stops typing before searching, and ignoring slow responses that arrive after newer ones.
- **localStorage** – Saving the watchlist as JSON (`JSON.stringify` / `JSON.parse`), with a safe fallback when the stored data is missing or corrupted.
- **URL state** – Using `URLSearchParams` and the History API so searches and filters can be bookmarked, shared, and restored with the back button.
- **Serverless functions and environment variables** – Keeping a secret on the server by routing API calls through a Netlify Function that reads the token from an environment variable, with an allowlist so it can't be misused.
- **Mobile-first CSS and accessibility** – Writing phone styles first and adding `min-width` media queries for larger screens, and checking contrast, tap target sizes, headings, and keyboard focus.
- **Feature branches** – Building each feature on its own Git branch and merging it into `main` once it has been tested.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie data and images are provided by [The Movie Database (TMDB)](https://www.themoviedb.org).
