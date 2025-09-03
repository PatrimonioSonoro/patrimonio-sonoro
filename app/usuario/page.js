"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { clearAuthStorage } from '../../lib/authUtils';

export default function UsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [user, setUser] = useState(null);
  const [roleLabel, setRoleLabel] = useState('Usuario');

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Try to read the current session. If Supabase hasn't initialized
      // storage yet (race on reload), wait a short time for an auth event
      // before concluding there is no session. This preserves user content
      // on page refresh when the client initializes slightly later.
      let session = null;
      try {
        const { data } = await supabase.auth.getSession();
        session = data?.session ?? null;
      } catch (e) {
        session = null;
      }

      if (!session) {
        // Wait up to 2s for an onAuthStateChange SIGNED_IN event.
        session = await new Promise((resolve) => {
          let resolved = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(null);
            }
          }, 2000);

          const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !resolved) {
              resolved = true;
              clearTimeout(timeout);
              try { sub?.subscription?.unsubscribe?.(); } catch (_) {}
              resolve(s);
            }
          });
        });
      }

      if (!session) {
        setError('Sesión requerida');
        setLoading(false);
        return;
      }

      // Ensure the current user has 'user' role; otherwise redirect away
      try {
        if (session?.user?.id) {
          const { data: isUser, error: roleErr } = await supabase.rpc('is_user', { uid: session.user.id });
          if (roleErr) {
            console.error('is_user RPC error:', roleErr);
          }
          if (!isUser) {
            // Not a regular user: prevent access to this page
            setError('Acceso restringido');
            setLoading(false);
            if (typeof window !== 'undefined') router.replace('/');
            return;
          }
        }
      } catch (e) {
        console.error('Role check failed:', e);
      }

      // fetch user profile
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (mounted) setUser(userData?.user ?? null);

        // optionally check role via RPC is_user
        if (userData?.user?.id) {
          try {
            const { data: isUser } = await supabase.rpc('is_user', { uid: userData.user.id });
            if (mounted && isUser) setRoleLabel('Usuario');
          } catch (_) {
            // ignore
          }
        }
      } catch (e) {
        console.error('Error fetching user:', e);
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

  async function handleLogout() {
    try {
      // Ask Supabase to sign out; this will trigger the auth state change.
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error calling supabase.auth.signOut():', e);
    }

    try {
      // Ensure local auth artifacts are removed
      clearAuthStorage();
    } catch (e) {
      console.error('Error clearing local auth storage:', e);
    }

    // Use Next router replace for a client-side redirect without full reload
    try {
      router.replace('/');
    } catch (e) {
      // Fallback to full reload redirect
      if (typeof window !== 'undefined') window.location.href = '/';
    }
  }

  if (loading) return <div className="p-8">Cargando contenidos...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Explora los Sonidos</h1>
          <p className="text-gray-600">Descubre los audios de Patrimonio Sonoro</p>
        </div>
        <div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cerrar sesión</button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar sonidos..." className="border p-3 rounded-md flex-1" />
        <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} className="border p-3 rounded-md">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {contents.length === 0 ? (
        <div className="text-gray-600">No hay contenidos publicados aún.</div>
      ) : (
        <div className="sound-grid">
          {contents.map((c, idx) => (
            <SoundCard key={c.id} content={c} index={idx} />
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

function SoundCard({ content, index }) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);

  const src = content.audio_public_url || content.audio_signed_url || content.file_url;

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);

    return () => {
      try {
        el.removeEventListener('play', onPlay);
        el.removeEventListener('pause', onPause);
        el.removeEventListener('ended', onEnded);
        el.pause();
        el.onended = null;
      } catch (e) {
        // element might be already removed
      }
      setPlaying(false);
    };
  }, []);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      try { el.pause(); } catch (e) { /* ignore */ }
      return;
    }

    // pause other audios; their own listeners will update their playing state
    document.querySelectorAll('audio').forEach(a => { if (a !== el) { try { a.pause(); } catch (_) {} } });

    try {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          // play started
        }).catch(err => {
          // handle AbortError gracefully (media removed, navigation, etc.)
          if (err && err.name === 'AbortError') {
            // ignore expected aborts
            console.warn('Audio play aborted (ignored)');
          } else {
            console.error('Error playing audio', err);
          }
          try { el.pause(); } catch (_) {}
        });
      }
    } catch (err) {
      // defensive: ignore play errors
      console.error('Play error', err);
    }
  }

  const headerGradients = [
    'linear-gradient(135deg,#1F6B8A,#1FA3A3)',
    'linear-gradient(135deg,#C0392B,#E74C3C)',
    'linear-gradient(135deg,#16A085,#2ECC71)',
    'linear-gradient(135deg,#9B59B6,#8E44AD)'
  ];

  const headerStyle = { background: headerGradients[index % headerGradients.length] };

  return (
    <div className="sound-card">
      <div className="sound-card-header" style={headerStyle} onClick={togglePlay}>
        <div className={`play-button ${playing ? 'playing' : ''}`} aria-hidden>▶</div>
      </div>
      <div className="sound-card-body">
        <div className="flex justify-between items-start">
          <span className="sound-badge">{content.region || 'Sin región'}</span>
          <span className="text-sm text-gray-500">{content.duration || ''}</span>
        </div>
        <h3 className="sound-title">{content.title}</h3>
        <p className="sound-desc">{content.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="author-chip">{(content.author_initials) || (content.user_initials) || (content.author?.slice?.(0,2) || (content.user?.slice?.(0,2) || 'U'))}</div>
            <div className="text-sm text-gray-600">{content.author_name || content.user_name || content.owner_email || ''}</div>
          </div>
          <div className="text-sm text-gray-600">{content.rating ? `★ ${content.rating}` : ''}</div>
        </div>

        <audio ref={audioRef} src={src} preload="none" />
      </div>
    </div>
  );
}
