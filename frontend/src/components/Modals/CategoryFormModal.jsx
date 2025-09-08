import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiTag, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../ui';

const CategoryFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category = null,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    CategoriaItem_Nombre: '',
    CategoriaItem_Descripcion: ''
  });
  const [errors, setErrors] = useState({});

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Modo edición
        setFormData({
          CategoriaItem_Nombre: category.CategoriaItem_Nombre || '',
          CategoriaItem_Descripcion: category.CategoriaItem_Descripcion || ''
        });
      } else {
        // Modo creación
        setFormData({
          CategoriaItem_Nombre: '',
          CategoriaItem_Descripcion: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, category]);

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.CategoriaItem_Nombre.trim()) {
      newErrors.CategoriaItem_Nombre = 'El nombre es requerido';
    } else if (formData.CategoriaItem_Nombre.length > 50) {
      newErrors.CategoriaItem_Nombre = 'El nombre no puede exceder 50 caracteres';
    }

    // Validar descripción (opcional)
    if (formData.CategoriaItem_Descripcion && formData.CategoriaItem_Descripcion.length > 150) {
      newErrors.CategoriaItem_Descripcion = 'La descripción no puede exceder 150 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en CategoryFormModal:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Container del modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/10 rounded-full w-10 h-10 flex items-center justify-center">
                <FiTag className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  {category ? 'Editar Categoría' : 'Nueva Categoría'}
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  {category ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría para organizar tus items'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="CategoriaItem_Nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la categoría *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiTag className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="CategoriaItem_Nombre"
                  name="CategoriaItem_Nombre"
                  value={formData.CategoriaItem_Nombre}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50 ${
                    errors.CategoriaItem_Nombre 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Ej: Electrónicos, Oficina, Limpieza..."
                  maxLength={50}
                />
              </div>
              {errors.CategoriaItem_Nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.CategoriaItem_Nombre}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.CategoriaItem_Nombre.length}/50 caracteres
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="CategoriaItem_Descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FiFileText className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  id="CategoriaItem_Descripcion"
                  name="CategoriaItem_Descripcion"
                  value={formData.CategoriaItem_Descripcion}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={3}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50 resize-none ${
                    errors.CategoriaItem_Descripcion 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Descripción detallada de la categoría..."
                  maxLength={150}
                />
              </div>
              {errors.CategoriaItem_Descripcion && (
                <p className="text-red-500 text-xs mt-1">{errors.CategoriaItem_Descripcion}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.CategoriaItem_Descripcion.length}/150 caracteres
              </p>
            </div>

            {/* Vista previa */}
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h4>
              <div className="bg-white rounded-md p-3 border">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/10 rounded-full w-8 h-8 flex items-center justify-center">
                    <FiTag className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">
                      {formData.CategoriaItem_Nombre || 'Nombre de la categoría'}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {formData.CategoriaItem_Descripcion || 'Sin descripción'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="category-form"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && <LoadingSpinner className="w-4 h-4" />}
              <span>{category ? 'Actualizar' : 'Crear'} Categoría</span>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CategoryFormModal;
