import { useEffect, useState, useCallback } from "react";
import { listarReservas, crearReserva, editarReserva, cancelarReserva } from "./reservasServices";

export default function useReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchReservas = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarReservas(params);
      setReservas(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const refetch = async (params = {}) => fetchReservas(params);

  const createReserva = async (payload = {}) => {
    setCreating(true);
    setError(null);
    try {
      const data = await crearReserva(payload);
      setReservas((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const updateReserva = async (id, payload = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await editarReserva(id, payload);
      // refresh list after update
      await fetchReservas();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelReserva = async (id) => {
    // Note: `cancelarReserva` uses PUT /reservas/{id}/cancelar on the backend
    setLoading(true);
    setError(null);
    try {
      const data = await cancelarReserva(id);
      // refresh list after cancel
      await fetchReservas();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reservas, loading, creating, error, refetch, createReserva, updateReserva, cancelReserva };
}
