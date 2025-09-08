import { useState, useEffect, useMemo } from 'react';
import { FiTag, FiEdit, FiTrash2, FiPlus, FiFolder, FiPackage, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Components
import { DataTable, SearchAndFilter, EmptyState, DataTableSkeleton } from '../components/DataTable';
import { CategoryFormModal } from '../components/Modals';
import ConfirmModal from '../components/ConfirmModal';

// Services
import categoryService from '../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCategories: 0,
    itemsCount: 0,
    lastUpdate: null
  });
  const [filters, setFilters] = useState({
    search: ''
  });

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'icon',
      header: '',
      sortable: false,
      width: '60px',
      render: (category) => (
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
          <div className="text-sm text-gray-500">
            {category.CategoriaItem_Descripcion || 'Sin descripción'}
          </div>
        </div>
      )
    },
    {
      field: 'CategoriaItem_Id',
      header: 'ID',
      sortable: true,
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
      
      if (response.success) {
        setCategories(response.data);
      } else {
        toast.error('Error al cargar las categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error(error.message || 'Error al cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await categoryService.getCategoryStats();
      
      if (response.success) {
        setStats(prev => ({
          ...prev,
          totalCategories: response.data.totalCategories
        }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Abrir modal para crear categoría
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Abrir modal para editar categoría
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setIsEditing(false);
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      let response;
      if (isEditing) {
        response = await categoryService.updateCategory(selectedCategory.CategoriaItem_Id, formData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        response = await categoryService.createCategory(formData);
        toast.success('Categoría creada exitosamente');
      }

      if (response.success) {
        await loadCategories();
        await loadStats();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsConfirmModalOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      const response = await categoryService.deleteCategory(categoryToDelete.CategoriaItem_Id);
      
      if (response.success) {
        toast.success('Categoría eliminada exitosamente');
        await loadCategories();
        await loadStats();
        setIsConfirmModalOpen(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Error al eliminar la categoría');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setCategoryToDelete(null);
  };

  // Filtrar categorías según los criterios de búsqueda
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = !filters.search || 
        category.CategoriaItem_Nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        (category.CategoriaItem_Descripcion && category.CategoriaItem_Descripcion.toLowerCase().includes(filters.search.toLowerCase()));

      return matchesSearch;
    });
  }, [categories, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Renderizar acciones de fila
  const renderRowActions = (category) => (
    <>
      <button
        onClick={() => handleEditCategory(category)}
        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar categoría"
      >
        <FiEdit className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleDeleteCategory(category)}
        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        title="Eliminar categoría"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  // Cargar categorías y estadísticas al montar el componente
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
              <FiTag className="w-6 h-6 text-blue-500" />
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
            <FiPlus className="w-4 h-4" />
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
              <div className="text-2xl font-bold text-gray-800">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full border-b-2 border-blue-500 h-6 w-6"></div>
                  </div>
                ) : (
                  stats.totalCategories
                )}
              </div>
            </div>
            <div className="bg-blue-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <FiFolder className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Categorizados</p>
              <div className="text-2xl font-bold text-gray-800">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full border-b-2 border-green-500 h-6 w-6"></div>
                  </div>
                ) : (
                  stats.itemsCount || '-'
                )}
              </div>
            </div>
            <div className="bg-green-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorías Activas</p>
              <div className="text-2xl font-bold text-gray-800">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full border-b-2 border-yellow-500 h-6 w-6"></div>
                  </div>
                ) : (
                  filteredCategories.length
                )}
              </div>
            </div>
            <div className="bg-yellow-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <FiClock className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Área principal de contenido */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Barra de búsqueda y filtros */}
        <div className="p-6 border-b border-gray-200">
          <SearchAndFilter
            searchValue={filters.search}
            onSearchChange={(search) => handleFilterChange({ search })}
            searchPlaceholder="Buscar categorías..."
            additionalFilters={[]}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Contenido de la tabla */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <DataTableSkeleton />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              icon={FiTag}
              title="No hay categorías"
              description="Comienza creando tu primera categoría para organizar tus items."
              actionLabel="Crear Primera Categoría"
              onAction={handleCreateCategory}
            />
          ) : (
            <DataTable
              data={filteredCategories}
              columns={columns}
              renderRowActions={renderRowActions}
            />
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        isSubmitting={isSubmitting}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.CategoriaItem_Nombre}"?`}
        description="Esta acción no se puede deshacer. La categoría será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Categories;
