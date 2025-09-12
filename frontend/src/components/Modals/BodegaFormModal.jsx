import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FiX, FiDatabase, FiUser, FiMapPin, FiTag } from 'react-icons/fi';
import userService from '../../services/userService';

export default function BodegaFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing = false,
  selectedBodega = null,
  isLoading = false
}) {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});

  // Tipos de bodega disponibles
  const tiposBodega = [
    { value: '', label: 'Seleccionar tipo' },
    { value: 'Central', label: 'Central' },
    { value: 'Producción', label: 'Producción' },
    { value: 'Frío', label: 'Frío' },
    { value: 'Temporal', label: 'Temporal' },
    { value: 'Descarte', label: 'Descarte' }
  ];

  // Cargar usuarios activos para el select de responsable
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await userService.getAllUsers();
      if (response.success) {
        // Filtrar solo usuarios activos
        const activeUsers = response.data.filter(user => user.Usuario_Estado === 1);
        setUsers(activeUsers);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      
      // Si estamos editando, cargar los datos
      if (isEditing && selectedBodega) {
        setFormData({
          Bodega_Nombre: selectedBodega.Bodega_Nombre || '',
          Bodega_Tipo: selectedBodega.Bodega_Tipo || '',
          Bodega_Ubicacion: selectedBodega.Bodega_Ubicacion || '',
          Responsable_Id: selectedBodega.Responsable_Id || '',
          Bodega_Estado: selectedBodega.Bodega_Estado ?? true
        });
      }
    }
  }, [isOpen, isEditing, selectedBodega, setFormData]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.Bodega_Nombre?.trim()) {
      newErrors.Bodega_Nombre = 'El nombre de la bodega es obligatorio';
    } else if (formData.Bodega_Nombre.length > 50) {
      newErrors.Bodega_Nombre = 'El nombre no puede exceder 50 caracteres';
    }

    if (formData.Bodega_Ubicacion && formData.Bodega_Ubicacion.length > 100) {
      newErrors.Bodega_Ubicacion = 'La ubicación no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  // Limpiar errores cuando cambia el campo
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiDatabase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Editar Bodega' : 'Nueva Bodega'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        {isEditing ? 'Modifica los datos de la bodega' : 'Completa la información de la nueva bodega'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre de la Bodega */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiDatabase className="inline w-4 h-4 mr-1" />
                        Nombre de la Bodega *
                      </label>
                      <input
                        type="text"
                        value={formData.Bodega_Nombre || ''}
                        onChange={(e) => handleFieldChange('Bodega_Nombre', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors ${
                          errors.Bodega_Nombre ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Ej: Bodega Central, Almacén Norte..."
                        maxLength={50}
                      />
                      {errors.Bodega_Nombre && (
                        <p className="mt-1 text-sm text-red-600">{errors.Bodega_Nombre}</p>
                      )}
                    </div>

                    {/* Tipo de Bodega */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiTag className="inline w-4 h-4 mr-1" />
                        Tipo de Bodega
                      </label>
                      <select
                        value={formData.Bodega_Tipo || ''}
                        onChange={(e) => handleFieldChange('Bodega_Tipo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                      >
                        {tiposBodega.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Responsable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiUser className="inline w-4 h-4 mr-1" />
                        Responsable
                      </label>
                      <select
                        value={formData.Responsable_Id || ''}
                        onChange={(e) => handleFieldChange('Responsable_Id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                        disabled={isLoadingUsers}
                      >
                        <option value="">Sin responsable asignado</option>
                        {users.map((user) => (
                          <option key={user.Usuario_Id} value={user.Usuario_Id}>
                            {user.Usuario_Nombre} {user.Usuario_Apellido}
                          </option>
                        ))}
                      </select>
                      {isLoadingUsers && (
                        <p className="mt-1 text-sm text-gray-500">Cargando usuarios...</p>
                      )}
                    </div>

                    {/* Ubicación */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMapPin className="inline w-4 h-4 mr-1" />
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={formData.Bodega_Ubicacion || ''}
                        onChange={(e) => handleFieldChange('Bodega_Ubicacion', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors ${
                          errors.Bodega_Ubicacion ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Ej: Planta Principal - Zona A, Edificio Norte..."
                        maxLength={100}
                      />
                      {errors.Bodega_Ubicacion && (
                        <p className="mt-1 text-sm text-red-600">{errors.Bodega_Ubicacion}</p>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.Bodega_Estado}
                          onChange={(e) => handleFieldChange('Bodega_Estado', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Bodega activa</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Las bodegas inactivas no aparecerán en las listas de selección
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                        </div>
                      ) : (
                        <span>{isEditing ? 'Actualizar Bodega' : 'Crear Bodega'}</span>
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
