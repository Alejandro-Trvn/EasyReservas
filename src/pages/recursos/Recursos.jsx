import React from "react";
import { Layers, Search } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import TablaMinimalista from "../../components/Table/Table";
import Buscador from "../../components/Table/Buscador";
import Paginador from "../../components/Table/Paginador";
import ScreenLoader from "../../components/ScreenLoader";
import Alert, { showAlert } from "../../components/Alert";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import Button from "../../components/Button";
import ClipLoader from "react-spinners/ClipLoader";
import CrearEditarRecursos from "./CrearEditarRecursos";
import VerificarDisponibilidad from "./VerificarDisponibilidad";
import useRecursos from "../../services/recursos/useRecursos";
import { useAuth } from "../../context/AuthContext";

import ResponsiveList from "../../components/ResponsiveList";
import useIsMobile from "../../hooks/useIsMobile";

const Recursos = () => {
  const { recursos, loading, error, refetch, updateRecurso, deleteRecurso } = useRecursos();
  const { user, role: contextRole } = useAuth();

  const role = (contextRole || user?.role || "").toString().toLowerCase();
  const isAdmin = role === "admin";
  const isViewer = role === "admin" || role === "usuario";

  const [openModal, setOpenModal] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState(null);

  const [openDisponibilidad, setOpenDisponibilidad] = React.useState(false);
  const [selectedRecurso, setSelectedRecurso] = React.useState(null);

  const [processing, setProcessing] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 7;

  // ✅ Reutilizable (Opción B)
  const isMobile = useIsMobile();

  const normalized = (searchTerm || "").toString().trim().toLowerCase();

  const filtered = (recursos || []).filter((r) => {
    if (!normalized) return true;

    const nombre = (r.nombre || r.name || "").toString().toLowerCase();
    const descripcion = (r.descripcion || r.description || "").toString().toLowerCase();
    const ubicacion = (r.ubicacion || "").toString().toLowerCase();
    const tipo = (r.tipo_recurso?.nombre || r.tipo_recurso?.name || "").toString().toLowerCase();

    return (
      nombre.includes(normalized) ||
      descripcion.includes(normalized) ||
      ubicacion.includes(normalized) ||
      tipo.includes(normalized)
    );
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => setCurrentPage(1), [normalized]);
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleEdit(r) {
    setEditingResource(r);
    setOpenModal(true);
  }

  function handleViewAvailability(r) {
    setSelectedRecurso(r);
    setOpenDisponibilidad(true);
  }

  function handleDelete(r) {
    showAlert({
      type: "warning",
      title: "Confirmar eliminación",
      text: `Eliminar recurso ${r.nombre || r.name}?`,
      showCancel: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        setDeletingId(r.id);
        try {
          setProcessing(true);
          await deleteRecurso(r.id);
          showAlert({
            type: "success",
            title: "Eliminado",
            text: `Recurso ${r.nombre || r.name} eliminado.`,
          });
          await refetch();
        } catch (err) {
          showAlert({
            type: "fail",
            title: "Error",
            text: err?.response?.data?.message || err?.message || "Error eliminando recurso.",
          });
        } finally {
          setProcessing(false);
          setDeletingId(null);
        }
      },
    });
  }

  const baseColumns = [
    { key: "nombre", title: "Nombre" },
    { key: "tipo", title: "Tipo" },
    { key: "ubicacion", title: "Ubicación" },
    { key: "capacidad", title: "Capacidad", align: "center", width: "90px" },
    { key: "disponibilidad", title: "Disponibilidad", align: "center", width: "120px" },
    { key: "descripcion", title: "Descripción" },
    { key: "estado", title: "Estado", align: "center", width: "100px" },
  ];

  const columns = isViewer
    ? [...baseColumns, { key: "actions", title: "Acciones", align: "center", width: "160px" }]
    : baseColumns;

  // Desktop rows (Tabla)
  const rows = (visible || []).map((r) => {
    const row = {
      id: r.id,
      nombre: r.nombre || r.name || "—",
      tipo: r.tipo_recurso?.nombre || r.tipo_recurso?.name || "—",
      ubicacion: r.ubicacion || "—",
      capacidad: r.capacidad ?? "—",
      disponibilidad: r.disponibilidad_general === 1 ? "Sí" : "No",
      descripcion: r.descripcion || r.description || "—",
      estado:
        r.estado === 1 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Inactivo
          </span>
        ),
    };

    if (isViewer) {
      row.actions = (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewAvailability(r)}
            title="Ver Disponibilidad"
            className="p-2 rounded-md text-amber-600 hover:bg-amber-50"
          >
            <FiEye />
          </button>

          {isAdmin && (
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
                title="Eliminar"
                className="p-2 rounded-md text-red-600 hover:bg-red-50"
              >
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      );
    }

    return row;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Recursos"
        subtitle="Gestión de recursos del sistema"
        Icon={Layers}
        bgColor="linear-gradient(to right, #134224, #22c55e)"
      />

      {isAdmin && (
        <div className="flex justify-end">
          <div className="w-full sm:w-auto">
            <Button
              onClick={() => {
                setEditingResource(null);
                setOpenModal(true);
              }}
              className="w-full sm:w-auto"
            >
              Nuevo recurso
            </Button>
          </div>
        </div>
      )}

      <Alert />

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 relative">
        <ScreenLoader loading={loading} message={"Cargando recursos..."} color="#329c68" />

        {error ? (
          <div className="text-red-600">
            <p>Error cargando recursos.</p>
            <button onClick={refetch} className="mt-2 text-sm text-blue-600 underline">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-md p-0">
            <div className="p-3 sm:p-4">
              <Buscador
                value={searchTerm}
                onChange={(v) => setSearchTerm(v)}
                placeholder={"Buscar por nombre, descripción, ubicación o tipo"}
              />
            </div>

            {totalItems === 0 ? (
              <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center text-gray-500">
                <Search size={40} className="mb-4 text-gray-400" />
                <div className="text-lg font-medium">No se encontraron registros</div>
              </div>
            ) : (
              <>
                {/* ✅ Mobile: cards | Desktop: tabla (Opción B) */}
                <ResponsiveList
                  isMobile={isMobile}
                  mobileClassName="px-3 pb-3 space-y-3 sm:px-0 sm:pb-0"
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
                      {visible.map((r) => (
                        <RecursoCard
                          key={r.id}
                          r={r}
                          isViewer={isViewer}
                          isAdmin={isAdmin}
                          deletingId={deletingId}
                          onView={() => handleViewAvailability(r)}
                          onEdit={() => handleEdit(r)}
                          onDelete={() => handleDelete(r)}
                        />
                      ))}
                    </>
                  }
                />

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

            <CrearEditarRecursos
              isOpen={openModal}
              initialData={editingResource}
              onClose={() => {
                setOpenModal(false);
                setEditingResource(null);
              }}
              onSaved={async (payloadOrResult) => {
                try {
                  if (editingResource) {
                    setProcessing(true);
                    const id = editingResource.id ?? payloadOrResult?.id;
                    const data = await updateRecurso(id, payloadOrResult);
                    await refetch();
                    const nombre =
                      data?.nombre ||
                      payloadOrResult?.nombre ||
                      editingResource?.nombre ||
                      editingResource?.name ||
                      "";
                    showAlert({
                      type: "success",
                      title: "Recurso actualizado",
                      text: `Recurso ${nombre} actualizado correctamente.`,
                    });
                  } else {
                    await refetch();
                    const nombre = payloadOrResult?.nombre || payloadOrResult?.name || "";
                    showAlert({
                      type: "success",
                      title: "Recurso creado",
                      text: nombre ? `Recurso ${nombre} creado correctamente.` : `Recurso creado correctamente.`,
                    });
                  }
                } catch (err) {
                  showAlert({
                    type: "fail",
                    title: "Error",
                    text: err?.response?.data?.message || err?.message || "Error guardando recurso.",
                  });
                } finally {
                  setProcessing(false);
                  setOpenModal(false);
                  setEditingResource(null);
                }
              }}
            />

            <VerificarDisponibilidad
              isOpen={openDisponibilidad}
              recurso={selectedRecurso}
              onClose={() => {
                setOpenDisponibilidad(false);
                setSelectedRecurso(null);
              }}
            />

            <ScreenLoader loading={processing} message={"Guardando cambios..."} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Recursos;

/* ---------------- Mobile Card ---------------- */

function RecursoCard({ r, isViewer, isAdmin, deletingId, onView, onEdit, onDelete }) {
  const estado =
    r.estado === 1
      ? { text: "Activo", cls: "text-emerald-700 bg-emerald-50 border-emerald-100" }
      : { text: "Inactivo", cls: "text-red-700 bg-red-50 border-red-100" };

  const disponibilidad =
    r.disponibilidad_general === 1
      ? { text: "Sí", cls: "text-emerald-700" }
      : { text: "No", cls: "text-red-700" };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-900 truncate">
            {r.nombre || r.name || "—"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 truncate">
            {r.tipo_recurso?.nombre || r.tipo_recurso?.name || "—"}
          </div>
        </div>

        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${estado.cls}`}>
          {estado.text}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
        <InfoLine label="Ubicación" value={r.ubicacion || "—"} />
        <InfoLine label="Capacidad" value={r.capacidad ?? "—"} />
        <InfoLine
          label="Disponibilidad"
          value={<span className={`font-semibold ${disponibilidad.cls}`}>{disponibilidad.text}</span>}
        />
        <InfoLine label="Descripción" value={r.descripcion || r.description || "—"} />
      </div>

      {isViewer && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={onView}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 transition"
            type="button"
          >
            <FiEye />
            Ver
          </button>

          {isAdmin && (
            <>
              <button
                onClick={onEdit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 transition"
                type="button"
              >
                <FiEdit />
                Editar
              </button>

              {deletingId === r.id ? (
                <div className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 flex items-center justify-center">
                  <ClipLoader size={18} color="#059669" />
                </div>
              ) : (
                <button
                  onClick={onDelete}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 transition"
                  type="button"
                >
                  <FiTrash2 />
                  Eliminar
                </button>
              )}
            </>
          )}
        </div>
      )}
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
