"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { supabase } from "../../lib/supabaseClient";

export default function AuthProvider({ children }) {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // On load: decide initial redirect target if needed
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!mounted) return;
      // no forced redirect here; we let pages guard themselves
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        const nombre = session?.user?.user_metadata?.nombre_completo || session?.user?.email || "Usuario";
        await Swal.fire("Bienvenido", `Hola ${nombre}`, "success");
        router.replace("/dashboard");
      }
      if (event === "SIGNED_OUT") {
        await Swal.fire("Sesión cerrada", "Has cerrado sesión correctamente", "success");
        router.replace("/");
      }
      if (event === "PASSWORD_RECOVERY") {
        await Swal.fire("Recuperación", "Revisa tu correo para recuperar tu contraseña", "info");
      }
      if (event === "USER_UPDATED") {
        // Optional feedback
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [router]);

  return children;
}
