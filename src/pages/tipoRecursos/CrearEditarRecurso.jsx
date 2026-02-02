import React from "react";
import { Modal } from "../../components/Modal";
import Button from "../../components/Button";
import { showAlert } from "../../components/Alert";
import { crearTipoRecurso, editarTipoRecurso } from "../../services/tipoRecursos/tipoRecursosServices";
import ScreenLoader from "../../components/ScreenLoader";

const CrearEditarRecurso = ({ isOpen, onClose, onSaved, initialData = null }) => {
  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || initialData.name || "");
      setDescripcion(initialData.descripcion || initialData.description || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [initialData, isOpen]);

  async function handleSave() {
    const payload = { nombre: (nombre || "").toString().trim(), descripcion: (descripcion || "").toString().trim() };
    if (!payload.nombre) {
      showAlert({ type: "warning", title: "Nombre requerido", text: "Por favor ingresa un nombre." });
      return;
    }

    try {
      setSaving(true);
      let result = null;
      if (initialData && initialData.id) {
        // llamar al servicio PUT para editar
        result = await editarTipoRecurso(initialData.id, payload);
        if (typeof onSaved === "function") await onSaved(result || payload);
      } else {
        result = await crearTipoRecurso(payload);
        if (typeof onSaved === "function") await onSaved(result || payload);
      }

      showAlert({
        type: "success",
        title: "Guardado",
        text: "Tipo de recurso guardado correctamente.",
        confirmText: "OK",
        showCancel: false,
        autoClose: false,
        onConfirm: () => {
          onClose();
        },
      });
    } catch (err) {
      showAlert({ type: "fail", title: "Error", text: err?.response?.data?.message || err?.message || "Ocurrió un error al guardar." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar tipo" : "Nuevo tipo"} size="md">
      <ScreenLoader loading={saving} message={"Guardando tipo de recurso..."} />
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm"
            placeholder="Ingrese nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm"
            placeholder="Ingrese descripción"
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button onClick={onClose} disabled={saving} className="bg-red-500 text-white-700 hover:bg-red-600">
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
