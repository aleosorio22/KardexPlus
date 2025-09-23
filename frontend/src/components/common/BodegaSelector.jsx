import React, { useState, useEffect } from 'react';
import { FiHome, FiAlertCircle } from 'react-icons/fi';
import Select from './Select';
import { bodegaService } from '../../services/bodegaService';

/**
 * Componente BodegaSelector - Selector de bodega reutilizable
 * 
 * @param {Object} props
 * @param {string} props.value - ID de la bodega seleccionada
 * @param {Function} props.onChange - Callback al cambiar bodega (bodegaId) => void
 * @param {string} props.label - Label del selector (por defecto: "Almacén")
 * @param {string} props.placeholder - Placeholder (por defecto: "Seleccionar almacén...")
 * @param {boolean} props.required - Si es requerido (por defecto: false)
 * @param {boolean} props.disabled - Si está deshabilitado (por defecto: false)
 * @param {boolean} props.showAllOption - Si mostrar opción "Todas las bodegas" (por defecto: false)
 * @param {string} props.allOptionLabel - Label para opción "todas" (por defecto: "Todas las bodegas")
 * @param {string} props.allOptionValue - Valor para opción "todas" (por defecto: "")
 * @param {Array} props.excludeBodegas - IDs de bodegas a excluir del selector
 * @param {string} props.size - Tamaño del selector: 'sm', 'md', 'lg' (por defecto: 'md')
 * @param {string} props.className - Clases CSS adicionales
 * @param {Function} props.onLoadComplete - Callback cuando se cargan las bodegas (bodegas) => void
 * @param {string} props.error - Mensaje de error a mostrar
 */
const BodegaSelector = ({
    value = '',
    onChange,
    label = 'Almacén',
    placeholder = 'Seleccionar almacén...',
    required = false,
    disabled = false,
    showAllOption = false,
    allOptionLabel = 'Todas las bodegas',
    allOptionValue = '',
    excludeBodegas = [],
    size = 'md',
    className = '',
    onLoadComplete,
    error
}) => {
    const [bodegas, setBodegas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        cargarBodegas();
    }, []);

    const cargarBodegas = async () => {
        try {
            setLoading(true);
            setLoadError('');
            
            const response = await bodegaService.getAllBodegas();
            const bodegasData = response.data || [];
            
            // Filtrar bodegas excluidas
            const bodegasFiltradas = excludeBodegas.length > 0
                ? bodegasData.filter(bodega => !excludeBodegas.includes(bodega.Bodega_Id))
                : bodegasData;
            
            setBodegas(bodegasFiltradas);
            
            // Callback cuando se cargan las bodegas
            if (onLoadComplete) {
                onLoadComplete(bodegasFiltradas);
            }
            
        } catch (error) {
            console.error('Error cargando bodegas:', error);
            setLoadError('Error cargando almacenes');
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
                label: `🏢 ${allOptionLabel}`,
                description: 'Ver información de todas las bodegas'
            });
        }
        
        // Opciones de bodegas con iconos mejorados
        const bodegaOptions = bodegas.map(bodega => {
            // Determinar icono según tipo de bodega
            const getIconoBodega = (tipo) => {
                switch (tipo?.toLowerCase()) {
                    case 'principal': return '🏢';
                    case 'sucursal': return '🏪';
                    case 'temporal': return '📦';
                    case 'virtual': return '💾';
                    default: return '📦';
                }
            };
            
            const isDisabled = !bodega.Bodega_Estado;
            
            return {
                value: bodega.Bodega_Id,
                label: `${getIconoBodega(bodega.Bodega_Tipo)} ${bodega.Bodega_Nombre}`,
                description: bodega.Bodega_Descripcion || `Bodega ${bodega.Bodega_Tipo || 'General'}`,
                disabled: isDisabled // Deshabilitar bodegas inactivas (Bodega_Estado = 0)
            };
        });
        
        return [...options, ...bodegaOptions];
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
                    <span className="text-sm text-gray-600">Cargando almacenes...</span>
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
            {!loading && bodegas.length === 0 && !loadError && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <FiAlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                            No hay almacenes disponibles. Contacta al administrador.
                        </p>
                    </div>
                </div>
            )}
            
            {/* Botón de recargar si hay error */}
            {loadError && (
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={cargarBodegas}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            )}
        </div>
    );
};

export default BodegaSelector;