import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiBox, FiArrowLeft, FiEdit, FiTag, FiBarChart, FiDollarSign, FiPackage } from 'react-icons/fi';
import { ItemFormModal } from '../components/Modals';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';
import toast from 'react-hot-toast';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el modal de edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Item_Codigo_SKU: '',
    Item_Codigo_Barra: '',
    Item_Nombre: '',
    Item_Costo_Unitario: '',
    Item_Precio_Sugerido: '',
    Item_Stock_Min: '',
    Item_Stock_Max: '',
    Item_Estado: true,
    CategoriaItem_Id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del item
  const loadItem = async () => {
    try {
      setIsLoading(true);
      const response = await itemService.getItemById(id);
      const itemData = response.data || response.item || response;
      setItem(itemData);
    } catch (error) {
      console.error('Error loading item:', error);
      toast.error('Error al cargar los detalles del item');
      navigate('/inventario/items');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      const categoriesData = response.data || response.categories || response || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  // Navegar de vuelta a la lista
  const handleGoBack = () => {
    navigate('/inventario/items');
  };

  // Abrir modal para editar item
  const handleEditItem = () => {
    setFormData({
      Item_Codigo_SKU: item.Item_Codigo_SKU || '',
      Item_Codigo_Barra: item.Item_Codigo_Barra || '',
      Item_Nombre: item.Item_Nombre || '',
      Item_Costo_Unitario: item.Item_Costo_Unitario || '',
      Item_Precio_Sugerido: item.Item_Precio_Sugerido || '',
      Item_Stock_Min: item.Item_Stock_Min || '',
      Item_Stock_Max: item.Item_Stock_Max || '',
      Item_Estado: item.Item_Estado !== undefined ? item.Item_Estado : true,
      CategoriaItem_Id: item.CategoriaItem_Id || ''
    });
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      Item_Codigo_SKU: '',
      Item_Codigo_Barra: '',
      Item_Nombre: '',
      Item_Costo_Unitario: '',
      Item_Precio_Sugerido: '',
      Item_Stock_Min: '',
      Item_Stock_Max: '',
      Item_Estado: true,
      CategoriaItem_Id: ''
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      await itemService.updateItem(item.Item_Id, {
        Item_Codigo_SKU: data.Item_Codigo_SKU || null,
        Item_Codigo_Barra: data.Item_Codigo_Barra || null,
        Item_Nombre: data.Item_Nombre,
        Item_Costo_Unitario: parseFloat(data.Item_Costo_Unitario),
        Item_Precio_Sugerido: data.Item_Precio_Sugerido ? parseFloat(data.Item_Precio_Sugerido) : null,
        Item_Stock_Min: data.Item_Stock_Min ? parseInt(data.Item_Stock_Min) : 0,
        Item_Stock_Max: data.Item_Stock_Max ? parseInt(data.Item_Stock_Max) : null,
        Item_Estado: Boolean(data.Item_Estado),
        CategoriaItem_Id: parseInt(data.CategoriaItem_Id)
      });
      
      toast.success('Item actualizado exitosamente');
      handleCloseModal();
      loadItem(); // Recargar los datos del item
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.message || 'Error al guardar el item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (id) {
      loadItem();
      loadCategories();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <FiBox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Item no encontrado</p>
        <button
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volver a Items
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title="Volver a Items"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="bg-primary/10 rounded-full p-3">
              <FiBox className="w-6 h-6 text-primary" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Detalles del Item</h1>
              <p className="text-gray-600">{item.Item_Nombre}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              item.Item_Estado 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {item.Item_Estado ? 'Activo' : 'Inactivo'}
            </span>
            
            <button
              onClick={handleEditItem}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              title="Editar item"
            >
              <FiEdit size={16} />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiPackage className="w-5 h-5" />
              <span>Información Básica</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                <p className="text-gray-900 font-medium">{item.Item_Nombre}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
                <div className="flex items-center space-x-2">
                  <FiTag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{item.CategoriaItem_Nombre || 'Sin categoría'}</span>
                </div>
              </div>
              
              {item.Item_Codigo_SKU && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Código SKU</label>
                  <p className="text-gray-900 font-mono">{item.Item_Codigo_SKU}</p>
                </div>
              )}
              
              {item.Item_Codigo_Barra && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Código de Barras</label>
                  <p className="text-gray-900 font-mono">{item.Item_Codigo_Barra}</p>
                </div>
              )}
            </div>
          </div>

          {/* Aquí agregaremos más secciones en el futuro */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-center">
              <FiBarChart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              Próximamente: Historial de movimientos, estadísticas y más información detallada
            </p>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Precios */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiDollarSign className="w-5 h-5" />
              <span>Precios</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Costo Unitario</label>
                <p className="text-2xl font-bold text-green-600">
                  Q{parseFloat(item.Item_Costo_Unitario || 0).toFixed(2)}
                </p>
              </div>
              
              {item.Item_Precio_Sugerido && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Precio Sugerido</label>
                  <p className="text-xl font-semibold text-blue-600">
                    Q{parseFloat(item.Item_Precio_Sugerido).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Control de Stock */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiBarChart className="w-5 h-5" />
              <span>Control de Stock</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Stock Mínimo</label>
                <p className="text-lg font-semibold text-orange-600">
                  {item.Item_Stock_Min || 0} unidades
                </p>
              </div>
              
              {item.Item_Stock_Max && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Stock Máximo</label>
                  <p className="text-lg font-semibold text-purple-600">
                    {item.Item_Stock_Max} unidades
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <FiBarChart className="w-4 h-4 inline mr-1" />
                  Próximamente: Stock actual y alertas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de formulario de item */}
      <ItemFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={true}
        selectedItem={item}
        isLoading={isSubmitting}
        categories={categories}
      />
    </div>
  );
};

export default ItemDetails;
