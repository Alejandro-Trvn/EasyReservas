// src/pages/UserDashboard.jsx
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Home, Users, Activity } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import useEstadisticas from "../services/estadisticas/useEstadisticas";

export default function UserDashboard() {
  const { user } = useAuth();

  const { historico, historicoLoading, fetchHistoricoReservasUsuario } =
    useEstadisticas();

  useEffect(() => {
    if (user?.id) fetchHistoricoReservasUsuario(user.id).catch(() => { });
  }, [user?.id, fetchHistoricoReservasUsuario]);

  const totalReservas = historico?.total_reservas ?? 0;
  const reservasActivas = historico?.reservas_activas ?? 0;
  const recursosReservados = Array.isArray(historico?.reservas)
    ? new Set(historico.reservas.map((r) => r.recurso)).size
    : 0;

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
      <SectionHeader
        title="Mi Panel"
        subtitle={`Resumen para ${user?.name || "Usuario"}`}
        Icon={Home}
        textColor="#ffffff"
        bgColor="linear-gradient(to right, #134224, #22c55e)"
      />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          label="Mis Reservas"
          value={historicoLoading ? <Spinner /> : totalReservas}
          Icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <MetricCard
          label="Reservas Activas"
          value={historicoLoading ? <Spinner /> : reservasActivas}
          Icon={Users}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        <MetricCard
          label="Recursos Reservados"
          value={historicoLoading ? <Spinner /> : recursosReservados}
          Icon={Home}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Información
        </h3>

        <div className="space-y-2 sm:space-y-3">
          <InfoRow label="Usuario" value={user?.name || "—"} />
          <InfoRow label="Email" value={user?.email || "—"} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-gray-500 text-xs sm:text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>

        <div className={clsx(iconBg, "p-3 rounded-xl shrink-0")}>
          <Icon size={28} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600 text-sm">{label}:</span>
      <span className="font-semibold text-gray-900 text-sm sm:text-base break-words min-w-0">
        {value}
      </span>
    </div>
  );
}

// local clsx para no depender de imports extra en este archivo
function clsx(...args) {
  return args.filter(Boolean).join(" ");
}
