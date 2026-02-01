import { Layers } from "lucide-react";

export const Recursos = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-cyan-100 p-3 rounded-xl">
          <Layers size={28} className="text-cyan-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recursos</h1>
          <p className="text-gray-600">Gestión de recursos del sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <p className="text-gray-600">Módulo de Recursos en construcción...</p>
      </div>
    </div>
  );
};
