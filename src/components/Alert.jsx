import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import clsx from "clsx";

const CONFIG = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Success",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Warning",
  },
  info: {
    icon: Info,
    bg: "bg-sky-100",
    iconColor: "text-sky-600",
    title: "Info",
  },
  fail: {
    icon: XCircle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Error",
  },
};

export function showAlert(options = {}) {
  // options: { type, title, text, confirmText, cancelText, showCancel, onConfirm, onCancel, autoClose, timeout, preventOutsideClose }
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-show-alert", { detail: options }));
}

export default function Alert() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({});
  const timerRef = useRef(null);
  const boxRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    function handler(e) {
      clearTimer();

      const payload = e.detail || {};
      const type = payload.type || "info";
      const cfg = CONFIG[type] || CONFIG.info;

      const normalized = {
        type,
        title: payload.title || cfg.title,
        text: payload.text || "",
        confirmText: payload.confirmText || "OK",
        cancelText: payload.cancelText || "Cancelar",
        showCancel: !!payload.showCancel,
        onConfirm: typeof payload.onConfirm === "function" ? payload.onConfirm : null,
        onCancel: typeof payload.onCancel === "function" ? payload.onCancel : null,
        autoClose: !!payload.autoClose,
        timeout: Number(payload.timeout || 1800),
        preventOutsideClose: !!payload.preventOutsideClose,
      };

      setOpts(normalized);
      setOpen(true);

      if (normalized.autoClose) {
        timerRef.current = setTimeout(() => setOpen(false), normalized.timeout);
      }
    }

    window.addEventListener("app-show-alert", handler);
    return () => {
      clearTimer();
      window.removeEventListener("app-show-alert", handler);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        // ESC = cancelar/cerrar (no confirma)
        if (!opts.preventOutsideClose) handleClose(false);
      }
    };

    const onMouseDown = (e) => {
      if (opts.preventOutsideClose) return;
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) handleClose(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onMouseDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, opts.preventOutsideClose]);

  function handleClose(confirmed = false) {
    clearTimer();
    setOpen(false);

    // Ejecutar callbacks después de cerrar
    if (confirmed && opts.onConfirm) opts.onConfirm();
    if (!confirmed && opts.onCancel) opts.onCancel();
  }

  if (typeof document === "undefined") return null;
  if (!open) return null;

  const cfg = CONFIG[opts.type] || CONFIG.info;
  const Icon = cfg.icon;

  return createPortal(
    <div
      className={clsx(
        "fixed z-[9999] px-4",
        // ✅ Desktop: top-right | Mobile: bottom-center
        "top-4 right-0 sm:right-4 sm:top-4",
        "bottom-4 sm:bottom-auto",
        "left-0 sm:left-auto",
        "flex justify-center sm:justify-end"
      )}
    >
      <div ref={boxRef} className="w-full sm:w-[360px] max-w-full">
        <div className={clsx(cfg.bg, "rounded-2xl shadow-lg p-4 border border-white/40")}>
          <div className="flex items-start gap-3">
            <div className={clsx("p-2 rounded-full bg-white/40")}>
              <Icon className={clsx(cfg.iconColor, "w-5 h-5")} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-extrabold text-gray-900">{opts.title}</h3>
              {opts.text && (
                <p className="mt-1 text-sm text-gray-800 break-words">{opts.text}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {opts.showCancel && (
              <button
                onClick={() => handleClose(false)}
                className="px-3 py-2 rounded-xl bg-white/50 text-gray-800 hover:bg-white/70 text-sm font-semibold"
                type="button"
              >
                {opts.cancelText}
              </button>
            )}

            <button
              onClick={() => handleClose(true)}
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-extrabold"
              type="button"
            >
              {opts.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
