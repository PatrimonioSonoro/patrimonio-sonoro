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
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth session error:', error);
          // Clear any corrupted tokens
          await supabase.auth.signOut();
          return;
        }
        const session = data?.session;
        if (!mounted) return;
        // no forced redirect here; we let pages guard themselves
      } catch (error) {
        console.error('Unexpected auth error:', error);
        // Clear localStorage auth data if corrupted
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('supabase.auth.token');
          window.localStorage.removeItem('sb-qnwhhslrsigfnqtfvmkz-auth-token');
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
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
          // Clear all auth-related localStorage items
          if (typeof window !== 'undefined') {
            const keys = Object.keys(window.localStorage);
            keys.forEach(key => {
              if (key.includes('ps_welcome_shown') || key.includes('supabase') || key.includes('sb-')) {
                window.localStorage.removeItem(key);
              }
            });
          }
          await Swal.fire({ title: "Sesión cerrada", text: "Has cerrado sesión correctamente", icon: "success", zIndex: 20000 });
          router.replace("/");
        }
        if (event === "PASSWORD_RECOVERY") {
          await Swal.fire({ title: "Recuperación", text: "Revisa tu correo para recuperar tu contraseña", icon: "info", zIndex: 20000 });
        }
        if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        }
        if (event === "USER_UPDATED") {
          // Optional feedback
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (error.message?.includes('refresh_token_not_found') || error.message?.includes('Invalid Refresh Token')) {
          // Force sign out on refresh token errors
          await supabase.auth.signOut();
        }
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [router]);

  return children;
}
