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

function toMinutes(hhmm) {
  if (!hhmm) return null;
  const m = String(hhmm).match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export default function VerificarDisponibilidad({ isOpen, onClose, recurso }) {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [hourRange, setHourRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // ✅ isMobile (por si quieres ajustar layout)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setDateRange({ from: null, to: null });
    setHourRange({ from: null, to: null });
    setResult(null);
    setShowResultModal(false);
  }, [isOpen, recurso?.id]);

  const recursoInfo = useMemo(() => {
    if (!recurso) return [];
    return [
      { label: "Nombre", value: recurso.nombre || recurso.name || "-" },
      { label: "Tipo", value: recurso.tipo_recurso?.nombre || recurso.tipo_recurso?.name || "-" },
      { label: "Ubicación", value: recurso.ubicacion || "-" },
      { label: "Capacidad", value: recurso.capacidad ?? "-" },
      { label: "Disp. general", value: recurso.disponibilidad_general === 1 ? "Sí" : "No" },
      { label: "Estado", value: recurso.estado === 1 ? "Activo" : "Inactivo" },
    ];
  }, [recurso]);

  async function handleCheck() {
    if (!recurso?.id) return;

    if (!dateRange.from || !dateRange.to) {
      showAlert({
        type: "warning",
        title: "Fechas requeridas",
        text: "Selecciona un rango de fechas para continuar.",
      });
      return;
    }

    // ✅ horas opcionales: si pone una, exigir la otra
    const hasFrom = !!hourRange?.from;
    const hasTo = !!hourRange?.to;
    if ((hasFrom && !hasTo) || (!hasFrom && hasTo)) {
      showAlert({
        type: "warning",
        title: "Horario incompleto",
        text: "Selecciona 'Desde' y 'Hasta' en el rango de horas (o deja ambos vacíos).",
      });
      return;
    }

    const startDate = formatDateOnly(dateRange.from);
    const endDate = formatDateOnly(dateRange.to);

    const startTime = hasFrom ? to24h(hourRange.from) : "00:00";
    const endTime = hasTo ? to24h(hourRange.to) : "23:59";

    if (hasFrom && hasTo) {
      const a = toMinutes(startTime);
      const b = toMinutes(endTime);

      // ✅ si es el mismo día, valida orden
      const sameDay = startDate === endDate;
      if (sameDay && a != null && b != null && b < a) {
        showAlert({
          type: "warning",
          title: "Rango inválido",
          text: "Si seleccionas el mismo día, la hora 'Hasta' no puede ser menor que 'Desde'.",
        });
        return;
      }
    }

    const fecha_inicio = `${startDate} ${startTime}`;
    const fecha_fin = `${endDate} ${endTime}`;

    setLoading(true);
    setResult(null);

    try {
      const data = await verificarDisponibilidadRecurso(
        recurso.id,
        fecha_inicio,
        fecha_fin
      );

      setResult(data);
      setShowResultModal(true);

      showAlert({
        type: "success",
        title: "Consulta completada",
        text: "La disponibilidad fue consultada correctamente.",
        autoClose: true,
      });
    } catch (err) {
      showAlert({
        type: "fail",
        title: "Error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo verificar la disponibilidad.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Verificar disponibilidad"
        size="lg"
        lockScrollX
        headerBg="bg-emerald-700"
        headerTextColor="text-white"
        headerTextAlign="center"
        contentClassName="p-4 sm:p-6"
      >
        {/* ✅ loader dentro del modal (evita overlays duplicados) */}
        <ScreenLoader loading={loading} message="Consultando disponibilidad..." />

        <div className="space-y-5 sm:space-y-6">
          {/* Recurso seleccionado */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-gray-800">
                Recurso seleccionado
              </div>

              {/* badge estado */}
              <span
                className={[
                  "text-xs font-semibold px-2.5 py-1 rounded-full border",
                  recurso?.estado === 1
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-100",
                ].join(" ")}
              >
                {recurso?.estado === 1 ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recursoInfo.map((item) => (
                <div key={item.label} className="text-sm">
                  <div className="text-xs font-semibold text-gray-500">
                    {item.label}
                  </div>
                  <div className="font-semibold text-gray-900 break-words">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickers */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-sm font-extrabold text-gray-800">
                Rango de fechas
              </div>
              <div className="mt-3">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Si no eliges horas, se consulta todo el día.
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-sm font-extrabold text-gray-800">
                Rango de horas (opcional)
              </div>
              <div className="mt-3">
                <HourRangePicker
                  value={hourRange}
                  onChange={setHourRange}
                  min="07:00AM"
                  max="09:00PM"
                  stepMinutes={5}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Deja vacío para usar 00:00 - 23:59.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex ${isMobile ? "flex-col" : "flex-row"} flex-wrap items-center gap-3`}>
            <Button onClick={handleCheck} className={isMobile ? "w-full" : ""} disabled={loading}>
              {loading ? "Consultando..." : "Consultar disponibilidad"}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className={isMobile ? "w-full" : ""}
              disabled={loading}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      <ModalDisponibilidad
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={result}
      />
    </>
  );
}
