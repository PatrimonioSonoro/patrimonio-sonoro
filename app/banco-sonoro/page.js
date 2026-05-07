export const dynamic = 'force-dynamic';

import NavClient from "../components/NavClient";
import ExploreSection from "../components/ExploreSection";
import SectionHeading from "../components/SectionHeading";
import { createClient } from "@supabase/supabase-js";

async function fetchPublicContents({ q } = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, anonKey: !!anonKey });
    return [];
  }

  const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  let query = sb
    .from('contenidos')
    .select('id,title,description,region,created_at,image_public_url,video_public_url,audio_public_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(60);

  const search = (q || '').trim();
  if (search) {
    const pattern = `%${search}%`;
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern},region.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error('Query failed:', error);
    return [];
  }

  return data.map((content) => ({
    ...content,
    image_url: content.image_public_url,
    audio_url: content.audio_public_url,
    video_url: content.video_public_url,
  }));
}

export default async function BancoSonoroPage({ searchParams }) {
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const contents = await fetchPublicContents({ q });

  return (
    <main>
      <NavClient />

      <section className="pt-24 md:pt-28 pb-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
            <div>
              <SectionHeading
                title="Banco Sonoro"
                subtitle="Explora contenidos publicados. Usa los filtros para navegar por tipo de contenido."
                align="left"
              />
            </div>
            <form action="/banco-sonoro" className="w-full md:w-auto">
              <div className="flex gap-2">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar por título, región o descripción..."
                  className="w-full md:w-[420px] rounded-2xl bg-grisClaro px-4 py-3 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-turquesaAudioBrand"
                />
                <button
                  type="submit"
                  className="rounded-full bg-turquesaAudioBrand px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:brightness-110 transition"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>

          {q ? (
            <div className="mt-6 rounded-2xl bg-grisClaro p-4 ring-1 ring-black/5">
              <span className="text-sm text-gray-700">
                Mostrando resultados para: <span className="font-bold text-azulInstitucional">{q}</span>
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pb-16 bg-grisClaro">
        <div className="container mx-auto px-4">
          <div className="py-10">
            <ExploreSection contents={contents} />
          </div>
        </div>
      </section>
    </main>
  );
}
