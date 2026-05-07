import PrivatePageHeader from "../../components/PrivatePageHeader";
import CampaignCard from "../../components/CampaignCard";

export const dynamic = "force-dynamic";

export default function CampanasPage() {
  const campaigns = [
    {
      title: "CampeSENA",
      description:
        "Iniciativa formativa del SENA que promueve la participación de comunidades rurales.",
      videoSrc: "/videos/campe_sena.mp4",
      posterSrc: "/images/campe_sena_banner.png",
      ctaHref: "https://www.youtube.com/@SENAComunica",
    },
    {
      title: "Campesino Canta",
      description:
        "Recopilación de voces y cantos campesinos, una memoria viva del territorio.",
      videoSrc: "/videos/campesino_canta.mp4",
      posterSrc: "/images/campesino_canta_banner.png",
      ctaHref: "https://www.youtube.com/@SENAComunica",
    },
    {
      title: "Full popular",
      description:
        "Campaña dedicada a recopilar canciones y expresiones populares de distintas regiones.",
      videoSrc: "/videos/full_popular.mp4",
      posterSrc: "/images/full_popular_banner.png",
      ctaHref: "https://www.youtube.com/@SENAComunica",
    },
  ];

  return (
    <main>
      <PrivatePageHeader
        title="Campañas"
        subtitle="Conoce nuestras campañas y participa en la preservación sonora."
      />

      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
    </main>
  );
}
