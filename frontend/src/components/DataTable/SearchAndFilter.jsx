import { useState } from "react";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

export default function SearchAndFilter({
  onSearch,
  onFilter,
  filters = [],
  totalItems,
  currentFilters = {},
  searchPlaceholder = "Buscar...",
  className = "",
}) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value) => {
    if (onSearch) {
      onSearch(value);
    }
    if (onFilter) {
      onFilter({ ...currentFilters, search: value });
    }
  };

  const handleFilterChange = (filterId, value) => {
    if (onFilter) {
      onFilter({ ...currentFilters, [filterId]: value });
    }
  };

  const clearFilters = () => {
    const emptyFilters = { search: "" };
    filters.forEach((filter) => {
      emptyFilters[filter.id] = filter.defaultValue || "";
    });
    if (onFilter) {
      onFilter(emptyFilters);
    }
  };

  const hasActiveFilters = () => {
    return filters.some((filter) => {
      const currentValue = currentFilters[filter.id];
      const defaultValue = filter.defaultValue || "";
      return currentValue !== defaultValue && currentValue !== "" && currentValue !== null;
    });
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors"
            onChange={(e) => handleSearchChange(e.target.value)}
            value={currentFilters.search || ""}
          />
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border border-gray-300 flex items-center space-x-2 transition-colors ${
              showFilters ? "bg-green-50 border-green-500 text-green-700" : "hover:bg-gray-50"
            }`}
          >
            <FiFilter />
            <span>Filtros</span>
          </button>
        )}

        {totalItems !== undefined && (
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Total: {totalItems} {totalItems === 1 ? "elemento" : "elementos"}
          </div>
        )}
      </div>

      {showFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
            {hasActiveFilters() && (
              <button 
                onClick={clearFilters} 
                className="text-sm text-green-600 flex items-center hover:text-green-700 transition-colors"
              >
                <FiX size={14} className="mr-1" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                {filter.type === "select" ? (
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                    value={currentFilters[filter.id] || filter.defaultValue || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === "date" ? (
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                    value={currentFilters[filter.id] || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  />
                ) : (
                  <input
                    type={filter.type || "text"}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                    value={currentFilters[filter.id] || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    placeholder={filter.placeholder || ""}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
