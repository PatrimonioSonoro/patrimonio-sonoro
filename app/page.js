"use client";
// Homepage migrated from legacy static site (code_sitio_web/index.html)

import AuthModalButton from "./components/AuthModalButton";
import { useState } from "react";
import { motion } from "framer-motion";
import SoundMap from "./components/SoundMap";

// Página principal migrada
export default function Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  const stagger = {
    show: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <main>
      {/* Navegación superior */}
      <nav className="nav-with-bg bg-white shadow-md fixed top-0 left-0 w-full z-[2000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + marca */}
            <div className="flex items-center">
              <div className="mr-3">
                <img src="/images/logo_sin_letra.png" alt="Patrimonio Sonoro" className="h-14 w-auto object-contain" />
              </div>
              <div>
                <span className="text-lg font-bold text-azulInstitucional">Patrimonio Sonoro</span>
                <div className="flex items-center text-[11px] text-gray-500 leading-none">
                  <span>SENA</span>
                  <span className="mx-1">•</span>
                  <span>AudioBrand</span>
                </div>
              </div>
            </div>

            {/* Enlaces de navegación */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#inicio" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Inicio</a>
              <a href="#que-es" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">¿Qué es?</a>
              <a href="#explora" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Explora</a>
              <a href="#mapa-sonoro" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Mapa Sonoro</a>
              <a href="#nosotros" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Nosotros</a>
            </div>

            {/* Acciones derecha */}
            <div className="hidden md:flex items-center space-x-4">
              <AuthModalButton />
            </div>

            {/* Botón menú móvil */}
            <div className="md:hidden flex items-center space-x-2">
              <AuthModalButton />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-azulInstitucional p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú de navegación"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Menú móvil desplegable */}
        <motion.div 
          initial={false}
          animate={mobileMenuOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 1, height: "auto" },
            closed: { opacity: 0, height: 0 }
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
        >
          <div className="px-4 py-4 space-y-3">
            <a 
              href="#inicio" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors"
            >
              Inicio
            </a>
            <a 
              href="#que-es" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors"
            >
              ¿Qué es?
            </a>
            <a 
              href="#explora" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors"
            >
              Explora
            </a>
            <a 
              href="#mapa-sonoro" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors"
            >
              Mapa Sonoro
            </a>
            <a 
              href="#nosotros" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors"
            >
              Nosotros
            </a>
          </div>
        </motion.div>
      </nav>

      {/* Héroe */}
      <section id="inicio" className="hero-section min-h-screen flex items-center justify-center relative">
        <div className="sound-wave" />
        <div className="container mx-auto px-4 text-center text-white z-10">
          <div className="flex justify-center mb-6 hero-waves-top">
            <div className="flex items-center space-x-1 waves-inline">
              <div className="sound-bar h-12" />
              <div className="sound-bar h-16" />
              <div className="sound-bar h-20" />
              <div className="sound-bar h-16" />
              <div className="sound-bar h-12" />
            </div>
          </div>
        
          <div className="hero-spacer" />
          
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 hero-buttons">
            <a href="#explora" className="bg-turquesaAudioBrand hover:bg-opacity-90 text-white px-8 py-3 rounded-full text-lg font-medium transition-all transform hover:scale-105">Explorar sonidos</a>
            <a href="#que-es" className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-3 rounded-full text-lg font-medium transition-all">Conocer más</a>
          </div>
        </div>
      </section>

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

          {/* Tarjetas demo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="sound-card-modern">
              <div className="sound-card-header amazonia">
                <div className="play-button"></div>
              </div>
              <div className="sound-card-content">
                <div className="sound-card-meta">
                  <span className="region-badge amazonia">Amazonia</span>
                  <span className="sound-duration">2:30</span>
                </div>
                <h3 className="sound-title">Selva Amazónica</h3>
                <p className="sound-description">Grabación de los sonidos de la selva amazónica colombiana, con su rica biodiversidad sonora.</p>
                <div className="sound-author">
                  <div className="author-avatar" style={{background: '#4A90A4'}}>LG</div>
                  <span className="author-name">Laura Gómez</span>
                  <div className="sound-stats">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>4.8</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sound-card-modern">
              <div className="sound-card-header insular">
                <div className="play-button"></div>
              </div>
              <div className="sound-card-content">
                <div className="sound-card-meta">
                  <span className="region-badge insular">Insular</span>
                  <span className="sound-duration">3:45</span>
                </div>
                <h3 className="sound-title">Calypso de San Andrés</h3>
                <p className="sound-description">Música tradicional de la región insular colombiana, con influencias caribeñas y africanas.</p>
                <div className="sound-author">
                  <div className="author-avatar" style={{background: '#E53E3E'}}>RJ</div>
                  <span className="author-name">Roberto James</span>
                  <div className="sound-stats">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>4.6</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sound-card-modern">
              <div className="sound-card-header andina">
                <div className="play-button"></div>
              </div>
              <div className="sound-card-content">
                <div className="sound-card-meta">
                  <span className="region-badge andina">Andina</span>
                  <span className="sound-duration">2:15</span>
                </div>
                <h3 className="sound-title">Mercado Campesino</h3>
                <p className="sound-description">Ambiente sonoro de un mercado campesino tradicional en la región andina colombiana.</p>
                <div className="sound-author">
                  <div className="author-avatar" style={{background: '#48BB78'}}>CM</div>
                  <span className="author-name">Carlos Martínez</span>
                  <div className="sound-stats">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>4.9</span>
                  </div>
                </div>
              </div>
            </div>
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
