import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
}

export async function GET(_req, { params }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = createClient(getSupabaseUrl(), getAnonKey(), {
      auth: { persistSession: false },
    });

    const { data: album, error: albumErr } = await supabase
      .from("albums")
      .select("id,title,description,cover_image_path,created_at")
      .eq("id", id)
      .single();

    if (albumErr || !album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const { data: songs, error: songsErr } = await supabase
      .from("songs")
      .select("id,album_id,title,artist,audio_path,duration,created_at")
      .eq("album_id", id)
      .order("created_at", { ascending: true });

    if (songsErr) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const songIds = (songs || []).map((s) => s.id);
    let creditsBySongId = {};

    if (songIds.length) {
      const { data: credits, error: creditsErr } = await supabase
        .from("song_credits")
        .select(
          "id,song_id,composition_lyrics,production_engineering,producer,mastering_engineer,performers,sources,created_at"
        )
        .in("song_id", songIds);

      if (creditsErr) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      creditsBySongId = Object.fromEntries((credits || []).map((c) => [c.song_id, c]));
    }

    const songsWithCredits = (songs || []).map((s) => ({
      ...s,
      credits: creditsBySongId[s.id] || null,
    }));

    return NextResponse.json({ album, songs: songsWithCredits }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
