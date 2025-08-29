"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirigir si ya está autenticado
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.push('/dashboard');
    });
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = /confirm/i.test(error.message)
        ? 'Tu correo aún no ha sido verificado. Revisa tu bandeja y carpeta de spam.'
        : error.message || 'Credenciales inválidas';
      return Swal.fire('Error', msg, 'error');
    }
    // AuthProvider se encargará del mensaje de bienvenida y redirección a /dashboard
  }

  return (
    <div style={{ maxWidth: 680, margin: '28px auto', padding: 18 }}>
      <h1>Iniciar sesión - Patrimonio Sonoro</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <label>Correo electrónico</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: 8 }} />
        </div>
        <button disabled={loading} type="submit" style={{ padding: '10px 14px' }}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <button onClick={async () => {
          const res = await Swal.fire({ title: 'Cerrar sesión', text: '¿Deseas cerrar la sesión?', showCancelButton: true });
          if (res.isConfirmed) {
            await supabase.auth.signOut();
            Swal.fire('Listo', 'Has cerrado sesión', 'success');
            router.push('/');
          }
        }} style={{ marginTop: 12 }}>Cerrar sesión</button>
      </div>
    </div>
  );
}
