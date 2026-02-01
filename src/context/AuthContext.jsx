// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    getStoredToken,
    getStoredUser,
    me as apiMe,
    logout as apiLogout,
    getStoredRole,
    isAdmin,
    isUsuario,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(getStoredToken());
    const [user, setUser] = useState(getStoredUser());
    const [loading, setLoading] = useState(!!getStoredToken());

    useEffect(() => {
        const t = getStoredToken();
        setToken(t);

        // Si hay token, validamos /me para obtener role real y user actualizado
        if (t) {
            (async () => {
                try {
                    const u = await apiMe();
                    setUser(u);
                } catch {
                    // token inválido
                    await apiLogout();
                    setUser(null);
                    setToken(null);
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setLoading(false);
        }
    }, []);

    const value = useMemo(
        () => ({
            token,
            user,
            role: getStoredRole() || user?.role || "",
            isAuth: !!token,
            loading,
            setUser,
            setToken,
            isAdmin: () => isAdmin(),
            isUsuario: () => isUsuario(),
            logout: async () => {
                await apiLogout();
                setUser(null);
                setToken(null);
            },
            refreshMe: async () => {
                const u = await apiMe();
                setUser(u);
                return u;
            },
        }),
        [token, user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
