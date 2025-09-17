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
    FiPlus
} from 'react-icons/fi';
import { existenciaService } from '../services/existenciaService';
import bodegaService from '../services/bodegaService';
import categoryService from '../services/categoryService';
import { itemBodegaParamService } from '../services/itemBodegaParamService';
import ConfirmModal from '../components/ConfirmModal';

const ExistenciasBodegas = () => {
    const [existencias, setExistencias] = useState([]);
    const [bodegas, setBodegas] = useState([]);
    const [categorias, setCategorias] = useState([]);
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
        cargarDatosIniciales();
    }, []);

    useEffect(() => {
        cargarExistencias();
    }, [filtros, paginacion.current_page, paginacion.per_page]);

    const cargarDatosIniciales = async () => {
        try {
            const [bodegasData, categoriasData] = await Promise.all([
                bodegaService.getAllBodegas(),
                categoryService.getAllCategories()
            ]);

            setBodegas(Array.isArray(bodegasData?.data) ? bodegasData.data : []);
            setCategorias(Array.isArray(categoriasData?.data) ? categoriasData.data : []);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    };

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Existencias</h1>
                        <p className="text-gray-600">Gestión de inventario por bodega</p>
                    </div>
                    <button
                        onClick={cargarExistencias}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 disabled:opacity-50"
                    >
                        <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </button>
                </div>

                {/* Filtros */}
                <form onSubmit={handleBuscar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar
                        </label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                value={filtros.search}
                                onChange={(e) => handleFiltroChange('search', e.target.value)}
                                placeholder="Buscar item..."
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bodega
                        </label>
                        <select
                            value={filtros.bodega_id}
                            onChange={(e) => handleFiltroChange('bodega_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas las bodegas</option>
                            {bodegas.map((bodega) => (
                                <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                    {bodega.Bodega_Nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría
                        </label>
                        <select
                            value={filtros.categoria_id}
                            onChange={(e) => handleFiltroChange('categoria_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.CategoriaItem_Id} value={categoria.CategoriaItem_Id}>
                                    {categoria.CategoriaItem_Nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filtros.stock_bajo}
                                    onChange={(e) => handleFiltroChange('stock_bajo', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Stock bajo</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filtros.sin_stock}
                                    onChange={(e) => handleFiltroChange('sin_stock', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Sin stock</span>
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-4 flex space-x-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 disabled:opacity-50"
                        >
                            <FiSearch className="h-4 w-4" />
                            <span>Buscar</span>
                        </button>
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2"
                        >
                            <FiFilter className="h-4 w-4" />
                            <span>Limpiar</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Métricas de Resumen */}
            {existencias.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiPackage className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Items</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {existencias.length}
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
                                    {existencias.filter(e => (e.Cantidad || e.cantidad_actual || 0) === 0).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Stock Crítico */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiAlertTriangle className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Stock Crítico</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {existencias.filter(e => {
                                        const estado = getEstadoStock(e);
                                        return estado.texto === 'Stock Crítico' || estado.texto === 'Punto Reorden';
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Valor Total Estimado */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiRefreshCw className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Items Activos</p>
                                <p className="text-2xl font-bold text-green-600">
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

            {/* Tabla de Existencias */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bodega
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cantidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Última Actualización
                                </th>

                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <FiRefreshCw className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                                            <span className="text-gray-600">Cargando existencias...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : existencias.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <FiPackage className="mx-auto h-12 w-12 mb-4" />
                                            <p>No se encontraron existencias</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                existencias.map((existencia, index) => {
                                    const estadoStock = getEstadoStock(existencia);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {existencia.Bodega_Nombre || existencia.bodega_nombre || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {existencia.Bodega_Id || existencia.bodega_id || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${estadoStock.clase}`}>
                                                    <span className="mr-1">{estadoStock.icono}</span>
                                                    {estadoStock.texto}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatFecha(existencia)}
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {paginacion.total_pages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                disabled={!paginacion.has_prev}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                disabled={!paginacion.has_next}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{((paginacion.current_page - 1) * paginacion.per_page) + 1}</span> a{' '}
                                    <span className="font-medium">
                                        {Math.min(paginacion.current_page * paginacion.per_page, paginacion.total_records)}
                                    </span> de{' '}
                                    <span className="font-medium">{paginacion.total_records}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                        disabled={!paginacion.has_prev}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <FiChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        Página {paginacion.current_page} de {paginacion.total_pages}
                                    </span>
                                    <button
                                        onClick={() => setPaginacion(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                        disabled={!paginacion.has_next}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <FiChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>



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
