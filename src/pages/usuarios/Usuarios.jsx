import React from "react";
import { Users, Search } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import TablaMinimalista from "../../components/Table/Table";
import useUsuarios from "../../services/usuarios/useUsuarios";
import Paginador from "../../components/Table/Paginador";
import Buscador from "../../components/Table/Buscador";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Button from "../../components/Button";
import CrearEditarUsuario from "./CrearEditarUsuario";
import Alert, { showAlert } from "../../components/Alert";
import ScreenLoader from "../../components/ScreenLoader";

import ResponsiveList from "../../components/ResponsiveList";
import useIsMobile from "../../hooks/useIsMobile";

export default function Usuarios() {
  const { usuarios, loading, error, refetch, createUsuario, deleteUsuario } = useUsuarios();
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deletingName, setDeletingName] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 7;
  const [searchTerm, setSearchTerm] = React.useState("");

  const isMobile = useIsMobile(); // ✅ centralizado

  const columns = [
    { key: "name", title: "Nombre" },
    { key: "email", title: "Email" },
    { key: "role", title: "Rol" },
    { key: "must_change_password", title: "Cambio contraseña", align: "center", width: "140px" },
    { key: "estado", title: "Activo", align: "center", width: "80px" },
    { key: "actions", title: "Acciones", align: "center", width: "120px" },
  ];

  const normalizedFilter = (searchTerm || "").toString().trim().toLowerCase();
  const filteredUsuarios = (usuarios || []).filter((u) => {
    if (!normalizedFilter) return true;
    const name = (u.name || "").toString().toLowerCase();
    const email = (u.email || "").toString().toLowerCase();
    const role = (u.role?.nombre || "").toString().toLowerCase();
    return name.includes(normalizedFilter) || email.includes(normalizedFilter) || role.includes(normalizedFilter);
  });

  const totalItems = filteredUsuarios.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => setCurrentPage(1), [normalizedFilter]);
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const visibleUsuarios = filteredUsuarios.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  // Desktop rows (Tabla)
  const rows = (visibleUsuarios || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.nombre ?? "—",
    must_change_password: u.must_change_password === 1 || u.must_change_password === true ? "Si" : "No",
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
        <button onClick={() => handleEdit(u)} title="Editar" className="p-2 rounded-md text-sky-600 hover:bg-sky-50">
          <FiEdit />
        </button>
        <button onClick={() => handleDelete(u)} title="Eliminar" className="p-2 rounded-md text-red-600 hover:bg-red-50">
          <FiTrash2 />
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Usuarios"
        subtitle="Administración de usuarios del sistema"
        Icon={Users}
        bgColor="linear-gradient(to right, #134224, #22c55e)"
      />

      {/* Crear */}
      <div className="flex justify-end">
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => setOpenCreate(true)}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <CrearEditarUsuario
        isOpen={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setEditUser(null);
        }}
        createUsuario={createUsuario}
        editingUser={editUser}
        onSaved={() => refetch()}
      />

      <Alert />

      <div className="bg-white rounded-md shadow-md p-4 sm:p-6 border border-gray-100 relative">
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
            <div className="p-3 sm:p-4">
              <Buscador value={searchTerm} onChange={(v) => setSearchTerm(v)} placeholder={"Buscar por nombre, email o rol"} />
            </div>

            {totalItems === 0 ? (
              <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center text-gray-500">
                <Search size={40} className="mb-4 text-gray-400" />
                <div className="text-lg font-medium">No se encontraron registros</div>
              </div>
            ) : (
              <>
                <ResponsiveList
                  isMobile={isMobile}
                  mobileClassName="px-3 pb-3 space-y-3"
                  desktop={
                    <TablaMinimalista
                      columns={columns}
                      rows={rows}
                      dotKeys={[]}
                      bodyClassName="text-xs text-slate-700"
                      headerBg={"bg-blue-100 border-b border-blue-600"}
                    />
                  }
                  mobile={
                    <>
                      {visibleUsuarios.map((u) => (
                        <UsuarioCard
                          key={u.id}
                          u={u}
                          onEdit={() => handleEdit(u)}
                          onDelete={() => handleDelete(u)}
                        />
                      ))}
                    </>
                  }
                />

                <div className="p-3 sm:p-4">
                  <Paginador totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Mobile Card ---------------- */

function UsuarioCard({ u, onEdit, onDelete }) {
  const activo = u.estado === 1;
  const mustChange = u.must_change_password === 1 || u.must_change_password === true;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-900 truncate">{u.name || "—"}</div>
          <div className="mt-0.5 text-xs text-slate-500 truncate">{u.email || "—"}</div>
        </div>

        <span
          className={[
            "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border",
            activo ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-red-700 bg-red-50 border-red-100",
          ].join(" ")}
        >
          {activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
        <InfoLine label="Rol" value={u.role?.nombre ?? "—"} />
        <InfoLine label="Cambio contraseña" value={mustChange ? "Si" : "No"} />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 transition"
          type="button"
        >
          <FiEdit />
          Editar
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 transition"
          type="button"
        >
          <FiTrash2 />
          Eliminar
        </button>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-semibold text-slate-500 shrink-0">{label}:</div>
      <div className="text-sm text-slate-800 text-right break-words min-w-0">{value}</div>
    </div>
  );
}
