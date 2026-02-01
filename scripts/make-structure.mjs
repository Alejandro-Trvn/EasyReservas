import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const dirs = [
    "src/api",
    "src/app",
    "src/auth",
    "src/layouts",
    "src/router",
    "src/services",
    "src/features/auth/pages",
    "src/features/dashboard/pages",
    "src/features/recursos/pages",
    "src/features/recursos/components",
    "src/features/recursos/hooks",
    "src/features/reservas/pages",
    "src/features/reservas/components",
    "src/features/reservas/hooks",
    "src/features/notificaciones/pages",
    "src/features/notificaciones/hooks",
    "src/features/usuarios/pages",
    "src/features/usuarios/hooks",
    "src/components/ui",
    "src/utils",
    "src/constants",
    "src/styles",
];

const files = [
    "src/api/http.js",
    "src/auth/AuthContext.jsx",
    "src/auth/ProtectedRoute.jsx",
    "src/layouts/AppLayout.jsx",
    "src/layouts/AuthLayout.jsx",
    "src/router/AppRouter.jsx",
    "src/router/routes.jsx",
    "src/services/authService.js",
    "src/features/auth/pages/LoginPage.jsx",
    "src/features/auth/pages/ChangePasswordFirstLoginPage.jsx",
    "src/features/dashboard/pages/DashboardPage.jsx",
    "src/utils/storage.js",
    "src/utils/cn.js",
    "src/constants/storageKeys.js",
    "src/styles/index.css",
];

for (const d of dirs) await mkdir(d, { recursive: true });

for (const f of files) {
    await mkdir(dirname(f), { recursive: true });
    // crea archivo vacío solo si no existe; writeFile con flag "wx" falla si existe
    try {
        await writeFile(f, "", { flag: "wx" });
    } catch { }
}

console.log("Estructura creada.");
