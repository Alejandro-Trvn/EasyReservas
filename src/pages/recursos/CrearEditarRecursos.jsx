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
    if (!isOpen) return;

    if (initialData) {
      const tipoId = initialData.tipo_recurso_id ?? initialData.tipo_recurso?.id ?? null;
      const tipoNombre =
        initialData.tipo_recurso?.nombre ??
        initialData.tipo_recurso?.name ??
        (tipoRecursos || []).find((t) => t.id === tipoId)?.nombre ??
        "";

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
  }, [isOpen, initialData, tipoRecursos]);

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
    if (payload.capacidad !== undefined && (Number.isNaN(payload.capacidad) || payload.capacidad < 1)) {
      showAlert({ type: "warning", title: "Capacidad inválida", text: "La capacidad debe ser al menos 1." });
      return;
    }

    try {
      setSaving(true);

      if (initialData && initialData.id) {
        if (typeof onSaved === "function") {
          await onSaved({ id: initialData.id, ...payload });
        }
        onClose();
      } else {
        const result = await crearRecurso(payload);
        if (typeof onSaved === "function") await onSaved(result || payload);
        onClose();
      }
    } catch (err) {
      showAlert({
        type: "fail",
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Error guardando recurso.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar recurso" : "Nuevo recurso"}
      size="md"
      headerBg="bg-emerald-700"
      headerTextColor="text-white"
      headerTextAlign="center"
      lockScrollX
    >
      <ScreenLoader loading={saving} message={initialData ? "Guardando cambios..." : "Creando recurso..."} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de recurso</label>
          <Select
            options={(tipoRecursos || []).map((t) => ({ value: t.id, label: t.nombre }))}
            value={selectedTipo}
            onChange={(opt) => setSelectedTipo(opt)}
            placeholder={"-- Selecciona --"}
            isSearchable
            isClearable
            className="w-full"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={100}
            className="block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Nombre del recurso"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Descripción (opcional)"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
          <input
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ubicación (opcional)"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Capacidad</label>
          <input
            type="number"
            min={1}
            value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: 8"
          />
        </div>

        {/* Toggle disponibilidad */}
        <div className="col-span-1 flex items-center">
          <label className="flex items-center justify-between w-full gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <div>
              <div className="text-sm font-semibold text-gray-800">Disponibilidad general</div>
              <div className="text-xs text-gray-500">Permite reservas en general</div>
            </div>

            <button
              type="button"
              onClick={() => setDisponibilidad((v) => !v)}
              className={[
                "relative inline-flex h-7 w-12 items-center rounded-full transition",
                disponibilidad ? "bg-emerald-600" : "bg-gray-300",
              ].join(" ")}
              aria-pressed={disponibilidad}
              aria-label="Toggle disponibilidad"
            >
              <span
                className={[
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                  disponibilidad ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
              />
            </button>
          </label>
        </div>

        {/* Footer buttons */}
        <div className="col-span-1 sm:col-span-2 mt-2">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button onClick={onClose} variant="ghost" disabled={saving} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CrearEditarRecursos;
