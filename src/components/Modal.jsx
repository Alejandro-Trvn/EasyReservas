import React, { useEffect } from "react";
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

    // ✅ NUEVO: altura máxima del modal (útil si quieres variar)
    maxHeightClassName = "max-h-[85dvh]",
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    // ✅ Bloquear scroll del body cuando el modal esté abierto
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    // ✅ Cerrar con ESC
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const titleClasses = ["text-xl font-bold", headerTextColor].join(" ");

    // Header alignment
    const Header = (() => {
        // center
        if (headerTextAlign === "center") {
            const headerClasses = [
                "relative border-b border-gray-100 rounded-t-2xl",
                "px-4 py-4 sm:px-6 sm:py-6",
                headerBg,
            ].join(" ");

            return (
                <div className={headerClasses}>
                    <div className="w-full text-center">
                        <h3 className={titleClasses}>{title}</h3>
                        {subtitle && (
                            <div className="text-sm text-gray-700 mt-1">{subtitle}</div>
                        )}
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
            const headerClasses = [
                "flex items-center justify-end border-b border-gray-100 rounded-t-2xl",
                "px-4 py-4 sm:px-6 sm:py-6",
                headerBg,
            ].join(" ");

            return (
                <div className={headerClasses}>
                    <div className="text-right mr-4">
                        <h3 className={titleClasses}>{title}</h3>
                        {subtitle && (
                            <div className="text-sm text-gray-700 mt-1">{subtitle}</div>
                        )}
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
        const headerClasses = [
            "flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 rounded-t-2xl",
            "px-4 py-4 sm:px-6 sm:py-6",
            headerBg,
        ].join(" ");

        return (
            <div className={headerClasses}>
                <div className="text-left">
                    <h3 className={titleClasses}>{title}</h3>
                    {subtitle && <div className="text-sm text-gray-700 mt-1">{subtitle}</div>}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg mt-3 sm:mt-0"
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
                    sizeClasses[size],
                    "bg-white rounded-2xl shadow-xl",
                    "transform transition-all",
                    maxHeightClassName, // ✅ alto máximo en dvh
                    "flex flex-col",    // ✅ header fijo + body scrolleable
                    wrapperClassName,
                ].join(" ")}
                // Evita que el click dentro cierre el modal
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
