import React, { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiPlus, FiEdit, FiTrash2, FiHash, FiLayers } from 'react-icons/fi';
import { DataTable, SearchAndFilter } from '../components/DataTable';
import { PresentacionFormModal } from '../components/Modals';
import ConfirmModal from '../components/ConfirmModal';
import presentacionService from '../services/presentacionService';
import toast from 'react-hot-toast';

const Presentaciones = () => {
  const [presentaciones, setPresentaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPresentacion, setSelectedPresentacion] = useState(null);
  const [formData, setFormData] = useState({
    Presentacion_Nombre: '',
    Presentacion_Cantidad: '',
    UnidadMedida_Id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [presentacionToDelete, setPresentacionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros disponibles para la búsqueda
  const filterOptions = [
    {
      id: 'search',
      label: 'Búsqueda',
      type: 'text',
      defaultValue: '',
      placeholder: 'Buscar por nombre, cantidad o unidad de medida...'
    }
  ];

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'avatar',
      header: '',
      sortable: false,
      width: '60px',
      render: (presentacion) => (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
            {presentacion.Presentacion_Nombre?.charAt(0)?.toUpperCase() || 'P'}
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
          <FiLayers className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{presentacion.UnidadMedida_Nombre}</div>
            <div className="text-sm text-gray-500">({presentacion.UnidadMedida_Prefijo})</div>
          </div>
        </div>
      )
    }
  ];

  // Cargar presentaciones
  const loadPresentaciones = async () => {
    try {
      setIsLoading(true);
      const response = await presentacionService.getAllPresentaciones();
      console.log('Presentaciones loaded:', response);
      
      // Asegurar que tenemos un array
      const presentacionesData = response.data || response.presentaciones || response || [];
      setPresentaciones(Array.isArray(presentacionesData) ? presentacionesData : []);
    } catch (error) {
      console.error('Error loading presentaciones:', error);
      toast.error('Error al cargar las presentaciones');
      setPresentaciones([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal para crear presentación
  const handleCreatePresentacion = () => {
    setIsEditing(false);
    setSelectedPresentacion(null);
    setFormData({
      Presentacion_Nombre: '',
      Presentacion_Cantidad: '',
      UnidadMedida_Id: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar presentación
  const handleEditPresentacion = (presentacion) => {
    setIsEditing(true);
    setSelectedPresentacion(presentacion);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPresentacion(null);
    setFormData({
      Presentacion_Nombre: '',
      Presentacion_Cantidad: '',
      UnidadMedida_Id: ''
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        // Actualizar presentación existente
        await presentacionService.updatePresentacion(selectedPresentacion.Presentacion_Id, {
          Presentacion_Nombre: data.Presentacion_Nombre,
          Presentacion_Cantidad: data.Presentacion_Cantidad,
          UnidadMedida_Id: data.UnidadMedida_Id
        });
        toast.success('Presentación actualizada exitosamente');
      } else {
        // Crear nueva presentación
        await presentacionService.createPresentacion(data);
        toast.success('Presentación creada exitosamente');
      }
      
      handleCloseModal();
      loadPresentaciones(); // Recargar la lista
    } catch (error) {
      console.error('Error saving presentacion:', error);
      toast.error(error.message || 'Error al guardar la presentación');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar presentaciones según los criterios de búsqueda
  const filteredPresentaciones = useMemo(() => {
    return presentaciones.filter(presentacion => {
      const matchesSearch = !filters.search || 
        presentacion.Presentacion_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        presentacion.UnidadMedida_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        presentacion.UnidadMedida_Prefijo?.toLowerCase().includes(filters.search.toLowerCase()) ||
        presentacion.Presentacion_Cantidad?.toString().includes(filters.search.toLowerCase());

      return matchesSearch;
    });
  }, [presentaciones, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Manejar eliminación de presentación
  const handleDeletePresentacion = (presentacion) => {
    setPresentacionToDelete(presentacion);
    setIsConfirmModalOpen(true);
  };

  // Confirmar eliminación
  const confirmDeletePresentacion = async () => {
    if (!presentacionToDelete) return;

    try {
      setIsDeleting(true);
      await presentacionService.deletePresentacion(presentacionToDelete.Presentacion_Id);
      toast.success('Presentación eliminada exitosamente');
      loadPresentaciones(); // Recargar la lista
      setIsConfirmModalOpen(false);
      setPresentacionToDelete(null);
    } catch (error) {
      console.error('Error deleting presentacion:', error);
      toast.error(error.message || 'Error al eliminar la presentación');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar eliminación
  const cancelDeletePresentacion = () => {
    setIsConfirmModalOpen(false);
    setPresentacionToDelete(null);
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

  // Cargar presentaciones al montar el componente
  useEffect(() => {
    loadPresentaciones();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 rounded-full p-3">
              <FiPackage className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Presentaciones</h1>
              <p className="text-gray-600">Administra las presentaciones de productos del sistema KardexPlus</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCreatePresentacion}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FiPlus size={16} />
              <span>Nueva Presentación</span>
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <SearchAndFilter
        onFilter={handleFilterChange}
        filters={filterOptions}
        currentFilters={filters}
        totalItems={filteredPresentaciones.length}
        searchPlaceholder="Buscar por nombre, cantidad o unidad de medida..."
      />

      {/* Nota explicativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiPackage className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Acerca de las presentaciones:</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li className="flex items-center space-x-2">
                <FiHash className="w-4 h-4" />
                <span><strong>Cantidad:</strong> Define cuántas unidades base contiene esta presentación</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiLayers className="w-4 h-4" />
                <span><strong>Unidad de Medida:</strong> Especifica en qué unidad se mide la cantidad</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiEdit className="w-4 h-4" />
                <span><strong>Ejemplo:</strong> Fardo = 100 unidades, Paquete = 10 unidades</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de presentaciones */}
      <DataTable
        data={filteredPresentaciones}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No se encontraron presentaciones"
        emptyIcon={FiPackage}
        renderRowActions={renderRowActions}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        initialSortField="Presentacion_Nombre"
        initialSortDirection="asc"
        rowKeyField="Presentacion_Id"
      />

      {/* Modal de formulario de presentación */}
      <PresentacionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedPresentacion={selectedPresentacion}
        isLoading={isSubmitting}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={cancelDeletePresentacion}
        onConfirm={confirmDeletePresentacion}
        title="Eliminar Presentación"
        message={
          presentacionToDelete 
            ? `¿Estás seguro de que deseas eliminar la presentación "${presentacionToDelete.Presentacion_Nombre}" (${presentacionToDelete.Presentacion_Cantidad} ${presentacionToDelete.UnidadMedida_Prefijo})? Esta acción no se puede deshacer.`
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

export default Presentaciones;
