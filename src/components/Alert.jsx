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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!opts.preventOutsideClose) handleClose(false);
        }}
      />

      <div className="relative z-10 max-w-xl w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-start gap-4">
            <div className={clsx("p-3 rounded-full", cfg.bg)}>
              <Icon className={clsx(cfg.iconColor, "w-6 h-6")} />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{opts.title}</h3>
              {opts.text && (
                <p className="mt-2 text-sm text-gray-600">{opts.text}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {opts.showCancel && (
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                {opts.cancelText}
              </button>
            )}

            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
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
