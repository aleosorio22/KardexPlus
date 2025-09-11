import React, { useState, useEffect, useMemo } from 'react';
import { FiBox, FiPlus, FiEdit, FiTrash2, FiDollarSign, FiBarChart, FiTag, FiPackage, FiRotateCcw, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { DataTable, SearchAndFilter } from '../components/DataTable';
import { ItemFormModal } from '../components/Modals';
import ConfirmModal from '../components/ConfirmModal';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Items = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    Item_Codigo_SKU: '',
    Item_Codigo_Barra: '',
    Item_Nombre: '',
    Item_Costo_Unitario: '',
    Item_Stock_Min: '',
    Item_Stock_Max: '',
    Item_Estado: true,
    CategoriaItem_Id: '',
    UnidadMedidaBase_Id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros disponibles para la búsqueda
  const filterOptions = [
    {
      id: 'search',
      label: 'Búsqueda',
      type: 'text',
      defaultValue: '',
      placeholder: 'Buscar por nombre, SKU, código de barras...'
    },
    {
      id: 'category',
      label: 'Categoría',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todas las categorías' },
        ...categories.map(cat => ({ 
          value: cat.CategoriaItem_Id.toString(), 
          label: cat.CategoriaItem_Nombre 
        }))
      ]
    },
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
      ]
    }
  ];

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'avatar',
      header: '',
      sortable: false,
      width: '60px',
      render: (item) => (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
            {item.Item_Nombre?.charAt(0)?.toUpperCase() || 'I'}
          </div>
        </div>
      )
    },
    {
      field: 'Item_Nombre',
      header: 'Item',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.Item_Nombre}</div>
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FiTag className="w-3 h-3" />
              <span>{item.CategoriaItem_Nombre}</span>
            </div>
            {item.UnidadMedida_Nombre && (
              <div className="flex items-center space-x-1">
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {item.UnidadMedida_Prefijo}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      field: 'codigos',
      header: 'Códigos',
      render: (item) => (
        <div className="space-y-1">
          {item.Item_Codigo_SKU && (
            <div className="text-xs">
              <span className="font-medium text-gray-600">SKU:</span> {item.Item_Codigo_SKU}
            </div>
          )}
          {item.Item_Codigo_Barra && (
            <div className="text-xs">
              <span className="font-medium text-gray-600">CB:</span> {item.Item_Codigo_Barra}
            </div>
          )}
          {!item.Item_Codigo_SKU && !item.Item_Codigo_Barra && (
            <span className="text-xs text-gray-400">Sin códigos</span>
          )}
        </div>
      )
    },
    {
      field: 'costo_unidad',
      header: 'Costo & Unidad',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-primary">
              Q{formatCurrency(item.Item_Costo_Unitario || 0)}
            </span>
          </div>
          {item.UnidadMedida_Nombre && (
            <div className="text-xs text-gray-500">
              por {item.UnidadMedida_Nombre}
            </div>
          )}
        </div>
      )
    },
    {
      field: 'stock',
      header: 'Stock',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium text-gray-600">Min:</span> {item.Item_Stock_Min || 0}
          </div>
          {item.Item_Stock_Max && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Max:</span> {item.Item_Stock_Max}
            </div>
          )}
        </div>
      )
    },
    {
      field: 'Item_Estado',
      header: 'Estado',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.Item_Estado 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.Item_Estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  // Cargar items
  const loadItems = async () => {
    try {
      setIsLoading(true);
      const response = await itemService.getAllItems();
      console.log('Items loaded:', response);
      
      const itemsData = response.data || response.items || response || [];
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Error al cargar los items');
      setItems([]);
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
      toast.error('Error al cargar las categorías');
      setCategories([]);
    }
  };

  // Abrir modal para crear item
  const handleCreateItem = () => {
    setIsEditing(false);
    setSelectedItem(null);
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
    setIsModalOpen(true);
  };

  // Abrir modal para editar item
  const handleEditItem = (item) => {
    setIsEditing(true);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({
      Item_Codigo_SKU: '',
      Item_Codigo_Barra: '',
      Item_Nombre: '',
      Item_Costo_Unitario: '',
      Item_Stock_Min: '',
      Item_Stock_Max: '',
      Item_Estado: true,
      CategoriaItem_Id: '',
      UnidadMedidaBase_Id: ''
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await itemService.updateItem(selectedItem.Item_Id, {
          Item_Codigo_SKU: data.Item_Codigo_SKU || null,
          Item_Codigo_Barra: data.Item_Codigo_Barra || null,
          Item_Nombre: data.Item_Nombre,
          Item_Costo_Unitario: parseFloat(data.Item_Costo_Unitario),
          Item_Stock_Min: data.Item_Stock_Min ? parseInt(data.Item_Stock_Min) : 0,
          Item_Stock_Max: data.Item_Stock_Max ? parseInt(data.Item_Stock_Max) : null,
          Item_Estado: Boolean(data.Item_Estado),
          CategoriaItem_Id: parseInt(data.CategoriaItem_Id),
          UnidadMedidaBase_Id: parseInt(data.UnidadMedidaBase_Id)
        });
        toast.success('Item actualizado exitosamente');
      } else {
        await itemService.createItem({
          Item_Codigo_SKU: data.Item_Codigo_SKU || null,
          Item_Codigo_Barra: data.Item_Codigo_Barra || null,
          Item_Nombre: data.Item_Nombre,
          Item_Costo_Unitario: parseFloat(data.Item_Costo_Unitario),
          Item_Stock_Min: data.Item_Stock_Min ? parseInt(data.Item_Stock_Min) : 0,
          Item_Stock_Max: data.Item_Stock_Max ? parseInt(data.Item_Stock_Max) : null,
          Item_Estado: Boolean(data.Item_Estado),
          CategoriaItem_Id: parseInt(data.CategoriaItem_Id),
          UnidadMedidaBase_Id: parseInt(data.UnidadMedidaBase_Id)
        });
        toast.success('Item creado exitosamente');
      }
      
      handleCloseModal();
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.message || 'Error al guardar el item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar items según los criterios de búsqueda
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !filters.search || 
        item.Item_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.Item_Codigo_SKU?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.Item_Codigo_Barra?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.CategoriaItem_Nombre?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory = !filters.category || 
        item.CategoriaItem_Id?.toString() === filters.category;

      const matchesStatus = !filters.status || 
        item.Item_Estado?.toString() === filters.status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Manejar eliminación de item
  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  // Confirmar eliminación
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await itemService.deleteItem(itemToDelete.Item_Id);
      toast.success('Item desactivado exitosamente');
      loadItems();
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Error al desactivar el item');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar eliminación
  const cancelDeleteItem = () => {
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
  };

  // Manejar toggle de estado de item
  const handleToggleStatus = async (item) => {
    try {
      await itemService.toggleItemStatus(item.Item_Id);
      toast.success(`Item ${item.Item_Estado ? 'desactivado' : 'activado'} exitosamente`);
      loadItems(); // Recargar la lista
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast.error('Error al cambiar el estado del item');
    }
  };

  // Manejar restauración de item
  const handleRestoreItem = async (item) => {
    try {
      await itemService.restoreItem(item.Item_Id);
      toast.success('Item restaurado exitosamente');
      loadItems(); // Recargar la lista
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Error al restaurar el item');
    }
  };

  // Navegar a los detalles del item
  const handleViewItemDetails = (item) => {
    navigate(`/inventario/items/${item.Item_Id}/detalles`);
  };

  // Renderizar acciones de fila
  const renderRowActions = (item) => (
    <>
      <button
        onClick={() => handleViewItemDetails(item)}
        className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
        title="Ver detalles del item"
      >
        <FiFileText className="w-4 h-4" />
      </button>

      {item.Item_Estado ? (
        <>          
          <button
            onClick={() => handleEditItem(item)}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            title="Editar item"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleDeleteItem(item)}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="Eliminar item"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => handleRestoreItem(item)}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          title="Restaurar item"
        >
          <FiRotateCcw className="w-4 h-4" />
        </button>
      )}
    </>
  );

  // Cargar datos al montar el componente
  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 rounded-full p-3">
              <FiBox className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Items</h1>
              <p className="text-gray-600">Administra el catálogo de productos del sistema KardexPlus</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCreateItem}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FiPlus size={16} />
              <span>Nuevo Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <SearchAndFilter
        onFilter={handleFilterChange}
        filters={filterOptions}
        currentFilters={filters}
        totalItems={filteredItems.length}
        searchPlaceholder="Buscar por nombre, SKU, código de barras..."
      />

      {/* Nota explicativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiBox className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Acciones disponibles:</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li className="flex items-center space-x-2">
                <FiFileText className="w-4 h-4" />
                <span><strong>Detalles:</strong> Ver información detallada del item</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiEdit className="w-4 h-4" />
                <span><strong>Editar:</strong> Modificar información del item</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiRotateCcw className="w-4 h-4" />
                <span><strong>Restaurar:</strong> Reactivar items inactivos</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiTrash2 className="w-4 h-4" />
                <span><strong>Eliminar:</strong> Desactivar item del catálogo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de items */}
      <DataTable
        data={filteredItems}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No se encontraron items"
        emptyIcon={FiBox}
        renderRowActions={renderRowActions}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        initialSortField="Item_Nombre"
        initialSortDirection="asc"
        rowKeyField="Item_Id"
      />

      {/* Modal de formulario de item */}
      <ItemFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedItem={selectedItem}
        isLoading={isSubmitting}
        categories={categories}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={cancelDeleteItem}
        onConfirm={confirmDeleteItem}
        title="Eliminar Item"
        message={
          itemToDelete 
            ? `¿Estás seguro de que deseas ${itemToDelete.Item_Estado ? 'desactivar' : 'eliminar'} el item "${itemToDelete.Item_Nombre}"? ${itemToDelete.Item_Estado ? 'El item se desactivará pero no se eliminará permanentemente.' : 'Esta acción no se puede deshacer.'}`
            : ''
        }
        confirmText={itemToDelete?.Item_Estado ? "Desactivar" : "Eliminar"}
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Items;
