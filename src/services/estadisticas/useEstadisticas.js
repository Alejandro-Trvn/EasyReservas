import { useCallback, useEffect, useState } from "react";
import { listarEstadisticas, obtenerHistoricoReservasUsuario, verRecursosMasUtilizados } from "./estadisticasServices";

export default function useEstadisticas() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEstadisticas = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarEstadisticas(params);
      setEstadisticas(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const [historico, setHistorico] = useState(null);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoError, setHistoricoError] = useState(null);

  const [recursosMasUtilizados, setRecursosMasUtilizados] = useState(null);
  const [recursosLoading, setRecursosLoading] = useState(false);
  const [recursosError, setRecursosError] = useState(null);

  const fetchHistoricoReservasUsuario = useCallback(async (userId, params = {}) => {
    setHistoricoLoading(true);
    setHistoricoError(null);
    try {
      const data = await obtenerHistoricoReservasUsuario(userId, params);
      setHistorico(data);
      return data;
    } catch (err) {
      setHistoricoError(err);
      throw err;
    } finally {
      setHistoricoLoading(false);
    }
  }, []);

  const fetchRecursosMasUtilizados = useCallback(async (params = {}) => {
    setRecursosLoading(true);
    setRecursosError(null);
    try {
      const data = await verRecursosMasUtilizados(params);
      setRecursosMasUtilizados(data);
      return data;
    } catch (err) {
      setRecursosError(err);
      throw err;
    } finally {
      setRecursosLoading(false);
    }
  }, []);

  useEffect(() => {
    // no fetch automático by default; consumer can call fetchEstadisticas or refetch()
  }, [fetchEstadisticas]);

  const refetch = async (params = {}) => fetchEstadisticas(params);

  return {
    estadisticas,
    loading,
    error,
    refetch,
    fetchEstadisticas,
    // histórico por usuario
    historico,
    historicoLoading,
    historicoError,
    fetchHistoricoReservasUsuario,
    // recursos más utilizados
    recursosMasUtilizados,
    recursosLoading,
    recursosError,
    fetchRecursosMasUtilizados,
  };
}
