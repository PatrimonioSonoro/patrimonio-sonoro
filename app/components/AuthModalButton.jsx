"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../../lib/supabaseClient";

function validateFullName(name) {
  if (!name) return false;
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return false;
  return !/\d/.test(name);
}

function validatePassword(pw) {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(pw);
}

export default function AuthModalButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("login"); // 'login' | 'register'

  // login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register state
  const [nombre, setNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // close on escape
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = /confirm/i.test(error.message)
        ? "Tu correo aún no ha sido verificado. Revisa tu bandeja y carpeta de spam."
        : error.message || "Credenciales inválidas";
      return Swal.fire({ title: "Error", text: msg, icon: "error", zIndex: 20000 });
    }

    // Mostrar bienvenida una sola vez y redirigir según rol
    try {
      const user = data?.user || data?.session?.user;
      const nombre = user?.user_metadata?.nombre_completo || user?.email || "Usuario";
  const key = user ? `ps_welcome_shown_${user.id}` : null;
  // show welcome immediately for this login action and mark it
  await Swal.fire({ title: "Bienvenido", text: `Hola ${nombre}`, icon: "success", zIndex: 2147483647 });
  if (typeof window !== "undefined" && key) window.localStorage.setItem(key, "1");
  let dest = '/usuario';
      if (user?.id) {
        try {
          const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', { uid: user.id });
          if (!adminErr && isAdmin) dest = '/dashboard';
        } catch (_) {}
      }
      setOpen(false);
      window.location.href = dest;
    } catch (e) {
      setOpen(false);
      window.location.href = '/';
    }
  }

  async function onForgotPassword(e) {
    e.preventDefault();
    const value = email || regEmail;
  if (!value) return Swal.fire({ title: "Recuperación", text: "Ingresa tu correo en el formulario para enviarte el enlace.", icon: "info", zIndex: 20000 });
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(value, {
      redirectTo: `${origin}/login`,
    });
  if (error) return Swal.fire({ title: "Error", text: error.message || "No se pudo enviar el enlace", icon: "error", zIndex: 20000 });
  Swal.fire({ title: "Listo", text: "Hemos enviado instrucciones a tu correo", icon: "success", zIndex: 20000 });
  }

  async function onRegister(e) {
    e.preventDefault();
  if (!validateFullName(nombre)) return Swal.fire({ title: "Error", text: "Nombre completo inválido (mínimo 2 palabras, sin números)", icon: "error", zIndex: 20000 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(regEmail)) return Swal.fire({ title: "Error", text: "Correo inválido", icon: "error", zIndex: 20000 });
  if (!validatePassword(regPassword)) return Swal.fire({ title: "Error", text: "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números", icon: "error", zIndex: 20000 });
  if (regPassword !== confirm) return Swal.fire({ title: "Error", text: "Las contraseñas no coinciden", icon: "error", zIndex: 20000 });

    setLoading(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: { data: { nombre_completo: nombre }, emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) {
      const msg = /duplicate key/i.test(error.message)
        ? "El correo ya está registrado"
        : /password/i.test(error.message)
        ? "La contraseña no cumple los requisitos"
        : error.message || "Error al registrar";
      return Swal.fire({ title: "Error", text: msg, icon: "error", zIndex: 20000 });
    }
    Swal.fire({ title: "Registro exitoso", text: "Revisa tu correo para confirmar la cuenta.", icon: "success", zIndex: 20000 });
    setMode("login");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="campaign-cta"
      >
        Iniciar sesión
      </button>

      <div className={`login-modal ${open ? "active" : ""}`} onClick={() => setOpen(false)}>
        <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Tabs */}
          <div className="auth-tabs">
            <div
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Iniciar sesión
            </div>
            <div
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Registrarse
            </div>
          </div>

          {/* Content */}
          <div className={`auth-content ${mode === "login" ? "active" : ""}`}>
            <form onSubmit={onLogin}>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  className="input-with-icon w-full border rounded-lg p-3"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="input-with-icon w-full border rounded-lg p-3"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span />
                <a href="#" onClick={onForgotPassword} className="text-turquesaAudioBrand">¿Olvidaste tu contraseña?</a>
              </div>
              <button type="submit" disabled={loading} className="campaign-cta" style={{ width: '100%' }}>
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>
          </div>

          <div className={`auth-content ${mode === "register" ? "active" : ""}`}>
            <form onSubmit={onRegister}>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input
                  className="input-with-icon w-full border rounded-lg p-3"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  className="input-with-icon w-full border rounded-lg p-3"
                  placeholder="Correo electrónico"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="input-with-icon w-full border rounded-lg p-3"
                  placeholder="Contraseña"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="input-with-icon w-full border rounded-lg p-3"
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="campaign-cta" style={{ width: '100%' }}>
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
