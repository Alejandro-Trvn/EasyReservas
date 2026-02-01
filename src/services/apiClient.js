import axios from "axios";

const API_URL =
    import.meta?.env?.VITE_API_URL ??
    "http://127.0.0.1:8000";

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { Accept: "application/json" },
});

// Adjunta token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Manejo simple de 401 global (opcional)
api.interceptors.response.use(
    (r) => r,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            // token inválido/expirado
            localStorage.removeItem("access_token");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_role");
        }
        return Promise.reject(error);
    }
);
