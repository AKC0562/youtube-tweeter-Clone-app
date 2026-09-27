import { useState } from "react";
import { Avatar, Spinner, SwornName } from "./ui";
import { CommentIcon, HeartIcon, RepostIcon } from "./icons";
import { formatViews, timeAgo } from "../utils/format";
import { houseOf } from "../data/houses";

function who(t) {
  const o = t.owner && typeof t.owner === "object" ? t.owner : {};
  return {
    name: o.fullName || o.userName || "Unknown",
    handle: `@${o.userName || "unknown"}`,
    house: houseOf(o),
    avatar: o.avatar || "",
  };
}

export function Composer({ user, busy, onPost, onAuth }) {
  const [text, setText] = useState("");

  function submit() {
    const v = text.trim();
    if (!v || busy) return;
    onPost(v);
    setText("");
  }

  if (!user) {
    return (
      <div className="border border-night-700 rounded-xl bg-night-900 p-4 flex items-center gap-3">
        <Avatar name="?" size={40} />
        <p className="text-sm text-parchment-500 flex-1">Send word of what brews in your halls…</p>
        <button onClick={onAuth} className="rounded-full bg-gold-500 text-night-950 text-sm font-bold px-4 py-1.5 hover:bg-gold-400">
          Enter to send ravens
        </button>
      </div>
    );
  }

  return (
    <div className="border border-night-700 rounded-xl bg-night-900 p-4">
      <div className="flex gap-3">
        <Avatar name={user.fullName || user.userName} src={user.avatar} size={40} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="Send a raven to the realm…"
          className="flex-1 resize-none outline-none bg-transparent text-[15px] text-parchment-100 placeholder:text-parchment-600 pt-2"
        />
      </div>
      <div className="flex items-center justify-end gap-3 mt-2 pt-2.5 border-t border-night-700">
        <span className={`text-xs ${text.length > 260 ? "text-red-400" : "text-parchment-500"}`}>
          {text.length}/280
        </span>
        <button
          onClick={submit}
          disabled={!text.trim() || busy}
          className="rounded-full bg-gold-500 text-night-950 text-sm font-bold px-5 py-1.5 hover:bg-gold-400 disabled:opacity-40 flex items-center gap-2"
        >
          {busy && <Spinner size={14} />} Send raven
        </button>
      </div>
    </div>
  );
}

export function TweetCard({ tweet, liked, likeCount, onLike, onDelete, canDelete }) {
  const { name, handle, house, avatar } = who(tweet);

  return (
    <article className="border border-night-700 rounded-xl bg-night-900 p-4 hover:border-night-600">
      <div className="flex gap-3">
        <Avatar name={name} src={avatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm truncate">
            <SwornName name={name} house={house} size={15} light />{" "}
            <span className="text-parchment-500">{handle} • {timeAgo(tweet.createdAt)}</span>
          </p>
          <p className="text-[15px] leading-6 text-parchment-100 mt-1 whitespace-pre-wrap break-words">
            {tweet.content}
          </p>
          <div className="flex items-center gap-1 mt-2.5 -ml-2 text-parchment-500">
            <button className="flex items-center gap-1.5 text-[13px] px-2 py-1 rounded-full hover:bg-night-800 hover:text-parchment-100">
              <CommentIcon size={16} /> {tweet.replies || ""}
            </button>
            <button className="flex items-center gap-1.5 text-[13px] px-2 py-1 rounded-full hover:bg-night-800 hover:text-gold-300">
              <RepostIcon size={16} />
            </button>
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 text-[13px] px-2 py-1 rounded-full hover:bg-night-800 ${
                liked ? "text-blood-500" : "hover:text-blood-500"
              }`}
            >
              <HeartIcon size={16} filled={!!liked} /> {formatViews(likeCount ?? tweet.likes ?? 0) || ""}
            </button>
            {canDelete && (
              <button
                onClick={onDelete}
                className="ml-auto text-[13px] px-2 py-1 rounded-full hover:bg-night-800 hover:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
