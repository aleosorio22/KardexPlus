import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { FiX, FiTag, FiDollarSign, FiPackage, FiBarChart, FiBox } from 'react-icons/fi';
import { getUnidadesMedida } from '../../services/unidadMedidaService';

export default function ItemFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isEditing = false,
  selectedItem = null,
  isLoading = false,
  categories = []
}) {
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  // Cargar unidades de medida
  useEffect(() => {
    const fetchUnidadesMedida = async () => {
      try {
        const unidades = await getUnidadesMedida();
        setUnidadesMedida(Array.isArray(unidades) ? unidades : []);
      } catch (error) {
        console.error('Error al cargar unidades de medida:', error);
        setUnidadesMedida([]);
      }
    };

    if (isOpen) {
      fetchUnidadesMedida();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isEditing && selectedItem) {
      setFormData({
        Item_Codigo_SKU: selectedItem.Item_Codigo_SKU || '',
        Item_Codigo_Barra: selectedItem.Item_Codigo_Barra || '',
        Item_Nombre: selectedItem.Item_Nombre || '',
        Item_Costo_Unitario: selectedItem.Item_Costo_Unitario || '',
        Item_Estado: selectedItem.Item_Estado !== undefined ? selectedItem.Item_Estado : true,
        CategoriaItem_Id: selectedItem.CategoriaItem_Id || '',
        UnidadMedidaBase_Id: selectedItem.UnidadMedidaBase_Id || ''
      });
    } else if (!isEditing) {
      // Limpiar formulario para nuevo item
      setFormData({
        Item_Codigo_SKU: '',
        Item_Codigo_Barra: '',
        Item_Nombre: '',
        Item_Costo_Unitario: '',
        Item_Estado: true,
        CategoriaItem_Id: '',
        UnidadMedidaBase_Id: ''
      });
    }
  }, [isEditing, selectedItem, setFormData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Editar Item' : 'Nuevo Item'}
                  </Dialog.Title>
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
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <FiPackage className="w-4 h-4" />
                      <span>Información Básica</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Item *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.Item_Nombre || ''}
                          onChange={(e) => handleInputChange('Item_Nombre', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                          placeholder="Ej: Café Premium, Azúcar Blanca"
                          disabled={isLoading}
                          maxLength={50}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código SKU
                        </label>
                        <input
                          type="text"
                          value={formData.Item_Codigo_SKU || ''}
                          onChange={(e) => handleInputChange('Item_Codigo_SKU', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                          placeholder="SKU001"
                          disabled={isLoading}
                          maxLength={20}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código de Barras
                        </label>
                        <input
                          type="text"
                          value={formData.Item_Codigo_Barra || ''}
                          onChange={(e) => handleInputChange('Item_Codigo_Barra', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                          placeholder="123456789012"
                          disabled={isLoading}
                          maxLength={20}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría *
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={formData.CategoriaItem_Id || ''}
                            onChange={(e) => handleInputChange('CategoriaItem_Id', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors appearance-none"
                            disabled={isLoading}
                          >
                            <option value="">Selecciona una categoría</option>
                            {categories.map((categoria) => (
                              <option key={categoria.CategoriaItem_Id} value={categoria.CategoriaItem_Id}>
                                {categoria.CategoriaItem_Nombre}
                              </option>
                            ))}
                          </select>
                          <FiTag className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unidad de Medida *
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={formData.UnidadMedidaBase_Id || ''}
                            onChange={(e) => handleInputChange('UnidadMedidaBase_Id', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors appearance-none"
                            disabled={isLoading}
                          >
                            <option value="">Selecciona una unidad de medida</option>
                            {unidadesMedida.map((unidad) => (
                              <option key={unidad.UnidadMedida_Id} value={unidad.UnidadMedida_Id}>
                                {unidad.UnidadMedida_Nombre} ({unidad.UnidadMedida_Abreviacion})
                              </option>
                            ))}
                          </select>
                          <FiBox className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="bg-green-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <FiDollarSign className="w-4 h-4" />
                      <span>Información de Precios</span>
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo Unitario * (Q)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.0001"
                        value={formData.Item_Costo_Unitario || ''}
                        onChange={(e) => handleInputChange('Item_Costo_Unitario', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                        placeholder="0.0000"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <FiBarChart className="w-4 h-4" />
                      <span>Información Adicional</span>
                    </h3>
                    
                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>📋 Nota importante:</strong> El control de stock (mínimos, máximos y puntos de reorden) ahora se configura por bodega individual en la sección de <strong>Parámetros por Bodega</strong>. Esto permite mayor flexibilidad para manejar diferentes niveles de inventario según cada ubicación.
                      </p>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="item-estado"
                      checked={Boolean(formData.Item_Estado)}
                      onChange={(e) => handleInputChange('Item_Estado', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor="item-estado" className="text-sm font-medium text-gray-700">
                      Item activo
                    </label>
                  </div>

                  {(categories.length === 0 || unidadesMedida.length === 0) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-700">
                        <strong>Nota:</strong> 
                        {categories.length === 0 && unidadesMedida.length === 0 && 
                          ' No hay categorías ni unidades de medida disponibles.'
                        }
                        {categories.length === 0 && unidadesMedida.length > 0 && 
                          ' No hay categorías disponibles. Crea al menos una categoría antes de agregar items.'
                        }
                        {categories.length > 0 && unidadesMedida.length === 0 && 
                          ' No hay unidades de medida disponibles. Crea al menos una unidad de medida antes de agregar items.'
                        }
                      </p>
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
                      className={`px-4 py-2 rounded-lg text-primary-foreground transition-colors ${
                        isLoading || categories.length === 0 || unidadesMedida.length === 0
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      disabled={isLoading || categories.length === 0 || unidadesMedida.length === 0}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        isEditing ? 'Guardar Cambios' : 'Crear Item'
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
