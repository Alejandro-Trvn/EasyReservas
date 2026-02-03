import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * HourRangePicker (React + Tailwind)
 * - Un SOLO componente: selecciona DESDE / HASTA
 * - UI estilo "mobile time picker": HH:MM + AM/PM + reloj circular
 * - Restringe el rango a [min,max] (ej: 12:00PM-4:00PM)
 * - Asegura desde <= hasta (si no, ajusta automáticamente)
 *
 * Props:
 *  - value: { from: string|null, to: string|null }  (ej {from:"12:30PM", to:"03:00PM"})
 *  - onChange: (next) => void
 *  - min: string (ej "12:00PM" o "12:00")
 *  - max: string (ej "16:00" o "04:00PM")
 *  - stepMinutes: number (default 5)
 *  - use12h: boolean (default true)
 *  - label: string (default "Select time")
 *  - placeholderFrom / placeholderTo
 *  - disabled: boolean
 */
export default function HourRangePicker({
    value = { from: null, to: null },
    onChange,
    min = "12:00PM",
    max = "04:00PM",
    stepMinutes = 5,
    use12h = true,
    label = "Select time",
    placeholderFrom = "Desde",
    placeholderTo = "Hasta",
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const [activeSide, setActiveSide] = useState("from"); // "from" | "to"
    const [activeField, setActiveField] = useState("hh"); // "hh" | "mm"
    const dialogRef = useRef(null);

    // Estado interno del picker (solo se edita el lado activo)
    const [hh, setHh] = useState(7);
    const [mm, setMm] = useState(0);
    const [ampm, setAmpm] = useState("AM");

    // Estado interno rango
    const [fromM, setFromM] = useState(null); // minutes
    const [toM, setToM] = useState(null); // minutes

    // ---------- Helpers de tiempo ----------
    const pad2 = (n) => String(n).padStart(2, "0");
    const normalizeInput = (s) => String(s || "").trim().toUpperCase();

    function parseToMinutes(str) {
        const s = normalizeInput(str);
        const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
        if (m12) {
            let h = Number(m12[1]);
            const minutes = Number(m12[2]);
            const ap = m12[3];
            if (h === 12) h = 0;
            if (ap === "PM") h += 12;
            return h * 60 + minutes;
        }
        const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
        if (m24) {
            const h = Number(m24[1]);
            const minutes = Number(m24[2]);
            return h * 60 + minutes;
        }
        return null;
    }

    function minutesToDisplay(totalMinutes) {
        if (totalMinutes == null) return "";
        const h24 = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;

        if (!use12h) return `${pad2(h24)}:${pad2(m)}`;

        const ap = h24 >= 12 ? "PM" : "AM";
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        return `${pad2(h12)}:${pad2(m)}${ap}`;
    }

    function stateToMinutes() {
        if (!use12h) return (Number(hh) % 24) * 60 + (Number(mm) % 60);

        let h12 = Number(hh);
        if (h12 === 12) h12 = 0;
        let h24 = h12;
        if (ampm === "PM") h24 += 12;
        return (h24 % 24) * 60 + (Number(mm) % 60);
    }

    function minutesToState(totalMinutes) {
        const h24 = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;

        if (!use12h) return { hh: h24, mm: m, ampm: "AM" };

        const ap = h24 >= 12 ? "PM" : "AM";
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        return { hh: h12, mm: m, ampm: ap };
    }

    function clampToRange(totalMinutes, minM, maxM) {
        return Math.min(Math.max(totalMinutes, minM), maxM);
    }

    const minM = useMemo(() => parseToMinutes(min) ?? 0, [min]);
    const maxM = useMemo(() => parseToMinutes(max) ?? 23 * 60 + 59, [max]);

    const step = useMemo(() => Math.max(1, Number(stepMinutes) || 5), [stepMinutes]);

    function snapMinutes(m) {
        if (m == null) return null;
        const snapped = m - (m % step);
        return clampToRange(snapped, minM, maxM);
    }

    const minuteOptions = useMemo(() => {
        const arr = [];
        for (let m = 0; m < 60; m += step) arr.push(m);
        return arr;
    }, [step]);

    const dialHours = useMemo(() => [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], []);

    // ---------- Apertura / sincronización ----------
    useEffect(() => {
        if (!open) return;

        const vFrom = value?.from ? parseToMinutes(value.from) : null;
        const vTo = value?.to ? parseToMinutes(value.to) : null;

        // si no vienen, ponemos defaults dentro del rango
        const initFrom = snapMinutes(vFrom ?? minM);
        const initTo = snapMinutes(vTo ?? Math.min(minM + 60, maxM)); // +1h por defecto

        // asegurar orden
        const fixedFrom = initFrom;
        const fixedTo = Math.max(initTo, fixedFrom);

        setFromM(fixedFrom);
        setToM(fixedTo);

        // cargar estado del lado activo
        const base = activeSide === "from" ? fixedFrom : fixedTo;
        const st = minutesToState(base);
        setHh(st.hh);
        setMm(st.mm - (st.mm % step));
        setAmpm(st.ampm);
        setActiveField("hh");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Cerrar con ESC + click fuera
    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        const onClickOutside = (e) => {
            if (!dialogRef.current) return;
            if (!dialogRef.current.contains(e.target)) setOpen(false);
        };

        window.addEventListener("keydown", onKey);
        window.addEventListener("mousedown", onClickOutside);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("mousedown", onClickOutside);
        };
    }, [open]);

    // Cuando cambias de lado (desde/hasta) dentro del modal: cargar ese valor al header
    useEffect(() => {
        if (!open) return;
        const base = activeSide === "from" ? fromM : toM;
        if (base == null) return;
        const st = minutesToState(base);
        setHh(st.hh);
        setMm(st.mm - (st.mm % step));
        setAmpm(st.ampm);
        setActiveField("hh");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSide]);

    // ---------- Interacciones ----------
    function setSideMinutes(nextMinutes) {
        const clamped = snapMinutes(nextMinutes);

        if (activeSide === "from") {
            const newFrom = clamped;
            const newTo = toM == null ? newFrom : Math.max(toM, newFrom);
            setFromM(newFrom);
            setToM(newTo);
            return;
        }

        // activeSide === "to"
        const newTo = clamped;
        const newFrom = fromM == null ? newTo : Math.min(fromM, newTo);
        setFromM(newFrom);
        setToM(newTo);
    }

    const handleSelectHourFromDial = (hDial) => {
        if (activeField !== "hh") return;

        if (use12h) {
            setHh(hDial);
            const next = stateToMinutesWithOverride({ hh: hDial, mm, ampm });
            setSideMinutes(next);
            return;
        }

        // 24h: bloque según hora actual del lado activo
        const current = minutesToHours24(activeSide === "from" ? fromM : toM);
        const isPMBlock = (current ?? 0) >= 12;
        const base = isPMBlock ? 12 : 0;
        const h = hDial % 12;
        const candidateH = base + h;
        setHh(candidateH);

        const next = stateToMinutesWithOverride({ hh: candidateH, mm, ampm: "AM" });
        setSideMinutes(next);
    };

    const handleSelectMinute = (m) => {
        setMm(m);
        const next = stateToMinutesWithOverride({ hh, mm: m, ampm });
        setSideMinutes(next);
    };

    const handleSetAmpm = (ap) => {
        setAmpm(ap);
        const next = stateToMinutesWithOverride({ hh, mm, ampm: ap });
        setSideMinutes(next);
    };

    function minutesToHours24(totalMinutes) {
        if (totalMinutes == null) return null;
        return Math.floor(totalMinutes / 60) % 24;
    }

    function stateToMinutesWithOverride({ hh: hhX, mm: mmX, ampm: apX }) {
        if (!use12h) return (Number(hhX) % 24) * 60 + (Number(mmX) % 60);

        let h12 = Number(hhX);
        if (h12 === 12) h12 = 0;
        let h24 = h12;
        if (apX === "PM") h24 += 12;
        return (h24 % 24) * 60 + (Number(mmX) % 60);
    }

    const apply = () => {
        const finalFrom = snapMinutes(fromM ?? minM);
        const finalTo = snapMinutes(toM ?? Math.max(finalFrom, Math.min(finalFrom + 60, maxM)));

        const fixedFrom = finalFrom;
        const fixedTo = Math.max(finalTo, fixedFrom);

        const next = {
            from: minutesToDisplay(fixedFrom),
            to: minutesToDisplay(fixedTo),
        };

        onChange?.(next);
        setOpen(false);
    };

    const cancel = () => setOpen(false);

    const rangeLabel = `${minutesToDisplay(minM)} - ${minutesToDisplay(maxM)}`;

    const displayFrom = value?.from ? minutesToDisplay(parseToMinutes(value.from)) : "";
    const displayTo = value?.to ? minutesToDisplay(parseToMinutes(value.to)) : "";

    // ---------- Dial UI ----------
    const dial = (
        <div className="relative mx-auto mt-3 h-44 w-44 rounded-full bg-gray-50">
            {dialHours.map((n, idx) => {
                const angle = (idx / 12) * (2 * Math.PI) - Math.PI / 2;
                const r = 70;
                const x = 88 + r * Math.cos(angle);
                const y = 88 + r * Math.sin(angle);

                const baseMin = activeSide === "from" ? fromM : toM;
                const st = baseMin == null ? null : minutesToState(baseMin);
                const isSelected = use12h ? Number(st?.hh) === n : false;

                return (
                    <button
                        key={n}
                        type="button"
                        onClick={() => handleSelectHourFromDial(n)}
                        className={[
                            "absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold transition",
                            isSelected ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100",
                            activeField === "hh" ? "cursor-pointer" : "cursor-default opacity-60",
                        ].join(" ")}
                        style={{ left: `${x}px`, top: `${y}px` }}
                        aria-label={`hour-${n}`}
                    >
                        {n}
                    </button>
                );
            })}

            {/* manecilla aproximada */}
            <div className="pointer-events-none absolute inset-0">
                {(() => {
                    const baseMin = activeSide === "from" ? fromM : toM;
                    const st = baseMin == null ? { hh, mm, ampm } : minutesToState(baseMin);
                    const order = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                    const hourIndex = Math.max(0, order.indexOf(Number(st.hh)));
                    const angle = (hourIndex / 12) * 360;
                    return (
                        <div
                            className="absolute left-1/2 top-1/2 h-16 w-[2px] -translate-x-1/2 -translate-y-full bg-violet-600"
                            style={{
                                transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                                transformOrigin: "bottom",
                            }}
                        />
                    );
                })()}
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600" />
            </div>
        </div>
    );

    return (
        <div className="w-full">
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(true)}
                className={[
                    "w-full rounded-xl border px-4 py-3 text-left",
                    "flex items-start justify-between gap-3",
                    disabled ? "cursor-not-allowed opacity-60" : "hover:bg-gray-50",
                ].join(" ")}
            >
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500">Horario</span>

                    <div className="flex items-center gap-2">
                        <span className={displayFrom ? "text-sm font-extrabold text-gray-900" : "text-sm text-gray-400"}>
                            {displayFrom || placeholderFrom}
                        </span>
                        <span className="text-sm font-bold text-gray-400">—</span>
                        <span className={displayTo ? "text-sm font-extrabold text-gray-900" : "text-sm text-gray-400"}>
                            {displayTo || placeholderTo}
                        </span>
                    </div>

                    <span className="text-[11px] text-gray-500">Rango permitido: {rangeLabel}</span>
                </div>
                <span className="mt-1 text-gray-400">▾</span>
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4">
                    <div ref={dialogRef} className="w-[340px] max-w-full rounded-2xl bg-white p-4 shadow-xl">
                        <div className="text-sm font-semibold text-gray-700">{label}</div>

                        {/* Toggle Desde / Hasta */}
                        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                            <button
                                type="button"
                                onClick={() => setActiveSide("from")}
                                className={[
                                    "rounded-lg px-3 py-2 text-xs font-extrabold transition",
                                    activeSide === "from" ? "bg-white text-violet-700 shadow" : "text-gray-600",
                                ].join(" ")}
                            >
                                DESDE
                                <div className="mt-0.5 text-[11px] font-bold text-gray-500">
                                    {minutesToDisplay(fromM)}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSide("to")}
                                className={[
                                    "rounded-lg px-3 py-2 text-xs font-extrabold transition",
                                    activeSide === "to" ? "bg-white text-violet-700 shadow" : "text-gray-600",
                                ].join(" ")}
                            >
                                HASTA
                                <div className="mt-0.5 text-[11px] font-bold text-gray-500">
                                    {minutesToDisplay(toM)}
                                </div>
                            </button>
                        </div>

                        {/* Header HH:MM + AM/PM */}
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveField("hh")}
                                    className={[
                                        "w-16 rounded-xl px-3 py-2 text-center text-2xl font-extrabold",
                                        activeField === "hh" ? "bg-violet-200 text-violet-900" : "bg-gray-100 text-gray-700",
                                    ].join(" ")}
                                >
                                    {pad2(hh)}
                                </button>

                                <span className="text-2xl font-extrabold text-gray-400">:</span>

                                <button
                                    type="button"
                                    onClick={() => setActiveField("mm")}
                                    className={[
                                        "w-16 rounded-xl px-3 py-2 text-center text-2xl font-extrabold",
                                        activeField === "mm" ? "bg-violet-200 text-violet-900" : "bg-gray-100 text-gray-700",
                                    ].join(" ")}
                                >
                                    {pad2(mm)}
                                </button>
                            </div>

                            {use12h ? (
                                <div className="flex flex-col overflow-hidden rounded-xl border">
                                    <button
                                        type="button"
                                        onClick={() => handleSetAmpm("AM")}
                                        className={[
                                            "px-4 py-2 text-xs font-bold",
                                            ampm === "AM" ? "bg-violet-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50",
                                        ].join(" ")}
                                    >
                                        AM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSetAmpm("PM")}
                                        className={[
                                            "px-4 py-2 text-xs font-bold",
                                            ampm === "PM" ? "bg-violet-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50",
                                        ].join(" ")}
                                    >
                                        PM
                                    </button>
                                </div>
                            ) : (
                                <div className="text-xs font-semibold text-gray-500 text-right">
                                    24h
                                </div>
                            )}
                        </div>

                        {/* Dial */}
                        {dial}

                        {/* Minutos */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-gray-600">
                                    {activeField === "mm" ? "Minutos" : "Toque un número para elegir hora"}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                    Selección actual:{" "}
                                    <span className="font-extrabold">
                                        {minutesToDisplay(activeSide === "from" ? fromM : toM)}
                                    </span>
                                </div>
                            </div>

                            {activeField === "mm" && (
                                <div className="mt-2 grid grid-cols-6 gap-2">
                                    {minuteOptions.map((m) => {
                                        const selected = Number(mm) === m;
                                        return (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => handleSelectMinute(m)}
                                                className={[
                                                    "rounded-lg px-2 py-2 text-xs font-bold",
                                                    selected ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                                ].join(" ")}
                                            >
                                                {pad2(m)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Hint de orden */}
                        {fromM != null && toM != null && toM < fromM && (
                            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700">
                                El rango no es válido (Hasta &lt; Desde). Se ajustará automáticamente.
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={cancel}
                                className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={apply}
                                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-violet-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
