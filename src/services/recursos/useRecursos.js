import { useEffect, useState, useCallback } from "react";
import { listarRecursos, crearRecurso, editarRecurso, eliminarRecurso } from "./recursosServices";

export default function useRecursos() {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarRecursos();
      setRecursos(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecursos();
  }, [fetchRecursos]);

  async function createRecurso(payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await crearRecurso(payload);
      await fetchRecursos();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateRecurso(id, payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await editarRecurso(id, payload);
      await fetchRecursos();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecurso(id) {
    setLoading(true);
    setError(null);
    try {
      const data = await eliminarRecurso(id);
      await fetchRecursos();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { recursos, loading, error, refetch: fetchRecursos, createRecurso, updateRecurso, deleteRecurso };
}
