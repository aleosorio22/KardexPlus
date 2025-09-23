import React, { useState, useEffect } from 'react';
import { FiTag, FiAlertCircle } from 'react-icons/fi';
import Select from './Select';
import categoryService from '../../services/categoryService';

/**
 * Componente CategoriaSelector - Selector de categorías reutilizable
 * 
 * @param {Object} props
 * @param {string} props.value - ID de la categoría seleccionada
 * @param {Function} props.onChange - Callback al cambiar categoría (categoriaId) => void
 * @param {string} props.label - Label del selector (por defecto: "Categoría")
 * @param {string} props.placeholder - Placeholder (por defecto: "Seleccionar categoría...")
 * @param {boolean} props.required - Si es requerido (por defecto: false)
 * @param {boolean} props.disabled - Si está deshabilitado (por defecto: false)
 * @param {boolean} props.showAllOption - Si mostrar opción "Todas" (por defecto: false)
 * @param {string} props.allOptionLabel - Label para opción "todas" (por defecto: "Todas las categorías")
 * @param {string} props.allOptionValue - Valor para opción "todas" (por defecto: "")
 * @param {Array} props.excludeCategorias - IDs de categorías a excluir del selector
 * @param {string} props.size - Tamaño del selector: 'sm', 'md', 'lg' (por defecto: 'md')
 * @param {string} props.className - Clases CSS adicionales
 * @param {Function} props.onLoadComplete - Callback cuando se cargan las categorías (categorias) => void
 * @param {string} props.error - Mensaje de error a mostrar
 */
const CategoriaSelector = ({
    value = '',
    onChange,
    label = 'Categoría',
    placeholder = 'Seleccionar categoría...',
    required = false,
    disabled = false,
    showAllOption = false,
    allOptionLabel = 'Todas las categorías',
    allOptionValue = '',
    excludeCategorias = [],
    size = 'md',
    className = '',
    onLoadComplete,
    error
}) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        cargarCategorias();
    }, []);

    const cargarCategorias = async () => {
        try {
            setLoading(true);
            setLoadError('');
            
            const response = await categoryService.getAllCategories();
            const categoriasData = response.data || [];
            
            // Filtrar categorías excluidas
            const categoriasFiltradas = excludeCategorias.length > 0
                ? categoriasData.filter(categoria => !excludeCategorias.includes(categoria.CategoriaItem_Id))
                : categoriasData;
            
            setCategorias(categoriasFiltradas);
            
            // Callback cuando se cargan las categorías
            if (onLoadComplete) {
                onLoadComplete(categoriasFiltradas);
            }
            
        } catch (error) {
            console.error('Error cargando categorías:', error);
            setLoadError('Error cargando categorías');
        } finally {
            setLoading(false);
        }
    };

    // Generar opciones para el Select
    const getOptions = () => {
        const options = [];
        
        // Opción "Todas" si está habilitada
        if (showAllOption) {
            options.push({
                value: allOptionValue,
                label: `🏷️ ${allOptionLabel}`,
                description: 'Ver elementos de todas las categorías'
            });
        }
        
        // Opciones de categorías
        const categoriaOptions = categorias.map(categoria => ({
            value: categoria.CategoriaItem_Id,
            label: `📁 ${categoria.CategoriaItem_Nombre}`,
            description: categoria.CategoriaItem_Descripcion || `Categoría: ${categoria.CategoriaItem_Nombre}`,
            disabled: !categoria.CategoriaItem_Estado // Deshabilitar categorías inactivas
        }));
        
        return [...options, ...categoriaOptions];
    };

    const options = getOptions();

    // Mostrar error de carga si existe
    const displayError = error || loadError;

    if (loading) {
        return (
            <div className={`space-y-2 ${className}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-gray-600">Cargando categorías...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <Select
                label={label}
                value={value}
                onChange={onChange}
                options={options}
                placeholder={loading ? "Cargando..." : placeholder}
                required={required}
                disabled={disabled || loading}
                searchable={true}
                clearable={!required}
                size={size}
                error={displayError}
            />
            
            {/* Información adicional */}
            {!loading && categorias.length === 0 && !loadError && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <FiAlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                            No hay categorías disponibles. Contacta al administrador.
                        </p>
                    </div>
                </div>
            )}
            
            {/* Botón de recargar si hay error */}
            {loadError && (
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={cargarCategorias}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoriaSelector;