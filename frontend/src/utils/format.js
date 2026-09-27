export function timeAgo(input) {
  const d = new Date(input).getTime();
  if (Number.isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
  const w = Math.floor(days / 7);
  if (w < 5) return w === 1 ? "1 week ago" : `${w} weeks ago`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return mo === 1 ? "1 month ago" : `${mo} months ago`;
  const y = Math.floor(days / 365);
  return y === 1 ? "1 year ago" : `${y} years ago`;
}

export function formatViews(n) {
  n = Number(n) || 0;
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}K`;
  }
  const v = n / 1_000_000;
  return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
}

export function formatDuration(sec) {
  sec = Math.round(Number(sec) || 0);
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function initials(name = "?") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

// deterministic solid avatar colours (no gradients)
const PALETTE = [
  ["#e8eef7", "#1d4ed8"],
  ["#e9f5ec", "#15803d"],
  ["#fdeaea", "#b91c1c"],
  ["#f3eafd", "#7e22ce"],
  ["#fdf3e3", "#b45309"],
  ["#e6f6f5", "#0f766e"],
  ["#f0eefc", "#4338ca"],
  ["#fceef4", "#be185d"],
];

export function avatarColors(name = "?") {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function ownerOf(video) {
  if (!video) return { userName: "unknown", fullName: "Unknown" };
  if (video.owner && typeof video.owner === "object") return video.owner;
  return { userName: String(video.owner || "unknown"), fullName: String(video.owner || "Unknown") };
}

// backend has stored the cover under two keys over time — read either
export function coverOf(user) {
  return user?.coverImage || user?.coverImg || "";
}
