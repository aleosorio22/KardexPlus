import React, { useState, useEffect } from 'react';
import { FiPackage, FiAlertTriangle, FiCheck, FiX, FiBox } from 'react-icons/fi';
import { existenciaService } from '../../services/existenciaService';
import itemPresentacionService from '../../services/itemPresentacionService';
import toast from 'react-hot-toast';

const ItemSelector = ({ 
    producto, 
    onCantidadChange, 
    onRemove, 
    tipoMovimiento, 
    bodegaOrigenId, 
    bodegaDestinoId 
}) => {
    // Estados existentes
    const [cantidad, setCantidad] = useState(producto.Cantidad || '');
    const [stockActual, setStockActual] = useState(parseFloat(producto.Stock_Actual) || 0);
    const [loading, setLoading] = useState(false);
    const [stockStatus, setStockStatus] = useState('normal');
    
    // Nuevos estados para presentaciones
    const [presentacionesDisponibles, setPresentacionesDisponibles] = useState([]);
    const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
    const [cantidadPresentacion, setCantidadPresentacion] = useState('');
    const [esMovimientoPorPresentacion, setEsMovimientoPorPresentacion] = useState(false);
    const [loadingPresentaciones, setLoadingPresentaciones] = useState(false);

    useEffect(() => {
        // Cargar presentaciones disponibles al montar el componente
        if (producto?.Item_Id) {
            cargarPresentacionesDisponibles();
        }
    }, [producto.Item_Id]);

    useEffect(() => {
        // Actualizar stock cuando cambian las bodegas
        if (bodegaOrigenId || bodegaDestinoId) {
            updateStock();
        }
    }, [bodegaOrigenId, bodegaDestinoId, tipoMovimiento]);

    useEffect(() => {
        // Validar cantidad cuando cambia
        validateCantidad(cantidad);
    }, [cantidad, stockActual, tipoMovimiento]);

    useEffect(() => {
        // Actualizar componente padre cuando cambien los estados relevantes
        updateOnCantidadChange();
    }, [cantidad, stockActual, presentacionSeleccionada, cantidadPresentacion, esMovimientoPorPresentacion]);

    const cargarPresentacionesDisponibles = async () => {
        try {
            setLoadingPresentaciones(true);
            console.log(`📦 ItemSelector: Cargando presentaciones para Item_Id ${producto.Item_Id}...`);
            
            const response = await itemPresentacionService.getItemPresentacionesByItemId(producto.Item_Id);
            console.log(`📦 ItemSelector: Respuesta del servicio de presentaciones:`, response);
            console.log(`📦 ItemSelector: Presentaciones encontradas:`, response.data);
            
            // Asegurar que Cantidad_Base sea numérico para los cálculos
            const presentacionesConvertidas = (response.data || []).map(presentacion => ({
                ...presentacion,
                Cantidad_Base: parseFloat(presentacion.Cantidad_Base) || 1
            }));
            
            setPresentacionesDisponibles(presentacionesConvertidas);
            console.log(`📦 ItemSelector: Total presentaciones cargadas: ${presentacionesConvertidas.length}`);
            
            // Si había una presentación seleccionada previamente, actualizarla
            if (presentacionSeleccionada && presentacionesConvertidas.length > 0) {
                const presentacionActualizada = presentacionesConvertidas.find(
                    p => p.Item_Presentaciones_Id === presentacionSeleccionada.Item_Presentaciones_Id
                );
                if (presentacionActualizada) {
                    setPresentacionSeleccionada(presentacionActualizada);
                }
            }
        } catch (error) {
            console.error('❌ Error cargando presentaciones:', error);
            toast.error(`Error cargando presentaciones: ${error.message}`);
            setPresentacionesDisponibles([]);
        } finally {
            setLoadingPresentaciones(false);
        }
    };

    const updateStock = async () => {
        try {
            setLoading(true);
            let bodegaParaStock = null;
            
            // Determinar qué bodega usar según el tipo de movimiento
            switch (tipoMovimiento) {
                case 'entrada':
                case 'ajuste':
                    bodegaParaStock = bodegaDestinoId;
                    break;
                case 'salida':
                case 'transferencia':
                    bodegaParaStock = bodegaOrigenId;
                    break;
            }

            if (!bodegaParaStock) {
                console.log('No hay bodega para obtener stock');
                setStockActual(null); // null indica que no hay bodega seleccionada
                return;
            }

            console.log(`ItemSelector: Obteniendo stock para Item ${producto.Item_Id} en Bodega ${bodegaParaStock}`);
            const response = await existenciaService.getExistenciaByBodegaAndItem(
                bodegaParaStock, 
                producto.Item_Id
            );
            
            console.log('ItemSelector: Respuesta del servicio:', response);
            
            // El backend devuelve el campo 'Cantidad' - asegurar que sea número
            const nuevoStock = parseFloat(response.data?.Cantidad) || 0;
                              
            console.log(`ItemSelector: Stock obtenido: ${nuevoStock}`);
            setStockActual(nuevoStock);
            
            // Actualizar el producto con el nuevo stock
            onCantidadChange(producto.Item_Id, cantidad, nuevoStock);
            
        } catch (error) {
            // Si es 404, significa que no hay existencia para ese item en esa bodega (stock = 0)
            if (error.response?.status === 404) {
                console.log('No existe registro de existencia, stock = 0');
                setStockActual(0);
            } else {
                console.warn('Error obteniendo stock:', error);
                setStockActual(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateCantidad = (cant) => {
        const cantidadNum = parseFloat(cant) || 0;
        
        // Para salidas y transferencias, validar que no exceda el stock
        if ((tipoMovimiento === 'salida' || tipoMovimiento === 'transferencia') && stockActual !== null) {
            if (cantidadNum > stockActual) {
                setStockStatus('insuficiente');
            } else if (cantidadNum === stockActual) {
                setStockStatus('limite');
            } else if (cantidadNum > 0) {
                setStockStatus('normal');
            } else {
                setStockStatus('vacio');
            }
        } else {
            // Para entradas y ajustes, solo validar que sea mayor a 0
            if (cantidadNum > 0) {
                setStockStatus('normal');
            } else {
                setStockStatus('vacio');
            }
        }
    };

    // Funciones para manejar presentaciones
    const handlePresentacionChange = (presentacionId) => {
        console.log('📦 ItemSelector: Seleccionando presentación:', presentacionId);
        
        if (presentacionId === 'base') {
            // Usar unidad base
            setPresentacionSeleccionada(null);
            setEsMovimientoPorPresentacion(false);
            setCantidadPresentacion('');
            console.log('📦 ItemSelector: Cambiado a unidad base');
        } else {
            // Seleccionar presentación específica
            const presentacion = presentacionesDisponibles.find(p => p.Item_Presentaciones_Id === parseInt(presentacionId));
            if (presentacion) {
                console.log('📦 ItemSelector: Presentación encontrada:', presentacion);
                
                // Asegurar que Cantidad_Base sea numérico
                const factorConversion = parseFloat(presentacion.Cantidad_Base);
                if (factorConversion && factorConversion > 0) {
                    setPresentacionSeleccionada(presentacion);
                    setEsMovimientoPorPresentacion(true);
                    
                    // Si hay cantidad base actual, convertir a cantidad de presentación
                    const cantidadActual = parseFloat(cantidad) || 0;
                    if (cantidadActual > 0) {
                        const cantidadEnPresentacion = cantidadActual / factorConversion;
                        setCantidadPresentacion(cantidadEnPresentacion.toFixed(4).replace(/\.?0+$/, ''));
                    } else {
                        setCantidadPresentacion('');
                    }
                    
                    console.log('📦 ItemSelector: Configurado movimiento por presentación:', {
                        esMovimientoPorPresentacion: true,
                        factorConversion,
                        cantidadActual,
                        cantidadEnPresentacion: cantidadActual / factorConversion
                    });
                } else {
                    console.warn('❌ Factor de conversión inválido para la presentación:', presentacion);
                    toast.error('Factor de conversión inválido para esta presentación');
                    // Mantener en unidad base si el factor es inválido
                    setPresentacionSeleccionada(null);
                    setEsMovimientoPorPresentacion(false);
                    setCantidadPresentacion('');
                }
            } else {
                console.warn('❌ Presentación no encontrada con ID:', presentacionId);
            }
        }
        
        // Actualizar el componente padre después del cambio
        setTimeout(updateOnCantidadChange, 100);
    };

    const handleCantidadPresentacionChange = (e) => {
        const nuevaCantidadPresentacion = e.target.value;
        
        // Permitir solo números positivos y decimales
        if (nuevaCantidadPresentacion === '' || /^\d*\.?\d*$/.test(nuevaCantidadPresentacion)) {
            setCantidadPresentacion(nuevaCantidadPresentacion);
            
            if (presentacionSeleccionada && nuevaCantidadPresentacion) {
                // Convertir cantidad de presentación a cantidad base
                const factorConversion = parseFloat(presentacionSeleccionada.Cantidad_Base);
                const cantidadPresentacionNum = parseFloat(nuevaCantidadPresentacion);
                
                if (factorConversion && factorConversion > 0 && !isNaN(cantidadPresentacionNum)) {
                    // Cantidad Base = Cantidad Presentación × Factor de Conversión
                    const cantidadBase = cantidadPresentacionNum * factorConversion;
                    const cantidadBaseFormateada = cantidadBase.toFixed(4).replace(/\.?0+$/, '');
                    setCantidad(cantidadBaseFormateada);
                    console.log(`🔄 ItemSelector: Conversión presentación → base:`, {
                        cantidadPresentacion: cantidadPresentacionNum,
                        factorConversion,
                        cantidadBase: cantidadBase,
                        cantidadBaseFormateada
                    });
                } else {
                    setCantidad('');
                }
            } else if (!nuevaCantidadPresentacion) {
                setCantidad('');
            }
        }
    };

    const updateOnCantidadChange = () => {
        // Determinar qué valores enviar al componente padre
        const cantidadFinal = parseFloat(cantidad) || 0;
        
        // Crear objeto completo con todos los datos necesarios
        const datosItem = {
            // Datos básicos del item
            Item_Id: producto.Item_Id,
            Item_Codigo: producto.Item_Codigo,
            Item_Descripcion: producto.Item_Descripcion,
            Item_Nombre: producto.Item_Nombre || producto.Item_Descripcion,
            
            // Datos de cantidad
            Cantidad: cantidadFinal,
            Stock_Actual: stockActual,
            
            // Datos de presentación (siempre incluir, aunque sea null)
            Item_Presentaciones_Id: presentacionSeleccionada?.Item_Presentaciones_Id || null,
            Cantidad_Presentacion: esMovimientoPorPresentacion ? (parseFloat(cantidadPresentacion) || null) : null,
            Es_Movimiento_Por_Presentacion: esMovimientoPorPresentacion,
            
            // Información adicional para mostrar en el resumen
            Presentacion_Nombre: presentacionSeleccionada?.Presentacion_Nombre || null,
            Presentacion_Unidad_Prefijo: presentacionSeleccionada?.UnidadMedida_Prefijo || null,
            Factor_Conversion: presentacionSeleccionada ? parseFloat(presentacionSeleccionada.Cantidad_Base) : null,
            
            // Unidad base del item
            UnidadMedida_Prefijo: producto.UnidadMedida_Prefijo || 'Und'
        };
        
        console.log(`📦 ItemSelector: Estados actuales del item ${producto.Item_Id}:`, {
            esMovimientoPorPresentacion,
            presentacionSeleccionada: presentacionSeleccionada ? {
                id: presentacionSeleccionada.Item_Presentaciones_Id,
                nombre: presentacionSeleccionada.Presentacion_Nombre,
                factor: presentacionSeleccionada.Cantidad_Base
            } : null,
            cantidadPresentacion,
            cantidad,
            stockActual
        });
        
        console.log(`📦 ItemSelector: Enviando datos del item ${producto.Item_Id}:`, datosItem);
        
        // Llamar al callback del componente padre
        if (typeof onCantidadChange === 'function') {
            onCantidadChange(producto.Item_Id, cantidadFinal, stockActual, datosItem);
        }
    };

    const handleCantidadChange = (e) => {
        const nuevaCantidad = e.target.value;
        
        // Permitir solo números positivos y decimales
        if (nuevaCantidad === '' || /^\d*\.?\d*$/.test(nuevaCantidad)) {
            setCantidad(nuevaCantidad);
            
            // Si estamos en modo presentación, actualizar también la cantidad de presentación
            if (esMovimientoPorPresentacion && presentacionSeleccionada && nuevaCantidad) {
                const factorConversion = parseFloat(presentacionSeleccionada.Cantidad_Base);
                const cantidadBaseNum = parseFloat(nuevaCantidad);
                
                if (factorConversion && factorConversion > 0 && !isNaN(cantidadBaseNum)) {
                    // Cantidad Presentación = Cantidad Base ÷ Factor de Conversión
                    const cantidadEnPresentacion = cantidadBaseNum / factorConversion;
                    const cantidadPresentacionFormateada = cantidadEnPresentacion.toFixed(4).replace(/\.?0+$/, '');
                    setCantidadPresentacion(cantidadPresentacionFormateada);
                    console.log(`🔄 ItemSelector: Conversión base → presentación:`, {
                        cantidadBase: cantidadBaseNum,
                        factorConversion,
                        cantidadPresentacion: cantidadEnPresentacion,
                        cantidadPresentacionFormateada
                    });
                } else {
                    setCantidadPresentacion('');
                }
            } else if (!nuevaCantidad) {
                setCantidadPresentacion('');
            }
        }
    };

    const getStockInfo = () => {
        switch (tipoMovimiento) {
            case 'entrada':
                return {
                    label: 'Stock actual en destino',
                    showValidation: false,
                    color: 'text-blue-600'
                };
            case 'salida':
                return {
                    label: 'Stock disponible',
                    showValidation: true,
                    color: stockStatus === 'insuficiente' ? 'text-red-600' : 'text-green-600'
                };
            case 'transferencia':
                return {
                    label: 'Stock en origen',
                    showValidation: true,
                    color: stockStatus === 'insuficiente' ? 'text-red-600' : 'text-green-600'
                };
            case 'ajuste':
                return {
                    label: 'Stock actual',
                    showValidation: false,
                    color: 'text-purple-600'
                };
            default:
                return {
                    label: 'Stock actual',
                    showValidation: false,
                    color: 'text-gray-600'
                };
        }
    };

    const getCantidadPlaceholder = () => {
        switch (tipoMovimiento) {
            case 'entrada':
                return 'Cantidad a ingresar';
            case 'salida':
                return 'Cantidad a retirar';
            case 'transferencia':
                return 'Cantidad a transferir';
            case 'ajuste':
                return 'Nueva cantidad';
            default:
                return 'Cantidad';
        }
    };

    const getStatusIcon = () => {
        switch (stockStatus) {
            case 'normal':
                return <FiCheck className="h-4 w-4 text-green-500" />;
            case 'insuficiente':
                return <FiAlertTriangle className="h-4 w-4 text-red-500" />;
            case 'limite':
                return <FiAlertTriangle className="h-4 w-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusMessage = () => {
        const cantidadNum = parseFloat(cantidad) || 0;
        
        switch (stockStatus) {
            case 'insuficiente':
                return `Stock insuficiente (Disponible: ${stockActual})`;
            case 'limite':
                return 'Usará todo el stock disponible';
            case 'vacio':
                return 'Ingrese una cantidad válida';
            case 'normal':
                if ((tipoMovimiento === 'salida' || tipoMovimiento === 'transferencia') && stockActual !== null) {
                    const stockRestante = typeof stockActual === 'number' ? stockActual - cantidadNum : 0;
                    return `Quedará: ${stockRestante.toFixed(2)}`;
                }
                return 'Cantidad válida';
            default:
                return '';
        }
    };

    const stockInfo = getStockInfo();

    return (
        <>
            {/* Mobile Layout - Compacto y eficiente */}
            <div className="block lg:hidden bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Header compacto con gradiente sutil */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiPackage className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                                    {producto.Item_Descripcion}
                                </h4>
                                <p className="text-xs text-blue-600 font-medium">
                                    {producto.Item_Codigo}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => onRemove(producto.Item_Id)}
                            className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 active:bg-red-100 
                                     transition-colors touch-manipulation flex items-center justify-center"
                            title="Eliminar item"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="p-3 space-y-3">
                    {/* Información de stock - Layout horizontal compacto */}
                    <div className="flex space-x-2">
                        <div className="flex-1 bg-gray-50 rounded-lg p-2.5 text-center">
                            <div className="text-xs text-gray-600 mb-1">{stockInfo.label}</div>
                            {loading ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                </div>
                            ) : stockActual === null ? (
                                <>
                                    <div className="text-lg font-bold text-gray-400">?</div>
                                    <div className="text-xs text-red-500">Sin bodega</div>
                                </>
                            ) : (
                                <>
                                    <div className={`text-base font-bold ${stockInfo.color}`}>
                                        {typeof stockActual === 'number' ? stockActual.toFixed(2) : '0.00'}
                                    </div>
                                    <div className="text-xs text-gray-500">{producto.UnidadMedida_Prefijo || 'Und'}</div>
                                </>
                            )}
                        </div>
                        
                        <div className="flex-1 bg-green-50 rounded-lg p-2.5 text-center">
                            <div className="text-xs text-gray-600 mb-1">
                                {tipoMovimiento === 'ajuste' ? 'Nueva' : 'Resultante'}
                            </div>
                            {tipoMovimiento === 'ajuste' ? (
                                <>
                                    <div className="text-base font-bold text-purple-600">
                                        {cantidad || '-'}
                                    </div>
                                    <div className="text-xs text-gray-500">{producto.UnidadMedida_Prefijo || 'Und'}</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-base font-bold text-gray-700">
                                        {cantidad && stockActual !== null 
                                            ? Math.max(0, (typeof stockActual === 'number' ? stockActual : 0) + (tipoMovimiento === 'entrada' ? parseFloat(cantidad) : -parseFloat(cantidad))).toFixed(2)
                                            : '-'
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500">{producto.UnidadMedida_Prefijo || 'Und'}</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Selector de presentaciones */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-700">Unidad de medida:</label>
                            {loadingPresentaciones && (
                                <div className="flex items-center space-x-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
                                    <span className="text-xs text-gray-500">Cargando...</span>
                                </div>
                            )}
                        </div>
                        
                        <select
                            value={presentacionSeleccionada?.Item_Presentaciones_Id || 'base'}
                            onChange={(e) => handlePresentacionChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="base">
                                {producto.UnidadMedida_Prefijo || 'Und'} (Unidad Base)
                            </option>
                            {presentacionesDisponibles.map((presentacion) => (
                                <option key={presentacion.Item_Presentaciones_Id} value={presentacion.Item_Presentaciones_Id}>
                                    {presentacion.Presentacion_Nombre} 
                                    ({presentacion.UnidadMedida_Prefijo || 'Und'}) 
                                    - {parseFloat(presentacion.Cantidad_Base).toFixed(0)}x
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Input de cantidad optimizado */}
                    <div className="space-y-2">
                        {/* Si está en modo presentación, mostrar input de presentación */}
                        {esMovimientoPorPresentacion && presentacionSeleccionada ? (
                            <>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Cantidad en {presentacionSeleccionada.Presentacion_Nombre}:</span>
                                    <span className="text-blue-600">Factor: {parseFloat(presentacionSeleccionada.Cantidad_Base).toFixed(0)}x</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={cantidadPresentacion}
                                        onChange={handleCantidadPresentacionChange}
                                        className={`w-full px-4 py-3 text-xl font-semibold border-2 rounded-lg text-center 
                                                  focus:outline-none focus:ring-2 touch-manipulation transition-all
                                                  ${stockStatus === 'insuficiente' 
                                                    ? 'border-red-300 focus:ring-red-500 bg-red-50 text-red-700' 
                                                    : stockStatus === 'limite'
                                                    ? 'border-yellow-300 focus:ring-yellow-500 bg-yellow-50 text-yellow-700'
                                                    : 'border-purple-300 focus:ring-purple-500 bg-purple-50 text-purple-700'
                                                  }`}
                                        placeholder={`Cantidad en ${presentacionSeleccionada.Presentacion_Nombre}`}
                                    />
                                    
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <FiBox className="h-4 w-4 text-purple-500" />
                                    </div>
                                </div>
                                
                                {/* Mostrar equivalencia en unidades base */}
                                <div className="bg-gray-100 rounded-lg p-2 text-center">
                                    <div className="text-xs text-gray-600 mb-1">Equivale a:</div>
                                    <div className="text-lg font-bold text-gray-800">
                                        {cantidad || '0'} {producto.UnidadMedida_Prefijo || 'Und'}
                                    </div>
                                    <div className="text-xs text-gray-500">Unidades base</div>
                                </div>
                            </>
                        ) : (
                            // Input normal para unidad base
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={cantidad}
                                    onChange={handleCantidadChange}
                                    className={`w-full px-4 py-3 text-xl font-semibold border-2 rounded-lg text-center 
                                              focus:outline-none focus:ring-2 touch-manipulation transition-all
                                              ${stockStatus === 'insuficiente' 
                                                ? 'border-red-300 focus:ring-red-500 bg-red-50 text-red-700' 
                                                : stockStatus === 'limite'
                                                ? 'border-yellow-300 focus:ring-yellow-500 bg-yellow-50 text-yellow-700'
                                                : 'border-blue-300 focus:ring-blue-500 bg-blue-50 text-blue-700'
                                              }`}
                                    placeholder="Cantidad"
                                />
                                
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    {getStatusIcon()}
                                </div>
                            </div>
                        )}
                        
                        {cantidad && (
                            <div className={`text-xs p-2 rounded-lg text-center font-medium
                                ${stockStatus === 'insuficiente' 
                                    ? 'bg-red-100 text-red-700' 
                                    : stockStatus === 'limite'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                {getStatusMessage()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Tabla tradicional optimizada */}
            <div className="hidden lg:block bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-12 gap-4 items-start p-4">
                    {/* Información del producto */}
                    <div className="col-span-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FiPackage className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">
                                    {producto.Item_Descripcion}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {producto.Item_Codigo} • ID: {producto.Item_Id}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stock actual */}
                    <div className="col-span-2 text-center">
                        <div className="flex flex-col items-center">
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    <span className="text-xs text-gray-500 mt-1">Cargando...</span>
                                </>
                            ) : stockActual === null ? (
                                <>
                                    <span className="text-lg font-bold text-gray-400">?</span>
                                    <span className="text-xs text-red-500 mt-1">Sin bodega</span>
                                </>
                            ) : (
                                <>
                                    <span className={`text-lg font-bold ${stockInfo.color}`}>
                                        {typeof stockActual === 'number' ? stockActual.toFixed(2) : '0.00'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {producto.UnidadMedida_Prefijo || 'Und'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Selector de presentaciones */}
                    <div className="col-span-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Unidad:</label>
                            <select
                                value={presentacionSeleccionada?.Item_Presentaciones_Id || 'base'}
                                onChange={(e) => handlePresentacionChange(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                                <option value="base">
                                    {producto.UnidadMedida_Prefijo || 'Und'}
                                </option>
                                {presentacionesDisponibles.map((presentacion) => (
                                    <option key={presentacion.Item_Presentaciones_Id} value={presentacion.Item_Presentaciones_Id}>
                                        {presentacion.Presentacion_Nombre} ({parseFloat(presentacion.Cantidad_Base).toFixed(0)}x)
                                    </option>
                                ))}
                            </select>
                            {loadingPresentaciones && (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Campo de cantidad */}
                    <div className="col-span-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">
                                {esMovimientoPorPresentacion ? 'En Presentación:' : 'Cantidad:'}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={esMovimientoPorPresentacion ? cantidadPresentacion : cantidad}
                                    onChange={esMovimientoPorPresentacion ? handleCantidadPresentacionChange : handleCantidadChange}
                                    className={`w-full px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                                        stockStatus === 'insuficiente' 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : stockStatus === 'limite'
                                            ? 'border-yellow-300 focus:ring-yellow-500'
                                            : esMovimientoPorPresentacion 
                                            ? 'border-purple-300 focus:ring-purple-500'
                                            : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                    placeholder="0.00"
                                />
                                
                                <div className="absolute inset-y-0 right-2 flex items-center">
                                    {esMovimientoPorPresentacion ? (
                                        <FiBox className="h-4 w-4 text-purple-500" />
                                    ) : (
                                        getStatusIcon()
                                    )}
                                </div>
                            </div>
                            
                            {esMovimientoPorPresentacion && cantidad && (
                                <p className="text-xs text-center text-gray-600">
                                    = {cantidad} {producto.UnidadMedida_Prefijo || 'Und'}
                                </p>
                            )}
                            
                            {(cantidad || cantidadPresentacion) && (
                                <p className={`text-xs text-center ${
                                    stockStatus === 'insuficiente' 
                                        ? 'text-red-600' 
                                        : stockStatus === 'limite'
                                        ? 'text-yellow-600'
                                        : 'text-gray-600'
                                }`}>
                                    {getStatusMessage()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stock resultante */}
                    <div className="col-span-1 text-center">{/* cambié de col-span-1 a col-span-1 */}
                        {tipoMovimiento === 'ajuste' ? (
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-medium text-gray-700 mb-1">Nueva:</span>
                                <span className="text-sm font-medium text-purple-600">
                                    {cantidad || '-'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-medium text-gray-700 mb-1">Resultante:</span>
                                <span className="text-sm font-medium text-gray-600">
                                    {cantidad && stockActual !== null 
                                        ? Math.max(0, (typeof stockActual === 'number' ? stockActual : 0) + (tipoMovimiento === 'entrada' ? parseFloat(cantidad) : -parseFloat(cantidad))).toFixed(2)
                                        : '-'
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Botón eliminar */}
                    <div className="col-span-1 text-center">
                        <button
                            onClick={() => onRemove(producto.Item_Id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar item"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemSelector;