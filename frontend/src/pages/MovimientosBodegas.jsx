import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    FiChevronDown,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiTruck,
    FiArrowRight,
    FiEdit3
} from 'react-icons/fi';
import { movimientoService } from '../services/movimientoService';
import { bodegaService } from '../services/bodegaService';
import { itemService } from '../services/itemService';
import ConfirmModal from '../components/ConfirmModal';
import ModalDetalle from '../components/ModalDetalle';
import { ResponsiveDataView, SearchAndFilter } from '../components/DataTable';

const MovimientosBodegas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados principales
    const [movimientos, setMovimientos] = useState([]);
    const [bodegas, setBodegas] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtros
    const [filtros, setFiltros] = useState({
        search: '',
        tipo_movimiento: '',
        bodega_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        usuario_id: ''
    });

    // Estados para modales
    const [modales, setModales] = useState({
        detalle: false
    });

    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({});

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    useEffect(() => {
        cargarMovimientos();
    }, []);

    // Manejar mensajes de navegación (éxito/error)
    useEffect(() => {
        if (location.state?.message) {
            setShowConfirmModal(true);
            setConfirmModalConfig({
                message: location.state.message,
                confirmText: 'Aceptar',
                type: location.state.type || 'info',
                onConfirm: () => {
                    setShowConfirmModal(false);
                    // Limpiar el state de navegación
                    navigate(location.pathname, { replace: true });
                }
            });
        }
    }, [location.state, navigate]);

    const cargarDatosIniciales = async () => {
        try {
            const [bodegasResponse, itemsResponse] = await Promise.all([
                bodegaService.getAllBodegas(),
                itemService.getAllItems()
            ]);

            const bodegas = bodegasResponse.data || [];
            setBodegas(bodegas);
            
            // Filtrar y validar items - usar los campos correctos del backend
            const rawItems = itemsResponse.data || [];
            const itemsValidos = rawItems.filter(item => 
                item && item.Item_Id && (item.Item_Codigo_SKU || item.Item_Nombre)
            ).map(item => ({
                ...item,
                // Mapear campos para compatibilidad con el modal
                Item_Codigo: item.Item_Codigo_SKU || item.Item_Id.toString(),
                Item_Descripcion: item.Item_Nombre
            }));
            setItems(itemsValidos);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            const errorMsg = error.message || error.toString();
            setError('Error cargando datos iniciales: ' + errorMsg);

        }
    };

    const cargarMovimientos = async () => {
        try {
            setLoading(true);
            
            // Cargar todos los movimientos sin paginación del servidor
            const response = await movimientoService.getAllMovimientos({
                limit: 1000 // Cargar muchos registros, la paginación será del lado cliente
            });
            
            // Los datos están directamente en response.data
            const movimientos = response.data || [];
            setMovimientos(movimientos);

        } catch (error) {
            console.error('❌ Error cargando movimientos:', error);
            setError('Error cargando movimientos: ' + (error.message || error.toString()));
        } finally {
            setLoading(false);
        }
    };

    const cargarMetricasHoy = async () => {
        try {
            // TODO: Implementar getMetricasHoy en el servicio
            // TODO: Implementar carga de métricas
            // const response = await movimientoService.getMetricasHoy();
            // setMetricas(response.data || {});
        } catch (error) {
            console.error('Error cargando métricas:', error);
        }
    };

    // Opciones de filtros para SearchAndFilter
    const filterOptions = [
        {
            id: 'search',
            label: 'Búsqueda',
            type: 'text',
            defaultValue: '',
            placeholder: 'Buscar por motivo, usuario, observaciones...'
        },
        {
            id: 'tipo_movimiento',
            label: 'Tipo de Movimiento',
            type: 'select',
            defaultValue: '',
            options: [
                { value: '', label: 'Todos los tipos' },
                { value: 'Entrada', label: '📥 Entradas' },
                { value: 'Salida', label: '📤 Salidas' },
                { value: 'Transferencia', label: '🔄 Transferencias' },
                { value: 'Ajuste', label: '⚙️ Ajustes' }
            ]
        },
        {
            id: 'bodega_id',
            label: 'Bodega',
            type: 'select',
            defaultValue: '',
            options: [
                { value: '', label: 'Todas las bodegas' },
                ...bodegas.map(bodega => ({
                    value: bodega.Bodega_Id.toString(),
                    label: `🏪 ${bodega.Bodega_Nombre}`
                }))
            ]
        },
        {
            id: 'fecha_inicio',
            label: 'Fecha Desde',
            type: 'date',
            defaultValue: ''
        },
        {
            id: 'fecha_fin',  
            label: 'Fecha Hasta',
            type: 'date',
            defaultValue: ''
        }
    ];

    const handleFilterChange = (newFilters) => {
        setFiltros(newFilters);
    };

    const handleRefresh = () => {
        cargarMovimientos();
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
                type: 'danger',
                onConfirm: () => {
                    setShowConfirmModal(false);
                    setModales(prev => ({ ...prev, detalle: false }));
                }
            });
        }
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
                icono: FiArrowRight,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                texto: 'Transferencia'
            },
            'Ajuste': {
                icono: FiEdit3,
                color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                texto: 'Ajuste'
            }
        };
        return info[tipo] || info['Entrada'];
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
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

    // Filtrar movimientos del lado cliente
    const filteredMovimientos = useMemo(() => {
        return movimientos.filter(movimiento => {
            // Filtro de búsqueda
            const matchesSearch = !filtros.search || 
                movimiento.Motivo?.toLowerCase().includes(filtros.search.toLowerCase()) ||
                movimiento.Usuario_Nombre_Completo?.toLowerCase().includes(filtros.search.toLowerCase()) ||
                movimiento.Observaciones?.toLowerCase().includes(filtros.search.toLowerCase()) ||
                movimiento.Recepcionista?.toLowerCase().includes(filtros.search.toLowerCase());

            // Filtro por tipo
            const matchesType = !filtros.tipo_movimiento || 
                movimiento.Tipo_Movimiento === filtros.tipo_movimiento;

            // Filtro por bodega (origen o destino)
            const matchesBodega = !filtros.bodega_id || 
                movimiento.Origen_Bodega_Id?.toString() === filtros.bodega_id ||
                movimiento.Destino_Bodega_Id?.toString() === filtros.bodega_id;

            // Filtro por fecha desde
            const matchesFechaDesde = !filtros.fecha_inicio || 
                !movimiento.Fecha ||
                new Date(movimiento.Fecha) >= new Date(filtros.fecha_inicio);

            // Filtro por fecha hasta  
            const matchesFechaHasta = !filtros.fecha_fin || 
                !movimiento.Fecha ||
                new Date(movimiento.Fecha) <= new Date(filtros.fecha_fin + 'T23:59:59');

            return matchesSearch && matchesType && matchesBodega && matchesFechaDesde && matchesFechaHasta;
        });
    }, [movimientos, filtros]);

    // Definir columnas para DataTable
    const columns = [
        {
            field: 'Fecha',
            header: 'Fecha y Hora',
            render: (movimiento) => (
                <div className="flex items-center">
                    <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{formatFecha(movimiento.Fecha)}</span>
                </div>
            )
        },
        {
            field: 'Tipo_Movimiento',
            header: 'Tipo',
            render: (movimiento) => {
                const tipoInfo = getTipoMovimientoInfo(movimiento.Tipo_Movimiento);
                const IconoTipo = tipoInfo.icono;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                        <IconoTipo className="h-3 w-3 mr-1" />
                        {tipoInfo.texto}
                    </span>
                );
            }
        },
        {
            field: 'bodegas',
            header: 'Bodegas',
            sortable: false,
            render: (movimiento) => (
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
            )
        },
        {
            field: 'Total_Items',
            header: 'Items',
            render: (movimiento) => (
                <div>
                    <div className="flex items-center">
                        <span className="font-medium">{movimiento.Total_Items || 0}</span>
                        <span className="text-gray-500 ml-1">items</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Total: {formatCantidad(movimiento.Total_Cantidad || 0)}
                    </div>
                </div>
            )
        },
        {
            field: 'Usuario_Nombre_Completo',
            header: 'Usuario',
            render: (movimiento) => (
                <div className="flex items-center">
                    <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{movimiento.Usuario_Nombre_Completo || '-'}</span>
                </div>
            )
        },
        {
            field: 'Motivo',
            header: 'Motivo',
            render: (movimiento) => (
                <div className="max-w-xs">
                    <p className="truncate text-sm" title={movimiento.Motivo}>
                        {movimiento.Motivo || '-'}
                    </p>
                    {movimiento.Recepcionista && (
                        <p className="text-xs text-gray-500 truncate">
                            Recep: {movimiento.Recepcionista}
                        </p>
                    )}
                </div>
            )
        }
    ];

    // Renderizar card para móvil
    const renderMovimientoCard = (movimiento) => {
        const tipoInfo = getTipoMovimientoInfo(movimiento.Tipo_Movimiento);
        const IconoTipo = tipoInfo.icono;
        
        return (
            <div 
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => abrirModalDetalle(movimiento)}
            >
                {/* Header del card */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                            <IconoTipo className="h-3 w-3 mr-1" />
                            {tipoInfo.texto}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            abrirModalDetalle(movimiento);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalle"
                    >
                        <FiEye className="h-4 w-4" />
                    </button>
                </div>

                {/* Información principal */}
                <div className="space-y-2">
                    {/* Fecha */}
                    <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{formatFecha(movimiento.Fecha)}</span>
                    </div>

                    {/* Bodegas */}
                    <div className="space-y-1">
                        {movimiento.Origen_Bodega_Nombre && (
                            <div className="flex items-center text-sm">
                                <FiArrowUpRight className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                                <span className="text-gray-600">Desde:</span>
                                <span className="ml-1 font-medium text-red-600">{movimiento.Origen_Bodega_Nombre}</span>
                            </div>
                        )}
                        {movimiento.Destino_Bodega_Nombre && (
                            <div className="flex items-center text-sm">
                                <FiArrowDownLeft className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                                <span className="text-gray-600">Hacia:</span>
                                <span className="ml-1 font-medium text-green-600">{movimiento.Destino_Bodega_Nombre}</span>
                            </div>
                        )}
                    </div>

                    {/* Items y cantidad */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <FiPackage className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">Items:</span>
                            <span className="ml-1 font-medium">{movimiento.Total_Items || 0}</span>
                        </div>
                        <div className="text-gray-500">
                            Total: {formatCantidad(movimiento.Total_Cantidad || 0)}
                        </div>
                    </div>

                    {/* Usuario */}
                    {movimiento.Usuario_Nombre_Completo && (
                        <div className="flex items-center text-sm text-gray-600">
                            <FiUser className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{movimiento.Usuario_Nombre_Completo}</span>
                        </div>
                    )}

                    {/* Motivo */}
                    {movimiento.Motivo && (
                        <div className="flex items-start text-sm">
                            <FiFileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-600 break-words">{movimiento.Motivo}</p>
                                {movimiento.Recepcionista && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Recepcionista: {movimiento.Recepcionista}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Renderizar acciones de fila
    const renderRowActions = (movimiento) => (
        <button
            onClick={() => abrirModalDetalle(movimiento)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver detalle"
        >
            <FiEye className="h-4 w-4" />
        </button>
    );



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
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Mobile-First */}
            <div className="bg-white shadow-sm rounded-lg p-4 md:p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Movimientos</h1>
                        <p className="text-sm md:text-base text-gray-600">Gestión de inventario</p>
                    </div>
                    
                    {/* Botones Mobile-First */}
                    <div className="grid grid-cols-2 gap-2 md:flex md:space-x-3 md:gap-0">
                        <button
                            onClick={handleRefresh}
                            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center text-sm font-medium transition-colors md:order-last"
                            title="Actualizar lista"
                        >
                            <FiRefreshCw className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Actualizar</span>
                        </button>
                        <button
                            onClick={() => navigate('/bodegas/movimientos/crear/entrada')}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center text-sm font-medium transition-colors"
                        >
                            <FiArrowDownLeft className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Nueva </span>Entrada
                        </button>
                        <button
                            onClick={() => navigate('/bodegas/movimientos/crear/salida')}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center text-sm font-medium transition-colors"
                        >
                            <FiArrowUpRight className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Nueva </span>Salida
                        </button>
                        <button
                            onClick={() => navigate('/bodegas/movimientos/crear/transferencia')}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center text-sm font-medium transition-colors"
                        >
                            <FiRotateCw className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Nueva </span>Transferencia
                        </button>
                        <button
                            onClick={() => navigate('/bodegas/movimientos/crear/ajuste')}
                            className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center justify-center text-sm font-medium transition-colors"
                        >
                            <FiSettings className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Nuevo </span>Ajuste
                        </button>
                    </div>
                </div>
            </div>

            {/* Métricas Mobile-First */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                        <div className="flex-shrink-0 mb-2 md:mb-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiPackage className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="md:ml-4">
                            <p className="text-xs md:text-sm font-medium text-gray-600">Total</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900">{filteredMovimientos.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                        <div className="flex-shrink-0 mb-2 md:mb-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FiArrowDownLeft className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="md:ml-4">
                            <p className="text-xs md:text-sm font-medium text-gray-600">Entradas</p>
                            <p className="text-lg md:text-2xl font-bold text-green-600">
                                {filteredMovimientos.filter(m => m.Tipo_Movimiento === 'Entrada').length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                        <div className="flex-shrink-0 mb-2 md:mb-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FiArrowUpRight className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                            </div>
                        </div>
                        <div className="md:ml-4">
                            <p className="text-xs md:text-sm font-medium text-gray-600">Salidas</p>
                            <p className="text-lg md:text-2xl font-bold text-red-600">
                                {filteredMovimientos.filter(m => m.Tipo_Movimiento === 'Salida').length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                        <div className="flex-shrink-0 mb-2 md:mb-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiRotateCw className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="md:ml-4">
                            <p className="text-xs md:text-sm font-medium text-gray-600">Transferencias</p>
                            <p className="text-lg md:text-2xl font-bold text-blue-600">
                                {filteredMovimientos.filter(m => m.Tipo_Movimiento === 'Transferencia').length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Búsqueda y Filtros */}
            <SearchAndFilter
                onFilter={handleFilterChange}
                filters={filterOptions}
                currentFilters={filtros}
                totalItems={filteredMovimientos.length}
                searchPlaceholder="Buscar por motivo, usuario, observaciones..."
            />

            {/* Vista Responsiva - Cards en móvil, Tabla en desktop */}
            <ResponsiveDataView
                data={filteredMovimientos}
                columns={columns}
                renderCard={renderMovimientoCard}
                isLoading={loading}
                emptyMessage="No se encontraron movimientos"
                emptyIcon={FiPackage}
                renderRowActions={renderRowActions}
                initialPageSize={25}
                pageSizeOptions={[10, 25, 50, 100]}
                initialSortField="Fecha"
                initialSortDirection="desc"
                rowKeyField="Movimiento_Id"
                mobileBreakpoint="lg"
                onRowClick={(movimiento) => abrirModalDetalle(movimiento)}
                onCardClick={(movimiento) => abrirModalDetalle(movimiento)}
            />

            {/* Modales */}

            {modales.detalle && movimientoSeleccionado && (
                <ModalDetalle
                    isOpen={modales.detalle}
                    onClose={() => cerrarModal('detalle')}
                    movimiento={movimientoSeleccionado}
                />
            )}

            {showConfirmModal && (
                <ConfirmModal
                    isOpen={showConfirmModal}
                    title="Confirmar Movimiento"
                    message={confirmModalConfig.message}
                    confirmText={confirmModalConfig.confirmText}
                    type={confirmModalConfig.type || 'info'}
                    onConfirm={confirmModalConfig.onConfirm}
                    onClose={() => {
                        setShowConfirmModal(false);
                        setConfirmModalConfig({});
                    }}
                />
            )}
        </div>
    );
};

export default MovimientosBodegas;