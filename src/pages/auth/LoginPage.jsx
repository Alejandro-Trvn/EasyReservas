// src/pages/auth/LoginPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login as apiLogin } from "../../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuth, loading, refreshMe, setToken } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const emailPrefill = location?.state?.emailPrefill || location?.state?.email;
    if (emailPrefill) setForm((p) => ({ ...p, email: emailPrefill }));
  }, [location?.state]);

  useEffect(() => {
    if (!loading && isAuth) {
      const from = location?.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuth, loading, navigate, location?.state]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email?.trim()) return "Ingresa tu correo.";
    if (!form.password) return "Ingresa tu contraseña.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    const msg = validate();
    if (msg) return setError(msg);

    setSubmitting(true);
    try {
      const result = await apiLogin(form.email.trim(), form.password);

      // 1) Forzar cambio de contraseña (backend 403)
      if (result?.mustChangePassword) {
        navigate("/cambiar-clave-primer-login", {
          replace: true,
          state: { userId: result.userId, email: result.email },
        });
        return;
      }

      // 2) Errores controlados por el servicio
      if (!result?.ok) {
        setError(result?.message || "No se pudo iniciar sesión.");
        return;
      }

      // 3) Token
      const token =
        result?.data?.access_token || localStorage.getItem("access_token");
      if (token) setToken(token);

      // 4) Cargar /me para user + role + permisos (context)
      await refreshMe();

      // 5) Redirigir
      const from = location?.state?.from || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo iniciar sesión. Verifica tus credenciales.";
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

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-10 safe-top safe-bottom">
        <div className="w-full max-w-md">
          {/* Card amber glass */}
          <div className="rounded-3xl overflow-hidden border border-amber-500/25 bg-amber-200/20 shadow-[0_12px_40px_rgba(15,23,42,0.18)] backdrop-blur-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent pointer-events-none" />

            <div className="p-5 sm:p-6 lg:p-8">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/35 active:bg-white/45 transition
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25"
              >
                <span aria-hidden="true">←</span> Volver
              </button>

              {/* Título centrado */}
              <div className="mt-4 text-center text-3xl sm:text-[2.1rem] font-extrabold tracking-tight text-slate-900">
                Log In
              </div>
              <div className="mt-2 text-center text-sm text-slate-700">
                Inicia sesión para continuar en Easy-Reservas
              </div>

              {error ? (
                <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-800">
                  <div className="font-semibold">No se pudo ingresar</div>
                  <div className="mt-1 text-red-700/90">{error}</div>
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="admin@uni.com"
                    autoComplete="username"
                    inputMode="email"
                    className="w-full rounded-xl bg-white/60 border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none
                               focus:border-amber-600/60 focus:ring-4 focus:ring-amber-500/20 transition-all"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl bg-white/60 border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-500 outline-none
                                 focus:border-amber-600/60 focus:ring-4 focus:ring-amber-500/20 transition-all"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-600 hover:bg-white/40 hover:text-slate-900 active:bg-white/50 transition-colors
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25"
                      aria-label={
                        showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      <PasswordToggleIcon show={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Login */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="relative w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3.5 text-sm
                             shadow-[0_12px_30px_rgba(16,185,129,0.28)]
                             disabled:opacity-60 disabled:cursor-not-allowed
                             transition-all duration-300 overflow-hidden group
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25"
                >
                  <span className="relative z-10">
                    {submitting ? "Logging in..." : "Login"}
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </button>

                <div className="pt-2 text-xs text-slate-600">
                  Seguridad JWT, roles y auditoría básica de reservas.
                </div>
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
