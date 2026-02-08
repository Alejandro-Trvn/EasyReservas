import React, { useEffect, useMemo, useState } from "react";
import DateRangePicker from "../../components/DateRangePicker";
import Button from "../../components/Button";
import useEstadisticas from "../../services/estadisticas/useEstadisticas";
import { BarChart2 } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import ScreenLoader from "../../components/ScreenLoader";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

const barOptionsCommon = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: {
      anchor: "end",
      align: "end",
      formatter: (value) => value,
      color: "#065f46",
      font: { weight: "600" },
    },
  },
  scales: { x: { ticks: { maxRotation: 0 } } },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
    datalabels: {
      formatter: (value) => value,
      color: "#ffffff",
      font: { weight: "600" },
    },
  },
};

function formatISODate(d) {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EstadisticasPage() {
  const { estadisticas, loading, error, fetchEstadisticas } = useEstadisticas();

  // ✅ año anterior como default
  const defaultRange = useMemo(() => {
    const y = new Date().getFullYear() - 1;
    return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
  }, []);

  const [range, setRange] = useState(defaultRange);

  const buildParams = (r) => {
    const params = {};
    if (r?.from) params.fecha_desde = formatISODate(r.from);
    if (r?.to) params.fecha_hasta = formatISODate(r.to);
    return params;
  };

  const handleConsultar = async () => {
    try {
      await fetchEstadisticas(buildParams(range));
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ una sola consulta inicial usando el range default
  useEffect(() => {
    fetchEstadisticas(buildParams(defaultRange)).catch(() => { });
  }, [fetchEstadisticas, defaultRange]);

  const topUsers = Array.isArray(estadisticas?.top_usuarios)
    ? estadisticas.top_usuarios
    : [];

  const byTipo = Array.isArray(estadisticas?.reservas_por_tipo_recurso)
    ? estadisticas.reservas_por_tipo_recurso
    : [];

  const totalReservas = estadisticas?.totales?.total_reservas ?? 0;
  const reservasActivas = estadisticas?.totales?.reservas_activas ?? 0;
  const reservasCanceladas = estadisticas?.totales?.reservas_canceladas ?? 0;

  const reservasFinalizadas =
    estadisticas?.totales?.reservas_finalizadas ??
    (totalReservas != null && reservasActivas != null && reservasCanceladas != null
      ? Math.max(0, totalReservas - reservasActivas - reservasCanceladas)
      : 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Estadísticas"
        subtitle="Visión general del uso del sistema por periodo"
        Icon={BarChart2}
        textColor="#ffffff"
        bgColor="linear-gradient(to right, #134224, #22c55e)"
        note="Selecciona un rango de fechas para consultar los datos."
      />

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 relative">
        <ScreenLoader
          loading={loading}
          message={"Cargando estadísticas..."}
          color="#329c68"
        />

        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6">
          <div className="w-full md:w-80">
            <DateRangePicker value={range} onChange={(v) => setRange(v)} />
          </div>

          <div className="mt-3 md:mt-0">
            <Button onClick={handleConsultar} variant="primary">
              Consultar
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600">
            Error cargando estadísticas.
          </div>
        )}

        {!estadisticas ? null : (
          <div className="space-y-6">
            {/* Totales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total reservas"
                value={totalReservas}
                cls="bg-indigo-50 border-indigo-100"
                text="text-indigo-900"
                sub="text-indigo-600"
              />
              <StatCard
                label="Reservas activas"
                value={reservasActivas}
                cls="bg-emerald-50 border-emerald-100"
                text="text-emerald-900"
                sub="text-emerald-600"
              />
              <StatCard
                label="Reservas canceladas"
                value={reservasCanceladas}
                cls="bg-red-50 border-red-100"
                text="text-red-900"
                sub="text-red-600"
              />
              <StatCard
                label="Reservas finalizadas"
                value={reservasFinalizadas}
                cls="bg-amber-50 border-amber-100"
                text="text-amber-900"
                sub="text-amber-600"
              />
            </div>

            {/* Promedios + Top usuarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-amber-900">
                    Promedios
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-amber-700">
                      Reservas por usuario
                    </div>
                    <div className="text-lg font-bold text-amber-900">
                      {estadisticas.promedios?.reservas_por_usuario ?? 0}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-amber-700">
                      Reservas por recurso
                    </div>
                    <div className="text-lg font-bold text-amber-900">
                      {estadisticas.promedios?.reservas_por_recurso ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="text-sm font-semibold mb-3">Top usuarios</div>

                {topUsers.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay datos</div>
                ) : (
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: topUsers.map((u) => u.usuario),
                        datasets: [
                          {
                            label: "Reservas",
                            data: topUsers.map((u) => u.total_reservas || 0),
                            backgroundColor: "rgba(16,185,129,0.8)",
                          },
                        ],
                      }}
                      options={barOptionsCommon}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Por tipo + Doughnut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="text-sm font-semibold mb-3">
                  Reservas por tipo de recurso
                </div>

                {byTipo.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay datos</div>
                ) : (
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: byTipo.map((t) => t.tipo),
                        datasets: [
                          {
                            label: "Reservas",
                            data: byTipo.map((t) => t.total_reservas || 0),
                            backgroundColor: "rgba(56,189,248,0.9)",
                          },
                        ],
                      }}
                      options={barOptionsCommon}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="text-sm font-semibold mb-3">
                  Activas vs Canceladas
                </div>

                <div className="h-64 max-w-sm mx-auto">
                  <Doughnut
                    data={{
                      labels: ["Activas", "Canceladas", "Finalizadas"],
                      datasets: [
                        {
                          data: [
                            reservasActivas ?? 0,
                            reservasCanceladas ?? 0,
                            reservasFinalizadas ?? 0,
                          ],
                          backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
                        },
                      ],
                    }}
                    options={doughnutOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI Helpers ---------------- */

function StatCard({ label, value, cls, text, sub }) {
  return (
    <div className={`p-4 rounded-xl border ${cls}`}>
      <div className={`text-xs ${sub}`}>{label}</div>
      <div className={`text-2xl font-bold ${text}`}>{value}</div>
    </div>
  );
}
