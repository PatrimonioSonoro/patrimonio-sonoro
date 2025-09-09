"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { clearAuthStorage } from '../../lib/authUtils';

/**
 * Página de usuario con URLs públicas directas
 * - 3 secciones: Imágenes, Videos, Audios
 * - Obtiene contenidos desde /api/usuario/contents
 * - Usa URLs públicas directas (no más signed URLs)
 * - Renderiza media con controles adecuados
 */

export default function UsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (!session) throw new Error('Sesión requerida');
        const token = session.access_token;

  const res = await fetch('/api/usuario/contents', {
          headers: { Authorization: `Bearer ${token}` },
        });
  // Debug: log raw response for inspection in browser console
  try { const clone = await res.clone().json().catch(() => null); console.debug('DEBUG /api/usuario/contents response', { status: res.status, body: clone }); } catch (e) { console.debug('DEBUG /api/usuario/contents non-json response', { status: res.status }); }
        if (!res.ok) throw new Error('No se pudo obtener contenidos');
        const json = await res.json();
        const contents = json.contents || [];

        // URLs are already public URLs from database
        const contentsWithUrls = contents;

        // Build grouped lists
        const imgs = [];
        const vids = [];
        const auds = [];

        contentsWithUrls.forEach(c => {
          const item = {
            id: c.id,
            title: c.title,
            description: c.description,
            image: c.image_public_url,
            video: c.video_public_url,
            audio: c.audio_public_url,
            raw: c,
          };

          if (item.image) imgs.push(item);
          if (item.video) vids.push(item);
          if (item.audio) auds.push(item);
        });

        if (!mounted) return;
        setImages(imgs);
        setVideos(vids);
        setAudios(auds);
      } catch (err) {
        console.error('Error cargando contenidos:', err);
        if (mounted) setError(err.message || 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [router]);

  async function handleLogout() {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    try { clearAuthStorage(); } catch (e) {}
    try { router.replace('/'); } catch (e) { if (typeof window !== 'undefined') window.location.href = '/'; }
  }

  if (loading) return <div className="p-8">Cargando contenidos...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Explora los Sonidos</h1>
          <p className="text-gray-600">Tus imágenes, videos y audios</p>
        </div>
        <div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded">Cerrar sesión</button>
        </div>
      </div>

      <Section title="Imágenes" items={images} renderItem={(it) => (
        <div key={it.id} className="p-3 bg-white rounded shadow">
          <div className="h-48 w-full overflow-hidden rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt={it.title || 'Imagen'} className="w-full h-full object-cover" />
          </div>
          <h3 className="mt-2 font-semibold">{it.title}</h3>
          <p className="text-sm text-gray-600">{it.description}</p>
        </div>
      )} />

      <Section title="Videos" items={videos} renderItem={(it) => (
        <div key={it.id} className="p-3 bg-white rounded shadow">
          <video controls className="w-full rounded" preload="metadata" crossOrigin="anonymous">
            <source src={it.video} type="video/mp4" />
            Tu navegador no soporta reproducción de video.
          </video>
          <h3 className="mt-2 font-semibold">{it.title}</h3>
          <p className="text-sm text-gray-600">{it.description}</p>
        </div>
      )} />

      <Section title="Audios" items={audios} renderItem={(it) => (
        <div key={it.id} className="p-3 bg-white rounded shadow">
          <h3 className="font-semibold">{it.title}</h3>
          <p className="text-sm text-gray-600">{it.description}</p>
          <audio controls className="w-full mt-2" preload="none" crossOrigin="anonymous">
            <source src={it.audio} type="audio/mpeg" />
            Tu navegador no soporta reproducción de audio.
          </audio>
        </div>
      )} />

    </div>
  );
}

function Section({ title, items, renderItem }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title} ({items.length})</h2>
      {items.length === 0 ? (
        <div className="text-gray-600">No hay elementos en esta sección.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(renderItem)}
        </div>
      )}
    </section>
  );
}
