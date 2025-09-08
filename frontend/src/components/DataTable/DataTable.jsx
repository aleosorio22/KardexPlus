import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiChevronUp, FiChevronDown } from "react-icons/fi";
import DataTableSkeleton from "./DataTableSkeleton";
import EmptyState from "./EmptyState";

export default function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = "No hay datos disponibles",
  emptyIcon,
  rowKeyField = "id",
  pagination = true,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  initialSortField = null,
  initialSortDirection = "asc",
  onRowClick,
  className = "",
  tableClassName = "",
  renderRowActions,
  stickyHeader = false,
}) {
  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: initialSortField,
    direction: initialSortDirection,
  });

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Manejar ordenamiento
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    // Resetear a primera página cuando se ordena
    setCurrentPage(1);
  };

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      // Obtener los valores a comparar usando dot notation para propiedades anidadas
      const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
      };

      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      // Manejar valores nulos o indefinidos
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

      // Comparar según el tipo de dato
      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortConfig.direction === "asc" ? result : -result;
      }

      // Comparación numérica o de otro tipo
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / pageSize);
  }, [sortedData, pageSize]);

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

  // Obtener icono de ordenamiento
  const getSortIcon = (columnField) => {
    if (sortConfig.key !== columnField) {
      return null;
    }
    return sortConfig.direction === "asc" ? (
      <FiChevronUp className="w-4 h-4" />
    ) : (
      <FiChevronDown className="w-4 h-4" />
    );
  };

  // Renderizar estado de carga
  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} />;
  }

  // Renderizar estado vacío
  if (!data.length) {
    return <EmptyState message={emptyMessage} icon={emptyIcon} />;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${tableClassName}`}>
          <thead className={stickyHeader ? "sticky top-0 z-10" : ""}>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.field}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""
                  } ${column.className || ""}`}
                  onClick={() => column.sortable !== false && handleSort(column.field)}
                  style={column.width ? { width: column.width } : {}}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable !== false && getSortIcon(column.field)}
                  </div>
                </th>
              ))}
              {renderRowActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.map((row, index) => (
              <tr
                key={row[rowKeyField] || index}
                className={`hover:bg-gray-50 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={`${row[rowKeyField] || index}-${column.field}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.cellClassName || ""
                    }`}
                  >
                    {column.render 
                      ? column.render(row, index) 
                      : column.field.includes('.') 
                        ? column.field.split('.').reduce((obj, key) => obj?.[key], row)
                        : row[column.field]
                    }
                  </td>
                ))}
                {renderRowActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {renderRowActions(row, index)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && data.length > 0 && (
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-sm text-gray-700 mr-2">Filas por página:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="ml-4 text-sm text-gray-700">
              {sortedData.length === 0 
                ? "0 de 0"
                : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedData.length)} de ${sortedData.length}`
              }
            </span>
          </div>

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
      )}
    </div>
  );
}
