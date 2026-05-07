import PrivatePageHeader from "../../components/PrivatePageHeader";
import SectionHeading from "../../components/SectionHeading";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function SubirPage() {
  return (
    <main>
      <PrivatePageHeader
        title="Subir sonido"
        subtitle="Este módulo estará disponible próximamente para usuarios."
      />

      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <SectionHeading
              title="Subir sonido"
              subtitle="Este módulo estará disponible próximamente para usuarios."
              align="left"
            />

            <div className="mt-8 rounded-2xl bg-grisClaro p-6 ring-1 ring-black/5">
              <h2 className="text-lg font-extrabold text-azulInstitucional">Estado</h2>
              <p className="mt-2 text-sm text-gray-600">
                En la siguiente fase conectamos este flujo al sistema de contenidos existente.
              </p>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/app/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-6 py-3 text-sm font-extrabold text-white hover:brightness-110 transition"
                >
                  Volver al Dashboard
                </Link>
                <Link
                  href="/dashboard/contents/new"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-azulInstitucional ring-1 ring-black/5 hover:bg-gray-50 transition"
                >
                  Panel admin (si aplica)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
