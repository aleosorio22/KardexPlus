import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { FiX, FiTag } from 'react-icons/fi';

export default function CategoryFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isEditing = false,
  selectedCategory = null,
  isLoading = false
}) {
  
  useEffect(() => {
    if (isEditing && selectedCategory) {
      setFormData({
        CategoriaItem_Nombre: selectedCategory.CategoriaItem_Nombre || '',
        CategoriaItem_Descripcion: selectedCategory.CategoriaItem_Descripcion || ''
      });
    } else if (!isEditing) {
      // Limpiar formulario para nueva categoría
      setFormData({
        CategoriaItem_Nombre: '',
        CategoriaItem_Descripcion: ''
      });
    }
  }, [isEditing, selectedCategory, setFormData, isOpen]);

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
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/10 rounded-full w-10 h-10 flex items-center justify-center">
                      <FiTag className="w-5 h-5 text-blue-500" />
                    </div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Categoría *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength="50"
                      value={formData.CategoriaItem_Nombre || ''}
                      onChange={(e) => setFormData({...formData, CategoriaItem_Nombre: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                      placeholder="Ej: Bebidas, Alimentos, Café..."
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 50 caracteres ({formData.CategoriaItem_Nombre?.length || 0}/50)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows="3"
                      maxLength="150"
                      value={formData.CategoriaItem_Descripcion || ''}
                      onChange={(e) => setFormData({...formData, CategoriaItem_Descripcion: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors resize-none"
                      placeholder="Descripción opcional de la categoría..."
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Opcional - Máximo 150 caracteres ({formData.CategoriaItem_Descripcion?.length || 0}/150)
                    </p>
                  </div>

                  {/* Vista previa */}
                  {formData.CategoriaItem_Nombre && (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500/10 rounded-full w-8 h-8 flex items-center justify-center">
                          <FiTag className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formData.CategoriaItem_Nombre}</p>
                          {formData.CategoriaItem_Descripcion && (
                            <p className="text-sm text-gray-600">{formData.CategoriaItem_Descripcion}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

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
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      disabled={isLoading || !formData.CategoriaItem_Nombre?.trim()}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <FiTag className="w-4 h-4" />
                            <span>{isEditing ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                          </div>
                        </>
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
