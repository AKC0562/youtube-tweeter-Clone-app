// Thin fetch wrapper around the backend in ../backend.
// Uses same-origin "/api/v1" so the vite dev proxy (see vite.config.js)
// forwards to :8000, and cookies go along for auth.

const BASE = import.meta.env.VITE_API_BASE || "/api/v1";

let accessToken = localStorage.getItem("sx_token") || "";

export function setToken(token) {
  accessToken = token || "";
  if (token) localStorage.setItem("sx_token", token);
  else localStorage.removeItem("sx_token");
}

export function getToken() {
  return accessToken;
}

async function request(method, path, body, isForm = false) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    const e = new Error("Backend is not reachable");
    e.offline = true;
    throw e;
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-json (proxy 404 etc.)
  }

  if (!res.ok) {
    const e = new Error(json?.message || `Request failed (${res.status})`);
    e.status = res.status;
    e.payload = json;
    throw e;
  }
  // backend wraps everything in ApiResponse { statusCode, data, message }
  return json?.data !== undefined ? json.data : json;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
  postForm: (p, f) => request("POST", p, f, true),
  patchForm: (p, f) => request("PATCH", p, f, true),

  // ---- auth ----
  register(form) {
    return this.postForm("/user/register", form);
  },
  async login(payload) {
    const data = await this.post("/user/login", payload);
    if (data?.accessToken) setToken(data.accessToken);
    return data;
  },
  async logout() {
    try {
      await this.post("/user/logout", {});
    } finally {
      setToken("");
    }
  },
  currentUser() {
    return this.get("/user/current-user");
  },

  // ---- videos ----
  videos({ query = "", page = 1, limit = 12, userId = "" } = {}) {
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(query ? { query } : {}),
      ...(userId ? { userId } : {}),
    });
    return this.get(`/video?${q.toString()}`);
  },
  video(id) {
    return this.get(`/video/${id}`);
  },
  publishVideo(form) {
    return this.postForm("/video", form);
  },
  togglePublish(id) {
    return this.patch(`/video/toggle/publish/${id}`, {});
  },
  removeVideo(id) {
    return this.del(`/video/${id}`);
  },

  // ---- tweets ----
  createTweet(content) {
    return this.post("/tweet", { content });
  },
  userTweets(userId) {
    return this.get(`/tweet/user/${userId}`);
  },
  removeTweet(id) {
    return this.del(`/tweet/${id}`);
  },

  // ---- likes ----
  likeVideo(id) {
    return this.post(`/like/toggle/v/${id}`, {});
  },
  likeTweet(id) {
    return this.post(`/like/toggle/t/${id}`, {});
  },
  likeComment(id) {
    return this.post(`/like/toggle/c/${id}`, {});
  },
  likedVideos() {
    return this.get("/like/videos");
  },

  // ---- comments ----
  comments(videoId, page = 1) {
    return this.get(`/comment/${videoId}?page=${page}&limit=20`);
  },
  addComment(videoId, content) {
    return this.post(`/comment/${videoId}`, { content });
  },
  removeComment(id) {
    return this.del(`/comment/c/${id}`);
  },

  // ---- subscriptions ----
  toggleSub(channelId) {
    return this.post(`/subscription/c/${channelId}`, {});
  },
  channelSubs(channelId) {
    return this.get(`/subscription/c/${channelId}`);
  },

  // ---- playlists ----
  createPlaylist(name, description) {
    return this.post("/playlist", { name, description });
  },
  userPlaylists(userId) {
    return this.get(`/playlist/user/${userId}`);
  },
  playlist(id) {
    return this.get(`/playlist/${id}`);
  },
  playlistAdd(videoId, playlistId) {
    return this.patch(`/playlist/add/${videoId}/${playlistId}`, {});
  },
  playlistRemove(videoId, playlistId) {
    return this.patch(`/playlist/remove/${videoId}/${playlistId}`, {});
  },
  removePlaylist(id) {
    return this.del(`/playlist/${id}`);
  },

  // ---- dashboard ----
  stats() {
    return this.get("/dashboard/stats");
  },
  channelVideos() {
    return this.get("/dashboard/videos");
  },

  health() {
    return this.get("/healthcheck");
  },
};
