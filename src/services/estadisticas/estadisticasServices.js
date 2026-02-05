import { api } from "../apiClient";

/**
 * Obtiene las estadísticas de uso del sistema.
 * params: { fecha_desde?: string, fecha_hasta?: string, ... }
 */
export async function listarEstadisticas(params = {}) {
  try {
    const res = await api.get("/reservas/reportes/estadisticas", { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene el histórico de reservas de un usuario.
 * GET /reservas/reportes/por-usuario/{id}?estado=activa
 * @param {number|string} userId
 * @param {object} params optional query params (e.g. { estado: 'activa' })
 */
export async function obtenerHistoricoReservasUsuario(userId, params = {}) {
  if (!userId) throw new Error("userId es requerido");
  try {
    const res = await api.get(`/reservas/reportes/por-usuario/${userId}`, { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene los recursos más utilizados.
 * GET /recursos/reportes/mas-utilizados
 * @param {object} params optional query params
 */
export async function verRecursosMasUtilizados(params = {}) {
  try {
    const res = await api.get(`/recursos/reportes/mas-utilizados`, { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export default { listarEstadisticas };
