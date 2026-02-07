// src/components/layout/Sidebar.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
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
  PanelLeftOpen,
} from "lucide-react";
import clsx from "clsx";
import { useSidebar } from "../../context/SidebarContext";

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
  {
    label: "Estadísticas",
    icon: PanelLeftOpen,
    rolesPermitidos: ["admin", "usuario"],
    items: [
      {
        label: "Uso del sistema",
        path: "/estadisticas/uso-sistema",
        icon: PanelLeftOpen,
        rolesPermitidos: ["admin", "usuario"],
      },
      {
        label: "Usuarios y Recursos",
        path: "/estadisticas/usuarios-recursos",
        icon: Users,
        rolesPermitidos: ["admin"],
      },
    ],
  },
];

export const Sidebar = () => {
  const { user, loading, role: contextRole } = useAuth();
  const location = useLocation();

  const [expandedModules, setExpandedModules] = useState({});

  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar();

  // Popover (solo desktop colapsado)
  const [hoveredModule, setHoveredModule] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const hideTimer = useRef(null);
  const popoverRef = useRef(null);

  // Detectar mobile (sin window.innerWidth en render)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Si colapsa en desktop, cierro acordeones
  useEffect(() => {
    if (isCollapsed) setExpandedModules({});
  }, [isCollapsed]);

  const role = (contextRole || user?.role || "").toString().toLowerCase();

  const filteredModules = useMemo(() => {
    if (!role) return [];
    return MENU_MODULES.filter((module) => {
      const moduleRoles = Array.isArray(module.rolesPermitidos)
        ? module.rolesPermitidos
        : [];

      if (!module.items) return moduleRoles.includes(role);

      const items = module.items || [];
      const hasVisibleItem = items.some((it) =>
        (it.rolesPermitidos || []).includes(role)
      );

      return moduleRoles.includes(role) || hasVisibleItem;
    });
  }, [role]);

  const toggleModule = (label) => {
    // En desktop colapsado no expandimos
    if (!isMobile && isCollapsed) return;
    setExpandedModules((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (loading) return null;
  if (!user) return null;

  // Popover helpers
  function clearHideTimer() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  function showPopoverForModule(module, e) {
    if (isMobile) return;
    if (!isCollapsed) return;

    clearHideTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({ top: rect.top + window.scrollY, left: rect.right + 8 });
    setHoveredModule(module);
  }

  function hidePopover(delay = 350) {
    clearHideTimer();
    hideTimer.current = setTimeout(() => setHoveredModule(null), delay);
  }

  function handleTriggerMouseLeave(e) {
    const related = e.relatedTarget;
    if (popoverRef.current && related && popoverRef.current.contains(related)) {
      return;
    }
    hidePopover();
  }

  // ✅ Cerrar drawer al navegar en mobile
  const closeIfMobile = () => {
    if (isMobile) closeMobileSidebar();
  };

  // Drawer abierto en mobile
  const mobileDrawerOpen = isMobileOpen;

  return (
    <>
      {/* Overlay (solo mobile + abierto) */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px] sm:hidden transition-opacity",
          mobileDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <aside
        className={clsx(
          "bg-emerald-950 text-white flex flex-col shadow-xl transition-all duration-300",
          "min-h-dvh",
          // Desktop
          "sm:relative sm:translate-x-0 sm:z-auto",
          // Mobile drawer
          "fixed inset-y-0 left-0 z-50 sm:static",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
          // Width desktop
          isCollapsed ? "sm:w-20" : "sm:w-64",
          // Width mobile
          "w-[78vw] max-w-[320px] sm:max-w-none"
        )}
      >
        {/* Header */}
        <div
          className={clsx(
            "p-6 flex flex-col items-center justify-center border-b border-emerald-900 transition-all duration-300 safe-top",
            isCollapsed && "sm:p-4"
          )}
        >
          <div
            className={clsx(
              "text-2xl font-bold text-white tracking-tight flex items-center gap-2 transition-all duration-300",
              isCollapsed && "sm:flex-col sm:gap-1"
            )}
          >
            <span className="text-2xl inline-block p-1 rounded-full bg-white ring-2 ring-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
              👨‍🎓
            </span>

            {/* En mobile SIEMPRE mostramos el nombre */}
            <span
              className={clsx(
                "text-white text-2xl",
                isCollapsed ? "sm:hidden" : ""
              )}
            >
              Easy-Reservas
            </span>
          </div>

          {/* Botón cerrar solo en mobile */}
          <div className="sm:hidden mt-4 w-full">
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 active:bg-white/20 transition
                         focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
            >
              Cerrar menú
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="px-4 py-2 border-b border-emerald-900" />

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto sidebar-scrollbar safe-bottom">
          {filteredModules.map((module) => {
            const Icon = module.icon;

            // Link directo
            if (module.path) {
              const isActive = location.pathname === module.path;
              return (
                <Link
                  key={module.path}
                  to={module.path}
                  onClick={closeIfMobile}
                  className={clsx(
                    "flex items-center p-3 rounded-xl transition-all duration-200 group",
                    isCollapsed ? "sm:justify-center" : "space-x-3",
                    isActive
                      ? "bg-white text-emerald-950 shadow-lg transform sm:translate-x-1 font-bold"
                      : "text-emerald-100 hover:bg-emerald-900 hover:text-white"
                  )}
                  title={isCollapsed ? module.label : undefined}
                  onMouseEnter={(e) => showPopoverForModule(module, e)}
                  onMouseLeave={handleTriggerMouseLeave}
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
                  <span className={clsx(isCollapsed ? "sm:hidden" : "")}>
                    {module.label}
                  </span>
                </Link>
              );
            }

            // Módulo con items
            const filteredItems =
              module.items?.filter((it) =>
                (it.rolesPermitidos || []).includes(role)
              ) || [];

            if (filteredItems.length === 0) return null;

            const isExpanded = !!expandedModules[module.label];
            const hasActiveChild = filteredItems.some(
              (it) => location.pathname === it.path
            );

            return (
              <div key={module.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleModule(module.label)}
                  className={clsx(
                    "w-full flex items-center p-3 rounded-xl transition-all duration-200 group",
                    isCollapsed ? "sm:justify-center" : "justify-between",
                    hasActiveChild
                      ? "bg-emerald-900 text-white font-semibold"
                      : "text-emerald-100 hover:bg-emerald-900 hover:text-white"
                  )}
                  title={isCollapsed ? module.label : undefined}
                  onMouseEnter={(e) => showPopoverForModule(module, e)}
                  onMouseLeave={handleTriggerMouseLeave}
                >
                  <div className={clsx("flex items-center", !isCollapsed && "space-x-3")}>
                    <Icon
                      size={20}
                      className={clsx(
                        "transition-colors",
                        hasActiveChild
                          ? "text-white"
                          : "text-emerald-300 group-hover:text-white"
                      )}
                    />
                    <span className={clsx(isCollapsed ? "sm:hidden" : "")}>
                      {module.label}
                    </span>
                  </div>

                  {/* Flecha visible en mobile y en desktop expandido */}
                  <span className={clsx(isCollapsed ? "sm:hidden" : "")}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </button>

                {/* Subitems */}
                {(isMobile ? isExpanded : !isCollapsed && isExpanded) && (
                  <div className="ml-4 space-y-1 border-l-2 border-emerald-800 pl-2">
                    {filteredItems.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeIfMobile}
                          className={clsx(
                            "flex items-center space-x-3 p-2.5 rounded-lg transition-all duration-200 group text-sm",
                            isActive
                              ? "bg-white text-emerald-950 shadow-md font-semibold"
                              : "text-emerald-200 hover:bg-emerald-900 hover:text-white"
                          )}
                          onMouseEnter={() => setHoveredModule(null)}
                          onMouseLeave={() => setHoveredModule(null)}
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

        {/* Popover (desktop colapsado) */}
        {isCollapsed && !isMobile && hoveredModule && (
          <div
            ref={popoverRef}
            onMouseEnter={() => clearHideTimer()}
            onMouseLeave={() => hidePopover()}
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              zIndex: 9999,
            }}
            className="hidden sm:block"
          >
            <div className="w-56 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-lg">
              <div className="p-3 border-b border-white/15">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  {hoveredModule.icon
                    ? React.createElement(hoveredModule.icon, {
                      size: 16,
                      className: "text-amber-300",
                    })
                    : null}
                  <span>{hoveredModule.label}</span>
                </div>
              </div>

              <div className="p-3">
                {hoveredModule.items && hoveredModule.items.length > 0 ? (
                  <div className="space-y-2 text-sm text-white">
                    {hoveredModule.items.map((it) => (
                      <Link
                        key={it.path}
                        to={it.path}
                        onClick={() => setHoveredModule(null)}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10"
                      >
                        {it.icon
                          ? React.createElement(it.icon, {
                            size: 14,
                            className: "text-white",
                          })
                          : null}
                        <span className="truncate">{it.label}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/90 p-1">
                    {hoveredModule.label}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
