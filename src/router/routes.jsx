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

// Páginas placeholder (hasta que conectes APIs)
const ReservasPage = () => <div>Reservas (pendiente)</div>;
const RecursosPage = () => <div>Recursos (pendiente)</div>;
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
            { path: "recursos", element: <RecursosPage /> },
            { path: "usuarios", element: <UsuariosPage /> },
            { path: "notificaciones", element: <NotificacionesPage /> },
            { path: "configuracion", element: <ConfiguracionPage /> },
        ],
    },
];

export default routes;
