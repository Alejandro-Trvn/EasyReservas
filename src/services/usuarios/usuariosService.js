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

export async function verPerfilUsuario(id) {
  try {
    const res = await api.get(`/usuarios/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function editarPerfilUsuario(payload) {
  try {
    // Enviar sólo los campos presentes: name es requerido en payload, email es opcional
    const body = {};
    if (payload == null) payload = {};
    if (payload.name !== undefined && payload.name !== null) body.name = payload.name;
    if (payload.email !== undefined && payload.email !== null) body.email = payload.email;

    const res = await api.put(`/perfil`, body);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function actualizarUsuario(id, payload) {
  try {
    // Enviar solo campos presentes para no sobrescribir datos no deseados.
    const body = {};
    if (payload == null) payload = {};

    if (payload.name !== undefined && payload.name !== null) {
      // permitir cadena vacía si explícita, pero normalmente se evita
      body.name = payload.name;
    }
    if (payload.email !== undefined && payload.email !== null) {
      body.email = payload.email;
    }
    if (payload.role_id !== undefined && payload.role_id !== null) {
      body.role_id = payload.role_id;
    }
    // estado puede ser 0 o 1
    if (payload.estado !== undefined && payload.estado !== null) {
      body.estado = payload.estado;
    }
    // password es opcional: sólo incluir si es una cadena no vacía
    if (typeof payload.password === "string" && payload.password.trim() !== "") {
      body.password = payload.password;
    }

    const res = await api.put(`/usuarios/${id}`, body);
    return res.data;
  } catch (error) {
    // Re-lanzar para que el consumidor lo maneje (incluye 422 validation errors)
    throw error;
  }
}

export async function eliminarUsuario(id) {
  try {
    const res = await api.delete(`/usuarios/${id}`);
    return res.data;
  } catch (error) {
    // Re-lanzar para que el consumidor lo maneje (p.ej. 422, 404)
    throw error;
  }
}

export default { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };
