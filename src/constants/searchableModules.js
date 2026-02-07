// src/constants/searchableModules.js
export const SEARCHABLE_MODULES = [
  {
    label: "Dashboard",
    path: "/dashboard",
    keywords: ["inicio", "home", "panel", "dashboard", "principal"],
    rolesPermitidos: ["admin", "usuario"],
  },
  {
    label: "Reservas",
    path: "/reservas",
    keywords: ["reservas", "reservar", "bookings", "agendar"],
    rolesPermitidos: ["admin", "usuario"],
  },
  {
    label: "Recursos",
    path: "/recursos",
    keywords: ["recursos", "recursos", "salas", "equipos", "recursos disponibles"],
    rolesPermitidos: ["admin", "usuario"],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    keywords: ["usuarios", "users", "personas", "gestión de usuarios"],
    rolesPermitidos: ["admin"],
  },
  {
    label: "Tipo de Recursos",
    path: "/tipo-recursos",
    keywords: ["tipo de recursos", "tipos", "categorías", "clasificación"],
    rolesPermitidos: ["admin"],
  },
  {
    label: "Notificaciones",
    path: "/notificaciones",
    keywords: ["notificaciones", "alertas", "avisos", "mensajes"],
    rolesPermitidos: ["admin", "usuario"],
  },
  {
    label: "Estadísticas - Uso del Sistema",
    path: "/estadisticas/uso-sistema",
    keywords: ["estadísticas", "uso del sistema", "reportes", "analytics", "métricas"],
    rolesPermitidos: ["admin", "usuario"],
  },
  {
    label: "Estadísticas - Usuarios y Recursos",
    path: "/estadisticas/usuarios-recursos",
    keywords: ["estadísticas", "usuarios y recursos", "reportes", "analytics"],
    rolesPermitidos: ["admin"],
  },
  {
    label: "Configuración",
    path: "/configuracion",
    keywords: ["configuración", "ajustes", "settings", "perfil"],
    rolesPermitidos: ["admin", "usuario"],
  },
];

/**
 * Filtra los módulos basándose en el rol del usuario y la búsqueda
 * @param {string} query - Término de búsqueda
 * @param {string} userRole - Rol del usuario (admin o usuario)
 * @returns {Array} Lista de módulos filtrados
 */
export function searchModules(query, userRole) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  return SEARCHABLE_MODULES.filter((module) => {
    // Verificar permisos por rol
    if (!module.rolesPermitidos.includes(userRole)) {
      return false;
    }

    // Buscar en el label
    if (module.label.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Buscar en las keywords
    return module.keywords.some((keyword) =>
      keyword.toLowerCase().includes(normalizedQuery)
    );
  });
}
