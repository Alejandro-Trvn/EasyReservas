import React from "react";
import { X } from "lucide-react";

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    // ✅ nuevas props opcionales
    subtitle = null,
    wrapperClassName = "",
    lockScrollX = false,
    contentClassName = "",
    // header customization
    headerBg = "bg-amber-100",
    headerTextColor = "text-gray-900",
    headerTextAlign = "left", // "left" | "center" | "right"
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
                    className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} transform transition-all ${wrapperClassName}`}
                >
                    {
                        (() => {
                            const titleClasses = ["text-xl font-bold", headerTextColor].join(" ");

                            // header layout variations according to alignment
                            if (headerTextAlign === "center") {
                                const headerClasses = [
                                    "relative p-6 border-b border-gray-100 rounded-t-2xl",
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
                                            onClick={onClose}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                );
                            }

                            if (headerTextAlign === "right") {
                                const headerClasses = [
                                    "flex items-center justify-end p-6 border-b border-gray-100 rounded-t-2xl",
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
                                            onClick={onClose}
                                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                );
                            }

                            // default: left
                            const headerClasses = [
                                "flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-100 rounded-t-2xl",
                                headerBg,
                            ].join(" ");

                            return (
                                <div className={headerClasses}>
                                    <div className="text-left">
                                        <h3 className={titleClasses}>{title}</h3>
                                        {subtitle && (
                                            <div className="text-sm text-gray-700 mt-1">{subtitle}</div>
                                        )}
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg mt-3 sm:mt-0"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            );
                        })()
                    }

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