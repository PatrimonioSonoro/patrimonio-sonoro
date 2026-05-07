import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../../../lib/supabaseServer";

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

async function assertIsAdmin(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized - Missing Bearer token" };
  }

  const token = authHeader.slice(7);
  const userClient = createClient(getSupabaseUrl(), getAnonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes?.user) {
    return { ok: false, status: 401, error: "Unauthorized - invalid token" };
  }

  const uid = userRes.user.id;
  const { data: isAdmin, error: adminErr } = await userClient.rpc("is_admin", { uid });
  if (adminErr || !isAdmin) {
    return { ok: false, status: 403, error: "Forbidden - Admin role required" };
  }

  return { ok: true, user: userRes.user, userClient };
}

async function readFileEntry(entry) {
  if (!entry) return null;
  const name = entry.name || "file";
  const contentType = entry.type || "application/octet-stream";
  const arrayBuffer = await entry.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return { name, buffer, contentType };
}

function buildAudioPath({ albumId, songId, fileName }) {
  const ext = String(fileName).includes(".") ? String(fileName).split(".").pop() : "bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return `albums/audios/${albumId}/${songId}/${safeName}`;
}

function normalizeDuration(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.trunc(n);
}

export async function PATCH(req, { params }) {
  try {
    const songId = params?.id;
    if (!songId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const authHeader = req.headers.get("authorization");
    const adminRes = await assertIsAdmin(authHeader);
    if (!adminRes.ok) {
      return NextResponse.json({ error: adminRes.error }, { status: adminRes.status });
    }

    const form = await req.formData();

    const title = form.get("title");
    const artist = form.get("artist");
    const duration = form.get("duration");

    const composition_lyrics = form.get("composition_lyrics");
    const production_engineering = form.get("production_engineering");
    const producer = form.get("producer");
    const mastering_engineer = form.get("mastering_engineer");
    const performers = form.get("performers");
    const sources = form.get("sources");

    const audioEntry = form.get("audio");

    const dbClient = supabaseAdmin || adminRes.userClient;

    const { data: existing, error: existingErr } = await dbClient
      .from("songs")
      .select("id, album_id")
      .eq("id", songId)
      .single();

    if (existingErr || !existing) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const patch = {};
    if (title !== null) patch.title = String(title);
    if (artist !== null) patch.artist = String(artist);
    if (duration !== null) patch.duration = normalizeDuration(duration);

    if (audioEntry && audioEntry.size) {
      const fileObj = await readFileEntry(audioEntry);
      const audio_path = buildAudioPath({ albumId: existing.album_id, songId, fileName: fileObj.name });

      const storageClient = supabaseAdmin || adminRes.userClient;
      const { error: uploadErr } = await storageClient.storage
        .from("contenido")
        .upload(audio_path, fileObj.buffer, {
          upsert: true,
          contentType: fileObj.contentType,
        });

      if (uploadErr) {
        return NextResponse.json({ error: "Storage upload error" }, { status: 500 });
      }

      patch.audio_path = audio_path;
    }

    if (Object.keys(patch).length) {
      const { error: songUpdateErr } = await dbClient.from("songs").update(patch).eq("id", songId);
      if (songUpdateErr) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    const creditsPatch = {};
    if (composition_lyrics !== null) creditsPatch.composition_lyrics = composition_lyrics ? String(composition_lyrics) : null;
    if (production_engineering !== null) creditsPatch.production_engineering = production_engineering ? String(production_engineering) : null;
    if (producer !== null) creditsPatch.producer = producer ? String(producer) : null;
    if (mastering_engineer !== null) creditsPatch.mastering_engineer = mastering_engineer ? String(mastering_engineer) : null;
    if (performers !== null) creditsPatch.performers = performers ? String(performers) : null;
    if (sources !== null) creditsPatch.sources = sources ? String(sources) : null;

    if (Object.keys(creditsPatch).length) {
      const { error: creditsErr } = await dbClient
        .from("song_credits")
        .upsert({ song_id: songId, ...creditsPatch }, { onConflict: "song_id" });

      if (creditsErr) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const songId = params?.id;
    if (!songId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const authHeader = req.headers.get("authorization");
    const adminRes = await assertIsAdmin(authHeader);
    if (!adminRes.ok) {
      return NextResponse.json({ error: adminRes.error }, { status: adminRes.status });
    }

    const dbClient = supabaseAdmin || adminRes.userClient;
    const { error: delErr } = await dbClient.from("songs").delete().eq("id", songId);

    if (delErr) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
