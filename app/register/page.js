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
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="relative overflow-hidden px-6 pb-10 pt-14 sm:px-10 lg:px-12 lg:pb-14 lg:pt-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-turquesaAudioBrand/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-azulInstitucional/15 blur-3xl" />
            <div className="absolute left-1/2 top-20 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
          </div>

          <div className="relative">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-azulInstitucional backdrop-blur hover:bg-white"
            >
              <span className="text-turquesaAudioBrand">←</span>
              Volver al inicio
            </a>

            <div className="mt-10">
              <div className="inline-flex items-center rounded-full bg-azulInstitucional/5 px-4 py-2 text-xs font-extrabold tracking-wide text-azulInstitucional ring-1 ring-azulInstitucional/10">
                Únete a la comunidad
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-azulInstitucional sm:text-4xl">
                Crea tu cuenta y haz parte de la memoria sonora
              </h1>
              <p className="mt-4 max-w-xl text-base text-gray-700">
                Regístrate para construir tu perfil cultural, explorar estrategias, guardar favoritos y descubrir el Álbum
                CampeSENA.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Perfil cultural</div>
                  <div className="mt-1 text-sm text-gray-600">Tu identidad, foto y estadísticas en un solo lugar.</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Estrategias</div>
                  <div className="mt-1 text-sm text-gray-600">Imágenes y materiales organizados por estrategia.</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Favoritos</div>
                  <div className="mt-1 text-sm text-gray-600">Guarda canciones y vuelve a ellas cuando quieras.</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Álbum CampeSENA</div>
                  <div className="mt-1 text-sm text-gray-600">Explora el álbum destacado y guarda tus preferidos.</div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-start">
              <img
                src="/images/logo_footer.png"
                alt="Patrimonio Sonoro"
                className="h-auto w-full max-w-[420px] opacity-95"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 pb-14 pt-6 sm:px-10 lg:px-12 lg:py-16">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-azulInstitucional">Crear cuenta</h2>
                <p className="mt-1 text-sm text-gray-600">Completa tus datos para comenzar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-extrabold text-azulInstitucional">Nombre completo</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-turquesaAudioBrand/60 focus:ring-4 focus:ring-turquesaAudioBrand/15"
                    placeholder="Nombre y apellido"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-azulInstitucional">Correo electrónico</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-turquesaAudioBrand/60 focus:ring-4 focus:ring-turquesaAudioBrand/15"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-azulInstitucional">Contraseña</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-turquesaAudioBrand/60 focus:ring-4 focus:ring-turquesaAudioBrand/15"
                    placeholder="Crea una contraseña"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-azulInstitucional">Confirmar contraseña</label>
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type="password"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-turquesaAudioBrand/60 focus:ring-4 focus:ring-turquesaAudioBrand/15"
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full rounded-xl bg-turquesaAudioBrand px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
              </form>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <div className="font-extrabold text-azulInstitucional">Requisitos de contraseña</div>
                <div className="mt-1">Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números.</div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <a href="/login" className="text-sm font-extrabold text-azulInstitucional hover:text-turquesaAudioBrand">
                  Ya tengo cuenta
                </a>
                <a href="/login" className="text-sm font-extrabold text-gray-600 hover:text-azulInstitucional">
                  Ir al login
                </a>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white/60 p-4 text-sm text-gray-700 backdrop-blur">
              <span className="font-extrabold text-azulInstitucional">Importante:</span> Te enviaremos un correo para
              confirmar tu cuenta antes de ingresar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
