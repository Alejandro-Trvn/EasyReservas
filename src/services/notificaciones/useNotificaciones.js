import { useCallback, useEffect, useState } from "react";
import { listarNotificaciones, marcarNotificacionComoLeida, marcarTodasLeidas as serviceMarcarTodasLeidas } from "./notificacionesServices";

export default function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotificaciones = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarNotificaciones(params);
      setNotificaciones(data || []);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // fetch on mount
    fetchNotificaciones().catch(() => {});
  }, [fetchNotificaciones]);

  const refetch = async (params = {}) => fetchNotificaciones(params);

  const marcarComoLeida = async (id) => {
    // mark on server, then update local state
    setLoading(true);
    setError(null);
    try {
      const data = await marcarNotificacionComoLeida(id);
      setNotificaciones((prev) => {
        if (!prev) return prev;
        return prev.map((n) => {
          if (!n) return n;
          // if server returned updated object, replace; else mark locally
          if (data && data.id && data.id === n.id) return data;
          if (n.id === id) return { ...n, leida: true, read: true };
          return n;
        });
      });
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const marcarTodasLeidas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceMarcarTodasLeidas();
      setNotificaciones((prev) => {
        if (!prev) return prev;
        // if server returned updated list, use it; otherwise mark locally
        if (Array.isArray(data)) return data;
        return prev.map((n) => (n ? { ...n, leida: true, read: true } : n));
      });
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { notificaciones, loading, error, refetch, fetchNotificaciones, marcarComoLeida, marcarTodasLeidas };
}
