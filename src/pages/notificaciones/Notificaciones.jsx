import { Bell } from "lucide-react";

export const Notificaciones = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-100 p-3 rounded-xl">
          <Bell size={28} className="text-yellow-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">Centro de notificaciones del sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <p className="text-gray-600">Módulo de Notificaciones en construcción...</p>
      </div>
    </div>
  );
};
