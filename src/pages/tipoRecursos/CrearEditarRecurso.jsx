import React from "react";
import { Modal } from "../../components/Modal";
import Button from "../../components/Button";
import { showAlert } from "../../components/Alert";
import {
  crearTipoRecurso,
  editarTipoRecurso,
} from "../../services/tipoRecursos/tipoRecursosServices";
import ScreenLoader from "../../components/ScreenLoader";

const CrearEditarRecurso = ({ isOpen, onClose, onSaved, initialData = null }) => {
  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setNombre(initialData.nombre || initialData.name || "");
      setDescripcion(initialData.descripcion || initialData.description || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [initialData, isOpen]);

  async function handleSave() {
    const payload = {
      nombre: (nombre || "").toString().trim().slice(0, 100),
      descripcion: (descripcion || "").toString().trim().slice(0, 255) || undefined,
    };

    if (!payload.nombre) {
      showAlert({
        type: "warning",
        title: "Nombre requerido",
        text: "Por favor ingresa un nombre.",
      });
      return;
    }

    try {
      setSaving(true);

      let result = null;
      if (initialData?.id) {
        result = await editarTipoRecurso(initialData.id, payload);
      } else {
        result = await crearTipoRecurso(payload);
      }

      if (typeof onSaved === "function") await onSaved(result || payload);

      showAlert({
        type: "success",
        title: "Guardado",
        text: "Tipo de recurso guardado correctamente.",
        confirmText: "OK",
        showCancel: false,
        autoClose: false,
        onConfirm: () => onClose?.(),
      });
    } catch (err) {
      showAlert({
        type: "fail",
        title: "Error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Ocurrió un error al guardar.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (saving) return;
        onClose?.();
      }}
      title={initialData?.id ? "Editar tipo" : "Nuevo tipo"}
      size="md"
    >
      <ScreenLoader loading={saving} message={"Guardando tipo de recurso..."} />

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={saving}
            maxLength={100}
            className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm disabled:bg-gray-50"
            placeholder="Ingrese nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={saving}
            maxLength={255}
            rows={3}
            className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm resize-none disabled:bg-gray-50"
            placeholder="Ingrese descripción (opcional)"
          />
          <div className="mt-1 text-xs text-gray-400 text-right">
            {(descripcion || "").length}/255
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            onClick={() => {
              if (saving) return;
              onClose?.();
            }}
            variant="ghost"
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CrearEditarRecurso;
