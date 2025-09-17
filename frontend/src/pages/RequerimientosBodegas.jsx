import React from 'react';
import { FiShoppingCart, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const RequerimientosBodegas = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Requerimientos de Inventario</h1>
                        <p className="text-gray-600">Gestión de solicitudes y requerimientos de stock</p>
                    </div>
                </div>
            </div>

            {/* En construcción */}
            <div className="bg-white shadow-sm rounded-lg p-12">
                <div className="text-center">
                    <FiClock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Módulo en Construcción</h3>
                    <p className="text-gray-600 mb-8">
                        Esta sección permitirá gestionar requerimientos y solicitudes de inventario:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <FiAlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <h4 className="font-medium text-gray-900">Pendientes</h4>
                            <p className="text-sm text-gray-600">Requerimientos por procesar</p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4">
                            <FiShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-medium text-gray-900">En Proceso</h4>
                            <p className="text-sm text-gray-600">Solicitudes en trámite</p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4">
                            <FiCheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <h4 className="font-medium text-gray-900">Completados</h4>
                            <p className="text-sm text-gray-600">Requerimientos finalizados</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequerimientosBodegas;
