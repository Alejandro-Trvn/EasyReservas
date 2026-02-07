import React, { useMemo } from "react";

export default function SectionHeader({
  title,
  subtitle,
  note,
  Icon,
  textColor = "#ffffff",
  bgColor = "linear-gradient(90deg,#059669,#0ea5e9)",
  topOffset = "-1rem",
}) {
  // Mantengo tu API (topOffset inline), pero evitamos efectos raros en mobile si viene muy agresivo
  const containerStyle = useMemo(
    () => ({
      background: bgColor,
      color: textColor,
      marginTop: topOffset,
    }),
    [bgColor, textColor, topOffset]
  );

  return (
    <header
      className="relative overflow-hidden rounded-2xl shadow-md border border-white/10"
      style={containerStyle}
    >
      {/* capa de brillo sutil */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_45%)]" />

      <div className="relative p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/20 grid place-items-center shrink-0">
            {Icon ? <Icon size={26} className="text-white" /> : null}
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold leading-tight truncate">
              {title}
            </h1>

            {subtitle ? (
              <p className="opacity-90 text-sm sm:text-base leading-snug mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {note ? (
          <div className="mt-3 sm:mt-4 text-sm opacity-90 leading-relaxed">
            {note}
          </div>
        ) : null}
      </div>
    </header>
  );
}
