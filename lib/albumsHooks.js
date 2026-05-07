import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

export function useAlbumByTitle(title) {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setAlbum(null);

      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session) {
          throw new Error("No session");
        }

        const { data, error: qErr } = await supabase
          .from("albums")
          .select("id,title,description,cover_image_path,created_at")
          .ilike("title", title)
          .order("created_at", { ascending: false })
          .limit(1);

        if (qErr) throw qErr;
        const row = data?.[0] || null;

        if (!cancelled) setAlbum(row);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [title]);

  return { album, loading, error };
}

export function useAlbumFull(albumId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!albumId) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session) {
          throw new Error("No session");
        }

        const res = await fetch(`/api/albums/${albumId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load album");

        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [albumId]);

  const album = data?.album || null;
  const songs = useMemo(() => data?.songs || [], [data]);

  return { album, songs, loading, error };
}
