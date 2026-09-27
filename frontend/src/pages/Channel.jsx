import VideoCard from "../components/VideoCard";
import { TweetCard } from "../components/Posts";
import { ChannelCard } from "./Library";
import { EmptyState } from "../components/ui";

export default function Channel({
  channel,
  videos,
  tweets,
  subscribed,
  subBusy,
  user,
  onSubscribe,
  onAuth,
  onOpenVideo,
}) {
  if (!channel) {
    return <EmptyState title="Keep not found" hint="This house's keep doesn't exist or couldn't be reached." />;
  }
  return (
    <div>
      <ChannelCard
        channel={channel}
        videoCount={videos.length}
        subscribed={subscribed}
        subBusy={subBusy}
        user={user}
        onSubscribe={onSubscribe}
        onAuth={onAuth}
      />
      {videos.length > 0 && (
        <>
          <h2 className="font-display font-bold tracking-wide text-parchment-100 mb-3">Proclamations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-7">
            {videos.map((v) => (
              <VideoCard key={v._id} video={v} onOpen={onOpenVideo} />
            ))}
          </div>
        </>
      )}
      {tweets.length > 0 && (
        <>
          <h2 className="font-display font-bold tracking-wide text-parchment-100 mt-8 mb-3">Ravens</h2>
          <div className="space-y-3 max-w-2xl">
            {tweets.map((t) => (
              <TweetCard key={t._id} tweet={t} />
            ))}
          </div>
        </>
      )}
      {videos.length === 0 && tweets.length === 0 && (
        <EmptyState title="Quiet as the crypts" hint="This house has issued neither proclamations nor ravens." />
      )}
    </div>
  );
}
