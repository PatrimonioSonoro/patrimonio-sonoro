
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

function safeJoinPath(segments = []) {
  return segments
    .map((s) => String(s || "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

function isValidStoragePath(p) {
  if (!p) return false;
  if (p.includes("..")) return false;
  return true;
}

export async function GET(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const userClient = createClient(getSupabaseUrl(), getAnonKey(), {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pathSegments = Array.isArray(params?.path) ? params.path : [];
    const filePath = safeJoinPath(pathSegments);

    if (!isValidStoragePath(filePath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const { data, error } = await userClient.storage.from("contenido").createSignedUrl(filePath, 60 * 10);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
