import { Composer, TweetCard } from "../components/Posts";
import { EmptyState, Spinner } from "../components/ui";

export default function PostsPage({
  user,
  tweets,
  loading,
  posting,
  likedIds,
  likeBusy,
  onPost,
  onLike,
  onDelete,
  onAuth,
}) {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display text-2xl font-bold tracking-wide text-parchment-100 mb-1">The Rookery</h1>
      <p className="text-sm text-parchment-500 mb-4">Ravens from every house, as they arrive.</p>

      <Composer user={user} busy={posting} onPost={onPost} onAuth={onAuth} />

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="border border-night-700 rounded-xl bg-night-900 p-8 text-center text-sm text-parchment-500 flex items-center justify-center gap-2">
            <Spinner size={16} /> Waiting for ravens…
          </div>
        ) : tweets.length === 0 ? (
          <EmptyState title="No ravens yet" hint="Be the first to send word to the realm." />
        ) : (
          tweets.map((t) => {
            const mine = user && t.owner && (t.owner._id === user._id || t.owner === user._id || t.owner.userName === user.userName);
            return (
              <TweetCard
                key={t._id}
                tweet={t}
                liked={likedIds.includes(t._id)}
                likeCount={(t.likes || 0) + (likedIds.includes(t._id) && t.seed ? 1 : 0)}
                likeBusy={likeBusy}
                canDelete={!!mine}
                onLike={() => onLike(t)}
                onDelete={() => onDelete(t._id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
