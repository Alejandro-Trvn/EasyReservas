import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",

    // opcionales
    subtitle = null,
    wrapperClassName = "",
    lockScrollX = false,
    contentClassName = "",

    // header customization
    headerBg = "bg-amber-100",
    headerTextColor = "text-gray-900",
    headerTextAlign = "left", // "left" | "center" | "right"

    // altura máxima del modal
    maxHeightClassName = "max-h-[85dvh]",
}) => {
    const sizeClasses = useMemo(
        () => ({
            sm: "max-w-md",
            md: "max-w-lg",
            lg: "max-w-2xl",
            xl: "max-w-4xl",
        }),
        []
    );

    const getScrollbarWidth = () =>
        Math.max(0, window.innerWidth - document.documentElement.clientWidth);

    // ✅ FIX: bloquear/restaurar scroll del body según isOpen (robusto + sin layout jump)
    useEffect(() => {
        if (!isOpen) return;

        const body = document.body;

        // guardar estilos previos
        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        // compensar scrollbar para que no "salte" el layout
        const sbw = getScrollbarWidth();
        body.style.overflow = "hidden";
        if (sbw > 0) body.style.paddingRight = `${sbw}px`;

        // iOS/Touch: evita scroll por swipe en background
        const preventTouchMove = (e) => e.preventDefault();
        body.addEventListener("touchmove", preventTouchMove, { passive: false });

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
            body.removeEventListener("touchmove", preventTouchMove);
        };
    }, [isOpen]);

    // ✅ Cerrar con ESC (solo cuando está abierto)
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const titleClasses = ["text-xl font-bold", headerTextColor].join(" ");

    const headerBase = [
        "border-b border-gray-100 rounded-t-2xl",
        "px-4 py-4 sm:px-6 sm:py-6",
        headerBg,
    ].join(" ");

    const subtitleClass = "text-sm text-white/70 mt-2";

    const Header = (() => {
        // center
        if (headerTextAlign === "center") {
            return (
                <div className={`relative ${headerBase}`}>
                    <div className="w-full text-center">
                        <h3 className={titleClasses}>{title}</h3>
                        {subtitle && <div className={subtitleClass}>{subtitle}</div>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>
            );
        }

        // right
        if (headerTextAlign === "right") {
            return (
                <div className={`flex items-center justify-end ${headerBase}`}>
                    <div className="text-right mr-4">
                        <h3 className={titleClasses}>{title}</h3>
                        {subtitle && <div className={subtitleClass}>{subtitle}</div>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>
            );
        }

        // default left
        return (
            <div
                className={[
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between",
                    headerBase,
                ].join(" ")}
            >
                <div className="text-left">
                    <h3 className={titleClasses}>{title}</h3>
                    {subtitle && <div className={subtitleClass}>{subtitle}</div>}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg mt-3 sm:mt-0"
                    aria-label="Cerrar"
                >
                    <X size={20} />
                </button>
            </div>
        );
    })();

    return (
        <div
            className={[
                "fixed inset-0 z-50",
                "flex items-center justify-center",
                "p-3 sm:p-4",
                lockScrollX ? "overflow-x-hidden" : "",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-gray-500/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal container */}
            <div
                className={[
                    "relative w-full",
                    sizeClasses[size] || sizeClasses.md,
                    "bg-white rounded-2xl shadow-xl",
                    "transform transition-all",
                    maxHeightClassName,
                    "flex flex-col",
                    wrapperClassName,
                ].join(" ")}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {Header}

                {/* Body scrolleable */}
                <div
                    className={[
                        "flex-1 overflow-y-auto",
                        "px-4 py-4 sm:px-6 sm:py-6",
                        lockScrollX ? "overflow-x-hidden" : "",
                        contentClassName,
                    ].join(" ")}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
