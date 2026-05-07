import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

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

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const adminRes = await assertIsAdmin(authHeader);
    if (!adminRes.ok) {
      return NextResponse.json({ error: adminRes.error }, { status: adminRes.status });
    }

    const form = await req.formData();

    const album_id = form.get("album_id") || null;
    const title = form.get("title") || null;
    const artist = form.get("artist") || null;
    const duration = normalizeDuration(form.get("duration"));

    const composition_lyrics = form.get("composition_lyrics") || null;
    const production_engineering = form.get("production_engineering") || null;
    const producer = form.get("producer") || null;
    const mastering_engineer = form.get("mastering_engineer") || null;
    const performers = form.get("performers") || null;
    const sources = form.get("sources") || null;

    const audioEntry = form.get("audio");

    if (!album_id) return NextResponse.json({ error: "Missing album_id" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });
    if (!artist) return NextResponse.json({ error: "Missing artist" }, { status: 400 });
    if (!audioEntry || !audioEntry.size) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const dbClient = supabaseAdmin || adminRes.userClient;

    const { data: albumRow, error: albumErr } = await dbClient
      .from("albums")
      .select("id")
      .eq("id", album_id)
      .single();

    if (albumErr || !albumRow) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const songId = crypto.randomUUID();
    const fileObj = await readFileEntry(audioEntry);
    const audio_path = buildAudioPath({ albumId: album_id, songId, fileName: fileObj.name });

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

    const { data: songRow, error: songErr } = await dbClient
      .from("songs")
      .insert({
        id: songId,
        album_id,
        title,
        artist,
        audio_path,
        duration,
      })
      .select("id")
      .single();

    if (songErr) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const { error: creditsErr } = await dbClient.from("song_credits").insert({
      song_id: songRow.id,
      composition_lyrics,
      production_engineering,
      producer,
      mastering_engineer,
      performers,
      sources,
    });

    if (creditsErr) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ id: songRow.id, success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
