import React from "react";
import { Calendar } from "lucide-react";
import TablaMinimalista from "../../components/Table/Table";
import Buscador from "../../components/Table/Buscador";
import Paginador from "../../components/Table/Paginador";
import ScreenLoader from "../../components/ScreenLoader";
import Alert, { showAlert } from "../../components/Alert";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import useReservas from "../../services/reservas/useReservas";

const Reservas = () => {
  const { reservas, loading, error, refetch } = useReservas();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 8;

  const normalized = (searchTerm || "").toString().trim().toLowerCase();
  const filtered = (reservas || []).filter((r) => {
    if (!normalized) return true;
    const recursoNombre = (r.recurso?.nombre || "").toString().toLowerCase();
    const recursoUbic = (r.recurso?.ubicacion || "").toString().toLowerCase();
    const userName = (r.user?.name || "").toString().toLowerCase();
    const userEmail = (r.user?.email || "").toString().toLowerCase();
    const comentarios = (r.comentarios || "").toString().toLowerCase();
    return (
      recursoNombre.includes(normalized) ||
      recursoUbic.includes(normalized) ||
      userName.includes(normalized) ||
      userEmail.includes(normalized) ||
      comentarios.includes(normalized)
    );
  });
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => setCurrentPage(1), [normalized]);
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function formatDateTime(dt) {
    if (!dt) return "-";
    try {
      // try parsing common formats
      const parsed = new Date(dt.replace(' ', 'T'));
      if (isNaN(parsed)) return dt;
      return parsed.toLocaleString();
    } catch (e) {
      return dt;
    }
  }

  function handleEdit(r) {
    showAlert({ type: "info", title: "Editar", text: `Editar reserva ${r.id} (no implementado)` });
  }

  function handleDelete(r) {
    showAlert({
      type: "warning",
      title: "Confirmar eliminación",
      text: `Eliminar reserva ${r.id}?`,
      showCancel: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        // no delete API implemented yet
        showAlert({ type: "success", title: "OK", text: "Funcionalidad de eliminación no implementada." });
      },
    });
  }

  const columns = [
    { key: "recurso", title: "Recurso" },
    { key: "ubicacion", title: "Ubicación" },
    { key: "usuario", title: "Usuario" },
    { key: "email", title: "Email" },
    { key: "fecha_inicio", title: "Fecha inicio" },
    { key: "fecha_fin", title: "Fecha fin" },
    { key: "comentarios", title: "Comentarios" },
    { key: "actions", title: "Acciones", align: "center", width: "120px" },
  ];

  const rows = (visible || []).map((r) => ({
    id: r.id,
    recurso: r.recurso?.nombre || "—",
    ubicacion: r.recurso?.ubicacion || "—",
    usuario: r.user?.name || "—",
    email: r.user?.email || "—",
    fecha_inicio: formatDateTime(r.fecha_inicio),
    fecha_fin: formatDateTime(r.fecha_fin),
    comentarios: r.comentarios || "—",
    actions: (
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => handleEdit(r)} title="Editar" className="p-2 rounded-md text-sky-600 hover:bg-sky-50">
          <FiEdit />
        </button>
        <button onClick={() => handleDelete(r)} title="Eliminar" className="p-2 rounded-md text-red-600 hover:bg-red-50">
          <FiTrash2 />
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Calendar size={28} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600">Sistema de gestión de reservas</p>
        </div>
      </div>

      <Alert />

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <ScreenLoader loading={loading} message={"Cargando reservas..."} />

        {error ? (
          <div className="text-red-600">
            <p>Error cargando reservas.</p>
            <button onClick={() => refetch()} className="mt-2 text-sm text-blue-600 underline">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-md p-0">
            <div className="p-4">
              <Buscador value={searchTerm} onChange={(v) => setSearchTerm(v)} placeholder={"Buscar por recurso, usuario o comentarios"} />
            </div>

            {totalItems === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
                <div className="text-lg font-medium">No se encontraron reservas</div>
              </div>
            ) : (
              <>
                <TablaMinimalista columns={columns} rows={rows} dotKeys={[]} headerBg={"bg-amber-100 border-b border-amber-600"} />
                <div className="p-4">
                  <Paginador totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservas;
