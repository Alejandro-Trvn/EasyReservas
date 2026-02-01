import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon = null,
  disabled = false,
  type = "button",
}) {
  const base = "inline-flex items-center rounded-md font-medium focus:outline-none transition-shadow";

  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-300",
    ghost: "bg-transparent hover:bg-emerald-50 text-emerald-700",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-2 focus:ring-red-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className, disabled && "opacity-60 cursor-not-allowed")}
    >
      {Icon && <Icon className={clsx("mr-2", size === "sm" ? "w-4 h-4" : "w-5 h-5")} />}
      <span>{children}</span>
    </button>
  );
}
