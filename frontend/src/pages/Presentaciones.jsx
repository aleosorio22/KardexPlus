import { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiEdit, FiTrash2, FiPlus, FiHash, FiRuler, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Components
import { DataTable, SearchAndFilter, EmptyState, DataTableSkeleton } from '../components/DataTable';
import PresentacionFormModal from '../components/Modals/PresentacionFormModal';
import ConfirmModal from '../components/ConfirmModal';

// Services
import presentacionService from '../services/presentacionService';

const Presentaciones = () => {
  const [presentaciones, setPresentaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPresentaciones: 0,
    unidadesMedidaUsadas: 0,
    itemsConPresentaciones: 0
  });
  const [filters, setFilters] = useState({
    search: ''
  });

  // Estados para el modal de formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPresentacion, setSelectedPresentacion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [presentacionToDelete, setPresentacionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'icon',
      header: '',
      sortable: false,
      width: '60px',
      render: (presentacion) => (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
            <FiPackage className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      )
    },
    {
      field: 'Presentacion_Nombre',
      header: 'Presentación',
      render: (presentacion) => (
        <div>
          <div className="font-medium text-gray-900">{presentacion.Presentacion_Nombre}</div>
          <div className="text-sm text-gray-500 flex items-center space-x-1">
            <FiHash className="w-3 h-3" />
            <span>{presentacion.Presentacion_Cantidad}</span>
            <span>{presentacion.UnidadMedida_Prefijo}</span>
          </div>
        </div>
      )
    },
    {
      field: 'Presentacion_Cantidad',
      header: 'Cantidad',
      sortable: true,
      render: (presentacion) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {presentacion.Presentacion_Cantidad}
          </span>
        </div>
      )
    },
    {
      field: 'UnidadMedida_Nombre',
      header: 'Unidad de Medida',
      render: (presentacion) => (
        <div className="flex items-center space-x-2">
          <FiRuler className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{presentacion.UnidadMedida_Nombre}</div>
            <div className="text-sm text-gray-500">({presentacion.UnidadMedida_Prefijo})</div>
          </div>
        </div>
      )
    },
    {
      field: 'Presentacion_Id',
      header: 'ID',
      sortable: true,
      render: (presentacion) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          #{presentacion.Presentacion_Id}
        </span>
      )
    }
  ];

  // Cargar presentaciones
  const loadPresentaciones = async () => {
    try {
      setIsLoading(true);
      const response = await presentacionService.getAllPresentaciones();
      
      if (response.success) {
        setPresentaciones(response.data);
      } else {
        toast.error('Error al cargar las presentaciones');
      }
    } catch (error) {
      console.error('Error loading presentaciones:', error);
      toast.error(error.message || 'Error al cargar las presentaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await presentacionService.getPresentacionStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Abrir modal para crear presentación
  const handleCreatePresentacion = () => {
    setSelectedPresentacion(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Abrir modal para editar presentación
  const handleEditPresentacion = (presentacion) => {
    setSelectedPresentacion(presentacion);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPresentacion(null);
    setIsEditing(false);
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      let response;
      if (isEditing) {
        response = await presentacionService.updatePresentacion(selectedPresentacion.Presentacion_Id, formData);
        toast.success('Presentación actualizada exitosamente');
      } else {
        response = await presentacionService.createPresentacion(formData);
        toast.success('Presentación creada exitosamente');
      }

      if (response.success) {
        await loadPresentaciones();
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

  // Eliminar presentación
  const handleDeletePresentacion = (presentacion) => {
    setPresentacionToDelete(presentacion);
    setIsConfirmModalOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!presentacionToDelete) return;

    try {
      setIsDeleting(true);
      const response = await presentacionService.deletePresentacion(presentacionToDelete.Presentacion_Id);
      
      if (response.success) {
        toast.success('Presentación eliminada exitosamente');
        await loadPresentaciones();
        await loadStats();
        setIsConfirmModalOpen(false);
        setPresentacionToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting presentacion:', error);
      toast.error(error.message || 'Error al eliminar la presentación');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setPresentacionToDelete(null);
  };

  // Filtrar presentaciones según los criterios de búsqueda
  const filteredPresentaciones = useMemo(() => {
    return presentaciones.filter(presentacion => {
      const matchesSearch = !filters.search || 
        presentacion.Presentacion_Nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        presentacion.UnidadMedida_Nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        presentacion.UnidadMedida_Prefijo.toLowerCase().includes(filters.search.toLowerCase());

      return matchesSearch;
    });
  }, [presentaciones, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Renderizar acciones de fila
  const renderRowActions = (presentacion) => (
    <>
      <button
        onClick={() => handleEditPresentacion(presentacion)}
        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar presentación"
      >
        <FiEdit className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleDeletePresentacion(presentacion)}
        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        title="Eliminar presentación"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  // Cargar presentaciones y estadísticas al montar el componente
  useEffect(() => {
    loadPresentaciones();
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-500/10 rounded-full w-12 h-12 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Presentaciones</h1>
              <p className="text-gray-600">Gestión de presentaciones de productos</p>
            </div>
          </div>
          
          <button 
            onClick={handleCreatePresentacion}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Nueva Presentación</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Presentaciones</p>
              <div className="text-2xl font-bold text-gray-800">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full border-b-2 border-purple-500 h-6 w-6"></div>
                  </div>
                ) : (
                  stats.totalPresentaciones
                )}
              </div>
            </div>
            <div className="bg-purple-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unidades de Medida Usadas</p>
              <div className="text-2xl font-bold text-gray-800">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full border-b-2 border-blue-500 h-6 w-6"></div>
                  </div>
                ) : (
                  stats.unidadesMedidaUsadas
                )}
              </div>
            </div>
            <div className="bg-blue-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <FiRuler className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items con Presentaciones</p>
              <div className="text-2xl font-bold text-gray-800">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full border-b-2 border-green-500 h-6 w-6"></div>
                  </div>
                ) : (
                  stats.itemsConPresentaciones || 0
                )}
              </div>
            </div>
            <div className="bg-green-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-green-500" />
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
            searchPlaceholder="Buscar presentaciones, unidades de medida..."
            additionalFilters={[]}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Contenido de la tabla */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <DataTableSkeleton />
          ) : filteredPresentaciones.length === 0 ? (
            <EmptyState
              icon={FiPackage}
              title="No hay presentaciones"
              description="Comienza creando tu primera presentación para organizar tus productos."
              actionLabel="Crear Primera Presentación"
              onAction={handleCreatePresentacion}
            />
          ) : (
            <DataTable
              data={filteredPresentaciones}
              columns={columns}
              renderRowActions={renderRowActions}
            />
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      <PresentacionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        presentacion={selectedPresentacion}
        isSubmitting={isSubmitting}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Eliminar Presentación"
        message={`¿Estás seguro de que deseas eliminar la presentación "${presentacionToDelete?.Presentacion_Nombre}"?`}
        description="Esta acción no se puede deshacer. La presentación será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Presentaciones;
