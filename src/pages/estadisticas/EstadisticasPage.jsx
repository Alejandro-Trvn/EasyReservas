import React from "react";
import DateRangePicker from "../../components/DateRangePicker";
import Button from "../../components/Button";
import useEstadisticas from "../../services/estadisticas/useEstadisticas";
import { BarChart2 } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const barOptionsCommon = {
  responsive: true,
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

function SmallBar({ value, max, color = "bg-emerald-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-md h-3 overflow-hidden">
      <div className={`${color} h-3`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EstadisticasPage() {
  const { estadisticas, loading, error, fetchEstadisticas } = useEstadisticas();
  const [range, setRange] = React.useState(() => {
    const y = new Date().getFullYear() - 1;
    return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
  });

  const handleConsultar = async () => {
    const params = {};
    if (range.from) params.fecha_desde = formatISODate(range.from);
    if (range.to) params.fecha_hasta = formatISODate(range.to);
    try {
      await fetchEstadisticas(params);
    } catch (e) {
      console.error(e);
    }
  };

  const topUsers = estadisticas?.top_usuarios || [];
  const byTipo = estadisticas?.reservas_por_tipo_recurso || [];
  const maxTop = Math.max(0, ...(topUsers.map((t) => t.total_reservas || 0)));
  const maxTipo = Math.max(0, ...(byTipo.map((t) => t.total_reservas || 0)));
  const reservasActivas = estadisticas?.totales?.reservas_activas ?? 0;
  const reservasCanceladas = estadisticas?.totales?.reservas_canceladas ?? 0;
  const reservasFinalizadas = estadisticas?.totales?.reservas_finalizadas ?? (
    (estadisticas?.totales?.total_reservas != null && reservasActivas != null && reservasCanceladas != null)
      ? Math.max(0, estadisticas.totales.total_reservas - reservasActivas - reservasCanceladas)
      : 0
  );

  return (
    <div className="p-6 space-y-6">
      <SectionHeader
        title="Estadísticas"
        subtitle="Visión general del uso del sistema por periodo"
        Icon={BarChart2}
        textColor="#ffffff"
        bgColor="linear-gradient(90deg,#059669,#0ea5e9)"
        topOffset="-3rem"
        note={"Selecciona un rango de fechas para consultar los datos."}
      />

      <div className="bg-white rounded-md shadow p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6">
          <div className="w-full md:w-80">
            <DateRangePicker value={range} onChange={(v) => setRange(v)} />
          </div>

          <div className="mt-3 md:mt-0">
            <Button onClick={handleConsultar} variant="primary">Consultar</Button>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-600">Cargando estadísticas...</div>}
        {error && <div className="text-sm text-red-600">Error cargando estadísticas.</div>}

        {estadisticas && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-md bg-indigo-50 border border-indigo-100">
                <div className="text-xs text-indigo-600">Total reservas</div>
                <div className="text-2xl font-bold text-indigo-900">{estadisticas.totales?.total_reservas ?? 0}</div>
              </div>
              <div className="p-4 rounded-md bg-emerald-50 border border-emerald-100">
                <div className="text-xs text-emerald-600">Reservas activas</div>
                <div className="text-2xl font-bold text-emerald-900">{reservasActivas ?? 0}</div>
              </div>
              <div className="p-4 rounded-md bg-red-50 border border-red-100">
                <div className="text-xs text-red-600">Reservas canceladas</div>
                <div className="text-2xl font-bold text-red-900">{reservasCanceladas ?? 0}</div>
              </div>
              <div className="p-4 rounded-md bg-amber-50 border border-amber-100">
                <div className="text-xs text-amber-600">Reservas finalizadas</div>
                <div className="text-2xl font-bold text-amber-900">{reservasFinalizadas ?? 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-md bg-amber-50 border border-amber-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-amber-900">Promedios</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-amber-700">Reservas por usuario</div>
                    <div className="text-lg font-bold text-amber-900">{estadisticas.promedios?.reservas_por_usuario ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-700">Reservas por recurso</div>
                    <div className="text-lg font-bold text-amber-900">{estadisticas.promedios?.reservas_por_recurso ?? 0}</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-md border">
                <div className="text-sm font-semibold mb-3">Top usuarios</div>
                {topUsers.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay datos</div>
                ) : (
                  <div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-md border">
                <div className="text-sm font-semibold mb-3">Reservas por tipo de recurso</div>
                {byTipo.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay datos</div>
                ) : (
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
                )}
              </div>

              <div className="p-4 bg-white rounded-md border">
                <div className="text-sm font-semibold mb-3">Activas vs Canceladas</div>
                <div className="max-w-xs mx-auto">
                  <Doughnut
                    data={{
                      labels: ["Activas", "Canceladas", "Finalizadas"],
                      datasets: [
                        {
                          data: [reservasActivas ?? 0, reservasCanceladas ?? 0, reservasFinalizadas ?? 0],
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
