// Homepage migrated from legacy static site (code_sitio_web/index.html)
// Force dynamic rendering to fetch fresh content
export const dynamic = 'force-dynamic';

import NavClient from "./components/NavClient";
import HeroCarousel from "./components/HeroCarousel";
import FloatingGameButton from "./components/FloatingGameButton";
import RevealOnScroll from "./components/RevealOnScroll";
import CampesenaAlbumTeaser from "./components/CampesenaAlbumTeaser";
import WhatIsSection from "./components/WhatIsSection";
import AboutUsSection from "./components/AboutUsSection";

// Página principal migrada (server component)
export default async function Page() {
  return (
    <main>
      {/* Navegación superior (client) */}
      <NavClient />

      {/* Héroe: carrusel de contenedores (client) */}
  <RevealOnScroll>
    <HeroCarousel />
  </RevealOnScroll>

  <FloatingGameButton gameLink="https://game.patrimoniosonoro.com.co/" />

  {/* ¿Qué es? */}
  <RevealOnScroll>
    <WhatIsSection />
  </RevealOnScroll>

  {/* Campañas */}
  <RevealOnScroll>
    <CampesenaAlbumTeaser />
  </RevealOnScroll>

  {/* Nosotros */}
  <RevealOnScroll>
    <AboutUsSection />
  </RevealOnScroll>

      </main>
  );
}
