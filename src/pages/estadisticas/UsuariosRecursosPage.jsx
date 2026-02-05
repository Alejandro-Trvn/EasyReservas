import React from "react";
import SectionHeader from "../../components/SectionHeader";
import Select from "../../components/Select";
import DateRangePicker from "../../components/DateRangePicker";
import Button from "../../components/Button";
import TablaMinimalista from "../../components/Table/Table";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import useUsuarios from "../../services/usuarios/useUsuarios";
import useEstadisticas from "../../services/estadisticas/useEstadisticas";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function UsuariosRecursosPage() {
  const { usuarios, loading: usersLoading } = useUsuarios();
  const {
    historico,
    historicoLoading,
    historicoError,
    fetchHistoricoReservasUsuario,
    recursosMasUtilizados,
    recursosLoading,
    recursosError,
    fetchRecursosMasUtilizados,
  } = useEstadisticas();

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [estadoFilter, setEstadoFilter] = React.useState("all");
  const [range, setRange] = React.useState({ from: null, to: null });

  React.useEffect(() => {
    // load recursos once
    fetchRecursosMasUtilizados().catch(() => {});
  }, [fetchRecursosMasUtilizados]);

  React.useEffect(() => {
    if (!selectedUser) return;
    const params = {};
    if (estadoFilter && estadoFilter !== "all") params.estado = estadoFilter;
    if (range.from) params.fecha_desde = `${range.from.getFullYear()}-${String(range.from.getMonth()+1).padStart(2,'0')}-${String(range.from.getDate()).padStart(2,'0')}`;
    if (range.to) params.fecha_hasta = `${range.to.getFullYear()}-${String(range.to.getMonth()+1).padStart(2,'0')}-${String(range.to.getDate()).padStart(2,'0')}`;

    fetchHistoricoReservasUsuario(selectedUser.value, params).catch(() => {});
  }, [selectedUser, estadoFilter, range, fetchHistoricoReservasUsuario]);

  const userOptions = (usuarios || []).map((u) => ({ value: u.id, label: `${u.name} (${u.email || ""})` }));

  const reservasColumns = [
    { key: "recurso", title: "Recurso" },
    { key: "fecha_inicio", title: "Fecha inicio" },
    { key: "fecha_fin", title: "Fecha fin" },
    { key: "estado", title: "Estado", align: "center", width: "120px" },
    { key: "comentarios", title: "Comentarios" },
  ];

  const recursosColumns = [
    { key: "nombre", title: "Nombre" },
    { key: "ubicacion", title: "Ubicación" },
    { key: "capacidad", title: "Capacidad", align: "center", width: "90px" },
    { key: "tipo", title: "Tipo" },
    { key: "total_reservas", title: "Total reservas", align: "center", width: "120px" },
  ];

  const reservasRows = (historico?.reservas || []).map((r) => ({
    id: r.id,
    recurso: r.recurso || "—",
    fecha_inicio: r.fecha_inicio || "—",
    fecha_fin: r.fecha_fin || "—",
    estado: (() => {
      if (!r) return "—";
      const resEstado = (r.estado || "").toString().toLowerCase();
      if (resEstado === "cancelada" || resEstado === "cancelado" || resEstado === "canceled" || resEstado === "cancelled") return "Cancelada";
      if (resEstado === "finalizada" || resEstado === "finalizado" || resEstado === "finished" || resEstado.includes("final")) return "Finalizada";
      if (resEstado === "activa" || resEstado === "activo" || resEstado === "active") return "Activa";
      if (r.cancelado === true || r.cancelado === 1) return "Cancelada";
      if (r.finalizado === true || r.finalizado === 1) return "Finalizada";
      return r.estado || "—";
    })(),
    comentarios: r.comentarios || "—",
  }));

  const recursosRows = (recursosMasUtilizados || []).map((r) => ({
    id: r.id,
    nombre: r.nombre || r.name || "—",
    ubicacion: r.ubicacion || "—",
    capacidad: r.capacidad ?? "—",
    tipo: r.tipo_recurso?.nombre || "—",
    total_reservas: r.total_reservas ?? 0,
  }));

  const chartData = {
    labels: (recursosMasUtilizados || []).map((r) => r.nombre || r.name || "-"),
    datasets: [
      {
        label: "Reservas",
        data: (recursosMasUtilizados || []).map((r) => r.total_reservas ?? 0),
        backgroundColor: "rgba(16,185,129,0.9)",
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
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
    scales: { x: { ticks: { precision: 0 } } },
  };

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Usuarios y Recursos" subtitle="Estadísticas por usuario y recurso" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: historial usuario */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-md shadow p-4 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end md:gap-4">
              <div className="w-full md:w-80">
                <Select
                  options={userOptions}
                  value={selectedUser}
                  onChange={(v) => setSelectedUser(v)}
                  placeholder={usersLoading ? "Cargando usuarios..." : "Seleccionar usuario"}
                  isClearable={true}
                />
              </div>

              <div className="w-40">
                <Select
                  options={[
                    { value: 'all', label: 'Todas' },
                    { value: 'activa', label: 'Activa' },
                    { value: 'cancelada', label: 'Cancelada' },
                    { value: 'finalizada', label: 'Finalizada' },
                  ]}
                  value={{ value: estadoFilter, label: estadoFilter === 'all' ? 'Todas' : (estadoFilter === 'activa' ? 'Activa' : estadoFilter === 'cancelada' ? 'Cancelada' : estadoFilter === 'finalizada' ? 'Finalizada' : estadoFilter) }}
                  onChange={(opt) => setEstadoFilter(opt?.value || 'all')}
                />
              </div>

              <div className="w-full md:w-80">
                <DateRangePicker value={range} onChange={(v) => setRange(v)} />
              </div>

              <div className="mt-3 md:mt-0">
                <Button onClick={() => {
                  if (selectedUser) {
                    const params = {};
                    if (estadoFilter && estadoFilter !== 'all') params.estado = estadoFilter;
                    fetchHistoricoReservasUsuario(selectedUser.value, params).catch(() => {});
                  }
                }}>Consultar</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow p-4 border border-gray-100">
            {historicoLoading ? (
              <div className="text-sm text-gray-600">Cargando histórico...</div>
            ) : historicoError ? (
              <div className="text-sm text-red-600">Error cargando histórico.</div>
            ) : !historico ? (
              <div className="text-sm text-gray-500">Selecciona un usuario para ver su histórico.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-md bg-indigo-50 border border-indigo-100">
                    <div className="text-xs text-indigo-600">Total reservas</div>
                    <div className="text-2xl font-bold text-indigo-900">{historico.total_reservas ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50 border border-emerald-100">
                    <div className="text-xs text-emerald-600">Reservas activas</div>
                    <div className="text-2xl font-bold text-emerald-900">{historico.reservas_activas ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-md bg-red-50 border border-red-100">
                    <div className="text-xs text-red-600">Reservas canceladas</div>
                    <div className="text-2xl font-bold text-red-900">{historico.reservas_canceladas ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-md bg-amber-50 border border-amber-100">
                    <div className="text-xs text-amber-600">Reservas finalizadas</div>
                    <div className="text-2xl font-bold text-amber-900">{(() => {
                      const act = historico.reservas_activas ?? 0;
                      const canc = historico.reservas_canceladas ?? 0;
                      if (historico.reservas_finalizadas != null) return historico.reservas_finalizadas;
                      if (historico.total_reservas != null) return Math.max(0, historico.total_reservas - act - canc);
                      return 0;
                    })()}</div>
                  </div>
                </div>

                <TablaMinimalista columns={reservasColumns} rows={reservasRows} bodyClassName="text-sm text-slate-700" />
              </>
            )}
          </div>
        </div>

        {/* Right: recursos mas utilizados */}
        <div className="space-y-4">
          <div className="bg-white rounded-md shadow p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recursos más utilizados</div>
              <div className="text-xs text-gray-500">Top recursos por número de reservas</div>
            </div>
            <div>
              <Button onClick={() => fetchRecursosMasUtilizados().catch(() => {})}>Actualizar</Button>
            </div>
          </div>

          <div className="bg-white rounded-md shadow p-4 border border-gray-100">
            {recursosLoading ? (
              <div className="text-sm text-gray-600">Cargando recursos...</div>
            ) : recursosError ? (
              <div className="text-sm text-red-600">Error cargando recursos.</div>
            ) : recursosRows.length === 0 ? (
              <div className="text-sm text-gray-500">No hay datos.</div>
            ) : (
              <div className="mb-4">
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
