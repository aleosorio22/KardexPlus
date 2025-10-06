import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiPackage, FiUser, FiCalendar, FiMapPin, FiEdit3, FiCheck, FiX } from 'react-icons/fi';
import requerimientoService from '../services/requerimientoService';
import ConfirmModal from '../components/ConfirmModal';

const RequerimientoDetalleDespacho = () => {
    const { id: requerimientoId } = useParams(); // Cambiar de requerimientoId a id
    const navigate = useNavigate();
    
    const [requerimiento, setRequerimiento] = useState(null);
    const [itemsDespacho, setItemsDespacho] = useState([]);
    const [observacionesDespacho, setObservacionesDespacho] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({});
    
    // Estados para modal de advertencia
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningModalConfig, setWarningModalConfig] = useState({});

    useEffect(() => {
        if (requerimientoId) {
            cargarRequerimiento();
        } else {
            console.error('❌ No se proporcionó ID de requerimiento');
            setError('ID de requerimiento no válido');
            setLoading(false);
        }
    }, [requerimientoId]);

    const cargarRequerimiento = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await requerimientoService.getRequerimientoById(requerimientoId);
            
            if (response.success) {
                const reqData = response.data;
                setRequerimiento(reqData);
                
                // Verificar que hay items
                if (!reqData.detalle || !Array.isArray(reqData.detalle) || reqData.detalle.length === 0) {
                    setError('Este requerimiento no tiene items para despachar');
                    return;
                }
                
                // Preparar items para despacho con cantidades editables
                const itemsParaDespacho = reqData.detalle.map(item => {
                    const cantidadSolicitada = parseFloat(item.Cantidad_Solicitada) || 0;
                    const cantidadDespachada = parseFloat(item.Cantidad_Despachada) || 0;
                    const cantidadPendiente = cantidadSolicitada - cantidadDespachada;
                    
                    // Para presentaciones
                    const cantidadSolicitadaPres = parseFloat(item.Cantidad_Solicitada_Presentacion) || 0;
                    const cantidadDespachadaPres = parseFloat(item.Cantidad_Despachada_Presentacion) || 0;
                    const cantidadPendientePres = cantidadSolicitadaPres - cantidadDespachadaPres;
                    
                    return {
                        Item_Id: item.Item_Id,
                        Item_Codigo: item.Item_Codigo || 'SIN_CODIGO',
                        Item_Descripcion: item.Item_Descripcion || 'Descripción no disponible',
                        Cantidad_Solicitada: cantidadSolicitada,
                        Cantidad_Despachada_Anterior: cantidadDespachada,
                        Cantidad_Pendiente: Math.max(0, cantidadPendiente),
                        
                        // Campos editables para el despacho (inicializar con 0, el usuario debe especificar)
                        Cantidad_Despachada: 0,
                        
                        // Campos de presentación
                        Es_Requerimiento_Por_Presentacion: Boolean(item.Es_Requerimiento_Por_Presentacion),
                        Item_Presentaciones_Id: item.Item_Presentaciones_Id || null,
                        Presentacion_Nombre: item.Presentacion_Nombre || null,
                        Presentacion_Unidad_Prefijo: item.Presentacion_Nombre || null, // Usar el nombre si no hay prefijo específico
                        Presentacion_Cantidad_Base: parseFloat(item.Cantidad_Base) || 1, // El backend devuelve esto como Cantidad_Base
                        
                        // Campos para cantidades por presentación
                        Cantidad_Solicitada_Presentacion: cantidadSolicitadaPres,
                        Cantidad_Despachada_Presentacion_Anterior: cantidadDespachadaPres,
                        Cantidad_Despachada_Presentacion: 0, // Inicializar con 0
                        
                        // Unidades
                        UnidadMedida_Prefijo: item.UnidadMedida_Prefijo || 'Und'
                    };
                });
                
                setItemsDespacho(itemsParaDespacho);
            } else {
                setError(response.message || 'Error al cargar requerimiento - respuesta no exitosa');
            }
        } catch (error) {
            console.error('❌ Error cargando requerimiento:', error);
            
            let errorMessage = 'Error al cargar los datos del requerimiento';
            
            if (error.status === 403) {
                errorMessage = 'No tienes permisos para ver este requerimiento';
            } else if (error.status === 404) {
                errorMessage = 'Requerimiento no encontrado';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            // No navegar automáticamente, dejar que el usuario decida
        } finally {
            setLoading(false);
        }
    };

    const handleCantidadChange = (itemId, nuevaCantidad, esPorPresentacion = false) => {
        setItemsDespacho(prevItems => 
            prevItems.map(item => {
                if (item.Item_Id !== itemId) return item;
                
                const cantidad = parseFloat(nuevaCantidad) || 0;
                
                if (esPorPresentacion) {
                    // Edición por presentación
                    const cantidadMaxPresentacion = (item.Cantidad_Solicitada_Presentacion || 0) - (item.Cantidad_Despachada_Presentacion_Anterior || 0);
                    const cantidadValidaPresentacion = Math.min(Math.max(0, cantidad), cantidadMaxPresentacion);
                    
                    return {
                        ...item,
                        Cantidad_Despachada_Presentacion: cantidadValidaPresentacion,
                        // Recalcular cantidad base
                        Cantidad_Despachada: cantidadValidaPresentacion * (item.Presentacion_Cantidad_Base || 1)
                    };
                } else {
                    // Edición por unidad base
                    const cantidadMaxBase = item.Cantidad_Pendiente || 0;
                    const cantidadValidaBase = Math.min(Math.max(0, cantidad), cantidadMaxBase);
                    
                    return {
                        ...item,
                        Cantidad_Despachada: cantidadValidaBase,
                        // Si es por presentación, recalcular cantidad presentación
                        Cantidad_Despachada_Presentacion: item.Es_Requerimiento_Por_Presentacion && item.Presentacion_Cantidad_Base > 0 ?
                            Math.floor(cantidadValidaBase / item.Presentacion_Cantidad_Base) : 0
                    };
                }
            })
        );
    };

    const validarDespacho = () => {
        // Verificar que haya al menos un item con cantidad a despachar
        const itemsConCantidad = itemsDespacho.filter(item => {
            if (item.Es_Requerimiento_Por_Presentacion) {
                return (item.Cantidad_Despachada_Presentacion || 0) > 0;
            } else {
                return (item.Cantidad_Despachada || 0) > 0;
            }
        });

        if (itemsConCantidad.length === 0) {
            toast.error('Debe especificar cantidad a despachar para al menos un item');
            return false;
        }

        // Verificar que las cantidades no excedan las pendientes
        for (const item of itemsDespacho) {
            if (item.Es_Requerimiento_Por_Presentacion) {
                const maxPresentacion = (item.Cantidad_Solicitada_Presentacion || 0) - (item.Cantidad_Despachada_Presentacion_Anterior || 0);
                if ((item.Cantidad_Despachada_Presentacion || 0) > maxPresentacion) {
                    toast.error(`Cantidad a despachar de ${item.Item_Descripcion} excede la cantidad pendiente (${maxPresentacion} ${item.Presentacion_Unidad_Prefijo})`);
                    return false;
                }
            } else {
                if ((item.Cantidad_Despachada || 0) > (item.Cantidad_Pendiente || 0)) {
                    toast.error(`Cantidad a despachar de ${item.Item_Descripcion} excede la cantidad pendiente (${item.Cantidad_Pendiente} ${item.UnidadMedida_Prefijo})`);
                    return false;
                }
            }
        }

        return true;
    };

    const confirmarDespacho = () => {
        if (!validarDespacho()) {
            return;
        }

        // Preparar resumen para confirmación
        const itemsParaDespachar = itemsDespacho.filter(item => {
            return item.Es_Requerimiento_Por_Presentacion ? 
                (item.Cantidad_Despachada_Presentacion || 0) > 0 :
                (item.Cantidad_Despachada || 0) > 0;
        });

        const resumenItems = itemsParaDespachar.map(item => {
            if (item.Es_Requerimiento_Por_Presentacion) {
                return `• ${item.Item_Descripcion}: ${item.Cantidad_Despachada_Presentacion} ${item.Presentacion_Unidad_Prefijo}`;
            } else {
                return `• ${item.Item_Descripcion}: ${item.Cantidad_Despachada} ${item.UnidadMedida_Prefijo}`;
            }
        }).join('\n');

        setConfirmModalConfig({
            title: 'Confirmar Despacho',
            message: `¿Está seguro que desea despachar los siguientes items?\n\n${resumenItems}${observacionesDespacho ? `\n\nObservaciones: ${observacionesDespacho}` : ''}\n\nEsta acción verificará el stock disponible antes de proceder.`,
            confirmText: 'Confirmar Despacho',
            cancelText: 'Cancelar',
            type: 'success',
            onConfirm: ejecutarDespacho
        });
        setShowConfirmModal(true);
    };

    const ejecutarDespacho = async () => {
        try {
            setSaving(true);
            setShowConfirmModal(false);

            // Preparar datos para el backend
            const itemsParaBackend = itemsDespacho
                .filter(item => {
                    return item.Es_Requerimiento_Por_Presentacion ? 
                        (item.Cantidad_Despachada_Presentacion || 0) > 0 :
                        (item.Cantidad_Despachada || 0) > 0;
                })
                .map(item => ({
                    Item_Id: item.Item_Id,
                    Cantidad_Despachada: item.Cantidad_Despachada || 0,
                    Cantidad_Despachada_Presentacion: item.Es_Requerimiento_Por_Presentacion ? 
                        (item.Cantidad_Despachada_Presentacion || 0) : null
                }));

            const response = await requerimientoService.despacharRequerimiento(
                requerimientoId,
                itemsParaBackend,
                observacionesDespacho
            );

            if (response.success) {
                // Verificar si hay advertencias sobre el movimiento
                if (response.data && response.data.warning_movimiento) {
                    // Mostrar modal de advertencia
                    setWarningModalConfig({
                        title: 'Despacho Completado con Advertencia',
                        message: `✅ ${response.message}\n\n⚠️ ADVERTENCIA IMPORTANTE:\n${response.data.warning_movimiento.descripcion}\n\n🔧 Información técnica:\n${response.data.warning_movimiento.error}\n\nEl requerimiento ha sido despachado correctamente, pero deberá crear manualmente el movimiento de transferencia si es necesario.`,
                        confirmText: 'He leído y entiendo',
                        cancelText: null, // No mostrar botón cancelar
                        type: 'warning',
                        onConfirm: () => {
                            setShowWarningModal(false);
                            navigate('/bodegas/requerimientos/aprobados');
                        }
                    });
                    setShowWarningModal(true);
                } else {
                    // Despacho exitoso sin advertencias
                    toast.success(response.message || 'Requerimiento despachado exitosamente');
                    navigate('/bodegas/requerimientos/aprobados');
                }
            } else {
                toast.error(response.message || 'Error al despachar requerimiento');
            }
        } catch (error) {
            console.error('Error despachando requerimiento:', error);
            
            // Manejo específico de errores de stock insuficiente
            if (error.status === 400 && error.message && error.message.includes('Stock insuficiente')) {
                // Error de validación de stock - mostrar modal informativo
                setWarningModalConfig({
                    title: 'Error de Stock Insuficiente',
                    message: `❌ No se puede completar el despacho:\n\n${error.message}\n\nVerifique el stock disponible en la bodega origen y ajuste las cantidades antes de intentar nuevamente.`,
                    confirmText: 'Entendido',
                    cancelText: null,
                    type: 'danger',
                    onConfirm: () => setShowWarningModal(false)
                });
                setShowWarningModal(true);
            } else if (error.status === 403) {
                toast.error('No tienes permisos para despachar este requerimiento');
            } else if (error.status === 404) {
                toast.error('Requerimiento no encontrado');
            } else {
                toast.error(error.message || 'Error al despachar requerimiento');
            }
        } finally {
            setSaving(false);
        }
    };

    const renderItemRow = (item, index) => {
        const cantidadMaxPresentacion = item.Es_Requerimiento_Por_Presentacion ?
            (item.Cantidad_Solicitada_Presentacion || 0) - (item.Cantidad_Despachada_Presentacion_Anterior || 0) : 0;
        
        return (
            <div key={item.Item_Id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Header del item */}
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <FiPackage className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.Item_Codigo}</span>
                        </div>
                        <h3 className="text-xs sm:text-sm text-gray-700 leading-tight">{item.Item_Descripcion}</h3>
                    </div>
                </div>

                {/* Información de cantidades */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                        <span className="text-gray-500 block">Solicitado:</span>
                        <div className="font-medium text-sm sm:text-base">
                            {item.Es_Requerimiento_Por_Presentacion ? 
                                `${item.Cantidad_Solicitada_Presentacion} ${item.Presentacion_Unidad_Prefijo}` :
                                `${item.Cantidad_Solicitada} ${item.UnidadMedida_Prefijo}`
                            }
                        </div>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                        <span className="text-gray-500 block">Ya despachado:</span>
                        <div className="font-medium text-sm sm:text-base">
                            {item.Es_Requerimiento_Por_Presentacion ? 
                                `${item.Cantidad_Despachada_Presentacion_Anterior} ${item.Presentacion_Unidad_Prefijo}` :
                                `${item.Cantidad_Despachada_Anterior} ${item.UnidadMedida_Prefijo}`
                            }
                        </div>
                    </div>
                    <div className="bg-orange-50 p-2 sm:p-3 rounded-md">
                        <span className="text-gray-500 block">Pendiente:</span>
                        <div className="font-medium text-orange-600 text-sm sm:text-base">
                            {item.Es_Requerimiento_Por_Presentacion ? 
                                `${cantidadMaxPresentacion} ${item.Presentacion_Unidad_Prefijo}` :
                                `${item.Cantidad_Pendiente} ${item.UnidadMedida_Prefijo}`
                            }
                        </div>
                    </div>
                </div>

                {/* Campos de edición */}
                <div className="border-t pt-3 sm:pt-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        <FiEdit3 className="inline mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                        Cantidad a despachar:
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {item.Es_Requerimiento_Por_Presentacion ? (
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max={cantidadMaxPresentacion}
                                        step="0.01"
                                        value={item.Cantidad_Despachada_Presentacion || ''}
                                        onChange={(e) => handleCantidadChange(item.Item_Id, e.target.value, true)}
                                        className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                        {item.Presentacion_Unidad_Prefijo}
                                    </span>
                                </div>
                                {item.Presentacion_Cantidad_Base && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        = {(item.Cantidad_Despachada_Presentacion || 0) * item.Presentacion_Cantidad_Base} {item.UnidadMedida_Prefijo} (unidades base)
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max={item.Cantidad_Pendiente}
                                        step="0.01"
                                        value={item.Cantidad_Despachada || ''}
                                        onChange={(e) => handleCantidadChange(item.Item_Id, e.target.value, false)}
                                        className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                        {item.UnidadMedida_Prefijo}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <button
                            type="button"
                            onClick={() => {
                                if (item.Es_Requerimiento_Por_Presentacion) {
                                    handleCantidadChange(item.Item_Id, cantidadMaxPresentacion, true);
                                } else {
                                    handleCantidadChange(item.Item_Id, item.Cantidad_Pendiente, false);
                                }
                            }}
                            className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors text-xs sm:text-sm whitespace-nowrap"
                        >
                            Máximo
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 px-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 text-center text-sm sm:text-base">Cargando requerimiento...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/bodegas/requerimientos/aprobados')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                    >
                        <FiArrowLeft className="text-gray-600 w-5 h-5" />
                    </button>
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Error al cargar requerimiento</h1>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FiX className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
                        <span className="text-red-800 text-sm sm:text-base">{error}</span>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={() => {
                                setError(null);
                                cargarRequerimiento();
                            }}
                            className="w-full sm:w-auto px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => navigate('/bodegas/requerimientos/aprobados')}
                            className="w-full sm:w-auto px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!requerimiento) {
        return (
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/bodegas/requerimientos/aprobados')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                    >
                        <FiArrowLeft className="text-gray-600 w-5 h-5" />
                    </button>
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Requerimiento no encontrado</h1>
                </div>
                
                <div className="text-center py-8">
                    <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base px-4">El requerimiento solicitado no existe o no tienes permisos para verlo</p>
                    <button
                        onClick={() => navigate('/bodegas/requerimientos/aprobados')}
                        className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                    >
                        Volver a Requerimientos Aprobados
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => navigate('/bodegas/requerimientos/aprobados')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0 mt-1 sm:mt-0"
                    >
                        <FiArrowLeft className="text-gray-600 w-5 h-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                            Despacho #{requerimiento.Requerimiento_Id}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Modifique las cantidades según lo que va a despachar
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center justify-end sm:justify-start">
                    <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                        requerimiento.Estado === 'Aprobado' ? 'bg-blue-100 text-blue-800' :
                        requerimiento.Estado === 'En_Despacho' ? 'bg-indigo-100 text-indigo-800' :
                        requerimiento.Estado === 'Parcialmente_Despachado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {requerimiento.Estado}
                    </span>
                </div>
            </div>

            {/* Información del requerimiento */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                        <FiUser className="text-blue-500 w-5 h-5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Solicitado por</p>
                            <p className="font-medium text-sm sm:text-base truncate">
                                {requerimiento.Usuario_Solicita_Nombre} {requerimiento.Usuario_Solicita_Apellido}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <FiCalendar className="text-green-500 w-5 h-5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Fecha solicitud</p>
                            <p className="font-medium text-sm sm:text-base">
                                {new Date(requerimiento.Fecha).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <FiMapPin className="text-orange-500 w-5 h-5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Desde</p>
                            <p className="font-medium text-sm sm:text-base truncate">{requerimiento.Origen_Bodega_Nombre}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <FiMapPin className="text-purple-500 w-5 h-5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Hacia</p>
                            <p className="font-medium text-sm sm:text-base truncate">{requerimiento.Destino_Bodega_Nombre}</p>
                        </div>
                    </div>
                </div>
                
                {requerimiento.Motivo && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-xs sm:text-sm text-gray-500">Motivo</p>
                        <p className="text-gray-700 text-sm sm:text-base">{requerimiento.Motivo}</p>
                    </div>
                )}
            </div>

            {/* Lista de items para despacho */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 sm:p-6 border-b">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Items del Requerimiento ({itemsDespacho.length})
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Ajuste las cantidades que va a despachar para cada item
                    </p>
                    {itemsDespacho.some(item => (item.Cantidad_Despachada || 0) > 0 || (item.Cantidad_Despachada_Presentacion || 0) > 0) && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-xs sm:text-sm text-blue-800">
                                ✅ {itemsDespacho.filter(item => 
                                    item.Es_Requerimiento_Por_Presentacion ? 
                                        (item.Cantidad_Despachada_Presentacion || 0) > 0 :
                                        (item.Cantidad_Despachada || 0) > 0
                                ).length} item(s) con cantidades para despachar
                            </p>
                        </div>
                    )}
                </div>
                
                <div className="p-4 sm:p-6 space-y-4">
                    {itemsDespacho.map((item, index) => renderItemRow(item, index))}
                </div>
            </div>

            {/* Observaciones de despacho */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones del despacho (opcional)
                </label>
                <textarea
                    value={observacionesDespacho}
                    onChange={(e) => setObservacionesDespacho(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Agregue cualquier observación sobre el despacho..."
                />
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                    onClick={() => navigate('/bodegas/requerimientos/aprobados')}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm sm:text-base font-medium"
                    disabled={saving}
                >
                    <FiX className="inline mr-2 w-4 h-4" />
                    Cancelar
                </button>
                
                <button
                    onClick={confirmarDespacho}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 rounded-md transition-colors text-sm sm:text-base font-medium"
                >
                    {saving ? (
                        <>
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Despachando...
                        </>
                    ) : (
                        <>
                            <FiCheck className="inline mr-2 w-4 h-4" />
                            Confirmar Despacho
                        </>
                    )}
                </button>
            </div>

            {/* Modal de confirmación */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmModalConfig.onConfirm}
                title={confirmModalConfig.title}
                message={confirmModalConfig.message}
                confirmText={confirmModalConfig.confirmText}
                cancelText={confirmModalConfig.cancelText}
                type={confirmModalConfig.type}
            />

            {/* Modal de advertencia */}
            <ConfirmModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onConfirm={warningModalConfig.onConfirm}
                title={warningModalConfig.title}
                message={warningModalConfig.message}
                confirmText={warningModalConfig.confirmText}
                cancelText={warningModalConfig.cancelText}
                type={warningModalConfig.type}
            />
        </div>
    );
};

export default RequerimientoDetalleDespacho;