"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ContentsListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("contenidos")
          .select("id, title, status, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } catch (e) {
        setError(e.message || "Error al cargar contenidos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contenidos</h2>
        <Link href="/dashboard/contents/new" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Nuevo</Link>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !items.length && <p>No hay contenidos aún.</p>}
      <ul className="divide-y">
        {items.map((it) => (
          <li key={it.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.title || "(Sin título)"}</div>
              <div className="text-sm text-gray-500">{new Date(it.created_at).toLocaleString()} · {it.status}</div>
            </div>
            <Link href={`/dashboard/contents/${it.id}`} className="text-blue-600 hover:underline">Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
