// src/router/routes.jsx
import React from "react";
import LandingPage from "../pages/auth/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import ChangePasswordFirstLoginPage from "../pages/auth/ChangePasswordFirstLoginPage";
import ConfiguracionPage from "../pages/ConfiguracionPage";


import DashboardPage from "../pages/Dashboard";
import ProtectedRoute from "../auth/ProtectedRoute";
import { Layout } from "../components/layout/Layout";
import UsuariosPage from "../pages/usuarios/Usuarios";
import TipoRecursosPage from "../pages/tipoRecursos/tipoRecursosPage";
import RecursosPage from "../pages/recursos/Recursos";
import ReservasPage from "../pages/reservas/Reservas";
import EstadisticasPage from "../pages/estadisticas/EstadisticasPage";
import UsuariosRecursosPage from "../pages/estadisticas/UsuariosRecursosPage";

// Usuarios page is imported above
const NotificacionesPage = () => <div>Notificaciones (pendiente)</div>;

export const routes = [
    // Públicas
    { path: "/", element: <LandingPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/cambiar-clave-primer-login", element: <ChangePasswordFirstLoginPage /> },

    // Protegidas (layout único)
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            { path: "dashboard", element: <DashboardPage /> },
            { path: "reservas", element: <ReservasPage /> },
            { path: "estadisticas/uso-sistema", element: <EstadisticasPage /> },
            { path: "estadisticas/usuarios-recursos", element: <UsuariosRecursosPage /> },
            { path: "recursos", element: <RecursosPage /> },
            { path: "tipo-recursos", element: <TipoRecursosPage /> },
            { path: "usuarios", element: <UsuariosPage /> },
            { path: "notificaciones", element: <NotificacionesPage /> },
            { path: "configuracion", element: <ConfiguracionPage /> },
        ],
    },
];

export default routes;
