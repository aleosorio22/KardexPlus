import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiArrowLeft, 
    FiAlertCircle,
    FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import RequerimientoDetalle from '../components/RequerimientoDetalle/RequerimientoDetalle';
import requerimientoService from '../services/requerimientoService';
import { useAuth } from '../context/AuthContext';

const RequerimientoDetallePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [requerimiento, setRequerimiento] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permisos, setPermisos] = useState(null);
    const [accionesDisponibles, setAccionesDisponibles] = useState([]);

    // Cargar datos del requerimiento
    const loadRequerimiento = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await requerimientoService.getRequerimientoById(id);
            console.log('Requerimiento detail loaded:', response);
            
            if (response.success) {
                setRequerimiento(response.data);
                setPermisos(response.permisos_usuario);
                setAccionesDisponibles(response.acciones_disponibles || []);
            } else {
                throw new Error(response.message || 'Error al cargar el requerimiento');
            }
        } catch (error) {
            console.error('Error loading requerimiento detail:', error);
            setError(error.message || 'Error al cargar los detalles del requerimiento');
            
            // Si es un error de permisos, mostrar mensaje específico
            if (error.message?.includes('permisos') || error.message?.includes('acceso')) {
                toast.error('No tienes permisos para ver este requerimiento');
            } else {
                toast.error('Error al cargar los detalles del requerimiento');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Recargar datos después de una acción
    const handleUpdate = () => {
        loadRequerimiento();
    };

    // Manejar cancelación
    const handleCancel = () => {
        handleUpdate();
        toast.success('Requerimiento actualizado');
    };

    // Manejar aprobación
    const handleApprove = async () => {
        try {
            await requerimientoService.aprobarRequerimiento(id);
            toast.success('Requerimiento aprobado exitosamente');
            handleUpdate();
        } catch (error) {
            console.error('Error approving requerimiento:', error);
            toast.error('Error al aprobar el requerimiento');
        }
    };

    // Manejar rechazo
    const handleReject = async () => {
        try {
            const observaciones = prompt('Ingresa el motivo del rechazo:');
            if (!observaciones) return;

            await requerimientoService.rechazarRequerimiento(id, observaciones);
            toast.success('Requerimiento rechazado exitosamente');
            handleUpdate();
        } catch (error) {
            console.error('Error rejecting requerimiento:', error);
            toast.error('Error al rechazar el requerimiento');
        }
    };

    // Manejar despacho
    const handleDispatch = async () => {
        try {
            // TODO: Implementar modal de despacho
            toast.info('Funcionalidad de despacho en desarrollo');
        } catch (error) {
            console.error('Error dispatching requerimiento:', error);
            toast.error('Error al despachar el requerimiento');
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        if (id && !isNaN(id)) {
            loadRequerimiento();
        } else {
            setError('ID de requerimiento inválido');
            setIsLoading(false);
        }
    }, [id]);

    // Error state
    if (error && !isLoading) {
        return (
            <div className="space-y-4">
                <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
                    <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el requerimiento</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/mis-requerimientos')}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" />
                            Volver a Mis Requerimientos
                        </button>
                        
                        <button
                            onClick={loadRequerimiento}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                            <FiRefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Back Button - Mobile */}
            <div className="flex items-center gap-3 sm:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <FiArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    <div className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-200 rounded-lg h-48"></div>
                            <div className="bg-gray-200 rounded-lg h-48"></div>
                        </div>
                        <div className="bg-gray-200 rounded-lg h-64"></div>
                    </div>
                </div>
            )}

            {/* Requerimiento Detail Component */}
            {!isLoading && requerimiento && (
                <>
                    {/* Back Button - Desktop */}
                    <div className="hidden sm:flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </button>
                    </div>

                    <RequerimientoDetalle
                        requerimiento={requerimiento}
                        onUpdate={handleUpdate}
                        onCancel={handleCancel}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDispatch={handleDispatch}
                        isLoading={isLoading}
                        showActions={true}
                    />
                </>
            )}

            {/* Empty State */}
            {!isLoading && !requerimiento && !error && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Requerimiento no encontrado</h3>
                    <p className="text-gray-600 mb-4">
                        El requerimiento que buscas no existe o ha sido eliminado.
                    </p>
                    
                    <button
                        onClick={() => navigate('/mis-requerimientos')}
                        className="flex items-center justify-center mx-auto px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Mis Requerimientos
                    </button>
                </div>
            )}

            {/* Información adicional para desarrollo */}
            {process.env.NODE_ENV === 'development' && permisos && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Información de Desarrollo</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Usuario:</strong> {user?.Usuario_Nombre} (ID: {user?.id})</p>
                        <p><strong>Puede ver:</strong> {permisos.puede_ver ? 'Sí' : 'No'}</p>
                        <p><strong>Es propietario:</strong> {permisos.es_propietario ? 'Sí' : 'No'}</p>
                        <p><strong>Contexto:</strong> {permisos.contexto_acceso}</p>
                        <p><strong>Acciones disponibles:</strong> {accionesDisponibles.join(', ') || 'Ninguna'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequerimientoDetallePage;