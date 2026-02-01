// src/pages/auth/ChangePasswordFirstLoginPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { changePasswordFirstLogin } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function ChangePasswordFirstLoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const { isAuth, loading } = useAuth();

    // Si ya está autenticado, no debe estar aquí
    useEffect(() => {
        if (!loading && isAuth) navigate("/dashboard", { replace: true });
    }, [isAuth, loading, navigate]);

    // Preferimos location.state. Si no existe, usamos query params.
    const userIdFromState = location?.state?.userId ?? null;
    const emailFromState = location?.state?.email ?? null;

    const userIdFromQuery = searchParams.get("userId");
    const emailFromQuery = searchParams.get("email");

    const userIdRaw = useMemo(
        () => userIdFromState ?? userIdFromQuery ?? "",
        [userIdFromState, userIdFromQuery]
    );

    const email = useMemo(
        () => emailFromState ?? emailFromQuery ?? "",
        [emailFromState, emailFromQuery]
    );

    // Parse seguro a número
    const userId = useMemo(() => {
        const n = Number(userIdRaw);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [userIdRaw]);

    const [form, setForm] = useState({
        new_password: "",
        new_password_confirmation: "",
    });

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const onChange = (e) => {
        setError(""); // UX: limpia error al escribir
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const validate = () => {
        if (!userId) return "No se recibió el user_id. Vuelve a iniciar sesión.";
        if (!form.new_password || form.new_password.length < 6)
            return "La nueva contraseña debe tener al menos 6 caracteres.";
        if (form.new_password !== form.new_password_confirmation)
            return "La confirmación de contraseña no coincide.";
        return "";
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const msg = validate();
        if (msg) return setError(msg);

        setSubmitting(true);
        try {
            await changePasswordFirstLogin({
                user_id: userId,
                new_password: form.new_password,
                new_password_confirmation: form.new_password_confirmation,
            });

            // Contraseña cambiada → vuelve a login con email prefill
            navigate("/login", {
                replace: true,
                state: { emailPrefill: email || "" },
            });
        } catch (err) {
            const apiMsg =
                err?.response?.data?.message ||
                "No se pudo cambiar la contraseña. Verifica los datos e inténtalo nuevamente.";
            setError(apiMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-200 text-slate-900 relative overflow-hidden">
            {/* Decoración sutil */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/50 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-slate-400/20 blur-2xl" />

            <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    {/* Card amber glass */}
                    <div className="rounded-3xl overflow-hidden border border-amber-500/25 bg-amber-200/20 shadow-[0_12px_40px_rgba(15,23,42,0.18)] backdrop-blur-2xl relative">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/35 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent pointer-events-none" />

                        <div className="p-6 lg:p-8">
                            <button
                                type="button"
                                onClick={() => navigate("/login", { replace: true })}
                                className="text-xs text-slate-700 hover:text-slate-900 underline underline-offset-4"
                            >
                                ← Volver
                            </button>

                            <div className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                Cambiar contraseña
                            </div>
                            <div className="mt-2 text-center text-sm text-slate-700">
                                Por seguridad, debes cambiar tu contraseña antes de continuar.
                            </div>

                            {email ? (
                                <div className="mt-6 rounded-xl border border-slate-300 bg-white/60 px-4 py-3 text-sm">
                                    <span className="text-slate-600">Usuario:</span>{" "}
                                    <span className="font-semibold text-slate-900">{email}</span>
                                </div>
                            ) : null}

                            {!userId ? (
                                <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
                                    <div className="font-semibold">Falta información</div>
                                    <div className="mt-1 text-amber-900/90">
                                        No se recibió el identificador del usuario. Vuelve a iniciar sesión.
                                    </div>
                                </div>
                            ) : null}

                            {error ? (
                                <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-800">
                                    <div className="font-semibold">No se pudo actualizar</div>
                                    <div className="mt-1 text-red-700/90">{error}</div>
                                </div>
                            ) : null}

                            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
                                {/* Nueva contraseña */}
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide text-slate-700 mb-2">
                                        Nueva contraseña
                                    </label>

                                    <div className="relative">
                                        <input
                                            className="w-full rounded-xl bg-white/60 border border-slate-300 px-4 py-3 pr-16 text-sm text-slate-900 placeholder:text-slate-500 outline-none
                                 focus:border-amber-600/60 focus:ring-4 focus:ring-amber-500/20 transition-all"
                                            name="new_password"
                                            type={showNew ? "text" : "password"}
                                            value={form.new_password}
                                            onChange={onChange}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            required
                                            disabled={!userId}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowNew((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-colors"
                                            aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            disabled={!userId}
                                        >
                                            <PasswordToggleIcon show={showNew} />
                                        </button>
                                    </div>
                                </div>

                                {/* Confirmar contraseña */}
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide text-slate-700 mb-2">
                                        Confirmar nueva contraseña
                                    </label>

                                    <div className="relative">
                                        <input
                                            className="w-full rounded-xl bg-white/60 border border-slate-300 px-4 py-3 pr-16 text-sm text-slate-900 placeholder:text-slate-500 outline-none
                                 focus:border-amber-600/60 focus:ring-4 focus:ring-amber-500/20 transition-all"
                                            name="new_password_confirmation"
                                            type={showConfirm ? "text" : "password"}
                                            value={form.new_password_confirmation}
                                            onChange={onChange}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            required
                                            disabled={!userId}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-colors"
                                            aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            disabled={!userId}
                                        >
                                            <PasswordToggleIcon show={showConfirm} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    disabled={submitting || !userId}
                                    className="relative w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 text-sm
                             shadow-[0_12px_30px_rgba(16,185,129,0.28)]
                             disabled:opacity-60 disabled:cursor-not-allowed
                             transition-all duration-300 overflow-hidden group"
                                    type="submit"
                                >
                                    <span className="relative z-10">
                                        {submitting ? "Guardando..." : "Guardar nueva contraseña"}
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                                </button>

                                <p className="pt-1 text-xs text-slate-600">
                                    Si no recuerdas tus credenciales o crees que esto es un error,
                                    contacta al administrador.
                                </p>
                            </form>
                        </div>
                    </div>

                    <div className="mt-4 text-center text-xs text-slate-600">
                        © {new Date().getFullYear()} Easy-Reservas
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ===== Icon Component ===== */
function PasswordToggleIcon({ show }) {
    if (show) {
        return (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M10.6 5.15A10.2 10.2 0 0 1 12 5c6 0 9.5 7 9.5 7a18.6 18.6 0 0 1-2.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M6.6 6.6C3.9 8.6 2.5 12 2.5 12s3.5 7 9.5 7c2.05 0 3.85-.55 5.35-1.35"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M9.4 9.4a3.2 3.2 0 0 0 4.48 4.48"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M3 3l18 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}
