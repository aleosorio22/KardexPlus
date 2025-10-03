import React from 'react';
import { FiSave, FiX, FiLoader } from 'react-icons/fi';

const AccionesRequerimiento = ({ 
    onCancel, 
    onSubmit, 
    isSaving = false 
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    {/* Botón Cancelar */}
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-200
                                 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                 order-2 sm:order-1 min-h-[44px] touch-manipulation"
                    >
                        <FiX className="w-4 h-4 mr-2" />
                        Cancelar
                    </button>

                    {/* Botón Crear Requerimiento */}
                    <button
                        type="submit"
                        onClick={onSubmit}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center px-6 py-2 border border-transparent 
                                 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                 order-1 sm:order-2 min-h-[44px] touch-manipulation"
                    >
                        {isSaving ? (
                            <>
                                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <FiSave className="w-4 h-4 mr-2" />
                                Crear Requerimiento
                            </>
                        )}
                    </button>
                </div>

                {/* Información adicional */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>• El requerimiento se creará en estado <span className="font-medium text-orange-600">Pendiente</span></p>
                        <p>• Necesitará aprobación antes de poder ser despachado</p>
                        <p>• Puedes cancelar el requerimiento antes de que sea aprobado</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccionesRequerimiento;