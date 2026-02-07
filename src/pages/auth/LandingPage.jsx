// src/pages/auth/LandingPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import loginIllustration from "../../assets/login-illustration.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuth, loading } = useAuth();

  useEffect(() => {
    if (isAuth) navigate("/dashboard", { replace: true });
  }, [isAuth, navigate]);

  const slides = useMemo(
    () => [
      {
        icon: "🔒",
        title: "JWT Seguro",
        desc: "Autenticación con token y almacenamiento controlado para sesiones confiables.",
        gradient: "from-emerald-500/15 to-teal-500/10",
      },
      {
        icon: "👥",
        title: "Roles y Control de Acceso",
        desc: "Admin y Usuario con permisos definidos para operar con seguridad.",
        gradient: "from-blue-500/15 to-indigo-500/10",
      },
      {
        icon: "📅",
        title: "Reservas sin conflictos",
        desc: "Validación de choques de horarios y reportes de uso por usuario/recurso.",
        gradient: "from-violet-500/15 to-purple-500/10",
      },
      {
        icon: "🔔",
        title: "Notificaciones",
        desc: "Alertas de eventos relevantes y estado de reservas, centralizadas.",
        gradient: "from-pink-500/15 to-rose-500/10",
      },
    ],
    []
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 3500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length]);

  // Evita flash pero sin "pantalla blanca"
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-200 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-8 w-48 rounded-xl bg-white/60 animate-pulse" />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="h-10 w-4/5 rounded-2xl bg-white/60 animate-pulse" />
              <div className="mt-4 h-20 w-full rounded-2xl bg-white/60 animate-pulse" />
              <div className="mt-6 h-40 w-full rounded-2xl bg-white/60 animate-pulse" />
            </div>
            <div className="h-[280px] lg:h-[360px] w-full rounded-[2.25rem] bg-white/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-200 text-slate-900">
      {/* Top bar */}
      <header className="w-full border-b border-slate-300/70 bg-slate-200/70 backdrop-blur supports-[backdrop-filter]:bg-slate-200/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 safe-top">
          <div
            className="font-extrabold tracking-tight text-2xl sm:text-3xl text-slate-900"
            style={{
              textShadow:
                "0 0 14px rgba(16,185,129,0.35), 0 0 34px rgba(16,185,129,0.18)",
            }}
          >
            Easy-Reservas
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm active:scale-[0.99]"
          >
            Entrar al sistema
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <section>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Gestiona recursos con control, orden y seguridad.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
              Easy-Reservas centraliza la reserva de salas y equipos, reduce
              conflictos de horarios y habilita control por roles con autenticación
              JWT.
            </p>

            <div className="mt-6 max-w-xl">
              <div
                className={`rounded-2xl border border-slate-300 bg-gradient-to-br ${slides[slideIndex].gradient} p-4 shadow-sm transition-all duration-500`}
              >
                <div className="min-h-[128px] sm:min-h-[140px]">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl leading-none">
                      {slides[slideIndex].icon}
                    </div>
                    <div>
                      <div className="text-slate-900 font-semibold text-lg sm:text-xl">
                        {slides[slideIndex].title}
                      </div>
                      <div className="mt-1 text-base sm:text-lg text-slate-700 leading-relaxed">
                        {slides[slideIndex].desc}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSlideIndex(idx)}
                      className={`h-2.5 rounded-full transition-all ${idx === slideIndex
                          ? "w-7 bg-slate-900/70"
                          : "w-2.5 bg-slate-900/20 hover:bg-slate-900/35"
                        }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/60 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-semibold text-slate-700">
                Si es tu primer ingreso, el sistema solicitará el cambio de contraseña.
              </span>
            </div>
          </section>

          {/* Right */}
          <section className="flex justify-center lg:justify-end mt-2 lg:mt-0">
            <div className="relative w-full max-w-[560px]">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-white/40 blur-xl" />
              <div className="relative rounded-[2.25rem] border border-slate-300 bg-white/60 p-4 sm:p-6 shadow-sm">
                <img
                  src={loginIllustration}
                  alt="Ilustración Easy-Reservas"
                  className="w-full select-none"
                  draggable="false"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300/70">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 safe-bottom">
          <div>© {new Date().getFullYear()} Easy-Reservas</div>
          <div className="text-slate-500">
            Reservas • Roles • JWT • Notificaciones
          </div>
        </div>
      </footer>
    </div>
  );
}
