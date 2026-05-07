export default function WelcomeSection({ nombre, onSignOut }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-azulInstitucional tracking-tight">
          Bienvenido, {nombre || "Usuario"}
        </h1>
        <p className="text-gray-600 mt-1">Tu espacio privado en Patrimonio Sonoro.</p>
      </div>

      <button
        onClick={onSignOut}
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-bold text-azulInstitucional hover:bg-gray-50"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
