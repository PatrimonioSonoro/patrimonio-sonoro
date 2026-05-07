"use client";

import React from "react";
import CampaignCard from "./CampaignCard";

export default function CampaignsSection() {
  const campaigns = [
    {
      title: "CampeSENA",
      description:
        "Iniciativa formativa del SENA que promueve la participación de comunidades rurales.",
      videoSrc: "/videos/campe_sena.mp4",
      posterSrc: "/images/campe_sena_banner.png",
      ctaHref: "https://youtu.be/GrMtr30uQPc",
    },
    {
      title: "Campesino Canta",
      description:
        "Recopilación de voces y cantos campesinos, una memoria viva del territorio.",
      videoSrc: "/videos/campesino_canta.mp4",
      posterSrc: "/images/campesino_canta_banner.png",
      ctaHref: "https://youtu.be/8uv9GJmRwdI",
    },
    {
      title: "Full popular",
      description:
        "Campaña dedicada a recopilar canciones y expresiones populares de distintas regiones.",
      videoSrc: "/videos/full_popular.mp4",
      posterSrc: "/images/full_popular_banner.png",
      ctaHref: "https://youtu.be/KNhJvmszCzo",
    },
  ];

  return (
    <section id="campanas" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-turquesaAudioBrand" />
          <h2 className="mt-6 text-3xl md:text-4xl font-extrabold text-azulInstitucional">
            Campañas
          </h2>
          <p className="mt-3 text-gray-600">
            Conoce nuestras campañas y participa en la preservación sonora.
          </p>
        </div>

        <div className="mt-10 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {campaigns.map((c) => (
              <CampaignCard
                key={c.title}
                title={c.title}
                description={c.description}
                videoSrc={c.videoSrc}
                posterSrc={c.posterSrc}
                ctaHref={c.ctaHref}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
