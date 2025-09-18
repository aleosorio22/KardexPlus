import React from 'react';
import { FiSend, FiX } from 'react-icons/fi';

/**
 * Componente AccionesMovimiento - Botones de acción mobile-first
 * 
 * @param {Object} props
 * @param {Function} props.onCancel - Función para cancelar
 * @param {Function} props.onSubmit - Función para enviar
 * @param {boolean} props.isSaving - Estado de guardado
 * @param {string} props.tipoMovimiento - Tipo de movimiento para personalizar texto
 */
const AccionesMovimiento = ({ 
    onCancel, 
    onSubmit, 
    isSaving, 
    tipoMovimiento = 'movimiento' 
}) => {
    const getTituloMovimiento = (tipo) => {
        const titulos = {
            'entrada': 'Entrada',
            'salida': 'Salida', 
            'transferencia': 'Transferencia',
            'ajuste': 'Ajuste'
        };
        return titulos[tipo] || 'Movimiento';
    };

    const tituloMovimiento = getTituloMovimiento(tipoMovimiento);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
                {/* Layout mobile-first: Stack en móvil, inline en desktop */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-end">
                    {/* Botón Cancelar - Mobile optimized */}
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-2 border border-gray-300 rounded-lg 
                                 text-sm sm:text-base font-medium text-gray-700 bg-white
                                 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 min-h-[44px] touch-manipulation transition-colors duration-200
                                 flex items-center justify-center"
                        disabled={isSaving}
                    >
                        <FiX className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>Cancelar</span>
                    </button>

                    {/* Botón Enviar - Mobile optimized */}
                    <button
                        type="submit"
                        onClick={onSubmit}
                        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:px-6 sm:py-2 rounded-lg 
                                 text-sm sm:text-base font-medium
                                 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 min-h-[44px] touch-manipulation transition-colors duration-200
                                 flex items-center justify-center"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 flex-shrink-0"></div>
                                <span>Enviando {tituloMovimiento}...</span>
                            </>
                        ) : (
                            <>
                                <FiSend className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>Enviar {tituloMovimiento}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Indicador de proceso móvil */}
                {isSaving && (
                    <div className="mt-4 sm:hidden">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                                <span className="text-sm text-blue-800">
                                    Procesando {tituloMovimiento.toLowerCase()}...
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccionesMovimiento;