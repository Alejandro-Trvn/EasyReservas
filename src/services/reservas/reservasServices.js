import { api } from "../apiClient";

export async function listarReservas(params = {}) {
  try {
    const res = await api.get("/reservas", { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export default { listarReservas };
