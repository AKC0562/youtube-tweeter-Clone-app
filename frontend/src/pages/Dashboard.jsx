import { useState } from "react";
import { Avatar, EmptyState, HouseSigil, SwornName } from "../components/ui";
import { EyeIcon, HeartIcon, SubsIcon, UploadIcon } from "../components/icons";
import { formatViews } from "../utils/format";
import { houseByKey } from "../data/houses";

function Stat({ Icon, label, value }) {
  return (
    <div className="border border-night-700 rounded-xl bg-night-900 p-4">
      <div className="flex items-center gap-2 text-parchment-500">
        <Icon size={16} />
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <p className="font-display text-2xl font-bold tracking-wide text-parchment-100 mt-1.5">{value}</p>
    </div>
  );
}

export default function Dashboard({ user, stats, statsLoading, videos, onUpload, onOpenVideo, onTogglePublish, onDeleteVideo, onAuth }) {
  const [tab, setTab] = useState("videos");

  if (!user) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100 mb-4">Small Council</h1>
        <EmptyState
          title="Only sworn members sit the council"
          hint="Your tallies, proclamations and seals are kept here."
          action={
            <button onClick={onAuth} className="rounded-full bg-gold-500 text-night-950 text-sm font-bold px-5 py-2 hover:bg-gold-400">
              Enter the gates
            </button>
          }
        />
      </div>
    );
  }

  const h = houseByKey(user.house);

  return (
    <div>
      <div className="border border-night-700 rounded-xl bg-night-900 overflow-hidden mb-5">
        <div className="bg-night-950 border-b border-night-700 px-5 py-3 flex items-center justify-between">
          <p className="font-display text-xs sm:text-sm tracking-[0.25em] text-gold-500 font-semibold">
            {user.house ? `“${h.words.toUpperCase()}”` : "THE SMALL COUNCIL"}
          </p>
          {user.house && <HouseSigil house={user.house} size={40} className="ring-2" />}
        </div>
        <div className="flex items-center gap-3.5 px-5 py-4">
          <Avatar name={user.fullName || user.userName} src={user.avatar} size={52} />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold tracking-wide text-parchment-100 truncate">
              <SwornName name={user.fullName || user.userName} house={user.house} size={20} light />
            </h1>
            <p className="text-sm text-parchment-500 truncate">@{user.userName} • {user.email}</p>
          </div>
          <button
            onClick={onUpload}
            className="flex items-center gap-1.5 rounded-full bg-gold-500 text-night-950 text-sm font-bold px-4 py-2 hover:bg-gold-400"
          >
            <UploadIcon size={16} /> Proclaim
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-night-700 rounded-xl bg-night-900 p-4">
              <div className="h-4 w-20 rounded bg-night-800 animate-pulse" />
              <div className="h-7 w-16 rounded bg-night-800 animate-pulse mt-2" />
            </div>
          ))
        ) : (
          <>
            <Stat Icon={EyeIcon} label="Eyes upon you" value={formatViews(stats.totalViews)} />
            <Stat Icon={SubsIcon} label="Bannermen" value={formatViews(stats.totalSubscribers)} />
            <Stat Icon={UploadIcon} label="Proclamations" value={formatViews(stats.totalVideos)} />
            <Stat Icon={HeartIcon} label="Honours" value={formatViews(stats.totalLikes)} />
          </>
        )}
      </div>

      <div className="flex gap-1 mt-6 border-b border-night-700 text-sm font-medium">
        {(["videos", "about"]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 capitalize border-b-2 -mb-px ${
              tab === t ? "border-gold-500 text-gold-300" : "border-transparent text-parchment-500 hover:text-parchment-100"
            }`}
          >
            {t === "videos" ? "Proclamations" : "House records"}
          </button>
        ))}
      </div>

      {tab === "videos" ? (
        videos.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No proclamations yet"
              hint="Your published reels gather here with their tallies and seals."
              action={
                <button onClick={onUpload} className="rounded-full bg-gold-500 text-night-950 text-sm font-bold px-5 py-2 hover:bg-gold-400">
                  Issue your first proclamation
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-2 border border-night-700 rounded-xl bg-night-900 overflow-hidden">
            {videos.map((v) => (
              <div key={v._id} className="flex items-center gap-3 px-4 py-3 border-b border-night-800 last:border-0 hover:bg-night-850">
                <div className="w-28 aspect-video rounded-lg overflow-hidden bg-night-800 shrink-0 cursor-pointer ring-1 ring-night-700" onClick={() => onOpenVideo(v)}>
                  {(v.tumbnail || v.thumbnail) && (
                    <img src={v.tumbnail || v.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenVideo(v)}>
                  <p className="text-sm font-medium truncate text-parchment-100">{v.title}</p>
                  <p className="text-xs text-parchment-500 mt-0.5">
                    {formatViews(v.views)} views • {v.isPublished === false ? "Sealed" : "Proclaimed"}
                  </p>
                </div>
                <button
                  onClick={() => onTogglePublish(v)}
                  className="text-[13px] font-medium rounded-lg border border-night-600 text-parchment-100 px-3 py-1.5 hover:bg-night-800 shrink-0"
                >
                  {v.isPublished === false ? "Proclaim" : "Seal"}
                </button>
                <button
                  onClick={() => onDeleteVideo(v)}
                  className="text-[13px] font-medium rounded-lg border border-blood-500 text-red-400 px-3 py-1.5 hover:bg-blood-700/30 shrink-0"
                >
                  Burn
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="mt-4 border border-night-700 rounded-xl bg-night-900 p-5 text-sm space-y-2 max-w-2xl">
          <p className="text-parchment-300"><span className="text-parchment-500">Name:</span> <span className="font-medium"><SwornName name={user.fullName} house={user.house} size={15} light /></span></p>
          <p className="text-parchment-300"><span className="text-parchment-500">Username:</span> <span className="font-medium">@{user.userName}</span></p>
          <p className="text-parchment-300"><span className="text-parchment-500">Email:</span> <span className="font-medium">{user.email}</span></p>
          {user.house && <p className="text-parchment-300"><span className="text-parchment-500">Allegiance:</span> <span className="font-medium">{h.name} of {h.seat}</span></p>}
          <p className="text-parchment-500 pt-1">An oath once sworn is not lightly unsworn — to change houses, petition the maesters.</p>
        </div>
      )}
    </div>
  );
}
