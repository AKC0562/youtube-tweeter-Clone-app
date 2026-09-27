import { useState } from "react";
import { TweetCard } from "../components/Posts";
import { Avatar, HouseSigil, Spinner, SwornName } from "../components/ui";
import { ListIcon, ThumbIcon } from "../components/icons";
import { formatViews, ownerOf, timeAgo } from "../utils/format";
import { houseByKey, houseOf } from "../data/houses";

export default function Watch({
  video,
  loading,
  upNext,
  tweets,
  comments,
  commentsLoading,
  commentBusy,
  user,
  liked,
  likeBusy,
  subscribed,
  subBusy,
  isOwner,
  publishBusy,
  playlists,
  onLike,
  onSubscribe,
  onAddComment,
  onDeleteComment,
  onOpenVideo,
  onOpenChannel,
  onOpenPosts,
  onAuth,
  onDeleteVideo,
  onTogglePublish,
  onSaveToPlaylist,
  onNewPlaylist,
  notify,
}) {
  const [comment, setComment] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [newList, setNewList] = useState("");

  if (loading || !video) {
    return (
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="aspect-video rounded-xl bg-night-800 animate-pulse" />
          <div className="h-5 rounded bg-night-800 animate-pulse mt-4 w-3/4" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-40 aspect-video rounded-lg bg-night-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 rounded bg-night-800 animate-pulse" />
                <div className="h-3.5 w-1/2 rounded bg-night-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const owner = ownerOf(video);
  const name = owner.fullName || owner.userName || "Unknown";
  const house = houseOf(owner);

  function submitComment() {
    const v = comment.trim();
    if (!v) return;
    if (!user) return onAuth();
    onAddComment(v);
    setComment("");
  }

  async function createList() {
    const v = newList.trim();
    if (!v) return;
    await onNewPlaylist(v, video._id);
    setNewList("");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="min-w-0">
        <div className="relative rounded-xl overflow-hidden bg-black ring-1 ring-night-700">
          <video
            key={video._id}
            src={video.videoFile}
            poster={video.tumbnail || video.thumbnail}
            controls
            className="w-full aspect-video"
          />
          {/* house watermark over the reel */}
          {house && (
            <span className="absolute top-3 right-3 opacity-90" title={`Proclaimed by ${houseByKey(house).name}`}>
              <HouseSigil house={house} size={34} className="ring-2 shadow-xl" />
            </span>
          )}
        </div>

        <h1 className="font-display text-xl font-bold tracking-wide text-parchment-100 leading-7 mt-3">{video.title}</h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-2.5">
          <button onClick={() => onOpenChannel(owner._id || owner.userName)} className="flex items-center gap-2.5">
            <Avatar name={name} src={owner.avatar} size={40} />
            <span className="text-left">
              <SwornName name={name} house={house} size={16} light className="text-[15px] leading-5" />
              <span className="block text-xs text-parchment-500">@{owner.userName}</span>
            </span>
          </button>

          {!isOwner ? (
            <button
              onClick={onSubscribe}
              disabled={subBusy}
              className={`rounded-full text-sm font-bold px-4 py-2 ${
                subscribed ? "bg-night-800 text-parchment-300 hover:bg-night-700 border border-night-600" : "bg-gold-500 text-night-950 hover:bg-gold-400"
              }`}
            >
              {subscribed ? "Sworn" : "Swear fealty"}
            </button>
          ) : (
            <span className="text-xs font-medium text-parchment-500 border border-night-600 rounded-full px-3 py-1.5">
              {video.isPublished === false ? "Sealed" : "Proclaimed"} • your own reel
            </span>
          )}

          <div className="flex items-center ml-auto">
            <button
              onClick={onLike}
              disabled={likeBusy}
              className={`flex items-center gap-1.5 rounded-l-full border border-night-600 px-4 py-2 text-sm font-medium ${
                liked ? "bg-gold-500 text-night-950 border-gold-500 font-bold" : "bg-night-900 text-parchment-100 hover:bg-night-800"
              }`}
            >
              <ThumbIcon size={16} /> {formatViews(video.likeCount || 0)}
            </button>
            <div className="relative">
              <button
                onClick={() => (user ? setSaveOpen((v) => !v) : onAuth())}
                className="flex items-center gap-1.5 rounded-r-full border border-l-0 border-night-600 bg-night-900 px-4 py-2 text-sm font-medium text-parchment-100 hover:bg-night-800"
              >
                <ListIcon size={16} /> Shelve
              </button>
              {saveOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-night-600 bg-night-900 shadow-xl p-2 z-20">
                  <p className="px-2 py-1.5 text-[13px] font-semibold text-parchment-100">Shelve in a scroll</p>
                  {playlists.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => { onSaveToPlaylist(p._id, video._id); setSaveOpen(false); }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-night-800 text-sm truncate text-parchment-300"
                    >
                      {p.name}
                    </button>
                  ))}
                  <div className="flex gap-1.5 mt-1.5 pt-1.5 border-t border-night-700">
                    <input
                      value={newList}
                      onChange={(e) => setNewList(e.target.value)}
                      placeholder="New scroll"
                      className="flex-1 min-w-0 rounded-lg border border-night-600 bg-night-950 px-2 py-1.5 text-sm text-parchment-100 outline-none focus:border-gold-500"
                    />
                    <button onClick={createList} className="rounded-lg bg-gold-500 text-night-950 text-sm font-bold px-3 hover:bg-gold-400">
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            <button
              onClick={onTogglePublish}
              disabled={publishBusy}
              className="rounded-lg border border-night-600 text-parchment-100 px-3.5 py-1.5 font-medium hover:bg-night-800 flex items-center gap-2"
            >
              {publishBusy && <Spinner size={14} />}
              {video.isPublished === false ? "Proclaim reel" : "Seal reel"}
            </button>
            <button onClick={onDeleteVideo} className="rounded-lg border border-blood-500 text-red-400 px-3.5 py-1.5 font-medium hover:bg-blood-700/30">
              Burn reel
            </button>
          </div>
        )}

        <div className="bg-night-900 border border-night-700 rounded-xl p-3.5 mt-3.5 text-sm">
          <p className="font-semibold text-parchment-100">
            {formatViews(video.views)} views • {timeAgo(video.createdAt)}
          </p>
          <p className={`text-parchment-300 mt-1 whitespace-pre-wrap ${expanded ? "" : "line-clamp-2"}`}>
            {video.description || "No chronicle attached."}
          </p>
          <button onClick={() => setExpanded((v) => !v)} className="font-medium mt-1 text-gold-300 hover:underline">
            {expanded ? "Show less" : "...more"}
          </button>
        </div>

        <div className="mt-6">
          <h2 className="font-display font-bold tracking-wide text-parchment-100">Words in the hall ({comments.length})</h2>
          <div className="flex gap-3 mt-4">
            <Avatar name={user ? user.fullName || user.userName : "?"} src={user?.avatar} size={36} />
            <div className="flex-1">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => !user && onAuth()}
                placeholder="Speak your mind…"
                className="w-full border-b border-night-600 focus:border-gold-500 outline-none pb-1.5 text-sm bg-transparent text-parchment-100 placeholder:text-parchment-600"
              />
              {comment && (
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setComment("")} className="text-sm font-medium px-3.5 py-1.5 rounded-full text-parchment-300 hover:bg-night-800">
                    Hold tongue
                  </button>
                  <button
                    onClick={submitComment}
                    disabled={commentBusy}
                    className="text-sm font-bold px-3.5 py-1.5 rounded-full bg-gold-500 text-night-950 hover:bg-gold-400 disabled:opacity-50 flex items-center gap-2"
                  >
                    {commentBusy && <Spinner size={13} />} Speak
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {commentsLoading ? (
              <p className="text-sm text-parchment-500">Gathering words…</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-parchment-500">None have spoken yet. The floor is yours.</p>
            ) : (
              comments.map((c) => {
                const cn = c.owner?.fullName || c.owner?.userName || "Unknown";
                const mine = user && c.owner && (c.owner._id === user._id || c.owner === user._id);
                return (
                  <div key={c._id} className="flex gap-3">
                    <Avatar name={cn} src={c.owner?.avatar} size={36} />
                    <div className="min-w-0">
                      <p className="text-[13px] flex items-center gap-1.5 flex-wrap">
                        <SwornName name={cn} house={houseOf(c.owner)} size={14} light />
                        <span className="text-parchment-500">@{c.owner?.userName || "unknown"} • {timeAgo(c.createdAt)}</span>
                      </p>
                      <p className="text-sm mt-0.5 break-words text-parchment-100">{c.content}</p>
                      {mine && (
                        <button onClick={() => onDeleteComment(c._id)} className="text-xs text-parchment-500 hover:text-red-400 mt-1">
                          Retract
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 min-w-0">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-display font-bold tracking-wide text-parchment-100">Up next</h2>
          </div>
          <div className="space-y-3">
            {upNext.slice(0, 6).map((v) => (
              <div key={v._id} className="cursor-pointer flex gap-2 group" onClick={() => onOpenVideo(v)}>
                <div className="relative w-40 shrink-0 aspect-video rounded-lg overflow-hidden bg-night-800 ring-1 ring-night-700">
                  {(v.tumbnail || v.thumbnail) && (
                    <img src={v.tumbnail || v.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  {houseOf(v.owner) && (
                    <span className="absolute bottom-1 left-1">
                      <HouseSigil house={houseOf(v.owner)} size={20} className="ring-2" />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-5 line-clamp-2 text-parchment-100">{v.title}</p>
                  <p className="text-xs text-parchment-500 mt-1">
                    <SwornName name={ownerOf(v).fullName || ownerOf(v).userName} house={houseOf(v.owner)} size={13} className="font-normal" />
                  </p>
                  <p className="text-xs text-parchment-500">{formatViews(v.views)} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {tweets.length > 0 && (
          <div className="border border-night-700 rounded-xl bg-night-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold tracking-wide text-[15px] text-parchment-100">Latest ravens</h2>
              <button onClick={onOpenPosts} className="text-[13px] font-medium text-gold-300 hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {tweets.slice(0, 2).map((t) => (
                <TweetCard key={t._id} tweet={t} onLike={() => notify("Open the rookery to answer this raven")} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
