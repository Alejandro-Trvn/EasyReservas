import React from "react";

export default function SectionHeader({
  title,
  subtitle,
  note,
  Icon,
  textColor = "#ffffff",
  bgColor = "linear-gradient(90deg,#059669,#0ea5e9)",
  topOffset = "-1rem",
}) {
  const containerStyle = { background: bgColor, color: textColor, marginTop: topOffset };

  return (
    <header className="relative overflow-hidden rounded-2xl p-6 shadow-md" style={containerStyle}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 grid place-items-center">
          {Icon ? <Icon size={28} /> : null}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="opacity-90">{subtitle}</p>}
        </div>
      </div>
      {note && <div className="mt-4 text-sm opacity-90">{note}</div>}
    </header>
  );
}
