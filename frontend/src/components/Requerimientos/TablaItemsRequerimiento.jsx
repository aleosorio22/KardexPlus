import React from 'react';
import { FiPackage, FiPlus } from 'react-icons/fi';
import ItemSelectorRequerimiento from './ItemSelectorRequerimiento';
import SearchProductoRequerimiento from './SearchProductoRequerimiento';

const TablaItemsRequerimiento = ({
    items = [],
    onItemAdd,
    onItemUpdate,
    onItemRemove,
    bodegaOrigenId,
    loading = false
}) => {

    const handleProductSelected = (producto) => {
        onItemAdd(producto);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FiPackage className="w-5 h-5 text-primary" />
                        Items del Requerimiento
                        {items.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-green-50 text-primary rounded-full text-sm font-medium">
                                {items.length}
                            </span>
                        )}
                    </h2>

                    {/* Buscador de productos */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <SearchProductoRequerimiento
                            onProductSelected={handleProductSelected}
                            placeholder="Buscar productos para solicitar..."
                            bodegaOrigenId={bodegaOrigenId}
                        />
                    </div>
                </div>



                {/* Tabla de items */}
                {items.length > 0 ? (
                    <div className="space-y-4">
                        {/* Header para pantallas grandes */}
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-10 gap-4 py-3 px-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-600">
                                <div className="col-span-4">Producto</div>
                                <div className="col-span-3 text-center">Cantidad Solicitada</div>
                                <div className="col-span-2 text-center">Unidad</div>
                                <div className="col-span-1 text-center">Acciones</div>
                            </div>
                        </div>

                        {/* Lista de items */}
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <ItemSelectorRequerimiento
                                    key={`${item.Item_Id}-${index}`}
                                    item={item}
                                    onUpdate={onItemUpdate}
                                    onRemove={onItemRemove}
                                    bodegaOrigenId={bodegaOrigenId}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* Resumen */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>
                                        <span className="font-medium">{items.length}</span> {items.length === 1 ? 'producto' : 'productos'} agregados
                                    </span>
                                    <span>
                                        <span className="font-medium">
                                            {items.filter(item => 
                                                item.Es_Requerimiento_Por_Presentacion ? 
                                                item.Cantidad_Solicitada_Presentacion > 0 : 
                                                item.Cantidad_Solicitada > 0
                                            ).length}
                                        </span> con cantidad válida
                                    </span>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                    Los items sin cantidad serán ignorados al crear el requerimiento
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Estado vacío */
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FiPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            No hay productos agregados
                        </h3>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                            Usa el buscador arriba para encontrar y agregar productos que necesitas solicitar en este requerimiento.
                        </p>
                        {!bodegaOrigenId && (
                            <p className="text-sm text-orange-600">
                                Primero selecciona una bodega de origen para buscar productos.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TablaItemsRequerimiento;