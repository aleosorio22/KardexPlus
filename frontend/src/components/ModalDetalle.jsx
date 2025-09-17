import React from 'react';
import { 
    FiX, FiPackage, FiTruck, FiArrowRight, FiEdit3, 
    FiCalendar, FiUser, FiMapPin, FiFileText, FiEye 
} from 'react-icons/fi';

const ModalDetalle = ({ isOpen, onClose, movimiento }) => {
    if (!isOpen || !movimiento) return null;

    const getTipoMovimientoInfo = (tipo) => {
        const tipos = {
            'Entrada': {
                icono: FiPackage,
                color: 'text-green-600 bg-green-100 border-green-200',
                texto: 'Entrada'
            },
            'Salida': {
                icono: FiTruck,
                color: 'text-red-600 bg-red-100 border-red-200',
                texto: 'Salida'
            },
            'Transferencia': {
                icono: FiArrowRight,
                color: 'text-blue-600 bg-blue-100 border-blue-200',
                texto: 'Transferencia'
            },
            'Ajuste': {
                icono: FiEdit3,
                color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
                texto: 'Ajuste'
            }
        };
        return tipos[tipo] || tipos['Entrada'];
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
        if (!cantidad) return '0';
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(cantidad);
    };

    const tipoInfo = getTipoMovimientoInfo(movimiento.Tipo_Movimiento);
    const IconoTipo = tipoInfo.icono;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${tipoInfo.color} mr-3`}>
                                <IconoTipo className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Detalle del Movimiento #{movimiento.Movimiento_Id}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {tipoInfo.texto} • {formatFecha(movimiento.Fecha)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                    {/* Información General */}
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                            <FiFileText className="h-4 w-4 mr-2" />
                            Información General
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Tipo de Movimiento
                                </label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                                        <IconoTipo className="h-3 w-3 mr-1" />
                                        {tipoInfo.texto}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Fecha y Hora
                                </label>
                                <div className="mt-1 flex items-center">
                                    <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-900">{formatFecha(movimiento.Fecha)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Usuario
                                </label>
                                <div className="mt-1 flex items-center">
                                    <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-900">
                                        {movimiento.Usuario_Nombre_Completo || 'No especificado'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Motivo
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {movimiento.Motivo || 'No especificado'}
                                </p>
                            </div>

                            {movimiento.Recepcionista && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Recepcionista
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">{movimiento.Recepcionista}</p>
                                </div>
                            )}

                            {movimiento.Observaciones && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Observaciones
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">{movimiento.Observaciones}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información de Bodegas */}
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                            <FiMapPin className="h-4 w-4 mr-2" />
                            Bodegas
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {movimiento.Origen_Bodega_Nombre && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-red-800">Bodega de Origen</span>
                                    </div>
                                    <p className="text-sm text-red-700 font-medium">
                                        {movimiento.Origen_Bodega_Nombre}
                                    </p>
                                </div>
                            )}

                            {movimiento.Destino_Bodega_Nombre && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-green-800">Bodega de Destino</span>
                                    </div>
                                    <p className="text-sm text-green-700 font-medium">
                                        {movimiento.Destino_Bodega_Nombre}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles de Items */}
                    <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                            <FiPackage className="h-4 w-4 mr-2" />
                            Items del Movimiento
                            {movimiento.detalles && (
                                <span className="ml-2 text-xs text-gray-500">
                                    ({movimiento.detalles.length} items)
                                </span>
                            )}
                        </h4>

                        {movimiento.detalles && movimiento.detalles.length > 0 ? (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cantidad
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Valor Unitario
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Valor Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {movimiento.detalles.map((detalle, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {detalle.Item_Codigo}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {detalle.Item_Descripcion}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="font-medium">
                                                        {formatCantidad(detalle.Cantidad)}
                                                    </span>
                                                    <span className="text-gray-500 ml-1">
                                                        {detalle.Item_Unidad_Medida}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="text-gray-900">
                                                        Q{formatCantidad(detalle.Item_Costo_Unitario)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="font-medium text-gray-900">
                                                        Q{formatCantidad(detalle.Valor_Total)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay detalles</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No se encontraron items para este movimiento.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Resumen */}
                    {movimiento.detalles && movimiento.detalles.length > 0 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900">
                                    Resumen del movimiento
                                </span>
                                <div className="text-right">
                                    <div className="text-sm text-gray-900">
                                        <span className="font-medium">
                                            {movimiento.detalles.length}
                                        </span>
                                        <span className="text-gray-500 ml-1">
                                            {movimiento.detalles.length === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Cantidad total: {formatCantidad(
                                            movimiento.detalles.reduce((sum, d) => sum + (d.Cantidad || 0), 0)
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        Valor total: Q{formatCantidad(
                                            movimiento.detalles.reduce((sum, d) => sum + (d.Valor_Total || 0), 0)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-white">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalle;