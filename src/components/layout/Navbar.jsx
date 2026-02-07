// src/components/layout/Navbar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    PanelLeftClose,
    PanelLeftOpen,
    X,
} from "lucide-react";
import useNotificaciones from "../../services/notificaciones/useNotificaciones";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { searchModules } from "../../constants/searchableModules";

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const bellRef = useRef(null);
    const notifRef = useRef(null);
    const [notifPos, setNotifPos] = useState({ top: 0, left: 0 });

    // Search mobile overlay
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const mobileSearchRef = useRef(null);

    // Search functionality
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchDesktopRef = useRef(null);
    const searchResultsRef = useRef(null);

    // ✅ Detect mobile (sin window.innerWidth en render)
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 639px)");
        const handler = () => setIsMobile(mq.matches);
        handler();
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    const roleLabel = useMemo(() => {
        const r = (user?.role || "").toString().toLowerCase();
        if (!r) return "";
        return r.toUpperCase();
    }, [user?.role]);

    const initial = useMemo(() => {
        const name = (user?.name || "").trim();
        return name ? name.charAt(0).toUpperCase() : "?";
    }, [user?.name]);

    // Búsqueda en tiempo real
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const userRole = user?.role?.toLowerCase() || "usuario";
            const results = searchModules(searchQuery, userRole);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, user?.role]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;

            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsDropdownOpen(false);
            }

            if (
                notifRef.current &&
                !notifRef.current.contains(target) &&
                bellRef.current &&
                !bellRef.current.contains(target)
            ) {
                setIsNotifOpen(false);
            }

            if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
                setMobileSearchOpen(false);
            }

            // Cerrar resultados de búsqueda al hacer clic fuera
            if (
                searchDesktopRef.current &&
                !searchDesktopRef.current.contains(target) &&
                searchResultsRef.current &&
                !searchResultsRef.current.contains(target)
            ) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ESC close for overlays
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setIsDropdownOpen(false);
                setIsNotifOpen(false);
                setMobileSearchOpen(false);
                setIsSearchFocused(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const handleSearchSelect = (path) => {
        navigate(path);
        setSearchQuery("");
        setSearchResults([]);
        setIsSearchFocused(false);
        setMobileSearchOpen(false);
    };

    const onLogout = async () => {
        setIsDropdownOpen(false);
        try {
            await logout();
        } finally {
            navigate("/login", { replace: true });
        }
    };

    // ✅ ahora tomamos isMobileOpen del nuevo contexto
    const { isCollapsed, isMobileOpen, toggleSidebar } = useSidebar();

    const { notificaciones = [] } = useNotificaciones();
    const unreadCount = (notificaciones || []).filter((n) => !n.leida).length;

    const openNotif = () => {
        const show = !isNotifOpen;

        // Desktop: calculamos posición real
        if (show && bellRef.current && !isMobile) {
            const r = bellRef.current.getBoundingClientRect();
            const left = Math.min(
                r.left + window.scrollX,
                window.scrollX + window.innerWidth - 320
            );
            setNotifPos({ top: r.bottom + window.scrollY + 8, left });
        }

        setIsNotifOpen(show);
    };

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 shadow-sm">
            {/* Left: Sidebar toggle + Search */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors
                     focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                    title={isMobile ? (isMobileOpen ? "Cerrar menú" : "Abrir menú") : isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                    aria-label="Abrir/cerrar menú"
                >
                    {/* ✅ Mobile: depende de isMobileOpen */}
                    <span className="sm:hidden">
                        {isMobileOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </span>

                    {/* Desktop: colapsar/expandir */}
                    <span className="hidden sm:inline">
                        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </span>
                </button>

                {/* Search desktop/tablet */}
                <div className="hidden sm:block flex-1 max-w-xl min-w-0 relative" ref={searchDesktopRef}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400
                         focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                         sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Buscar en el sistema..."
                        />
                    </div>

                    {/* Search Results Dropdown (Desktop) */}
                    {isSearchFocused && searchQuery.trim().length > 0 && (
                        <div
                            ref={searchResultsRef}
                            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto"
                        >
                            {searchResults.length > 0 ? (
                                <>
                                    <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase">
                                        {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                                    </div>
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearchSelect(result.path)}
                                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 active:bg-emerald-100 flex items-center gap-3 transition-colors group"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200">
                                                <Search size={16} className="text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {result.label}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {result.path}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <Search size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">
                                        No se encontraron resultados para "{searchQuery}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Search mobile button */}
                <button
                    type="button"
                    onClick={() => setMobileSearchOpen(true)}
                    className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors
                     focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                    aria-label="Buscar"
                    title="Buscar"
                >
                    <Search size={18} />
                </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications */}
                <div className="relative" ref={bellRef}>
                    <button
                        type="button"
                        onClick={openNotif}
                        className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                        title="Notificaciones"
                        aria-label="Notificaciones"
                    >
                        <Bell size={20} />
                    </button>

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </div>

                {isNotifOpen && (
                    <div
                        ref={notifRef}
                        style={{
                            position: "fixed",
                            top: isMobile ? 72 : notifPos.top,
                            left: isMobile ? undefined : notifPos.left,
                            right: isMobile ? 16 : undefined,
                            zIndex: 60,
                        }}
                    >
                        <div className="w-[280px] rounded-xl bg-white shadow-lg border border-gray-100 p-3 text-sm">
                            <div className="font-medium mb-2">
                                Tienes {unreadCount} notificación{unreadCount !== 1 ? "es" : ""} sin leer
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        setIsNotifOpen(false);
                                        navigate("/notificaciones");
                                    }}
                                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:opacity-90 active:opacity-95
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25"
                                >
                                    Ir
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((v) => !v)}
                        className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
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
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                            >
                                <Settings size={16} />
                                Configuración
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
                <div className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[1px] sm:hidden">
                    <div
                        ref={mobileSearchRef}
                        className="mx-auto mt-3 w-[calc(100%-1.5rem)] rounded-2xl bg-white border border-gray-200 shadow-lg"
                    >
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                                        placeholder="Buscar en el sistema..."
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileSearchOpen(false);
                                        setSearchQuery("");
                                        setSearchResults([]);
                                    }}
                                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 active:bg-gray-100
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                                    aria-label="Cerrar búsqueda"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Search Results (Mobile) */}
                        {searchQuery.trim().length > 0 && (
                            <div className="max-h-[70vh] overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <>
                                        <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase bg-gray-50">
                                            {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                                        </div>
                                        {searchResults.map((result, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSearchSelect(result.path)}
                                                className="w-full text-left px-4 py-3 hover:bg-emerald-50 active:bg-emerald-100 flex items-center gap-3 transition-colors group border-b border-gray-50"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200">
                                                    <Search size={18} className="text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {result.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {result.path}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className="px-4 py-12 text-center">
                                        <Search size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500">
                                            No se encontraron resultados
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            "{searchQuery}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
