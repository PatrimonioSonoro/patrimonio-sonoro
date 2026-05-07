export const dynamic = 'force-dynamic';

import NavClient from "../components/NavClient";
import Link from "next/link";

export default function MusicosPage() {
  return (
    <main>
      <NavClient />

      <section className="pt-24 md:pt-28 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-azulInstitucional">Stock de Músicos</h1>
            <p className="mt-3 text-gray-600">
              Este módulo estará disponible próximamente. Aquí podrás explorar perfiles de músicos y talentos del territorio.
            </p>

            <div className="mt-8 rounded-2xl bg-grisClaro p-6 ring-1 ring-black/5">
              <h2 className="text-lg font-extrabold text-azulInstitucional">¿Qué sigue?</h2>
              <p className="mt-2 text-sm text-gray-600">
                Podemos integrar este módulo con Supabase para listar músicos, filtrar por región, instrumentos y géneros.
              </p>

              <div className="mt-5">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-6 py-3 text-sm font-extrabold text-white hover:brightness-110 transition"
                >
                  Volver al Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
