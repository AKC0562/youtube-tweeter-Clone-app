// Demo content shown when the backend is empty or unreachable.
// Kept in one place so it is easy to delete once real data exists.

const now = Date.now();
const H = 3600_000;
const D = 24 * H;

export const seedChannels = [
  { _id: "seed-u1", userName: "pixelforge", fullName: "Pixel Forge", subs: 482000, house: "stark" },
  { _id: "seed-u2", userName: "artaithakur", fullName: "Artai Thakur", subs: 96500, house: "martell" },
  { _id: "seed-u3", userName: "dbdeepdives", fullName: "DB Deep Dives", subs: 231000, house: "lannister" },
  { _id: "seed-u4", userName: "sidbuilds", fullName: "Sid Builds", subs: 58900, house: "greyjoy" },
  { _id: "seed-u5", userName: "morningbrewtech", fullName: "Morning Brew Tech", subs: 1204000, house: "targaryen" },
];

const CLIPS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

function vid(i, ch, title, desc, views, age, dur) {
  return {
    _id: `seed-v${i + 1}`,
    title,
    description: desc,
    views,
    duration: dur,
    isPublished: true,
    createdAt: new Date(now - age).toISOString(),
    owner: ch,
    videoFile: CLIPS[i % CLIPS.length],
    tumbnail: `https://picsum.photos/seed/streamx${i + 1}/640/360`,
    seed: true,
  };
}

export const seedVideos = [
  vid(0, seedChannels[0], "I rebuilt our homepage in a weekend — here's what changed", "Full walkthrough of the redesign: routing, thumbnails, and the small details that lifted click-through.", 128400, 5 * H, 754),
  vid(1, seedChannels[2], "Indexing explained with a real 2M row table", "We take a slow query, add the right index, and measure before/after. No theory, just EXPLAIN output.", 89200, 26 * H, 1123),
  vid(2, seedChannels[3], "Shipping my first SaaS feature end-to-end", "Auth, billing stub, emails, deploy — the unglamorous checklist nobody shows you.", 34200, 2 * D, 689),
  vid(3, seedChannels[4], "The morning rundown: frameworks, funding, and folding phones", "Ten minutes on what actually matters this week in tech.", 1204000, 8 * H, 602),
  vid(4, seedChannels[1], "My desk setup tour 2026 (and what I'd skip)", "Every gadget on my desk, what earns its place, and the one purchase I regret.", 210500, 4 * D, 845),
  vid(5, seedChannels[0], "Thumbnail design teardown: 5 videos, 5 lessons", "Same video, different packaging. We look at what the data says.", 76800, 6 * D, 534),
  vid(6, seedChannels[2], "Aggregation pipelines without the headache", "Match, lookup, unwind — a mental model that finally sticks, with three real examples.", 154300, 9 * D, 1302),
  vid(7, seedChannels[3], "Code review of my own old project (painful)", "Six months later, my own code makes no sense. Fixing it live.", 45100, 12 * D, 978),
];

export const seedTweets = [
  { _id: "seed-t1", content: "Shipped the new upload flow today. Drag, drop, done — encoding happens in the background while you write the description.", owner: seedChannels[3], likes: 214, replies: 31, createdAt: new Date(now - 2 * H).toISOString(), seed: true },
  { _id: "seed-t2", content: "Hot take: your slow page is not a React problem, it's a missing database index. Check EXPLAIN before you rewrite anything.", owner: seedChannels[2], likes: 1024, replies: 187, createdAt: new Date(now - 6 * H).toISOString(), seed: true },
  { _id: "seed-t3", content: "New video is live — the homepage rebuild. Thumbnail A vs B results surprised me, numbers inside.", owner: seedChannels[0], likes: 386, replies: 42, createdAt: new Date(now - 11 * H).toISOString(), seed: true },
  { _id: "seed-t4", content: "What's one tool you installed this year that you now can't live without? Mine: a decent API client with env sync.", owner: seedChannels[4], likes: 89, replies: 156, createdAt: new Date(now - D).toISOString(), seed: true },
  { _id: "seed-t5", content: "Desk setup video tomorrow. Spoiler: the most expensive item on my desk is the one I use least.", owner: seedChannels[1], likes: 167, replies: 23, createdAt: new Date(now - 2 * D).toISOString(), seed: true },
  { _id: "seed-t6", content: "Reminder that 'views' and 'watch time' tell different stories. One pays the bills, the other pays the ego. Guess which.", owner: seedChannels[0], likes: 542, replies: 64, createdAt: new Date(now - 3 * D).toISOString(), seed: true },
];

export const seedComments = [
  { _id: "seed-c1", content: "The part about thumbnails at 6:20 is worth the whole video.", owner: seedChannels[1], likes: 45, createdAt: new Date(now - 3 * H).toISOString() },
  { _id: "seed-c2", content: "Tried the indexing trick on our orders table, query went from 900ms to 40ms. Thanks!", owner: seedChannels[3], likes: 112, createdAt: new Date(now - 9 * H).toISOString() },
  { _id: "seed-c3", content: "Would love a follow-up on the encoding pipeline details.", owner: seedChannels[4], likes: 18, createdAt: new Date(now - D).toISOString() },
];

export const seedPlaylists = [
  { _id: "seed-p1", name: "Watch later", description: "Things to get to this weekend", videos: ["seed-v2", "seed-v7"], createdAt: new Date(now - 5 * D).toISOString(), seed: true },
  { _id: "seed-p2", name: "Backend deep dives", description: "Databases, APIs and infra", videos: ["seed-v2", "seed-v7", "seed-v3"], createdAt: new Date(now - 20 * D).toISOString(), seed: true },
];

export const CATEGORIES = ["All", "Design", "Databases", "Builds", "Tech news", "Setups", "Tutorials", "Reviews"];
