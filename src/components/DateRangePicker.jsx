import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronUp, ChevronDown } from "lucide-react";

export default function DateRangePicker({
    value = { from: null, to: null },
    onChange,
    minDate = null,
    maxDate = null,
    placeholder = "Seleccionar rango de fechas",
    disabled = false,
}) {
    const [open, setOpen] = useState(false);

    // Draft (para Cancel/OK)
    const [draftFrom, setDraftFrom] = useState(null);
    const [draftTo, setDraftTo] = useState(null);

    // Vista: "day" (calendario), "month" (grid meses), "year" (grid años por década)
    const [viewMode, setViewMode] = useState("day"); // "day" | "month" | "year"

    // Mes/año visibles
    const [viewYear, setViewYear] = useState(() => (value?.from ?? new Date()).getFullYear());
    const [viewMonth, setViewMonth] = useState(() => (value?.from ?? new Date()).getMonth());

    // Range de años (decada)
    const decadeStart = useMemo(() => Math.floor(viewYear / 10) * 10, [viewYear]);

    const ref = useRef(null);

    // ---------- helpers fecha ----------
    const startOfDay = (d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    };

    const isSameDay = (a, b) => {
        if (!a || !b) return false;
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    };

    const isBefore = (a, b) => startOfDay(a).getTime() < startOfDay(b).getTime();
    const isAfter = (a, b) => startOfDay(a).getTime() > startOfDay(b).getTime();

    const clampDate = (d) => {
        if (!d) return d;
        let x = startOfDay(d);
        if (minDate && isBefore(x, minDate)) x = startOfDay(minDate);
        if (maxDate && isAfter(x, maxDate)) x = startOfDay(maxDate);
        return x;
    };

    const fmt = (d) => {
        if (!d) return "";
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const displayValue =
        value?.from && value?.to
            ? `${fmt(value.from)} - ${fmt(value.to)}`
            : value?.from
                ? `${fmt(value.from)} - …`
                : "";

    // ---------- abrir / cerrar ----------
    useEffect(() => {
        if (!open) return;

        const from = value?.from ? clampDate(value.from) : null;
        const to = value?.to ? clampDate(value.to) : null;

        setDraftFrom(from);
        setDraftTo(to);

        const base = from ?? new Date();
        setViewYear(base.getFullYear());
        setViewMonth(base.getMonth());
        setViewMode("day");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        const onClick = (e) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setOpen(false);
        };

        window.addEventListener("keydown", onKey);
        window.addEventListener("mousedown", onClick);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("mousedown", onClick);
        };
    }, [open]);

    // ---------- disabled / rango ----------
    const isDisabled = (d) => {
        if (minDate && isBefore(d, minDate)) return true;
        if (maxDate && isAfter(d, maxDate)) return true;
        return false;
    };

    const isInRange = (d) => {
        if (!draftFrom || !draftTo) return false;
        const t = d.getTime();
        const a = startOfDay(draftFrom).getTime();
        const b = startOfDay(draftTo).getTime();
        return t >= Math.min(a, b) && t <= Math.max(a, b);
    };

    const isRangeStart = (d) => draftFrom && isSameDay(d, draftFrom);
    const isRangeEnd = (d) => draftTo && isSameDay(d, draftTo);

    const pickDay = (d) => {
        if (isDisabled(d)) return;
        const day = startOfDay(d);

        // 1er clic: from
        if (!draftFrom || (draftFrom && draftTo)) {
            setDraftFrom(day);
            setDraftTo(null);
            return;
        }

        // 2do clic: to (y si es antes, swap)
        if (draftFrom && !draftTo) {
            if (isBefore(day, draftFrom)) {
                setDraftTo(draftFrom);
                setDraftFrom(day);
            } else {
                setDraftTo(day);
            }
        }
    };

    // ---------- Calendar grid (día) ----------
    const monthLabel = useMemo(() => {
        const d = new Date(viewYear, viewMonth, 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }, [viewYear, viewMonth]);

    const daysGrid = useMemo(() => {
        // Semana inicia lunes (como tu UI anterior)
        const first = new Date(viewYear, viewMonth, 1);
        const last = new Date(viewYear, viewMonth + 1, 0);

        const firstDow = (first.getDay() + 6) % 7; // lunes=0
        const totalDays = last.getDate();

        const cells = [];
        for (let i = 0; i < firstDow; i++) {
            const d = new Date(viewYear, viewMonth, -(firstDow - 1 - i));
            cells.push({ date: d, inMonth: false });
        }
        for (let day = 1; day <= totalDays; day++) {
            cells.push({ date: new Date(viewYear, viewMonth, day), inMonth: true });
        }
        while (cells.length < 42) {
            const d = new Date(
                viewYear,
                viewMonth,
                totalDays + (cells.length - (firstDow + totalDays)) + 1
            );
            cells.push({ date: d, inMonth: false });
        }

        return cells.map((c) => ({ ...c, date: startOfDay(c.date) }));
    }, [viewYear, viewMonth]);

    const prevMonth = () => {
        const d = new Date(viewYear, viewMonth - 1, 1);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    };

    const nextMonth = () => {
        const d = new Date(viewYear, viewMonth + 1, 1);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    };

    // ---------- Month / Year picker (como imágenes) ----------
    const months = useMemo(
        () => [
            { key: 0, label: "ene" },
            { key: 1, label: "feb" },
            { key: 2, label: "mar" },
            { key: 3, label: "abr" },
            { key: 4, label: "may" },
            { key: 5, label: "jun" },
            { key: 6, label: "jul" },
            { key: 7, label: "ago" },
            { key: 8, label: "sep" },
            { key: 9, label: "oct" },
            { key: 10, label: "nov" },
            { key: 11, label: "dic" },
        ],
        []
    );

    const yearsGrid = useMemo(() => {
        // 16 celdas: (decade-2 .. decade+13) para "fade" arriba/abajo
        const start = decadeStart - 2;
        return Array.from({ length: 16 }, (_, i) => start + i);
    }, [decadeStart]);

    const yearRangeLabel = `${decadeStart} - ${decadeStart + 9}`;

    const goDecadeUp = () => setViewYear((y) => y - 10);
    const goDecadeDown = () => setViewYear((y) => y + 10);

    const goYearUp = () => setViewYear((y) => y - 1);
    const goYearDown = () => setViewYear((y) => y + 1);

    const pickMonth = (m) => {
        setViewMonth(m);
        setViewMode("day");
    };

    const pickYear = (y) => {
        setViewYear(y);
        setViewMode("month");
    };

    // icon click: alterna day -> month -> year -> month...
    const toggleMonthYearPicker = () => {
        setViewMode((m) => {
            if (m === "day") return "month";
            if (m === "month") return "year";
            return "month";
        });
    };

    // ---------- Footer actions ----------
    const cancel = () => setOpen(false);

    const apply = () => {
        const from = draftFrom ? clampDate(draftFrom) : null;
        const to = draftTo ? clampDate(draftTo) : null;
        onChange?.({ from, to });
        setOpen(false);
    };

    return (
        <div className="w-full">
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(true)}
                className={[
                    "w-full rounded-xl border px-4 py-3 text-left",
                    "flex items-center justify-between gap-3",
                    disabled ? "cursor-not-allowed opacity-60" : "hover:bg-gray-50",
                ].join(" ")}
            >
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500">Date range</span>
                    <span className={displayValue ? "text-sm font-semibold text-gray-900" : "text-sm text-gray-400"}>
                        {displayValue || placeholder}
                    </span>
                </div>

                {/* Icono (lucide-react) */}
                <div className="h-9 w-9 rounded-lg border bg-white grid place-items-center text-gray-600">
                    <CalendarDays size={18} />
                </div>
            </button>

            {/* Popover */}
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/30 p-4 pt-20">
                    <div ref={ref} className="w-[380px] max-w-full rounded-2xl bg-white p-4 shadow-xl">
                        {/* Header tipo input + icon click (abre month/year picker) */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-800">
                                {draftFrom ? fmt(draftFrom) : "…"}{" "}
                                <span className="text-gray-400">-</span>{" "}
                                {draftTo ? fmt(draftTo) : "…"}
                            </div>

                            <button
                                type="button"
                                onClick={toggleMonthYearPicker}
                                className={[
                                    "h-9 w-9 rounded-lg grid place-items-center",
                                    viewMode === "day" ? "bg-violet-100 text-violet-700" : "bg-blue-600 text-white",
                                ].join(" ")}
                                title="Cambiar vista (mes/año)"
                            >
                                <CalendarDays size={18} />
                            </button>
                        </div>

                        {/* ======= VISTA: MONTH PICKER ======= */}
                        {viewMode === "month" && (
                            <div className="mt-4 rounded-2xl bg-neutral-900 text-white p-4 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold opacity-90">{viewYear}</div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={goYearUp}
                                            className="h-9 w-9 rounded-lg grid place-items-center hover:bg-white/10"
                                            title="Año anterior"
                                        >
                                            <ChevronUp size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goYearDown}
                                            className="h-9 w-9 rounded-lg grid place-items-center hover:bg-white/10"
                                            title="Año siguiente"
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-4 gap-3">
                                    {months.map((m) => {
                                        const selected = m.key === viewMonth;
                                        return (
                                            <button
                                                key={m.key}
                                                type="button"
                                                onClick={() => pickMonth(m.key)}
                                                className={[
                                                    "h-14 rounded-xl text-sm font-semibold uppercase tracking-wide",
                                                    selected ? "bg-blue-600 text-white" : "bg-transparent hover:bg-white/10",
                                                ].join(" ")}
                                            >
                                                {m.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 text-[11px] opacity-70">
                                    Tip: vuelve a dar clic al icono para elegir <b>año</b>.
                                </div>
                            </div>
                        )}

                        {/* ======= VISTA: YEAR PICKER ======= */}
                        {viewMode === "year" && (
                            <div className="mt-4 rounded-2xl bg-neutral-900 text-white p-4 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold opacity-90">{yearRangeLabel}</div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={goDecadeUp}
                                            className="h-9 w-9 rounded-lg grid place-items-center hover:bg-white/10"
                                            title="Década anterior"
                                        >
                                            <ChevronUp size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goDecadeDown}
                                            className="h-9 w-9 rounded-lg grid place-items-center hover:bg-white/10"
                                            title="Década siguiente"
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-4 gap-3">
                                    {yearsGrid.map((y, idx) => {
                                        const isInDecade = y >= decadeStart && y <= decadeStart + 9;
                                        const selected = y === viewYear;

                                        return (
                                            <button
                                                key={`${y}-${idx}`}
                                                type="button"
                                                onClick={() => pickYear(y)}
                                                className={[
                                                    "h-14 rounded-xl text-sm font-semibold",
                                                    selected ? "bg-blue-600 text-white" : "hover:bg-white/10",
                                                    !isInDecade ? "opacity-35" : "opacity-100",
                                                ].join(" ")}
                                            >
                                                {y}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 text-[11px] opacity-70">
                                    Tip: al elegir un año, pasas a elegir <b>mes</b>.
                                </div>
                            </div>
                        )}

                        {/* ======= VISTA: DAY PICKER ======= */}
                        {viewMode === "day" && (
                            <>
                                {/* Month nav */}
                                <div className="mt-3 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={prevMonth}
                                        className="rounded-lg px-2 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setViewMode("month")}
                                        className="text-sm font-extrabold text-violet-700 hover:underline"
                                        title="Cambiar a selector de mes"
                                    >
                                        {monthLabel}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={nextMonth}
                                        className="rounded-lg px-2 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50"
                                    >
                                        ›
                                    </button>
                                </div>

                                {/* Weekdays */}
                                <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500">
                                    <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                                </div>

                                {/* Days */}
                                <div className="mt-2 grid grid-cols-7 gap-1">
                                    {daysGrid.map((cell, idx) => {
                                        const d = cell.date;
                                        const inMonth = cell.inMonth;
                                        const disabledDay = isDisabled(d);
                                        const inRange = isInRange(d);
                                        const start = isRangeStart(d);
                                        const end = isRangeEnd(d);

                                        const cls = [
                                            "h-10 w-10 rounded-xl text-sm font-bold transition relative",
                                            !inMonth ? "text-gray-300" : "text-gray-700",
                                            disabledDay ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100",
                                            inRange ? "bg-blue-50" : "",
                                            start || end ? "bg-white ring-2 ring-blue-600" : "",
                                            start ? "shadow-[0_0_0_2px_rgba(168,85,247,0.85)]" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ");

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => pickDay(d)}
                                                disabled={disabledDay}
                                                className={cls}
                                                title={fmt(d)}
                                            >
                                                {d.getDate()}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-2 text-[11px] text-gray-500">
                                    1er clic = desde, 2do clic = hasta. Un 3er clic reinicia.
                                </div>
                            </>
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
