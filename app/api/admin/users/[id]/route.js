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

export async function DELETE(req, { params }) {
  try {
    const auth = req.headers.get('authorization');
    const adminCheck = await assertIsAdmin(auth);
    if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: 403 });

    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

    // Prevent deleting self
    if (id === adminCheck.user.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });

    const adminClient = createClient(getSupabaseUrl(), getServiceRoleKey());

    // Fetch previous row for logging
    const { data: prevRow } = await adminClient.from('usuarios').select('user_id, role, is_active').eq('user_id', id).single();

    // Delete auth user (this will cascade delete in usuarios if FK on user_id is set to CASCADE)
    const { error: delErr } = await adminClient.auth.admin.deleteUser(id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

    // If usuarios row still exists (in case FK not cascade), delete it
    await adminClient.from('usuarios').delete().eq('user_id', id);

    // Log deletion
    await adminClient.from('user_status_logs').insert({
      admin_id: adminCheck.user.id,
      target_user_id: id,
      prev_role: prevRow?.role ?? null,
      new_role: null,
      prev_active: prevRow?.is_active ?? null,
      new_active: null,
      reason: 'Eliminación de usuario',
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
