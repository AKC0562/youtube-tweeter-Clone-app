# Westeros — Stream of the Seven Kingdoms

A full-stack video + micro-post platform (a YouTube × X hybrid) dressed in a
Game of Thrones theme. Users swear to one of eight great houses at
registration; their house sigil rides beside their name everywhere and
watermarks every video they proclaim.

```
Backend_Mega_Project/
├── backend/    Express 5 + MongoDB API (JWT cookies, Cloudinary uploads)
└── frontend/   React 19 + Vite + Tailwind v4 SPA
```

## Prerequisites

- Node.js 20+ and npm
- MongoDB running locally (or a connection string)
- A Cloudinary account (for avatar / video / thumbnail uploads)

## Quick start

```bash
# 1. backend
cd backend
cp .env.sample .env        # then fill in your keys
npm install
npm run dev                # http://localhost:8000

# 2. frontend (new terminal)
cd frontend
npm install
npm run dev                # http://localhost:5173
```

The frontend proxies `/api` to `http://localhost:8000` in dev, so no extra
config is needed. If the backend is down, the UI falls back to demo
chronicles and offers a one-click demo account.

## Houses

`stark` · `lannister` · `targaryen` · `baratheon` · `greyjoy` · `tyrell` ·
`martell` · `arryn`

Sigil art lives in `frontend/public/house_logos/` and is served as-is;
`frontend/public/logo.png` (the Iron Throne) is the brand mark and favicon.

## API map (base `/api/v1`)

| Prefix          | Routes |
|-----------------|--------|
| `/user`         | `POST /register`, `POST /login`, `POST /logout`, `POST /refreshtoken`, `POST /changepassword`, `GET /current-user`, `PATCH /update-acc`, `PATCH /avatar`, `PATCH /coverimg`, `GET /c/:username`, `GET /history` |
| `/video`        | `GET+POST /`, `GET+DELETE+PATCH /:videoId`, `PATCH /toggle/publish/:videoId` |
| `/comment`      | `GET+POST /:videoId`, `DELETE+PATCH /c/:commentId` |
| `/tweet`        | `POST /`, `GET /user/:userId`, `PATCH+DELETE /:tweetId` |
| `/like`         | `POST /toggle/v/:videoId`, `POST /toggle/c/:commentId`, `POST /toggle/t/:tweetId`, `GET /videos` |
| `/playlist`     | `POST /`, `GET+PATCH+DELETE /:playlistId`, `PATCH /add/:videoId/:playlistId`, `PATCH /remove/:videoId/:playlistId`, `GET /user/:userId` |
| `/subscription` | `GET+POST /c/:channelId`, `GET /u/:subscriberId` |
| `/dashboard`    | `GET /stats`, `GET /videos` |
| `/healthcheck`  | `GET /` |

Responses follow `{ statusCode, data, message, success }`.

## Docs

- [`backend/README.md`](backend/README.md) — API setup, env reference, endpoint details
- [`frontend/README.md`](frontend/README.md) — UI setup, proxy, features, project map
