import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FiUser, 
    FiClock, 
    FiPlus, 
    FiEye, 
    FiEdit, 
    FiFileText, 
    FiPackage,
    FiCalendar,
    FiMapPin,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiRefreshCw
} from 'react-icons/fi';
import { ResponsiveDataView, SearchAndFilter } from '../components/DataTable';
import requerimientoService from '../services/requerimientoService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const MisRequerimientos = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requerimientos, setRequerimientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        estado: '',
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
                
                {req.Estado === 'Pendiente' && (
                    <button 
                        onClick={() => handleCancelar(req.Requerimiento_Id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    );

    // Cargar requerimientos
    const loadRequerimientos = async () => {
        try {
            setIsLoading(true);
            const response = await requerimientoService.getMisRequerimientos(filters);
            console.log('Mis requerimientos loaded:', response);
            
            const requerimientosData = response.data || response || [];
            setRequerimientos(Array.isArray(requerimientosData) ? requerimientosData : []);
        } catch (error) {
            console.error('Error loading mis requerimientos:', error);
            toast.error('Error al cargar los requerimientos');
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
                req.Estado?.toLowerCase().includes(filters.search.toLowerCase());

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

    // Manejar cancelación
    const handleCancelar = async (requerimientoId) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar este requerimiento?')) {
            return;
        }

        try {
            const observaciones = prompt('Ingresa el motivo de la cancelación:');
            if (!observaciones) return;

            await requerimientoService.cancelarRequerimiento(requerimientoId, observaciones);
            toast.success('Requerimiento cancelado exitosamente');
            loadRequerimientos(); // Recargar lista
        } catch (error) {
            console.error('Error cancelando requerimiento:', error);
            toast.error('Error al cancelar el requerimiento');
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadRequerimientos();
    }, []);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="bg-primary/10 rounded-full p-2 sm:p-3">
                            <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mis Requerimientos</h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                {user?.Usuario_Nombre}, gestiona tus solicitudes de inventario
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/requerimientos/crear')}
                        className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>Nuevo Requerimiento</span>
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <SearchAndFilter
                onFilter={handleFilterChange}
                filters={filterOptions}
                currentFilters={filters}
                totalItems={filteredRequerimientos.length}
                searchPlaceholder="Buscar por ID, bodega, estado..."
            />

            {/* Tabla/Tarjetas Responsive */}
            <ResponsiveDataView
                data={filteredRequerimientos}
                columns={columns}
                renderCard={renderCard}
                isLoading={isLoading}
                emptyMessage="No tienes requerimientos aún"
                emptyIcon={FiFileText}
                rowKeyField="Requerimiento_Id"
                pagination={true}
                initialPageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                initialSortField="Fecha"
                initialSortDirection="desc"
                onRowClick={(req) => handleVerDetalle(req.Requerimiento_Id)}
                onCardClick={(req) => handleVerDetalle(req.Requerimiento_Id)}
                mobileBreakpoint="lg"
            />

            {/* Nota informativa si no hay requerimientos */}
            {!isLoading && filteredRequerimientos.length === 0 && requerimientos.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <FiFileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        </div>
                        <div className="text-sm">
                            <p className="text-blue-800 font-medium">¡Comienza creando tu primer requerimiento!</p>
                            <p className="text-blue-700 mt-1">
                                Haz clic en "Nuevo Requerimiento" para solicitar items de inventario de una bodega a otra.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisRequerimientos;