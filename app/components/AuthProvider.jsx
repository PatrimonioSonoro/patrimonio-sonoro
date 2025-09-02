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
        try {
          const key = `ps_welcome_shown_${session?.user?.id}`;
          const shown = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
          if (!shown) {
            await Swal.fire({ title: "Bienvenido", text: `Hola ${nombre}`, icon: "success", zIndex: 2147483647 });
            if (typeof window !== "undefined") window.localStorage.setItem(key, "1");
          }
        } catch (e) {
          await Swal.fire({ title: "Bienvenido", text: `Hola ${nombre}`, icon: "success", zIndex: 2147483647 });
        }
        router.replace("/dashboard");
      }
      if (event === "SIGNED_OUT") {
        await Swal.fire({ title: "Sesión cerrada", text: "Has cerrado sesión correctamente", icon: "success", zIndex: 20000 });
        router.replace("/");
      }
      if (event === "PASSWORD_RECOVERY") {
        await Swal.fire({ title: "Recuperación", text: "Revisa tu correo para recuperar tu contraseña", icon: "info", zIndex: 20000 });
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
