import React from "react";
import SectionHeader from "../../components/SectionHeader";
import Select from "../../components/Select";
import DateRangePicker from "../../components/DateRangePicker";
import Button from "../../components/Button";
import TablaMinimalista from "../../components/Table/Table";
import ScreenLoader from "../../components/ScreenLoader";
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
import { BarChart } from "lucide-react";
import ChartDataLabels from "chartjs-plugin-datalabels";
import useUsuarios from "../../services/usuarios/useUsuarios";
import useEstadisticas from "../../services/estadisticas/useEstadisticas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

/* ---------------- Helpers ---------------- */

function formatISODate(d) {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getReservaEstado(r) {
  if (!r) return { text: "—", tone: "neutral" };

  const resEstado = (r.estado || "").toString().toLowerCase();

  const isCancelled =
    resEstado === "cancelada" ||
    resEstado === "cancelado" ||
    resEstado === "canceled" ||
    resEstado === "cancelled" ||
    r.cancelado === true ||
    r.cancelado === 1;

  const isFinalized =
    resEstado === "finalizada" ||
    resEstado === "finalizado" ||
    resEstado === "finished" ||
    resEstado.includes("final") ||
    r.finalizado === true ||
    r.finalizado === 1;

  const isActive =
    resEstado === "activa" || resEstado === "activo" || resEstado === "active";

  if (isCancelled) return { text: "Cancelada", tone: "red" };
  if (isFinalized) return { text: "Finalizada", tone: "amber" };
  if (isActive) return { text: "Activa", tone: "emerald" };

  return { text: r.estado || "—", tone: "neutral" };
}

function EstadoPill({ estado }) {
  const tone = estado?.tone || "neutral";
  const base = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border";

  const cls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "red"
        ? "bg-red-50 text-red-700 border-red-100"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700 border-amber-100"
          : "bg-slate-50 text-slate-700 border-slate-200";

  return <span className={`${base} ${cls}`}>{estado?.text || "—"}</span>;
}

function MiniBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-md h-2 overflow-hidden">
      <div className="h-2 bg-emerald-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-semibold text-slate-500 shrink-0">{label}:</div>
      <div className="text-sm text-slate-800 text-right break-words min-w-0">{value}</div>
    </div>
  );
}

/* ---------------- Page ---------------- */

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

  // ✅ isMobile sin window.innerWidth (mismo patrón)
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  React.useEffect(() => {
    fetchRecursosMasUtilizados().catch(() => { });
  }, [fetchRecursosMasUtilizados]);

  const userOptions = (usuarios || []).map((u) => ({
    value: u.id,
    label: `${u.name} (${u.email || ""})`,
  }));

  const estadoOptions = [
    { value: "all", label: "Todas" },
    { value: "activa", label: "Activa" },
    { value: "cancelada", label: "Cancelada" },
    { value: "finalizada", label: "Finalizada" },
  ];

  const estadoSelected = estadoOptions.find((o) => o.value === estadoFilter) || estadoOptions[0];

  const reservasColumns = [
    { key: "recurso", title: "Recurso" },
    { key: "fecha_inicio", title: "Fecha inicio" },
    { key: "fecha_fin", title: "Fecha fin" },
    { key: "estado", title: "Estado", align: "center", width: "120px" },
    { key: "comentarios", title: "Comentarios" },
  ];

  const reservasRows = (historico?.reservas || []).map((r) => {
    const estado = getReservaEstado(r);
    return {
      id: r.id,
      recurso: r.recurso || "—",
      fecha_inicio: r.fecha_inicio || "—",
      fecha_fin: r.fecha_fin || "—",
      estado: (
        <div className="text-center">
          <EstadoPill estado={estado} />
        </div>
      ),
      comentarios: r.comentarios || "—",
    };
  });

  const recursosRows = (recursosMasUtilizados || []).map((r) => ({
    id: r.id,
    nombre: r.nombre || r.name || "—",
    ubicacion: r.ubicacion || "—",
    capacidad: r.capacidad ?? "—",
    tipo: r.tipo_recurso?.nombre || "—",
    total_reservas: r.total_reservas ?? 0,
  }));

  const maxRecursos = Math.max(0, ...(recursosRows.map((r) => r.total_reservas || 0)));

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
    scales: { x: { ticks: { precision: 0 } } },
  };

  function runConsultaUsuario() {
    if (!selectedUser) return;

    const params = {};
    if (estadoFilter && estadoFilter !== "all") params.estado = estadoFilter;
    if (range.from) params.fecha_desde = formatISODate(range.from);
    if (range.to) params.fecha_hasta = formatISODate(range.to);

    fetchHistoricoReservasUsuario(selectedUser.value, params).catch(() => { });
  }

  // ✅ auto fetch cuando cambian filtros (si hay usuario)
  React.useEffect(() => {
    if (!selectedUser) return;
    runConsultaUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, estadoFilter, range]);

  const finalizadasCalc = (() => {
    if (!historico) return 0;
    const act = historico.reservas_activas ?? 0;
    const canc = historico.reservas_canceladas ?? 0;
    if (historico.reservas_finalizadas != null) return historico.reservas_finalizadas;
    if (historico.total_reservas != null) return Math.max(0, historico.total_reservas - act - canc);
    return 0;
  })();

  return (
    <div className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Usuarios y Recursos"
        subtitle="Estadísticas por usuario y recurso"
        Icon={BarChart}
        bgColor="linear-gradient(to right, #134224, #22c55e)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScreenLoader loading={recursosLoading} message={"Cargando recursos..."} color="#329c68" />

        {/* Left: historial usuario */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-3">
              <div className="w-full md:w-80">
                <Select
                  options={userOptions}
                  value={selectedUser}
                  onChange={(v) => setSelectedUser(v)}
                  placeholder={usersLoading ? "Cargando usuarios..." : "Seleccionar usuario"}
                  isClearable={true}
                />
              </div>

              <div className="w-full md:w-44">
                <Select
                  options={estadoOptions}
                  value={estadoSelected}
                  onChange={(opt) => setEstadoFilter(opt?.value || "all")}
                />
              </div>

              <div className="w-full md:w-80">
                <DateRangePicker value={range} onChange={(v) => setRange(v)} />
              </div>

              <div className="mt-1 md:mt-0">
                <Button onClick={runConsultaUsuario} variant="primary">
                  Consultar
                </Button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-gray-100">
            {historicoLoading ? (
              <div className="text-sm text-gray-600">Cargando histórico...</div>
            ) : historicoError ? (
              <div className="text-sm text-red-600">Error cargando histórico.</div>
            ) : !historico ? (
              <div className="text-sm text-gray-500">
                Selecciona un usuario para ver su histórico.
              </div>
            ) : (
              <>
                {/* Totales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <StatCard
                    label="Total reservas"
                    value={historico.total_reservas ?? 0}
                    cls="bg-indigo-50 border-indigo-100"
                    sub="text-indigo-600"
                    text="text-indigo-900"
                  />
                  <StatCard
                    label="Reservas activas"
                    value={historico.reservas_activas ?? 0}
                    cls="bg-emerald-50 border-emerald-100"
                    sub="text-emerald-600"
                    text="text-emerald-900"
                  />
                  <StatCard
                    label="Reservas canceladas"
                    value={historico.reservas_canceladas ?? 0}
                    cls="bg-red-50 border-red-100"
                    sub="text-red-600"
                    text="text-red-900"
                  />
                  <StatCard
                    label="Reservas finalizadas"
                    value={finalizadasCalc}
                    cls="bg-amber-50 border-amber-100"
                    sub="text-amber-600"
                    text="text-amber-900"
                  />
                </div>

                {/* ✅ Mobile: cards | Desktop: tabla */}
                {isMobile ? (
                  <div className="space-y-3">
                    {(historico?.reservas || []).length === 0 ? (
                      <div className="text-sm text-gray-500">No hay reservas en este periodo.</div>
                    ) : (
                      (historico?.reservas || []).map((r) => (
                        <ReservaCard key={r.id} r={r} />
                      ))
                    )}
                  </div>
                ) : (
                  <TablaMinimalista
                    columns={reservasColumns}
                    rows={reservasRows}
                    dotKeys={[]}
                    bodyClassName="text-sm text-slate-700"
                    headerBg={"bg-blue-100 border-b border-blue-600"}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: recursos mas utilizados */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recursos más utilizados</div>
              <div className="text-xs text-gray-500">Top recursos por número de reservas</div>
            </div>
            <Button onClick={() => fetchRecursosMasUtilizados().catch(() => { })}>
              Actualizar
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-gray-100">
            {recursosLoading ? (
              <div className="text-sm text-gray-600">Cargando recursos...</div>
            ) : recursosError ? (
              <div className="text-sm text-red-600">Error cargando recursos.</div>
            ) : recursosRows.length === 0 ? (
              <div className="text-sm text-gray-500">No hay datos.</div>
            ) : (
              <>
                {/* ✅ Mobile: cards + minibars */}
                <div className="space-y-3 sm:hidden">
                  {recursosRows.slice(0, 10).map((r) => (
                    <div key={r.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-bold text-slate-900 truncate">{r.nombre}</div>
                          <div className="mt-0.5 text-xs text-slate-500 truncate">{r.ubicacion}</div>
                        </div>
                        <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100">
                          {r.total_reservas}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        <InfoLine label="Tipo" value={r.tipo} />
                        <InfoLine label="Capacidad" value={r.capacidad} />
                        <MiniBar value={r.total_reservas} max={maxRecursos} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Desktop: chart */}
                <div className="hidden sm:block">
                  <div className="h-80">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI Helpers ---------------- */

function StatCard({ label, value, cls, text, sub }) {
  return (
    <div className={`p-3 rounded-xl border ${cls}`}>
      <div className={`text-xs ${sub}`}>{label}</div>
      <div className={`text-2xl font-bold ${text}`}>{value}</div>
    </div>
  );
}

function ReservaCard({ r }) {
  const estado = getReservaEstado(r);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-900 truncate">
            {r.recurso || "—"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 truncate">
            #{r.id}
          </div>
        </div>

        <span className="shrink-0">
          <EstadoPill estado={estado} />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
        <InfoLine label="Inicio" value={r.fecha_inicio || "—"} />
        <InfoLine label="Fin" value={r.fecha_fin || "—"} />
        <InfoLine label="Comentarios" value={r.comentarios || "—"} />
      </div>
    </div>
  );
}
