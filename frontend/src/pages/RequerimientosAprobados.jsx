import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    FiPackage,
    FiEye, 
    FiFileText, 
    FiCalendar,
    FiMapPin,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiUsers,
    FiArrowLeft,
    FiTruck
} from 'react-icons/fi';
import { ResponsiveDataView, SearchAndFilter } from '../components/DataTable';
import requerimientoService from '../services/requerimientoService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const RequerimientosAprobados = () => {
    const { auth } = useAuth();
    const user = auth?.user;
    const navigate = useNavigate();
    const location = useLocation();
    
    const [requerimientos, setRequerimientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        bodega_origen_id: '',
        bodega_destino_id: '',
        usuario_solicita_id: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    // Opciones de filtros
    const filterOptions = [
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
            header: 'Fecha Solicitud',
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
            field: 'Usuario_Solicita_Nombre',
            header: 'Usuario Solicita',
            render: (req) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {req.Usuario_Solicita_Nombre} {req.Usuario_Solicita_Apellido}
                    </div>
                </div>
            )
        },
        {
            field: 'bodegas',
            header: 'Origen → Destino',
            render: (req) => (
                <div className="text-sm">
                    <div className="flex items-center text-gray-900">
                        <FiMapPin className="w-3 h-3 mr-1" />
                        <span className="font-medium">{req.Origen_Bodega_Nombre}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{req.Destino_Bodega_Nombre}</span>
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
            field: 'acciones',
            header: 'Acciones',
            width: '120px',
            render: (req) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleVerDetalle(req.Requerimiento_Id)}
                        className="flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                        title="Despachar requerimiento"
                    >
                        <FiTruck className="w-3 h-3 mr-1" />
                        Despachar
                    </button>
                </div>
            )
        }
    ];

    // Función para renderizar cada card en móvil
    const renderCard = (req) => (
        <div 
            key={req.Requerimiento_Id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleVerDetalle(req.Requerimiento_Id)}
        >
            {/* Header del card */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="bg-green-100 rounded-full p-1">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-mono text-sm font-bold text-primary">
                        #{req.Requerimiento_Id}
                    </span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    Aprobado
                </span>
            </div>

            {/* Información principal */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>{new Date(req.Fecha).toLocaleDateString('es-ES')}</span>
                    <span className="ml-2 text-xs">
                        {new Date(req.Fecha).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="w-4 h-4 mr-2" />
                    <span>{req.Usuario_Solicita_Nombre} {req.Usuario_Solicita_Apellido}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <FiMapPin className="w-4 h-4 mr-2" />
                    <span className="font-medium">{req.Origen_Bodega_Nombre}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{req.Destino_Bodega_Nombre}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <FiPackage className="w-4 h-4 mr-2" />
                    <span>{req.Total_Items || 0} items</span>
                </div>
            </div>

            {/* Acciones */}
            <div className="flex space-x-2 pt-3 border-t border-gray-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleVerDetalle(req.Requerimiento_Id);
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                >
                    <FiTruck className="w-4 h-4 mr-1" />
                    Despachar
                </button>
            </div>
        </div>
    );

    // Cargar requerimientos aprobados
    const loadRequerimientos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await requerimientoService.getRequerimientosParaDespacho();
            
            if (response.success) {
                setRequerimientos(response.data || []);
            } else {
                throw new Error(response.message || 'Error al cargar requerimientos');
            }
        } catch (error) {
            console.error('Error loading requerimientos aprobados:', error);
            
            // Manejo de errores específicos
            if (error.status === 403) {
                setError('No tienes permisos para ver los requerimientos aprobados');
            } else if (error.status === 401) {
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente');
                // Opcional: redirigir al login
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(error.message || 'Error al cargar los requerimientos aprobados');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrar requerimientos según criterios de búsqueda
    const filteredRequerimientos = useMemo(() => {
        if (!requerimientos) return [];

        return requerimientos.filter(req => {
            // Filtro de búsqueda por texto
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const matches = (
                    req.Requerimiento_Id.toString().includes(searchTerm) ||
                    (req.Usuario_Solicita_Nombre && req.Usuario_Solicita_Nombre.toLowerCase().includes(searchTerm)) ||
                    (req.Usuario_Solicita_Apellido && req.Usuario_Solicita_Apellido.toLowerCase().includes(searchTerm)) ||
                    (req.Origen_Bodega_Nombre && req.Origen_Bodega_Nombre.toLowerCase().includes(searchTerm)) ||
                    (req.Destino_Bodega_Nombre && req.Destino_Bodega_Nombre.toLowerCase().includes(searchTerm))
                );
                
                if (!matches) return false;
            }

            // Filtro por rango de fechas
            if (filters.fecha_inicio && filters.fecha_fin) {
                const reqFecha = new Date(req.Fecha);
                const fechaInicio = new Date(filters.fecha_inicio);
                const fechaFin = new Date(filters.fecha_fin);
                fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día final
                
                if (reqFecha < fechaInicio || reqFecha > fechaFin) {
                    return false;
                }
            }

            return true;
        });
    }, [requerimientos, filters]);

    // Manejar cambios en filtros
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Manejar ver detalle - redirigir a vista de despacho
    const handleVerDetalle = (requerimientoId) => {
        navigate(`/requerimientos/${requerimientoId}/despacho`);
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadRequerimientos();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
                <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <FiXCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-800">{error}</span>
                </div>
                <button
                    onClick={loadRequerimientos}
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
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-100 rounded-full p-3">
                            <FiCheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Requerimientos Aprobados</h1>
                            <p className="text-gray-600">Requerimientos aprobados listos para despacho</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/bodegas/requerimientos')}
                            className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" />
                            Volver al Dashboard
                        </button>
                    </div>
                </div>

                {/* Resumen rápido */}
                {!isLoading && filteredRequerimientos.length > 0 && (
                    <div className="flex items-center space-x-4 text-sm mt-4">
                        <div className="text-center">
                            <div className="font-bold text-lg text-green-600">{filteredRequerimientos.length}</div>
                            <div className="text-gray-500">Total Aprobados</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filtros */}
            <SearchAndFilter
                onFilter={handleFilterChange}
                filters={filterOptions}
                currentFilters={filters}
                totalItems={filteredRequerimientos.length}
                searchPlaceholder="Buscar por ID, usuario, bodega..."
            />

            {/* Tabla/Tarjetas Responsive */}
            <ResponsiveDataView
                data={filteredRequerimientos}
                columns={columns}
                renderCard={renderCard}
                isLoading={isLoading}
                emptyMessage="No hay requerimientos aprobados"
                emptyDescription="No se encontraron requerimientos en estado aprobado o no coinciden con los filtros aplicados."
                initialPageSize={20}
                pageSizeOptions={[10, 20, 50, 100]}
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
                            <FiTruck className="w-5 h-5 text-blue-600 mt-0.5" />
                        </div>
                        <div className="text-sm">
                            <p className="text-blue-800 font-medium">No hay requerimientos aprobados</p>
                            <p className="text-blue-700 mt-1">
                                Cuando se aprueben requerimientos, aparecerán aquí listos para despacho.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequerimientosAprobados;