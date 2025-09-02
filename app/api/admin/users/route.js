import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return key;
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return key;
}

async function assertIsAdmin(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return { ok: false, error: 'Missing bearer token' };
  const token = authHeader.slice(7);
  const supabase = createClient(getSupabaseUrl(), getAnonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) return { ok: false, error: 'Invalid user' };
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', { uid: userRes.user.id });
  if (adminErr || !isAdmin) return { ok: false, error: 'Forbidden' };
  return { ok: true, user: userRes.user };
}

export async function POST(req) {
  try {
    const auth = req.headers.get('authorization');
    const adminCheck = await assertIsAdmin(auth);
    if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { email, password, nombre_completo, role = 'user', is_active = true } = body || {};
    if (!email) return NextResponse.json({ error: 'email requerido' }, { status: 400 });

    const adminClient = createClient(getSupabaseUrl(), getServiceRoleKey());

    let createdUser = null;
    if (password) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre_completo },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      createdUser = data.user;
    } else {
      // Si no hay password, enviar invitación por correo
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { nombre_completo },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      createdUser = data.user;
    }

    // Asegurar fila en public.usuarios y setear role/is_active
    if (createdUser?.id) {
      const dbClient = createClient(getSupabaseUrl(), getServiceRoleKey(), { auth: { persistSession: false } });
      await dbClient.from('usuarios').upsert({
        user_id: createdUser.id,
        correo_electronico: createdUser.email,
        nombre_completo: nombre_completo ?? createdUser.email,
        role,
        is_active,
      }, { onConflict: 'user_id' });

      // Log
      await dbClient.from('user_status_logs').insert({
        admin_id: adminCheck.user.id,
        target_user_id: createdUser.id,
        prev_role: null,
        new_role: role,
        prev_active: null,
        new_active: is_active,
        reason: 'Creación de usuario',
      });
    }

    return NextResponse.json({ id: createdUser?.id, email: createdUser?.email }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
