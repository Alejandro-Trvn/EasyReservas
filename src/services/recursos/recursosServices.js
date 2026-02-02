import { api } from "../apiClient";

export async function listarRecursos() {
  try {
    const res = await api.get("/recursos");
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function crearRecurso(payload) {
  try {
    const res = await api.post("/recursos", payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function editarRecurso(id, payload) {
  try {
    const res = await api.put(`/recursos/${id}`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function eliminarRecurso(id) {
  try {
    const res = await api.delete(`/recursos/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export default { listarRecursos, crearRecurso, editarRecurso, eliminarRecurso };
