import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function useDashboardData() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [recentSounds, setRecentSounds] = useState([]);
  const [stats, setStats] = useState({ estrategiasCount: 0, favoritosCount: 0 });
  const [campesenaAlbum, setCampesenaAlbum] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!mounted) return;

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        setUser(session.user);

        try {
          const { data: perfil } = await supabase
            .from("usuarios")
            .select("nombre_completo")
            .eq("user_id", session.user.id)
            .single();
          const nombreFinal =
            perfil?.nombre_completo || session.user.user_metadata?.nombre_completo || session.user.email;
          if (mounted) setNombre(nombreFinal);
        } catch (_) {
          if (mounted) setNombre(session.user.user_metadata?.nombre_completo || session.user.email);
        }

        try {
          const { data: sounds } = await supabase
            .from("contenidos")
            .select("id,title,region,created_at,image_public_url")
            .eq("status", "published")
            .not("image_public_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(6);

          if (!mounted) return;
          setRecentSounds(Array.isArray(sounds) ? sounds : []);
        } catch (_) {
          if (mounted) setRecentSounds([]);
        }

        try {
          const { count: estrategiasCount } = await supabase
            .from("contenidos")
            .select("id", { count: "exact", head: true })
            .eq("status", "published")
            .not("image_public_url", "is", null);

          const { count: favoritosCount } = await supabase
            .from("song_favorites")
            .select("song_id", { count: "exact", head: true })
            .eq("user_id", session.user.id);

          if (!mounted) return;
          setStats({
            estrategiasCount: estrategiasCount || 0,
            favoritosCount: favoritosCount || 0,
          });
        } catch (_) {
          if (mounted) setStats({ estrategiasCount: 0, favoritosCount: 0 });
        }

        try {
          const { data: albumRows, error: albumErr } = await supabase
            .from("albums")
            .select("id,title,description,cover_image_path,created_at")
            .ilike("title", "CampeSENA")
            .order("created_at", { ascending: false })
            .limit(1);

          if (albumErr) throw albumErr;
          const album = albumRows?.[0] || null;

          let songsCount = 0;
          if (album?.id) {
            const { count } = await supabase
              .from("songs")
              .select("id", { count: "exact", head: true })
              .eq("album_id", album.id);
            songsCount = count || 0;
          }

          if (!mounted) return;
          setCampesenaAlbum(album ? { ...album, songsCount } : null);
        } catch (_) {
          if (mounted) setCampesenaAlbum(null);
        }
      } catch (_) {
        if (!mounted) return;
        router.replace("/login");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return { user, nombre, recentSounds, stats, campesenaAlbum };
}
