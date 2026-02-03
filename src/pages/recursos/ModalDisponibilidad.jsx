import React from "react";
import { Modal } from "../../components/Modal";

export default function ModalDisponibilidad({ isOpen, onClose, result }) {
  const disponibleValue =
    result?.disponible ?? result?.available ?? result?.disponibilidad ?? result?.isAvailable ?? null;

  const reservas = result?.reservas_existentes ?? result?.reservas ?? result?.existing_reservations ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resultado de disponibilidad" size="md">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold text-gray-500">Disponible</div>
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
          <div className="text-sm font-semibold text-gray-500">Reservas existentes</div>
          <div className="mt-2">
            {(!reservas || reservas.length === 0) ? (
              <div className="text-sm text-gray-600">No hay reservas</div>
            ) : (
              <div className="space-y-2">
                {reservas.map((r) => (
                  <div key={r.id} className="rounded-lg border p-3 bg-gray-50 text-sm">
                    <div className="font-bold text-gray-800">Reserva #{r.id}</div>
                    <div className="text-gray-600">{r.usuario ?? r.user ?? r.usuario_nombre}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {r.fecha_inicio} — {r.fecha_fin}
                    </div>
                  </div>
                ))}
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
