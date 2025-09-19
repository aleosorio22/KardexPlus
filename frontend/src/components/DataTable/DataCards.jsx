import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import DataTableSkeleton from "./DataTableSkeleton";
import EmptyState from "./EmptyState";

export default function DataCards({
  data = [],
  renderCard,
  isLoading = false,
  emptyMessage = "No hay datos disponibles",
  emptyIcon,
  rowKeyField = "id",
  pagination = true,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  className = "",
  cardClassName = "",
  onCardClick,
}) {
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    if (!pagination) return data;
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize, pagination]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / pageSize);
  }, [data, pageSize]);

  // Cambiar de página
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // Cambiar tamaño de página
  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Resetear a primera página
  };

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Renderizar estado vacío
  if (!data.length) {
    return <EmptyState message={emptyMessage} icon={emptyIcon} />;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Cards Container */}
      <div className="divide-y divide-gray-200">
        {paginatedData.map((item, index) => (
          <div
            key={item[rowKeyField] || index}
            className={`p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
              onCardClick ? "cursor-pointer" : ""
            } ${cardClassName}`}
            onClick={() => onCardClick && onCardClick(item)}
          >
            {renderCard(item, index)}
          </div>
        ))}
      </div>

      {/* Paginación */}
      {pagination && data.length > 0 && (
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          {/* Mobile Paginación */}
          <div className="block sm:hidden">
            {/* Información de página */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Página <span className="font-semibold text-gray-900">{currentPage}</span> de{' '}
                <span className="font-semibold text-gray-900">{totalPages || 1}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.length} registros en total
              </p>
              
              {/* Selector de cantidad - Mobile */}
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="text-xs text-gray-600">Ver:</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-600">por página</span>
              </div>
            </div>

            {/* Controles de navegación móvil */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[100px] justify-center"
              >
                <FiChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </button>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[100px] justify-center"
              >
                Siguiente
                <FiChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Desktop Paginación */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Información de resultados */}
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, data.length)}</span> de{' '}
                <span className="font-medium">{data.length}</span> resultados
              </p>
              
              {/* Selector de registros por página */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Mostrar:</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">por página</span>
              </div>
            </div>

            {/* Controles de navegación desktop */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Primera página"
              >
                <FiChevronsLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Página anterior"
              >
                <FiChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex items-center px-3">
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages || 1}
                </span>
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Página siguiente"
              >
                <FiChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Última página"
              >
                <FiChevronsRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}