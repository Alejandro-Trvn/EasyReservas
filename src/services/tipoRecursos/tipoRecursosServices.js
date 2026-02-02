import { api } from "../apiClient";

export async function listarTipoRecursos() {
  try {
    const res = await api.get("/tipos-recursos");
    return res.data;
  } catch (error) {
    // Re-lanzar para que el consumidor lo maneje
    throw error;
  }
}

export async function crearTipoRecurso(payload) {
  try {
    const res = await api.post("/tipos-recursos", payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function editarTipoRecurso(id, payload) {
  try {
    const res = await api.put(`/tipos-recursos/${id}`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function eliminarTipoRecurso(id) {
  try {
    const res = await api.delete(`/tipos-recursos/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export default { listarTipoRecursos, crearTipoRecurso, editarTipoRecurso, eliminarTipoRecurso };
