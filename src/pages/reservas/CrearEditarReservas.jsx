import React from "react";
import { Modal } from "../../components/Modal";
import Button from "../../components/Button";
import ScreenLoader from "../../components/ScreenLoader";
import { showAlert } from "../../components/Alert";
import Select from "../../components/Select";
import DateRangePicker from "../../components/DateRangePicker";
import HourRangePicker from "../../components/HourRangePicker";
import useRecursos from "../../services/recursos/useRecursos";
import useReservas from "../../services/reservas/useReservas";

const CrearEditarReservas = ({
    isOpen,
    onClose,
    onSaved = null,
    initialData = null,
    disableRecursoSelector = false,
}) => {
    const { recursos } = useRecursos();
    const { createReserva, updateReserva, creating } = useReservas();

    const [selectedRecurso, setSelectedRecurso] = React.useState(null);
    const [dateRange, setDateRange] = React.useState({ from: null, to: null });
    const [timeRange, setTimeRange] = React.useState({ from: null, to: null });
    const [comentarios, setComentarios] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    // ✅ isMobile seguro
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia("(max-width: 639px)");
        const handler = () => setIsMobile(mq.matches);
        handler();
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    React.useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            const recursoId = initialData.recurso_id ?? initialData.recurso?.id ?? null;
            const recursoLabel =
                initialData.recurso?.nombre ??
                initialData.recurso?.name ??
                (recursos || []).find((r) => r.id === recursoId)?.nombre ??
                "";

            setSelectedRecurso(recursoId ? { value: recursoId, label: recursoLabel } : null);

            try {
                const fi = initialData.fecha_inicio
                    ? new Date(String(initialData.fecha_inicio).replace(" ", "T"))
                    : null;
                const ff = initialData.fecha_fin
                    ? new Date(String(initialData.fecha_fin).replace(" ", "T"))
                    : null;

                setDateRange({ from: fi, to: ff });

                const hhFrom = fi ? formatHourDisplay(fi) : null;
                const hhTo = ff ? formatHourDisplay(ff) : null;
                setTimeRange({ from: hhFrom, to: hhTo });
            } catch (e) {
                setDateRange({ from: null, to: null });
                setTimeRange({ from: null, to: null });
            }

            setComentarios(initialData.comentarios || "");
        } else {
            setSelectedRecurso(null);
            setDateRange({ from: null, to: null });
            setTimeRange({ from: null, to: null });
            setComentarios("");
        }
    }, [isOpen, initialData, recursos]);

    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    function formatDateYMD(d) {
        if (!d) return null;
        const y = d.getFullYear();
        const m = pad2(d.getMonth() + 1);
        const day = pad2(d.getDate());
        return `${y}-${m}-${day}`;
    }

    function formatHourDisplay(date) {
        if (!date) return "";
        const h = date.getHours();
        const m = date.getMinutes();
        const ap = h >= 12 ? "PM" : "AM";
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        return `${pad2(h12)}:${pad2(m)}${ap}`;
    }

    function parseHourStringTo24(hourStr) {
        if (!hourStr) return null;
        const s = String(hourStr).trim().toUpperCase();
        const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
        if (m12) {
            let hh = Number(m12[1]);
            const mm = Number(m12[2]);
            const ap = m12[3];
            if (ap === "AM" && hh === 12) hh = 0;
            if (ap === "PM" && hh !== 12) hh += 12;
            return `${pad2(hh)}:${pad2(mm)}:00`;
        }
        const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
        if (m24) {
            const hh = Number(m24[1]);
            const mm = Number(m24[2]);
            return `${pad2(hh)}:${pad2(mm)}:00`;
        }
        return null;
    }

    async function handleSave() {
        const recurso_id = selectedRecurso?.value ? Number(selectedRecurso.value) : null;
        const isEditing = initialData && initialData.id;
        
        // Solo validar recurso_id si no estamos editando con selector deshabilitado
        if (!recurso_id && (!isEditing || !disableRecursoSelector)) {
            showAlert({
                type: "warning",
                title: "Recurso requerido",
                text: "Selecciona un recurso.",
            });
            return;
        }

        if (!dateRange?.from || !dateRange?.to) {
            showAlert({
                type: "warning",
                title: "Fechas requeridas",
                text: "Selecciona un rango de fechas.",
            });
            return;
        }

        if (!timeRange?.from || !timeRange?.to) {
            showAlert({
                type: "warning",
                title: "Horario requerido",
                text: "Selecciona un rango horario.",
            });
            return;
        }

        const timeFrom = parseHourStringTo24(timeRange.from);
        const timeTo = parseHourStringTo24(timeRange.to);
        if (!timeFrom || !timeTo) {
            showAlert({
                type: "warning",
                title: "Horario inválido",
                text: "El horario seleccionado no es válido.",
            });
            return;
        }

        const fecha_inicio = `${formatDateYMD(dateRange.from)} ${timeFrom}`;
        const fecha_fin = `${formatDateYMD(dateRange.to)} ${timeTo}`;

        // Para usuarios normales editando: no enviar recurso_id
        // Backend solo permite actualizar fechas y comentarios
        const shouldIncludeRecursoId = !isEditing || !disableRecursoSelector;

        const payload = {
            fecha_inicio,
            fecha_fin,
            comentarios: (comentarios || "").toString().trim() || undefined,
        };

        // Solo incluir recurso_id si es permitido
        if (shouldIncludeRecursoId) {
            payload.recurso_id = recurso_id;
        }

        try {
            setSaving(true);

            let result = null;
            if (isEditing) {
                result = await updateReserva(initialData.id, payload);
                showAlert({
                    type: "success",
                    title: "Reserva actualizada",
                    text: "La reserva se actualizó correctamente.",
                });
            } else {
                result = await createReserva(payload);
                showAlert({
                    type: "success",
                    title: "Reserva creada",
                    text: "La reserva se creó correctamente.",
                });
            }

            if (typeof onSaved === "function") {
                await onSaved(result || payload);
            } else {
                onClose();
            }

            return result;
        } catch (err) {
            showAlert({
                type: "fail",
                title: "Error",
                text:
                    err?.response?.data?.message ||
                    err?.message ||
                    (isEditing
                        ? "Error actualizando reserva."
                        : "Error creando reserva."),
            });
            throw err;
        } finally {
            setSaving(false);
        }
    }

    const selectOptions = (recursos || []).map((r) => ({ value: r.id, label: r.nombre }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar reserva" : "Nueva reserva"}
            size="sm"
            headerBg="bg-emerald-700"
            headerTextColor="text-white"
            headerTextAlign="center"
        >
            <ScreenLoader
                loading={saving || creating}
                message={initialData ? "Guardando..." : "Creando reserva..."}
            />

            {/* ✅ Body scroll seguro (mobile) + espacio para teclado */}
            <div className="max-h-[70vh] sm:max-h-none overflow-y-auto pr-1 pb-24 sm:pb-0">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recurso
                        </label>
                        <Select
                            options={selectOptions}
                            value={selectedRecurso}
                            onChange={(opt) => setSelectedRecurso(opt)}
                            isDisabled={disableRecursoSelector}
                            placeholder={"-- Selecciona recurso --"}
                            isSearchable={true}
                            isClearable={false}
                            className="w-full"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rango de fechas
                        </label>
                        <DateRangePicker value={dateRange} onChange={(v) => setDateRange(v)} />
                        {/* Tip: si tu DateRange abre popover, esta capa ayuda a no “encajonarlo” */}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rango de horario
                        </label>
                        <HourRangePicker
                            value={timeRange}
                            onChange={(v) => setTimeRange(v)}
                            min="07:00"
                            max="22:00"
                            use12h={true}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observaciones
                        </label>
                        <textarea
                            value={comentarios}
                            onChange={(e) => setComentarios(e.target.value)}
                            rows={isMobile ? 3 : 2}
                            className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                            placeholder="Observaciones (opcional)"
                        />
                    </div>
                </div>
            </div>

            {/* ✅ Footer sticky (mobile) */}
            <div className="sticky bottom-0 -mx-4 sm:mx-0 mt-4 border-t border-gray-100 bg-white/95 backdrop-blur px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button
                        onClick={onClose}
                        variant="danger"
                        disabled={saving || creating}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || creating}
                        className="w-full sm:w-auto"
                    >
                        {saving || creating ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CrearEditarReservas;
