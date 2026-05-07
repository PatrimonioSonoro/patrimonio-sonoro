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

function buildStoragePath({ albumId, fileName }) {
  const ext = String(fileName).includes(".") ? String(fileName).split(".").pop() : "bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return `albums/covers/${albumId}/${safeName}`;
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const adminRes = await assertIsAdmin(authHeader);
    if (!adminRes.ok) {
      return NextResponse.json({ error: adminRes.error }, { status: adminRes.status });
    }

    const form = await req.formData();
    const title = form.get("title") || null;
    const description = form.get("description") || null;
    const coverEntry = form.get("cover_image");

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const albumId = crypto.randomUUID();

    let cover_image_path = null;
    if (coverEntry && coverEntry.size) {
      const fileObj = await readFileEntry(coverEntry);
      const storagePath = buildStoragePath({ albumId, fileName: fileObj.name });

      const storageClient = supabaseAdmin || adminRes.userClient;
      const { error: uploadErr } = await storageClient.storage
        .from("contenido")
        .upload(storagePath, fileObj.buffer, {
          upsert: true,
          contentType: fileObj.contentType,
        });

      if (uploadErr) {
        return NextResponse.json({ error: "Storage upload error" }, { status: 500 });
      }

      cover_image_path = storagePath;
    }

    const dbClient = supabaseAdmin || adminRes.userClient;
    const { data: row, error: insertErr } = await dbClient
      .from("albums")
      .insert({ id: albumId, title, description, cover_image_path })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ id: row.id, success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
