import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiBox, FiArrowLeft, FiEdit, FiTag, FiBarChart, FiDollarSign, FiPackage, FiPlus, FiLayers, FiTrash2 } from 'react-icons/fi';
import { ItemFormModal } from '../components/Modals';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';
import itemPresentacionService from '../services/itemPresentacionService';
import { formatCurrency, formatNumber } from '../utils/formatters';
import toast from 'react-hot-toast';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [itemPresentaciones, setItemPresentaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPresentacionesLoading, setIsPresentacionesLoading] = useState(false);

  // Estados para el modal de edición de item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Item_Codigo_SKU: '',
    Item_Codigo_Barra: '',
    Item_Nombre: '',
    Item_Costo_Unitario: '',
    Item_Estado: true,
    CategoriaItem_Id: '',
    UnidadMedidaBase_Id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de presentaciones
  const [isPresentacionModalOpen, setIsPresentacionModalOpen] = useState(false);
  const [presentacionFormData, setPresentacionFormData] = useState({
    Presentacion_Nombre: '',
    Cantidad_Base: '',
    Codigo_SKU: '',
    Codigo_Barras: '',
    Costo: ''
  });
  const [editingPresentacion, setEditingPresentacion] = useState(null);
  const [isPresentacionSubmitting, setIsPresentacionSubmitting] = useState(false);

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

  // Cargar presentaciones disponibles - Ya no necesario
  const loadPresentaciones = async () => {
    // Ya no necesitamos cargar presentaciones reutilizables
    // porque ahora cada item tiene sus propias presentaciones
    setPresentaciones([]);
  };

  // Cargar presentaciones del item
  const loadItemPresentaciones = async () => {
    try {
      setIsPresentacionesLoading(true);
      const response = await itemPresentacionService.getItemPresentacionesByItemId(id);
      const itemPresentacionesData = response.data || response.itemPresentaciones || response || [];
      setItemPresentaciones(Array.isArray(itemPresentacionesData) ? itemPresentacionesData : []);
    } catch (error) {
      console.error('Error loading item presentaciones:', error);
      setItemPresentaciones([]);
    } finally {
      setIsPresentacionesLoading(false);
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
      Item_Estado: item.Item_Estado !== undefined ? item.Item_Estado : true,
      CategoriaItem_Id: item.CategoriaItem_Id || '',
      UnidadMedidaBase_Id: item.UnidadMedidaBase_Id || ''
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
      Item_Estado: true,
      CategoriaItem_Id: '',
      UnidadMedidaBase_Id: ''
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
        Item_Estado: Boolean(data.Item_Estado),
        CategoriaItem_Id: parseInt(data.CategoriaItem_Id),
        UnidadMedidaBase_Id: parseInt(data.UnidadMedidaBase_Id)
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

  // ===== FUNCIONES PARA PRESENTACIONES =====

  // Abrir modal para agregar presentación
  const handleAddPresentacion = () => {
    setPresentacionFormData({
      Presentacion_Nombre: '',
      Cantidad_Base: '',
      Codigo_SKU: '',
      Codigo_Barras: '',
      Costo: ''
    });
    setEditingPresentacion(null);
    setIsPresentacionModalOpen(true);
  };

  // Abrir modal para editar presentación
  const handleEditPresentacion = (presentacion) => {
    setPresentacionFormData({
      Presentacion_Nombre: presentacion.Presentacion_Nombre || '',
      Cantidad_Base: presentacion.Cantidad_Base || '',
      Codigo_SKU: presentacion.Item_Presentacion_CodigoSKU || '',
      Codigo_Barras: presentacion.Item_Presentaciones_CodigoBarras || '',
      Costo: presentacion.Item_Presentaciones_Costo || ''
    });
    setEditingPresentacion(presentacion);
    setIsPresentacionModalOpen(true);
  };

  // Cerrar modal de presentaciones
  const handleClosePresentacionModal = () => {
    setIsPresentacionModalOpen(false);
    setPresentacionFormData({
      Presentacion_Nombre: '',
      Cantidad_Base: '',
      Codigo_SKU: '',
      Codigo_Barras: '',
      Costo: ''
    });
    setEditingPresentacion(null);
  };

  // Manejar envío del formulario de presentaciones
  const handlePresentacionFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsPresentacionSubmitting(true);
      
      const data = {
        Item_Id: parseInt(id),
        Presentacion_Nombre: presentacionFormData.Presentacion_Nombre.trim(),
        Cantidad_Base: parseFloat(presentacionFormData.Cantidad_Base),
        Item_Presentacion_CodigoSKU: presentacionFormData.Codigo_SKU.trim() || null,
        Item_Presentaciones_CodigoBarras: presentacionFormData.Codigo_Barras.trim() || null,
        Item_Presentaciones_Costo: presentacionFormData.Costo ? parseFloat(presentacionFormData.Costo) : null
      };

      if (editingPresentacion) {
        await itemPresentacionService.updateItemPresentacion(editingPresentacion.Item_Presentaciones_Id, data);
        toast.success('Presentación actualizada exitosamente');
      } else {
        await itemPresentacionService.createItemPresentacion(data);
        toast.success('Presentación agregada exitosamente');
      }
      
      handleClosePresentacionModal();
      loadItemPresentaciones();
    } catch (error) {
      console.error('Error saving presentacion:', error);
      toast.error(error.message || 'Error al guardar la presentación');
    } finally {
      setIsPresentacionSubmitting(false);
    }
  };

  // Eliminar presentación
  const handleDeletePresentacion = async (presentacionId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta presentación?')) {
      try {
        await itemPresentacionService.deleteItemPresentacion(presentacionId);
        toast.success('Presentación eliminada exitosamente');
        loadItemPresentaciones();
      } catch (error) {
        console.error('Error deleting presentacion:', error);
        toast.error('Error al eliminar la presentación');
      }
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (id) {
      loadItem();
      loadCategories();
      loadItemPresentaciones();
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
        <FiBox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Item no encontrado</p>
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
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
              title="Volver a Items"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="bg-primary/10 rounded-full p-3">
              <FiBox className="w-6 h-6 text-primary" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">Detalles del Item</h1>
              <p className="text-muted-foreground">{item.Item_Nombre}</p>
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
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
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
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <FiPackage className="w-5 h-5" />
              <span>Información Básica</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
                <p className="text-foreground font-medium">{item.Item_Nombre}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Categoría</label>
                <div className="flex items-center space-x-2">
                  <FiTag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{item.CategoriaItem_Nombre || 'Sin categoría'}</span>
                </div>
              </div>
              
              {item.Item_Codigo_SKU && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Código SKU</label>
                  <p className="text-foreground font-mono">{item.Item_Codigo_SKU}</p>
                </div>
              )}
              
              {item.Item_Codigo_Barra && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Código de Barras</label>
                  <p className="text-foreground font-mono">{item.Item_Codigo_Barra}</p>
                </div>
              )}
            </div>
          </div>

          {/* Presentaciones del Item */}
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <FiLayers className="w-5 h-5" />
                <span>Presentaciones</span>
              </h2>
              
              <button
                onClick={handleAddPresentacion}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FiPlus size={16} />
                <span>Agregar Presentación</span>
              </button>
            </div>

            {isPresentacionesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : itemPresentaciones.length > 0 ? (
              <div className="space-y-4">
                {itemPresentaciones.map((presentacion, index) => (
                  <div 
                    key={`presentacion-${presentacion.Item_Presentaciones_Id || index}`} 
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Presentación
                            </label>
                            <p className="text-sm font-medium text-foreground">
                              {presentacion.Presentacion_Nombre || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {presentacion.UnidadMedida_Nombre || 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              SKU
                            </label>
                            <p className="text-sm font-mono text-foreground">
                              {presentacion.Item_Presentacion_CodigoSKU || 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Cantidad Base
                            </label>
                            <p className="text-sm text-foreground">
                              {formatNumber(presentacion.Cantidad_Base, 4, 0)}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Costo
                            </label>
                            <p className="text-sm font-semibold text-primary">
                              {presentacion.Item_Presentaciones_Costo ? 
                                `Q${formatCurrency(presentacion.Item_Presentaciones_Costo)}` : 
                                'N/A'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {presentacion.Item_Presentaciones_CodigoBarras && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Código de Barras
                            </label>
                            <p className="text-sm font-mono text-foreground">
                              {presentacion.Item_Presentaciones_CodigoBarras}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditPresentacion(presentacion)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Editar presentación"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePresentacion(presentacion.Item_Presentaciones_Id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          title="Eliminar presentación"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiLayers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No hay presentaciones configuradas para este item</p>
                <button
                  onClick={handleAddPresentacion}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Agregar Primera Presentación
                </button>
              </div>
            )}
          </div>

          {/* Aquí agregaremos más secciones en el futuro */}
          <div className="bg-muted/50 rounded-lg border p-6">
            <p className="text-muted-foreground text-center">
              <FiBarChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Próximamente: Historial de movimientos, estadísticas y más información detallada
            </p>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Precios */}
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <FiDollarSign className="w-5 h-5" />
              <span>Precios</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Costo Unitario</label>
                <p className="text-2xl font-bold text-primary">
                  Q{formatCurrency(item.Item_Costo_Unitario || 0)}
                </p>
              </div>
              
              {item.UnidadMedida_Nombre && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Unidad de Medida</label>
                  <p className="text-xl font-semibold text-blue-700">
                    {item.UnidadMedida_Nombre} ({item.UnidadMedida_Prefijo})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <FiBarChart className="w-5 h-5" />
              <span>Gestión de Inventario</span>
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📋 Información importante:</strong><br/>
                El control de stock (mínimos, máximos, puntos de reorden) ahora se configura individualmente por bodega en la sección de <strong>Existencias</strong>.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Esto permite mayor flexibilidad para manejar diferentes niveles según cada ubicación.
              </p>
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

      {/* Modal de formulario de presentaciones */}
      {isPresentacionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingPresentacion ? 'Editar Presentación' : 'Agregar Presentación'}
                </h2>
                <button
                  onClick={handleClosePresentacionModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePresentacionFormSubmit} className="space-y-4">
                {/* Nombre de Presentación */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de Presentación *
                  </label>
                  <input
                    type="text"
                    value={presentacionFormData.Presentacion_Nombre}
                    onChange={(e) => setPresentacionFormData({
                      ...presentacionFormData,
                      Presentacion_Nombre: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Ej: Caja x12, Paquete x6, Unidad"
                    maxLength={30}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo 30 caracteres
                  </p>
                </div>

                {/* Cantidad Base */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cantidad Base *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={presentacionFormData.Cantidad_Base}
                    onChange={(e) => setPresentacionFormData({
                      ...presentacionFormData,
                      Cantidad_Base: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Ej: 12.0000"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cantidad de unidades base que contiene esta presentación
                  </p>
                </div>

                {/* Código SKU */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={presentacionFormData.Codigo_SKU}
                    onChange={(e) => setPresentacionFormData({
                      ...presentacionFormData,
                      Codigo_SKU: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Ej: ITEM001-CX12"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Opcional - Máximo 20 caracteres
                  </p>
                </div>

                {/* Código de Barras */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={presentacionFormData.Codigo_Barras}
                    onChange={(e) => setPresentacionFormData({
                      ...presentacionFormData,
                      Codigo_Barras: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Ej: 1234567890123"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Opcional - Máximo 20 caracteres
                  </p>
                </div>

                {/* Costo */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Costo de la Presentación
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={presentacionFormData.Costo}
                    onChange={(e) => setPresentacionFormData({
                      ...presentacionFormData,
                      Costo: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Ej: 150.2285"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Opcional - Costo específico de esta presentación
                  </p>
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClosePresentacionModal}
                    className="flex-1 px-4 py-2 border rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                    disabled={isPresentacionSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    disabled={isPresentacionSubmitting}
                  >
                    {isPresentacionSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Guardando...
                      </div>
                    ) : (
                      editingPresentacion ? 'Actualizar' : 'Agregar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
