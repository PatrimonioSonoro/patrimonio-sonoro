"use client";

import { motion } from "framer-motion";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function IconMic({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 013 3v8a3 3 0 11-6 0V4a3 3 0 013-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 23h8" />
    </svg>
  );
}

function IconPen({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function IconSliders({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21v-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10V3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 14h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 8h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 16h4" />
    </svg>
  );
}

function IconHeadphones({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13a8 8 0 0116 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13v5a2 2 0 002 2h1v-7H6a2 2 0 00-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13v5a2 2 0 01-2 2h-1v-7h1a2 2 0 012 2z" />
    </svg>
  );
}

function IconDisc({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconUsers({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconBook({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function ItemCard({ icon, title, value, accent }) {
  if (!value) return null;

  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/30 p-4"
      style={{ boxShadow: "0 10px 28px rgba(0,0,0,0.22)", backdropFilter: "blur(10px)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-2xl ring-1 ring-white/10 flex items-center justify-center"
          style={{ background: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-black tracking-widest text-white/65">{title}</div>
          <div className="mt-2 text-sm text-white/90 whitespace-pre-wrap">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function CreditsPanel({ credits }) {
  if (!credits) {
    return <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">(Sin créditos)</div>;
  }

  const items = [
    {
      key: "artist",
      title: "Artista",
      value: credits.artist,
      icon: <IconMic className="h-5 w-5 text-black/80" />,
      accent: "rgba(0,184,169,0.85)",
    },
    {
      key: "composition_lyrics",
      title: "Composición y letra",
      value: credits.composition_lyrics,
      icon: <IconPen className="h-5 w-5 text-black/80" />,
      accent: "rgba(255,209,102,0.92)",
    },
    {
      key: "production_engineering",
      title: "Producción e ingeniería",
      value: credits.production_engineering,
      icon: <IconSliders className="h-5 w-5 text-black/80" />,
      accent: "rgba(33,85,133,0.95)",
    },
    {
      key: "producer",
      title: "Productor",
      value: credits.producer,
      icon: <IconHeadphones className="h-5 w-5 text-black/80" />,
      accent: "rgba(0,159,77,0.92)",
    },
    {
      key: "mastering_engineer",
      title: "Masterización",
      value: credits.mastering_engineer,
      icon: <IconDisc className="h-5 w-5 text-black/80" />,
      accent: "rgba(248,186,63,0.92)",
    },
    {
      key: "performers",
      title: "Intérpretes",
      value: credits.performers,
      icon: <IconUsers className="h-5 w-5 text-black/80" />,
      accent: "rgba(201,43,40,0.85)",
    },
    {
      key: "sources",
      title: "Fuentes",
      value: credits.sources,
      icon: <IconBook className="h-5 w-5 text-black/80" />,
      accent: "rgba(255,255,255,0.16)",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-3xl border border-white/10 p-4 sm:p-5"
      style={{ background: "rgba(0,0,0,0.24)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black tracking-widest text-white/60">FICHA TÉCNICA MUSICAL</div>
          <div className="mt-1 text-sm font-extrabold text-white/90">Créditos</div>
        </div>
      </div>

      <div className={cx("mt-4 grid gap-3", "sm:grid-cols-2")}>{items.map((it) => (
        <ItemCard key={it.key} icon={it.icon} title={it.title} value={it.value} accent={it.accent} />
      ))}</div>
    </motion.div>
  );
}
