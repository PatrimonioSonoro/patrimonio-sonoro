"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, user_id, nombre_completo, correo_electronico, role, is_active, fecha_registro")
        .order("fecha_registro", { ascending: false });
      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      setError(e.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
      const { data: sess } = await supabase.auth.getSession();
      setAccessToken(sess?.session?.access_token || null);
      // Validación adicional: comprobar admin en servidor
      try {
        const { data: isAdminRes } = await supabase.rpc("is_admin", { uid: data?.user?.id });
        setIsAdmin(!!isAdminRes);
      } catch (_) {
        setIsAdmin(false);
      }
      await load();
    })();
  }, []);

  const toggleRole = async (id, currentRole) => {
    if (!isAdmin) {
      setError("No autorizado: se requieren permisos de administrador");
      return;
    }
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`¿Cambiar rol a ${nextRole}?`)) return;
    setUpdatingId(id);
    setError("");
    try {
      const prev = rows.find((r) => r.id === id);
      const { error } = await supabase
        .from("usuarios")
        .update({ role: nextRole })
        .eq("id", id);
      if (error) throw error;
      // Log del cambio
      if (prev) {
        await supabase.from("user_status_logs").insert({
          admin_id: currentUserId,
          target_user_id: prev.user_id,
          prev_role: prev.role,
          new_role: nextRole,
          prev_active: prev.is_active,
          new_active: prev.is_active,
          reason: `Cambio de rol a ${nextRole}`,
        });
      }
      await load();
    } catch (e) {
      setError(e.message || "No se pudo actualizar el rol");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleActive = async (id, currentActive) => {
    if (!isAdmin) {
      setError("No autorizado: se requieren permisos de administrador");
      return;
    }
    const nextActive = !currentActive;
    if (!confirm(`¿${nextActive ? "Activar" : "Desactivar"} este usuario?`)) return;
    setUpdatingId(id);
    setError("");
    try {
      const prev = rows.find((r) => r.id === id);
      const { error } = await supabase
        .from("usuarios")
        .update({ is_active: nextActive })
        .eq("id", id);
      if (error) throw error;
      // Log del cambio de estado
      if (prev) {
        await supabase.from("user_status_logs").insert({
          admin_id: currentUserId,
          target_user_id: prev.user_id,
          prev_role: prev.role,
          new_role: prev.role,
          prev_active: prev.is_active,
          new_active: nextActive,
          reason: nextActive ? "Activación de cuenta" : "Desactivación de cuenta",
        });
      }
      // Actualización optimista
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, is_active: nextActive } : r)));
    } catch (e) {
      setError(e.message || "No se pudo cambiar el estado");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <div className="flex gap-2">
          <button
            title="Crear usuario"
            onClick={async () => {
              if (!isAdmin) { setError("No autorizado"); return; }
              const email = prompt("Correo del nuevo usuario:");
              if (!email) return;
              const nombre = prompt("Nombre completo (opcional):") || undefined;
              const setAdmin = confirm("¿Asignar rol admin?");
              setLoading(true);
              setError("");
              try {
                const res = await fetch("/api/admin/users", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                  },
                  body: JSON.stringify({ email, nombre_completo: nombre, role: setAdmin ? "admin" : "user", is_active: true }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Fallo al crear");
                await load();
                alert(`Usuario creado: ${json.email || email}`);
              } catch (e) {
                setError(e.message);
              } finally {
                setLoading(false);
              }
            }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Crear
          </button>
          <button title="Recargar lista" onClick={load} className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200">Refrescar</button>
        </div>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border">Nombre</th>
                <th className="text-left p-2 border">Correo</th>
                <th className="text-left p-2 border">Estado</th>
                <th className="text-left p-2 border">Rol</th>
                <th className="text-left p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border">{u.nombre_completo || "(sin nombre)"}</td>
                  <td className="p-2 border">{u.correo_electronico}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-2 border">{u.role}</td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button
                        title="Ver detalles"
                        onClick={() => alert(`${u.nombre_completo || "(sin nombre)"}\n${u.correo_electronico}\nRol: ${u.role}\nEstado: ${u.is_active ? "Activo" : "Inactivo"}`)}
                        className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200"
                      >
                        Ver
                      </button>
                      <button
                        title={u.role === "admin" ? (u.user_id === currentUserId ? "No puedes quitarte admin" : "Quitar rol admin") : "Hacer admin"}
                        onClick={() => toggleRole(u.id, u.role)}
                        disabled={updatingId === u.id || (u.role === "admin" && u.user_id === currentUserId)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                      >
                        {updatingId === u.id
                          ? "Actualizando..."
                          : u.role === "admin"
                          ? u.user_id === currentUserId
                            ? "Tu rol"
                            : "Quitar admin"
                          : "Hacer admin"}
                      </button>
                      <button
                        title={u.is_active ? "Desactivar usuario" : "Activar usuario"}
                        onClick={() => toggleActive(u.id, u.is_active)}
                        disabled={updatingId === u.id}
                        className={`px-3 py-1 text-white rounded disabled:opacity-60 ${u.is_active ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        {u.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        title="Eliminar usuario"
                        onClick={async () => {
                          if (!isAdmin) { setError("No autorizado"); return; }
                          if (u.user_id === currentUserId) { alert("No puedes eliminar tu propia cuenta"); return; }
                          if (!confirm(`¿Eliminar al usuario ${u.correo_electronico}? Esta acción no se puede deshacer.`)) return;
                          setUpdatingId(u.id);
                          setError("");
                          try {
                            const res = await fetch(`/api/admin/users/${u.user_id}`, {
                              method: "DELETE",
                              headers: {
                                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                              },
                            });
                            const json = await res.json().catch(() => ({}));
                            if (!res.ok) throw new Error(json.error || "Fallo al eliminar");
                            await load();
                          } catch (e) {
                            setError(e.message);
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
