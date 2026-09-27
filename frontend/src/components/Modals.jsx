import { useState } from "react";
import { CloseIcon } from "./icons";
import { Field, HouseSigil, Spinner } from "./ui";
import { HOUSES, houseByKey } from "../data/houses";

function Shell({ onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className={`relative w-full ${wide ? "sm:max-w-xl" : "sm:max-w-md"} bg-night-900 border border-night-600 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto`}>
        <div className="h-1 bg-gold-500 rounded-t-2xl" />
        {children}
      </div>
    </div>
  );
}

function Head({ title, sub, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-5 pb-1">
      <div>
        <h2 className="font-display text-xl font-bold tracking-wide text-parchment-100">{title}</h2>
        {sub && <p className="text-sm text-parchment-500 mt-1">{sub}</p>}
      </div>
      <button onClick={onClose} className="p-1.5 rounded-full hover:bg-night-800 text-parchment-500">
        <CloseIcon size={18} />
      </button>
    </div>
  );
}

function HouseOath({ value, onPick }) {
  return (
    <div>
      <p className="font-display text-sm tracking-[0.2em] text-gold-400 font-semibold text-center">
        SWEAR YOUR ALLEGIANCE
      </p>
      <p className="text-[13px] text-parchment-500 text-center mt-1 mb-4">
        Your sigil rides beside your name — on proclamations, ravens and in the court.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {HOUSES.map((h) => {
          const active = value === h.key;
          return (
            <button
              key={h.key}
              type="button"
              onClick={() => onPick(h.key)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                active
                  ? "border-gold-400 bg-night-800"
                  : "border-night-700 bg-night-950 hover:border-night-600"
              }`}
            >
              <HouseSigil house={h.key} size={44} className={active ? "ring-gold-400" : ""} />
              <span className="min-w-0">
                <span className={`block text-sm font-semibold truncate ${active ? "text-gold-300" : "text-parchment-100"}`}>
                  {h.name}
                </span>
                <span className="block text-[11px] text-parchment-500 truncate italic">“{h.words}”</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AuthModal({ initialMode = "login", busy, error, onClose, onSubmit, onSwitch }) {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1);
  const [house, setHouse] = useState("stark");
  const [form, setForm] = useState({ fullName: "", userName: "", email: "", password: "", avatar: null, coverImg: null });

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function detailsValid() {
    return form.fullName.trim() && form.userName.trim() && form.email.trim() && form.password && form.avatar;
  }

  function submit(e) {
    e.preventDefault();
    if (mode === "login") {
      onSubmit("login", { email: form.email, password: form.password });
    } else {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("userName", form.userName);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("house", house);
      if (form.avatar) fd.append("avatar", form.avatar);
      if (form.coverImg) fd.append("coverImg", form.coverImg);
      onSubmit("register", fd);
    }
  }

  function flip(m) {
    setMode(m);
    setStep(1);
    onSwitch?.(m);
  }

  const picked = houseByKey(house);

  return (
    <Shell onClose={onClose}>
      <Head
        title={mode === "login" ? "Enter the gates" : step === 1 ? "Claim your seat" : "Take the oath"}
        sub={
          mode === "login"
            ? "Sign in to proclaim, comment and send ravens."
            : step === 1
              ? "Free for every lord and commoner. First, the scribes need your details."
              : "One last rite before the court recognises you."
        }
        onClose={onClose}
      />
      <div className="px-6 pb-2 pt-3 flex rounded-lg bg-night-950 border border-night-700 p-1 text-sm font-medium">
        {(["login", "register"]).map((m) => (
          <button
            key={m}
            onClick={() => flip(m)}
            className={`flex-1 rounded-md py-1.5 capitalize ${mode === m ? "bg-night-700 text-gold-300" : "text-parchment-500"}`}
          >
            {m === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="px-6 py-4 space-y-3.5">
        {error && (
          <p className="text-sm text-red-300 bg-blood-700/40 border border-blood-500 rounded-lg px-3 py-2">{error}</p>
        )}

        {mode === "login" || step === 1 ? (
          <>
            {mode === "register" && (
              <>
                <Field label="Full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required placeholder="Jon Snow" />
                <Field label="Username" value={form.userName} onChange={(e) => set("userName", e.target.value)} required placeholder="lordcommander" />
              </>
            )}
            <Field label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="you@westeros.tv" />
            <Field label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder="••••••••" />
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[13px] font-medium text-parchment-300 mb-1">Avatar (required)</span>
                  <input type="file" accept="image/*" required onChange={(e) => set("avatar", e.target.files?.[0] || null)} className="text-xs w-full text-parchment-500" />
                </label>
                <label className="block">
                  <span className="block text-[13px] font-medium text-parchment-300 mb-1">Cover image</span>
                  <input type="file" accept="image/*" onChange={(e) => set("coverImg", e.target.files?.[0] || null)} className="text-xs w-full text-parchment-500" />
                </label>
              </div>
            )}
            {mode === "login" ? (
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-gold-500 text-night-950 text-sm font-bold py-2.5 hover:bg-gold-400 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy && <Spinner size={15} />} Sign in
              </button>
            ) : (
              <button
                type="button"
                disabled={!detailsValid()}
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-gold-500 text-night-950 text-sm font-bold py-2.5 hover:bg-gold-400 disabled:opacity-40"
              >
                Continue — choose your house →
              </button>
            )}
          </>
        ) : (
          <>
            <HouseOath value={house} onPick={setHouse} />
            <p className="text-center text-[13px] text-parchment-500">
              Swearing to <span className="text-gold-300 font-semibold">{picked.name}</span> — “{picked.words}”
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-night-600 px-4 py-2.5 text-sm font-medium text-parchment-300 hover:bg-night-800"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-lg bg-gold-500 text-night-950 text-sm font-bold py-2.5 hover:bg-gold-400 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy && <Spinner size={15} />} Swear fealty & create account
              </button>
            </div>
          </>
        )}

        <p className="text-xs text-parchment-500 text-center pb-2">
          {mode === "login" ? "New to the realm? " : "Already sworn in? "}
          <button type="button" onClick={() => flip(mode === "login" ? "register" : "login")} className="text-gold-300 font-medium hover:underline">
            {mode === "login" ? "Claim a seat" : "Sign in"}
          </button>
        </p>
      </form>
    </Shell>
  );
}

export function UploadModal({ busy, error, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", description: "", videoFile: null, thumbnail: null });

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (form.videoFile) fd.append("videoFile", form.videoFile);
    if (form.thumbnail) fd.append("thumbnail", form.thumbnail);
    onSubmit(fd);
  }

  return (
    <Shell onClose={onClose} wide>
      <Head title="Issue a proclamation" sub="Your proclamation stays sealed until you publish it." onClose={onClose} />
      <form onSubmit={submit} className="px-6 py-4 space-y-3.5">
        {error && (
          <p className="text-sm text-red-300 bg-blood-700/40 border border-blood-500 rounded-lg px-3 py-2">{error}</p>
        )}
        <Field label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={100} placeholder="What tidings do you bring?" />
        <label className="block">
          <span className="block text-[13px] font-medium text-parchment-300 mb-1">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
            rows={3}
            placeholder="Tell the realm what to expect…"
            className="w-full rounded-lg border border-night-600 bg-night-950 px-3 py-2 text-sm text-parchment-100 outline-none focus:border-gold-500 resize-none placeholder:text-parchment-600"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block rounded-lg border border-dashed border-night-600 px-3 py-3 text-sm hover:border-gold-600 cursor-pointer">
            <span className="block text-[13px] font-medium text-parchment-300">Proclamation reel</span>
            <span className="block text-xs text-parchment-500 mt-0.5">{form.videoFile ? form.videoFile.name : "MP4, WebM — up to ~100MB"}</span>
            <input type="file" accept="video/*" required onChange={(e) => set("videoFile", e.target.files?.[0] || null)} className="text-xs mt-2 w-full text-parchment-500" />
          </label>
          <label className="block rounded-lg border border-dashed border-night-600 px-3 py-3 text-sm hover:border-gold-600 cursor-pointer">
            <span className="block text-[13px] font-medium text-parchment-300">Banner (thumbnail)</span>
            <span className="block text-xs text-parchment-500 mt-0.5">{form.thumbnail ? form.thumbnail.name : "16:9 JPG or PNG works best"}</span>
            <input type="file" accept="image/*" required onChange={(e) => set("thumbnail", e.target.files?.[0] || null)} className="text-xs mt-2 w-full text-parchment-500" />
          </label>
        </div>
        {busy && (
          <div className="h-1.5 rounded-full bg-night-800 overflow-hidden">
            <div className="h-full bg-gold-500 rounded-full uploading-bar" />
          </div>
        )}
        <div className="flex justify-end gap-2 pb-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-night-600 px-4 py-2 text-sm font-medium text-parchment-300 hover:bg-night-800">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="rounded-lg bg-gold-500 text-night-950 px-5 py-2 text-sm font-bold hover:bg-gold-400 disabled:opacity-60 flex items-center gap-2">
            {busy && <Spinner size={15} />} Publish
          </button>
        </div>
      </form>
    </Shell>
  );
}

export function ConfirmModal({ title, body, confirmLabel = "Delete", busy, onClose, onConfirm }) {
  return (
    <Shell onClose={onClose}>
      <Head title={title} onClose={onClose} />
      <p className="px-6 py-3 text-sm text-parchment-300">{body}</p>
      <div className="flex justify-end gap-2 px-6 pb-5">
        <button onClick={onClose} className="rounded-lg border border-night-600 px-4 py-2 text-sm font-medium text-parchment-300 hover:bg-night-800">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={busy} className="rounded-lg bg-blood-600 text-parchment-100 px-4 py-2 text-sm font-semibold hover:bg-blood-500 disabled:opacity-60 flex items-center gap-2">
          {busy && <Spinner size={15} />} {confirmLabel}
        </button>
      </div>
    </Shell>
  );
}
