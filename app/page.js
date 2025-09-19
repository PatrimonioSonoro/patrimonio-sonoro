// Homepage migrated from legacy static site (code_sitio_web/index.html)
// Force dynamic rendering to fetch fresh content
export const dynamic = 'force-dynamic';

import SoundMap from "./components/SoundMap";
import NavClient from "./components/NavClient";
import HeroCarousel from "./components/HeroCarousel";
import FloatingGameButton from "./components/FloatingGameButton";
import ContentMediaPlayer from "./components/ContentMediaPlayer";
import CampaignCard from "./components/CampaignCard";
import ExploreSection from "./components/ExploreSection";
import RevealOnScroll from "./components/RevealOnScroll";
import { createClient } from '@supabase/supabase-js';

async function fetchPublicContents() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, anonKey: !!anonKey });
    return [];
  }
  
  const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  
  // Fetch contenidos with public URLs directly from database
  const { data, error } = await sb.from('contenidos')
    .select('id,title,description,region,created_at,image_public_url,video_public_url,audio_public_url')
    .eq('status','published')
    .order('created_at', { ascending: false })
    .limit(9);
    
  console.log('Supabase query result:', { data: data?.length || 0, error: error?.message || null });
    
  if (error || !data) {
    console.error('Query failed:', error);
    return [];
  }

  // No need to process URLs - they're already public URLs in the database
  const result = data.map(content => ({
    ...content,
    image_url: content.image_public_url,
    audio_url: content.audio_public_url,
    video_url: content.video_public_url
  }));
  
  console.log('Final mapped content:', result.length);
  return result;
}

// Página principal migrada (server component)
export default async function Page() {
  const contents = await fetchPublicContents();
  console.log('Page component received contents:', contents.length);

  return (
    <main>
      {/* Navegación superior (client) */}
      <NavClient />

      {/* Héroe: carrusel de contenedores (client) */}
  <RevealOnScroll>
    <HeroCarousel />
  </RevealOnScroll>

  {/* ¿Qué es? */}
  <RevealOnScroll>
  <section id="que-es" className="py-20 bg-que-es">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-1 bg-turquesaAudioBrand" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">¿Qué es Patrimonio Sonoro?</h2>
            <p className="text-xl text-center text-gray-600 mb-12">Una plataforma del SENA para preservar lo que se escucha</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-grisClaro p-6 rounded-xl text-center">
                <div className="bg-turquesaAudioBrand w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Plataforma abierta</h3>
                <p className="text-gray-600">Una iniciativa del SENA y AudioBrand para preservar y compartir sonidos representativos de Colombia.</p>
              </div>
              <div className="bg-grisClaro p-6 rounded-xl text-center">
                <div className="bg-verdeSena w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Repositorio sonoro</h3>
                <p className="text-gray-600">Colección de música y sonidos representativos de las regiones de Colombia con licencias abiertas.</p>
              </div>
              <div className="bg-grisClaro p-6 rounded-xl text-center">
                <div className="bg-amarilloVibrante w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Patrimonio cultural</h3>
                <p className="text-gray-600">Preservamos el patrimonio cultural inmaterial de Colombia a través de sus sonidos característicos.</p>
              </div>
            </div>
          </div>
        </div>
  </section>
  </RevealOnScroll>

  {/* Campañas */}
  <RevealOnScroll>
    <section id="campanas" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-1 bg-turquesaAudioBrand" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Campañas</h2>
          <p className="text-xl text-center text-gray-600 mb-12">Conoce nuestras campañas y participa en la preservación sonora.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CampaignCard
              title="CampeSENA"
              description="Iniciativa formativa del SENA que promueve la participación de comunidades rurales."
              videoSrc="/videos/campe_sena.mp4"
              posterSrc="/images/campe_sena_banner.png"
              ctaHref="https://www.youtube.com/watch?v=GrMtr30uQPc"
            />

            <CampaignCard
              title="Campesino Canta"
              description="Recopilación de voces y cantos campesinos, una memoria viva del territorio."
              videoSrc="/videos/campesino_canta.mp4"
              posterSrc="/images/campesino_canta_banner.png"
              ctaHref="https://www.youtube.com/watch?v=8uv9GJmRwdI"
            />

            <CampaignCard
              title="Full popular"
              description="Campaña dedicada a recopilar canciones y expresiones populares de distintas regiones."
              videoSrc="/videos/full_popular.mp4"
              posterSrc="/images/full_popular_banner.png"
              ctaHref="https://www.youtube.com/watch?v=KNhJvmszCzo"
            />
          </div>
          </div>
      </section>
  </RevealOnScroll>

  {/* Explora */}
  <RevealOnScroll>
    <section id="explora" className="py-20 bg-grisClaro">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-1 bg-turquesaAudioBrand" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Explora los Sonidos</h2>
        <p className="text-xl text-center text-gray-600 mb-12">Descubre la riqueza sonora de Colombia</p>

        <ExploreSection contents={contents} />
      </div>
    </section>
  </RevealOnScroll>

  {/* Mapa Sonoro */}
  <RevealOnScroll>
  <section id="mapa-sonoro" className="py-20 bg-white scroll-mt-24 relative z-0">
        <div className="container mx-auto px-15">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-1 bg-turquesaAudioBrand" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Mapa Sonoro</h2>
          <p className="text-xl text-center text-gray-600 mb-12">Explora los sonidos de Colombia por ubicación geográfica</p>
          <SoundMap />
        </div>
      </section>
      </RevealOnScroll>

  {/* Sección Nosotros (migrada) */}
  <RevealOnScroll>
  <section id="nosotros" className="py-20 bg-grisClaro">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-1 bg-turquesaAudioBrand" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Nosotros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Texto descriptivo: versión resumida y clara */}
            <div className="md:col-span-2 space-y-4 text-gray-700 text-center md:text-justify">
              <p>
                Patrimonio Sonoro es una plataforma colaborativa del SENA y AudioBrand dedicada a documentar, preservar y difundir los
                paisajes sonoros de Colombia. Reunimos grabaciones de campo, descripciones curatoriales y metadatos técnicos que facilitan
                la catalogación y el acceso responsable a materiales sonoros de valor patrimonial.
              </p>

              <p>
                Nuestra misión es promover la memoria acústica del país y fortalecer la identidad local a través del sonido. Trabajamos
                con comunidades, aprendices e investigadores para garantizar que las grabaciones estén contextualizadas y sean reutilizables
                en contextos educativos, culturales y científicos.
              </p>

              <p>
                El repositorio incluye distintos tipos de contenido: Paisajes sonoros, música tradicional, voces orales, eventos comunitarios y
                ejemplos de fauna y ambientes naturales. Cada registro incorpora metadatos que permiten búsquedas por región, tema, campaña o autor.
              </p>

              <p>
                Te invitamos a participar: Si tienes grabaciones, historias o proyectos relacionados con el patrimonio sonoro, contáctanos o
                únete a nuestras campañas para contribuir con el acervo público. Juntos podemos construir un archivo sonoro accesible y sostenible.
              </p>
            </div>
            {/* Tarjeta de equipo: mantener roles, quitar 'Aliados' */}
            <div className="bg-white p-8 rounded-xl shadow-md mx-auto lg:mx-0">
              <h3 className="text-lg font-bold text-azulInstitucional mb-4">Nuestro Equipo</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-semibold">AudioBrand</span>
                  <br />
                  Dirección creativa y técnica
                </div>
                <div>
                  <span className="font-semibold">SENA</span>
                  <br />
                  Coordinación institucional y educativa
                </div>
                <hr className="my-4" />
                <div>
                  <span className="font-semibold">Contacto</span>
                  <br />
                  <a href="mailto:info@patrimoniosonoro.co" className="text-turquesaAudioBrand">
                    info@patrimoniosonoro.co
                  </a>
                  <br />
                  <span>+57 (1) 123 4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </RevealOnScroll>
    <FloatingGameButton gameLink="https://game.patrimoniosonoro.com.co/" />
      </main>
  );
}
