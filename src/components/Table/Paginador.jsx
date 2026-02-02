import React from "react";

const Paginador = ({
  totalItems = 0,
  pageSize = 7, // a partir del 8vo item se moverá a la segunda página
  currentPage = 1,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize));

  // Mostrar siempre el paginador incluso si no hay registros.
  const handleGo = (page) => {
    const p = Math.max(1, Math.min(totalPages, page));
    if (p === currentPage) return;
    onPageChange && onPageChange(p);
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  const start = (totalItems || 0) === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = (totalItems || 0) === 0 ? 0 : Math.min(totalItems, currentPage * pageSize);

  return (
    <nav className="flex items-center justify-between gap-2 mt-4" aria-label="Paginador">
      <div className="text-sm text-gray-600">Mostrando {start}-{end} de {totalItems || 0} registros</div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleGo(1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          Primero
        </button>

        <button
          onClick={() => handleGo(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          Anterior
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => handleGo(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`px-3 py-1 rounded-md text-sm border ${p === currentPage ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleGo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          Siguiente
        </button>

        <button
          onClick={() => handleGo(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          Último
        </button>
      </div>
    </nav>
  );
};

export default Paginador;
