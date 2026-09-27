import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { AuthModal, ConfirmModal, UploadModal } from "./components/Modals";
import { Field, ToastStack } from "./components/ui";
import { CloseIcon } from "./components/icons";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import PostsPage from "./pages/PostsPage";
import Channel from "./pages/Channel";
import Dashboard from "./pages/Dashboard";
import { History, Liked, PlaylistDetail, Playlists, Subscriptions } from "./pages/Library";
import { api, getToken } from "./api/client";
import { seedChannels, seedComments, seedPlaylists, seedTweets, seedVideos } from "./data/seed";
import { houseOf } from "./data/houses";

let toastId = 0;

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  const [name = "", param = ""] = h.split("/");
  return { name: name || "home", param: decodeURIComponent(param || "") };
}

function baseLikes(v) {
  if (typeof v.likeCount === "number") return v.likeCount;
  if (typeof v.likes === "number") return v.likes;
  return Math.round((v.views || 0) * 0.04);
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.docs)) return payload.docs;
  return [];
}

export default function App() {
  const [route, setRoute] = useState(parseHash);

  const [user, setUser] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [backendUp, setBackendUp] = useState(null);

  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [houseFilter, setHouseFilter] = useState("All");
  const [query, setQuery] = useState("");

  const [watch, setWatch] = useState({ video: null, loading: false });
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);

  const [tweets, setTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [likedTweetIds, setLikedTweetIds] = useState([]);
  const [localTweets, setLocalTweets] = useState([]);

  const [likedVideoIds, setLikedVideoIds] = useState([]);
  const [likeBusy, setLikeBusy] = useState(false);
  const [subIds, setSubIds] = useState([]);
  const [subBusy, setSubBusy] = useState(false);

  const [playlists, setPlaylists] = useState(seedPlaylists);
  const [playlistDetail, setPlaylistDetail] = useState(null);
  const [localVideos, setLocalVideos] = useState([]);

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sx_history") || "[]");
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState({ totalViews: 0, totalSubscribers: 0, totalVideos: 0, totalLikes: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  const [toasts, setToasts] = useState([]);
  const [authModal, setAuthModal] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [playlistModal, setPlaylistModal] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const toast = useCallback((text, kind = "info") => {
    const id = ++toastId;
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  function nav(name, param = "") {
    window.location.hash = param ? `#/${name}/${encodeURIComponent(param)}` : `#/${name}`;
  }

  useEffect(() => {
    function onHash() {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    localStorage.setItem("sx_history", JSON.stringify(history.slice(0, 30)));
  }, [history]);

  // ---------- loaders ----------

  const loadHome = useCallback(
    async (q = "") => {
      setVideosLoading(true);
      try {
        const data = await api.videos({ query: q, limit: 24 });
        setBackendUp(true);
        const list = asArray(data);
        setVideos(list.length ? list : q ? [] : [...localVideos, ...seedVideos]);
      } catch (e) {
        if (e.offline && backendUp !== false) {
          setBackendUp(false);
          toast("The ravens cannot reach the backend — showing chronicles from memory", "error");
        }
        const all = [...localVideos, ...seedVideos];
        const needle = q.trim().toLowerCase();
        setVideos(needle ? all.filter((v) => `${v.title} ${v.description}`.toLowerCase().includes(needle)) : all);
      } finally {
        setVideosLoading(false);
      }
    },
    [backendUp, localVideos, toast]
  );

  useEffect(() => {
    // initial page load (hash already parsed into state above)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHome(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // session restore + backend probe
  useEffect(() => {
    (async () => {
      try {
        await api.health();
        setBackendUp(true);
      } catch {
        setBackendUp(false);
      }
      if (getToken()) {
        try {
          const me = await api.currentUser();
          setUser(me?.user || me);
        } catch {
          /* token expired — stay signed out */
        }
      }
    })();
  }, []);

  const openVideo = useCallback(
    async (idOrVideo) => {
      const id = typeof idOrVideo === "string" ? idOrVideo : idOrVideo._id;
      nav("watch", id);
      setWatch((w) => ({ ...w, loading: true }));
      setComments([]);
      let video = typeof idOrVideo === "object" ? idOrVideo : null;
      if (!video) {
        video = [...localVideos, ...seedVideos, ...videos].find((v) => v._id === id) || null;
        if (!video && backendUp !== false) {
          try {
            video = await api.video(id);
            setBackendUp(true);
          } catch (e) {
            if (e.offline) setBackendUp(false);
            video = null;
          }
        }
      }
      if (video) {
        setWatch({ video, loading: false });
        setHistory((h) => [{ ...video, watchedAt: Date.now() }, ...h.filter((x) => x._id !== video._id)].slice(0, 30));
        // comments
        setCommentsLoading(true);
        if (video.seed || backendUp === false) {
          setComments(seedComments);
          setCommentsLoading(false);
        } else {
          try {
            const data = await api.comments(video._id);
            setComments(asArray(data));
          } catch {
            setComments([]);
          } finally {
            setCommentsLoading(false);
          }
        }
      } else {
        setWatch({ video: null, loading: false });
      }
    },
    [backendUp, localVideos, videos]
  );

  const loadTweets = useCallback(async () => {
    setTweetsLoading(true);
    try {
      let mine = [];
      if (user && !demoMode && backendUp !== false) {
        try {
          mine = asArray(await api.userTweets(user._id));
        } catch {
          mine = [];
        }
      } else if (user && demoMode) {
        mine = localTweets;
      }
      const mineIds = new Set(mine.map((t) => t._id));
      setTweets([...mine, ...localTweets.filter((t) => !mineIds.has(t._id)), ...seedTweets]);
    } finally {
      setTweetsLoading(false);
    }
  }, [user, demoMode, backendUp, localTweets]);

  const loadPlaylists = useCallback(async () => {
    if (user && !demoMode && backendUp !== false) {
      try {
        const data = await api.userPlaylists(user._id);
        const list = asArray(data);
        if (list.length || playlists.length === 0) setPlaylists(list.length ? list : playlists);
        return;
      } catch {
        /* fall through to local */
      }
    }
  }, [user, demoMode, backendUp, playlists]);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      if (!demoMode && backendUp !== false) {
        const s = await api.stats();
        setStats({
          totalViews: s.totalViews || 0,
          totalSubscribers: s.totalSubscribers || 0,
          totalVideos: s.totalVideos || 0,
          totalLikes: s.totalLikes || 0,
        });
        setBackendUp(true);
      } else {
        throw new Error("local");
      }
    } catch {
      const mine = [...localVideos, ...seedVideos].filter((v) =>
        demoMode ? v.seed : v.owner?._id === user._id || v.owner === user._id
      );
      const shown = demoMode ? mine.slice(0, 4) : mine;
      setStats({
        totalViews: shown.reduce((a, v) => a + (v.views || 0), 0),
        totalSubscribers: demoMode ? 1284 : subIds.length * 37,
        totalVideos: shown.length,
        totalLikes: shown.reduce((a, v) => a + baseLikes(v), 0),
      });
    } finally {
      setStatsLoading(false);
    }
  }, [user, demoMode, backendUp, localVideos, subIds.length]);

  useEffect(() => {
    // route changes come from the hash (external system), loaders just react to them.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (route.name === "posts") loadTweets();
    if (route.name === "dashboard") loadDashboard();
    if (route.name === "playlists" || route.name === "watch") loadPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.name]);

  // ---------- auth ----------

  async function handleAuth(mode, payload) {
    setAuthBusy(true);
    setAuthError("");
    try {
      if (demoMode) setDemoMode(false);
      if (mode === "login") {
        const data = await api.login(payload);
        const me = data?.user || data;
        setUser(me);
        try {
          const full = await api.currentUser();
          setUser(full?.user || full || me);
        } catch { /* use login payload */ }
      } else {
        await api.register(payload);
        const data = await api.login({ email: payload.get("email"), password: payload.get("password") });
        setUser(data?.user || data);
      }
      setAuthModal(null);
      toast("Signed in — welcome back");
      loadHome(query);
    } catch (e) {
      setAuthError(e.offline ? "Can't reach the backend. Try the demo account instead." : e.message);
    } finally {
      setAuthBusy(false);
    }
  }

  function enterDemo() {
    setDemoMode(true);
    setUser({ _id: "demo-user", userName: "demouser", fullName: "Demo User", email: "demo@westeros.tv", house: "stark" });
    setAuthModal(null);
    toast("Exploring with a demo account — uploads stay in this browser");
  }

  async function logout() {
    try {
      if (!demoMode) await api.logout();
    } catch { /* ignore */ }
    setDemoMode(false);
    setUser(null);
    setLikedVideoIds([]);
    setLikedTweetIds([]);
    setSubIds([]);
    nav("home");
    toast("Signed out");
  }

  // ---------- videos ----------

  async function handleUpload(formData) {
    if (!user) return setAuthModal("login");
    setUploadBusy(true);
    setUploadError("");
    try {
      if (demoMode || backendUp === false) {
        const title = formData.get("title");
        const description = formData.get("description");
        const file = formData.get("videoFile");
        const thumb = formData.get("thumbnail");
        const v = {
          _id: `local-${Date.now()}`,
          title,
          description,
          views: 0,
          duration: 0,
          isPublished: true,
          createdAt: new Date().toISOString(),
          owner: { _id: user._id, userName: user.userName, fullName: user.fullName, house: user.house },
          videoFile: file ? URL.createObjectURL(file) : "",
          tumbnail: thumb ? URL.createObjectURL(thumb) : "",
          seed: true,
        };
        setLocalVideos((l) => [v, ...l]);
        setVideos((l) => [v, ...l]);
        setUploadOpen(false);
        toast("Video published to your library");
        openVideo(v);
      } else {
        const created = await api.publishVideo(formData);
        setUploadOpen(false);
        toast("Video published");
        loadHome(query);
        if (created?._id) openVideo(created._id);
      }
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploadBusy(false);
    }
  }

  async function toggleVideoLike(v) {
    if (!user) return setAuthModal("login");
    const id = v._id;
    if (v.seed || demoMode || backendUp === false) {
      setLikedVideoIds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
      return;
    }
    setLikeBusy(true);
    try {
      const res = await api.likeVideo(id);
      const isLiked = res?.isLiked !== false && !res?.removed;
      // backend returns the like doc on like, { isLiked:false } on unlike
      const likedNow = res?.isLiked !== undefined ? res.isLiked : !!res?._id;
      setLikedVideoIds((l) => (likedNow ? [...new Set([...l, id])] : l.filter((x) => x !== id)));
      void isLiked;
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLikeBusy(false);
    }
  }

  async function deleteVideo(v) {
    setConfirm({
      title: "Delete this video?",
      body: `“${v.title}” will be permanently removed. This can't be undone.`,
      label: "Delete",
      run: async () => {
        if (!v.seed && !demoMode && backendUp !== false) {
          try {
            await api.removeVideo(v._id);
          } catch (e) {
            toast(e.message, "error");
            return;
          }
        }
        setVideos((l) => l.filter((x) => x._id !== v._id));
        setLocalVideos((l) => l.filter((x) => x._id !== v._id));
        nav("home");
        toast("Video deleted");
      },
    });
  }

  async function togglePublish(v) {
    if (!v.seed && !demoMode && backendUp !== false) {
      try {
        const updated = await api.togglePublish(v._id);
        const flag = updated?.isPublished;
        setVideos((l) => l.map((x) => (x._id === v._id ? { ...x, isPublished: flag } : x)));
        setWatch((w) => (w.video?._id === v._id ? { ...w, video: { ...w.video, isPublished: flag } } : w));
        toast(flag ? "Video is now public" : "Video is now unlisted");
        return;
      } catch (e) {
        toast(e.message, "error");
        return;
      }
    }
    const flag = !(v.isPublished === false);
    const next = flag ? false : true;
    setVideos((l) => l.map((x) => (x._id === v._id ? { ...x, isPublished: next } : x)));
    setWatch((w) => (w.video?._id === v._id ? { ...w, video: { ...w.video, isPublished: next } } : w));
    toast(next ? "Video is now public" : "Video is now unlisted");
  }

  // ---------- subscriptions ----------

  function isSubbed(id) {
    return subIds.includes(id);
  }

  async function toggleSub(channelId) {
    if (!user) return setAuthModal("login");
    if (demoMode || backendUp === false || String(channelId).startsWith("seed-")) {
      setSubIds((l) => {
        const has = l.includes(channelId);
        toast(has ? "Unsubscribed" : "Subscribed");
        return has ? l.filter((x) => x !== channelId) : [...l, channelId];
      });
      return;
    }
    setSubBusy(true);
    try {
      const res = await api.toggleSub(channelId);
      const on = res?.isSubscribed !== undefined ? res.isSubscribed : !!res?._id;
      setSubIds((l) => (on ? [...new Set([...l, channelId])] : l.filter((x) => x !== channelId)));
      toast(on ? "Subscribed" : "Unsubscribed");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSubBusy(false);
    }
  }

  // ---------- comments ----------

  async function addComment(videoId, content) {
    setCommentBusy(true);
    try {
      if (demoMode || backendUp === false || String(videoId).startsWith("seed-") || String(videoId).startsWith("local-")) {
        setComments((c) => [
          { _id: `c-${Date.now()}`, content, owner: { _id: user._id, userName: user.userName, fullName: user.fullName, house: user.house }, createdAt: new Date().toISOString() },
          ...c,
        ]);
      } else {
        const created = await api.addComment(videoId, content);
        setComments((c) => [{ ...created, owner: created.owner || user }, ...c]);
      }
      toast("Comment posted");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setCommentBusy(false);
    }
  }

  async function deleteComment(id) {
    try {
      if (!demoMode && backendUp !== false && !String(id).startsWith("c-") && !String(id).startsWith("seed-")) {
        await api.removeComment(id);
      }
    } catch (e) {
      toast(e.message, "error");
      return;
    }
    setComments((c) => c.filter((x) => x._id !== id));
    toast("Comment deleted");
  }

  // ---------- tweets ----------

  async function postTweet(content) {
    if (!user) return setAuthModal("login");
    setPosting(true);
    try {
      if (!demoMode && backendUp !== false) {
        const created = await api.createTweet(content);
        setTweets((t) => [{ ...created, owner: created.owner || user }, ...t]);
      } else {
        const tw = { _id: `t-${Date.now()}`, content, owner: { _id: user._id, userName: user.userName, fullName: user.fullName, house: user.house }, likes: 0, replies: 0, createdAt: new Date().toISOString(), seed: true };
        setLocalTweets((l) => [tw, ...l]);
        setTweets((t) => [tw, ...t]);
      }
      toast("Posted");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setPosting(false);
    }
  }

  async function toggleTweetLike(t) {
    if (!user) return setAuthModal("login");
    if (t.seed || demoMode || backendUp === false) {
      setLikedTweetIds((l) => (l.includes(t._id) ? l.filter((x) => x !== t._id) : [...l, t._id]));
      return;
    }
    try {
      const res = await api.likeTweet(t._id);
      const on = res?.isLiked !== undefined ? res.isLiked : !!res?._id;
      setLikedTweetIds((l) => (on ? [...new Set([...l, t._id])] : l.filter((x) => x !== t._id)));
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function deleteTweet(id) {
    try {
      if (!demoMode && backendUp !== false && !String(id).startsWith("t-") && !String(id).startsWith("seed-")) {
        await api.removeTweet(id);
      }
    } catch (e) {
      toast(e.message, "error");
      return;
    }
    setTweets((t) => t.filter((x) => x._id !== id));
    setLocalTweets((t) => t.filter((x) => x._id !== id));
    toast("Post deleted");
  }

  // ---------- playlists ----------

  async function createPlaylist(name, description = "") {
    if (!user) return setAuthModal("login");
    try {
      if (!demoMode && backendUp !== false) {
        const created = await api.createPlaylist(name, description || "No description");
        setPlaylists((p) => [created, ...p]);
        toast("Playlist created");
        return created;
      }
      throw new Error("local");
    } catch (e) {
      if (e.message !== "local") {
        toast(e.message, "error");
        return null;
      }
      // local id — Date.now in an event handler is fine (purity rule false positive).
      // eslint-disable-next-line react-hooks/purity
      const p = { _id: `p-${Date.now()}`, name, description, videos: [], createdAt: new Date().toISOString(), seed: true };
      setPlaylists((l) => [p, ...l]);
      toast("Playlist created");
      return p;
    }
  }

  async function saveToPlaylist(playlistId, videoId) {
    const pl = playlists.find((p) => p._id === playlistId);
    if (pl && ((pl.videos || []).includes(videoId))) {
      toast("Already in that playlist");
      return;
    }
    try {
      if (!demoMode && backendUp !== false && pl && !pl.seed) {
        await api.playlistAdd(videoId, playlistId);
      } else {
        throw new Error("local");
      }
      toast("Saved to playlist");
    } catch (e) {
      if (e.message === "local") {
        setPlaylists((l) => l.map((p) => (p._id === playlistId ? { ...p, videos: [...(p.videos || []), videoId] } : p)));
        toast("Saved to playlist");
      } else {
        toast(e.message, "error");
      }
    }
  }

  async function removeFromPlaylist(playlistId, videoId) {
    try {
      const pl = playlists.find((p) => p._id === playlistId);
      if (!demoMode && backendUp !== false && pl && !pl.seed) {
        await api.playlistRemove(videoId, playlistId);
      } else {
        throw new Error("local");
      }
    } catch (e) {
      if (e.message !== "local") {
        toast(e.message, "error");
        return;
      }
    }
    setPlaylists((l) => l.map((p) => (p._id === playlistId ? { ...p, videos: (p.videos || []).filter((v) => v !== videoId && v?._id !== videoId) } : p)));
  }

  async function deletePlaylist(id) {
    setConfirm({
      title: "Delete this playlist?",
      body: "The playlist will be removed. Videos themselves stay where they are.",
      label: "Delete",
      run: async () => {
        const pl = playlists.find((p) => p._id === id);
        try {
          if (!demoMode && backendUp !== false && pl && !pl.seed) await api.removePlaylist(id);
        } catch (e) {
          toast(e.message, "error");
          return;
        }
        setPlaylists((l) => l.filter((p) => p._id !== id));
        setPlaylistDetail(null);
        nav("playlists");
        toast("Playlist deleted");
      },
    });
  }

  // ---------- derived ----------

  const allVideos = [...videos];
  const filteredVideos =
    houseFilter && houseFilter !== "All"
      ? allVideos.filter((v) => houseOf(v.owner) === houseFilter)
      : allVideos;

  const watchVideo = watch.video
    ? { ...watch.video, likeCount: baseLikes(watch.video) + (likedVideoIds.includes(watch.video._id) ? 1 : 0) }
    : null;
  const upNext = allVideos.filter((v) => v._id !== watchVideo?._id);

  const likedVideos = [
    ...allVideos.filter((v) => likedVideoIds.includes(v._id)),
  ];

  const subChannels = subIds
    .map((id) => {
      const seed = seedChannels.find((c) => c._id === id);
      if (seed) return seed;
      for (const v of allVideos) {
        const o = v.owner;
        if (o && typeof o === "object" && (o._id === id || o.userName === id)) return { _id: id, userName: o.userName, fullName: o.fullName, house: o.house };
      }
      return null;
    })
    .filter(Boolean);

  function resolveChannel(param) {
    if (!param) return null;
    if (user && (param === user._id || param === user.userName)) {
      return { _id: user._id, userName: user.userName, fullName: user.fullName, house: user.house, mine: true };
    }
    const seed = seedChannels.find((c) => c._id === param || c.userName === param);
    if (seed) return seed;
    for (const v of allVideos) {
      const o = v.owner;
      if (o && typeof o === "object" && (o._id === param || o.userName === param)) return o;
    }
    return { _id: param, userName: param, fullName: param };
  }

  const channelParam = route.name === "channel" ? route.param : null;
  const channel = channelParam ? resolveChannel(channelParam) : null;
  const channelVideos = channel
    ? allVideos.filter((v) => {
        const o = v.owner || {};
        return o._id === channel._id || o.userName === channel.userName || o === channel._id;
      })
    : [];
  const channelTweets = channel
    ? tweets.filter((t) => t.owner?._id === channel._id || t.owner?.userName === channel.userName)
    : [];

  const myVideos = user
    ? allVideos.filter((v) => {
        const o = v.owner || {};
        return o._id === user._id || o.userName === user.userName || (demoMode && v.seed);
      })
    : [];

  const activePlaylist = playlistDetail ? playlists.find((p) => p._id === playlistDetail) || null : null;

  // ---------- search / nav ----------

  function handleSearch(q) {
    setQuery(q);
    setHouseFilter("All");
    nav("home");
    loadHome(q);
  }

  function go(name, param) {
    setDrawer(false);
    if (name === "home") {
      setQuery("");
      setHouseFilter("All");
      loadHome("");
    }
    nav(name, param);
  }

  function renderRoute() {
    switch (route.name) {
      case "watch":
        return (
          <Watch
            video={watchVideo}
            loading={watch.loading}
            upNext={upNext}
            tweets={tweets.length ? tweets : seedTweets}
            comments={comments}
            commentsLoading={commentsLoading}
            commentBusy={commentBusy}
            user={user}
            liked={watchVideo ? likedVideoIds.includes(watchVideo._id) : false}
            likeBusy={likeBusy}
            subscribed={watchVideo ? isSubbed(watchVideo.owner?._id || watchVideo.owner) : false}
            subBusy={subBusy}
            isOwner={user && watchVideo && (watchVideo.owner?._id === user._id || watchVideo.owner === user._id)}
            publishBusy={false}
            playlists={playlists}
            onLike={() => watchVideo && toggleVideoLike(watchVideo)}
            onSubscribe={() => watchVideo && toggleSub(watchVideo.owner?._id || watchVideo.owner)}
            onAddComment={(c) => watchVideo && addComment(watchVideo._id, c)}
            onDeleteComment={deleteComment}
            onOpenVideo={(v) => openVideo(v._id)}
            onOpenChannel={(id) => id && go("channel", id)}
            onOpenPosts={() => go("posts")}
            onAuth={() => setAuthModal("login")}
            onDeleteVideo={() => watchVideo && deleteVideo(watchVideo)}
            onTogglePublish={() => watchVideo && togglePublish(watchVideo)}
            onSaveToPlaylist={(pid, vid) => saveToPlaylist(pid, vid)}
            onNewPlaylist={async (name, vid) => {
              const p = await createPlaylist(name, "");
              if (p) saveToPlaylist(p._id, vid);
            }}
            notify={toast}
          />
        );
      case "posts":
        return (
          <PostsPage
            user={user}
            tweets={tweets}
            loading={tweetsLoading}
            posting={posting}
            likedIds={likedTweetIds}
            onPost={postTweet}
            onLike={toggleTweetLike}
            onDelete={deleteTweet}
            onAuth={() => setAuthModal("login")}
          />
        );
      case "subscriptions":
        return (
          <Subscriptions
            channels={subChannels}
            user={user}
            onOpenChannel={(id) => go("channel", id)}
            onUnsub={toggleSub}
            onAuth={() => setAuthModal("login")}
          />
        );
      case "playlists":
        return (
          <Playlists
            playlists={playlists}
            user={user}
            onOpen={(p) => {
              setPlaylistDetail(p._id);
              go("playlist", p._id);
            }}
            onCreate={() => setPlaylistModal({ name: "", description: "" })}
            onAuth={() => setAuthModal("login")}
          />
        );
      case "playlist": {
        const p = playlists.find((x) => x._id === route.param) || activePlaylist;
        if (!p) return <p className="text-sm text-parchment-500">Scroll not found.</p>;
        const vids = (p.videos || [])
          .map((id) => (typeof id === "object" ? id : allVideos.find((v) => v._id === (id._id || id))))
          .filter(Boolean);
        return (
          <PlaylistDetail
            playlist={p}
            videos={vids}
            onOpenVideo={(v) => openVideo(v._id)}
            onRemove={(vid) => removeFromPlaylist(p._id, vid)}
            onBack={() => go("playlists")}
            onDelete={() => deletePlaylist(p._id)}
          />
        );
      }
      case "history":
        return <History videos={history} onOpenVideo={(v) => openVideo(v._id)} onClear={() => { setHistory([]); toast("History cleared"); }} />;
      case "liked":
        return <Liked videos={likedVideos} user={user} onOpenVideo={(v) => openVideo(v._id)} onAuth={() => setAuthModal("login")} />;
      case "dashboard":
        return (
          <Dashboard
            user={user}
            stats={stats}
            statsLoading={statsLoading}
            videos={myVideos}
            onUpload={() => (user ? setUploadOpen(true) : setAuthModal("login"))}
            onOpenVideo={(v) => openVideo(v._id)}
            onTogglePublish={togglePublish}
            onDeleteVideo={deleteVideo}
            onAuth={() => setAuthModal("login")}
          />
        );
      case "channel":
        return (
          <Channel
            channel={channel}
            videos={channelVideos}
            tweets={channelTweets}
            subscribed={channel ? isSubbed(channel._id) : false}
            subBusy={subBusy}
            user={user}
            onSubscribe={(id) => toggleSub(id)}
            onAuth={() => setAuthModal("login")}
            onOpenVideo={(v) => openVideo(v._id)}
          />
        );
      default:
        return (
          <Home
            videos={filteredVideos}
            loading={videosLoading}
            house={houseFilter}
            onHouse={setHouseFilter}
            onOpen={(v) => openVideo(v)}
            query={query}
            onClearQuery={() => handleSearch("")}
          />
        );
    }
  }

  // load watch video on direct hash access / refresh
  useEffect(() => {
    if (route.name === "watch" && route.param && !watch.video && !watch.loading) {
      // deep-link restore from the URL hash (external system).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openVideo(route.param);
    }
    if (route.name === "playlist" && route.param) {
      setPlaylistDetail(route.param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.name, route.param]);

  return (
    <div className="min-h-screen">
      <Navbar
        user={user}
        query={query}
        onSearch={handleSearch}
        onMenu={() => {
          if (window.innerWidth < 768) setDrawer(true);
          else setCollapsed((c) => !c);
        }}
        onLogo={() => go("home")}
        onUpload={() => (user ? setUploadOpen(true) : setAuthModal("login"))}
        onAuth={() => setAuthModal("login")}
        onNav={go}
        onLogout={logout}
        notify={toast}
      />

      <div className="flex">
        <Sidebar
          route={route.name}
          onNav={go}
          onUpload={() => (user ? setUploadOpen(true) : setAuthModal("login"))}
          channels={seedChannels}
          collapsed={collapsed}
          drawer={drawer}
          onClose={() => setDrawer(false)}
        />
        <main className="flex-1 min-w-0 px-3 sm:px-6 py-4 max-w-[1760px] w-full">
          {backendUp === false && (
            <p className="mb-3 text-[13px] text-gold-300 bg-night-900 border border-gold-700 rounded-lg px-3 py-2">
              The ravens cannot reach the backend, so you see chronicles from memory. Start it with <code className="font-mono">npm run dev</code> in{" "}
              <code className="font-mono">backend/</code> for live tidings.
            </p>
          )}
          {renderRoute()}
          <footer className="mt-10 border-t border-night-700 pt-4 pb-8 text-xs text-parchment-500 flex flex-wrap gap-x-4 gap-y-1">
            <span className="font-display font-semibold tracking-[0.18em] text-gold-500">WESTEROS</span>
            <span>About</span><span>Maesters</span><span>Ravens</span><span>Coin</span><span>Septa</span>
            <span className="ml-auto">© 2026 the Citadel — hear every proclamation</span>
          </footer>
        </main>
      </div>

      {authModal && (
        <AuthModal
          initialMode={authModal}
          busy={authBusy}
          error={authError}
          onClose={() => { setAuthModal(null); setAuthError(""); }}
          onSubmit={handleAuth}
          onSwitch={() => setAuthError("")}
        />
      )}
      {authModal && (
        <div className="fixed bottom-6 inset-x-0 z-[70] flex justify-center pointer-events-none">
          <button
            onClick={enterDemo}
            className="pointer-events-auto text-[13px] font-medium bg-night-900 border border-gold-600 text-gold-300 rounded-full px-4 py-2 shadow-lg hover:bg-night-800"
          >
            No backend running? Enter as a guest of Winterfell →
          </button>
        </div>
      )}

      {uploadOpen && (
        <UploadModal
          busy={uploadBusy}
          error={uploadError}
          onClose={() => { setUploadOpen(false); setUploadError(""); }}
          onSubmit={handleUpload}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          body={confirm.body}
          confirmLabel={confirm.label}
          busy={confirmBusy}
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            setConfirmBusy(true);
            try {
              await confirm.run();
            } finally {
              setConfirmBusy(false);
              setConfirm(null);
            }
          }}
        />
      )}

      {playlistModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPlaylistModal(null)} />
          <div className="relative w-full sm:max-w-md bg-night-900 border border-night-600 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="h-1 bg-gold-500 rounded-t-2xl" />
            <div className="flex items-start justify-between px-6 pt-5">
              <h2 className="font-display text-lg font-bold tracking-wide text-parchment-100">New scroll</h2>
              <button onClick={() => setPlaylistModal(null)} className="p-1.5 rounded-full hover:bg-night-800 text-parchment-500">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3.5">
              <Field label="Name" value={playlistModal.name} onChange={(e) => setPlaylistModal({ ...playlistModal, name: e.target.value })} placeholder="Songs of the Rhoyne" />
              <Field label="Description" value={playlistModal.description} onChange={(e) => setPlaylistModal({ ...playlistModal, description: e.target.value })} placeholder="What is it bound for?" />
              <div className="flex justify-end gap-2 pb-2">
                <button onClick={() => setPlaylistModal(null)} className="rounded-lg border border-night-600 px-4 py-2 text-sm font-medium text-parchment-300 hover:bg-night-800">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!playlistModal.name.trim()) return;
                    await createPlaylist(playlistModal.name.trim(), playlistModal.description.trim());
                    setPlaylistModal(null);
                  }}
                  className="rounded-lg bg-gold-500 text-night-950 px-5 py-2 text-sm font-bold hover:bg-gold-400"
                >
                  Bind scroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
