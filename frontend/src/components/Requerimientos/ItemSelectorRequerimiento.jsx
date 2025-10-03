import React, { useState, useEffect } from 'react';
import { FiPackage, FiAlertTriangle, FiCheck, FiX, FiBox } from 'react-icons/fi';
import itemPresentacionService from '../../services/itemPresentacionService';
import { toast } from 'react-hot-toast';

const ItemSelectorRequerimiento = ({ 
    item, 
    onUpdate, 
    onRemove, 
    bodegaOrigenId,
    index
}) => {
    // Estados para cantidad
    const [cantidad, setCantidad] = useState(item.Cantidad_Solicitada || '');
    const [loading, setLoading] = useState(false);
    
    // Estados para presentaciones
    const [presentacionesDisponibles, setPresentacionesDisponibles] = useState([]);
    const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
    const [cantidadPresentacion, setCantidadPresentacion] = useState(item.Cantidad_Solicitada_Presentacion || '');
    const [esRequerimientoPorPresentacion, setEsRequerimientoPorPresentacion] = useState(item.Es_Requerimiento_Por_Presentacion || false);
    const [loadingPresentaciones, setLoadingPresentaciones] = useState(false);

    useEffect(() => {
        // Cargar presentaciones disponibles al montar el componente
        if (item?.Item_Id) {
            cargarPresentacionesDisponibles();
        }
    }, [item.Item_Id]);

    useEffect(() => {
        // Actualizar componente padre cuando cambien los estados relevantes
        updateOnCantidadChange();
    }, [cantidad, presentacionSeleccionada, cantidadPresentacion, esRequerimientoPorPresentacion]);

    // Inicializar presentación si el item ya tiene una seleccionada
    useEffect(() => {
        if (item.Item_Presentaciones_Id && presentacionesDisponibles.length > 0) {
            const presentacionExistente = presentacionesDisponibles.find(
                p => p.Item_Presentaciones_Id === item.Item_Presentaciones_Id
            );
            if (presentacionExistente) {
                setPresentacionSeleccionada(presentacionExistente);
                setEsRequerimientoPorPresentacion(true);
            }
        }
    }, [item.Item_Presentaciones_Id, presentacionesDisponibles]);

    const cargarPresentacionesDisponibles = async () => {
        try {
            setLoadingPresentaciones(true);
            console.log(`📦 ItemSelectorRequerimiento: Cargando presentaciones para Item_Id ${item.Item_Id}...`);
            
            const response = await itemPresentacionService.getItemPresentacionesByItemId(item.Item_Id);
            console.log(`📦 ItemSelectorRequerimiento: Presentaciones encontradas:`, response.data);
            
            // Asegurar que Cantidad_Base sea numérico para los cálculos
            const presentacionesConvertidas = (response.data || []).map(presentacion => ({
                ...presentacion,
                Cantidad_Base: parseFloat(presentacion.Cantidad_Base) || 1
            }));
            
            setPresentacionesDisponibles(presentacionesConvertidas);
            console.log(`📦 ItemSelectorRequerimiento: Total presentaciones cargadas: ${presentacionesConvertidas.length}`);
            
        } catch (error) {
            console.error('❌ Error cargando presentaciones:', error);
            setPresentacionesDisponibles([]);
        } finally {
            setLoadingPresentaciones(false);
        }
    };

    const updateOnCantidadChange = () => {
        if (!onUpdate) return;

        console.log(`🔧 ItemSelectorRequerimiento: === PREPARANDO UPDATE ===`);
        console.log(`🔧 Item_Id: ${item.Item_Id}`);
        console.log(`🔧 Es por presentación: ${esRequerimientoPorPresentacion}`);
        console.log(`🔧 Presentación seleccionada:`, presentacionSeleccionada);
        console.log(`🔧 Cantidad presentación: ${cantidadPresentacion}`);
        console.log(`🔧 Cantidad base: ${cantidad}`);

        if (esRequerimientoPorPresentacion && presentacionSeleccionada) {
            // Calcular cantidad base a partir de la presentación
            const cantidadPresentacionNum = parseFloat(cantidadPresentacion) || 0;
            const cantidadBaseCalculada = cantidadPresentacionNum * presentacionSeleccionada.Cantidad_Base;
            
            console.log(`🔧 Cantidad base calculada: ${cantidadPresentacionNum} * ${presentacionSeleccionada.Cantidad_Base} = ${cantidadBaseCalculada}`);
            
            const datosItem = {
                Item_Presentaciones_Id: presentacionSeleccionada.Item_Presentaciones_Id,
                Cantidad_Solicitada_Presentacion: cantidadPresentacionNum,
                Presentacion_Nombre: presentacionSeleccionada.Presentacion_Nombre,
                Presentacion_Unidad_Prefijo: presentacionSeleccionada.Presentacion_Unidad_Prefijo,
                Factor_Conversion: presentacionSeleccionada.Cantidad_Base
            };
            
            console.log(`🔧 Datos para update (PRESENTACIÓN):`, datosItem);
            onUpdate(item.Item_Id, cantidadBaseCalculada, datosItem);
        } else {
            // Movimiento por unidad base
            const cantidadBase = parseFloat(cantidad) || 0;
            console.log(`🔧 Datos para update (BASE): cantidad=${cantidadBase}`);
            onUpdate(item.Item_Id, cantidadBase, null);
        }
    };

    const handleCantidadChange = (value) => {
        setCantidad(value);
    };

    const handleCantidadPresentacionChange = (value) => {
        setCantidadPresentacion(value);
    };

    const handlePresentacionChange = (presentacionId) => {
        if (!presentacionId) {
            // Cambiar a modo normal
            setPresentacionSeleccionada(null);
            setEsRequerimientoPorPresentacion(false);
            setCantidadPresentacion('');
        } else {
            // Cambiar a modo presentación
            const presentacion = presentacionesDisponibles.find(p => 
                p.Item_Presentaciones_Id === parseInt(presentacionId)
            );
            if (presentacion) {
                setPresentacionSeleccionada(presentacion);
                setEsRequerimientoPorPresentacion(true);
                setCantidad(''); // Limpiar cantidad base al cambiar a presentación
            }
        }
    };

    const formatearNumero = (numero) => {
        return new Intl.NumberFormat('es-CO').format(numero || 0);
    };

    const getCantidadDisplay = () => {
        if (esRequerimientoPorPresentacion) {
            const cantPresNum = parseFloat(cantidadPresentacion) || 0;
            const cantBaseCalculada = cantPresNum * (presentacionSeleccionada?.Cantidad_Base || 1);
            return (
                <div className="text-sm">
                    <div className="font-medium text-primary">
                        {formatearNumero(cantPresNum)} {presentacionSeleccionada?.Presentacion_Unidad_Prefijo || 'pres'}
                    </div>
                    <div className="text-gray-500">
                        = {formatearNumero(cantBaseCalculada)} {item.UnidadMedida_Prefijo || 'Und'}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="text-sm font-medium text-gray-800">
                    {formatearNumero(parseFloat(cantidad) || 0)} {item.UnidadMedida_Prefijo || 'Und'}
                </div>
            );
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {/* Layout mobile */}
            <div className="lg:hidden space-y-3">
                {/* Header con producto y botón eliminar */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-800 text-sm">
                                    {item.Item_Codigo_SKU}
                                </h3>
                                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                    #{index + 1}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                {item.Item_Nombre}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onRemove(item.Item_Id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors
                                 min-h-[44px] min-w-[44px] touch-manipulation"
                        title="Eliminar producto"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>

                {/* Selector de presentación */}
                {presentacionesDisponibles.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de unidad:
                        </label>
                        <select
                            value={presentacionSeleccionada?.Item_Presentaciones_Id || ''}
                            onChange={(e) => handlePresentacionChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg
                                     bg-white text-gray-800 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="">Unidad base ({item.UnidadMedida_Prefijo || 'Und'})</option>
                            {presentacionesDisponibles.map(presentacion => (
                                <option key={presentacion.Item_Presentaciones_Id} value={presentacion.Item_Presentaciones_Id}>
                                    {presentacion.Presentacion_Nombre} ({presentacion.Presentacion_Unidad_Prefijo})
                                    {presentacion.Cantidad_Base && ` - ${presentacion.Cantidad_Base} ${item.UnidadMedida_Prefijo || 'Und'}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Input de cantidad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad solicitada:
                    </label>
                    {esRequerimientoPorPresentacion ? (
                        <div className="space-y-2">
                            <input
                                type="number"
                                value={cantidadPresentacion}
                                onChange={(e) => handleCantidadPresentacionChange(e.target.value)}
                                min="0"
                                step="1"
                                placeholder={`Cantidad en ${presentacionSeleccionada?.Presentacion_Unidad_Prefijo || 'presentación'}`}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg
                                         bg-white text-gray-800
                                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            {cantidadPresentacion && (
                                <div className="text-sm text-gray-600">
                                    = {formatearNumero((parseFloat(cantidadPresentacion) || 0) * (presentacionSeleccionada?.Cantidad_Base || 1))} {item.UnidadMedida_Prefijo || 'Und'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => handleCantidadChange(e.target.value)}
                            min="0"
                            step="1"
                            placeholder={`Cantidad en ${item.UnidadMedida_Prefijo || 'Und'}`}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg
                                     bg-white text-gray-800
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    )}
                </div>
            </div>

            {/* Layout desktop */}
            <div className="hidden lg:grid lg:grid-cols-10 lg:gap-4 lg:items-start">
                {/* Producto */}
                <div className="col-span-4 flex items-start gap-3 pt-2">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <FiPackage className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800 text-sm">
                                {item.Item_Codigo_SKU}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                #{index + 1}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                            {item.Item_Nombre}
                        </p>
                    </div>
                </div>

                {/* Cantidad */}
                <div className="col-span-3">
                    {/* Selector de presentación si existe */}
                    {presentacionesDisponibles.length > 0 && (
                        <select
                            value={presentacionSeleccionada?.Item_Presentaciones_Id || ''}
                            onChange={(e) => handlePresentacionChange(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded mb-2
                                     bg-white text-gray-800 text-xs
                                     focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="">Unidad base</option>
                            {presentacionesDisponibles.map(presentacion => (
                                <option key={presentacion.Item_Presentaciones_Id} value={presentacion.Item_Presentaciones_Id}>
                                    {presentacion.Presentacion_Nombre}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Input de cantidad */}
                    {esRequerimientoPorPresentacion ? (
                        <input
                            type="number"
                            value={cantidadPresentacion}
                            onChange={(e) => handleCantidadPresentacionChange(e.target.value)}
                            min="0"
                            step="1"
                            placeholder="Cantidad"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg
                                     bg-white text-gray-800 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    ) : (
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => handleCantidadChange(e.target.value)}
                            min="0"
                            step="1"
                            placeholder="Cantidad"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg
                                     bg-white text-gray-800 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    )}
                </div>

                {/* Unidad */}
                <div className="col-span-2 flex items-center justify-center pt-2">
                    {getCantidadDisplay()}
                </div>

                {/* Acciones */}
                <div className="col-span-1 flex items-center justify-center pt-2">
                    <button
                        onClick={() => onRemove(item.Item_Id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg
                                 hover:bg-red-50"
                        title="Eliminar producto"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemSelectorRequerimiento;