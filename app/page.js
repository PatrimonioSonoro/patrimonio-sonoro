// Homepage migrated from legacy static site (code_sitio_web/index.html)

import SoundMap from "./components/SoundMap";
import NavClient from "./components/NavClient";
import HeroClient from "./components/HeroClient";
import ContentMediaPlayer from "./components/ContentMediaPlayer";
import { createClient } from '@supabase/supabase-js';

async function fetchPublicContents() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return [];
  
  const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  
  // Fetch contenidos with public URLs directly from database
  const { data, error } = await sb.from('contenidos')
    .select('id,title,description,region,created_at,image_public_url,video_public_url,audio_public_url')
    .eq('status','published')
    .order('created_at', { ascending: false })
    .limit(9);
    
  if (error || !data) return [];

  // No need to process URLs - they're already public URLs in the database
  return data.map(content => ({
    ...content,
    image_url: content.image_public_url,
    audio_url: content.audio_public_url,
    video_url: content.video_public_url
  }));
}

// Página principal migrada (server component)
export default async function Page() {
  const contents = await fetchPublicContents();

  return (
    <main>
      {/* Navegación superior (client) */}
      <NavClient />

      {/* Héroe (client) */}
      <HeroClient />

      {/* ¿Qué es? */}
      <section id="que-es" className="py-20 bg-white">
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

      {/* Explora */}
      <section id="explora" className="py-20 bg-grisClaro">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-1 bg-turquesaAudioBrand" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Explora los Sonidos</h2>
          <p className="text-xl text-center text-gray-600 mb-12">Descubre la riqueza sonora de Colombia</p>

          {/* Filtros placeholder */}
          <div className="search-filters mb-12">
            <input type="text" placeholder="Buscar sonidos..." className="search-input" />
            <select className="filter-select">
              <option value="">Todas las regiones</option>
              <option value="amazonia">Amazonía</option>
              <option value="andina">Andina</option>
              <option value="caribe">Caribe</option>
              <option value="insular">Insular</option>
              <option value="pacifico">Pacífico</option>
            </select>
            <select className="filter-select">
              <option value="">Todas las campañas</option>
              <option value="campesena">CampeSENA</option>
              <option value="formacion">Formación</option>
              <option value="sena-al-aire">SENA al Aire</option>
            </select>
          </div>

          {/* Render public contents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.length === 0 ? (
              <div className="text-gray-600">No hay contenidos públicos disponibles.</div>
            ) : (
              contents.map((c) => (
                <div key={c.id} className="sound-card-modern">
                  <div className="sound-card-content">
                    <div className="sound-card-meta">
                      <span className="region-badge">{c.region || 'General'}</span>
                    </div>
                    <h3 className="sound-title">{c.title}</h3>
                    <p className="sound-description">{c.description}</p>
                    <div className="mt-3">
                      <ContentMediaPlayer content={c} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

  {/* Mapa Sonoro */}
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

      {/* Sección Nosotros (migrada) */}
      <section id="nosotros" className="py-20 bg-grisClaro">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-1 bg-turquesaAudioBrand" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Nosotros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Texto descriptivo */}
            <div className="md:col-span-2 space-y-4 text-gray-700 text-center md:text-justify">
              <p>
                Patrimonio Sonoro es una iniciativa cultural, educativa y tecnológica del Servicio Nacional de Aprendizaje – SENA,
                liderada junto a la oficina de AudioBrand, que busca preservar, visibilizar y compartir los sonidos representativos de las
                regiones de Colombia mediante una plataforma digital pública, abierta y colaborativa.
              </p>
              <p>
                Nace con el propósito de consolidar un banco nacional de sonidos que capture la riqueza auditiva de nuestro país — desde
                paisajes sonoros rurales y urbanos, hasta expresiones culturales, voces del territorio, música tradicional, fauna, eventos,
                historias habladas y mucho más.
              </p>
              <p>
                Creemos que lo que suena también nos representa, y por eso trabajamos para que aprendices, instructores, comunidades,
                instituciones y empresas puedan contribuir, escuchar, descargar y reutilizar sonidos con atribución institucional bajo licencias abiertas.
              </p>
              <p>
                Actualmente estamos desarrollando la fase inicial del proyecto, construyendo una plataforma web interactiva que funcionará como repositorio,
                mapa sonoro y red colaborativa, permitiendo explorar sonidos por región, temática o campaña. Esta plataforma servirá como herramienta pedagógica,
                archivo patrimonial y espacio de innovación sonora para el país.
              </p>
              <p>
                Nuestro compromiso es convertir el sonido en una herramienta de aprendizaje, memoria, identidad y transformación cultural, al servicio de todos los colombianos.
              </p>
            </div>
            {/* Tarjeta de equipo */}
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
                  Servicio Nacional de Aprendizaje
                </div>
                <div>
                  <span className="font-semibold">Aliados</span>
                  <br />
                  Instituciones educativas y culturales de Colombia
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

      {/* Footer migrado */}
      <footer className="mt-20">
        {/* Barra superior de contacto */}
        <div className="bg-azulInstitucional text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg md:text-2xl font-bold mb-4">Contacto institucional</h3>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                {/* ícono correo */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                <span>patrimoniosonoro@sena.edu.co</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* ícono teléfono */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l3 7-1.34 2.68a2 2 0 001.8 2.96h3.13a2 2 0 001.8-1.14l1.42-2.82a48.6 48.6 0 006.95 6.95l-2.82 1.42a2 2 0 00-1.14 1.8v3.13a2 2 0 002.96 1.8L19 19l7 3v2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>
                <span>(601) 546-2354</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* ícono ubicación */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8C19.5 13.5 12 21 12 21S4.5 13.5 4.5 8a7.5 7.5 0 1115 0z"/></svg>
                <span>Valledupar-Cesar, Colombia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo del footer */}
        <div className="bg-negroSuave text-gray-400 py-10 text-sm">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div>
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-turquesaAudioBrand mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3v18c0 1.103-.897 2-2 2s-2-.897-2-2V3h-2v18c0 1.103-.897 2-2 2s-2-.897-2-2V3H9v18c0 1.103-.897 2-2 2s-2-.897-2-2V3H3v18c0 2.206 1.794 4 4 4s4-1.794 4-4V7h2v14c0 2.206 1.794 4 4 4s4-1.794 4-4V3h-2z"/></svg>
                <div>
                  <p className="font-bold text-white leading-none">Patrimonio Sonoro</p>
                  <span className="text-turquesaAudioBrand text-xs">AudioBrand</span>
                </div>
              </div>
              <p>Preservando, visibilizando y difundiendo los sonidos representativos de Colombia como parte de nuestro patrimonio cultural inmaterial.</p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-semibold text-white mb-3">Explorar</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Inicio</a></li>
                <li><a href="#" className="hover:text-white">¿Por qué?</a></li>
                <li><a href="#explora" className="hover:text-white">Explora</a></li>
                <li><a href="#regiones" className="hover:text-white">Regiones</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="font-semibold text-white mb-3">Participa</h4>
              <ul className="space-y-2">
                <li><a href="#campanas" className="hover:text-white">Campañas</a></li>
                <li><a href="#" className="hover:text-white">Formulario</a></li>
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preguntas frecuentes</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="font-semibold text-white mb-3">Institucional</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Sobre el proyecto</a></li>
                <li><a href="#" className="hover:text-white">SENA</a></li>
                <li><a href="#" className="hover:text-white">AudioBrand</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
