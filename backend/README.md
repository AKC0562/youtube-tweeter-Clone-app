# Backend — Westeros API

Express 5 + MongoDB (Mongoose) REST API for the Westeros platform:
auth with JWT cookies, Cloudinary media uploads via Multer, and resources
for videos, tweets (ravens), comments, likes, playlists, subscriptions and
channel dashboards.

## Setup

```bash
npm install
cp .env.sample .env   # fill in real values (see below)
npm run dev           # nodemon src/index.js → http://localhost:8000
```

Requires a reachable MongoDB (`MONGODB_URI/<DB_NAME>`, DB name lives in
`src/constants.js`) and Cloudinary credentials — uploads fail without them.

## Environment

| Key                    | Purpose                              |
|------------------------|--------------------------------------|
| `PORT`                 | HTTP port (default `8000`)           |
| `MONGODB_URI`          | Mongo connection string, no db name  |
| `CORS_ORIGIN`          | Allowed origin (`*` for local dev)   |
| `ACCESS_TOKEN_SECRET`  | JWT signing key, access tokens       |
| `ACCESS_TOKEN_EXPIRY`  | e.g. `1d`                            |
| `REFRESH_TOKEN_SECRET` | JWT signing key, refresh tokens      |
| `REFRESH_TOKEN_EXPIRY` | e.g. `10d`                           |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name                |
| `CLOUDINARY_API_KEY`   | Cloudinary API key                   |
| `CLOUDINARY_SECRET`    | Cloudinary API secret                |

Never commit `.env` — it is gitignored. `.env.sample` shows the shape.

## Scripts

| Command       | What it does              |
|---------------|---------------------------|
| `npm run dev` | Start with nodemon reload |

## Routes (base `/api/v1`)

Auth is cookie + `Authorization: Bearer` friendly (`verifyJWT` accepts
either). Most resource routes require it; `POST /user/register`,
`POST /user/login` and `GET /healthcheck` are public.

| Prefix          | Method + path |
|-----------------|---------------|
| `user`          | `POST /register` (multipart: `avatar*`, `coverImg`, fields incl. `house`), `POST /login`, `POST /logout`, `POST /refreshtoken`, `POST /changepassword`, `GET /current-user`, `PATCH /update-acc`, `PATCH /avatar` (single `avatar`), `PATCH /coverimg` (single `coverImg`), `GET /c/:username`, `GET /history` |
| `video`         | `GET /` (query: `page limit query sortBy sortType userId`), `POST /` (multipart: `videoFile`, `thumbnail`), `GET /:videoId`, `PATCH /:videoId` (single `thumbnail`), `DELETE /:videoId`, `PATCH /toggle/publish/:videoId` |
| `comment`       | `GET /:videoId` (paginated), `POST /:videoId` (`content`), `PATCH /c/:commentId`, `DELETE /c/:commentId` |
| `tweet`         | `POST /` (`content`), `GET /user/:userId`, `PATCH /:tweetId`, `DELETE /:tweetId` |
| `like`          | `POST /toggle/v/:videoId`, `POST /toggle/c/:commentId`, `POST /toggle/t/:tweetId`, `GET /videos` (liked by me) |
| `playlist`      | `POST /` (`name`, `description`), `GET /:playlistId`, `PATCH /:playlistId`, `DELETE /:playlistId`, `PATCH /add/:videoId/:playlistId`, `PATCH /remove/:videoId/:playlistId`, `GET /user/:userId` |
| `subscription`  | `GET /c/:channelId` (its subscribers), `POST /c/:channelId` (toggle), `GET /u/:subscriberId` (channels it follows) |
| `dashboard`     | `GET /stats`, `GET /videos` (own channel) |
| `healthcheck`   | `GET /` |

## Houses

`User.house` is one of `stark | lannister | targaryen | baratheon |
greyjoy | tyrell | martell | arryn` (default `stark`). Registration
rejects anything else. Owner lookups across videos, comments, tweets,
likes, playlists and subscriptions project `house` so clients can render
sigils without extra calls.

## Notes

- Uploads are staged in `public/temp/` (gitignored, kept by `.gitkeep`)
  before going to Cloudinary; the temp file is deleted after upload.
- Video documents use the field `tumbnail` (historical spelling — kept for
  compatibility, do not "fix" without a migration).
- A Postman collection lives in `.postman/` (may be stale — the table
  above is authoritative).
