import React from "react";

/**
 * Tabla minimalista SIN bordes internos (similar a tu imagen).
 *
 * Props:
 * - columns: [{ key: "feature", title: "FEATURE DESCRIPTION", align?: "left"|"center"|"right", width?: string }]
 * - rows: [{ id?: string|number, feature: "First Row", col1: true, col2: "warn", ... }]
 * - dotKeys: string[] -> keys que se renderizan como puntos (dot)
 * - getDotState: (value, row, colKey) => "on" | "off" | "warn" | "muted"
 * - bodyClassName: string -> classes aplicadas al texto de las celdas del cuerpo (p.e. "text-xs text-slate-700")
 */
export default function TablaMinimalista({
    columns = [],
    rows = [],
    dotKeys = [],
    getDotState,
    className = "",
    // Background class for header row (default bg-amber-50)
    headerBg = "bg-amber-50",
    // Classes applied to table body text (default: small)
    bodyClassName = "text-sm text-slate-700",
}) {
    const alignClass = (align) => {
        if (align === "right") return "text-right";
        if (align === "center") return "text-center";
        return "text-left";
    };

    const renderDot = (state = "off") => {
        // Colores: naranja (warn/on), gris oscuro (on), gris claro (off/muted)
        const cls =
            state === "warn"
                ? "bg-amber-500"
                : state === "on"
                    ? "bg-slate-700"
                    : state === "muted"
                        ? "bg-slate-300"
                        : "bg-slate-200";

        return (
            <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`}
                aria-hidden="true"
            />
        );
    };

    const resolveDotState = (value, row, colKey) => {
        if (typeof getDotState === "function") return getDotState(value, row, colKey);

        // Heurística por defecto:
        // true => warn (naranja), false/null => muted (gris),
        // "on"/"off"/"warn"/"muted" => respeta string
        if (value === true) return "warn";
        if (value === false || value == null) return "muted";
        if (typeof value === "string") {
            const v = value.toLowerCase();
            if (["on", "off", "warn", "muted"].includes(v)) return v;
        }
        return "muted";
    };

    return (
        <div className={`w-full overflow-x-auto ${className}`}>
            <table className="w-full border-separate border-spacing-0">
                {/* Header */}
                <thead>
                    <tr className={`${headerBg}`}>
                        {columns.map((c) => (
                            <th
                                key={c.key}
                                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 ${alignClass(
                                    c.align
                                )}`}
                                style={c.width ? { width: c.width } : undefined}
                            >
                                {c.title}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody>
                    {rows.map((row, idx) => (
                        <tr
                            key={row.id ?? idx}
                            className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                            {columns.map((c) => {
                                const value = row?.[c.key];

                                const isDot = dotKeys.includes(c.key);

                                return (
                                    <td
                                        key={`${row.id ?? idx}-${c.key}`}
                                        className={`px-4 py-3 ${bodyClassName} ${alignClass(
                                                c.align
                                            )}`}
                                    >
                                        {isDot ? (
                                            <div className="flex justify-center">
                                                {renderDot(resolveDotState(value, row, c.key))}
                                            </div>
                                        ) : (
                                            value ?? "—"
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
