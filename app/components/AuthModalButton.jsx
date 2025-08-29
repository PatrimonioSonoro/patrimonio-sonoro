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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = /confirm/i.test(error.message)
        ? "Tu correo aún no ha sido verificado. Revisa tu bandeja y carpeta de spam."
        : error.message || "Credenciales inválidas";
      return Swal.fire("Error", msg, "error");
    }
    setOpen(false);
  }

  async function onForgotPassword(e) {
    e.preventDefault();
    const value = email || regEmail;
    if (!value) return Swal.fire("Recuperación", "Ingresa tu correo en el formulario para enviarte el enlace.", "info");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(value, {
      redirectTo: `${origin}/login`,
    });
    if (error) return Swal.fire("Error", error.message || "No se pudo enviar el enlace", "error");
    Swal.fire("Listo", "Hemos enviado instrucciones a tu correo", "success");
  }

  async function onRegister(e) {
    e.preventDefault();
    if (!validateFullName(nombre)) return Swal.fire("Error", "Nombre completo inválido (mínimo 2 palabras, sin números)", "error");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(regEmail)) return Swal.fire("Error", "Correo inválido", "error");
    if (!validatePassword(regPassword)) return Swal.fire("Error", "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números", "error");
    if (regPassword !== confirm) return Swal.fire("Error", "Las contraseñas no coinciden", "error");

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
      return Swal.fire("Error", msg, "error");
    }
    Swal.fire("Registro exitoso", "Revisa tu correo para confirmar la cuenta.", "success");
    setMode("login");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-turquesaAudioBrand hover:bg-opacity-90 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
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
              <button type="submit" disabled={loading} className="w-full bg-turquesaAudioBrand text-white font-semibold py-3 rounded-lg">
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
              <button type="submit" disabled={loading} className="w-full bg-turquesaAudioBrand text-white font-semibold py-3 rounded-lg">
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
