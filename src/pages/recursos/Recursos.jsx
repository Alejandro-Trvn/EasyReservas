import React from "react";
import { Layers, Search } from "lucide-react";
import TablaMinimalista from "../../components/Table/Table";
import Buscador from "../../components/Table/Buscador";
import Paginador from "../../components/Table/Paginador";
import ScreenLoader from "../../components/ScreenLoader";
import Alert, { showAlert } from "../../components/Alert";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Button from "../../components/Button";
import CrearEditarRecursos from "./CrearEditarRecursos";
import useRecursos from "../../services/recursos/useRecursos";
import { useAuth } from "../../context/AuthContext";

const Recursos = () => {
  const { recursos, loading, error, refetch, updateRecurso, deleteRecurso } = useRecursos();
  const { user, role: contextRole } = useAuth();
  const role = (contextRole || user?.role || "").toString().toLowerCase();
  const isAdmin = role === "admin";
  const [openModal, setOpenModal] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 7;

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
  }, [totalPages]);

  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const baseColumns = [
    { key: "nombre", title: "Nombre" },
    { key: "tipo", title: "Tipo" },
    { key: "ubicacion", title: "Ubicación" },
    { key: "capacidad", title: "Capacidad", align: "center", width: "90px" },
    { key: "disponibilidad", title: "Disponibilidad", align: "center", width: "120px" },
    { key: "descripcion", title: "Descripción" },
    { key: "estado", title: "Estado", align: "center", width: "100px" },
  ];

  const columns = isAdmin
    ? [...baseColumns, { key: "actions", title: "Acciones", align: "center", width: "120px" }]
    : baseColumns;

  const rows = (visible || []).map((r) => {
    const row = {
      id: r.id,
      nombre: r.nombre || r.name || "—",
      tipo: r.tipo_recurso?.nombre || "—",
      ubicacion: r.ubicacion || "—",
      capacidad: r.capacidad ?? "—",
      disponibilidad: r.disponibilidad_general === 1 ? "Sí" : "No",
      descripcion: r.descripcion || r.description || "—",
      estado:
        r.estado === 1 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Activo</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactivo</span>
        ),
    };

    if (isAdmin) {
      row.actions = (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleEdit(r)} title="Editar" className="p-2 rounded-md text-sky-600 hover:bg-sky-50">
            <FiEdit />
          </button>
          <button onClick={() => handleDelete(r)} title="Eliminar" className="p-2 rounded-md text-red-600 hover:bg-red-50">
            <FiTrash2 />
          </button>
        </div>
      );
    }

    return row;
  });

  function handleEdit(r) {
    setEditingResource(r);
    setOpenModal(true);
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
        try {
          setProcessing(true);
          await deleteRecurso(r.id);
          showAlert({ type: "success", title: "Eliminado", text: `Recurso ${r.nombre || r.name} eliminado.` });
        } catch (err) {
          showAlert({ type: "fail", title: "Error", text: err?.response?.data?.message || err?.message || "Error eliminando recurso." });
        } finally {
          setProcessing(false);
        }
      },
    });
  }

  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 p-3 rounded-xl">
                <Layers size={28} className="text-cyan-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Recursos</h1>
                <p className="text-gray-600">Gestión de recursos del sistema</p>
              </div>
            </div>
            {isAdmin && (
              <div className="shrink-0">
                <Button onClick={() => setOpenModal(true)}>Nuevo recurso</Button>
              </div>
            )}
          </div>

      <Alert />

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative">
        <ScreenLoader loading={loading} message={"Cargando recursos..."} />

        {error ? (
          <div className="text-red-600">
            <p>Error cargando recursos.</p>
            <button onClick={refetch} className="mt-2 text-sm text-blue-600 underline">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-md p-0">
            <div className="p-4">
              <Buscador value={searchTerm} onChange={(v) => setSearchTerm(v)} placeholder={"Buscar por nombre, descripción, ubicación o tipo"} />
            </div>

            {totalItems === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
                <Search size={40} className="mb-4 text-gray-400" />
                <div className="text-lg font-medium">No se encontraron registros</div>
              </div>
            ) : (
              <>
                <TablaMinimalista columns={columns} rows={rows} dotKeys={[]} headerBg={"bg-amber-100 border-b border-amber-600"} />
                <div className="p-4">
                  <Paginador totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
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
                    const nombre = data?.nombre || payloadOrResult?.nombre || editingResource?.nombre || editingResource?.name || "";
                    showAlert({ type: "success", title: "Recurso actualizado", text: `Recurso ${nombre} actualizado correctamente.` });
                  } else {
                    // creación: modal already performed POST and returned result
                    await refetch();
                    const nombre = payloadOrResult?.nombre || payloadOrResult?.name || "";
                    showAlert({ type: "success", title: "Recurso creado", text: nombre ? `Recurso ${nombre} creado correctamente.` : `Recurso creado correctamente.` });
                  }
                } catch (err) {
                  showAlert({ type: "fail", title: "Error", text: err?.response?.data?.message || err?.message || "Error guardando recurso." });
                } finally {
                  setProcessing(false);
                  setOpenModal(false);
                  setEditingResource(null);
                }
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
