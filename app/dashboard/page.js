"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        await Swal.fire("Sesión requerida", "Inicia sesión para continuar", "info");
        router.replace("/login");
        return;
      }
      if (!mounted) return;
      setUser(session.user);
      // Intentar recuperar nombre desde tabla usuarios
      try {
        const { data: perfil } = await supabase
          .from("usuarios")
          .select("nombre_completo")
          .eq("id", session.user.id)
          .single();
        const nombreFinal = perfil?.nombre_completo || session.user.user_metadata?.nombre_completo || session.user.email;
        setNombre(nombreFinal);
      } catch (_) {
        setNombre(session.user.user_metadata?.nombre_completo || session.user.email);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    const res = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar la sesión?",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });
    if (res.isConfirmed) {
      await supabase.auth.signOut();
      // AuthProvider manejará el redirect
    }
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: 720, margin: "28px auto", padding: 18 }}>
      <h1>Panel de usuario</h1>
      <p>Bienvenido/a, <strong>{nombre}</strong></p>
      <div style={{ marginTop: 16 }}>
        <button onClick={handleLogout} style={{ padding: "10px 14px" }}>Cerrar sesión</button>
      </div>
    </div>
  );
}
