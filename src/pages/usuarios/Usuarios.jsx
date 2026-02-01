import React from "react";
import { Users } from "lucide-react";
import TablaMinimalista from "../../components/Table/Table";
import useUsuarios from "../../services/usuarios/useUsuarios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Button from "../../components/Button";

export default function Usuarios() {
  const { usuarios, loading, error, refetch } = useUsuarios();

  const columns = [
    { key: "name", title: "Nombre" },
    { key: "email", title: "Email" },
    { key: "role", title: "Rol" },
    { key: "must_change_password", title: "Cambio contraseña", align: "center", width: "140px" },
    { key: "estado", title: "Activo", align: "center", width: "80px" },
    { key: "actions", title: "Acciones", align: "center", width: "120px" },
  ];

  const rows = (usuarios || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.nombre ?? "—",
    // Muestra si debe cambiar la contraseña: "Si" / "No"
    must_change_password: u.must_change_password === 1 || u.must_change_password === true ? "Si" : "No",
    // Renderizamos un botón activo/inactivo (verde/rojo)
    estado: (
      <button
        type="button"
        className={
          u.estado === 1
            ? "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            : "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
        }
      >
        {u.estado === 1 ? "Activo" : "Inactivo"}
      </button>
    ),
    actions: (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handleEdit(u)}
          title="Editar"
          className="p-2 rounded-md text-sky-600 hover:bg-sky-50"
        >
          <FiEdit />
        </button>
        <button
          onClick={() => handleDelete(u)}
          title="Eliminar"
          className="p-2 rounded-md text-red-600 hover:bg-red-50"
        >
          <FiTrash2 />
        </button>
      </div>
    ),
  }));

  function handleEdit(user) {
    // Placeholder: abrir modal/ir a ruta edición
    console.log("Editar usuario:", user);
    alert(`Editar usuario: ${user.name}`);
  }

  function handleDelete(user) {
    // Placeholder: mostrar confirm y llamar API de borrado
    if (confirm(`Eliminar usuario ${user.name}?`)) {
      console.log("Eliminar usuario:", user);
      alert(`Usuario ${user.name} eliminado (simulado)`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-xl">
            <Users size={28} className="text-purple-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-600">Administración de usuarios del sistema</p>
          </div>
        </div>

        <div className="ml-4">
          <Button
            variant="primary"
            size="md"
            onClick={() => alert("Crear nuevo usuario (simulado)")}
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {loading ? (
          <p className="text-gray-600">Cargando usuarios...</p>
        ) : error ? (
          <div className="text-red-600">
            <p>Error cargando usuarios.</p>
            <button onClick={refetch} className="mt-2 text-sm text-blue-600 underline">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-0">
            <TablaMinimalista
              columns={columns}
              rows={rows}
              // No usamos dot para 'estado' porque renderizamos un botón
              dotKeys={[]}
              headerBg={"bg-amber-100 border-b border-amber-600"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
