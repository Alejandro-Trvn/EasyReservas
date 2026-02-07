// src/components/layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { SidebarProvider } from "../../context/SidebarContext";

export const Layout = () => {
    return (
        <SidebarProvider>
            {/* dvh: mejora en mobile (teclado / notch) */}
            <div className="flex min-h-dvh w-full bg-slate-50">
                {/* Sidebar (idealmente: fijo en desktop + drawer en mobile) */}
                <Sidebar />

                {/* Columna principal */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Navbar arriba */}
                    <div className="sticky top-0 z-30 safe-top">
                        <Navbar />
                    </div>

                    {/* Contenido */}
                    <main className="flex-1 overflow-auto safe-bottom">
                        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                            <div className="max-w-7xl mx-auto min-w-0">
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};
