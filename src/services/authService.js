// src/services/authService.js
import { api } from "./apiClient";
export const ROLE_ADMIN = "admin";
export const ROLE_USUARIO = "usuario";

function normalizeRole(role) {
    if (!role && role !== "") return "";
    try {
        const r = String(role).toLowerCase();
        if (r === ROLE_ADMIN) return ROLE_ADMIN;
        if (r === ROLE_USUARIO) return ROLE_USUARIO;
        return "";
    } catch {
        return "";
    }
}

export async function login(email, password) {
    try {
        const { data } = await api.post("/login", { email, password });

        // Caso normal: retorna token + user
        const token = data?.access_token;
        if (token) {
            localStorage.setItem("access_token", token);

            // opcional: guardar user parcial si viene
            if (data?.user) {
                localStorage.setItem("auth_user", JSON.stringify(data.user));
                if (data.user.role !== undefined) {
                    localStorage.setItem("auth_role", normalizeRole(data.user.role));
                }
            }

            // si el backend incluye role en la respuesta principal
            if (data?.role !== undefined) {
                localStorage.setItem("auth_role", normalizeRole(data.role));
            }

            return { ok: true, data };
        }

        return { ok: false, message: "Respuesta inesperada del servidor." };
    } catch (err) {
        const status = err?.response?.status;
        const payload = err?.response?.data;

        // Caso especial: must_change_password (tu backend responde 403 con data útil)
        if (status === 403 && payload?.must_change_password) {
            return {
                ok: false,
                mustChangePassword: true,
                userId: payload.user_id,
                email: payload.email,
                message: payload.message,
            };
        }

        return {
            ok: false,
            message:
                payload?.message ||
                (status === 401 ? "Credenciales inválidas" : "Error al iniciar sesión"),
            status,
        };
    }
}

export async function me() {
    const { data } = await api.get("/me");
    // backend retorna role como string o null; normalizamos a valores esperados
    localStorage.setItem("auth_role", normalizeRole(data?.role ?? ""));
    localStorage.setItem("auth_user", JSON.stringify(data));
    return data;
}

export async function logout() {
    try {
        await api.post("/logout");
    } finally {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_role");
    }
}

export async function changePasswordFirstLogin(payload) {
    // payload: { user_id, new_password, new_password_confirmation }
    const { data } = await api.post("/auth/change-password-first-login", payload);
    return data;
}

export function getStoredToken() {
    return localStorage.getItem("access_token");
}

export function getStoredRole() {
    return normalizeRole(localStorage.getItem("auth_role") || "");
}

export function getStoredUser() {
    const raw = localStorage.getItem("auth_user");
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function isAdmin() {
    return getStoredRole() === ROLE_ADMIN;
}

export function isUsuario() {
    return getStoredRole() === ROLE_USUARIO;
}

export function hasRole(role) {
    return getStoredRole() === normalizeRole(role);
}
