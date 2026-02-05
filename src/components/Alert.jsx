import React, { useEffect, useState } from "react";
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
  // options: { type, title, text, confirmText, cancelText, showCancel, onConfirm, onCancel, autoClose, timeout }
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-show-alert", { detail: options }));
}

export default function Alert() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({});

  useEffect(() => {
    function handler(e) {
      const payload = e.detail || {};
      const normalized = {
        type: payload.type || "info",
        title: payload.title || CONFIG[payload.type || "info"].title,
        text: payload.text || "",
        confirmText: payload.confirmText || "OK",
        cancelText: payload.cancelText || "Cancelar",
        showCancel: !!payload.showCancel,
        onConfirm: typeof payload.onConfirm === "function" ? payload.onConfirm : null,
        onCancel: typeof payload.onCancel === "function" ? payload.onCancel : null,
        autoClose: !!payload.autoClose,
        timeout: payload.timeout || 1800,
        preventOutsideClose: !!payload.preventOutsideClose,
      };

      setOpts(normalized);
      setOpen(true);

      if (normalized.autoClose) {
        setTimeout(() => setOpen(false), normalized.timeout);
      }
    }

    window.addEventListener("app-show-alert", handler);
    return () => window.removeEventListener("app-show-alert", handler);
  }, []);

  function handleClose(confirmed = false) {
    setOpen(false);
    if (confirmed && opts.onConfirm) opts.onConfirm();
    if (!confirmed && opts.onCancel) opts.onCancel();
  }

  if (typeof document === "undefined") return null;
  if (!open) return null;

  const cfg = CONFIG[opts.type] || CONFIG.info;
  const Icon = cfg.icon;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-3">
      <div className="relative z-10 max-w-xs w-full">
        <div className={clsx(cfg.bg, "rounded-lg shadow-md p-3")}> 
          <div className="flex items-start gap-3">
            <div className={clsx("p-2 rounded-full bg-white/20")}> 
              <Icon className={clsx(cfg.iconColor, "w-5 h-5")} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">{opts.title}</h3>
              {opts.text && (
                <p className="mt-1 text-sm text-gray-800">{opts.text}</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            {opts.showCancel && (
              <button
                onClick={() => handleClose(false)}
                className="px-3 py-1 rounded-md bg-white/30 text-gray-800 hover:bg-white/40"
              >
                {opts.cancelText}
              </button>
            )}

            <button
              onClick={() => handleClose(true)}
              className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
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
