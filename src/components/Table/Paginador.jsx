import React from "react";

const Paginador = ({
  totalItems = 0,
  pageSize = 7,
  currentPage = 1,
  onPageChange,
  siblingCount = 1, // cuántas páginas a los lados (desktop)
}) => {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize));

  const handleGo = (page) => {
    const p = Math.max(1, Math.min(totalPages, page));
    if (p === currentPage) return;
    onPageChange && onPageChange(p);
  };

  const start = (totalItems || 0) === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end =
    (totalItems || 0) === 0 ? 0 : Math.min(totalItems, currentPage * pageSize);

  // ====== Helpers: rango de páginas con "..." (desktop) ======
  const range = (a, b) => {
    const out = [];
    for (let i = a; i <= b; i++) out.push(i);
    return out;
  };

  const getPageItems = () => {
    // Si pocas páginas, muestra todo
    if (totalPages <= 7) return range(1, totalPages);

    const left = Math.max(1, currentPage - siblingCount);
    const right = Math.min(totalPages, currentPage + siblingCount);

    const showLeftDots = left > 2;
    const showRightDots = right < totalPages - 1;

    const items = [];

    // Siempre 1
    items.push(1);

    if (showLeftDots) items.push("dots-left");
    else items.push(...range(2, Math.max(2, left - 1)));

    // Centro
    items.push(...range(Math.max(2, left), Math.min(totalPages - 1, right)));

    if (showRightDots) items.push("dots-right");
    else items.push(...range(Math.min(totalPages - 1, right + 1), totalPages - 1));

    // Siempre último
    items.push(totalPages);

    // Limpieza (evita duplicados)
    return items.filter((v, idx, arr) => arr.indexOf(v) === idx);
  };

  const pageItems = getPageItems();

  const disabledFirst = currentPage === 1;
  const disabledLast = currentPage === totalPages;

  const baseBtn =
    "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm transition " +
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20";

  const ghost =
    "bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-gray-200";

  const disabled =
    "opacity-50 cursor-not-allowed hover:bg-white active:bg-white";

  const active =
    "bg-emerald-600 text-white border-emerald-600 shadow-sm";

  return (
    <nav className="mt-4" aria-label="Paginador">
      {/* ===== Desktop/tablet ===== */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600 whitespace-nowrap">
          Mostrando {start}-{end} de {totalItems || 0} registros
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => handleGo(1)}
            disabled={disabledFirst}
            className={`${baseBtn} ${ghost} ${disabledFirst ? disabled : ""}`}
          >
            Primero
          </button>

          <button
            onClick={() => handleGo(currentPage - 1)}
            disabled={disabledFirst}
            className={`${baseBtn} ${ghost} ${disabledFirst ? disabled : ""}`}
          >
            Anterior
          </button>

          <div className="flex items-center gap-1 flex-wrap">
            {pageItems.map((it) => {
              if (it === "dots-left" || it === "dots-right") {
                return (
                  <span
                    key={it}
                    className="px-2 text-gray-500 select-none"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }

              const p = Number(it);
              const isActive = p === currentPage;

              return (
                <button
                  key={p}
                  onClick={() => handleGo(p)}
                  aria-current={isActive ? "page" : undefined}
                  className={`${baseBtn} ${isActive ? active : ghost}`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleGo(currentPage + 1)}
            disabled={disabledLast}
            className={`${baseBtn} ${ghost} ${disabledLast ? disabled : ""}`}
          >
            Siguiente
          </button>

          <button
            onClick={() => handleGo(totalPages)}
            disabled={disabledLast}
            className={`${baseBtn} ${ghost} ${disabledLast ? disabled : ""}`}
          >
            Último
          </button>
        </div>
      </div>

      {/* ===== Mobile ===== */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => handleGo(1)}
            disabled={disabledFirst}
            className={`${baseBtn} ${ghost} w-11 ${disabledFirst ? disabled : ""}`}
            aria-label="Primera página"
            title="Primero"
          >
            «
          </button>

          <button
            onClick={() => handleGo(currentPage - 1)}
            disabled={disabledFirst}
            className={`${baseBtn} ${ghost} w-11 ${disabledFirst ? disabled : ""}`}
            aria-label="Página anterior"
            title="Anterior"
          >
            ‹
          </button>

          <div className="flex-1 text-center text-sm font-semibold text-gray-700">
            Página {currentPage} <span className="text-gray-400">de</span>{" "}
            {totalPages}
          </div>

          <button
            onClick={() => handleGo(currentPage + 1)}
            disabled={disabledLast}
            className={`${baseBtn} ${ghost} w-11 ${disabledLast ? disabled : ""}`}
            aria-label="Página siguiente"
            title="Siguiente"
          >
            ›
          </button>

          <button
            onClick={() => handleGo(totalPages)}
            disabled={disabledLast}
            className={`${baseBtn} ${ghost} w-11 ${disabledLast ? disabled : ""}`}
            aria-label="Última página"
            title="Último"
          >
            »
          </button>
        </div>

        <div className="text-xs text-gray-600 text-center">
          Mostrando {start}-{end} de {totalItems || 0} registros
        </div>
      </div>
    </nav>
  );
};

export default Paginador;
