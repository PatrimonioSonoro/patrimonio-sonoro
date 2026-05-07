"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      if (data?.session?.user?.id) {
        const uid = data.session.user.id;
        supabase
          .rpc('is_admin', { uid })
          .then(({ data: isAdmin, error }) => {
            if (error) return router.push('/app/dashboard');
            router.push(isAdmin ? '/dashboard' : '/app/dashboard');
          })
          .catch(() => router.push('/app/dashboard'));
      }
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
      return Swal.fire({ title: 'Error', text: msg, icon: 'error', zIndex: 20000 });
    }
    // Mostrar bienvenida inmediatamente (solo una vez) y redirigir según permisos
    try {
      const user = data?.user || data?.session?.user;
      const nombre = user?.user_metadata?.nombre_completo || user?.email || 'Usuario';
  const key = user ? `ps_welcome_shown_${user.id}` : null;
  // show welcome immediately for this login action, then mark it as shown
  await Swal.fire({ title: 'Bienvenido', text: `Hola ${nombre}`, icon: 'success', zIndex: 2147483647 });
  if (typeof window !== 'undefined' && key) window.localStorage.setItem(key, '1');

      // decidir destino según rol (is_admin RPC)
      let dest = '/app/dashboard';
      if (user?.id) {
        try {
          const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', { uid: user.id });
          if (!adminErr && isAdmin) dest = '/dashboard';
        } catch (e) {
          // si falla, mantener destino por defecto
        }
      }
      router.replace(dest);
    } catch (e) {
      router.replace('/app/dashboard');
    }
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-azulInstitucional backdrop-blur hover:bg-white"
            >
              <span className="text-turquesaAudioBrand">←</span>
              Volver al inicio
            </Link>

            <div className="mt-10">
              <div className="inline-flex items-center rounded-full bg-azulInstitucional/5 px-4 py-2 text-xs font-extrabold tracking-wide text-azulInstitucional ring-1 ring-azulInstitucional/10">
                Patrimonio Sonoro
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-azulInstitucional sm:text-4xl">
                Inicia sesión y vive el patrimonio cultural sonoro
              </h1>
              <p className="mt-4 max-w-xl text-base text-gray-700">
                Accede a tu espacio privado para explorar estrategias, guardar tus favoritos y descubrir el Álbum
                CampeSENA.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Estrategias</div>
                  <div className="mt-1 text-sm text-gray-600">Explora imágenes y materiales por estrategia.</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Álbum CampeSENA</div>
                  <div className="mt-1 text-sm text-gray-600">Escucha, guarda y comparte piezas destacadas.</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Favoritos</div>
                  <div className="mt-1 text-sm text-gray-600">Tu biblioteca personal de canciones guardadas.</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur">
                  <div className="text-sm font-extrabold text-azulInstitucional">Tu perfil</div>
                  <div className="mt-1 text-sm text-gray-600">Actualiza tu identidad cultural y tus estadísticas.</div>
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
                <h2 className="text-xl font-extrabold text-azulInstitucional">Bienvenido de nuevo</h2>
                <p className="mt-1 text-sm text-gray-600">Ingresa con tu correo y contraseña.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full rounded-xl bg-turquesaAudioBrand px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Link href="/register" className="text-sm font-extrabold text-azulInstitucional hover:text-turquesaAudioBrand">
                  Crear cuenta
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await Swal.fire({
                      title: 'Cerrar sesión',
                      text: '¿Deseas cerrar la sesión?',
                      showCancelButton: true,
                    });
                    if (res.isConfirmed) {
                      await supabase.auth.signOut();
                      Swal.fire('Listo', 'Has cerrado sesión', 'success');
                      router.push('/');
                    }
                  }}
                  className="text-sm font-extrabold text-gray-600 hover:text-azulInstitucional"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white/60 p-4 text-sm text-gray-700 backdrop-blur">
              <span className="font-extrabold text-azulInstitucional">Consejo:</span> Si tu correo no está verificado,
              revisa tu bandeja principal y la carpeta de spam.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
