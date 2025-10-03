import React, { useState } from 'react';
import { 
    FiPackage, 
    FiUser, 
    FiCalendar, 
    FiMapPin, 
    FiFileText, 
    FiCheck, 
    FiX, 
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiEdit,
    FiDownload,
    FiPrinter,
    FiArrowRight,
    FiBox,
    FiTag
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import requerimientoService from '../../services/requerimientoService';

const RequerimientoDetalle = ({ 
    requerimiento, 
    onUpdate, 
    onCancel, 
    onApprove, 
    onReject, 
    onDispatch,
    isLoading = false,
    showActions = true 
}) => {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    // Función para obtener color del estado
    const getEstadoColor = (estado) => {
        const colors = {
            'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Aprobado': 'bg-blue-100 text-blue-800 border-blue-200',
            'En_Despacho': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'Completado': 'bg-green-100 text-green-800 border-green-200',
            'Parcialmente_Despachado': 'bg-orange-100 text-orange-800 border-orange-200',
            'Rechazado': 'bg-red-100 text-red-800 border-red-200',
            'Cancelado': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
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
        return icons[estado] || <FiFileText className="w-4 h-4" />;
    };

    // Función para obtener descripción del estado
    const getEstadoDescripcion = (estado) => {
        const descripciones = {
            'Pendiente': 'Esperando aprobación',
            'Aprobado': 'Listo para despacho',
            'En_Despacho': 'En proceso de despacho',
            'Completado': 'Despacho completo',
            'Parcialmente_Despachado': 'Despacho parcial',
            'Rechazado': 'Solicitud rechazada',
            'Cancelado': 'Solicitud cancelada'
        };
        return descripciones[estado] || 'Estado desconocido';
    };

    // Manejar cancelación
    const handleCancelar = async () => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar este requerimiento?')) {
            return;
        }

        try {
            setIsProcessing(true);
            const observaciones = prompt('Ingresa el motivo de la cancelación:');
            if (!observaciones) return;

            await requerimientoService.cancelarRequerimiento(requerimiento.Requerimiento_Id, observaciones);
            toast.success('Requerimiento cancelado exitosamente');
            if (onCancel) onCancel();
        } catch (error) {
            console.error('Error cancelando requerimiento:', error);
            toast.error('Error al cancelar el requerimiento');
        } finally {
            setIsProcessing(false);
        }
    };

    // Calcular progreso del despacho
    const getDespachoProgress = () => {
        if (!requerimiento.detalle || requerimiento.detalle.length === 0) return { percentage: 0, items: 0, total: 0 };
        
        const total = requerimiento.detalle.length;
        const completados = requerimiento.detalle.filter(item => 
            item.Cantidad_Despachada >= item.Cantidad_Solicitada
        ).length;
        
        return {
            percentage: total > 0 ? Math.round((completados / total) * 100) : 0,
            items: completados,
            total: total
        };
    };

    const progress = getDespachoProgress();

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="bg-gray-200 rounded-lg h-32"></div>
                <div className="bg-gray-200 rounded-lg h-64"></div>
                <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
        );
    }

    if (!requerimiento) {
        return (
            <div className="text-center py-8">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Requerimiento no encontrado</h3>
                <p className="text-gray-600">No se pudo cargar la información del requerimiento.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header del Requerimiento */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-primary/10 rounded-full p-2">
                                <FiPackage className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Requerimiento #{requerimiento.Requerimiento_Id}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Solicitado el {new Date(requerimiento.Fecha).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Estado y Progreso */}
                        <div className="space-y-3">
                            <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getEstadoColor(requerimiento.Estado)}`}>
                                {getEstadoIcon(requerimiento.Estado)}
                                <span className="ml-2 font-medium">{requerimiento.Estado.replace('_', ' ')}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                                {getEstadoDescripcion(requerimiento.Estado)}
                            </p>

                            {/* Barra de Progreso */}
                            {(requerimiento.Estado === 'En_Despacho' || 
                              requerimiento.Estado === 'Parcialmente_Despachado' || 
                              requerimiento.Estado === 'Completado') && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Progreso del despacho</span>
                                        <span className="font-medium">{progress.items}/{progress.total} items</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-primary rounded-full h-2 transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {progress.percentage}% completado
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones (Mobile: Stack, Desktop: Horizontal) */}
                    {showActions && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            {requerimiento.Estado === 'Pendiente' && (
                                <>
                                    <button 
                                        onClick={handleCancelar}
                                        disabled={isProcessing}
                                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                                    >
                                        <FiX className="w-4 h-4 mr-2" />
                                        Cancelar
                                    </button>
                                    <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                        <FiEdit className="w-4 h-4 mr-2" />
                                        Editar
                                    </button>
                                </>
                            )}
                            
                            <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                <FiDownload className="w-4 h-4 mr-2" />
                                Exportar
                            </button>
                            
                            <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                <FiPrinter className="w-4 h-4 mr-2" />
                                Imprimir
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Información General */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Información de Bodegas */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiMapPin className="w-5 h-5 mr-2 text-gray-500" />
                        Transferencia
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bodega Origen</div>
                                <div className="font-medium text-gray-900">{requerimiento.Origen_Bodega_Nombre}</div>
                            </div>
                            <FiArrowRight className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bodega Destino</div>
                                <div className="font-medium text-gray-900">{requerimiento.Destino_Bodega_Nombre}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información de Usuario */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUser className="w-5 h-5 mr-2 text-gray-500" />
                        Responsables
                    </h3>
                    
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Solicitado por</div>
                            <div className="font-medium text-gray-900">
                                {requerimiento.Usuario_Solicita_Nombre} {requerimiento.Usuario_Solicita_Apellido}
                            </div>
                        </div>
                        
                        {requerimiento.Usuario_Aprueba_Nombre && (
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aprobado por</div>
                                <div className="font-medium text-gray-900">
                                    {requerimiento.Usuario_Aprueba_Nombre} {requerimiento.Usuario_Aprueba_Apellido}
                                </div>
                            </div>
                        )}
                        
                        {requerimiento.Usuario_Despacha_Nombre && (
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Despachado por</div>
                                <div className="font-medium text-gray-900">
                                    {requerimiento.Usuario_Despacha_Nombre} {requerimiento.Usuario_Despacha_Apellido}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Observaciones */}
            {requerimiento.Observaciones && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiFileText className="w-5 h-5 mr-2 text-gray-500" />
                        Observaciones
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{requerimiento.Observaciones}</p>
                </div>
            )}

            {/* Items Solicitados */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBox className="w-5 h-5 mr-2 text-gray-500" />
                    Items Solicitados ({requerimiento.detalle?.length || 0})
                </h3>
                
                {requerimiento.detalle && requerimiento.detalle.length > 0 ? (
                    <div className="space-y-3 sm:space-y-0">
                        {/* Vista Mobile: Tarjetas */}
                        <div className="block sm:hidden space-y-3">
                            {requerimiento.detalle.map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.Item_Nombre}</h4>
                                            {item.Item_Codigo && (
                                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                                    <FiTag className="w-3 h-3 mr-1" />
                                                    {item.Item_Codigo}
                                                </p>
                                            )}
                                            {item.CategoriaItem_Nombre && (
                                                <p className="text-xs text-gray-500 mt-1">{item.CategoriaItem_Nombre}</p>
                                            )}
                                            {item.Es_Requerimiento_Por_Presentacion && item.Presentacion_Nombre && (
                                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                                    <FiBox className="w-3 h-3 mr-1" />
                                                    Presentación: {item.Presentacion_Nombre}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.Es_Requerimiento_Por_Presentacion ? (
                                                    <div className="space-y-1">
                                                        <div className="text-primary font-medium">
                                                            {item.Cantidad_Solicitada_Presentacion} {item.Presentacion_Nombre}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            = {item.Cantidad_Solicitada} {item.UnidadMedida_Prefijo || 'unidades'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {item.Cantidad_Solicitada} {item.UnidadMedida_Prefijo || 'unidades'}
                                                    </div>
                                                )}
                                            </div>
                                            {item.Cantidad_Despachada > 0 && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    Despachado: {item.Cantidad_Despachada} {item.UnidadMedida_Prefijo || 'u'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Barra de progreso del item */}
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progreso</span>
                                            <span>
                                                {Math.round((item.Cantidad_Despachada / item.Cantidad_Solicitada) * 100) || 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className={`rounded-full h-1.5 transition-all duration-300 ${
                                                    item.Cantidad_Despachada >= item.Cantidad_Solicitada 
                                                        ? 'bg-green-500' 
                                                        : item.Cantidad_Despachada > 0 
                                                            ? 'bg-orange-500' 
                                                            : 'bg-gray-300'
                                                }`}
                                                style={{ 
                                                    width: `${Math.min(((item.Cantidad_Despachada || 0) / item.Cantidad_Solicitada) * 100, 100)}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vista Desktop: Tabla */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad Solicitada
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Despachado
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requerimiento.detalle.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{item.Item_Nombre}</div>
                                                    {item.Item_Codigo && (
                                                        <div className="text-xs text-gray-500 flex items-center">
                                                            <FiTag className="w-3 h-3 mr-1" />
                                                            {item.Item_Codigo}
                                                        </div>
                                                    )}
                                                    {item.Es_Requerimiento_Por_Presentacion && item.Presentacion_Nombre && (
                                                        <div className="text-xs text-green-600 mt-1 flex items-center">
                                                            <FiBox className="w-3 h-3 mr-1" />
                                                            Presentación: {item.Presentacion_Nombre}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {item.CategoriaItem_Nombre || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.Es_Requerimiento_Por_Presentacion ? (
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-primary">
                                                            {item.Cantidad_Solicitada_Presentacion} {item.Presentacion_Nombre}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            = {item.Cantidad_Solicitada} {item.UnidadMedida_Prefijo || 'u'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-900">
                                                        {item.Cantidad_Solicitada} {item.UnidadMedida_Prefijo || 'u'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-900">
                                                {item.Cantidad_Despachada || 0} {item.UnidadMedida_Prefijo || 'u'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.Cantidad_Despachada >= item.Cantidad_Solicitada ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <FiCheck className="w-3 h-3 mr-1" />
                                                        Completo
                                                    </span>
                                                ) : item.Cantidad_Despachada > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        <FiClock className="w-3 h-3 mr-1" />
                                                        Parcial
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <FiClock className="w-3 h-3 mr-1" />
                                                        Pendiente
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <FiBox className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No hay items registrados para este requerimiento</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequerimientoDetalle;