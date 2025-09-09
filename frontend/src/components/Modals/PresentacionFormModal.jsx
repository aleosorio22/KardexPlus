import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { FiX, FiLayers } from 'react-icons/fi';
import { getUnidadesMedida } from '../../services/unidadMedidaService';
import toast from 'react-hot-toast';

export default function PresentacionFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isEditing = false,
  selectedPresentacion = null,
  isLoading = false
}) {
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // Cargar unidades de medida
  const loadUnidadesMedida = async () => {
    try {
      setLoadingUnidades(true);
      const response = await getUnidadesMedida();
      const unidadesData = response.data || response.unidades || response || [];
      setUnidadesMedida(Array.isArray(unidadesData) ? unidadesData : []);
    } catch (error) {
      console.error('Error loading unidades de medida:', error);
      toast.error('Error al cargar las unidades de medida');
      setUnidadesMedida([]);
    } finally {
      setLoadingUnidades(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUnidadesMedida();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isEditing && selectedPresentacion) {
      setFormData({
        Presentacion_Nombre: selectedPresentacion.Presentacion_Nombre || '',
        Presentacion_Cantidad: selectedPresentacion.Presentacion_Cantidad || '',
        UnidadMedida_Id: selectedPresentacion.UnidadMedida_Id || ''
      });
    } else if (!isEditing) {
      // Limpiar formulario para nueva presentación
      setFormData({
        Presentacion_Nombre: '',
        Presentacion_Cantidad: '',
        UnidadMedida_Id: ''
      });
    }
  }, [isEditing, selectedPresentacion, setFormData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Editar Presentación' : 'Nueva Presentación'}
                  </Dialog.Title>
                  <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Presentación *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.Presentacion_Nombre || ''}
                      onChange={(e) => setFormData({...formData, Presentacion_Nombre: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="Ej: Fardo, Paquete, Caja"
                      disabled={isLoading}
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={formData.Presentacion_Cantidad || ''}
                      onChange={(e) => setFormData({...formData, Presentacion_Cantidad: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="Ej: 10, 50, 100"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Número de unidades que contiene esta presentación
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad de Medida *
                    </label>
                    {loadingUnidades ? (
                      <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Cargando unidades...</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          required
                          value={formData.UnidadMedida_Id || ''}
                          onChange={(e) => setFormData({...formData, UnidadMedida_Id: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors appearance-none"
                          disabled={isLoading}
                        >
                          <option value="">Selecciona una unidad de medida</option>
                          {unidadesMedida.map((unidad) => (
                            <option key={unidad.UnidadMedida_Id} value={unidad.UnidadMedida_Id}>
                              {unidad.UnidadMedida_Nombre} ({unidad.UnidadMedida_Prefijo})
                            </option>
                          ))}
                        </select>
                        <FiLayers className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                    {unidadesMedida.length === 0 && !loadingUnidades && (
                      <p className="text-xs text-amber-600 mt-1">
                        No hay unidades de medida disponibles. Crea una primero.
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm">
                      <p className="text-blue-800 font-medium mb-1">Ejemplo:</p>
                      <p className="text-blue-700">
                        Si creas una presentación "Fardo" con cantidad "100" y unidad "Unidad", 
                        significa que 1 Fardo = 100 Unidades.
                      </p>
                    </div>
                  </div>

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
                      className={`px-4 py-2 rounded-lg text-primary-foreground transition-colors ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      disabled={isLoading || unidadesMedida.length === 0}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        isEditing ? 'Guardar Cambios' : 'Crear Presentación'
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
