import { useEffect, useRef, useState } from "react";
import { Avatar, Logo, SwornName } from "./ui";
import { BellIcon, ChartIcon, LogoutIcon, MenuIcon, SearchIcon, UploadIcon } from "./icons";
import { houseByKey } from "../data/houses";

function SearchBox({ initial, onSearch, className }) {
  const [v, setV] = useState(initial);

  function submit(e) {
    e.preventDefault();
    onSearch(v.trim());
  }

  return (
    <form onSubmit={submit} className={className}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Search the realm"
        className="flex-1 rounded-l-full border border-night-600 border-r-0 bg-night-950 px-4 py-[7px] text-sm text-parchment-100 outline-none focus:border-gold-600 placeholder:text-parchment-600"
      />
      <button
        type="submit"
        className="rounded-r-full border border-night-600 bg-night-800 hover:bg-night-700 px-5 text-parchment-300"
        title="Search"
      >
        <SearchIcon size={18} />
      </button>
    </form>
  );
}

export default function Navbar({
  user,
  query,
  onSearch,
  onMenu,
  onLogo,
  onUpload,
  onAuth,
  onNav,
  onLogout,
  notify,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function submitMobile(q) {
    onSearch(q);
  }

  const displayName = user?.fullName || user?.userName || "traveller";
  const myHouse = houseByKey(user?.house);

  return (
    <header className="sticky top-0 z-40 bg-night-950 border-b border-night-700">
      <div className="h-0.5 bg-gold-600" />
      <div className="flex items-center gap-2 sm:gap-4 h-14 px-3 sm:px-5">
        <button
          onClick={onMenu}
          className="p-2 rounded-full hover:bg-night-800 text-parchment-300"
          title="Menu"
        >
          <MenuIcon size={20} />
        </button>

        <Logo onClick={onLogo} />

        {/* key remounts the box when a search is cleared elsewhere */}
        <SearchBox key={query} initial={query || ""} onSearch={onSearch} className="hidden md:flex flex-1 max-w-xl mx-auto" />

        <div className="flex-1 md:hidden" />

        <button
          onClick={() => notify("Ravens roost in the menu on small screens — use the Realm to browse")}
          className="md:hidden p-2 rounded-full hover:bg-night-800 text-parchment-300"
          title="Search"
        >
          <SearchIcon size={20} />
        </button>

        <button
          onClick={onUpload}
          className="hidden sm:flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 pl-3 pr-4 py-[7px] text-sm font-bold text-night-950"
        >
          <UploadIcon size={17} />
          Proclaim
        </button>
        <button
          onClick={onUpload}
          className="sm:hidden p-2 rounded-full hover:bg-night-800 text-parchment-300"
          title="Proclaim"
        >
          <UploadIcon size={20} />
        </button>

        {user ? (
          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBellOpen((v) => !v)}
                className="relative p-2 rounded-full hover:bg-night-800 text-parchment-300"
                title="Ravens"
              >
                <BellIcon size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blood-500 ember-dot" />
              </button>
              <button onClick={() => setMenuOpen((v) => !v)} title={displayName} className="flex items-center">
                <Avatar name={user.fullName || user.userName} src={user.avatar} size={32} />
              </button>
            </div>

            {bellOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-night-600 bg-night-900 shadow-xl overflow-hidden">
                <p className="px-4 py-2.5 font-display text-sm font-semibold tracking-widest text-gold-400 border-b border-night-700">RAVENS</p>
                <div className="px-4 py-3 flex gap-3 hover:bg-night-800">
                  <Avatar name="Pixel Forge" size={36} />
                  <div className="text-sm">
                    <p className="text-parchment-100"><span className="font-medium">Pixel Forge</span> issued a new proclamation</p>
                    <p className="text-xs text-parchment-500 mt-0.5">6 hours ago</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex gap-3 hover:bg-night-800">
                  <Avatar name="DB Deep Dives" size={36} />
                  <div className="text-sm">
                    <p className="text-parchment-100"><span className="font-medium">DB Deep Dives</span> sent a raven to the realm</p>
                    <p className="text-xs text-parchment-500 mt-0.5">Yesterday</p>
                  </div>
                </div>
              </div>
            )}

            {menuOpen && !bellOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-night-600 bg-night-900 shadow-xl py-1.5 text-sm">
                <div className="px-4 py-2.5 border-b border-night-700">
                  <SwornName name={user.fullName || user.userName} house={user.house} size={16} light className="font-semibold text-parchment-100" />
                  <p className="text-xs text-parchment-500 truncate mt-0.5">@{user.userName} • {myHouse.name}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); onNav("dashboard"); }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-night-800 text-left text-parchment-100"
                >
                  <ChartIcon size={17} /> Small council
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-night-800 text-left text-red-400"
                >
                  <LogoutIcon size={17} /> Leave the court
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onAuth}
            className="rounded-full border border-gold-600 hover:bg-night-800 px-4 py-[7px] text-sm font-semibold text-gold-300"
          >
            Enter the gates
          </button>
        )}
      </div>

      {/* mobile search row */}
      <SearchBox key={`m-${query}`} initial={query || ""} onSearch={submitMobile} className="md:hidden px-3 pb-2.5 flex" />
    </header>
  );
}
