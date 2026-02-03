// src/components/layout/Navbar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Settings, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const roleLabel = useMemo(() => {
        const r = (user?.role || "").toString().toLowerCase();
        if (!r) return "";
        // admin/usuario -> ADMIN/USUARIO
        return r.toUpperCase();
    }, [user?.role]);

    const initial = useMemo(() => {
        const name = (user?.name || "").trim();
        return name ? name.charAt(0).toUpperCase() : "?";
    }, [user?.name]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onLogout = async () => {
        setIsDropdownOpen(false);
        try {
            await logout(); // tu AuthContext debería limpiar storage/token
        } finally {
            navigate("/login", { replace: true });
        }
    };

    const { isCollapsed, toggleSidebar } = useSidebar();

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            {/* Search */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
                <div className="flex-1 max-w-xl">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>

                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Buscar en el sistema..."
                    />
                </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
                <button
                    type="button"
                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Notificaciones"
                >
                    <Bell size={20} />
                </button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((v) => !v)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-700">
                                {user?.name || "Usuario"}
                            </p>
                            {roleLabel ? (
                                <p className="text-xs text-gray-500 uppercase">{roleLabel}</p>
                            ) : null}
                        </div>

                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                            {initial}
                        </div>

                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                                <p className="text-sm font-semibold text-gray-700">
                                    {user?.name || "Usuario"}
                                </p>
                                {roleLabel ? (
                                    <p className="text-xs text-gray-500 uppercase">{roleLabel}</p>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    navigate("/configuracion");
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Settings size={16} />
                                Configuración
                            </button>


                            <div className="border-t border-gray-100 my-1" />

                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
