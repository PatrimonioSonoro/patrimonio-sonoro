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

function getBearerToken(req) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

async function getAuthedClient(req) {
  const token = getBearerToken(req);
  if (!token) return { ok: false, status: 401, error: "Unauthorized" };

  const userClient = createClient(getSupabaseUrl(), getAnonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes?.user) return { ok: false, status: 401, error: "Unauthorized" };

  return { ok: true, userClient, user: userRes.user };
}

export async function GET(req) {
  try {
    const authed = await getAuthedClient(req);
    if (!authed.ok) return NextResponse.json({ error: authed.error }, { status: authed.status });

    const uid = authed.user.id;
    const { data, error } = await authed.userClient
      .from("song_favorites")
      .select("song_id")
      .eq("user_id", uid);

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });

    return NextResponse.json({ song_ids: (data || []).map((r) => r.song_id) }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authed = await getAuthedClient(req);
    if (!authed.ok) return NextResponse.json({ error: authed.error }, { status: authed.status });

    const body = await req.json().catch(() => null);
    const song_id = body?.song_id ? String(body.song_id) : null;
    const favorite = typeof body?.favorite === "boolean" ? body.favorite : null;

    if (!song_id) {
      return NextResponse.json({ error: "Missing song_id" }, { status: 400 });
    }

    const uid = authed.user.id;

    // If client didn't specify favorite boolean, we toggle.
    if (favorite === null) {
      const { data: existing, error: exErr } = await authed.userClient
        .from("song_favorites")
        .select("song_id")
        .eq("user_id", uid)
        .eq("song_id", song_id)
        .maybeSingle();

      if (exErr) return NextResponse.json({ error: "Database error" }, { status: 500 });

      if (existing) {
        const { error: delErr } = await authed.userClient
          .from("song_favorites")
          .delete()
          .eq("user_id", uid)
          .eq("song_id", song_id);

        if (delErr) return NextResponse.json({ error: "Database error" }, { status: 500 });
        return NextResponse.json({ song_id, favorited: false }, { status: 200 });
      }

      const { error: insErr } = await authed.userClient.from("song_favorites").insert({ user_id: uid, song_id });
      if (insErr) return NextResponse.json({ error: "Database error" }, { status: 500 });
      return NextResponse.json({ song_id, favorited: true }, { status: 200 });
    }

    if (favorite) {
      const { error: upsertErr } = await authed.userClient
        .from("song_favorites")
        .upsert({ user_id: uid, song_id }, { onConflict: "user_id,song_id" });
      if (upsertErr) return NextResponse.json({ error: "Database error" }, { status: 500 });
      return NextResponse.json({ song_id, favorited: true }, { status: 200 });
    }

    const { error: delErr } = await authed.userClient
      .from("song_favorites")
      .delete()
      .eq("user_id", uid)
      .eq("song_id", song_id);

    if (delErr) return NextResponse.json({ error: "Database error" }, { status: 500 });
    return NextResponse.json({ song_id, favorited: false }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
