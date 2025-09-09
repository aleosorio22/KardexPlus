import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiPackage, FiHash, FiRuler, FiList } from 'react-icons/fi';
import presentacionService from '../../services/presentacionService';

const PresentacionFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  presentacion = null, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    Presentacion_Nombre: '',
    Presentacion_Cantidad: '',
    UnidadMedida_Id: ''
  });
  
  const [errors, setErrors] = useState({});
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  const isEditing = Boolean(presentacion);

  // Cargar unidades de medida al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadUnidadesMedida();
    }
  }, [isOpen]);

  // Configurar datos del formulario cuando se edita
  useEffect(() => {
    if (isOpen && presentacion) {
      setFormData({
        Presentacion_Nombre: presentacion.Presentacion_Nombre || '',
        Presentacion_Cantidad: presentacion.Presentacion_Cantidad?.toString() || '',
        UnidadMedida_Id: presentacion.UnidadMedida_Id?.toString() || ''
      });
    } else if (isOpen && !presentacion) {
      setFormData({
        Presentacion_Nombre: '',
        Presentacion_Cantidad: '',
        UnidadMedida_Id: ''
      });
    }
  }, [isOpen, presentacion]);

  // Limpiar errores al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const loadUnidadesMedida = async () => {
    try {
      setLoadingUnidades(true);
      const response = await presentacionService.getAllUnidadesMedida();
      if (response.success) {
        setUnidadesMedida(response.data);
      }
    } catch (error) {
      console.error('Error al cargar unidades de medida:', error);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.Presentacion_Nombre.trim()) {
      newErrors.Presentacion_Nombre = 'El nombre es requerido';
    } else if (formData.Presentacion_Nombre.trim().length < 2) {
      newErrors.Presentacion_Nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.Presentacion_Nombre.trim().length > 30) {
      newErrors.Presentacion_Nombre = 'El nombre no puede exceder 30 caracteres';
    }

    // Validar cantidad
    if (!formData.Presentacion_Cantidad.trim()) {
      newErrors.Presentacion_Cantidad = 'La cantidad es requerida';
    } else {
      const cantidad = parseFloat(formData.Presentacion_Cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        newErrors.Presentacion_Cantidad = 'La cantidad debe ser un número positivo';
      } else if (cantidad > 999999.99) {
        newErrors.Presentacion_Cantidad = 'La cantidad no puede exceder 999,999.99';
      }
    }

    // Validar unidad de medida
    if (!formData.UnidadMedida_Id) {
      newErrors.UnidadMedida_Id = 'La unidad de medida es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      Presentacion_Nombre: formData.Presentacion_Nombre.trim(),
      Presentacion_Cantidad: parseFloat(formData.Presentacion_Cantidad),
      UnidadMedida_Id: parseInt(formData.UnidadMedida_Id)
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/10 rounded-full w-10 h-10 flex items-center justify-center">
                      <FiPackage className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Editar Presentación' : 'Nueva Presentación'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        {isEditing ? 'Modifica los datos de la presentación' : 'Completa los datos de la nueva presentación'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="Presentacion_Nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <FiPackage className="w-4 h-4" />
                        <span>Nombre de la Presentación</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="Presentacion_Nombre"
                      name="Presentacion_Nombre"
                      value={formData.Presentacion_Nombre}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.Presentacion_Nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Fardo, Paquete, Unidad, Libra"
                      disabled={isSubmitting}
                      maxLength={30}
                    />
                    {errors.Presentacion_Nombre && (
                      <p className="mt-1 text-sm text-red-600">{errors.Presentacion_Nombre}</p>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label htmlFor="Presentacion_Cantidad" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <FiHash className="w-4 h-4" />
                        <span>Cantidad</span>
                      </div>
                    </label>
                    <input
                      type="number"
                      id="Presentacion_Cantidad"
                      name="Presentacion_Cantidad"
                      value={formData.Presentacion_Cantidad}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.Presentacion_Cantidad ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: 100, 1, 0.25"
                      disabled={isSubmitting}
                      step="0.01"
                      min="0.01"
                      max="999999.99"
                    />
                    {errors.Presentacion_Cantidad && (
                      <p className="mt-1 text-sm text-red-600">{errors.Presentacion_Cantidad}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Especifica la cantidad que representa esta presentación
                    </p>
                  </div>

                  {/* Unidad de Medida */}
                  <div>
                    <label htmlFor="UnidadMedida_Id" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <FiRuler className="w-4 h-4" />
                        <span>Unidad de Medida</span>
                      </div>
                    </label>
                    <div className="relative">
                      <select
                        id="UnidadMedida_Id"
                        name="UnidadMedida_Id"
                        value={formData.UnidadMedida_Id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
                          errors.UnidadMedida_Id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting || loadingUnidades}
                      >
                        <option value="">
                          {loadingUnidades ? 'Cargando...' : 'Selecciona una unidad de medida'}
                        </option>
                        {unidadesMedida.map((unidad) => (
                          <option key={unidad.UnidadMedida_Id} value={unidad.UnidadMedida_Id}>
                            {unidad.UnidadMedida_Nombre} ({unidad.UnidadMedida_Prefijo})
                          </option>
                        ))}
                      </select>
                      <FiList className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.UnidadMedida_Id && (
                      <p className="mt-1 text-sm text-red-600">{errors.UnidadMedida_Id}</p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmitting && (
                        <div className="animate-spin rounded-full border-b-2 border-white h-4 w-4"></div>
                      )}
                      <span>{isEditing ? 'Actualizar' : 'Crear'} Presentación</span>
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
};

export default PresentacionFormModal;
