import React from 'react';
import { FiPackage, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import ItemSelector from './ItemSelector';
import SearchProducto from './SearchProducto';

const TablaItems = ({
    items = [],
    onItemAdd,
    onItemUpdate,
    onItemRemove,
    tipoMovimiento,
    bodegaOrigenId,
    bodegaDestinoId,
    loading = false
}) => {

    const handleProductSelected = (producto) => {
        onItemAdd(producto);
    };

    // REMOVED: handleCantidadChange ya que ItemSelector maneja directamente las cantidades y presentaciones

    const getHeaderLabels = () => {
        switch (tipoMovimiento) {
            case 'entrada':
                return {
                    stock: 'Stock Actual en Destino',
                    cantidad: 'Cantidad a Ingresar',
                    resultado: 'Stock Resultante'
                };
            case 'salida':
                return {
                    stock: 'Stock Disponible',
                    cantidad: 'Cantidad a Retirar',
                    resultado: 'Stock Resultante'
                };
            case 'transferencia':
                return {
                    stock: 'Stock en Origen',
                    cantidad: 'Cantidad a Transferir',
                    resultado: 'Stock Resultante'
                };
            case 'ajuste':
                return {
                    stock: 'Stock Actual',
                    cantidad: 'Nueva Cantidad',
                    resultado: 'Diferencia'
                };
            default:
                return {
                    stock: 'Stock Actual',
                    cantidad: 'Cantidad',
                    resultado: 'Resultado'
                };
        }
    };

    const validateItems = () => {
        const errors = [];
        const warnings = [];

        items.forEach((item, index) => {
            const cantidad = parseFloat(item.Cantidad) || 0;
            const stock = item.Stock_Actual || 0;

            // Validaciones por tipo de movimiento
            if (cantidad <= 0) {
                errors.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
            }

            if ((tipoMovimiento === 'salida' || tipoMovimiento === 'transferencia') && cantidad > stock) {
                errors.push(`Item ${index + 1}: Cantidad excede stock disponible (${stock})`);
            }

            if ((tipoMovimiento === 'salida' || tipoMovimiento === 'transferencia') && cantidad === stock && stock > 0) {
                warnings.push(`Item ${index + 1}: Usará todo el stock disponible`);
            }
        });

        return { errors, warnings, isValid: errors.length === 0 };
    };

    const getTotalCantidad = () => {
        return items.reduce((total, item) => {
            const cantidad = parseFloat(item.Cantidad) || 0;
            return total + cantidad;
        }, 0);
    };

    const getTotalValor = () => {
        return items.reduce((total, item) => {
            const cantidad = parseFloat(item.Cantidad) || 0;
            const costo = item.Item_Costo_Unitario || 0;
            return total + (cantidad * costo);
        }, 0);
    };

    const validation = validateItems();
    const headers = getHeaderLabels();

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Buscador de productos - Mobile optimized */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="leading-tight">Agregar Productos</span>
                    </h3>
                
                <SearchProducto
                    onProductSelected={handleProductSelected}
                    tipoMovimiento={tipoMovimiento}
                    bodegaOrigenId={bodegaOrigenId}
                    bodegaDestinoId={bodegaDestinoId}
                    itemsYaSeleccionados={items}
                />
                
                    {/* Información contextual - Mobile optimized */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <FiPackage className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs sm:text-sm text-blue-800">
                                <p className="font-medium">Consejos para búsqueda:</p>
                                <ul className="mt-1 space-y-1 leading-relaxed">
                                    <li>• Escribe el nombre, SKU o código de barras</li>
                                    <li className="hidden sm:list-item">• Pega un código escaneado para selección automática</li>
                                    <li className="hidden sm:list-item">• Usa las flechas ↑↓ para navegar y Enter para seleccionar</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de items seleccionados - Mobile optimized */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between mb-4 sm:mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FiPackage className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                            <span className="leading-tight">Items Seleccionados ({items.length})</span>
                        </h3>
                        
                        {items.length > 0 && (
                            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full sm:bg-transparent sm:px-0 sm:py-0">
                                Total: {getTotalCantidad().toFixed(2)} unidades
                            </div>
                        )}
                    </div>

                    {/* Validaciones - Mobile optimized */}
                    {items.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {validation.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                        <FiAlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-red-800">Errores encontrados:</p>
                                            <ul className="text-xs sm:text-sm text-red-700 mt-1 space-y-0.5">
                                                {validation.errors.map((error, index) => (
                                                    <li key={index} className="leading-tight">• {error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {validation.warnings.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                        <FiAlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-yellow-800">Advertencias:</p>
                                            <ul className="text-xs sm:text-sm text-yellow-700 mt-1 space-y-0.5">
                                                {validation.warnings.map((warning, index) => (
                                                    <li key={index} className="leading-tight">• {warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                {/* Headers de tabla - Solo desktop */}
                {items.length > 0 && (
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 text-sm font-medium text-gray-600 px-4 py-2 border-b border-gray-200 mb-4">
                        <div className="col-span-6">Producto</div>
                        <div className="col-span-2 text-center">{headers.stock}</div>
                        <div className="col-span-2 text-center">{headers.cantidad}</div>
                        <div className="col-span-1 text-center">{headers.resultado}</div>
                        <div className="col-span-1 text-center">Acciones</div>
                    </div>
                )}

                    {/* Lista de items - Mobile optimized */}
                    <div className="space-y-3 sm:space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-500 border-t-transparent"></div>
                                <p className="mt-3 text-sm sm:text-base text-gray-600">Cargando items...</p>
                            </div>
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <ItemSelector
                                    key={item.Item_Id}
                                    producto={item}
                                    onCantidadChange={(itemId, cantidad, stockActual, datosItem) => {
                                        console.log(`🔄 TablaItems - Recibido de ItemSelector:`, {
                                            itemId,
                                            cantidad,
                                            stockActual,
                                            datosItem
                                        });
                                        // Pasar los datos completos al componente padre (CrearMovimiento)
                                        onItemUpdate(itemId, cantidad, stockActual, datosItem);
                                    }}
                                    onRemove={onItemRemove}
                                    tipoMovimiento={tipoMovimiento}
                                    bodegaOrigenId={bodegaOrigenId}
                                    bodegaDestinoId={bodegaDestinoId}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 sm:py-12 px-4">
                                <FiPackage className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                    No hay productos seleccionados
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600 max-w-xs mx-auto leading-relaxed">
                                    Usa el buscador de arriba para agregar productos a este {tipoMovimiento}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Resumen final - Mobile optimized */}
                    {items.length > 0 && (
                        <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total de items:</span>
                                            <span className="font-medium">{items.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total unidades:</span>
                                            <span className="font-medium">{getTotalCantidad().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Estado de validación</h4>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                        validation.isValid 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {validation.isValid ? 'Listo para procesar' : 'Requiere correcciones'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TablaItems;