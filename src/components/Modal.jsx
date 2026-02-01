import React from "react";
import { X } from "lucide-react";

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",

    // ✅ nuevas props opcionales
    lockScrollX = false,
    contentClassName = "",
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return (
        <div
            className={[
                "fixed inset-0 z-50 overflow-y-auto",
                lockScrollX ? "overflow-x-hidden" : "",
            ].join(" ")}
        >
            <div
                className="fixed inset-0 bg-gray-500/50 transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} transform transition-all`}
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-amber-100 rounded-t-2xl">
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div
                        className={[
                            "p-6",
                            lockScrollX ? "overflow-x-hidden" : "",
                            contentClassName,
                        ].join(" ")}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};