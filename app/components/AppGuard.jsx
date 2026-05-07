"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AppGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!data?.session) {
          router.replace("/login");
          return;
        }

        setChecking(false);
      } catch (_) {
        if (!mounted) return;
        router.replace("/login");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) return null;

  return children;
}
