import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import DateRangePicker from "../../components/DateRangePicker";
import HourRangePicker from "../../components/HourRangePicker";
import Button from "../../components/Button";
import ScreenLoader from "../../components/ScreenLoader";
import { showAlert } from "../../components/Alert";
import { verificarDisponibilidadRecurso } from "../../services/recursos/recursosServices";
import ModalDisponibilidad from "./ModalDisponibilidad";

function formatDateOnly(date) {
  if (!date) return "";
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function to24h(timeStr) {
  if (!timeStr) return "";
  const s = String(timeStr).trim().toUpperCase();
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (m12) {
    let h = Number(m12[1]);
    const min = m12[2];
    const ap = m12[3];
    if (h === 12) h = 0;
    if (ap === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    return `${String(Number(m24[1])).padStart(2, "0")}:${m24[2]}`;
  }
  return "";
}

export default function VerificarDisponibilidad({ isOpen, onClose, recurso }) {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [hourRange, setHourRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDateRange({ from: null, to: null });
    setHourRange({ from: null, to: null });
    setResult(null);
  }, [isOpen, recurso?.id]);

  const recursoInfo = useMemo(() => {
    if (!recurso) return [];
    return [
      { label: "Nombre", value: recurso.nombre || recurso.name || "-" },
      { label: "Tipo", value: recurso.tipo_recurso?.nombre || recurso.tipo_recurso?.name || "-" },
      { label: "Ubicacion", value: recurso.ubicacion || "-" },
      { label: "Capacidad", value: recurso.capacidad ?? "-" },
      { label: "Disponibilidad", value: recurso.disponibilidad_general === 1 ? "Si" : "No" },
      { label: "Estado", value: recurso.estado === 1 ? "Activo" : "Inactivo" },
    ];
  }, [recurso]);

  async function handleCheck() {
    if (!recurso?.id) return;
    if (!dateRange.from || !dateRange.to) {
      showAlert({ type: "warning", title: "Fechas requeridas", text: "Selecciona un rango de fechas para continuar." });
      return;
    }

    const startDate = formatDateOnly(dateRange.from);
    const endDate = formatDateOnly(dateRange.to);
    const startTime = to24h(hourRange.from) || "00:00";
    const endTime = to24h(hourRange.to) || "23:59";

    const fecha_inicio = `${startDate} ${startTime}`;
    const fecha_fin = `${endDate} ${endTime}`;

    setLoading(true);
    setResult(null);
    try {
      const data = await verificarDisponibilidadRecurso(recurso.id, fecha_inicio, fecha_fin);
      setResult(data);
      setShowResultModal(true);
      showAlert({ type: "success", title: "Consulta completada", text: "La disponibilidad fue consultada correctamente.", autoClose: true });
    } catch (err) {
      showAlert({
        type: "fail",
        title: "Error",
        text: err?.response?.data?.message || err?.message || "No se pudo verificar la disponibilidad.",
      });
    } finally {
      setLoading(false);
    }
  }

  const disponibleValue =
    result?.disponible ?? result?.available ?? result?.disponibilidad ?? result?.isAvailable ?? null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Verificar disponibilidad"
        size="lg"
        lockScrollX
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-bold text-gray-800">Recurso seleccionado</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recursoInfo.map((item) => (
                <div key={item.label} className="text-sm">
                  <div className="text-xs font-semibold text-gray-500">{item.label}</div>
                  <div className="font-semibold text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-bold text-gray-800">Rango de fechas</div>
                <div className="mt-3">
                <DateRangePicker
                  value={dateRange}
                  onChange={(v) => setDateRange(v)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-bold text-gray-800">Rango de horas</div>
                <div className="mt-3">
                <HourRangePicker
                  value={hourRange}
                  onChange={(v) => setHourRange(v)}
                  min="07:00AM"
                  max="09:00PM"
                  stepMinutes={5}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleCheck}>Consultar disponibilidad</Button>
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          {/* Result is shown in ModalDisponibilidad */}
        </div>
      </Modal>

      <ModalDisponibilidad
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={result}
      />

      <ScreenLoader loading={loading} message="Consultando disponibilidad..." />
    </>
  );
}
