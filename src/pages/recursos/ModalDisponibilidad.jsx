import React from "react";
import { Modal } from "../../components/Modal";

export default function ModalDisponibilidad({ isOpen, onClose, result }) {
  const disponibleValue =
    result?.disponible_periodo ?? result?.disponible ?? result?.available ?? result?.isAvailable ?? null;

  const dias = result?.dias ?? result?.days ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Disponibilidad — ${result?.recurso_nombre ?? ""}`}
      subtitle={result?.fecha_inicio && result?.fecha_fin ? `${result.fecha_inicio} — ${result.fecha_fin}` : null}
      contentClassName="max-h-[60vh] overflow-y-auto"
      size="md"
    >
      <div className="space-y-4 pr-2">
        <div>
          <div className="text-sm font-semibold text-gray-500">Disponible (periodo)</div>
          <div className="mt-2">
            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                disponibleValue ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
              ].join(" ")}
            >
              {disponibleValue ? "Si" : "No"}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-500">Fechas</div>
          <div className="mt-2">
            {(!dias || dias.length === 0) ? (
              <div className="text-sm text-gray-600">No hay datos de días</div>
            ) : (
              <div className="space-y-2">
                {dias.map((d, idx) => {
                  const dayDisponible = d?.disponible ?? d?.available ?? false;
                  const reservas = d?.reservas ?? d?.existing_reservations ?? [];
                  return (
                    <div key={d?.fecha ?? idx} className="rounded-lg border p-3 bg-gray-50 text-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-800">{d?.fecha}</div>
                        </div>
                        <div>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                              dayDisponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                            ].join(" ")}
                          >
                            {dayDisponible ? "Disponible" : "No disponible"}
                          </span>
                        </div>
                      </div>

                      {reservas && reservas.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {reservas.map((r) => (
                            <div key={r.id} className="rounded-md border p-2 bg-white text-xs">
                              <div className="font-semibold text-gray-800">Reserva #{r.id}</div>
                              <div className="text-gray-600">{r.usuario ?? r.user ?? r.usuario_nombre}</div>
                              <div className="text-gray-500 text-xs">{r.fecha_inicio} — {r.fecha_fin}</div>
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
