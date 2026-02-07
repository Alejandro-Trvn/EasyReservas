import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Home, Users, Activity } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import useEstadisticas from "../services/estadisticas/useEstadisticas";

export default function UserDashboard() {
  const { user } = useAuth();
  const {
    historico,
    historicoLoading,
    fetchHistoricoReservasUsuario,
  } = useEstadisticas();

  useEffect(() => {
    if (user?.id) fetchHistoricoReservasUsuario(user.id).catch(() => {});
  }, [user?.id, fetchHistoricoReservasUsuario]);

  const totalReservas = historico?.total_reservas ?? 0;
  const reservasActivas = historico?.reservas_activas ?? 0;
  const recursosReservados = Array.isArray(historico?.reservas)
    ? new Set(historico.reservas.map((r) => r.recurso)).size
    : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mi Panel"
        subtitle={`Resumen para ${user?.name || "Usuario"}`}
        Icon={Home}
        textColor="#ffffff"
        bgColor="linear-gradient(90deg,#059669,#0ea5e9)"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Mis Reservas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {historicoLoading ? (
                  <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  totalReservas
                )}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <Activity size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Reservas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {historicoLoading ? (
                  <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  reservasActivas
                )}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl">
              <Users size={28} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Recursos Reservados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {historicoLoading ? (
                  <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  recursosReservados
                )}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <Home size={28} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Información</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Usuario:</span>
            <span className="font-semibold text-gray-900">{user?.name || "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold text-gray-900">{user?.email || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
