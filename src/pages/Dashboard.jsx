// src/features/dashboard/pages/DashboardPage.jsx
import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Home, TrendingUp, Users, Activity } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const roleLabel = useMemo(() => {
    const r = (user?.role || "").toString().toUpperCase();
    return r || "—";
  }, [user?.role]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido de vuelta, <span className="font-semibold">{user?.name || "Usuario"}</span>
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <Home size={40} className="text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-bold">
              ¡Bienvenido, {user?.name || "Usuario"}!
            </h2>
            <p className="text-emerald-100 mt-2 text-lg">
              Para comenzar, selecciona una opción del menú lateral.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="font-semibold">Rol:</span>
              <span className="uppercase bg-white/30 px-3 py-1 rounded-full text-sm">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total de Reservas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <Activity size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En Progreso</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl">
              <TrendingUp size={28} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <Users size={28} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Información del Sistema
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Usuario:</span>
            <span className="font-semibold text-gray-900">{user?.name || "—"}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold text-gray-900">{user?.email || "—"}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Rol:</span>
            <span className="font-semibold text-gray-900 uppercase">{roleLabel}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-600">Estado:</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-600">Activo</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
