import VideoCard from "../components/VideoCard";
import { Avatar, EmptyState, HouseSigil, SwornName } from "../components/ui";
import { formatViews, coverOf } from "../utils/format";
import { houseByKey } from "../data/houses";

export function Subscriptions({ channels, onOpenChannel, onUnsub, user, onAuth }) {
  if (channels.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100 mb-1">Allegiances</h1>
        <p className="text-sm text-parchment-500 mb-4">Houses whose banners you follow into every council.</p>
        <EmptyState
          title="Sworn to no one yet"
          hint="Visit any channel and swear fealty — their proclamations gather here."
        />
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100 mb-1">Allegiances</h1>
      <p className="text-sm text-parchment-500 mb-4">Houses whose banners you follow into every council.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {channels.map((c) => {
          const h = houseByKey(c.house);
          return (
            <div key={c._id} className="border border-night-700 rounded-xl bg-night-900 p-4 text-center hover:border-night-600">
              <div className="flex justify-center relative">
                <Avatar name={c.fullName || c.userName} src={c.avatar} size={56} />
                <span className="absolute bottom-6 -right-1">
                  <HouseSigil house={c.house} size={24} className="ring-2" />
                </span>
              </div>
              <p className="mt-4">
                <SwornName name={c.fullName || c.userName} house={c.house} size={15} light />
              </p>
              <p className="text-xs text-parchment-500">@{c.userName}</p>
              {c.house && <p className="text-[11px] text-gold-500 italic mt-1">“{h.words}”</p>}
              <div className="flex gap-2 justify-center mt-3">
                <button
                  onClick={() => onOpenChannel(c._id)}
                  className="text-[13px] font-medium rounded-full border border-night-600 text-parchment-100 px-3.5 py-1 hover:bg-night-800"
                >
                  Visit keep
                </button>
                <button
                  onClick={() => (user ? onUnsub(c._id) : onAuth())}
                  className="text-[13px] font-medium rounded-full bg-night-800 border border-night-700 text-parchment-300 px-3.5 py-1 hover:bg-night-700"
                >
                  Sworn
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Playlists({ playlists, onOpen, onCreate, user, onAuth }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100">Scrolls</h1>
        <button
          onClick={() => (user ? onCreate() : onAuth())}
          className="text-sm font-bold rounded-full bg-gold-500 text-night-950 px-4 py-2 hover:bg-gold-400"
        >
          New scroll
        </button>
      </div>
      <p className="text-sm text-parchment-500 mb-4">Bound collections, kept by the maesters of your keep.</p>
      {playlists.length === 0 ? (
        <EmptyState title="No scrolls" hint="Start one to keep the proclamations worth rewatching." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playlists.map((p) => (
            <button
              key={p._id}
              onClick={() => onOpen(p)}
              className="text-left border border-night-700 rounded-xl bg-night-900 p-4 hover:border-gold-700"
            >
              <p className="font-display font-semibold text-[15px] tracking-wide text-parchment-100 truncate">{p.name}</p>
              <p className="text-[13px] text-parchment-500 truncate mt-0.5">{p.description || "No chronicle"}</p>
              <p className="text-xs text-parchment-500 mt-2">{(p.videos || []).length} reels</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlaylistDetail({ playlist, videos, onOpenVideo, onRemove, onBack, onDelete }) {
  if (!playlist) return null;
  return (
    <div>
      <button onClick={onBack} className="text-sm text-gold-300 hover:underline mb-3">← All scrolls</button>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100">{playlist.name}</h1>
          <p className="text-sm text-parchment-500 mt-0.5">{playlist.description}</p>
          <p className="text-xs text-parchment-500 mt-1">{videos.length} reels</p>
        </div>
        <button onClick={onDelete} className="text-sm font-medium text-red-400 border border-blood-500 rounded-lg px-3.5 py-1.5 hover:bg-blood-700/30">
          Burn scroll
        </button>
      </div>
      {videos.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="This scroll is blank" hint="Open any proclamation and shelve it here." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-7 mt-5">
          {videos.map((v) => (
            <div key={v._id} className="relative">
              <VideoCard video={v} onOpen={onOpenVideo} />
              <button
                onClick={() => onRemove(v._id)}
                className="absolute top-2 right-2 text-[11px] font-medium bg-black/80 text-parchment-100 rounded px-2 py-1 hover:bg-black"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function History({ videos, onOpenVideo, onClear }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100">Chronicles</h1>
        {videos.length > 0 && (
          <button onClick={onClear} className="text-sm font-medium text-parchment-500 hover:text-parchment-100">
            Burn the records
          </button>
        )}
      </div>
      <p className="text-sm text-parchment-500 mb-4">Every reel you have witnessed, as the maesters recorded it.</p>
      {videos.length === 0 ? (
        <EmptyState title="No entries yet" hint="Reels you watch are chronicled here for your return." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-7">
          {videos.map((v) => (
            <VideoCard key={`${v._id}-${v.watchedAt || ""}`} video={v} onOpen={onOpenVideo} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Liked({ videos, onOpenVideo, user, onAuth }) {
  if (!user) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100 mb-4">Honours</h1>
        <EmptyState
          title="Enter the gates to see your honours"
          hint="The reels you honour follow you across every device once sworn in."
          action={
            <button onClick={onAuth} className="rounded-full bg-gold-500 text-night-950 text-sm font-bold px-5 py-2 hover:bg-gold-400">
              Enter the gates
            </button>
          }
        />
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100 mb-1">Honours</h1>
      <p className="text-sm text-parchment-500 mb-4">Reels you have honoured before the court.</p>
      {videos.length === 0 ? (
        <EmptyState title="No honours bestowed" hint="Honour any proclamation and it lands here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-7">
          {videos.map((v) => (
            <VideoCard key={v._id} video={v} onOpen={onOpenVideo} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChannelCard({ channel, videoCount, subscribed, subBusy, onSubscribe, user, onAuth }) {
  if (!channel) return null;
  const h = houseByKey(channel.house);
  const cover = coverOf(channel);
  return (
    <div className="border border-night-700 rounded-xl bg-night-900 overflow-hidden mb-6">
      <div className="relative h-28 sm:h-36 bg-night-950 border-b border-night-700 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-3">
          <p className="font-display text-sm sm:text-base tracking-[0.25em] text-gold-500 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {channel.house ? `“${h.words.toUpperCase()}”` : "A HOUSE OF THE REALM"}
          </p>
          {channel.house && <HouseSigil house={channel.house} size={52} className="ring-2 shadow-xl mb-1" />}
        </div>
      </div>
      <div className="px-5 pb-5 flex flex-wrap items-center gap-4 -mt-8">
        <span className="ring-4 ring-night-900 rounded-full relative">
          <Avatar name={channel.fullName || channel.userName} src={channel.avatar} size={72} />
        </span>
        <div className="flex-1 min-w-[180px] pt-8">
          <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100">
            <SwornName name={channel.fullName || channel.userName} house={channel.house} size={24} light />
          </h1>
          <p className="text-sm text-parchment-500">
            @{channel.userName} • {formatViews(channel.subs ?? 0)} sworn • {videoCount} proclamations
            {channel.house && ` • of ${h.seat}`}
          </p>
        </div>
        <button
          onClick={() => (user ? onSubscribe(channel._id) : onAuth())}
          disabled={subBusy}
          className={`rounded-full text-sm font-bold px-5 py-2 mt-8 ${
            subscribed ? "bg-night-800 border border-night-600 text-parchment-300 hover:bg-night-700" : "bg-gold-500 text-night-950 hover:bg-gold-400"
          }`}
        >
          {subscribed ? "Sworn" : "Swear fealty"}
        </button>
      </div>
    </div>
  );
}
