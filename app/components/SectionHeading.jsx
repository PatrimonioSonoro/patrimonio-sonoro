import React from "react";

export default function SectionHeading({ title, subtitle, align = "center", variant = "dark" }) {
  const isLight = variant === "light";
  const isLeft = align === "left";

  const titleClass = isLight
    ? `text-3xl md:text-4xl font-bold mb-6 text-white ${isLeft ? 'text-left' : 'text-center'}`
    : `text-3xl md:text-4xl font-bold mb-6 ${isLeft ? 'text-left' : 'text-center'}`;

  const subtitleClass = isLight
    ? `text-xl mb-12 text-white/80 ${isLeft ? 'text-left' : 'text-center'}`
    : `text-xl text-gray-600 mb-12 ${isLeft ? 'text-left' : 'text-center'}`;

  const alignClass = isLeft ? "items-start" : "items-center";
  const separatorWrapClass = isLeft ? "justify-start" : "justify-center";

  return (
    <div className={`flex flex-col ${alignClass}`}>
      <div className={`flex ${separatorWrapClass} mb-6 w-full`}>
        <div className="w-20 h-1 bg-turquesaAudioBrand" />
      </div>
      <h2 className={titleClass}>{title}</h2>
      {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
    </div>
  );
}
