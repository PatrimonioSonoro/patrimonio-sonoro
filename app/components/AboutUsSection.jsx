import React from "react";

import SectionHeading from "./SectionHeading";

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
    </svg>
  );
}

function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function SparkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 15h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.5 5L19 8.5l-5.5 1.5L12 15l-1.5-5L5 8.5l5.5-1.5L12 2z" />
    </svg>
  );
}

export default function AboutUsSection() {
  return (
    <section id="nosotros" className="py-20 bg-grisClaro relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-turquesaAudioBrand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-azulInstitucional/10 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Nosotros" subtitle="Institución, propósito cultural y una visión educativa" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="rounded-3xl bg-white ring-1 ring-black/5 p-6 md:p-8 shadow-sm">
              <div className="rounded-2xl bg-gradient-to-br from-azulInstitucional/10 via-transparent to-turquesaAudioBrand/10 p-6 md:p-7">
                <h3 className="text-xl md:text-2xl font-extrabold text-azulInstitucional">
                  Patrimonio Sonoro nace para preservar lo que nos identifica
                </h3>
                <p className="mt-4 text-gray-700 leading-relaxed max-w-prose">
                  En un escenario de constante transformación social, tecnológica y cultural, la oficina de AudioBrand SENA 
                  asume el compromiso de liderar iniciativas que fortalezcan los procesos de formación, innovación y preservación 
                  del patrimonio colombiano.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed max-w-prose">
                  La iniciativa surge como una propuesta de desarrollo tecnológico e innovación en el marco del proyecto Audiobrand del SENA, asignado como parte de las prácticas de la etapa productiva de los talentos José David Sierra del programa Técnico en Audio Digital y Juan Camilo Goyeneche del Tecnólogo en Análisis y Desarrollo de Software.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 rounded-2xl bg-white/70 ring-1 ring-black/5 p-4 transition hover:bg-white">
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-turquesaAudioBrand text-white">
                      <ShieldIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-azulInstitucional">Enfoque institucional</div>
                      <div className="mt-1 text-sm text-gray-600">SENA como respaldo técnico y educativo.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-white/70 ring-1 ring-black/5 p-4 transition hover:bg-white">
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-verdeSena text-white">
                      <BookIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-azulInstitucional">Propósito educativo</div>
                      <div className="mt-1 text-sm text-gray-600">Recursos para formación y cultura.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white/70 ring-1 ring-black/5 p-5">
                  <div className="flex items-center gap-2 text-azulInstitucional font-extrabold">
                    <SparkIcon className="h-5 w-5" aria-hidden="true" />
                    Valores del proyecto
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckIcon className="h-4 w-4 mt-0.5 text-turquesaAudioBrand" aria-hidden="true" />
                      Preservación del patrimonio cultural inmaterial.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="h-4 w-4 mt-0.5 text-turquesaAudioBrand" aria-hidden="true" />
                      Acceso público y uso responsable con licencias abiertas.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="h-4 w-4 mt-0.5 text-turquesaAudioBrand" aria-hidden="true" />
                      Innovación aplicada a formación y pedagogía sonora.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white ring-1 ring-black/5 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg md:text-xl font-extrabold text-azulInstitucional">Nuestro Equipo</h3>
              <p className="mt-2 text-sm text-gray-600">
                Un trabajo articulado entre enfoque creativo y coordinación institucional.
              </p>

              <div className="mt-6 space-y-4">
                <div className="group rounded-2xl bg-grisClaro ring-1 ring-black/5 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-azulInstitucional">AudioBrand</div>
                      <div className="mt-1 text-sm text-gray-600">Dirección creativa y técnica</div>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-turquesaAudioBrand/15 flex items-center justify-center text-turquesaAudioBrand">
                      <SparkIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="group rounded-2xl bg-grisClaro ring-1 ring-black/5 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-azulInstitucional">SENA</div>
                      <div className="mt-1 text-sm text-gray-600">Coordinación institucional y educativa</div>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-verdeSena/15 flex items-center justify-center text-verdeSena">
                      <ShieldIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-br from-azulInstitucional/10 via-transparent to-turquesaAudioBrand/10 p-6 ring-1 ring-black/5">
                <div className="text-sm font-extrabold text-azulInstitucional">Propósito</div>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  Consolidar un repositorio digital de grabaciones originales bajo licencias abiertas para consulta, descarga y uso responsable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
