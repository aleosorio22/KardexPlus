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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                {/* Header - Mobile optimized */}
                <div className="bg-gray-50 p-3 sm:px-6 sm:py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                            <div className={`p-1.5 sm:p-2 rounded-lg ${tipoInfo.color} flex-shrink-0`}>
                                <IconoTipo className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                                    Movimiento #{movimiento.Movimiento_Id}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                    {tipoInfo.texto} • {formatFecha(movimiento.Fecha)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-2 p-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                            <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto">
                    {/* Información General - Mobile first */}
                    <div className="p-3 sm:p-6 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
                            <FiFileText className="h-4 w-4 mr-2" />
                            Información General
                        </h4>
                        
                        {/* Mobile: Stack layout, Desktop: Grid */}
                        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                            <div className="bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                    Tipo de Movimiento
                                </label>
                                <div>
                                    <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                                        <IconoTipo className="h-3 w-3 mr-1" />
                                        {tipoInfo.texto}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                    Fecha y Hora
                                </label>
                                <div className="flex items-center">
                                    <FiCalendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-900">{formatFecha(movimiento.Fecha)}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                    Usuario
                                </label>
                                <div className="flex items-center">
                                    <FiUser className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-900 truncate">
                                        {movimiento.Usuario_Nombre_Completo || 'No especificado'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0 sm:col-span-2 lg:col-span-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                    Motivo
                                </label>
                                <p className="text-sm text-gray-900 break-words">
                                    {movimiento.Motivo || 'No especificado'}
                                </p>
                            </div>

                            {movimiento.Recepcionista && (
                                <div className="bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                        Recepcionista
                                    </label>
                                    <p className="text-sm text-gray-900 truncate">{movimiento.Recepcionista}</p>
                                </div>
                            )}

                            {movimiento.Observaciones && (
                                <div className="bg-gray-50 p-3 rounded-lg sm:bg-transparent sm:p-0 sm:col-span-2 lg:col-span-3">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                        Observaciones
                                    </label>
                                    <p className="text-sm text-gray-900 break-words">{movimiento.Observaciones}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información de Bodegas - Mobile first */}
                    <div className="p-3 sm:p-6 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
                            <FiMapPin className="h-4 w-4 mr-2" />
                            Bodegas
                        </h4>

                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
                            {movimiento.Origen_Bodega_Nombre && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                                        <span className="text-sm font-medium text-red-800">Bodega de Origen</span>
                                    </div>
                                    <p className="text-sm text-red-700 font-medium break-words">
                                        {movimiento.Origen_Bodega_Nombre}
                                    </p>
                                </div>
                            )}

                            {movimiento.Destino_Bodega_Nombre && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                                        <span className="text-sm font-medium text-green-800">Bodega de Destino</span>
                                    </div>
                                    <p className="text-sm text-green-700 font-medium break-words">
                                        {movimiento.Destino_Bodega_Nombre}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles de Items - Mobile first: Cards on mobile, Table on desktop */}
                    <div className="p-3 sm:p-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
                            <FiPackage className="h-4 w-4 mr-2" />
                            Items del Movimiento
                            {movimiento.detalles && (
                                <span className="ml-2 text-xs text-gray-500">
                                    ({movimiento.detalles.length} items)
                                </span>
                            )}
                        </h4>

                        {movimiento.detalles && movimiento.detalles.length > 0 ? (
                            <>
                                {/* Vista Mobile: Cards */}
                                <div className="space-y-3 sm:hidden">
                                    {movimiento.detalles.map((detalle, index) => (
                                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            {/* Header del item */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="text-sm font-medium text-gray-900 truncate">
                                                        {detalle.Item_Codigo}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 mt-0.5 break-words">
                                                        {detalle.Item_Descripcion}
                                                    </p>
                                                </div>
                                                <div className="ml-2 text-right flex-shrink-0">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Q{formatCantidad(detalle.Valor_Total)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Total
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cantidad y Presentación */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Cantidad</span>
                                                    <div className="text-right">
                                                        {detalle.Es_Movimiento_Por_Presentacion && detalle.Cantidad_Presentacion ? (
                                                            <div>
                                                                <div className="font-medium text-purple-600 flex items-center justify-end text-sm">
                                                                    <FiPackage className="h-3 w-3 mr-1" />
                                                                    {formatCantidad(detalle.Cantidad_Presentacion)}
                                                                    <span className="text-xs ml-1">
                                                                        {detalle.Presentacion_Nombre || 'unidades'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                    = {formatCantidad(detalle.Cantidad)} {detalle.Item_Unidad_Medida}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm">
                                                                <span className="font-medium">
                                                                    {formatCantidad(detalle.Cantidad)}
                                                                </span>
                                                                <span className="text-gray-500 ml-1">
                                                                    {detalle.Item_Unidad_Medida}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Presentación info si existe */}
                                                {detalle.Es_Movimiento_Por_Presentacion && detalle.Presentacion_Nombre && (
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                        <span className="text-xs font-medium text-gray-500 uppercase">Presentación</span>
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium text-purple-600 flex items-center justify-end">
                                                                <FiPackage className="h-3 w-3 mr-1" />
                                                                {detalle.Presentacion_Nombre}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                Factor: {detalle.Factor_Conversion}x → {detalle.Item_Unidad_Medida}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Valor unitario */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Valor Unitario</span>
                                                    <div className="text-sm text-gray-900">
                                                        Q{formatCantidad(detalle.Item_Costo_Unitario)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Vista Desktop: Tabla */}
                                <div className="hidden sm:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
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
                                                    Presentación
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
                                                        {detalle.Es_Movimiento_Por_Presentacion && detalle.Cantidad_Presentacion ? (
                                                            <div className="space-y-1">
                                                                <div className="font-medium text-purple-600 flex items-center">
                                                                    <FiPackage className="h-3 w-3 mr-1" />
                                                                    {formatCantidad(detalle.Cantidad_Presentacion)}
                                                                    <span className="text-xs ml-1">
                                                                        {detalle.Presentacion_Nombre || 'unidades'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    = {formatCantidad(detalle.Cantidad)} {detalle.Item_Unidad_Medida}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <span className="font-medium">
                                                                    {formatCantidad(detalle.Cantidad)}
                                                                </span>
                                                                <span className="text-gray-500 ml-1">
                                                                    {detalle.Item_Unidad_Medida}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {detalle.Es_Movimiento_Por_Presentacion && detalle.Presentacion_Nombre ? (
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-medium text-purple-600 flex items-center">
                                                                    <FiPackage className="h-3 w-3 mr-1" />
                                                                    {detalle.Presentacion_Nombre}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Factor: {detalle.Factor_Conversion}x → {detalle.Item_Unidad_Medida}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-600">
                                                                <span className="text-gray-600">Unidad Base:</span> {detalle.Item_Unidad_Medida}
                                                            </div>
                                                        )}
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
                            </>
                        ) : (
                            <div className="text-center py-8 sm:py-12">
                                <FiPackage className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay detalles</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No se encontraron items para este movimiento.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Resumen - Mobile optimized */}
                    {movimiento.detalles && movimiento.detalles.length > 0 && (
                        <div className="bg-gray-50 p-3 sm:px-6 sm:py-4 border-t border-gray-200">
                            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                                <span className="text-sm font-medium text-gray-900">
                                    Resumen del movimiento
                                </span>
                                <div className="space-y-1 sm:text-right">
                                    <div className="flex justify-between sm:block">
                                        <span className="text-sm text-gray-600">Items:</span>
                                        <span className="text-sm text-gray-900 font-medium ml-2 sm:ml-0">
                                            {movimiento.detalles.length}
                                            <span className="text-gray-500 ml-1">
                                                {movimiento.detalles.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex justify-between sm:block">
                                        <span className="text-xs text-gray-600">Cantidad total:</span>
                                        <span className="text-xs text-gray-500 ml-2 sm:ml-0">
                                            {formatCantidad(
                                                movimiento.detalles.reduce((sum, d) => sum + (d.Cantidad || 0), 0)
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between sm:block">
                                        <span className="text-sm text-gray-600">Valor total:</span>
                                        <span className="text-sm font-medium text-gray-900 ml-2 sm:ml-0">
                                            Q{formatCantidad(
                                                movimiento.detalles.reduce((sum, d) => sum + (d.Valor_Total || 0), 0)
                                            )}
                                        </span>
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