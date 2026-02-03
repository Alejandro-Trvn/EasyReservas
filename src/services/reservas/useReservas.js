import { useEffect, useState, useCallback } from "react";
import { listarReservas } from "./reservasServices";

export default function useReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return { reservas, loading, error, refetch };
}
