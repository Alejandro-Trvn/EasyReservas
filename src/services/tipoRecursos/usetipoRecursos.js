import { useEffect, useState, useCallback } from "react";
import { listarTipoRecursos, crearTipoRecurso, editarTipoRecurso, eliminarTipoRecurso } from "./tipoRecursosServices";

export default function useTipoRecursos() {
  const [tipoRecursos, setTipoRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTipoRecursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarTipoRecursos();
      setTipoRecursos(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipoRecursos();
  }, [fetchTipoRecursos]);

  async function createTipoRecurso(payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await crearTipoRecurso(payload);
      await fetchTipoRecursos();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTipoRecurso(id, payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await editarTipoRecurso(id, payload);
      await fetchTipoRecursos();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteTipoRecurso(id) {
    setLoading(true);
    setError(null);
    try {
      const data = await eliminarTipoRecurso(id);
      await fetchTipoRecursos();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { tipoRecursos, loading, error, refetch: fetchTipoRecursos, createTipoRecurso, updateTipoRecurso, deleteTipoRecurso };
}
