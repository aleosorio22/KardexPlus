import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FiShoppingCart, 
    FiClock, 
    FiAlertCircle, 
    FiCheckCircle,
    FiXCircle,
    FiRefreshCw,
    FiPackage,
    FiUsers,
    FiTrendingUp,
    FiEye,
    FiCalendar,
    FiMapPin
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import requerimientoService from '../services/requerimientoService';
import { toast } from 'react-hot-toast';

const RequerimientosBodegas = () => {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const user = auth?.user;
    const { hasPermission } = usePermissions();
    
    const [estadisticas, setEstadisticas] = useState(null);
    const [requerimientosRecientes, setRequerimientosRecientes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar permisos
    const puedeVerTodos = hasPermission('requerimientos.ver_todos');
    const puedeAprobar = hasPermission('requerimientos.aprobar');
    const puedeDespachar = hasPermission('requerimientos.despachar');
    const puedeVerReportes = hasPermission('requerimientos.reportes');

    // Cargar datos del dashboard
    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Cargar estadísticas y requerimientos recientes
            const [statsResponse, recientesResponse] = await Promise.all([
                requerimientoService.getEstadisticas(),
                puedeVerTodos 
                    ? requerimientoService.getRequerimientosTodos({ limit: 5 })
                    : requerimientoService.getMisRequerimientos({ limit: 5 })
            ]);

            if (statsResponse.success) {
                setEstadisticas(statsResponse.data);
            }

            if (recientesResponse.success) {
                const requerimientosData = recientesResponse.data || recientesResponse || [];
                setRequerimientosRecientes(Array.isArray(requerimientosData) ? requerimientosData.slice(0, 5) : []);
            }

        } catch (error) {
            console.error('Error cargando dashboard:', error);
            
            // Manejar errores específicos como ResumenBodegas
            if (error.status === 403 || error.message?.includes('403')) {
                setError('Error: Acceso denegado. Se requiere el permiso: inventario.ver');
            } else if (error.status === 401 || error.message?.includes('401')) {
                setError('Error: Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            } else {
                setError(error.message || 'Error al cargar los datos del dashboard');
            }
        } finally {
            setIsLoading(false);
        }
    };

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
            'Pendiente': <FiClock className="w-4 h-4" />,
            'Aprobado': <FiCheckCircle className="w-4 h-4" />,
            'En_Despacho': <FiRefreshCw className="w-4 h-4" />,
            'Completado': <FiCheckCircle className="w-4 h-4" />,
            'Parcialmente_Despachado': <FiAlertCircle className="w-4 h-4" />,
            'Rechazado': <FiXCircle className="w-4 h-4" />,
            'Cancelado': <FiXCircle className="w-4 h-4" />
        };
        return icons[estado] || <FiShoppingCart className="w-4 h-4" />;
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
                    ))}
                </div>
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
                    onClick={loadDashboardData}
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
                        <div className="bg-primary/10 rounded-full p-3">
                            <FiShoppingCart className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestión de Requerimientos</h1>
                            <p className="text-gray-600">
                                {puedeVerTodos ? 'Administra todas las solicitudes del sistema' : 'Gestiona solicitudes de inventario'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        {puedeVerTodos && (
                            <button 
                                onClick={() => navigate('/bodegas/requerimientos/todos')}
                                className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <FiEye className="w-4 h-4" />
                                <span>Ver Todos</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sección de Estadísticas comentada temporalmente
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => navigate('/requerimientos/estados/pendientes')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes || 0}</p>
                                <p className="text-xs text-gray-500">Esperando aprobación</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-3">
                                <FiClock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => navigate('/requerimientos/estados/aprobados')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Aprobados</p>
                                <p className="text-2xl font-bold text-blue-600">{estadisticas.aprobados || 0}</p>
                                <p className="text-xs text-gray-500">Listos para despacho</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <FiCheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => navigate('/requerimientos/estados/en-despacho')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {(estadisticas.en_despacho || 0) + (estadisticas.parciales || 0)}
                                </p>
                                <p className="text-xs text-gray-500">En despacho</p>
                            </div>
                            <div className="bg-indigo-100 rounded-full p-3">
                                <FiRefreshCw className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => navigate('/requerimientos/estados/completados')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completados</p>
                                <p className="text-2xl font-bold text-green-600">{estadisticas.completados || 0}</p>
                                <p className="text-xs text-gray-500">Finalizados</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <FiCheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            */}

            {/* Acciones Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pendientes de Aprobación */}
                {puedeAprobar && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Pendientes de Aprobación</h3>
                            <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            {estadisticas?.pendientes || 0} requerimientos esperando tu aprobación
                        </p>
                        <button 
                            onClick={() => navigate('/bodegas/requerimientos/pendientes')}
                            className="w-full bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                            Revisar Pendientes
                        </button>
                    </div>
                )}

                {/* Para Despacho */}
                {puedeDespachar && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Listos para Despacho</h3>
                            <FiPackage className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            {estadisticas?.aprobados || 0} requerimientos aprobados para despachar
                        </p>
                        <button 
                            onClick={() => navigate('/bodegas/requerimientos/aprobados')}
                            className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            Ver Para Despacho
                        </button>
                    </div>
                )}

                {/* Reportes */}
                {puedeVerReportes && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reportes</h3>
                            <FiTrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            Genera reportes y analiza estadísticas de requerimientos
                        </p>
                        <button 
                            onClick={() => navigate('/requerimientos/reportes')}
                            className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            Ver Reportes
                        </button>
                    </div>
                )}
            </div>

            {/* Requerimientos Recientes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Requerimientos Recientes</h3>
                    {puedeVerTodos && (
                        <Link 
                            to="/bodegas/requerimientos/todos" 
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                            Ver todos →
                        </Link>
                    )}
                </div>

                {requerimientosRecientes.length > 0 ? (
                    <div className="space-y-3">
                        {requerimientosRecientes.map((req) => (
                            <div 
                                key={req.Requerimiento_Id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => navigate(`/requerimientos/${req.Requerimiento_Id}`)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-primary/10 rounded-full p-2">
                                        <FiPackage className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-sm font-bold text-primary">
                                                #{req.Requerimiento_Id}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(req.Estado)}`}>
                                                {getEstadoIcon(req.Estado)}
                                                <span className="ml-1">{req.Estado.replace('_', ' ')}</span>
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <span className="flex items-center">
                                                <FiMapPin className="w-3 h-3 mr-1" />
                                                {req.Origen_Bodega_Nombre} → {req.Destino_Bodega_Nombre}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="text-sm text-gray-600 flex items-center">
                                        <FiCalendar className="w-3 h-3 mr-1" />
                                        {new Date(req.Fecha).toLocaleDateString('es-ES')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {req.Total_Items || 0} items
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <FiShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No hay requerimientos recientes</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequerimientosBodegas;
