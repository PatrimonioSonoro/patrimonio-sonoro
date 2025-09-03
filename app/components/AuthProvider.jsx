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
          console.error('Auth session error (preserving session):', error);
          // Don't sign out automatically on transient errors here. Informational
          // log only so that user content isn't removed on page reloads.
          return;
        }
        const session = data?.session;
        if (!mounted) return;
        // no forced redirect here; we let pages guard themselves
      } catch (error) {
        console.error('Unexpected auth error:', error);
        // Do not clear user content silently. Notify and allow user to act if necessary.
        if (typeof window !== 'undefined') {
          try {
            // show a non-blocking notice in console and optionally UI
            console.warn('Auth initialization failed; user content will not be removed automatically.');
          } catch (e) {}
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

          // Decide redirect based on role RPCs: prefer is_user -> /usuario, is_admin -> /dashboard
          try {
            const uid = session?.user?.id;
            if (uid) {
              // Check is_user first
              const { data: isUser, error: userErr } = await supabase.rpc('is_user', { uid });
              if (!userErr && isUser) {
                router.replace('/usuario');
                return;
              }
              // Then check admin
              const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', { uid });
              if (!adminErr && isAdmin) {
                router.replace('/dashboard');
                return;
              }
            }
          } catch (e) {
            console.error('Role check error on SIGNED_IN:', e);
          }

          // Fallback: go to usuario for safety if roles couldn't be determined
          router.replace('/usuario');
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
