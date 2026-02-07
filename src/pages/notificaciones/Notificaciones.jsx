import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import Alert, { showAlert } from "../../components/Alert";
import ScreenLoader from "../../components/ScreenLoader";
import Paginador from "../../components/Table/Paginador";
import useNotificaciones from "../../services/notificaciones/useNotificaciones";

export const Notificaciones = () => {
  const { notificaciones = [], loading, error, refetch, marcarComoLeida, marcarTodasLeidas } = useNotificaciones();

  // Paginación cliente
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalItems = (notificaciones || []).length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalItems, totalPages, currentPage]);

  const handleMarkAll = async () => {
    try {
      await marcarTodasLeidas();
    } catch (e) {
      // ignore
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await marcarComoLeida(id);
    } catch (e) {
      // ignore
    }
  };

  const handleCopyMessage = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showAlert({ type: "success", title: "Copiado", text: "Mensaje copiado al portapapeles", autoClose: true, timeout: 1400 });
    } catch (err) {
      showAlert({ type: "fail", title: "Error", text: "No se pudo copiar el mensaje" });
    }
  };

  const handleRefresh = async () => {
    setCurrentPage(1);
    try {
      await refetch();
    } catch (e) {
      // ignore
    }
  };

  const visible = (notificaciones || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notificaciones"
        subtitle="Centro de notificaciones del sistema"
        Icon={Bell}
        bgColor="linear-gradient(90deg,#f59e0b,#ef4444)"
        textColor="#ffffff"
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Últimas notificaciones</div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`px-3 py-1 rounded-lg bg-white border text-sm text-gray-700 hover:shadow ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            Refrescar
          </button>
          <button
            onClick={handleMarkAll}
            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm hover:opacity-90"
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>

      <ScreenLoader loading={loading} message="Cargando notificaciones..." color="#f2f7f6" height={10} width={4} />

      <div className="grid gap-4">
        {loading && <div className="text-gray-600">Cargando notificaciones...</div>}
        {error && <div className="text-red-600">Error cargando notificaciones.</div>}

        {!loading && notificaciones.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-gray-600">No hay notificaciones</div>
        )}

        {visible.map((n) => (
          <article
            key={n.id}
            className={`p-4 rounded-xl shadow-md bg-white border ${n.leida ? "opacity-80" : "ring-1 ring-emerald-100"}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 grid place-items-center">
                <Bell size={20} className="text-emerald-600" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{n.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-1">{n.mensaje}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                    {!n.leida && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Sin leer</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {!n.leida && (
                    <button onClick={() => handleMarkOne(n.id)} className="text-sm text-emerald-600 hover:underline">
                      Marcar como leída
                    </button>
                  )}

                  <button onClick={() => handleCopyMessage(n.mensaje)} className="text-sm text-gray-500 hover:underline">
                    Copiar mensaje
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Paginador totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} />
      <Alert />
    </div>
  );
};

export default Notificaciones;
