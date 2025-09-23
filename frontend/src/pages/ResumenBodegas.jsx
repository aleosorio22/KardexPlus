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
import { BodegaSelector } from '../components/common';

const ResumenBodegas = () => {
    const [resumenData, setResumenData] = useState(null);
    const [stockBajo, setStockBajo] = useState([]);
    const [sinStock, setSinStock] = useState([]);
    const [puntoReorden, setPuntoReorden] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bodegaSeleccionada, setBodegaSeleccionada] = useState('todas');

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [bodegaSeleccionada]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar resumen de existencias
            const bodegaId = bodegaSeleccionada === 'todas' ? null : bodegaSeleccionada;
            
            const [resumen, itemsStockBajo, itemsSinStock, itemsPuntoReorden] = await Promise.all([
                existenciaService.getResumenExistencias(bodegaId),
                // Usar el servicio con parámetros como objeto
                existenciaService.getItemsStockBajo(bodegaId ? { bodegaId } : {}),
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
        <div className="space-y-6 pb-6 md:pb-8">
            {/* Header Mobile-First */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Resumen de Inventario</h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">Vista general del estado actual del inventario</p>
                    </div>
                    
                    {/* Controles Avanzados - Mobile First */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:space-x-4">
                        <div className="w-full md:w-64 lg:w-72">
                            <BodegaSelector
                                value={bodegaSeleccionada}
                                onChange={setBodegaSeleccionada}
                                showAllOption={true}
                                allOptionLabel="Todas las bodegas"
                                allOptionValue="todas"
                                placeholder="Seleccionar almacén..."
                                size="md"
                                className="w-full"
                                onLoadComplete={(bodegasData) => {
                                }}
                            />
                        </div>
                        <button
                            onClick={cargarDatos}
                            className="w-full md:w-auto bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 font-medium transition-colors min-h-[44px]"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            <span>Actualizar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Métricas Mobile-First */}
            {resumenData && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                    {/* Total de Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="flex-shrink-0 mb-2 md:mb-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FiPackage className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
                                </div>
                            </div>
                            <div className="md:ml-4">
                                <p className="text-xs md:text-sm font-medium text-gray-500">Total Items</p>
                                <p className="text-lg md:text-2xl font-bold text-gray-900">
                                    {formatCantidad(resumenData.total_items || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Valor Total del Inventario */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="flex-shrink-0 mb-2 md:mb-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-full flex items-center justify-center">
                                    <FiTrendingUp className="h-6 w-6 md:h-7 md:w-7 text-green-600" />
                                </div>
                            </div>
                            <div className="md:ml-4">
                                <p className="text-xs md:text-sm font-medium text-gray-500">Valor Total</p>
                                <p className="text-sm md:text-2xl font-bold text-gray-900 break-all">
                                    {formatValor(resumenData.valor_total || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items con Stock Bajo */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="flex-shrink-0 mb-2 md:mb-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <FiAlertTriangle className="h-6 w-6 md:h-7 md:w-7 text-yellow-600" />
                                </div>
                            </div>
                            <div className="md:ml-4">
                                <p className="text-xs md:text-sm font-medium text-gray-500">Stock Bajo</p>
                                <p className="text-lg md:text-2xl font-bold text-yellow-600">
                                    {Array.isArray(stockBajo) ? stockBajo.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Sin Stock */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="flex-shrink-0 mb-2 md:mb-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-red-100 rounded-full flex items-center justify-center">
                                    <FiXCircle className="h-6 w-6 md:h-7 md:w-7 text-red-600" />
                                </div>
                            </div>
                            <div className="md:ml-4">
                                <p className="text-xs md:text-sm font-medium text-gray-500">Sin Stock</p>
                                <p className="text-lg md:text-2xl font-bold text-red-600">
                                    {Array.isArray(sinStock) ? sinStock.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Punto de Reorden */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 md:col-span-3 lg:col-span-1">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="flex-shrink-0 mb-2 md:mb-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                                    <FiRefreshCw className="h-6 w-6 md:h-7 md:w-7 text-orange-600" />
                                </div>
                            </div>
                            <div className="md:ml-4">
                                <p className="text-xs md:text-sm font-medium text-gray-500">Punto de Reorden</p>
                                <p className="text-lg md:text-2xl font-bold text-orange-600">
                                    {Array.isArray(puntoReorden) ? puntoReorden.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alertas Mobile-First */}
            <div className="mt-6 md:mt-8 space-y-4 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-6">
                {/* Items con Stock Bajo */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 md:px-6 md:py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiAlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 mr-2" />
                            <h3 className="text-base md:text-lg font-medium text-gray-900">
                                Items con Stock Bajo ({Array.isArray(stockBajo) ? stockBajo.length : 0})
                            </h3>
                        </div>
                    </div>
                    <div className="p-4 md:p-6">
                        {!Array.isArray(stockBajo) || stockBajo.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 text-sm">
                                No hay items con stock bajo
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
                                {stockBajo.slice(0, 10).map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between p-3 bg-yellow-50 rounded-lg space-y-2 sm:space-y-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900 truncate">{item.Item_Nombre}</p>
                                            <p className="text-xs text-gray-600">{item.Bodega_Nombre}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <p className="text-xs text-gray-500">SKU: {item.Item_Codigo_SKU}</p>
                                                <p className="text-xs text-blue-600">
                                                    Cat: {item.CategoriaItem_Nombre}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-1 text-xs">
                                                <div className="flex justify-between sm:justify-end items-center">
                                                    <span className="text-gray-500 sm:hidden">Actual:</span>
                                                    <span className="font-medium text-yellow-600">
                                                        {formatCantidad(item.Cantidad_Actual || item.Cantidad)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between sm:justify-end items-center">
                                                    <span className="text-gray-500 sm:hidden">Mín:</span>
                                                    <span className="text-gray-600">
                                                        {formatCantidad(item.Stock_Min_Bodega)}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 sm:col-span-1 flex justify-between sm:justify-end items-center">
                                                    <span className="text-gray-500 sm:hidden">Necesita:</span>
                                                    <span className="text-red-500 font-medium">
                                                        {formatCantidad((item.Stock_Min_Bodega || 0) - (item.Cantidad_Actual || item.Cantidad || 0))}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 sm:col-span-1 text-gray-500 text-center sm:text-right">
                                                    {item.UnidadMedida_Prefijo}
                                                </div>
                                            </div>
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
                    <div className="p-4 md:px-6 md:py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiXCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 mr-2" />
                            <h3 className="text-base md:text-lg font-medium text-gray-900">
                                Items Sin Stock ({Array.isArray(sinStock) ? sinStock.length : 0})
                            </h3>
                        </div>
                    </div>
                    <div className="p-4 md:p-6">
                        {!Array.isArray(sinStock) || sinStock.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 text-sm">
                                No hay items sin stock
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
                                {sinStock.slice(0, 10).map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between p-3 bg-red-50 rounded-lg space-y-2 sm:space-y-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900 truncate">{item.Item_Nombre || item.item_nombre}</p>
                                            <p className="text-xs text-gray-600">{item.Bodega_Nombre || item.bodega_nombre}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <p className="text-xs text-gray-500">SKU: {item.Item_Codigo_SKU}</p>
                                                <p className="text-xs text-blue-600">
                                                    Cat: {item.CategoriaItem_Nombre}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <div className="flex justify-between sm:justify-end items-center">
                                                <span className="text-xs text-gray-500 sm:hidden">Stock:</span>
                                                <p className="font-medium text-red-600">0</p>
                                            </div>
                                            <div className="flex justify-between sm:justify-end items-center mt-1">
                                                <span className="text-xs text-gray-500 sm:hidden">Unidad:</span>
                                                <p className="text-xs text-gray-500">{item.UnidadMedida_Prefijo || item.unidad_nombre || 'N/A'}</p>
                                            </div>
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

            {/* Items en Punto de Reorden Mobile-First */}
            <div className="mt-6 md:mt-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 md:px-6 md:py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiRefreshCw className="h-4 w-4 md:h-5 md:w-5 text-orange-600 mr-2" />
                            <h3 className="text-base md:text-lg font-medium text-gray-900">
                                Items en Punto de Reorden ({Array.isArray(puntoReorden) ? puntoReorden.length : 0})
                            </h3>
                        </div>
                    </div>
                    <div className="p-4 md:p-6">
                        {!Array.isArray(puntoReorden) || puntoReorden.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 text-sm">
                                No hay items en punto de reorden
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
                                {puntoReorden.slice(0, 10).map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between p-3 bg-orange-50 rounded-lg space-y-2 sm:space-y-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900 truncate">{item.Item_Nombre || item.item_nombre}</p>
                                            <p className="text-xs text-gray-600">{item.Bodega_Nombre || item.bodega_nombre}</p>
                                            <p className="text-xs text-gray-500 mt-1">SKU: {item.Item_Codigo_SKU || item.item_codigo}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-1 text-xs">
                                                <div className="flex justify-between sm:justify-end items-center">
                                                    <span className="text-gray-500 sm:hidden">Actual:</span>
                                                    <span className="font-medium text-orange-600">
                                                        {item.Cantidad_Disponible || item.existencia_actual || 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between sm:justify-end items-center">
                                                    <span className="text-gray-500 sm:hidden">Reorden:</span>
                                                    <span className="text-gray-600">
                                                        {item.Punto_Reorden}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 sm:col-span-1 text-gray-500 text-center sm:text-right">
                                                    {item.UnidadMedida_Simbolo || item.unidad_nombre}
                                                </div>
                                            </div>
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

            {/* Resumen por Bodegas Mobile-First */}
            {resumenData && resumenData.por_bodega && (
                <div className="mt-6 md:mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 md:px-6 md:py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiBarChart2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                            <h3 className="text-base md:text-lg font-medium text-gray-900">Resumen por Bodegas</h3>
                        </div>
                    </div>
                    <div className="p-4 md:p-6">
                        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                            {resumenData.por_bodega.map((bodega, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                                        <h4 className="font-medium text-sm md:text-base text-gray-900 truncate">{bodega.Bodega_Nombre}</h4>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded self-start">
                                            {bodega.Bodega_Tipo}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-xs md:text-sm">
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
                                            <span className="font-medium text-xs md:text-sm break-all">{formatValor(bodega.Valor_Total_Inventario || 0)}</span>
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
