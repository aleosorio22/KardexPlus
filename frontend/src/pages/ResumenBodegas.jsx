import React, { useState, useEffect } from 'react';
import { 
    FiBarChart2, 
    FiPackage, 
    FiAlertTriangle, 
    FiXCircle,
    FiTrendingUp,
    FiTrendingDown,
    FiActivity,
    FiRefreshCw
} from 'react-icons/fi';
import { existenciaService } from '../services/existenciaService';
import { itemBodegaParamService } from '../services/itemBodegaParamService';
import bodegaService from '../services/bodegaService';

const ResumenBodegas = () => {
    const [resumenData, setResumenData] = useState(null);
    const [stockBajo, setStockBajo] = useState([]);
    const [sinStock, setSinStock] = useState([]);
    const [puntoReorden, setPuntoReorden] = useState([]);
    const [bodegas, setBodegas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bodegaSeleccionada, setBodegaSeleccionada] = useState('todas');

    useEffect(() => {
        cargarBodegas();
    }, []);

    useEffect(() => {
        if (bodegas.length > 0) {
            cargarDatos();
        }
    }, [bodegaSeleccionada, bodegas]);

    const cargarBodegas = async () => {
        try {
            const response = await bodegaService.getAllBodegas();
            setBodegas(response.data || []);
        } catch (error) {
            console.error('Error cargando bodegas:', error);
        }
    };

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar resumen de existencias
            const bodegaId = bodegaSeleccionada === 'todas' ? null : bodegaSeleccionada;
            
            const [resumen, itemsStockBajo, itemsSinStock, itemsPuntoReorden] = await Promise.all([
                existenciaService.getResumenExistencias(bodegaId),
                // Usar el nuevo servicio que considera los parámetros configurados
                itemBodegaParamService.getItemsStockBajo(bodegaId),
                existenciaService.getItemsSinStock(bodegaId),
                itemBodegaParamService.getItemsPuntoReorden(bodegaId)
            ]);

            // Procesar datos del resumen
            let resumenProcesado;
            if (resumen?.data) {
                if (Array.isArray(resumen.data)) {
                    // Es un array de bodegas
                    resumenProcesado = {
                        total_items: resumen.data.reduce((sum, bodega) => sum + (bodega.Total_Items || 0), 0),
                        valor_total: resumen.data.reduce((sum, bodega) => sum + parseFloat(bodega.Valor_Total_Inventario || 0), 0),
                        por_bodega: resumen.data
                    };
                } else {
                    // Es un objeto único (cuando se filtra por bodega)
                    resumenProcesado = {
                        total_items: resumen.data.Total_Items || 0,
                        valor_total: parseFloat(resumen.data.Valor_Total_Inventario || 0),
                        por_bodega: [resumen.data]
                    };
                }
            } else {
                resumenProcesado = {
                    total_items: 0,
                    valor_total: 0,
                    por_bodega: []
                };
            }
            
            setResumenData(resumenProcesado);
            setStockBajo(Array.isArray(itemsStockBajo?.data) ? itemsStockBajo.data : 
                        Array.isArray(itemsStockBajo) ? itemsStockBajo : []);
            setSinStock(Array.isArray(itemsSinStock?.data) ? itemsSinStock.data : 
                       Array.isArray(itemsSinStock) ? itemsSinStock : []);
            setPuntoReorden(Array.isArray(itemsPuntoReorden?.data) ? itemsPuntoReorden.data : 
                           Array.isArray(itemsPuntoReorden) ? itemsPuntoReorden : []);

        } catch (error) {
            console.error('Error cargando datos del resumen:', error);
            setError(error.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const formatCantidad = (cantidad) => {
        if (cantidad === null || cantidad === undefined) return '0';
        return parseFloat(cantidad).toLocaleString('es-ES');
    };

    const formatValor = (valor) => {
        if (valor === null || valor === undefined) return 'Q0';
        return parseFloat(valor).toLocaleString('es-GT', {
            style: 'currency',
            currency: 'GTQ',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <FiRefreshCw className="animate-spin h-6 w-6 text-blue-600" />
                    <span className="text-gray-600">Cargando resumen...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <FiXCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-800">Error: {error}</span>
                </div>
                <button
                    onClick={cargarDatos}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resumen de Inventario</h1>
                    <p className="text-gray-600">Vista general del estado actual del inventario</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={bodegaSeleccionada}
                        onChange={(e) => setBodegaSeleccionada(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todas">Todas las bodegas</option>
                        {bodegas.map((bodega) => (
                            <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                {bodega.Bodega_Nombre}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={cargarDatos}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                    >
                        <FiRefreshCw className="h-4 w-4" />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {/* Tarjetas de métricas principales */}
            {resumenData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Total de Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiPackage className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Items</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCantidad(resumenData.total_items || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Valor Total del Inventario */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiTrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Valor Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatValor(resumenData.valor_total || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items con Stock Bajo */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiAlertTriangle className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {Array.isArray(stockBajo) ? stockBajo.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Sin Stock */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiXCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Sin Stock</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {Array.isArray(sinStock) ? sinStock.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Punto de Reorden */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiRefreshCw className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Punto de Reorden</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {Array.isArray(puntoReorden) ? puntoReorden.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Items con Stock Bajo */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiAlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">
                                Items con Stock Bajo ({Array.isArray(stockBajo) ? stockBajo.length : 0})
                            </h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {!Array.isArray(stockBajo) || stockBajo.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                No hay items con stock bajo
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {stockBajo.slice(0, 10).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.Item_Nombre}</p>
                                            <p className="text-sm text-gray-600">{item.Bodega_Nombre}</p>
                                            <p className="text-xs text-gray-500">SKU: {item.Item_Codigo_SKU}</p>
                                            <p className="text-xs text-blue-600">
                                                Cat: {item.CategoriaItem_Nombre}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-yellow-600">
                                                Actual: {formatCantidad(item.Cantidad_Actual || item.Cantidad)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Mín: {formatCantidad(item.Stock_Min_Bodega)}
                                            </p>
                                            <p className="text-xs text-gray-500">{item.UnidadMedida_Prefijo}</p>
                                            <p className="text-xs text-red-500">
                                                Necesita: {formatCantidad((item.Stock_Min_Bodega || 0) - (item.Cantidad_Actual || item.Cantidad || 0))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {Array.isArray(stockBajo) && stockBajo.length > 10 && (
                                    <p className="text-sm text-gray-500 text-center pt-2">
                                        y {stockBajo.length - 10} más...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Sin Stock */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiXCircle className="h-5 w-5 text-red-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">
                                Items Sin Stock ({Array.isArray(sinStock) ? sinStock.length : 0})
                            </h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {!Array.isArray(sinStock) || sinStock.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                No hay items sin stock
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {sinStock.slice(0, 10).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.item_nombre}</p>
                                            <p className="text-sm text-gray-600">{item.bodega_nombre}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-red-600">0</p>
                                            <p className="text-xs text-gray-500">{item.unidad_nombre}</p>
                                        </div>
                                    </div>
                                ))}
                                {Array.isArray(sinStock) && sinStock.length > 10 && (
                                    <p className="text-sm text-gray-500 text-center pt-2">
                                        y {sinStock.length - 10} más...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Items en Punto de Reorden */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiRefreshCw className="h-5 w-5 text-orange-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Items en Punto de Reorden</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {!Array.isArray(puntoReorden) || puntoReorden.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                No hay items en punto de reorden
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {puntoReorden.slice(0, 10).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.Item_Nombre || item.item_nombre}</p>
                                            <p className="text-sm text-gray-600">{item.Bodega_Nombre || item.bodega_nombre}</p>
                                            <p className="text-xs text-gray-500">SKU: {item.Item_Codigo_SKU || item.item_codigo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-orange-600">
                                                {item.Cantidad_Disponible || item.existencia_actual || 0}
                                            </p>
                                            <p className="text-xs text-gray-500">Reorden: {item.Punto_Reorden}</p>
                                            <p className="text-xs text-gray-500">{item.UnidadMedida_Simbolo || item.unidad_nombre}</p>
                                        </div>
                                    </div>
                                ))}
                                {Array.isArray(puntoReorden) && puntoReorden.length > 10 && (
                                    <p className="text-sm text-gray-500 text-center pt-2">
                                        y {puntoReorden.length - 10} más...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Resumen por Bodegas */}
            {resumenData && resumenData.por_bodega && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiBarChart2 className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Resumen por Bodegas</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resumenData.por_bodega.map((bodega, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{bodega.Bodega_Nombre}</h4>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {bodega.Bodega_Tipo}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Items:</span>
                                            <span className="font-medium">{formatCantidad(bodega.Total_Items || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cantidad Total:</span>
                                            <span className="font-medium">{formatCantidad(bodega.Total_Cantidad || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Valor:</span>
                                            <span className="font-medium">{formatValor(bodega.Valor_Total_Inventario || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Stock Bajo:</span>
                                            <span className="font-medium text-yellow-600">{bodega.Items_Stock_Bajo || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sin Stock:</span>
                                            <span className="font-medium text-red-600">{bodega.Items_Sin_Stock || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumenBodegas;
