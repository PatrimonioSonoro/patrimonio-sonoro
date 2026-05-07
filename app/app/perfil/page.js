"use client";

import PrivatePageHeader from "../../components/PrivatePageHeader";
import UsuarioPage from "../../usuario/page";
import { supabase } from "../../../lib/supabaseClient";
import { useEffect, useMemo, useRef, useState } from "react";

function IconSpark({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l.6 2.6L22 16l-2.4.4L19 19l-.6-2.6L16 16l2.4-.4L19 13z" />
    </svg>
  );
}

function IconGrid({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}

function IconHeart({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconHeadphones({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0116 0v6a2 2 0 01-2 2h-2v-7h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 18a2 2 0 002 2h2v-7H4v5z" />
    </svg>
  );
}

export default function PerfilPage() {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [stats, setStats] = useState({ estrategias: 0, favSongs: 0, favAlbums: 0 });

  const initials = useMemo(() => {
    const base = (nombreCompleto || user?.email || "Usuario").trim();
    const parts = base.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "U";
    const b = parts.length > 1 ? parts[1]?.[0] : "";
    return (a + b).toUpperCase();
  }, [nombreCompleto, user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session?.user) throw new Error("Sesión requerida");
        if (!mounted) return;

        setUser(session.user);

        const metaNombre = session.user.user_metadata?.nombre_completo || "";
        const metaAvatar = session.user.user_metadata?.avatar_url || "";

        setAvatarUrl(typeof metaAvatar === "string" ? metaAvatar : "");

        try {
          const { data: perfil } = await supabase
            .from("usuarios")
            .select("nombre_completo")
            .eq("user_id", session.user.id)
            .single();
          const finalNombre = perfil?.nombre_completo || metaNombre || session.user.email;
          if (mounted) setNombreCompleto(finalNombre || "");
        } catch (_) {
          if (mounted) setNombreCompleto(metaNombre || session.user.email || "");
        }

        try {
          const token = session.access_token;
          const [{ count }, favSongsRes, favAlbumsRes] = await Promise.all([
            supabase.from("contenidos").select("id", { count: "exact", head: true }).eq("status", "published"),
            fetch("/api/favorites/songs", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => (r.ok ? r.json() : { song_ids: [] })),
            fetch("/api/favorites/albums", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => (r.ok ? r.json() : { album_ids: [] })),
          ]);

          if (mounted) {
            setStats({
              estrategias: typeof count === "number" ? count : 0,
              favSongs: Array.isArray(favSongsRes?.song_ids) ? favSongsRes.song_ids.length : 0,
              favAlbums: Array.isArray(favAlbumsRes?.album_ids) ? favAlbumsRes.album_ids.length : 0,
            });
          }
        } catch (_) {}
      } catch (e) {
        if (mounted) setError(e?.message || "Error cargando perfil");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onPickAvatar = () => {
    setError("");
    fileRef.current?.click();
  };

  const onSignOut = async () => {
    setError("");
    try {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") window.location.href = "/";
    } catch (e) {
      setError(e?.message || "No se pudo cerrar sesión");
    }
  };

  const onAvatarSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError("");
    setSaving(true);
    try {
      if (!file.type?.startsWith("image/")) {
        throw new Error("Por favor selecciona una imagen (jpg, png, webp). ");
      }

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `avatars/${user.id}/${Date.now()}.${safeExt}`;

      const { error: uploadErr } = await supabase
        .storage
        .from("contenido")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!baseUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
      const publicUrl = `${baseUrl}/storage/v1/object/public/contenido/${path}`;

      const { data: updated, error: updateErr } = await supabase.auth.updateUser({
        data: {
          ...(user.user_metadata || {}),
          avatar_url: publicUrl,
        },
      });

      if (updateErr) throw updateErr;
      setAvatarUrl(publicUrl);
      setUser(updated?.user || user);
    } catch (err) {
      setError(err?.message || "No se pudo actualizar la foto de perfil");
    } finally {
      setSaving(false);
      try {
        e.target.value = "";
      } catch {}
    }
  };

  return (
    <main>
      <PrivatePageHeader
        title="Perfil"
        subtitle="Gestiona tu cuenta y revisa tu contenido."
      />

      <section className="relative py-10 bg-gray-50 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl" style={{ background: "rgba(0,184,169,0.14)" }} />
          <div className="absolute -bottom-40 -left-28 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(0,45,98,0.14)" }} />
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(900px 320px at 20% 10%, rgba(255,255,255,0.70), transparent 60%)" }} />
        </div>
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">Cargando perfil...</div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-white p-6 text-red-600 shadow-sm">{error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div
                  className="rounded-3xl border border-white/30 bg-white/75 p-6 shadow-sm backdrop-blur"
                  style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.10)" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Foto de perfil"
                          className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover ring-1 ring-black/10 shadow-sm"
                        />
                      ) : (
                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-azulInstitucional text-white grid place-items-center font-extrabold text-2xl ring-1 ring-black/10 shadow-sm">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-azulInstitucional/5 px-3 py-1 text-xs font-extrabold text-azulInstitucional ring-1 ring-azulInstitucional/10">
                        <IconSpark className="h-4 w-4" />
                        IDENTIDAD CULTURAL
                      </div>
                      <div className="mt-3 text-lg font-extrabold text-azulInstitucional truncate">
                        {nombreCompleto || "Usuario"}
                      </div>
                      <div className="mt-1 text-sm text-gray-600 truncate">{user?.email}</div>
                      <div className="mt-3 text-xs text-gray-500">
                        Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={onAvatarSelected}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={onPickAvatar}
                      disabled={saving}
                      className="inline-flex w-full items-center justify-center rounded-full bg-turquesaAudioBrand px-5 py-3 text-sm font-extrabold text-white hover:brightness-110 transition disabled:opacity-60"
                    >
                      {saving ? "Actualizando..." : "Cambiar foto"}
                    </button>

                    {error ? (
                      <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                        {error}
                      </div>
                    ) : null}

                    <p className="mt-3 text-xs text-gray-500">
                      Recomendado: imagen cuadrada, mínimo 256×256.
                    </p>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={onSignOut}
                        className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-extrabold text-azulInstitucional ring-1 ring-gray-200 hover:bg-gray-50 transition"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-white/30 bg-white/75 p-5 shadow-sm backdrop-blur" style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.08)" }}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-gray-500">Estrategias</div>
                      <div className="h-9 w-9 rounded-2xl bg-turquesaAudioBrand/10 text-turquesaAudioBrand grid place-items-center ring-1 ring-turquesaAudioBrand/15">
                        <IconGrid className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 text-2xl font-extrabold text-azulInstitucional">{stats.estrategias}</div>
                    <div className="mt-1 text-xs text-gray-600">Materiales disponibles</div>
                  </div>

                  <div className="rounded-3xl border border-white/30 bg-white/75 p-5 shadow-sm backdrop-blur" style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.08)" }}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-gray-500">Favoritos</div>
                      <div className="h-9 w-9 rounded-2xl bg-[#FFD166]/20 text-[#A06A00] grid place-items-center ring-1 ring-[#FFD166]/30">
                        <IconHeart className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 text-2xl font-extrabold text-azulInstitucional">{stats.favSongs}</div>
                    <div className="mt-1 text-xs text-gray-600">Canciones guardadas</div>
                  </div>

                  <div className="rounded-3xl border border-white/30 bg-white/75 p-5 shadow-sm backdrop-blur" style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.08)" }}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-gray-500">Álbumes</div>
                      <div className="h-9 w-9 rounded-2xl bg-azulInstitucional/10 text-azulInstitucional grid place-items-center ring-1 ring-azulInstitucional/15">
                        <IconHeadphones className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 text-2xl font-extrabold text-azulInstitucional">{stats.favAlbums}</div>
                    <div className="mt-1 text-xs text-gray-600">Álbumes guardados</div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/30 bg-white/75 p-6 shadow-sm backdrop-blur" style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.08)" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-azulInstitucional">Tu cuenta</h2>
                      <p className="mt-1 text-sm text-gray-600">Información básica asociada a tu sesión.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-extrabold text-gray-500">Nombre</div>
                      <div className="mt-1 text-sm font-bold text-gray-900 break-words">
                        {nombreCompleto || "-"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-extrabold text-gray-500">Correo</div>
                      <div className="mt-1 text-sm font-bold text-gray-900 break-words">
                        {user?.email || "-"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-extrabold text-gray-500">Registro</div>
                      <div className="mt-1 text-sm font-bold text-gray-900 break-words">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/30 bg-white/75 p-6 shadow-sm backdrop-blur" style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.08)" }}>
                  <div className="rounded-2xl bg-gray-50 p-5 ring-1 ring-black/5">
                    <div className="text-sm font-extrabold text-azulInstitucional">Consejos</div>
                    <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                      Mantén tu perfil actualizado para que tu participación en campañas y contenidos sea más visible.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
