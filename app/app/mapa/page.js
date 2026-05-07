import SoundMap from "../../components/SoundMap";
import PrivatePageHeader from "../../components/PrivatePageHeader";

export const dynamic = 'force-dynamic';

export default function AppMapaPage() {
  return (
    <main>
      <PrivatePageHeader
        title="Mapa sonoro"
        subtitle="Explora los sonidos de Colombia por ubicación geográfica."
      />

      <section className="py-8 bg-grisClaro">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-white ring-1 ring-black/5 p-3 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.10)]">
            <SoundMap />
          </div>
        </div>
      </section>
    </main>
  );
}
