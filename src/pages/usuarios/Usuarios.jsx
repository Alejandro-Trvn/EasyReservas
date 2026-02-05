import React from "react";
import { Users, Search } from "lucide-react";
import TablaMinimalista from "../../components/Table/Table";
import useUsuarios from "../../services/usuarios/useUsuarios";
import Paginador from "../../components/Table/Paginador";
import Buscador from "../../components/Table/Buscador";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Button from "../../components/Button";
import CrearEditarUsuario from "./CrearEditarUsuario";
import Alert, { showAlert } from "../../components/Alert";
import ScreenLoader from "../../components/ScreenLoader";

export default function Usuarios() {
  const { usuarios, loading, error, refetch, createUsuario, deleteUsuario } = useUsuarios();
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deletingName, setDeletingName] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 7; // a partir del 8vo item pasa a la pagina 2
  const [searchTerm, setSearchTerm] = React.useState("");

  const columns = [
    { key: "name", title: "Nombre" },
    { key: "email", title: "Email" },
    { key: "role", title: "Rol" },
    { key: "must_change_password", title: "Cambio contraseña", align: "center", width: "140px" },
    { key: "estado", title: "Activo", align: "center", width: "80px" },
    { key: "actions", title: "Acciones", align: "center", width: "120px" },
  ];

  // Filtrado por buscador (nombre, email, rol)
  const normalizedFilter = (searchTerm || "").toString().trim().toLowerCase();
  const filteredUsuarios = (usuarios || []).filter((u) => {
    if (!normalizedFilter) return true;
    const name = (u.name || "").toString().toLowerCase();
    const email = (u.email || "").toString().toLowerCase();
    const role = (u.role?.nombre || "").toString().toLowerCase();
    return name.includes(normalizedFilter) || email.includes(normalizedFilter) || role.includes(normalizedFilter);
  });

  // Calcular items a mostrar en la página actual
  const totalItems = filteredUsuarios.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => {
    // Si la busqueda cambia, volver a la primera pagina
    setCurrentPage(1);
  }, [normalizedFilter]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const visibleUsuarios = filteredUsuarios.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const rows = (visibleUsuarios || []).map((u) => ({
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
    setEditUser(user);
    setOpenCreate(true);
  }

  function handleDelete(user) {
    showAlert({
      type: "warning",
      title: "Confirmar eliminación",
      text: `Eliminar usuario ${user.name}?`,
      showCancel: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        setDeleting(true);
        setDeletingName(user.name || "");
        try {
          await deleteUsuario(user.id);
          showAlert({ type: "success", title: "Eliminado", text: `Usuario ${user.name} eliminado.` });
          await refetch();
        } catch (err) {
          const status = err?.response?.status;
          const msg = err?.response?.data?.message || err?.message || "Error al eliminar usuario";
          if (status === 422) {
            showAlert({ type: "fail", title: "Operación no permitida", text: msg });
          } else if (status === 404) {
            showAlert({ type: "fail", title: "No encontrado", text: msg });
            await refetch();
          } else {
            showAlert({ type: "fail", title: "Error", text: msg });
          }
        } finally {
          setDeleting(false);
          setDeletingName("");
        }
      },
    });
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
            onClick={() => setOpenCreate(true)}
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <CrearEditarUsuario isOpen={openCreate} onClose={() => { setOpenCreate(false); setEditUser(null); }} createUsuario={createUsuario} editingUser={editUser} onSaved={() => refetch()} />
      <Alert />

      <div className="bg-white rounded-md shadow-md p-6 border border-gray-100 relative">
        <ScreenLoader loading={loading} message={"Cargando usuarios..."} color="#f2f7f6" height={10} width={4} />
        <ScreenLoader loading={deleting} message={`Eliminando ${deletingName}...`} color="#f2f7f6" height={10} width={4} />

        {error ? (
          <div className="text-red-600">
            <p>Error cargando usuarios.</p>
            <button onClick={refetch} className="mt-2 text-sm text-blue-600 underline">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-md p-0">
            <div className="p-4">
              <Buscador value={searchTerm} onChange={(v) => setSearchTerm(v)} placeholder={"Buscar por nombre, email o rol"} />
            </div>

            {totalItems === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
                <Search size={40} className="mb-4 text-gray-400" />
                <div className="text-lg font-medium">No se encontraron registros</div>
              </div>
            ) : (
              <>
                <TablaMinimalista
                  columns={columns}
                  rows={rows}
                  // No usamos dot para 'estado' porque renderizamos un botón
                  dotKeys={[]}
                  bodyClassName="text-xs text-slate-700"
                  headerBg={"bg-amber-100 border-b border-amber-600"}
                />
                <div className="p-4">
                  <Paginador
                    totalItems={totalItems}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={(p) => setCurrentPage(p)}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
