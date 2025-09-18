import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck, FiSearch, FiX } from 'react-icons/fi';

/**
 * Componente Select común - Dropdown personalizado mobile-first
 * 
 * @param {Object} props
 * @param {Array} props.options - Array de opciones [{value, label, disabled?}]
 * @param {string|number} props.value - Valor seleccionado
 * @param {Function} props.onChange - Función callback al cambiar valor
 * @param {string} props.placeholder - Texto placeholder
 * @param {string} props.label - Label del campo (opcional)
 * @param {boolean} props.required - Si el campo es requerido
 * @param {boolean} props.disabled - Si el campo está deshabilitado
 * @param {boolean} props.searchable - Si permite búsqueda (por defecto true)
 * @param {string} props.error - Mensaje de error
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.size - Tamaño: 'sm', 'md', 'lg' (por defecto 'md')
 * @param {boolean} props.clearable - Si permite limpiar selección
 */
const Select = ({
    options = [],
    value = '',
    onChange,
    placeholder = 'Seleccionar...',
    label,
    required = false,
    disabled = false,
    searchable = true,
    error,
    className = '',
    size = 'md',
    clearable = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Filtrar opciones según término de búsqueda
    const filteredOptions = searchable && searchTerm
        ? options.filter(option => 
            option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

    // Encontrar la opción seleccionada
    const selectedOption = options.find(option => option.value === value);

    // Tamaños del componente
    const sizeClasses = {
        sm: {
            trigger: 'px-3 py-2 text-sm min-h-[36px]',
            dropdown: 'text-sm',
            option: 'px-3 py-2 text-sm'
        },
        md: {
            trigger: 'px-4 py-3 text-base min-h-[44px]',
            dropdown: 'text-base',
            option: 'px-4 py-3 text-base'
        },
        lg: {
            trigger: 'px-5 py-4 text-lg min-h-[52px]',
            dropdown: 'text-lg',
            option: 'px-5 py-4 text-lg'
        }
    };

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Manejar navegación con teclado
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isOpen) return;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setHighlightedIndex(prev => 
                        prev < filteredOptions.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setHighlightedIndex(prev => 
                        prev > 0 ? prev - 1 : filteredOptions.length - 1
                    );
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                        handleSelect(filteredOptions[highlightedIndex]);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    setIsOpen(false);
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, filteredOptions]);

    const handleSelect = (option) => {
        if (option.disabled) return;
        
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const toggleDropdown = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen && searchable) {
            // Focus en el input de búsqueda cuando se abre
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Trigger */}
            <div
                onClick={toggleDropdown}
                className={`
                    relative w-full border rounded-lg cursor-pointer transition-all duration-200
                    touch-manipulation select-none flex items-center justify-between
                    ${sizeClasses[size].trigger}
                    ${disabled 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500' 
                        : error
                        ? 'border-red-300 bg-red-50 hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : isOpen
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }
                `}
            >
                <div className="flex items-center min-w-0 flex-1">
                    {selectedOption ? (
                        <span className="truncate text-gray-900">
                            {selectedOption.label}
                        </span>
                    ) : (
                        <span className="truncate text-gray-500">
                            {placeholder}
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {clearable && selectedOption && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    )}
                    
                    <FiChevronDown 
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            isOpen ? 'transform rotate-180' : ''
                        }`} 
                    />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className={`
                    absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
                    max-h-60 overflow-hidden ${sizeClasses[size].dropdown}
                `}>
                    {/* Search input */}
                    {searchable && (
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setHighlightedIndex(-1);
                                    }}
                                    placeholder="Buscar..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        flex items-center justify-between cursor-pointer transition-colors
                                        ${sizeClasses[size].option}
                                        ${option.disabled 
                                            ? 'text-gray-400 cursor-not-allowed' 
                                            : index === highlightedIndex
                                            ? 'bg-blue-50 text-blue-600'
                                            : option.value === value
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && (
                                        <FiCheck className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={`text-gray-500 text-center py-4 ${sizeClasses[size].option}`}>
                                {searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="font-medium">Error:</span>
                    <span className="ml-1">{error}</span>
                </p>
            )}
        </div>
    );
};

export default Select;