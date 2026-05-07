export const dynamic = 'force-dynamic';

import NavClient from "../components/NavClient";
import SoundMap from "../components/SoundMap";
import SectionHeading from "../components/SectionHeading";

export default function MapaSonoroPage() {
  return (
    <main>
      <NavClient />

      <section className="pt-24 md:pt-28 pb-12 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Mapa Sonoro"
            subtitle="Explora los sonidos de Colombia por ubicación geográfica."
            align="left"
          />
        </div>
      </section>

      <section className="pb-16 bg-grisClaro">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-white ring-1 ring-black/5 p-3 md:p-5">
            <SoundMap />
          </div>
        </div>
      </section>
    </main>
  );
}
