import React from "react";

export default function InfoCard({ title, description, icon, accentClass = "bg-turquesaAudioBrand" }) {
  return (
    <div className="group relative rounded-2xl bg-white/12 ring-1 ring-white/20 p-6 md:p-7 backdrop-blur-sm shadow-sm shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/16">
      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass} shadow-sm`}>
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/85">{description}</p>
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}
