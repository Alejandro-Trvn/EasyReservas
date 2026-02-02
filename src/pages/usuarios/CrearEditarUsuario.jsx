import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Modal } from "../../components/Modal";
import Select from "../../components/Select";
import Button from "../../components/Button";
import { showAlert } from "../../components/Alert";
import useUsuarios from "../../services/usuarios/useUsuarios";
import ScreenLoader from "../../components/ScreenLoader";
import { actualizarUsuario } from "../../services/usuarios/usuariosService";
import useRoles from "../../services/roles/useRoles";

export default function CrearEditarUsuario({ isOpen = false, onClose = () => { }, createUsuario: parentCreate, editingUser = null, onSaved = null }) {
    const { createUsuario: hookCreate } = useUsuarios();
    const createUsuario = parentCreate || hookCreate;

    const [open, setOpen] = useState(isOpen);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(true);

    const { roles, loading: rolesLoading } = useRoles();
    const roleOptions = (roles || []).map((r) => ({ value: r.id ?? r.value, label: r.nombre ?? r.name ?? r.label }));
    const [role, setRole] = useState(null);

    useEffect(() => {
        // cuando se abre en modo edición, precargar datos
        if (editingUser) {
            setName(editingUser.name || "");
            setEmail(editingUser.email || "");
            // no tocar password (vacío)
            const roleId = editingUser.role?.id ?? editingUser.role?.value ?? null;
            if (roleId && roleOptions.length > 0) {
                const found = roleOptions.find(r => r.value === roleId);
                if (found) setRole(found);
            }
        }
    }, [editingUser]);

    useEffect(() => setOpen(isOpen), [isOpen]);

    useEffect(() => {
        if (!role && roleOptions.length > 0) {
            const defaultRole = roleOptions.find((r) => r.value === 2) || roleOptions[0];
            setRole(defaultRole);
        }
    }, [roleOptions]);

    function handleClose() {
        setOpen(false);
        onClose();
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // validación básica: cuando se edita, la contraseña no es obligatoria
        if (!name || !email || !role) {
            showAlert({ type: "warning", title: "Faltan datos", text: "Completa nombre, email y rol." });
            return;
        }

        const payload = {
            name: name.trim(),
            email: email.trim(),
            role_id: role.value,
        };

        // password: si se crea (no editingUser) siempre enviar; si se edita, enviar sólo si no está vacío
        if (!editingUser) {
            payload.password = password;
        } else if (typeof password === "string" && password.trim() !== "") {
            payload.password = password;
        }

        try {
            setSubmitting(true);
            if (editingUser) {
                await actualizarUsuario(editingUser.id, payload);
                showAlert({ type: "success", title: "Usuario actualizado", text: "Los cambios se guardaron correctamente." });
                if (typeof onSaved === "function") onSaved();
                handleClose();
            } else {
                await createUsuario(payload);
                showAlert({ type: "success", title: "Usuario creado", text: "El usuario se creó correctamente." });
                handleClose();
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al procesar la solicitud";
            showAlert({ type: "fail", title: "Error", text: msg });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal isOpen={open} onClose={handleClose} title={editingUser ? "Editar Usuario" : "Crear Usuario"} size="md" lockScrollX>
            <ScreenLoader loading={submitting} message={editingUser ? "Guardando cambios..." : "Creando usuario..."} color="#f2f7f6" height={10} width={4} />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                        placeholder="Nombre completo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                        placeholder="usuario@dominio.com"
                        type="email"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña temporal</label>
                    <div className="relative mt-1">
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border-gray-200 shadow-sm p-2 pr-10"
                            placeholder={editingUser ? "Dejar vacío para no cambiar" : "Contraseña temporal"}
                            type={showPassword ? "text" : "password"}
                            aria-label="Contraseña temporal"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <div className="mt-1">
                        <Select
                            options={roleOptions}
                            value={role}
                            onChange={(val) => setRole(val)}
                            placeholder={rolesLoading ? "Cargando roles..." : "Seleccionar rol"}
                            isSearchable={false}
                            isClearable={false}
                            isDisabled={rolesLoading}
                            usePortal={true}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md bg-gray-100 text-gray-800">Cancelar</button>
                    <Button type="submit" variant="primary" size="md" disabled={submitting}>
                        {submitting ? (editingUser ? "Guardando..." : "Guardando...") : (editingUser ? "Guardar cambios" : "Crear usuario")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
