// src/api/http.js
import axios from "axios";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Inyectar token automáticamente
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Manejo global de 401
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("AUTH_USER");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default http;
