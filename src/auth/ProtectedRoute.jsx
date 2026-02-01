// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuth, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // o un loader

    if (!isAuth) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}
