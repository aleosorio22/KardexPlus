import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Package, Plus, Search, Folder, Edit, Trash2, AlertCircle } from 'lucide-react';
import { FiEdit, FiTrash2, FiTag } from 'react-icons/fi';
import { DataTable, SearchAndFilter } from '../components/DataTable';
import { CategoryFormModal } from '../components/Modals';
import categoryService from '../services/categoryService';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: ''
  });

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    CategoriaItem_Nombre: '',
    CategoriaItem_Descripcion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'icon',
      header: '',
      sortable: false,
      width: '60px',
      render: () => (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
            <FiTag className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      )
    },
    {
      field: 'CategoriaItem_Nombre',
      header: 'Nombre',
      render: (category) => (
        <div>
          <div className="font-medium text-gray-900">{category.CategoriaItem_Nombre}</div>
          {category.CategoriaItem_Descripcion && (
            <div className="text-sm text-gray-500 truncate max-w-xs" title={category.CategoriaItem_Descripcion}>
              {category.CategoriaItem_Descripcion}
            </div>
          )}
        </div>
      )
    },
    {
      field: 'CategoriaItem_Id',
      header: 'ID',
      width: '80px',
      render: (category) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          #{category.CategoriaItem_Id}
        </span>
      )
    }
  ];

  // Cargar categorías
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryService.getAllCategories();
      console.log('Categories loaded:', response);
      
      const categoriesData = response.data || response.categories || response || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar las categorías');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await categoryService.getCategoryStats();
      const statsData = response.data || {};
      setStats({
        totalCategories: statsData.totalCategories || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ totalCategories: 0 });
    }
  };

  // Abrir modal para crear categoría
  const handleCreateCategory = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setFormData({
      CategoriaItem_Nombre: '',
      CategoriaItem_Descripcion: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar categoría
  const handleEditCategory = (category) => {
    setIsEditing(true);
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData({
      CategoriaItem_Nombre: '',
      CategoriaItem_Descripcion: ''
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedCategory) {
        await categoryService.updateCategory(selectedCategory.CategoriaItem_Id, data);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await categoryService.createCategory(data);
        toast.success('Categoría creada exitosamente');
      }
      
      handleCloseModal();
      loadCategories();
      loadStats();
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.message || 'Error al guardar la categoría';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.CategoriaItem_Nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(category.CategoriaItem_Id);
      toast.success('Categoría eliminada exitosamente');
      loadCategories();
      loadStats();
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.message || 'Error al eliminar la categoría';
      toast.error(errorMessage);
    }
  };

  // Filtrar categorías según búsqueda
  const filteredCategories = useMemo(() => {
    if (!filters.search.trim()) return categories;
    
    const search = filters.search.toLowerCase();
    return categories.filter(category => 
      category.CategoriaItem_Nombre?.toLowerCase().includes(search) ||
      category.CategoriaItem_Descripcion?.toLowerCase().includes(search)
    );
  }, [categories, filters.search]);

  // Renderizar acciones de fila
  const renderRowActions = (category) => (
    <>
      <button
        onClick={() => handleEditCategory(category)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Editar categoría"
      >
        <FiEdit className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDeleteCategory(category)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Eliminar categoría"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
              <p className="text-gray-600">Gestión de categorías de items</p>
            </div>
          </div>
          
          <button 
            onClick={handleCreateCategory}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categorías</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCategories}</p>
            </div>
            <div className="bg-blue-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <Folder className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Categorizados</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <div className="bg-green-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Última Actualización</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <div className="bg-yellow-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Área principal de contenido */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Barra de herramientas */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800">Lista de Categorías</h2>
              {filteredCategories.length > 0 && (
                <span className="text-sm text-gray-500">
                  {filteredCategories.length} de {categories.length} categorías
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de categorías */}
        <div className="p-6">
          <DataTable
            data={filteredCategories}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No hay categorías registradas"
            emptyIcon={<Tag className="w-8 h-8 text-gray-400" />}
            rowKeyField="CategoriaItem_Id"
            renderRowActions={renderRowActions}
            initialPageSize={10}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* Modal de formulario */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedCategory={selectedCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Categories;
