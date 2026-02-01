import { api } from "../apiClient";

export async function listarUsuarios() {
  try {
    const res = await api.get("/usuarios");
    return res.data;
  } catch (error) {
    // Re-lanzar para que el consumidor lo maneje
    throw error;
  }
}

export async function crearUsuario(payload) {
  try {
    const res = await api.post("/usuarios", payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export default { listarUsuarios, crearUsuario };
