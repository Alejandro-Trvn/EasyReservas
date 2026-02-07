// src/context/SidebarContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";

const SidebarContext = createContext(null);

function isMobileNow() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 639px)").matches; // Tailwind sm < 640
}

export const SidebarProvider = ({ children }) => {
  // Desktop: colapsado (w-20) / expandido (w-64)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mobile: drawer abierto/cerrado
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Mantener sync al cambiar tamaño (si pasas de mobile->desktop, cierra drawer)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = () => {
      if (!mq.matches) {
        setIsMobileOpen(false); // al salir de mobile, cierra drawer
      }
    };
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Bloquear scroll del body cuando drawer está abierto (UX pro)
  useEffect(() => {
    if (!isMobileOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileOpen]);

  // Toggle inteligente: en mobile abre/cierra drawer; en desktop colapsa/expande
  const toggleSidebar = useCallback(() => {
    if (isMobileNow()) {
      setIsMobileOpen((v) => !v);
      return;
    }
    setIsCollapsed((v) => !v);
  }, []);

  const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), []);
  const openMobileSidebar = useCallback(() => setIsMobileOpen(true), []);

  const value = useMemo(
    () => ({
      // desktop
      isCollapsed,
      setIsCollapsed,

      // mobile
      isMobileOpen,
      setIsMobileOpen,
      openMobileSidebar,
      closeMobileSidebar,

      // unified
      toggleSidebar,
    }),
    [isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar, openMobileSidebar]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};

export default SidebarContext;
