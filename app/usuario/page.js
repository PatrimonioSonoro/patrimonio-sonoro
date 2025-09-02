"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function UsuarioPage() {
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        setError('Sesión requerida');
        setLoading(false);
        return;
      }

      const token = session.access_token;
      try {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        params.set('page', String(page));
        params.set('limit', String(limit));
        const res = await fetch(`/api/usuario/contents?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || 'Error cargando contenidos');
        }
        const json = await res.json();
        if (!mounted) return;
        setContents(json.contents || []);
      } catch (e) {
        setError(e.message || 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [page, search, limit]);

  if (loading) return <div className="p-8">Cargando contenidos...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Contenidos disponibles</h1>

      <div className="flex items-center gap-3 mb-4">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar título o descripción" className="border p-2 rounded-md flex-1" />
        <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} className="border p-2 rounded-md">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {contents.length === 0 ? (
        <div className="text-gray-600">No hay contenidos publicados aún.</div>
      ) : (
        <div className="space-y-4">
          {contents.map((c) => (
            <div key={c.id} className="p-4 border rounded-lg bg-white">
              <h2 className="font-semibold text-lg">{c.title}</h2>
              <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleString()} · {c.region}</div>
              <p className="mt-2 text-gray-700">{c.description}</p>
              <div className="mt-3 space-y-2">
                {c.audio_public_url || c.audio_signed_url ? (
                  <audio controls src={c.audio_public_url || c.audio_signed_url} className="w-full" />
                ) : null}
                {c.image_public_url || c.image_signed_url ? (
                  <img src={c.image_public_url || c.image_signed_url} alt={c.title} className="max-h-48 w-auto rounded" />
                ) : null}
                {c.video_public_url || c.video_signed_url ? (
                  <video controls src={c.video_public_url || c.video_signed_url} className="w-full max-h-64" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-4 py-2 bg-gray-200 rounded">Anterior</button>
        <div>Página {page}</div>
        <button onClick={() => setPage((p) => p + 1)} className="px-4 py-2 bg-gray-200 rounded">Siguiente</button>
      </div>
    </div>
  );
}
