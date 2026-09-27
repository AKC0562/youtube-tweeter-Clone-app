import { Avatar, HouseSigil, SwornName } from "./ui";
import { formatDuration, formatViews, ownerOf, timeAgo } from "../utils/format";
import { houseOf } from "../data/houses";

export default function VideoCard({ video, onOpen }) {
  const owner = ownerOf(video);
  const name = owner.fullName || owner.userName || "Unknown";
  const house = houseOf(owner);
  const thumb = video.tumbnail || video.thumbnail;

  return (
    <article className="cursor-pointer group" onClick={() => onOpen(video)}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-night-800 ring-1 ring-night-700 group-hover:ring-gold-700">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : null}
        {/* watermark of the uploader's house */}
        {house && (
          <span className="absolute bottom-1.5 left-1.5" title={`Sworn to ${house}`}>
            <HouseSigil house={house} size={26} className="ring-2 opacity-95 shadow-lg" />
          </span>
        )}
        {video.duration ? (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-parchment-100 text-[11px] font-medium px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        ) : null}
      </div>
      <div className="flex gap-3 mt-2.5">
        <Avatar name={name} src={owner.avatar} size={36} />
        <div className="min-w-0">
          <h3 className="text-sm font-medium leading-5 text-parchment-100 line-clamp-2">{video.title}</h3>
          <p className="text-[13px] text-parchment-500 mt-1 truncate">
            <SwornName name={name} house={house} size={14} className="font-normal" />
          </p>
          <p className="text-[13px] text-parchment-500">
            {formatViews(video.views)} views • {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
