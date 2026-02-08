// src/pages/ConfiguracionPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useUsuarios from "../services/usuarios/useUsuarios";
import Button from "../components/Button";
import SectionHeader from "../components/SectionHeader";
import ModalConfiguracionPage from "./ModalConfiguracionPage";
import Alert from "../components/Alert";
import { Shield, Mail, User, IdCard, FileText, Settings } from "lucide-react";

export default function ConfiguracionPage() {
    const { user, refreshMe } = useAuth();
    const { verPerfilUsuario } = useUsuarios();
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    const fetchPerfil = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const data = await verPerfilUsuario(user.id);
            setPerfil(data);
        } catch (err) {
            console.error("Error cargando perfil:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerfil();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const roleLabel = useMemo(() => {
        const r = (perfil?.role?.nombre || "").toString().toUpperCase();
        return r || "—";
    }, [perfil?.role?.nombre]);

    const createdAt = useMemo(() => {
        if (!perfil?.created_at) return "—";
        const d = new Date(perfil.created_at);
        return isNaN(d.getTime()) ? String(perfil.created_at) : d.toLocaleString();
    }, [perfil?.created_at]);

    const updatedAt = useMemo(() => {
        if (!perfil?.updated_at) return "—";
        const d = new Date(perfil.updated_at);
        return isNaN(d.getTime()) ? String(perfil.updated_at) : d.toLocaleString();
    }, [perfil?.updated_at]);

    const handleEditProfile = () => {
        setOpenModal(true);
    };

    const handleSaved = async () => {
        // Refrescar perfil desde el servidor
        await fetchPerfil();
        // Actualizar AuthContext
        try {
            await refreshMe();
        } catch (err) {
            console.error("Error refrescando AuthContext:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-slate-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-8">
            <SectionHeader
                title="Configuración"
                subtitle="Información del perfil de usuario"
                Icon={Settings}
                bgColor="linear-gradient(to right, #047857, #10b981)"
                topOffset="0"
            />

            {/* Editar Perfil moved into card header */}

            {/* Card principal */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-500 to-emerald-600">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white/90 text-emerald-700 flex items-center justify-center shadow-sm">
                            <User size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-emerald-50 font-medium">Perfil de usuario</p>
                            <p className="text-xl font-bold text-white">
                                {perfil?.name || "—"}
                            </p>
                        </div>

                        <div className="ml-auto">
                            <Button
                                onClick={handleEditProfile}
                                variant="ghost"
                                size="sm"
                                className="bg-white text-emerald-700 shadow-sm px-3 py-1.5"
                                icon={User}
                            >
                                Editar
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Grid de datos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={<IdCard size={18} />} label="ID" value={perfil?.id ?? "—"} color="emerald" />
                        <InfoRow icon={<Mail size={18} />} label="Email" value={perfil?.email || "—"} color="blue" />
                        <InfoRow
                            icon={<Shield size={18} />}
                            label="Rol"
                            value={roleLabel}
                            badge
                            color="emerald"
                        />
                        <InfoRow
                            icon={<User size={18} />}
                            label="Estado"
                            value={perfil?.estado == 1 ? "Activo" : "Inactivo"}
                            statusDot={perfil?.estado == 1}
                            color="emerald"
                        />
                    </div>

                    {/* Descripción del rol */}
                    {perfil?.role?.descripcion && (
                        <div className="mt-4">
                            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white p-5 flex items-start gap-3 shadow-sm">
                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                                        Descripción del Rol
                                    </p>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {perfil.role.descripcion}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Separador */}
                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MetaRow label="Creado en" value={createdAt} color="teal" />
                        <MetaRow label="Actualizado en" value={updatedAt} color="cyan" />
                    </div>
                </div>
            </div>

            <Alert />

            <ModalConfiguracionPage
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                perfil={perfil}
                onSaved={handleSaved}
            />
        </div>
    );
}

function InfoRow({ icon, label, value, badge = false, statusDot = null, color = "slate" }) {
    const colorMap = {
        emerald: {
            bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
            iconBg: "bg-emerald-500",
            iconText: "text-white",
            border: "border-emerald-200",
        },
        blue: {
            bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
            iconBg: "bg-blue-500",
            iconText: "text-white",
            border: "border-blue-200",
        },
        slate: {
            bg: "bg-gradient-to-br from-slate-50 to-slate-100/50",
            iconBg: "bg-slate-500",
            iconText: "text-white",
            border: "border-slate-200",
        },
    };

    const colors = colorMap[color] || colorMap.slate;

    return (
        <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 flex items-center gap-3 shadow-sm transition-transform hover:scale-[1.02]`}>
            <div className={`h-11 w-11 rounded-xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center shadow-md`}>
                {icon}
            </div>

            <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {label}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                    {statusDot !== null ? (
                        <span
                            className={`h-2.5 w-2.5 rounded-full shadow-sm ${statusDot ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                        />
                    ) : null}

                    {badge ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
                            {value}
                        </span>
                    ) : (
                        <p className="text-sm font-bold text-slate-900">{value}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetaRow({ label, value, color = "teal" }) {
    const colorMap = {
        teal: {
            bg: "bg-gradient-to-br from-teal-50 to-teal-100/50",
            border: "border-teal-200",
            iconBg: "bg-teal-500",
        },
        cyan: {
            bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
            border: "border-cyan-200",
            iconBg: "bg-cyan-500",
        },
    };

    const colors = colorMap[color] || colorMap.teal;

    return (
        <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 shadow-sm transition-transform hover:scale-[1.02]`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-2 w-2 rounded-full ${colors.iconBg} shadow-sm`}></div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {label}
                </p>
            </div>
            <p className="text-sm font-bold text-slate-900 ml-4">{value}</p>
        </div>
    );
}
