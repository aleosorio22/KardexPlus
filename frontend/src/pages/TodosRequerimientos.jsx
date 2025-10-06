import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    FiPackage,
    FiClock, 
    FiEye, 
    FiFileText, 
    FiCalendar,
    FiMapPin,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiUsers,
    FiArrowLeft
} from 'react-icons/fi';
import { ResponsiveDataView, SearchAndFilter } from '../components/DataTable';
import requerimientoService from '../services/requerimientoService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const TodosRequerimientos = () => {
    const { auth } = useAuth();
    const user = auth?.user;
    const navigate = useNavigate();
    const location = useLocation();
    
    const [requerimientos, setRequerimientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        estado: '',
        bodega_origen_id: '',
        bodega_destino_id: '',
        usuario_solicita_id: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    // Opciones de filtros
    const filterOptions = [
        {
            id: 'estado',
            label: 'Estado',
            type: 'select',
            defaultValue: '',
            options: [
                { value: '', label: 'Todos los estados' },
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Aprobado', label: 'Aprobado' },
                { value: 'En_Despacho', label: 'En Despacho' },
                { value: 'Completado', label: 'Completado' },
                { value: 'Parcialmente_Despachado', label: 'Parcialmente Despachado' },
                { value: 'Rechazado', label: 'Rechazado' },
                { value: 'Cancelado', label: 'Cancelado' }
            ]
        },
        {
            id: 'fecha_inicio',
            label: 'Fecha Inicio',
            type: 'date'
        },
        {
            id: 'fecha_fin',
            label: 'Fecha Fin',
            type: 'date'
        }
    ];

    // Función para obtener color del estado
    const getEstadoColor = (estado) => {
        const colors = {
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'Aprobado': 'bg-blue-100 text-blue-800',
            'En_Despacho': 'bg-indigo-100 text-indigo-800',
            'Completado': 'bg-green-100 text-green-800',
            'Parcialmente_Despachado': 'bg-orange-100 text-orange-800',
            'Rechazado': 'bg-red-100 text-red-800',
            'Cancelado': 'bg-gray-100 text-gray-800'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800';
    };

    // Función para obtener ícono del estado
    const getEstadoIcon = (estado) => {
        const icons = {
            'Pendiente': <FiClock className="w-3 h-3" />,
            'Aprobado': <FiCheckCircle className="w-3 h-3" />,
            'En_Despacho': <FiRefreshCw className="w-3 h-3" />,
            'Completado': <FiCheckCircle className="w-3 h-3" />,
            'Parcialmente_Despachado': <FiAlertCircle className="w-3 h-3" />,
            'Rechazado': <FiXCircle className="w-3 h-3" />,
            'Cancelado': <FiXCircle className="w-3 h-3" />
        };
        return icons[estado] || <FiFileText className="w-3 h-3" />;
    };

    // Configuración de columnas para tabla (desktop)
    const columns = [
        {
            field: 'Requerimiento_Id',
            header: 'ID',
            width: '80px',
            render: (req) => (
                <div className="font-mono text-sm font-medium text-gray-900">
                    #{req.Requerimiento_Id}
                </div>
            )
        },
        {
            field: 'Fecha',
            header: 'Fecha',
            render: (req) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {new Date(req.Fecha).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(req.Fecha).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </div>
                </div>
            )
        },
        {
            field: 'usuario',
            header: 'Solicitado por',
            render: (req) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {req.Usuario_Solicita_Nombre} {req.Usuario_Solicita_Apellido}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                        <FiUsers className="w-3 h-3 mr-1" />
                        Usuario
                    </div>
                </div>
            )
        },
        {
            field: 'bodegas',
            header: 'Origen → Destino',
            render: (req) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900 truncate">
                        {req.Origen_Bodega_Nombre}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                        <span>→ {req.Destino_Bodega_Nombre}</span>
                    </div>
                </div>
            )
        },
        {
            field: 'Total_Items',
            header: 'Items',
            width: '80px',
            render: (req) => (
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                        {req.Total_Items || 0}
                    </div>
                    <div className="text-xs text-gray-500">items</div>
                </div>
            )
        },
        {
            field: 'Estado',
            header: 'Estado',
            render: (req) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(req.Estado)}`}>
                    {getEstadoIcon(req.Estado)}
                    <span className="ml-1">{req.Estado.replace('_', ' ')}</span>
                </span>
            )
        },
        {
            field: 'acciones',
            header: 'Acciones',
            width: '120px',
            render: (req) => (
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVerDetalle(req.Requerimiento_Id);
                        }}
                        className="text-primary hover:text-primary/80 p-1 rounded"
                        title="Ver detalle"
                    >
                        <FiEye className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Función para renderizar tarjetas (mobile)
    const renderCard = (req) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-primary">
                        #{req.Requerimiento_Id}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(req.Estado)}`}>
                        {getEstadoIcon(req.Estado)}
                        <span className="ml-1">{req.Estado.replace('_', ' ')}</span>
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(req.Fecha).toLocaleDateString('es-ES')}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{req.Usuario_Solicita_Nombre} {req.Usuario_Solicita_Apellido}</span>
                </div>
                
                <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{req.Origen_Bodega_Nombre}</span>
                    </div>
                    <div className="ml-6 text-xs text-gray-500">
                        → {req.Destino_Bodega_Nombre}
                    </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <FiPackage className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{req.Total_Items || 0} items solicitados</span>
                </div>
            </div>

            {req.Observaciones && (
                <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">
                    <strong>Observaciones:</strong> {req.Observaciones}
                </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <button 
                    onClick={() => handleVerDetalle(req.Requerimiento_Id)}
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1"
                >
                    <FiEye className="w-4 h-4" />
                    <span>Ver detalle</span>
                </button>
            </div>
        </div>
    );

    // Cargar requerimientos
    const loadRequerimientos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await requerimientoService.getRequerimientosTodos(filters);
            console.log('Todos los requerimientos loaded:', response);
            
            const requerimientosData = response.data || response || [];
            setRequerimientos(Array.isArray(requerimientosData) ? requerimientosData : []);
        } catch (error) {
            console.error('Error loading todos los requerimientos:', error);
            
            // Manejar errores específicos
            if (error.status === 403 || error.message?.includes('403')) {
                setError({
                    type: 'permission',
                    message: 'No tienes permisos para ver todos los requerimientos del sistema',
                    suggestion: 'Contacta al administrador para obtener los permisos necesarios'
                });
            } else if (error.status === 401 || error.message?.includes('401')) {
                setError({
                    type: 'auth',
                    message: 'Tu sesión ha expirado',
                    suggestion: 'Por favor inicia sesión nuevamente'
                });
            } else {
                setError({
                    type: 'general',
                    message: 'Error al cargar los requerimientos',
                    suggestion: 'Intenta recargar la página o contacta al soporte técnico'
                });
            }
            
            setRequerimientos([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrar requerimientos
    const filteredRequerimientos = useMemo(() => {
        return requerimientos.filter(req => {
            const matchesSearch = !filters.search || 
                req.Requerimiento_Id.toString().includes(filters.search) ||
                req.Origen_Bodega_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
                req.Destino_Bodega_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
                req.Estado?.toLowerCase().includes(filters.search.toLowerCase()) ||
                req.Usuario_Solicita_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
                req.Usuario_Solicita_Apellido?.toLowerCase().includes(filters.search.toLowerCase());

            const matchesEstado = !filters.estado || req.Estado === filters.estado;

            const matchesFechaInicio = !filters.fecha_inicio || 
                new Date(req.Fecha) >= new Date(filters.fecha_inicio);

            const matchesFechaFin = !filters.fecha_fin || 
                new Date(req.Fecha) <= new Date(filters.fecha_fin);

            return matchesSearch && matchesEstado && matchesFechaInicio && matchesFechaFin;
        });
    }, [requerimientos, filters]);

    // Manejar cambios en filtros
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Manejar ver detalle
    const handleVerDetalle = (requerimientoId) => {
        navigate(`/requerimientos/${requerimientoId}`);
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadRequerimientos();
    }, []);

    // Si hay error, mostrar página de error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                    <div className="mb-4">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <FiAlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error.type === 'permission' ? 'Acceso Denegado' : 
                         error.type === 'auth' ? 'Sesión Expirada' : 'Error'}
                    </h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <p className="text-sm text-gray-500 mb-6">{error.suggestion}</p>
                    <div className="space-y-3">
                        {error.type === 'auth' ? (
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition-colors"
                            >
                                Iniciar Sesión
                            </button>
                        ) : (
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Reintentar
                            </button>
                        )}
                        <button 
                            onClick={() => navigate('/bodegas/requerimientos')}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button 
                            onClick={() => navigate('/bodegas/requerimientos')}
                            className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <FiArrowLeft className="w-5 h-5 mr-2" />
                        </button>
                        <div className="bg-primary/10 rounded-full p-2 sm:p-3">
                            <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Todos los Requerimientos</h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Gestión completa de solicitudes del sistema
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <SearchAndFilter
                onFilter={handleFilterChange}
                filters={filterOptions}
                currentFilters={filters}
                totalItems={filteredRequerimientos.length}
                searchPlaceholder="Buscar por ID, usuario, bodega, estado..."
            />

            {/* Tabla/Tarjetas Responsive */}
            <ResponsiveDataView
                data={filteredRequerimientos}
                columns={columns}
                renderCard={renderCard}
                isLoading={isLoading}
                emptyMessage="No hay requerimientos en el sistema"
                emptyIcon={FiFileText}
                rowKeyField="Requerimiento_Id"
                pagination={true}
                initialPageSize={15}
                pageSizeOptions={[10, 15, 25, 50, 100]}
                initialSortField="Fecha"
                initialSortDirection="desc"
                onRowClick={(req) => handleVerDetalle(req.Requerimiento_Id)}
                onCardClick={(req) => handleVerDetalle(req.Requerimiento_Id)}
                mobileBreakpoint="lg"
            />

            {/* Información adicional */}
            {!isLoading && filteredRequerimientos.length === 0 && requerimientos.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <FiFileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        </div>
                        <div className="text-sm">
                            <p className="text-blue-800 font-medium">No hay requerimientos en el sistema</p>
                            <p className="text-blue-700 mt-1">
                                Los usuarios pueden crear requerimientos desde la sección "Crear Requerimiento".
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodosRequerimientos;