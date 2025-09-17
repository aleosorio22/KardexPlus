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
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
                {/* Información del producto */}
                <div className="col-span-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded">
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
                                <span className="text-lg font-bold text-gray-400">
                                    ?
                                </span>
                                <span className="text-xs text-red-500 mt-1 text-center">
                                    Sin bodega
                                </span>
                            </>
                        ) : (
                            <>
                                <span className={`text-lg font-bold ${stockInfo.color}`}>
                                    {typeof stockActual === 'number' ? stockActual.toFixed(2) : '0.00'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {producto.UnidadMedida_Prefijo}
                                </span>
                                <span className="text-xs text-gray-600 mt-1 text-center">
                                    {stockInfo.label}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Campo de cantidad */}
                <div className="col-span-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={cantidad}
                            onChange={handleCantidadChange}
                            className={`w-full px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                                stockStatus === 'insuficiente' 
                                    ? 'border-red-300 focus:ring-red-500' 
                                    : stockStatus === 'limite'
                                    ? 'border-yellow-300 focus:ring-yellow-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder={getCantidadPlaceholder()}
                        />
                        
                        {/* Icono de estado */}
                        <div className="absolute inset-y-0 right-2 flex items-center">
                            {getStatusIcon()}
                        </div>
                    </div>
                    
                    {/* Mensaje de estado */}
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

                {/* Stock resultante (solo para ajustes) */}
                <div className="col-span-1 text-center">
                    {tipoMovimiento === 'ajuste' ? (
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-purple-600">
                                {cantidad || '-'}
                            </span>
                            <span className="text-xs text-gray-500">Nueva</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-600">
                                {cantidad && stockActual !== null 
                                    ? Math.max(0, (typeof stockActual === 'number' ? stockActual : 0) + (tipoMovimiento === 'entrada' ? parseFloat(cantidad) : -parseFloat(cantidad))).toFixed(2)
                                    : '-'
                                }
                            </span>
                            <span className="text-xs text-gray-500">Resultante</span>
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
    );
};

export default ItemSelector;