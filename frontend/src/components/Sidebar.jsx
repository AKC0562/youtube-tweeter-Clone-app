import { Avatar, HouseSigil } from "./ui";
import { ChartIcon, CloseIcon, HeartIcon, HistoryIcon, HomeIcon, ListIcon, PostsIcon, SubsIcon, UploadIcon } from "./icons";

const MAIN = [
  { key: "home", label: "The Realm", Icon: HomeIcon },
  { key: "posts", label: "Ravens", Icon: PostsIcon },
  { key: "subscriptions", label: "Allegiances", Icon: SubsIcon },
];

const LIB = [
  { key: "history", label: "Chronicles", Icon: HistoryIcon },
  { key: "playlists", label: "Scrolls", Icon: ListIcon },
  { key: "liked", label: "Honours", Icon: HeartIcon },
  { key: "dashboard", label: "Small Council", Icon: ChartIcon },
];

function Item({ active, Icon, label, onClick, mini }) {
  if (mini) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex flex-col items-center gap-1 py-3.5 rounded-lg text-[10px] ${
          active ? "text-gold-300 font-medium" : "text-parchment-500 hover:bg-night-800"
        }`}
      >
        <Icon size={20} />
        {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-3.5 py-2 rounded-lg text-sm ${
        active ? "bg-night-800 font-medium text-gold-300" : "text-parchment-300 hover:bg-night-800"
      }`}
    >
      <Icon size={19} />
      {label}
    </button>
  );
}

export default function Sidebar({ route, onNav, onUpload, channels, collapsed, drawer, onClose }) {
  const body = (mini) => (
    <>
      <nav className={mini ? "px-1 py-2 space-y-0.5" : "px-3 py-3 space-y-0.5"}>
        {MAIN.map((m) => (
          <Item key={m.key} mini={mini} active={route === m.key} Icon={m.Icon} label={m.label} onClick={() => onNav(m.key)} />
        ))}
        {!mini && <div className="border-t border-night-700 my-2.5" />}
        {mini ? (
          <Item mini active={route === "posts"} Icon={PostsIcon} label="Ravens" onClick={() => onNav("posts")} />
        ) : (
          <>
            <p className="px-3.5 pt-2 pb-1 font-display text-[11px] font-semibold tracking-[0.22em] text-gold-500">YOUR KEEP</p>
            {LIB.map((m) => (
              <Item key={m.key} active={route === m.key} Icon={m.Icon} label={m.label} onClick={() => onNav(m.key)} />
            ))}
            <button
              onClick={onUpload}
              className="w-full flex items-center gap-4 px-3.5 py-2 rounded-lg text-sm text-parchment-300 hover:bg-night-800"
            >
              <UploadIcon size={19} />
              Issue a proclamation
            </button>
          </>
        )}
      </nav>

      {!mini && (
        <>
          <div className="border-t border-night-700" />
          <div className="px-3 py-3">
            <p className="px-3.5 pb-1.5 font-display text-[11px] font-semibold tracking-[0.22em] text-gold-500">GREAT HOUSES</p>
            {channels.slice(0, 6).map((c) => (
              <button
                key={c._id}
                onClick={() => onNav("channel", c._id)}
                className="w-full flex items-center gap-3 px-3.5 py-[7px] rounded-lg hover:bg-night-800 text-sm text-parchment-300"
              >
                <span className="relative shrink-0">
                  <Avatar name={c.fullName} src={c.avatar} size={24} />
                  <span className="absolute -bottom-1 -right-1">
                    <HouseSigil house={c.house} size={13} />
                  </span>
                </span>
                <span className="truncate">{c.fullName}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-night-700" />
          <p className="px-6 py-4 text-[11px] leading-5 text-parchment-600">
            About&nbsp;&nbsp;Maesters&nbsp;&nbsp;Ravens
            <br />
            Contact&nbsp;&nbsp;Septa&nbsp;&nbsp;Coin
            <br />
            <span className="text-parchment-600">© 2026 the Citadel</span>
          </p>
        </>
      )}
    </>
  );

  return (
    <>
      {/* desktop */}
      <aside
        className={`hidden md:block shrink-0 rail-scroll overflow-y-auto sticky top-[57px] h-[calc(100vh-57px)] bg-night-950 border-r border-night-700 ${
          collapsed ? "w-[76px]" : "w-60"
        }`}
      >
        {body(collapsed)}
      </aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-night-950 border-r border-night-700 overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-14 border-b border-night-700">
              <span className="font-display font-bold tracking-[0.18em] text-parchment-100">WESTEROS</span>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-night-800 text-parchment-300">
                <CloseIcon size={18} />
              </button>
            </div>
            {body(false)}
          </aside>
        </div>
      )}
    </>
  );
}
