import React from 'react';
import { FiUser, FiClock, FiPlus, FiEye, FiEdit, FiFileText } from 'react-icons/fi';

const MisRequerimientos = () => {
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
                            <p className="text-sm sm:text-base text-gray-600">Gestiona tus solicitudes de inventario</p>
                        </div>
                    </div>
                    
                    <button className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto">
                        <FiPlus className="w-4 h-4" />
                        <span>Nuevo Requerimiento</span>
                    </button>
                </div>
            </div>

            {/* En construcción */}
            <div className="bg-white shadow-sm rounded-lg p-6 sm:p-12">
                <div className="text-center">
                    <FiClock className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Módulo en Construcción</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                        Esta sección te permitirá gestionar tus requerimientos de inventario de manera personalizada:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <FiPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Crear Requerimientos</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Solicitar items de inventario</p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <FiEye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Ver Estado</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Seguimiento de solicitudes</p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                            <FiEdit className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto mb-2" />
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Editar Pendientes</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Modificar requerimientos pendientes</p>
                        </div>
                    </div>

                    {/* Funcionalidades adicionales */}
                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">Próximas Funcionalidades</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                            <div className="flex items-center space-x-3 text-left">
                                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-xs sm:text-sm text-gray-700">Historial completo de requerimientos</span>
                            </div>
                            <div className="flex items-center space-x-3 text-left">
                                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-xs sm:text-sm text-gray-700">Notificaciones de estado</span>
                            </div>
                            <div className="flex items-center space-x-3 text-left">
                                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-xs sm:text-sm text-gray-700">Filtros avanzados</span>
                            </div>
                            <div className="flex items-center space-x-3 text-left">
                                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-xs sm:text-sm text-gray-700">Exportación de reportes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nota informativa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <FiFileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="text-sm">
                        <p className="text-blue-800 font-medium">Información importante:</p>
                        <p className="text-blue-700 mt-1">
                            Una vez implementado, podrás crear requerimientos, hacer seguimiento del estado de tus solicitudes 
                            y gestionar todo el proceso desde esta sección personalizada.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MisRequerimientos;