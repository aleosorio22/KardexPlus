import React from 'react';
import { FiFileText } from 'react-icons/fi';
import { Select } from '../common';

/**
 * Componente FormularioMovimiento - Formulario mobile-first para datos del movimiento
 * 
 * @param {Object} props
 * @param {string} props.tipo - Tipo de movimiento
 * @param {Object} props.movimientoData - Datos del movimiento
 * @param {Function} props.setMovimientoData - Función para actualizar datos del movimiento
 * @param {Array} props.bodegas - Lista de bodegas disponibles
 * @param {Object} props.camposConfig - Configuración de campos según tipo de movimiento
 */
const FormularioMovimiento = ({ 
    tipo, 
    movimientoData, 
    setMovimientoData, 
    bodegas,
    camposConfig 
}) => {
    // Generar opciones de motivos según el tipo de movimiento
    const getMotivosOptions = (tipo) => {
        const motivosPorTipo = {
            'entrada': [
                { value: 'Compra', label: 'Compra' },
                { value: 'Devolución', label: 'Devolución' },
                { value: 'Producción', label: 'Producción' },
                { value: 'Donación', label: 'Donación' },
                { value: 'Otro', label: 'Otro' }
            ],
            'salida': [
                { value: 'Venta', label: 'Venta' },
                { value: 'Uso interno', label: 'Uso interno' },
                { value: 'Pérdida/Daño', label: 'Pérdida/Daño' },
                { value: 'Donación', label: 'Donación' },
                { value: 'Otro', label: 'Otro' }
            ],
            'transferencia': [
                { value: 'Reabastecimiento', label: 'Reabastecimiento' },
                { value: 'Reorganización', label: 'Reorganización' },
                { value: 'Distribución', label: 'Distribución' },
                { value: 'Otro', label: 'Otro' }
            ],
            'ajuste': [
                { value: 'Inventario físico', label: 'Inventario físico' },
                { value: 'Corrección', label: 'Corrección' },
                { value: 'Merma', label: 'Merma' },
                { value: 'Otro', label: 'Otro' }
            ]
        };
        
        return motivosPorTipo[tipo] || [];
    };
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
                {/* Header de la sección - Mobile optimized */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                        <FiFileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                        <span className="leading-tight">Información del Movimiento</span>
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
                        Registra y controla cualquier cambio que se haga en el inventario.
                    </p>
                    
                    {/* Información contextual - Mobile friendly */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                            <strong>Tipo de movimiento:</strong> {tipo} - Los campos se adaptan automáticamente según el tipo seleccionado.
                        </p>
                    </div>
                </div>

                {/* Formulario - Layout mobile-first */}
                <div className="space-y-6">
                    {/* Sección Bodegas - Stack en móvil, grid en desktop */}
                    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                        {/* Bodega Origen */}
                        {(tipo === 'salida' || tipo === 'transferencia') && (
                            <div className="space-y-2">
                                <Select
                                    label="Almacén Origen"
                                    value={movimientoData.Origen_Bodega_Id}
                                    onChange={(value) => setMovimientoData({
                                        ...movimientoData, 
                                        Origen_Bodega_Id: value
                                    })}
                                    options={bodegas.map(bodega => ({
                                        value: bodega.Bodega_Id,
                                        label: bodega.Bodega_Nombre
                                    }))}
                                    placeholder="Seleccionar almacén..."
                                    required
                                    searchable
                                    clearable
                                />
                            </div>
                        )}

                        {/* Bodega Destino */}
                        {(tipo === 'entrada' || tipo === 'transferencia' || tipo === 'ajuste') && (
                            <div className="space-y-2">
                                <Select
                                    label={tipo === 'ajuste' ? 'Almacén' : 'Almacén Destino'}
                                    value={movimientoData.Destino_Bodega_Id}
                                    onChange={(value) => setMovimientoData({
                                        ...movimientoData, 
                                        Destino_Bodega_Id: value
                                    })}
                                    options={bodegas.map(bodega => ({
                                        value: bodega.Bodega_Id,
                                        label: bodega.Bodega_Nombre
                                    }))}
                                    placeholder="Seleccionar almacén..."
                                    required
                                    searchable
                                    clearable
                                />
                            </div>
                        )}
                    </div>

                    {/* Sección Motivo - Full width */}
                    <div className="space-y-2">
                        <Select
                            label="Motivo"
                            value={movimientoData.Motivo}
                            onChange={(value) => setMovimientoData({
                                ...movimientoData, 
                                Motivo: value
                            })}
                            options={getMotivosOptions(tipo)}
                            placeholder="Seleccionar motivo..."
                            required
                            searchable
                        />
                    </div>

                    {/* Sección Información adicional - Stack en móvil */}
                    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                        {/* Recepcionista */}
                        {camposConfig.mostrarRecepcionista && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {camposConfig.etiquetaRecepcionista} {!camposConfig.soloLecturaRecepcionista && '*'}
                                </label>
                                <input
                                    type="text"
                                    value={movimientoData.Recepcionista}
                                    onChange={(e) => !camposConfig.soloLecturaRecepcionista && setMovimientoData({
                                        ...movimientoData, 
                                        Recepcionista: e.target.value
                                    })}
                                    className={`w-full px-3 py-3 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg 
                                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                               min-h-[44px] touch-manipulation
                                               ${camposConfig.soloLecturaRecepcionista 
                                                 ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                                                 : 'bg-white'}`}
                                    placeholder={camposConfig.placeholderRecepcionista}
                                    readOnly={camposConfig.soloLecturaRecepcionista}
                                />
                            </div>
                        )}

                        {/* Observaciones */}
                        {camposConfig.mostrarObservaciones && (
                            <div className="space-y-2 lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    {camposConfig.etiquetaObservaciones}
                                </label>
                                <textarea
                                    value={movimientoData.Observaciones}
                                    onChange={(e) => setMovimientoData({
                                        ...movimientoData, 
                                        Observaciones: e.target.value
                                    })}
                                    className="w-full px-3 py-3 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                             bg-white touch-manipulation resize-none"
                                    placeholder={camposConfig.placeholderObservaciones}
                                    rows="3"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioMovimiento;