// src/pages/ConfiguracionPage.jsx
import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Mail, User, IdCard, RefreshCcw } from "lucide-react";

export default function ConfiguracionPage() {
    const { user, refreshMe } = useAuth();

    const roleLabel = useMemo(() => {
        const r = (user?.role || "").toString().toUpperCase();
        return r || "—";
    }, [user?.role]);

    const createdAt = useMemo(() => {
        if (!user?.created_at) return "—";
        const d = new Date(user.created_at);
        return isNaN(d.getTime()) ? String(user.created_at) : d.toLocaleString();
    }, [user?.created_at]);

    const updatedAt = useMemo(() => {
        if (!user?.updated_at) return "—";
        const d = new Date(user.updated_at);
        return isNaN(d.getTime()) ? String(user.updated_at) : d.toLocaleString();
    }, [user?.updated_at]);

    const onRefresh = async () => {
        try {
            await refreshMe();
        } catch {
            // si falla, no hacemos nada (ProtectedRoute y logout ya cubren casos token inválido)
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
                    <p className="text-slate-600 mt-1">
                        Información del usuario logueado (endpoint <span className="font-semibold">/me</span>).
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title="Actualizar información"
                >
                    <RefreshCcw size={16} />
                    Actualizar
                </button>
            </div>

            {/* Card principal */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Perfil de usuario</p>
                            <p className="text-lg font-bold text-slate-900">
                                {user?.name || "—"}
                            </p>
                        </div>

                        <div className="ml-auto">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                                <Shield size={14} />
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Grid de datos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={<IdCard size={18} />} label="ID" value={user?.id ?? "—"} />
                        <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email || "—"} />
                        <InfoRow
                            icon={<Shield size={18} />}
                            label="Rol"
                            value={roleLabel}
                            badge
                        />
                        <InfoRow
                            icon={<User size={18} />}
                            label="Estado"
                            value={user?.estado == 1 ? "Activo" : "Inactivo"}
                            statusDot={user?.estado == 1}
                        />
                    </div>

                    {/* Separador */}
                    <div className="my-6 h-px bg-slate-100" />

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MetaRow label="Creado en" value={createdAt} />
                        <MetaRow label="Actualizado en" value={updatedAt} />
                    </div>

                    {/* Nota */}
                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Esta sección se alimenta de la respuesta del backend en <span className="font-semibold">/me</span>.
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, badge = false, statusDot = null }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                {icon}
            </div>

            <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                </p>

                <div className="mt-1 flex items-center gap-2">
                    {statusDot !== null ? (
                        <span
                            className={`h-2 w-2 rounded-full ${statusDot ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                        />
                    ) : null}

                    {badge ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-800">
                            {value}
                        </span>
                    ) : (
                        <p className="text-sm font-semibold text-slate-900">{value}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetaRow({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}
