# Frontend — Westeros SPA

React 19 + Vite + Tailwind CSS v4 single-page app for the Westeros
platform: a dark, Game of Thrones–themed video + raven (posts) client for
the Express API in `../backend`.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production bundle → dist/
npm run preview   # serve the bundle locally
npm run lint      # eslint (must be clean)
```

No `.env` needed for local dev: `/api` is proxied to
`http://localhost:8000` (see `vite.config.js`). To point at another API:

```bash
VITE_API_BASE=https://api.example.com/api/v1 npm run build
```

## How it talks to the API

- `src/api/client.js` — fetch wrapper; sends cookies (`credentials:
  include`) plus a stored bearer token, unwraps the backend's
  `{ statusCode, data, message }` envelope, throws `Error` with `.offline`
  when the backend is unreachable.
- Auth state restores from the stored token via `GET /user/current-user`.
- If the backend is down, the app shows demo chronicles, keeps uploads /
  posts / likes local, and offers a one-click demo account (House Stark).

## Features

- The Realm (home) with per-house filter chips, search, video grid
- Watch page: player with house watermark, fealty (subscribe), honours
  (likes), shelve-to-scroll (playlists), chronicles (description),
  hall words (comments), up-next rail, latest ravens
- The Rookery (posts): 280-char raven composer, like / delete
- Allegiances (subscriptions), Scrolls (playlists), Chronicles (history),
  Honours (liked), Small Council (channel stats + content controls)
- Channel keeps with cover banner, verified-style house sigil, house words
- Two-step registration: details first, then the house oath (sigil grid);
  `house` is sent with the register FormData

## Project map

```
src/
├── api/         client.js — base URL, token, endpoint helpers
├── components/  Navbar, Sidebar, VideoCard, Posts, Modals, ui, icons
├── data/        houses.js (8 houses + sigil paths), seed.js (demo data)
├── pages/       Home, Watch, PostsPage, Channel, Dashboard, Library
├── utils/       format.js — counts, dates, avatar colours, coverOf
├── App.jsx      hash routing, session, data orchestration, toasts
├── main.jsx     entry
└── index.css    Tailwind v4 theme (night / parchment / gold tokens)
```

`public/house_logos/` holds the eight shield PNGs (served as-is, never
imported through the bundler); `public/logo.png` is the Iron Throne brand
mark and favicon.

## Conventions

- Styling is Tailwind utilities + the v4 `@theme` tokens (`night-*`,
  `parchment-*`, `gold-*`, `blood-*`, `font-display` for Cinzel).
- No gradients, no glassmorphism — solid surfaces, 1px borders.
- Photos before initials: `Avatar` renders `src` when present.
- Covers: `coverOf()` reads `coverImage` or legacy `coverImg`.
