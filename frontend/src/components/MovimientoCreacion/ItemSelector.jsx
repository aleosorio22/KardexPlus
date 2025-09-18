import React, { useState, useEffect } from 'react';
import { FiPackage, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import { existenciaService } from '../../services/existenciaService';
import toast from 'react-hot-toast';

const ItemSelector = ({ 
    producto, 
    onCantidadChange, 
    onRemove, 
    tipoMovimiento, 
    bodegaOrigenId, 
    bodegaDestinoId 
}) => {
    const [cantidad, setCantidad] = useState(producto.Cantidad || '');
    const [stockActual, setStockActual] = useState(parseFloat(producto.Stock_Actual) || 0);
    const [loading, setLoading] = useState(false);
    const [stockStatus, setStockStatus] = useState('normal');

    useEffect(() => {
        // Actualizar stock cuando cambian las bodegas
        if (bodegaOrigenId || bodegaDestinoId) {
            updateStock();
        }
    }, [bodegaOrigenId, bodegaDestinoId, tipoMovimiento]);

    useEffect(() => {
        // Validar cantidad cuando cambia
        validateCantidad(cantidad);
    }, [cantidad, stockActual]);

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

    const handleCantidadChange = (e) => {
        const nuevaCantidad = e.target.value;
        
        // Permitir solo números positivos y decimales
        if (nuevaCantidad === '' || /^\d*\.?\d*$/.test(nuevaCantidad)) {
            setCantidad(nuevaCantidad);
            onCantidadChange(producto.Item_Id, nuevaCantidad, stockActual);
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

                    {/* Input de cantidad optimizado */}
                    <div className="space-y-2">
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
                <div className="grid grid-cols-12 gap-4 items-center p-4">
                    {/* Información del producto */}
                    <div className="col-span-5">
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

                    {/* Campo de cantidad */}
                    <div className="col-span-3">
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={cantidad}
                                onChange={handleCantidadChange}
                                className={`w-full px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                                    stockStatus === 'insuficiente' 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : stockStatus === 'limite'
                                        ? 'border-yellow-300 focus:ring-yellow-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="0.00"
                            />
                            
                            <div className="absolute inset-y-0 right-2 flex items-center">
                                {getStatusIcon()}
                            </div>
                        </div>
                        
                        {cantidad && (
                            <p className={`text-xs mt-1 text-center ${
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

                    {/* Stock resultante */}
                    <div className="col-span-1 text-center">
                        {tipoMovimiento === 'ajuste' ? (
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-purple-600">
                                    {cantidad || '-'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
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