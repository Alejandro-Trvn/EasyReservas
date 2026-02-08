import React, { useState, useEffect } from "react";
import { Modal } from "../components/Modal";
import { showAlert } from "../components/Alert";
import useUsuarios from "../services/usuarios/useUsuarios";
import { User, Mail, Loader2 } from "lucide-react";

export default function ModalConfiguracionPage({ isOpen, onClose, perfil, onSaved }) {
    const { editarPerfilUsuario } = useUsuarios();
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && perfil) {
            setFormData({
                name: perfil.name || "",
                email: perfil.email || "",
            });
            setErrors({});
        }
    }, [isOpen, perfil]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim() === "") {
            newErrors.name = "El nombre es obligatorio";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "El nombre debe tener al menos 3 caracteres";
        }

        if (formData.email && formData.email.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "El email no es válido";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Limpiar error del campo al escribir
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showAlert({
                type: "warning",
                title: "Formulario incompleto",
                text: "Por favor corrige los errores antes de continuar",
            });
            return;
        }

        setSaving(true);
        try {
            const payload = { name: formData.name.trim() };
            if (formData.email && formData.email.trim() !== "") {
                payload.email = formData.email.trim();
            }

            await editarPerfilUsuario(payload);

            showAlert({
                type: "success",
                title: "Perfil actualizado",
                text: "Los cambios se guardaron correctamente",
            });

            onSaved?.();
            onClose?.();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al actualizar perfil";
            showAlert({
                type: "fail",
                title: "Error",
                text: msg,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (saving) return;
        onClose?.();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Editar Perfil"
            subtitle="Actualiza tu información personal"
            size="md"
            headerBg="bg-gradient-to-r from-emerald-500 to-emerald-600"
            headerTextColor="text-white"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Nombre */}
                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className={`
                                w-full pl-10 pr-4 py-2.5 rounded-xl border
                                ${errors.name
                                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                                    : "border-slate-200 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                                }
                                text-slate-900 placeholder-slate-400
                                focus:outline-none focus:ring-2 focus:ring-opacity-50
                                transition-colors
                            `}
                            placeholder="Escribe tu nombre completo"
                            disabled={saving}
                        />
                    </div>
                    {errors.name && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>
                    )}
                </div>

                {/* Campo Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                        Email <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={`
                                w-full pl-10 pr-4 py-2.5 rounded-xl border
                                ${errors.email
                                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                                    : "border-slate-200 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                                }
                                text-slate-900 placeholder-slate-400
                                focus:outline-none focus:ring-2 focus:ring-opacity-50
                                transition-colors
                            `}
                            placeholder="usuario@ejemplo.com"
                            disabled={saving}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
                    )}
                </div>

                {/* Info adicional */}
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-emerald-700">Nota:</span> Los cambios se aplicarán inmediatamente en tu sesión actual.
                    </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="
                            w-full sm:w-auto px-5 py-2.5 rounded-xl
                            bg-slate-100 text-slate-700 font-semibold
                            hover:bg-slate-200 active:bg-slate-300
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors
                        "
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="
                            w-full sm:flex-1 px-5 py-2.5 rounded-xl
                            bg-gradient-to-r from-emerald-500 to-emerald-600
                            text-white font-bold shadow-md
                            hover:from-emerald-600 hover:to-emerald-700
                            active:from-emerald-700 active:to-emerald-800
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all
                            flex items-center justify-center gap-2
                        "
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <span>Guardar Cambios</span>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
