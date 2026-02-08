import React from "react";
import { Modal } from "../../components/Modal";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ModalDisponibilidad({ isOpen, onClose, result }) {
  const disponibleValue =
    result?.disponible_periodo ??
    result?.disponible ??
    result?.available ??
    result?.isAvailable ??
    null;

  const dias = result?.dias ?? result?.days ?? [];

  // ✅ isMobile sin window.innerWidth en render
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // ✅ estado de expand/collapse por día
  const [openDays, setOpenDays] = React.useState({});
  React.useEffect(() => {
    if (!isOpen) return;
    setOpenDays({});
  }, [isOpen, result?.fecha_inicio, result?.fecha_fin, result?.recurso_nombre]);

  const toggleDay = (key) => {
    setOpenDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const periodoText =
    result?.fecha_inicio && result?.fecha_fin
      ? `${result.fecha_inicio} — ${result.fecha_fin}`
      : null;

  const periodBadge = disponibleValue
    ? { text: "Sí", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    : { text: "No", cls: "bg-red-100 text-red-800 border-red-200" };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Disponibilidad — ${result?.recurso_nombre ?? ""}`}
      subtitle={periodoText}
      contentClassName="max-h-[70vh] overflow-y-auto"
      size="md"
      headerBg="bg-emerald-700"
      headerTextColor="text-white"
      headerTextAlign={isMobile ? "center" : "left"}
      lockScrollX
    >
      <div className="space-y-4 pr-1">
        {/* Disponible periodo */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-600">Disponible (periodo)</div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                periodBadge.cls,
              ].join(" ")}
            >
              {periodBadge.text}
            </span>

            {periodoText && (
              <span className="text-xs text-gray-500 truncate">{periodoText}</span>
            )}
          </div>
        </div>

        {/* Días */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-600">Fechas</div>

          <div className="mt-3">
            {!dias || dias.length === 0 ? (
              <div className="text-sm text-gray-600">No hay datos de días</div>
            ) : (
              <div className="space-y-3">
                {dias.map((d, idx) => {
                  const key = d?.fecha ?? String(idx);
                  const dayDisponible = d?.disponible ?? d?.available ?? false;
                  const reservas = d?.reservas ?? d?.existing_reservations ?? [];

                  const dayBadge = dayDisponible
                    ? { text: "Disponible", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" }
                    : { text: "No disponible", cls: "bg-red-100 text-red-800 border-red-200" };

                  const isOpenDay = !!openDays[key];
                  const hasReservas = Array.isArray(reservas) && reservas.length > 0;

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-gray-900 truncate">
                            {d?.fecha || "—"}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                                dayBadge.cls,
                              ].join(" ")}
                            >
                              {dayBadge.text}
                            </span>

                            {hasReservas && (
                              <span className="text-xs text-gray-600">
                                Reservas: <b>{reservas.length}</b>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Toggle reservas */}
                        {hasReservas ? (
                          <button
                            type="button"
                            onClick={() => toggleDay(key)}
                            className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                            title={isOpenDay ? "Ocultar reservas" : "Ver reservas"}
                          >
                            {isOpenDay ? "Ocultar" : "Ver"}
                            {isOpenDay ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        ) : (
                          <span className="shrink-0 text-xs text-gray-400">—</span>
                        )}
                      </div>

                      {/* Reservas */}
                      {hasReservas && isOpenDay && (
                        <div className="mt-3 space-y-2">
                          {reservas.map((r) => (
                            <div
                              key={r?.id ?? `${key}-${Math.random()}`}
                              className="rounded-xl border border-gray-100 bg-white p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-xs font-extrabold text-gray-900">
                                    Reserva #{r?.id ?? "—"}
                                  </div>
                                  <div className="mt-0.5 text-xs text-gray-600 truncate">
                                    {r?.usuario ?? r?.user ?? r?.usuario_nombre ?? "—"}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 text-[11px] text-gray-500">
                                {r?.fecha_inicio ?? "—"} — {r?.fecha_fin ?? "—"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
