import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function UnidadMedidaFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isEditing = false,
  selectedUnidad = null,
  isLoading = false
}) {
  useEffect(() => {
    if (isEditing && selectedUnidad) {
      setFormData({
        UnidadMedida_Nombre: selectedUnidad.UnidadMedida_Nombre || '',
        UnidadMedida_Prefijo: selectedUnidad.UnidadMedida_Prefijo || '',
        UnidadMedida_Factor_Conversion: selectedUnidad.UnidadMedida_Factor_Conversion || ''
      });
    } else if (!isEditing) {
      // Limpiar formulario para nueva unidad
      setFormData({
        UnidadMedida_Nombre: '',
        UnidadMedida_Prefijo: '',
        UnidadMedida_Factor_Conversion: ''
      });
    }
  }, [isEditing, selectedUnidad, setFormData, isOpen]);

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
                    {isEditing ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
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
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.UnidadMedida_Nombre || ''}
                      onChange={(e) => setFormData({...formData, UnidadMedida_Nombre: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="Ej: Kilogramo, Metro, Litro"
                      disabled={isLoading}
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prefijo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.UnidadMedida_Prefijo || ''}
                      onChange={(e) => setFormData({...formData, UnidadMedida_Prefijo: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="Ej: kg, m, l"
                      disabled={isLoading}
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 10 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Factor de Conversión
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.UnidadMedida_Factor_Conversion || ''}
                      onChange={(e) => setFormData({...formData, UnidadMedida_Factor_Conversion: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="Opcional - Factor para conversiones"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Opcional - Usado para conversiones automáticas entre unidades
                    </p>
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
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        isEditing ? 'Guardar Cambios' : 'Crear Unidad'
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
