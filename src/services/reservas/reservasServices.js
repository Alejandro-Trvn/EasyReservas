import { api } from "../apiClient";

export async function listarReservas(params = {}) {
  try {
    const res = await api.get("/reservas", { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function crearReserva(payload) {
  try {
    const res = await api.post("/reservas", payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function editarReserva(id, payload) {
  try {
    const res = await api.put(`/reservas/${id}`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function cancelarReserva(id) {
  try {
    // backend expects a PUT to mark reservation as cancelled
    const res = await api.put(`/reservas/${id}/cancelar`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export default { listarReservas, crearReserva, editarReserva, cancelarReserva };
