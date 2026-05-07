import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

function parseNumber(v) {
  const raw = String(v ?? "").trim();
  if (!raw) return NaN;
  const normalized = raw.replace(/\s+/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function isValidLatLng(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

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

function getPublicStorageBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return `${baseUrl}/storage/v1/object/public`;
}

function parseAudioPathFromPublicUrl(publicUrl) {
  if (typeof publicUrl !== "string" || !publicUrl) return null;
  const base = getPublicStorageBaseUrl();
  if (!publicUrl.startsWith(base + "/")) return null;
  const rest = publicUrl.slice((base + "/").length);
  // rest is like: contenido/avatars/... or contenido/mapa-sonoro/...
  const [bucket, ...pathParts] = rest.split("/").filter(Boolean);
  if (!bucket || pathParts.length === 0) return null;
  return { bucket, path: pathParts.join("/") };
}

async function getAuthedUserClient(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return { error: "Unauthorized - Missing Bearer token", status: 401 };

  const token = auth.slice(7);
  const userClient = createClient(getSupabaseUrl(), getAnonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return { error: "Unauthorized - invalid token", status: 401 };

  const uid = userData.user.id;
  const { data: isAdmin, error: adminErr } = await userClient.rpc("is_admin", { uid });
  if (adminErr || !isAdmin) return { error: "Forbidden - Admin role required", status: 403 };

  return { userClient, token, uid };
}

async function unsetPreviousFeatured({ sb, region, excludeId }) {
  let q = sb.from("mapa_sonoro").update({ es_destacado: false }).eq("region", region).eq("es_destacado", true);
  if (excludeId) q = q.neq("id", excludeId);
  await q;
}

export async function GET(req) {
  try {
    const { userClient, error, status } = await getAuthedUserClient(req);
    if (error) return NextResponse.json({ error }, { status });

    const { searchParams } = new URL(req.url);
    const region = (searchParams.get("region") || "").trim();
    const q = (searchParams.get("q") || "").trim();

    let query = userClient
      .from("mapa_sonoro")
      .select("id,titulo,region,audio_url,lat,lng,es_destacado,created_at")
      .order("created_at", { ascending: false });

    if (region) query = query.eq("region", region);
    if (q) query = query.ilike("titulo", `%${q}%`);

    const { data, error: dbErr } = await query;
    if (dbErr) return NextResponse.json({ error: dbErr.message || "DB error" }, { status: 500 });

    return NextResponse.json({ items: data || [] });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authRes = await getAuthedUserClient(req);
    if (authRes.error) return NextResponse.json({ error: authRes.error }, { status: authRes.status });

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Configuración incompleta: falta SUPABASE_SERVICE_ROLE_KEY. No es posible subir audios de Mapa Sonoro sin el cliente admin (Service Role).",
        },
        { status: 503 }
      );
    }

    const sb = supabaseAdmin;

    const form = await req.formData();
    const titulo = String(form.get("titulo") || "").trim();
    const region = String(form.get("region") || "").trim();
    const lat = parseNumber(form.get("lat"));
    const lng = parseNumber(form.get("lng"));
    const esDestacado = String(form.get("es_destacado") || "").toLowerCase();
    const isFeatured = esDestacado === "1" || esDestacado === "true";
    const audio = form.get("audio");

    if (!titulo) return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    if (!region) return NextResponse.json({ error: "La región es obligatoria" }, { status: 400 });
    if (!isValidLatLng(lat, lng)) return NextResponse.json({ error: "Lat/Lng inválidos" }, { status: 400 });

    if (!audio || typeof audio.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Debes subir un archivo de audio" }, { status: 400 });
    }

    if (typeof audio.type === "string" && !audio.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Formato de audio no válido" }, { status: 400 });
    }

    if (isFeatured) {
      await unsetPreviousFeatured({ sb, region });
    }

    const extRaw = String(audio.name || "audio").split(".").pop() || "mp3";
    const safeExt = extRaw.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
    const path = `mapa-sonoro/${crypto.randomUUID()}.${safeExt}`;

    const buf = Buffer.from(await audio.arrayBuffer());
    const { error: upErr } = await sb.storage.from("contenido").upload(path, buf, {
      upsert: true,
      contentType: audio.type || "audio/mpeg",
    });

    if (upErr) return NextResponse.json({ error: upErr.message || "No se pudo subir el audio" }, { status: 500 });

    const publicUrl = `${getPublicStorageBaseUrl()}/contenido/${path}`;

    const { data: inserted, error: insErr } = await sb
      .from("mapa_sonoro")
      .insert({ titulo, region, audio_url: publicUrl, lat, lng, es_destacado: isFeatured })
      .select("id")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message || "No se pudo guardar" }, { status: 500 });
    }

    return NextResponse.json({ id: inserted?.id });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authRes = await getAuthedUserClient(req);
    if (authRes.error) return NextResponse.json({ error: authRes.error }, { status: authRes.status });

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Configuración incompleta: falta SUPABASE_SERVICE_ROLE_KEY. No es posible actualizar audios de Mapa Sonoro sin el cliente admin (Service Role).",
        },
        { status: 503 }
      );
    }

    const sb = supabaseAdmin;

    const form = await req.formData();
    const id = String(form.get("id") || "").trim();
    const titulo = String(form.get("titulo") || "").trim();
    const region = String(form.get("region") || "").trim();
    const lat = parseNumber(form.get("lat"));
    const lng = parseNumber(form.get("lng"));
    const esDestacado = String(form.get("es_destacado") || "").toLowerCase();
    const isFeatured = esDestacado === "1" || esDestacado === "true";
    const audio = form.get("audio");

    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
    if (!titulo) return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    if (!region) return NextResponse.json({ error: "La región es obligatoria" }, { status: 400 });
    if (!isValidLatLng(lat, lng)) return NextResponse.json({ error: "Lat/Lng inválidos" }, { status: 400 });

    if (isFeatured) {
      await unsetPreviousFeatured({ sb, region, excludeId: id });
    }

    let audio_url;
    if (audio && typeof audio.arrayBuffer === "function") {
      if (typeof audio.type === "string" && !audio.type.startsWith("audio/")) {
        return NextResponse.json({ error: "Formato de audio no válido" }, { status: 400 });
      }

      const extRaw = String(audio.name || "audio").split(".").pop() || "mp3";
      const safeExt = extRaw.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
      const path = `mapa-sonoro/${id}/${Date.now()}.${safeExt}`;

      const buf = Buffer.from(await audio.arrayBuffer());
      const { error: upErr } = await sb.storage.from("contenido").upload(path, buf, {
        upsert: true,
        contentType: audio.type || "audio/mpeg",
      });

      if (upErr) return NextResponse.json({ error: upErr.message || "No se pudo subir el audio" }, { status: 500 });

      audio_url = `${getPublicStorageBaseUrl()}/contenido/${path}`;
    }

    const payload = { titulo, region, lat, lng, es_destacado: isFeatured };
    if (audio_url) payload.audio_url = audio_url;

    const { error: upDbErr } = await sb.from("mapa_sonoro").update(payload).eq("id", id);
    if (upDbErr) return NextResponse.json({ error: upDbErr.message || "No se pudo actualizar" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authRes = await getAuthedUserClient(req);
    if (authRes.error) return NextResponse.json({ error: authRes.error }, { status: authRes.status });

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Configuración incompleta: falta SUPABASE_SERVICE_ROLE_KEY. No es posible eliminar audios de Mapa Sonoro sin el cliente admin (Service Role).",
        },
        { status: 503 }
      );
    }

    const sb = supabaseAdmin;

    const { searchParams } = new URL(req.url);
    const id = (searchParams.get("id") || "").trim();
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const { data: row, error: getErr } = await sb
      .from("mapa_sonoro")
      .select("audio_url")
      .eq("id", id)
      .single();

    if (getErr) return NextResponse.json({ error: getErr.message || "No se pudo obtener" }, { status: 500 });

    const { error: delErr } = await sb.from("mapa_sonoro").delete().eq("id", id);
    if (delErr) return NextResponse.json({ error: delErr.message || "No se pudo eliminar" }, { status: 500 });

    const parsed = parseAudioPathFromPublicUrl(row?.audio_url);
    if (parsed?.bucket && parsed?.path) {
      await sb.storage.from(parsed.bucket).remove([parsed.path]);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
