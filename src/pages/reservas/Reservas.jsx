import React from "react";
import { Calendar } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import TablaMinimalista from "../../components/Table/Table";
import Buscador from "../../components/Table/Buscador";
import Paginador from "../../components/Table/Paginador";
import ScreenLoader from "../../components/ScreenLoader";
import Alert, { showAlert } from "../../components/Alert";
import Button from "../../components/Button";
import ClipLoader from "react-spinners/ClipLoader";
import CrearEditarReservas from "./CrearEditarReservas";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import useReservas from "../../services/reservas/useReservas";
import { useAuth } from "../../context/AuthContext";

const Reservas = () => {
  const { reservas, loading, error, refetch, cancelReserva } = useReservas();
  const { isAdmin } = useAuth();

  const [openCrear, setOpenCrear] = React.useState(false);
  const [editingReserva, setEditingReserva] = React.useState(null);
  const [cancellingId, setCancellingId] = React.useState(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("active");
  const pageSize = 8;

  // ✅ isMobile sin window.innerWidth en render
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const normalized = (searchTerm || "").toString().trim().toLowerCase();

  const getFlags = (r) => {
    const isCancelled = (() => {
      if (!r) return false;
      const resEstado = (r.estado || "").toString().toLowerCase();
      if (
        resEstado === "cancelada" ||
        resEstado === "cancelado" ||
        resEstado === "canceled" ||
        resEstado === "cancelled"
      )
        return true;
      if (resEstado === "activa" || resEstado === "activo" || resEstado === "active") return false;
      if (r.cancelado === true || r.cancelado === 1) return true;
      if (r.canceled === true) return true;
      if (r.estado === 0) return true;
      const st = (r.status || "").toString().toLowerCase();
      if (st === "cancelled" || st === "cancelada" || st === "canceled") return true;
      return false;
    })();

    const isFinalized = (() => {
      if (!r) return false;
      const resEstado = (r.estado || "").toString().toLowerCase();
      if (
        resEstado === "finalizada" ||
        resEstado === "finalizado" ||
        resEstado === "finished" ||
        resEstado.includes("final")
      )
        return true;
      if (r.finalizado === true || r.finalizado === 1) return true;
      if (r.estado === 2) return true;
      return false;
    })();

    return { isCancelled, isFinalized };
  };

  const filtered = (reservas || []).filter((r) => {
    const { isCancelled, isFinalized } = getFlags(r);

    if (statusFilter === "active" && (isCancelled || isFinalized)) return false;
    if (statusFilter === "cancelled" && !isCancelled) return false;
    if (statusFilter === "finalized" && !isFinalized) return false;

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
  React.useEffect(() => setCurrentPage(1), [statusFilter]);
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function formatDateTime(dt) {
    if (!dt) return "-";
    try {
      const parsed = new Date(String(dt).replace(" ", "T"));
      if (isNaN(parsed)) return String(dt);
      return parsed.toLocaleString();
    } catch (e) {
      return String(dt);
    }
  }

  function handleEdit(r) {
    setEditingReserva(r);
    setOpenCrear(true);
  }

  function handleDelete(r) {
    showAlert({
      type: "warning",
      title: "Confirmar cancelación",
      text: `¿Deseas cancelar la reserva ${r.id}?`,
      showCancel: true,
      confirmText: "Cancelar",
      cancelText: "Volver",
      onConfirm: async () => {
        setCancellingId(r.id);
        try {
          await cancelReserva(r.id);
          showAlert({
            type: "success",
            title: "Cancelada",
            text: "Reserva cancelada correctamente.",
          });
          await refetch();
        } catch (err) {
          showAlert({
            type: "fail",
            title: "Error",
            text:
              err?.response?.data?.message ||
              err?.message ||
              "Error cancelando reserva.",
          });
        } finally {
          setCancellingId(null);
        }
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
    { key: "estado", title: "Estado", align: "center", width: "120px" },
    { key: "actions", title: "Acciones", align: "center", width: "120px" },
  ];

  const rows = (visible || []).map((r) => {
    const { isCancelled, isFinalized } = getFlags(r);
    return {
      id: r.id,
      recurso: <span>{r.recurso?.nombre || "—"}</span>,
      ubicacion: r.recurso?.ubicacion || "—",
      usuario: r.user?.name || "—",
      email: r.user?.email || "—",
      fecha_inicio: formatDateTime(r.fecha_inicio),
      fecha_fin: formatDateTime(r.fecha_fin),
      comentarios: r.comentarios || "—",
      estado: (
        <div className="text-center">
          {isCancelled ? (
            <span className="text-sm font-medium text-red-600">Cancelada</span>
          ) : isFinalized ? (
            <span className="text-sm font-medium text-amber-600">Finalizada</span>
          ) : (
            <span className="text-sm font-medium text-emerald-600">Activa</span>
          )}
        </div>
      ),
      actions: (
        <div className="flex items-center justify-center gap-2">
          {cancellingId === r.id ? (
            <div className="p-2">
              <ClipLoader size={18} color="#059669" />
            </div>
          ) : (
            <>
              <button
                onClick={() => handleEdit(r)}
                title="Editar"
                className="p-2 rounded-md text-sky-600 hover:bg-sky-50"
              >
                <FiEdit />
              </button>
              <button
                onClick={() => handleDelete(r)}
                title="Cancelar Reserva"
                className="p-2 rounded-md text-red-600 hover:bg-red-50"
              >
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Reservas"
        subtitle="Sistema de gestión de reservas"
        Icon={Calendar}
        bgColor="linear-gradient(to right, #134224, #22c55e)"
      />

      {/* Crear */}
      <div className="flex justify-end">
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => {
              setEditingReserva(null);
              setOpenCrear(true);
            }}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Crear reserva
          </Button>
        </div>
      </div>

      <CrearEditarReservas
        isOpen={openCrear}
        onClose={() => setOpenCrear(false)}
        initialData={editingReserva}
        onSaved={async () => {
          setOpenCrear(false);
          setEditingReserva(null);
          try {
            await refetch();
          } catch (e) {
            console.error(e);
          }
        }}
        disableRecursoSelector={!isAdmin()}
      />

      <Alert />

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
        <ScreenLoader
          loading={loading}
          message={"Cargando reservas..."}
          color="#f2f7f6"
          height={10}
          width={4}
        />

        {error ? (
          <div className="text-red-600">
            <p>Error cargando reservas.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-blue-600 underline"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-md p-0">
            {/* Top controls */}
            <div className="p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <Buscador
                    value={searchTerm}
                    onChange={(v) => setSearchTerm(v)}
                    placeholder={"Buscar por recurso, usuario o comentarios"}
                  />
                </div>

                {/* Filtro estado - scroll en mobile */}
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600 shrink-0">Mostrar:</div>

                  <div className="w-full overflow-x-auto">
                    <div className="inline-flex rounded-md bg-green-100 p-1 gap-1 min-w-max">
                      <StatusBtn
                        active={statusFilter === "all"}
                        onClick={() => setStatusFilter("all")}
                      >
                        Todas
                      </StatusBtn>
                      <StatusBtn
                        active={statusFilter === "active"}
                        onClick={() => setStatusFilter("active")}
                      >
                        Activas
                      </StatusBtn>
                      <StatusBtn
                        active={statusFilter === "cancelled"}
                        onClick={() => setStatusFilter("cancelled")}
                      >
                        Canceladas
                      </StatusBtn>
                      <StatusBtn
                        active={statusFilter === "finalized"}
                        onClick={() => setStatusFilter("finalized")}
                      >
                        Finalizadas
                      </StatusBtn>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {totalItems === 0 ? (
              <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center text-gray-500">
                <div className="text-lg font-medium">No se encontraron reservas</div>
              </div>
            ) : (
              <>
                {/* ✅ Mobile: cards | Desktop: tabla */}
                {isMobile ? (
                  <div className="px-3 pb-3 sm:px-0 sm:pb-0 space-y-3">
                    {visible.map((r) => (
                      <ReservaCard
                        key={r.id}
                        r={r}
                        cancellingId={cancellingId}
                        onEdit={() => handleEdit(r)}
                        onDelete={() => handleDelete(r)}
                        formatDateTime={formatDateTime}
                        getFlags={getFlags}
                      />
                    ))}
                  </div>
                ) : (
                  <TablaMinimalista
                    columns={columns}
                    rows={rows}
                    dotKeys={[]}
                    bodyClassName="text-xs text-slate-700"
                    headerBg={"bg-blue-100 border-b border-blue-600"}
                  />
                )}

                <div className="p-3 sm:p-4">
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
};

export default Reservas;

/* ---------------- UI Helpers ---------------- */

function StatusBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-md transition ${active ? "bg-white text-slate-900 shadow-sm" : "text-gray-600 hover:bg-white"
        }`}
      type="button"
    >
      {children}
    </button>
  );
}

function ReservaCard({ r, cancellingId, onEdit, onDelete, formatDateTime, getFlags }) {
  const { isCancelled, isFinalized } = getFlags(r);

  const estado = isCancelled
    ? { text: "Cancelada", cls: "text-red-700 bg-red-50 border-red-100" }
    : isFinalized
      ? { text: "Finalizada", cls: "text-amber-700 bg-amber-50 border-amber-100" }
      : { text: "Activa", cls: "text-emerald-700 bg-emerald-50 border-emerald-100" };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-900 truncate">
            {r.recurso?.nombre || "—"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 truncate">
            {r.recurso?.ubicacion || "—"}
          </div>
        </div>

        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${estado.cls}`}>
          {estado.text}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
        <InfoLine label="Usuario" value={r.user?.name || "—"} />
        <InfoLine label="Email" value={r.user?.email || "—"} />
        <InfoLine label="Inicio" value={formatDateTime(r.fecha_inicio)} />
        <InfoLine label="Fin" value={formatDateTime(r.fecha_fin)} />
        <InfoLine label="Comentarios" value={r.comentarios || "—"} />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {cancellingId === r.id ? (
          <div className="px-3 py-2 rounded-xl border border-gray-200">
            <ClipLoader size={18} color="#059669" />
          </div>
        ) : (
          <>
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
              Cancelar
            </button>
          </>
        )}
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
