import React, { useState, useEffect } from 'react';
import {
    FiPackage,
    FiPlus,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiEye,
    FiArrowDownLeft,
    FiArrowUpRight,
    FiRotateCw,
    FiSettings,
    FiCalendar,
    FiUser,
    FiMapPin,
    FiFileText,
    FiChevronLeft,
    FiChevronRight,
    FiX,
    FiCheck,
    FiAlertCircle
} from 'react-icons/fi';
import { movimientoService } from '../services/movimientoService';
import { bodegaService } from '../services/bodegaService';
import { itemService } from '../services/itemService';
import ConfirmModal from '../components/ConfirmModal';
import ModalMovimiento from '../components/ModalMovimiento';
import ModalDetalle from '../components/ModalDetalle';

const MovimientosBodegas = () => {
    // Estados principales
    const [movimientos, setMovimientos] = useState([]);
    const [bodegas, setBodegas] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtros y paginación
    const [filtros, setFiltros] = useState({
        search: '',
        tipo_movimiento: '',
        bodega_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        usuario_id: ''
    });

    const [paginacion, setPaginacion] = useState({
        current_page: 1,
        per_page: 10,
        total_records: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
    });

    // Estados para modales
    const [modales, setModales] = useState({
        entrada: false,
        salida: false,
        transferencia: false,
        ajuste: false,
        detalle: false
    });

    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({});



    // Estados para métricas
    const [metricas, setMetricas] = useState({
        total_movimientos: 0,
        entradas_hoy: 0,
        salidas_hoy: 0,
        transferencias_hoy: 0
    });

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    useEffect(() => {
        cargarMovimientos();
    }, [filtros, paginacion.current_page, paginacion.per_page]);

    const cargarDatosIniciales = async () => {
        try {
            const [bodegasData, itemsData] = await Promise.all([
                bodegaService.getAllBodegas(),
                itemService.getAllItems()
            ]);
            
            setBodegas(bodegasData.data || []);
            setItems(itemsData.data || []);
            
            // Cargar métricas del día
            await cargarMetricasHoy();
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            setError('Error cargando datos iniciales');
        }
    };

    const cargarMovimientos = async () => {
        try {
            setLoading(true);
            
            const params = {
                page: paginacion.current_page,
                limit: paginacion.per_page,
                ...filtros
            };

            const response = await movimientoService.getAllMovimientos(params);
            
            setMovimientos(response.data || []);
            setPaginacion(prev => ({
                ...prev,
                total_records: response.pagination?.total || 0,
                total_pages: response.pagination?.pages || 0,
                has_next: response.pagination?.pages > paginacion.current_page,
                has_prev: paginacion.current_page > 1
            }));
            
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            setError('Error cargando movimientos');
        } finally {
            setLoading(false);
        }
    };

    const cargarMetricasHoy = async () => {
        try {
            const response = await movimientoService.getMovimientosHoy();
            
            const entradas = response.data?.filter(m => m.Tipo_Movimiento === 'Entrada').length || 0;
            const salidas = response.data?.filter(m => m.Tipo_Movimiento === 'Salida').length || 0;
            const transferencias = response.data?.filter(m => m.Tipo_Movimiento === 'Transferencia').length || 0;
            
            setMetricas({
                total_movimientos: response.data?.length || 0,
                entradas_hoy: entradas,
                salidas_hoy: salidas,
                transferencias_hoy: transferencias
            });
            
        } catch (error) {
            console.error('Error cargando métricas:', error);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
        setPaginacion(prev => ({ ...prev, current_page: 1 }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            search: '',
            tipo_movimiento: '',
            bodega_id: '',
            fecha_inicio: '',
            fecha_fin: '',
            usuario_id: ''
        });
        setPaginacion(prev => ({ ...prev, current_page: 1 }));
    };

    const abrirModal = (tipo) => {
        setModales(prev => ({
            ...prev,
            [tipo]: true
        }));
    };

    const cerrarModal = (tipo) => {
        setModales(prev => ({
            ...prev,
            [tipo]: false
        }));
        
        if (tipo === 'detalle') {
            setMovimientoSeleccionado(null);
        }
    };

    const abrirModalDetalle = async (movimiento) => {
        try {
            setMovimientoSeleccionado(null);
            setModales(prev => ({ ...prev, detalle: true }));

            const response = await movimientoService.getMovimientoById(movimiento.Movimiento_Id);
            setMovimientoSeleccionado(response.data);
            
        } catch (error) {
            console.error('Error cargando detalle del movimiento:', error);
            setShowConfirmModal(true);
            setConfirmModalConfig({
                message: 'Error cargando el detalle del movimiento',
                confirmText: 'Aceptar',
                confirmButtonClass: 'bg-red-600 hover:bg-red-700',
                onConfirm: () => {
                    setShowConfirmModal(false);
                    setModales(prev => ({ ...prev, detalle: false }));
                }
            });
        }
    };
    };

    const getTipoMovimientoInfo = (tipo) => {
        const info = {
            'Entrada': {
                icono: FiArrowDownLeft,
                color: 'text-green-600 bg-green-50 border-green-200',
                texto: 'Entrada'
            },
            'Salida': {
                icono: FiArrowUpRight,
                color: 'text-red-600 bg-red-50 border-red-200',
                texto: 'Salida'
            },
            'Transferencia': {
                icono: FiRotateCw,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                texto: 'Transferencia'
            },
            'Ajuste': {
                icono: FiSettings,
                color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                texto: 'Ajuste'
            }
        };
        return info[tipo] || { icono: FiFileText, color: 'text-gray-600 bg-gray-50 border-gray-200', texto: tipo };
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCantidad = (cantidad) => {
        if (cantidad === null || cantidad === undefined) return '0';
        return parseFloat(cantidad).toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const manejarCrearMovimiento = async (datosMovimiento) => {
        try {
            let response;
            
            switch (datosMovimiento.tipo_movimiento) {
                case 'entrada':
                    response = await movimientoService.crearEntrada(datosMovimiento);
                    break;
                case 'salida':
                    response = await movimientoService.crearSalida(datosMovimiento);
                    break;
                case 'transferencia':
                    response = await movimientoService.crearTransferencia(datosMovimiento);
                    break;
                case 'ajuste':
                    response = await movimientoService.crearAjuste(datosMovimiento);
                    break;
                default:
                    throw new Error('Tipo de movimiento no válido');
            }

            // Recargar datos
            await Promise.all([
                cargarMovimientos(),
                cargarMetricasHoy()
            ]);

            setShowConfirmModal(true);
            setConfirmModalConfig({
                message: `${datosMovimiento.tipo_movimiento.charAt(0).toUpperCase() + datosMovimiento.tipo_movimiento.slice(1)} creado exitosamente`,
                confirmText: 'Aceptar',
                confirmButtonClass: 'bg-green-600 hover:bg-green-700',
                onConfirm: () => setShowConfirmModal(false)
            });

        } catch (error) {
            console.error('Error creando movimiento:', error);
            throw error; // Re-lanzar para que el modal lo maneje
        }
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <FiAlertCircle className="h-6 w-6 text-red-600 mr-3" />
                        <div>
                            <h3 className="text-lg font-medium text-red-800">Error</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setError(null);
                            cargarDatosIniciales();
                        }}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
                        <p className="text-gray-600">Gestión y control de movimientos de stock</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => abrirModal('entrada')}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                        >
                            <FiArrowDownLeft className="h-4 w-4 mr-2" />
                            Nueva Entrada
                        </button>
                        <button
                            onClick={() => abrirModal('salida')}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                        >
                            <FiArrowUpRight className="h-4 w-4 mr-2" />
                            Nueva Salida
                        </button>
                        <button
                            onClick={() => abrirModal('transferencia')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                        >
                            <FiRotateCw className="h-4 w-4 mr-2" />
                            Nueva Transferencia
                        </button>
                        <button
                            onClick={() => abrirModal('ajuste')}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center"
                        >
                            <FiSettings className="h-4 w-4 mr-2" />
                            Nuevo Ajuste
                        </button>
                    </div>
                </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiPackage className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 truncate">Total Movimientos Hoy</p>
                                <p className="text-2xl font-semibold text-gray-900">{metricas.total_movimientos}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiArrowDownLeft className="h-8 w-8 text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 truncate">Entradas</p>
                                <p className="text-2xl font-semibold text-green-600">{metricas.entradas_hoy}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiArrowUpRight className="h-8 w-8 text-red-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 truncate">Salidas</p>
                                <p className="text-2xl font-semibold text-red-600">{metricas.salidas_hoy}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiRotateCw className="h-8 w-8 text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 truncate">Transferencias</p>
                                <p className="text-2xl font-semibold text-blue-600">{metricas.transferencias_hoy}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar por motivo, observaciones..."
                                value={filtros.search}
                                onChange={(e) => handleFiltroChange('search', e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={filtros.tipo_movimiento}
                            onChange={(e) => handleFiltroChange('tipo_movimiento', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="Entrada">Entradas</option>
                            <option value="Salida">Salidas</option>
                            <option value="Transferencia">Transferencias</option>
                            <option value="Ajuste">Ajustes</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bodega</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                            type="date"
                            value={filtros.fecha_inicio}
                            onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={filtros.fecha_fin}
                            onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={limpiarFiltros}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <FiX className="h-4 w-4 mr-2" />
                        Limpiar
                    </button>
                    <button
                        onClick={cargarMovimientos}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <FiRefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Tabla de Movimientos */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha y Hora
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bodegas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Motivo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <FiRefreshCw className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                                            <span className="text-gray-600">Cargando movimientos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movimientos.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <FiPackage className="mx-auto h-12 w-12 mb-4" />
                                            <p>No se encontraron movimientos</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                movimientos.map((movimiento) => {
                                    const tipoInfo = getTipoMovimientoInfo(movimiento.Tipo_Movimiento);
                                    const IconoTipo = tipoInfo.icono;

                                    return (
                                        <tr key={movimiento.Movimiento_Id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    {formatFecha(movimiento.Fecha)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                                                    <IconoTipo className="h-3 w-3 mr-1" />
                                                    {tipoInfo.texto}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="space-y-1">
                                                    {movimiento.Origen_Bodega_Nombre && (
                                                        <div className="flex items-center text-red-600">
                                                            <FiArrowUpRight className="h-3 w-3 mr-1" />
                                                            <span className="text-xs">Desde: {movimiento.Origen_Bodega_Nombre}</span>
                                                        </div>
                                                    )}
                                                    {movimiento.Destino_Bodega_Nombre && (
                                                        <div className="flex items-center text-green-600">
                                                            <FiArrowDownLeft className="h-3 w-3 mr-1" />
                                                            <span className="text-xs">Hacia: {movimiento.Destino_Bodega_Nombre}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <span className="font-medium">{movimiento.Total_Items || 0}</span>
                                                    <span className="text-gray-500 ml-1">items</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Total: {formatCantidad(movimiento.Total_Cantidad || 0)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                                                    {movimiento.Usuario_Nombre_Completo || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="max-w-xs">
                                                    <p className="truncate" title={movimiento.Motivo}>
                                                        {movimiento.Motivo || '-'}
                                                    </p>
                                                    {movimiento.Recepcionista && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            Recep: {movimiento.Recepcionista}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => abrirModalDetalle(movimiento)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    title="Ver detalle"
                                                >
                                                    <FiEye className="h-4 w-4" />
                                                </button>
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
                                    Mostrando {((paginacion.current_page - 1) * paginacion.per_page) + 1} a{' '}
                                    {Math.min(paginacion.current_page * paginacion.per_page, paginacion.total_records)} de{' '}
                                    {paginacion.total_records} resultados
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
                                        {paginacion.current_page} de {paginacion.total_pages}
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

            {/* Modales */}
        {/* Modal Entrada */}
        {modales.entrada && (
            <ModalMovimiento
                tipo="entrada"
                isOpen={modales.entrada}
                onClose={() => cerrarModal('entrada')}
                onSubmit={manejarCrearMovimiento}
                bodegas={bodegas}
                items={items}
            />
        )}

        {/* Modal Salida */}
        {modales.salida && (
            <ModalMovimiento
                tipo="salida"
                isOpen={modales.salida}
                onClose={() => cerrarModal('salida')}
                onSubmit={manejarCrearMovimiento}
                bodegas={bodegas}
                items={items}
            />
        )}

        {/* Modal Transferencia */}
        {modales.transferencia && (
            <ModalMovimiento
                tipo="transferencia"
                isOpen={modales.transferencia}
                onClose={() => cerrarModal('transferencia')}
                onSubmit={manejarCrearMovimiento}
                bodegas={bodegas}
                items={items}
            />
        )}

        {/* Modal Ajuste */}
        {modales.ajuste && (
            <ModalMovimiento
                tipo="ajuste"
                isOpen={modales.ajuste}
                onClose={() => cerrarModal('ajuste')}
                onSubmit={manejarCrearMovimiento}
                bodegas={bodegas}
                items={items}
            />
        )}

        {/* Modal Detalle */}
        {modales.detalle && movimientoSeleccionado && (
            <ModalDetalle
                isOpen={modales.detalle}
                onClose={() => cerrarModal('detalle')}
                movimiento={movimientoSeleccionado}
            />
        )}

        {/* Modal Confirmación */}
        {showConfirmModal && (
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Confirmar Movimiento"
                message={confirmModalConfig.message}
                confirmText={confirmModalConfig.confirmText}
                confirmButtonClass={confirmModalConfig.confirmButtonClass}
                onConfirm={confirmModalConfig.onConfirm}
                onCancel={() => {
                    setShowConfirmModal(false);
                    setConfirmModalConfig({});
                }}
            />
        )}
        </div>
    );
};

export default MovimientosBodegas;
