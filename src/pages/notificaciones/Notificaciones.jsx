// src/pages/notificaciones/Notificaciones.jsx  (o tu ruta actual)
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import Alert, { showAlert } from "../../components/Alert";
import ScreenLoader from "../../components/ScreenLoader";
import Paginador from "../../components/Table/Paginador";
import useNotificaciones from "../../services/notificaciones/useNotificaciones";

export const Notificaciones = () => {
  const {
    notificaciones = [],
    loading,
    error,
    refetch,
    marcarComoLeida,
    marcarTodasLeidas,
  } = useNotificaciones();

  // Paginación cliente
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalItems = (notificaciones || []).length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalItems, totalPages, currentPage]);

  const unreadCount = (notificaciones || []).filter((n) => !n.leida).length;

  const handleMarkAll = async () => {
    try {
      await marcarTodasLeidas();
      await refetch();
    } catch (e) {
      // ignore
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await marcarComoLeida(id);
      await refetch();
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
      showAlert({
        type: "success",
        title: "Copiado",
        text: "Mensaje copiado al portapapeles",
        autoClose: true,
        timeout: 1400,
      });
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

  const visible = (notificaciones || []).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notificaciones"
        subtitle="Centro de notificaciones del sistema"
        Icon={Bell}
        bgColor="linear-gradient(to right, #134224, #22c55e)"
        textColor="#ffffff"
      />

      {/* Top bar responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-sm text-gray-600 truncate">Últimas notificaciones</div>
          {unreadCount > 0 && (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              {unreadCount} sin leer
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={[
              "w-full sm:w-auto px-3 py-2 rounded-lg bg-white border text-sm text-gray-700 hover:shadow",
              loading ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            Refrescar
          </button>

          <button
            onClick={handleMarkAll}
            disabled={loading || totalItems === 0}
            className={[
              "w-full sm:w-auto px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:opacity-90",
              (loading || totalItems === 0) ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 px-3 sm:px-0">
        <ScreenLoader loading={loading} message="Cargando notificaciones..." color="#329c68" />

        {loading && <div className="text-gray-600">Cargando notificaciones...</div>}
        {error && <div className="text-red-600">Error cargando notificaciones.</div>}

        {!loading && notificaciones.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-gray-600">
            No hay notificaciones
          </div>
        )}

        {visible.map((n) => (
          <article
            key={n.id}
            className={[
              "rounded-2xl shadow-sm bg-white border overflow-hidden",
              n.leida ? "border-gray-100" : "border-emerald-100 ring-1 ring-emerald-100",
            ].join(" ")}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 grid place-items-center shrink-0">
                  <Bell size={18} className="text-emerald-600" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title + date responsive */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {n.titulo || "Notificación"}
                      </h3>

                      {/* Fecha debajo en móvil para evitar overflow */}
                      <div className="sm:hidden text-xs text-gray-500 mt-0.5">
                        {n.created_at ? new Date(n.created_at).toLocaleString() : "—"}
                      </div>
                    </div>

                    {/* Fecha a la derecha en desktop */}
                    <div className="hidden sm:block text-xs text-gray-500 shrink-0 whitespace-nowrap">
                      {n.created_at ? new Date(n.created_at).toLocaleString() : "—"}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-1 break-words">
                    {n.mensaje || "—"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {!n.leida ? (
                      <button
                        onClick={() => handleMarkOne(n.id)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
                      >
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                        <span className="sm:hidden">Leída</span>
                        <span className="hidden sm:inline">Marcar como leída</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Leída
                      </span>
                    )}

                    <button
                      onClick={() => handleCopyMessage(n.mensaje)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      <span className="sm:hidden">Copiar</span>
                      <span className="hidden sm:inline">Copiar mensaje</span>
                    </button>

                    {!n.leida && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Sin leer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="px-3 sm:px-0">
        <Paginador
          totalItems={totalItems}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <Alert />
    </div>
  );
};

export default Notificaciones;
