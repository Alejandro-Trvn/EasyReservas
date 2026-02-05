import { api } from "../apiClient";

export async function listarNotificaciones(params = {}) {
  try {
    const res = await api.get("/notificaciones", { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function marcarNotificacionComoLeida(id) {
  try {
    const res = await api.put(`/notificaciones/${id}/leer`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function marcarTodasLeidas() {
  try {
    const res = await api.put(`/notificaciones/marcar-todas-leidas`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export default { listarNotificaciones, marcarNotificacionComoLeida, marcarTodasLeidas };
