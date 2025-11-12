import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { FiX, FiLayers, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import bodegaService from '../../services/bodegaService';

export default function PlantillaFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isEditing = false,
  selectedPlantilla = null,
  isLoading = false
}) {
  const [bodegas, setBodegas] = useState([]);
  const [loadingBodegas, setLoadingBodegas] = useState(false);

  // Cargar bodegas
  useEffect(() => {
    const fetchBodegas = async () => {
      try {
        setLoadingBodegas(true);
        const response = await bodegaService.getAllBodegas();
        const bodegasData = response.data || response.bodegas || response || [];
        setBodegas(Array.isArray(bodegasData) ? bodegasData : []);
      } catch (error) {
        console.error('Error al cargar bodegas:', error);
        setBodegas([]);
      } finally {
        setLoadingBodegas(false);
      }
    };

    if (isOpen) {
      fetchBodegas();
    }
  }, [isOpen]);

  // Establecer datos del formulario al editar
  useEffect(() => {
    if (isOpen) {
      if (isEditing && selectedPlantilla) {
        setFormData({
          Plantilla_Nombre: selectedPlantilla.Plantilla_Nombre || '',
          Plantilla_Descripcion: selectedPlantilla.Plantilla_Descripcion || '',
          Tipo_Plantilla: selectedPlantilla.Tipo_Plantilla || '',
          Subtipo_Plantilla: selectedPlantilla.Subtipo_Plantilla || '',
          Origen_Bodega_Id: selectedPlantilla.Origen_Bodega_Id || '',
          Destino_Bodega_Id: selectedPlantilla.Destino_Bodega_Id || '',
          Configuracion_Adicional: selectedPlantilla.Configuracion_Adicional || ''
        });
      }
      // Solo limpiamos el formulario cuando se abre para crear
      // No cuando ya está abierto y se está editando
    }
  }, [isOpen, isEditing, selectedPlantilla]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones adicionales
    if (formData.Tipo_Plantilla === 'Movimiento' && formData.Subtipo_Plantilla === 'Transferencia') {
      if (!formData.Origen_Bodega_Id || !formData.Destino_Bodega_Id) {
        alert('Para transferencias debes seleccionar bodega de origen y destino');
        return;
      }
      if (formData.Origen_Bodega_Id === formData.Destino_Bodega_Id) {
        alert('La bodega de origen y destino no pueden ser la misma');
        return;
      }
    }

    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    console.log('handleInputChange called:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Limpiar bodega destino si cambia el subtipo y no es transferencia
  useEffect(() => {
    if (formData.Subtipo_Plantilla && formData.Subtipo_Plantilla !== 'Transferencia') {
      setFormData(prev => ({
        ...prev,
        Destino_Bodega_Id: ''
      }));
    }
  }, [formData.Subtipo_Plantilla]);

  // Determinar qué bodegas mostrar según el tipo
  const mostrarBodegaOrigen = formData.Tipo_Plantilla === 'Requerimiento' || 
    (formData.Tipo_Plantilla === 'Movimiento' && ['Salida', 'Transferencia'].includes(formData.Subtipo_Plantilla));
  
  const mostrarBodegaDestino = formData.Tipo_Plantilla === 'Requerimiento' || 
    formData.Tipo_Plantilla === 'Compra' || 
    (formData.Tipo_Plantilla === 'Movimiento' && ['Entrada', 'Transferencia'].includes(formData.Subtipo_Plantilla));

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiLayers className="w-5 h-5 text-purple-600" />
                    </div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      {isEditing ? 'Editar Plantilla' : 'Nueva Plantilla'}
                    </Dialog.Title>
                  </div>
                  <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información básica */}
                  <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <FiLayers className="w-4 h-4" />
                      <span>Información Básica</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Plantilla *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.Plantilla_Nombre || ''}
                          onChange={(e) => handleInputChange('Plantilla_Nombre', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors"
                          placeholder="Ej: Requerimiento Semanal Cocina, Compra Mensual Almacén"
                          disabled={isLoading}
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={formData.Plantilla_Descripcion || ''}
                          onChange={(e) => handleInputChange('Plantilla_Descripcion', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors resize-none"
                          placeholder="Describe el propósito de esta plantilla..."
                          disabled={isLoading}
                          rows={3}
                          maxLength={255}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipo y Subtipo */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>Tipo de Plantilla</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo *
                        </label>
                        <select
                          required
                          value={formData.Tipo_Plantilla || ''}
                          onChange={(e) => {
                            handleInputChange('Tipo_Plantilla', e.target.value);
                            // Limpiar subtipo al cambiar tipo
                            handleInputChange('Subtipo_Plantilla', '');
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors cursor-pointer bg-white"
                          disabled={isLoading}
                        >
                          <option value="">Selecciona un tipo</option>
                          <option value="Requerimiento">Requerimiento</option>
                          <option value="Movimiento">Movimiento</option>
                          <option value="Compra">Compra</option>
                        </select>
                      </div>

                      {formData.Tipo_Plantilla === 'Movimiento' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subtipo *
                          </label>
                          <select
                            required
                            value={formData.Subtipo_Plantilla || ''}
                            onChange={(e) => handleInputChange('Subtipo_Plantilla', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors cursor-pointer bg-white"
                            disabled={isLoading}
                          >
                            <option value="">Selecciona un subtipo</option>
                            <option value="Entrada">Entrada</option>
                            <option value="Salida">Salida</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Ajuste">Ajuste</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Ayuda contextual */}
                    {formData.Tipo_Plantilla && (
                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          {formData.Tipo_Plantilla === 'Requerimiento' && (
                            <>
                              <strong>💡 Requerimiento:</strong> Solicitud de items desde una bodega (origen) hacia otra bodega (destino). 
                              Requiere bodega de origen y destino.
                            </>
                          )}
                          {formData.Tipo_Plantilla === 'Movimiento' && formData.Subtipo_Plantilla === 'Entrada' && (
                            <>
                              <strong>💡 Entrada:</strong> Ingreso de items a una bodega. 
                              Requiere bodega de destino.
                            </>
                          )}
                          {formData.Tipo_Plantilla === 'Movimiento' && formData.Subtipo_Plantilla === 'Salida' && (
                            <>
                              <strong>💡 Salida:</strong> Retiro de items de una bodega. 
                              Requiere bodega de origen.
                            </>
                          )}
                          {formData.Tipo_Plantilla === 'Movimiento' && formData.Subtipo_Plantilla === 'Transferencia' && (
                            <>
                              <strong>💡 Transferencia:</strong> Movimiento de items entre bodegas. 
                              Requiere bodega de origen y destino.
                            </>
                          )}
                          {formData.Tipo_Plantilla === 'Movimiento' && formData.Subtipo_Plantilla === 'Ajuste' && (
                            <>
                              <strong>💡 Ajuste:</strong> Corrección de inventario en una bodega. 
                              Puede requerir bodega según el caso.
                            </>
                          )}
                          {formData.Tipo_Plantilla === 'Compra' && (
                            <>
                              <strong>💡 Compra:</strong> Orden de compra de items a proveedores. 
                              Requiere bodega de destino donde ingresarán los items.
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bodegas */}
                  {(mostrarBodegaOrigen || mostrarBodegaDestino) && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>Bodegas</span>
                      </h3>
                      
                      {loadingBodegas ? (
                        <div className="text-center py-4">
                          <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-600 mt-2">Cargando bodegas...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {mostrarBodegaOrigen && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bodega de Origen {(formData.Tipo_Plantilla === 'Requerimiento' || 
                                  (formData.Tipo_Plantilla === 'Movimiento' && ['Salida', 'Transferencia'].includes(formData.Subtipo_Plantilla))) && '*'}
                              </label>
                              <select
                                required={formData.Tipo_Plantilla === 'Requerimiento' || 
                                  (formData.Tipo_Plantilla === 'Movimiento' && ['Salida', 'Transferencia'].includes(formData.Subtipo_Plantilla))}
                                value={formData.Origen_Bodega_Id || ''}
                                onChange={(e) => handleInputChange('Origen_Bodega_Id', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors cursor-pointer bg-white"
                                disabled={isLoading || bodegas.length === 0}
                              >
                                <option value="">Selecciona bodega de origen</option>
                                {bodegas
                                  .filter(b => b.Bodega_Id !== parseInt(formData.Destino_Bodega_Id))
                                  .map((bodega) => (
                                    <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                      {bodega.Bodega_Nombre}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {mostrarBodegaDestino && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bodega de Destino {(formData.Tipo_Plantilla === 'Requerimiento' ||
                                  formData.Tipo_Plantilla === 'Compra' || 
                                  (formData.Tipo_Plantilla === 'Movimiento' && ['Entrada', 'Transferencia'].includes(formData.Subtipo_Plantilla))) && '*'}
                              </label>
                              <select
                                required={formData.Tipo_Plantilla === 'Requerimiento' ||
                                  formData.Tipo_Plantilla === 'Compra' || 
                                  (formData.Tipo_Plantilla === 'Movimiento' && ['Entrada', 'Transferencia'].includes(formData.Subtipo_Plantilla))}
                                value={formData.Destino_Bodega_Id || ''}
                                onChange={(e) => handleInputChange('Destino_Bodega_Id', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors cursor-pointer bg-white"
                                disabled={isLoading || bodegas.length === 0}
                              >
                                <option value="">Selecciona bodega de destino</option>
                                {bodegas
                                  .filter(b => b.Bodega_Id !== parseInt(formData.Origen_Bodega_Id))
                                  .map((bodega) => (
                                    <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                      {bodega.Bodega_Nombre}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {bodegas.length === 0 && !loadingBodegas && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-sm text-amber-700">
                            <strong>⚠️ Advertencia:</strong> No hay bodegas disponibles. 
                            Crea al menos una bodega antes de crear plantillas.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm text-purple-800">
                        <strong>📋 Nota importante:</strong> Los items y cantidades de la plantilla se configurarán 
                        en la página de detalles después de crear/guardar la plantilla. Este formulario solo 
                        gestiona la información general.
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg text-white transition-colors ${
                        isLoading || (!formData.Tipo_Plantilla)
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      disabled={isLoading || (!formData.Tipo_Plantilla)}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        isEditing ? 'Guardar Cambios' : 'Crear Plantilla'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
