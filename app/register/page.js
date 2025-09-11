"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

function validateFullName(name) {
  if (!name) return false;
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return false;
  return !/\d/.test(name);
}

function validatePassword(pw) {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(pw);
}

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    // Validaciones cliente
  if (!validateFullName(nombre)) return Swal.fire({ title: 'Error', text: 'Nombre completo inválido (mínimo 2 palabras, sin números)', icon: 'error', zIndex: 20000 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Swal.fire({ title: 'Error', text: 'Correo inválido', icon: 'error', zIndex: 20000 });
  if (!validatePassword(password)) return Swal.fire({ title: 'Error', text: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números', icon: 'error', zIndex: 20000 });
  if (password !== confirm) return Swal.fire({ title: 'Error', text: 'Las contraseñas no coinciden', icon: 'error', zIndex: 20000 });

    setLoading(true);
    // Usar Supabase Auth para crear usuario y enviar correo de confirmación
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo: nombre }, emailRedirectTo: redirectTo },
    });

    setLoading(false);
    if (error) {
      const msg =
        /duplicate key/i.test(error.message) ? 'El correo ya está registrado' :
        /password/i.test(error.message) ? 'La contraseña no cumple los requisitos' :
        error.message || 'Error al registrar';
      return Swal.fire({ title: 'Error', text: msg, icon: 'error', zIndex: 20000 });
    }

    await Swal.fire({ title: 'Registro exitoso', text: 'Revisa tu correo para confirmar la cuenta. Serás redirigido al login.', icon: 'success', zIndex: 20000 });
    router.push('/login');
  }

  return (
    <div style={{ maxWidth: 680, margin: '28px auto', padding: 18 }}>
      <h1>Registro - Patrimonio Sonoro</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Nombre completo</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Correo electrónico</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Confirmar contraseña</label>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required style={{ width: '100%', padding: 8 }} />
        </div>
  <button disabled={loading} type="submit" className="campaign-cta" style={{ padding: '10px 14px' }}>{loading ? 'Registrando...' : 'Registrar'}</button>
      </form>
    </div>
  );
}
