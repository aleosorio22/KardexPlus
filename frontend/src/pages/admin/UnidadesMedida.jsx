import React, { useState, useEffect, useMemo } from 'react';
import { FiTool, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { DataTable, SearchAndFilter } from '../../components/DataTable';
import { UnidadMedidaFormModal } from '../../components/Modals';
import ConfirmModal from '../../components/ConfirmModal';
import { getUnidadesMedida, createUnidadMedida, updateUnidadMedida, deleteUnidadMedida } from '../../services/unidadMedidaService';
import toast from 'react-hot-toast';

const UnidadesMedida = () => {
  const [unidades, setUnidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState(null);
  const [formData, setFormData] = useState({
    UnidadMedida_Nombre: '',
    UnidadMedida_Prefijo: '',
    UnidadMedida_Factor_Conversion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [unidadToDelete, setUnidadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros disponibles para la búsqueda
  const filterOptions = [
    {
      id: 'search',
      label: 'Búsqueda',
      type: 'text',
      defaultValue: '',
      placeholder: 'Buscar por nombre o prefijo...'
    }
  ];

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'avatar',
      header: '',
      sortable: false,
      width: '60px',
      render: (unidad) => (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
            {unidad.UnidadMedida_Nombre?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )
    },
    {
      field: 'UnidadMedida_Nombre',
      header: 'Nombre',
      render: (unidad) => (
        <div>
          <div className="font-medium text-gray-900">{unidad.UnidadMedida_Nombre}</div>
          <div className="text-sm text-gray-500">{unidad.UnidadMedida_Prefijo}</div>
        </div>
      )
    },
    {
      field: 'UnidadMedida_Prefijo',
      header: 'Prefijo',
      render: (unidad) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {unidad.UnidadMedida_Prefijo}
        </span>
      )
    },
    {
      field: 'UnidadMedida_Factor_Conversion',
      header: 'Factor de Conversión',
      render: (unidad) => (
        <div className="text-gray-900">
          {unidad.UnidadMedida_Factor_Conversion || 'N/A'}
        </div>
      )
    }
  ];
  // Cargar unidades de medida
  const loadUnidades = async () => {
    try {
      setIsLoading(true);
      const response = await getUnidadesMedida();
      console.log('Unidades loaded:', response);
      
      // Asegurar que tenemos un array
      const unidadesData = response.data || response.unidades || response || [];
      setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
    } catch (error) {
      console.error('Error loading unidades:', error);
      toast.error('Error al cargar las unidades de medida');
      setUnidades([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal para crear unidad
  const handleCreateUnidad = () => {
    setIsEditing(false);
    setSelectedUnidad(null);
    setFormData({
      UnidadMedida_Nombre: '',
      UnidadMedida_Prefijo: '',
      UnidadMedida_Factor_Conversion: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar unidad
  const handleEditUnidad = (unidad) => {
    setIsEditing(true);
    setSelectedUnidad(unidad);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnidad(null);
    setFormData({
      UnidadMedida_Nombre: '',
      UnidadMedida_Prefijo: '',
      UnidadMedida_Factor_Conversion: ''
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        // Actualizar unidad existente
        await updateUnidadMedida(selectedUnidad.UnidadMedida_Id, {
          UnidadMedida_Nombre: data.UnidadMedida_Nombre,
          UnidadMedida_Prefijo: data.UnidadMedida_Prefijo,
          UnidadMedida_Factor_Conversion: data.UnidadMedida_Factor_Conversion
        });
        toast.success('Unidad de medida actualizada exitosamente');
      } else {
        // Crear nueva unidad
        await createUnidadMedida(data);
        toast.success('Unidad de medida creada exitosamente');
      }
      
      handleCloseModal();
      loadUnidades(); // Recargar la lista
    } catch (error) {
      console.error('Error saving unidad:', error);
      toast.error(error.message || 'Error al guardar la unidad de medida');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar unidades según los criterios de búsqueda
  const filteredUnidades = useMemo(() => {
    return unidades.filter(unidad => {
      const matchesSearch = !filters.search || 
        unidad.UnidadMedida_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        unidad.UnidadMedida_Prefijo?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesSearch;
    });
  }, [unidades, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Manejar eliminación de unidad
  const handleDeleteUnidad = (unidad) => {
    setUnidadToDelete(unidad);
    setIsConfirmModalOpen(true);
  };

  // Confirmar eliminación
  const confirmDeleteUnidad = async () => {
    if (!unidadToDelete) return;

    try {
      setIsDeleting(true);
      await deleteUnidadMedida(unidadToDelete.UnidadMedida_Id);
      toast.success('Unidad de medida eliminada exitosamente');
      loadUnidades(); // Recargar la lista
      setIsConfirmModalOpen(false);
      setUnidadToDelete(null);
    } catch (error) {
      console.error('Error deleting unidad:', error);
      toast.error(error.message || 'Error al eliminar la unidad de medida');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar eliminación
  const cancelDeleteUnidad = () => {
    setIsConfirmModalOpen(false);
    setUnidadToDelete(null);
  };

  // Renderizar acciones de fila
  const renderRowActions = (unidad) => (
    <>
      <button
        onClick={() => handleEditUnidad(unidad)}
        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar unidad"
      >
        <FiEdit className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleDeleteUnidad(unidad)}
        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        title="Eliminar unidad"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  // Cargar unidades al montar el componente
  useEffect(() => {
    loadUnidades();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 rounded-full p-3">
              <FiTool className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Unidades de Medida</h1>
              <p className="text-gray-600">Administra las unidades de medida del sistema KardexPlus</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCreateUnidad}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FiPlus size={16} />
              <span>Nueva Unidad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <SearchAndFilter
        onFilter={handleFilterChange}
        filters={filterOptions}
        currentFilters={filters}
        totalItems={filteredUnidades.length}
        searchPlaceholder="Buscar por nombre, abreviación o descripción..."
      />

      {/* Nota explicativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiTool className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Acciones disponibles:</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li className="flex items-center space-x-2">
                <FiEdit className="w-4 h-4" />
                <span><strong>Editar:</strong> Modificar información de la unidad</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiTrash2 className="w-4 h-4" />
                <span><strong>Eliminar:</strong> Eliminar unidad de medida (solo si no está en uso)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de unidades */}
      <DataTable
        data={filteredUnidades}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No se encontraron unidades de medida"
        emptyIcon={FiTool}
        renderRowActions={renderRowActions}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        initialSortField="UnidadMedida_Nombre"
        initialSortDirection="asc"
        rowKeyField="UnidadMedida_Id"
      />

      {/* Modal de formulario de unidad */}
      <UnidadMedidaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedUnidad={selectedUnidad}
        isLoading={isSubmitting}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={cancelDeleteUnidad}
        onConfirm={confirmDeleteUnidad}
        title="Eliminar Unidad de Medida"
        message={
          unidadToDelete 
            ? `¿Estás seguro de que deseas eliminar la unidad "${unidadToDelete.UnidadMedida_Nombre}" (${unidadToDelete.UnidadMedida_Prefijo})? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UnidadesMedida;
