import React, { useState, useEffect } from 'react';
import {
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiPackage,
    FiAlertTriangle,
    FiXCircle,
    FiChevronLeft,
    FiChevronRight,
    FiPlus,
    FiBarChart2,
    FiTrendingUp,
    FiActivity
} from 'react-icons/fi';
import { existenciaService } from '../services/existenciaService';
import { BodegaSelector, CategoriaSelector } from '../components/common';
import DataCards from '../components/DataTable/DataCards';
import ResponsiveDataView from '../components/DataTable/ResponsiveDataView';
import ConfirmModal from '../components/ConfirmModal';

const ExistenciasBodegas = () => {
    const [existencias, setExistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para filtros y paginación
    const [filtros, setFiltros] = useState({
        search: '',
        bodega_id: '',
        categoria_id: '',
        stock_bajo: false,
        sin_stock: false,
        sort_by: 'Item_Nombre',
        sort_order: 'ASC'
    });
    
    const [paginacion, setPaginacion] = useState({
        current_page: 1,
        per_page: 10,
        total_records: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
    });

    // Estado para ConfirmModal
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });

    useEffect(() => {
        cargarExistencias();
    }, [filtros, paginacion.current_page, paginacion.per_page]);

    const cargarExistencias = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                ...filtros,
                page: paginacion.current_page,
                limit: paginacion.per_page
            };

            const response = await existenciaService.getAllExistencias(params);
            
            // Debug: Mostrar estructura de datos para identificar campos de fecha
            if (response.data && response.data.length > 0) {
                console.log('Estructura de existencia:', Object.keys(response.data[0]));
                console.log('Primera existencia completa:', response.data[0]);
            }
            
            setExistencias(response.data || []);
            setPaginacion(response.pagination || paginacion);

        } catch (error) {
            console.error('Error cargando existencias:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
        setPaginacion(prev => ({ ...prev, current_page: 1 }));
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        cargarExistencias();
    };

    const limpiarFiltros = () => {
        setFiltros({
            search: '',
            bodega_id: '',
            categoria_id: '',
            stock_bajo: false,
            sin_stock: false,
            sort_by: 'Item_Nombre',
            sort_order: 'ASC'
        });
    };



    const getEstadoStock = (existencia) => {
        const cantidad = existencia.cantidad_actual || existencia.Cantidad || 0;
        const stockMin = existencia.Stock_Min_Bodega || existencia.stock_min_bodega || 0;
        const puntoReorden = existencia.Punto_Reorden || existencia.punto_reorden || 0;
        const stockMax = existencia.Stock_Max_Bodega || existencia.stock_max_bodega || 100;

        if (cantidad === 0) {
            return { clase: 'text-red-600 bg-red-50', texto: 'Sin Stock', icono: '❌' };
        }
        
        if (stockMin > 0 && cantidad <= stockMin) {
            return { clase: 'text-red-600 bg-red-50', texto: 'Stock Crítico', icono: '🚨' };
        }
        
        if (puntoReorden > 0 && cantidad <= puntoReorden) {
            return { clase: 'text-orange-600 bg-orange-50', texto: 'Punto Reorden', icono: '🔄' };
        }
        
        if (cantidad <= 10) { // Fallback para items sin parámetros configurados
            return { clase: 'text-yellow-600 bg-yellow-50', texto: 'Stock Bajo', icono: '⚠️' };
        }
        
        if (stockMax > 0 && cantidad >= stockMax) {
            return { clase: 'text-blue-600 bg-blue-50', texto: 'Sobre Stock', icono: '📦' };
        }
        
        return { clase: 'text-green-600 bg-green-50', texto: 'Normal', icono: '✅' };
    };

    const formatCantidad = (cantidad) => {
        return parseFloat(cantidad || 0).toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const formatValor = (valor) => {
        return parseFloat(valor || 0).toLocaleString('es-GT', {
            style: 'currency',
            currency: 'GTQ',
            minimumFractionDigits: 0
        });
    };

    const formatFecha = (existencia) => {
        // Intentar diferentes nombres de campo para la fecha
        const fecha = existencia.Fecha_Ultima_Actualizacion || 
                     existencia.fecha_modificacion || 
                     existencia.Fecha_Modificacion || 
                     existencia.fecha_ultima_actualizacion ||
                     existencia.updatedAt ||
                     existencia.created_at;

        if (!fecha) {
            return 'No disponible';
        }

        try {
            const fechaObj = new Date(fecha);
            
            // Verificar si la fecha es válida
            if (isNaN(fechaObj.getTime())) {
                return 'Fecha inválida';
            }

            return fechaObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Error en fecha';
        }
    };

    // Función para renderizar cada card de existencia
    const renderExistenciaCard = (existencia, index) => {
        const estadoStock = getEstadoStock(existencia);
        const cantidad = existencia.Cantidad || existencia.cantidad_actual || 0;
        const stockMin = existencia.Stock_Min_Bodega || existencia.stock_min_bodega || 0;

        return (
            <div className="space-y-4">
                {/* Header del Item */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                            {existencia.Item_Nombre || existencia.item_nombre || 'N/A'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                                SKU: {existencia.Item_Codigo_SKU || existencia.item_codigo || 'N/A'}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {existencia.CategoriaItem_Nombre || existencia.categoria_nombre || 'Sin categoría'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Estado del Stock - Badge */}
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${estadoStock.clase} ml-3`}>
                        <span className="mr-1">{estadoStock.icono}</span>
                        {estadoStock.texto}
                    </span>
                </div>

                {/* Información de Bodega */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <FiPackage className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {existencia.Bodega_Nombre || existencia.bodega_nombre || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                                ID: {existencia.Bodega_Id || existencia.bodega_id || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información de Cantidad */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCantidad(cantidad)}
                        </p>
                        <p className="text-sm text-gray-500">
                            {existencia.UnidadMedida_Simbolo || existencia.UnidadMedida_Prefijo || existencia.unidad_nombre || 'und'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Cantidad Actual</p>
                    </div>
                    
                    {stockMin > 0 && (
                        <div className="text-center">
                            <p className="text-lg font-semibold text-orange-600">
                                {formatCantidad(stockMin)}
                            </p>
                            <p className="text-sm text-gray-500">mínimo</p>
                            <p className="text-xs text-gray-400 mt-1">Stock Mínimo</p>
                        </div>
                    )}
                </div>

                {/* Footer con fecha */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <FiActivity className="h-3 w-3" />
                        <span>Actualizado: {formatFecha(existencia)}</span>
                    </div>
                    
                    {/* Indicador visual adicional */}
                    <div className="flex items-center space-x-1">
                        {cantidad === 0 && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        {cantidad > 0 && cantidad <= stockMin && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        )}
                        {cantidad > stockMin && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 md:space-y-6 pb-6 md:pb-8">
            {/* Header Mobile-First */}
            <div className="bg-white shadow-sm rounded-lg p-4 md:p-6">
                <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Existencias</h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">Gestión de inventario por bodega</p>
                    </div>
                    <button
                        onClick={cargarExistencias}
                        disabled={loading}
                        className="w-full md:w-auto bg-blue-600 text-white px-4 py-3 md:py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 disabled:opacity-50 font-medium"
                    >
                        <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </button>
                </div>

                {/* Filtros Mobile-First */}
                <form onSubmit={handleBuscar} className="space-y-4">
                    {/* Búsqueda - Siempre primera */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar Items
                        </label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                value={filtros.search}
                                onChange={(e) => handleFiltroChange('search', e.target.value)}
                                placeholder="Buscar por nombre, SKU o código..."
                                className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            />
                        </div>
                    </div>

                    {/* Selectores - Grid responsive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BodegaSelector
                            label="Filtrar por Almacén"
                            value={filtros.bodega_id}
                            onChange={(value) => handleFiltroChange('bodega_id', value)}
                            showAllOption
                            allOptionLabel="Todas las bodegas"
                            placeholder="Seleccionar almacén..."
                        />

                        <CategoriaSelector
                            label="Filtrar por Categoría"
                            value={filtros.categoria_id}
                            onChange={(value) => handleFiltroChange('categoria_id', value)}
                            showAllOption
                            allOptionLabel="Todas las categorías"
                            placeholder="Seleccionar categoría..."
                        />
                    </div>

                    {/* Estados - Checkboxes mejorados */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Filtros de Estado
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={filtros.stock_bajo}
                                    onChange={(e) => handleFiltroChange('stock_bajo', e.target.checked)}
                                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm font-medium text-yellow-800">Stock Bajo</span>
                            </label>
                            <label className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={filtros.sin_stock}
                                    onChange={(e) => handleFiltroChange('sin_stock', e.target.checked)}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm font-medium text-red-800">Sin Stock</span>
                            </label>
                        </div>
                    </div>

                    {/* Botones - Stack en móvil, inline en desktop */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 md:py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 disabled:opacity-50 font-medium"
                        >
                            <FiSearch className="h-4 w-4" />
                            <span>Buscar</span>
                        </button>
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="flex-1 md:flex-none bg-gray-500 text-white px-6 py-3 md:py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center space-x-2 font-medium"
                        >
                            <FiFilter className="h-4 w-4" />
                            <span>Limpiar Filtros</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Métricas Mobile-First */}
            {existencias.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {/* Total Items */}
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
                                    {existencias.length}
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
                                    {existencias.filter(e => (e.Cantidad || e.cantidad_actual || 0) === 0).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Stock Crítico */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="flex-shrink-0 mb-2 md:mb-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                                    <FiAlertTriangle className="h-6 w-6 md:h-7 md:w-7 text-orange-600" />
                                </div>
                            </div>
                            <div className="md:ml-4">
                                <p className="text-xs md:text-sm font-medium text-gray-500">Stock Crítico</p>
                                <p className="text-lg md:text-2xl font-bold text-orange-600">
                                    {existencias.filter(e => {
                                        const estado = getEstadoStock(e);
                                        return estado.texto === 'Stock Crítico' || estado.texto === 'Punto Reorden';
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Activos */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 col-span-2 md:col-span-1">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <div className="flex-shrink-0 mb-2 md:mb-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-full flex items-center justify-center">
                                    <FiTrendingUp className="h-6 w-6 md:h-7 md:w-7 text-green-600" />
                                </div>
                            </div>
                            <div className="md:ml-4">
                                <p className="text-xs md:text-sm font-medium text-gray-500">Items Activos</p>
                                <p className="text-lg md:text-2xl font-bold text-green-600">
                                    {existencias.filter(e => (e.Cantidad || e.cantidad_actual || 0) > 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FiXCircle className="h-5 w-5 text-red-400 mr-2" />
                        <span className="text-red-800">Error: {error}</span>
                    </div>
                </div>
            )}

            {/* Vista Responsive - Cards en móvil, Tabla en desktop */}
            <ResponsiveDataView
                data={existencias}
                isLoading={loading}
                renderCard={renderExistenciaCard}
                emptyMessage="No se encontraron existencias"
                emptyIcon={<FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
                rowKeyField="Item_Id"
                // Configuración de la tabla para desktop
                columns={[
                    {
                        key: 'item',
                        label: 'Item',
                        render: (existencia) => (
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {existencia.Item_Nombre || existencia.item_nombre || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    SKU: {existencia.Item_Codigo_SKU || existencia.item_codigo || 'N/A'}
                                </div>
                                <div className="text-xs text-blue-600">
                                    {existencia.CategoriaItem_Nombre || existencia.categoria_nombre || 'Sin categoría'}
                                </div>
                            </div>
                        )
                    },
                    {
                        key: 'bodega',
                        label: 'Bodega',
                        render: (existencia) => (
                            <div>
                                <div className="text-sm text-gray-900">
                                    {existencia.Bodega_Nombre || existencia.bodega_nombre || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    ID: {existencia.Bodega_Id || existencia.bodega_id || 'N/A'}
                                </div>
                            </div>
                        )
                    },
                    {
                        key: 'cantidad',
                        label: 'Cantidad',
                        render: (existencia) => (
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {formatCantidad(existencia.Cantidad || existencia.cantidad_actual || 0)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {existencia.UnidadMedida_Simbolo || existencia.UnidadMedida_Prefijo || existencia.unidad_nombre || 'und'}
                                </div>
                                {(existencia.Stock_Min_Bodega || existencia.stock_min_bodega) && (
                                    <div className="text-xs text-gray-400">
                                        Min: {existencia.Stock_Min_Bodega || existencia.stock_min_bodega}
                                    </div>
                                )}
                            </div>
                        )
                    },
                    {
                        key: 'estado',
                        label: 'Estado',
                        render: (existencia) => {
                            const estadoStock = getEstadoStock(existencia);
                            return (
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${estadoStock.clase}`}>
                                    <span className="mr-1">{estadoStock.icono}</span>
                                    {estadoStock.texto}
                                </span>
                            );
                        }
                    },
                    {
                        key: 'fecha',
                        label: 'Última Actualización',
                        render: (existencia) => (
                            <span className="text-sm text-gray-500">
                                {formatFecha(existencia)}
                            </span>
                        )
                    }
                ]}
                // Configuración de paginación personalizada si usas paginación del backend
                pagination={false} // Deshabilitamos la paginación del componente
            />

            {/* Paginación del Backend */}
            {paginacion.total_pages > 1 && (
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                        {/* Mobile Paginación */}
                        <div className="block sm:hidden">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">
                                    Página <span className="font-semibold text-gray-900">{paginacion.current_page}</span> de{' '}
                                    <span className="font-semibold text-gray-900">{paginacion.total_pages}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {paginacion.total_records} registros en total
                                </p>
                            </div>

                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                    disabled={!paginacion.has_prev}
                                    className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[100px] justify-center"
                                >
                                    <FiChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </button>

                                <button
                                    onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                    disabled={!paginacion.has_next}
                                    className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[100px] justify-center"
                                >
                                    Siguiente
                                    <FiChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>

                        {/* Desktop Paginación */}
                        <div className="hidden sm:flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{((paginacion.current_page - 1) * paginacion.per_page) + 1}</span> a{' '}
                                    <span className="font-medium">
                                        {Math.min(paginacion.current_page * paginacion.per_page, paginacion.total_records)}
                                    </span> de{' '}
                                    <span className="font-medium">{paginacion.total_records}</span> resultados
                                </p>
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                    disabled={!paginacion.has_prev}
                                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    <FiChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>

                                <div className="flex items-center px-3">
                                    <span className="text-sm text-gray-700">
                                        Página {paginacion.current_page} de {paginacion.total_pages}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                    disabled={!paginacion.has_next}
                                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    <FiChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* ConfirmModal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    );
};

export default ExistenciasBodegas;
