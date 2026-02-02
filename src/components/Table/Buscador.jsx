import React, { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";

const Buscador = ({
  value = "",
  onChange,
  placeholder = "Buscar...",
  debounceMs = 300,
  className = "w-full max-w-md",
}) => {
  const [term, setTerm] = useState(value || "");
  const timer = useRef(null);

  useEffect(() => {
    setTerm(value || "");
  }, [value]);

  useEffect(() => {
    // debounce
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (typeof onChange === "function") onChange(term.trim());
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [term, debounceMs, onChange]);

  function handleClear() {
    setTerm("");
    if (typeof onChange === "function") onChange("");
  }

  return (
    <div className={`${className} flex items-center gap-2`}>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </span>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-9 pr-10 py-2 rounded-md border border-gray-200 shadow-sm text-sm"
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
            title="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Buscador;
