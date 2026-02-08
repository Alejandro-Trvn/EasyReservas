// src/pages/DashboardPage.jsx
import React, { useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Home, TrendingUp, Users, Activity } from "lucide-react";
import useEstadisticas from "../services/estadisticas/useEstadisticas";
import useUsuarios from "../services/usuarios/useUsuarios";
import useRecursos from "../services/recursos/useRecursos";
import UserDashboard from "./UserDashboard";
import ScreenLoader from "../components/ScreenLoader";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = (user?.role || "").toString().toLowerCase();

  // if not admin, render UserDashboard
  if (role !== "admin") return <UserDashboard />;

  const {
    estadisticas,
    loading: estadisticasLoading,
    fetchEstadisticas,
  } = useEstadisticas();

  const { usuarios = [], loading: usersLoading } = useUsuarios();
  const { recursos = [], loading: recursosLoading } = useRecursos();

  useEffect(() => {
    fetchEstadisticas().catch(() => { });
  }, [fetchEstadisticas]);

  const roleLabel = useMemo(() => {
    const r = (user?.role || "").toString().toUpperCase();
    return r || "—";
  }, [user?.role]);

  const totalReservas = estadisticas?.totales?.total_reservas ?? 0;
  const totalUsuarios = (usuarios || []).length;
  const totalRecursos = (recursos || []).length;

  const Spinner = () => (
    <svg
      className="animate-spin h-6 w-6 text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Cargando"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-md shadow-xl p-5 sm:p-7 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm self-start">
            <Home size={34} className="text-white sm:hidden" />
            <Home size={40} className="text-white hidden sm:block" />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              ¡Bienvenido, {user?.name || "Usuario"}!
            </h2>

            <p className="text-emerald-100 mt-2 text-sm sm:text-lg">
              Para comenzar, selecciona una opción del menú lateral.
            </p>

            <div className="mt-4 inline-flex flex-wrap items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
              <span className="font-semibold">Rol:</span>
              <span className="uppercase bg-white/30 px-3 py-1 rounded-full text-xs sm:text-sm">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Reservas */}
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Total de Reservas
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {estadisticasLoading ? <Spinner /> : totalReservas}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl shrink-0">
              <Activity size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Recursos */}
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Total de Recursos
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {recursosLoading ? <Spinner /> : totalRecursos}
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl shrink-0">
              <TrendingUp size={28} className="text-amber-600" />
            </div>
          </div>
        </div>

        {/* Usuarios */}
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Usuarios Activos
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {usersLoading ? <Spinner /> : totalUsuarios}
              </p>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl shrink-0">
              <Users size={28} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Información del Sistema
        </h3>

        <div className="space-y-2 sm:space-y-3">
          <InfoRow label="Usuario" value={user?.name || "—"} />
          <InfoRow label="Email" value={user?.email || "—"} />
          <InfoRow label="Rol" value={roleLabel} upper />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 py-2">
            <span className="text-gray-600 text-sm">Estado:</span>
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

function InfoRow({ label, value, upper = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600 text-sm">{label}:</span>

      <span
        className={clsx(
          "font-semibold text-gray-900 text-sm sm:text-base break-words min-w-0",
          upper && "uppercase"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// local clsx para no importar otro paquete si ya no lo tienes en este file
function clsx(...args) {
  return args.filter(Boolean).join(" ");
}
