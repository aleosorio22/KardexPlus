import React from 'react';
import { FiLayers } from 'react-icons/fi';

const MisPlantillas = () => {
  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FiLayers className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mis Plantillas</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Plantillas asignadas a ti para usar en requerimientos y movimientos
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <FiLayers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Próximamente</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aquí verás las plantillas que te han sido asignadas
          </p>
        </div>
      </div>
    </div>
  );
};

export default MisPlantillas;
