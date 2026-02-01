import { Calendar } from "lucide-react";

export const Reservas = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Calendar size={28} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600">Sistema de gestión de reservas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <p className="text-gray-600">Módulo de Reservas en construcción...</p>
      </div>
    </div>
  );
};
