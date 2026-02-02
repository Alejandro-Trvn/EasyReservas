// src/components/layout/Sidebar.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Calendar,
  Layers,
  Settings,
  Users,
  Bell,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import clsx from "clsx";

const MENU_MODULES = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
    rolesPermitidos: ["admin", "usuario"],
  },
  {
    label: "Gestión de Reservas",
    icon: Calendar,
    rolesPermitidos: ["admin", "usuario"],
    items: [
      {
        label: "Reservas",
        path: "/reservas",
        icon: Calendar,
        rolesPermitidos: ["admin", "usuario"],
      },
      {
        label: "Recursos",
        path: "/recursos",
        icon: Layers,
        rolesPermitidos: ["admin", "usuario"],
      },
    ],
  },
  {
    label: "Administración",
    icon: Settings,
    rolesPermitidos: ["admin"],
    items: [
      {
        label: "Usuarios",
        path: "/usuarios",
        icon: Users,
        rolesPermitidos: ["admin"],
      },
      {
        label: "Tipo de Recursos",
        path: "/tipo-recursos",
        icon: Layers,
        rolesPermitidos: ["admin"],
      },
    ],
  },
  {
    label: "Sistema",
    icon: Bell,
    rolesPermitidos: ["admin", "usuario"],
    items: [
      {
        label: "Notificaciones",
        path: "/notificaciones",
        icon: Bell,
        rolesPermitidos: ["admin", "usuario"],
      },
    ],
  },
];

export const Sidebar = () => {
  // ✅ Hooks SIEMPRE arriba, sin returns antes
  const { user, loading, role: contextRole } = useAuth();
  const location = useLocation();
  const [expandedModules, setExpandedModules] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = (contextRole || user?.role || "").toString().toLowerCase();

  const filteredModules = useMemo(() => {
    if (!role) return []; // mientras no haya rol, no muestres módulos
    return MENU_MODULES.filter((module) => {
      const moduleRoles = Array.isArray(module.rolesPermitidos)
        ? module.rolesPermitidos
        : [];

      // si el módulo es link directo
      if (!module.items) return moduleRoles.includes(role);

      // módulo con items
      const items = module.items || [];
      const hasVisibleItem = items.some((it) =>
        (it.rolesPermitidos || []).includes(role)
      );

      return moduleRoles.includes(role) || hasVisibleItem;
    });
  }, [role]);

  const toggleModule = (label) => {
    if (isCollapsed) return;
    setExpandedModules((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    // al colapsar, cerrar módulos
    if (!isCollapsed) setExpandedModules({});
  };

  // ✅ Render seguro: si está cargando o sin user, no rompas Hooks.
  if (loading) return null;
  if (!user) return null;

  return (
    <div
      className={clsx(
        "bg-emerald-950 text-white h-screen flex flex-col shadow-xl transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "p-6 flex flex-col items-center justify-center border-b border-emerald-900 transition-all duration-300",
          isCollapsed && "p-4"
        )}
      >
        <div
          className={clsx(
            "text-2xl font-bold text-white tracking-tight flex items-center gap-2 transition-all duration-300",
            isCollapsed && "flex-col gap-1"
          )}
        >
          <span className="text-3xl">🌱</span>
          {!isCollapsed && (
            <span>
              Easy-Reservas <span className="text-emerald-400">UNI</span>
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="text-sm text-emerald-300 mt-1">
            By: <span className="text-emerald-400">PulsoTek</span>
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="px-4 py-2 border-b border-emerald-900">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-emerald-900 transition-colors group"
          title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen
              size={20}
              className="text-emerald-300 group-hover:text-white"
            />
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-emerald-300">Menu</span>
              <PanelLeftClose
                size={20}
                className="text-emerald-300 group-hover:text-white"
              />
            </div>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto sidebar-scrollbar">
        {filteredModules.map((module) => {
          const Icon = module.icon;

          // Link directo
          if (module.path) {
            const isActive = location.pathname === module.path;
            return (
              <Link
                key={module.path}
                to={module.path}
                className={clsx(
                  "flex items-center p-3 rounded-xl transition-all duration-200 group",
                  isCollapsed ? "justify-center" : "space-x-3",
                  isActive
                    ? "bg-white text-emerald-950 shadow-lg transform translate-x-1 font-bold"
                    : "text-emerald-100 hover:bg-emerald-900 hover:text-white"
                )}
                title={isCollapsed ? module.label : undefined}
              >
                <Icon
                  size={20}
                  className={clsx(
                    "transition-colors",
                    isActive
                      ? "text-emerald-950"
                      : "text-emerald-300 group-hover:text-white"
                  )}
                />
                {!isCollapsed && <span>{module.label}</span>}
              </Link>
            );
          }

          // Módulo con items
          const filteredItems =
            module.items?.filter((it) => (it.rolesPermitidos || []).includes(role)) || [];

          if (filteredItems.length === 0) return null;

          const isExpanded = expandedModules[module.label];
          const hasActiveChild = filteredItems.some(
            (it) => location.pathname === it.path
          );

          return (
            <div key={module.label} className="space-y-1">
              <button
                onClick={() => toggleModule(module.label)}
                className={clsx(
                  "w-full flex items-center p-3 rounded-xl transition-all duration-200 group",
                  isCollapsed ? "justify-center" : "justify-between",
                  hasActiveChild
                    ? "bg-emerald-900 text-white font-semibold"
                    : "text-emerald-100 hover:bg-emerald-900 hover:text-white"
                )}
                title={isCollapsed ? module.label : undefined}
              >
                <div
                  className={clsx(
                    "flex items-center",
                    !isCollapsed && "space-x-3"
                  )}
                >
                  <Icon
                    size={20}
                    className={clsx(
                      "transition-colors",
                      hasActiveChild
                        ? "text-white"
                        : "text-emerald-300 group-hover:text-white"
                    )}
                  />
                  {!isCollapsed && <span>{module.label}</span>}
                </div>

                {!isCollapsed &&
                  (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>

              {!isCollapsed && isExpanded && (
                <div className="ml-4 space-y-1 border-l-2 border-emerald-800 pl-2">
                  {filteredItems.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                          "flex items-center space-x-3 p-2.5 rounded-lg transition-all duration-200 group text-sm",
                          isActive
                            ? "bg-white text-emerald-950 shadow-md font-semibold"
                            : "text-emerald-200 hover:bg-emerald-900 hover:text-white"
                        )}
                      >
                        <ItemIcon
                          size={18}
                          className={clsx(
                            "transition-colors",
                            isActive
                              ? "text-emerald-950"
                              : "text-emerald-300 group-hover:text-white"
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};
