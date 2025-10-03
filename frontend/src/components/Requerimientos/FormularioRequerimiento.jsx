import React from 'react';
import { FiHome, FiTarget, FiMessageSquare, FiUser } from 'react-icons/fi';

const FormularioRequerimiento = ({ 
    requerimientoData, 
    setRequerimientoData, 
    bodegas, 
    usuarioLogueado 
}) => {
    const handleInputChange = (field, value) => {
        setRequerimientoData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Filtrar bodegas para origen (excluyendo la seleccionada como destino)
    const bodegasOrigen = bodegas.filter(bodega => 
        !requerimientoData.Destino_Bodega_Id || 
        bodega.Bodega_Id !== parseInt(requerimientoData.Destino_Bodega_Id)
    );

    // Filtrar bodegas para destino (excluyendo la seleccionada como origen)
    const bodegasDestino = bodegas.filter(bodega => 
        !requerimientoData.Origen_Bodega_Id || 
        bodega.Bodega_Id !== parseInt(requerimientoData.Origen_Bodega_Id)
    );

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiMessageSquare className="w-5 h-5 text-primary" />
                    Información del Requerimiento
                </h2>

                <div className="space-y-4">
                    {/* Usuario solicitante - Mobile first */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <FiUser className="w-4 h-4" />
                            Usuario Solicitante
                        </label>
                        <input
                            type="text"
                            value={usuarioLogueado}
                            disabled
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                                     bg-gray-50 text-gray-600 cursor-not-allowed
                                     focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Se asigna automáticamente el usuario actual
                        </p>
                    </div>

                    {/* Bodegas - Grid responsive */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Bodega origen */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiHome className="w-4 h-4" />
                                Bodega de Origen *
                            </label>
                            <select
                                value={requerimientoData.Origen_Bodega_Id}
                                onChange={(e) => handleInputChange('Origen_Bodega_Id', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                                         bg-white text-gray-800 
                                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                         transition-colors"
                                required
                            >
                                <option value="">Seleccione la bodega que entregará los productos</option>
                                {bodegasOrigen.map(bodega => (
                                    <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                        {bodega.Bodega_Nombre} - {bodega.Bodega_Ubicacion}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Bodega desde donde se solicitarán los productos
                            </p>
                        </div>

                        {/* Bodega destino */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiTarget className="w-4 h-4" />
                                Bodega de Destino *
                            </label>
                            <select
                                value={requerimientoData.Destino_Bodega_Id}
                                onChange={(e) => handleInputChange('Destino_Bodega_Id', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                                         bg-white text-gray-800
                                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                         transition-colors"
                                required
                            >
                                <option value="">Seleccione la bodega que recibirá los productos</option>
                                {bodegasDestino.map(bodega => (
                                    <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                        {bodega.Bodega_Nombre} - {bodega.Bodega_Ubicacion}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Bodega hacia donde irán los productos
                            </p>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <FiMessageSquare className="w-4 h-4" />
                            Observaciones
                        </label>
                        <textarea
                            value={requerimientoData.Observaciones}
                            onChange={(e) => handleInputChange('Observaciones', e.target.value)}
                            rows={3}
                            placeholder="Describe el motivo del requerimiento, detalles especiales, urgencia, etc..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                                     bg-white text-gray-800 placeholder-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                     transition-colors resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Información adicional sobre el requerimiento (opcional)
                        </p>
                    </div>

                    {/* Indicadores de validación */}
                    {requerimientoData.Origen_Bodega_Id && requerimientoData.Destino_Bodega_Id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-primary">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span>Configuración de bodegas completada</span>
                            </div>
                        </div>
                    )}

                    {/* Warning si las bodegas son iguales */}
                    {requerimientoData.Origen_Bodega_Id && 
                     requerimientoData.Destino_Bodega_Id && 
                     requerimientoData.Origen_Bodega_Id === requerimientoData.Destino_Bodega_Id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>Las bodegas de origen y destino deben ser diferentes</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormularioRequerimiento;