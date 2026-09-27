import VideoCard from "../components/VideoCard";
import { EmptyState, HouseSigil, SkeletonCard } from "../components/ui";
import { HOUSES } from "../data/houses";

export default function Home({ videos, loading, house, onHouse, onOpen, query, onClearQuery }) {
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 sticky top-[57px] bg-night-950 pt-3 z-10">
        <button
          onClick={() => onHouse("All")}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium border ${
            (house || "All") === "All"
              ? "bg-gold-500 border-gold-500 text-night-950 font-bold"
              : "bg-night-900 border-night-700 text-parchment-300 hover:border-night-600"
          }`}
        >
          All houses
        </button>
        {HOUSES.map((h) => (
          <button
            key={h.key}
            onClick={() => onHouse(h.key)}
            title={h.words}
            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border ${
              house === h.key
                ? "bg-gold-500 border-gold-500 text-night-950 font-bold"
                : "bg-night-900 border-night-700 text-parchment-300 hover:border-night-600"
            }`}
          >
            <HouseSigil house={h.key} size={17} className="ring-night-600" />
            {h.name.replace("House ", "")}
          </button>
        ))}
      </div>

      {query && (
        <p className="text-sm text-parchment-500 mb-3">
          Tidings matching <span className="font-semibold text-parchment-100">“{query}”</span>{" "}
          <button onClick={onClearQuery} className="text-gold-300 hover:underline ml-1">Clear</button>
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-7">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          title="The halls are quiet"
          hint="No proclamations from this house yet — try another allegiance, or be the first to proclaim."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-7">
          {videos.map((v) => (
            <VideoCard key={v._id} video={v} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
