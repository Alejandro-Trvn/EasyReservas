import React from "react";
import ReactSelect from "react-select";

const Select = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    label,
    isSearchable = true,
    isClearable = false,
    isDisabled = false,
    className = "",
    isInvalid = false,
    // NUEVO (opcional): si algún caso especial requiere desactivar portal
    usePortal = true,

    // Tamaño: 'sm' | 'md' (md por defecto)
    size = "md",
    // optional forwarded ref to the inner ReactSelect
    selectRef = null,
}) => {
    const fontSize = size === "sm" ? "0.75rem" : "0.875rem";
    const minHeight = size === "sm" ? "34px" : "42px";

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight,
            borderColor: isInvalid
                ? "#FCA5A5"
                : state.isFocused
                    ? "#007EF6"
                    : "#e5e7eb",
            boxShadow: state.isFocused
                ? isInvalid
                    ? "0 0 0 2px rgba(244, 63, 94, 0.08)"
                    : "0 0 0 2px rgba(0, 126, 246, 0.1)"
                : "none",
            "&:hover": {
                borderColor: isInvalid ? "#FCA5A5" : "#007EF6",
            },
            cursor: "pointer",
            fontSize,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#0048A5"
                : state.isFocused
                    ? "#f3f4f6"
                    : "white",
            color: state.isSelected ? "white" : "#374151",
            cursor: "pointer",
            fontSize,
            fontWeight: "400",
            "&:active": {
                backgroundColor: state.isSelected ? "#0048A5" : "#e5e7eb",
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#374151",
            fontSize,
            fontWeight: "400",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
            fontSize,
            fontWeight: "400",
        }),
        input: (provided) => ({
            ...provided,
            color: "#374151",
            fontSize,
            fontWeight: "400",
        }),

        // OJO: este zIndex solo sirve si NO hay overflow-hidden
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            fontSize,
        }),

        // CLAVE cuando usamos portal (se renderiza fuera del contenedor recortado)
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 999999,
        }),
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            <ReactSelect
                ref={selectRef}
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                styles={customStyles}
                noOptionsMessage={() => "No hay opciones disponibles"}
                loadingMessage={() => "Cargando..."}
                // ========= FIX PARA TU CASO (Mantenimiento Producto)==========
                menuPortalTarget={
                    usePortal && typeof document !== "undefined" ? document.body : null
                }
                menuPosition={usePortal ? "fixed" : "absolute"}
            />
        </div>
    );
};

export default Select;