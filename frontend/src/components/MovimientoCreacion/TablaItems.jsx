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

    const handleCantidadChange = (itemId, cantidad, stockActual) => {
        onItemUpdate(itemId, cantidad, stockActual);
    };

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
        <div className="space-y-6">
            {/* Buscador de productos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiPlus className="mr-2" />
                    Agregar Productos
                </h3>
                
                <SearchProducto
                    onProductSelected={handleProductSelected}
                    tipoMovimiento={tipoMovimiento}
                    bodegaOrigenId={bodegaOrigenId}
                    bodegaDestinoId={bodegaDestinoId}
                    itemsYaSeleccionados={items}
                />
                
                {/* Información contextual */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <FiPackage className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium">Consejos para búsqueda:</p>
                            <ul className="mt-1 space-y-1">
                                <li>• Escribe el nombre, SKU o código de barras del producto</li>
                                <li>• Pega un código escaneado para selección automática</li>
                                <li>• Usa las flechas ↑↓ para navegar y Enter para seleccionar</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de items seleccionados */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiPackage className="mr-2" />
                        Items Seleccionados ({items.length})
                    </h3>
                    
                    {items.length > 0 && (
                        <div className="text-sm text-gray-600">
                            Total: {getTotalCantidad().toFixed(2)} unidades
                        </div>
                    )}
                </div>

                {/* Validaciones */}
                {items.length > 0 && (
                    <div className="mb-4 space-y-2">
                        {validation.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                    <FiAlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">Errores encontrados:</p>
                                        <ul className="text-sm text-red-700 mt-1">
                                            {validation.errors.map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {validation.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                    <FiAlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">Advertencias:</p>
                                        <ul className="text-sm text-yellow-700 mt-1">
                                            {validation.warnings.map((warning, index) => (
                                                <li key={index}>• {warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Headers de la tabla */}
                {items.length > 0 && (
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 px-4 py-2 border-b border-gray-200 mb-4">
                        <div className="col-span-6">Producto</div>
                        <div className="col-span-2 text-center">{headers.stock}</div>
                        <div className="col-span-2 text-center">{headers.cantidad}</div>
                        <div className="col-span-1 text-center">{headers.resultado}</div>
                        <div className="col-span-1 text-center">Acciones</div>
                    </div>
                )}

                {/* Lista de items */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="ml-3 text-gray-600">Cargando items...</p>
                        </div>
                    ) : items.length > 0 ? (
                        items.map((item) => (
                            <ItemSelector
                                key={item.Item_Id}
                                producto={item}
                                onCantidadChange={handleCantidadChange}
                                onRemove={onItemRemove}
                                tipoMovimiento={tipoMovimiento}
                                bodegaOrigenId={bodegaOrigenId}
                                bodegaDestinoId={bodegaDestinoId}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No hay productos seleccionados
                            </h4>
                            <p className="text-gray-600">
                                Usa el buscador de arriba para agregar productos a este {tipoMovimiento}
                            </p>
                        </div>
                    )}
                </div>

                {/* Resumen final */}
                {items.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-6">
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
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
    );
};

export default TablaItems;