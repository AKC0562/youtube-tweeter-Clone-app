import { useState } from "react";
import { avatarColors, initials } from "../utils/format";
import { houseByKey, sigilSrc } from "../data/houses";

export function Logo({ onClick, compact }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 shrink-0" title="Westeros home">
      <img src="/logo.png" alt="Iron Throne" className="w-9 h-9 object-contain" />
      {!compact && (
        <span className="leading-none text-left">
          <span className="block font-display font-bold text-[17px] tracking-[0.18em] text-parchment-100">
            WESTEROS
          </span>
          <span className="block text-[9px] tracking-[0.28em] text-gold-500 font-medium mt-0.5">
            SEVEN KINGDOMS
          </span>
        </span>
      )}
    </button>
  );
}

export function Avatar({ name = "?", src, size = 36, className = "" }) {
  const [bg, fg] = avatarColors(name);
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`rounded-full object-cover shrink-0 ring-1 ring-night-600 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`rounded-full inline-flex items-center justify-center font-semibold shrink-0 ring-1 ring-night-600 ${className}`}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

// House sigil coin — the blue-tick equivalent. img so the real house art shows.
export function HouseSigil({ house, size = 16, className = "" }) {
  const h = houseByKey(house);
  if (!house) return null;
  return (
    <img
      src={sigilSrc(h.key)}
      alt={h.name}
      title={`Sworn to ${h.name}`}
      width={size}
      height={size}
      loading="lazy"
      className={`rounded-full object-cover shrink-0 ring-1 ring-gold-600 bg-black ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}

// A name followed by its house sigil, like a verified badge.
export function SwornName({ name, house, size = 15, className = "", light }) {
  return (
    <span className={`inline-flex items-center gap-1 min-w-0 ${className || ""}`}>
      <span className={`truncate font-semibold ${light ? "text-parchment-100" : ""}`}>{name}</span>
      <HouseSigil house={house} size={size} />
    </span>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="border border-night-700 rounded-xl bg-night-900 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold tracking-wide text-parchment-100">{title}</p>
      {hint && <p className="text-sm text-parchment-500 mt-1.5 max-w-sm mx-auto">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-parchment-300 mb-1">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-night-600 bg-night-950 px-3 py-2 text-sm text-parchment-100 outline-none focus:border-gold-500 placeholder:text-parchment-600"
      />
      {error && <span className="block text-xs text-red-400 mt-1">{error}</span>}
    </label>
  );
}

export function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-6 left-6 z-[70] flex flex-col gap-2 max-w-xs">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-2.5 text-sm shadow-lg border ${
            t.kind === "error"
              ? "bg-blood-700 border-blood-500 text-parchment-100"
              : "bg-night-800 border-gold-700 text-parchment-100"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div>
      <div className="aspect-video rounded-xl bg-night-800 animate-pulse" />
      <div className="flex gap-3 mt-3">
        <div className="w-9 h-9 rounded-full bg-night-800 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 rounded bg-night-800 animate-pulse" />
          <div className="h-3.5 w-2/3 rounded bg-night-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
