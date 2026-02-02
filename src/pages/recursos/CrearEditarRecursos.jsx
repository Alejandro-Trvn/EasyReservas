import React from "react";
import { Modal } from "../../components/Modal";
import Button from "../../components/Button";
import ScreenLoader from "../../components/ScreenLoader";
import { showAlert } from "../../components/Alert";
import { crearRecurso } from "../../services/recursos/recursosServices";
import useTipoRecursos from "../../services/tipoRecursos/usetipoRecursos";
import Select from "../../components/Select";

const CrearEditarRecursos = ({ isOpen, onClose, onSaved, initialData = null }) => {
  const { tipoRecursos } = useTipoRecursos();
  const [selectedTipo, setSelectedTipo] = React.useState(null);
  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [ubicacion, setUbicacion] = React.useState("");
  const [capacidad, setCapacidad] = React.useState("");
  const [disponibilidad, setDisponibilidad] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (initialData) {
      const tipoId = initialData.tipo_recurso_id ?? initialData.tipo_recurso?.id ?? null;
      const tipoNombre =
        initialData.tipo_recurso?.nombre ?? initialData.tipo_recurso?.name ??
        (tipoRecursos || []).find((t) => t.id === tipoId)?.nombre ?? "";
      setSelectedTipo(tipoId ? { value: tipoId, label: tipoNombre } : null);
      setNombre(initialData.nombre || "");
      setDescripcion(initialData.descripcion || "");
      setUbicacion(initialData.ubicacion || "");
      setCapacidad(initialData.capacidad ?? "");
      setDisponibilidad(initialData.disponibilidad_general === 1 || !!initialData.disponibilidad_general);
    } else {
      setSelectedTipo(null);
      setNombre("");
      setDescripcion("");
      setUbicacion("");
      setCapacidad("");
      setDisponibilidad(true);
    }
  }, [initialData, isOpen]);

  async function handleSave() {
    const payload = {
      tipo_recurso_id: selectedTipo?.value ? Number(selectedTipo.value) : null,
      nombre: (nombre || "").toString().trim().slice(0, 100),
      descripcion: (descripcion || "").toString().trim() || undefined,
      ubicacion: (ubicacion || "").toString().trim() || undefined,
      capacidad: capacidad !== "" && capacidad !== null ? Number(capacidad) : undefined,
      disponibilidad_general: !!disponibilidad,
    };

    if (!payload.tipo_recurso_id) {
      showAlert({ type: "warning", title: "Tipo requerido", text: "Selecciona un tipo de recurso." });
      return;
    }
    if (!payload.nombre) {
      showAlert({ type: "warning", title: "Nombre requerido", text: "Ingresa el nombre del recurso." });
      return;
    }
    if (payload.capacidad !== undefined && payload.capacidad < 1) {
      showAlert({ type: "warning", title: "Capacidad inválida", text: "La capacidad debe ser al menos 1." });
      return;
    }

    try {
      setSaving(true);
      let result = null;
      if (initialData && initialData.id) {
        // edición delegada al callback si existe
        if (typeof onSaved === "function") {
          await onSaved({ id: initialData.id, ...payload });
        }
        // cerrar modal después del callback
        onClose();
      } else {
        result = await crearRecurso(payload);
        if (typeof onSaved === "function") await onSaved(result || payload);
        // cerrar modal tras crear
        onClose();
      }
    } catch (err) {
      showAlert({ type: "fail", title: "Error", text: err?.response?.data?.message || err?.message || "Error guardando recurso." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar recurso" : "Nuevo recurso"} size="md">
      <ScreenLoader loading={saving} message={initialData ? "Guardando cambios..." : "Creando recurso..."} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de recurso</label>
          <Select
            options={(tipoRecursos || []).map((t) => ({ value: t.id, label: t.nombre }))}
            value={selectedTipo}
            onChange={(opt) => setSelectedTipo(opt)}
            placeholder={"-- Selecciona --"}
            isSearchable={true}
            isClearable={true}
            className="w-full"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm" placeholder="Nombre del recurso" />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm" placeholder="Descripción (opcional)" />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm" placeholder="Ubicación (opcional)" />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
          <input type="number" min={1} value={capacidad} onChange={(e) => setCapacidad(e.target.value)} className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm" placeholder="Ej: 8" />
        </div>

        <div className="col-span-1 flex items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={disponibilidad} onChange={(e) => setDisponibilidad(!!e.target.checked)} />
            <span className="text-sm">Disponibilidad general</span>
          </label>
        </div>

        <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
          <Button onClick={onClose} variant="ghost" disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CrearEditarRecursos;
