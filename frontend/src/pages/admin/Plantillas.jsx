import React, { useState, useEffect, useMemo } from 'react';
import { FiLayers, FiPlus, FiTrash2, FiUsers, FiCalendar, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ResponsiveDataView, SearchAndFilter } from '../../components/DataTable';
import { PlantillaFormModal } from '../../components/Modals';
import ConfirmModal from '../../components/ConfirmModal';
import plantillaService from '../../services/plantillaService';
import toast from 'react-hot-toast';

const Plantillas = () => {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tipo_plantilla: '',
    subtipo_plantilla: ''
  });

  // Estados para el modal de formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Plantilla_Nombre: '',
    Plantilla_Descripcion: '',
    Tipo_Plantilla: '',
    Subtipo_Plantilla: '',
    Origen_Bodega_Id: '',
    Destino_Bodega_Id: '',
    Configuracion_Adicional: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [plantillaToDelete, setPlantillaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Opciones de filtros
  const filterOptions = [
    {
      id: 'search',
      label: 'Búsqueda',
      type: 'text',
      defaultValue: '',
      placeholder: 'Buscar por nombre o descripción...'
    },
    {
      id: 'tipo_plantilla',
      label: 'Tipo',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los tipos' },
        { value: 'Requerimiento', label: 'Requerimiento' },
        { value: 'Movimiento', label: 'Movimiento' },
        { value: 'Compra', label: 'Compra' }
      ]
    },
    {
      id: 'subtipo_plantilla',
      label: 'Subtipo',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los subtipos' },
        { value: 'Entrada', label: 'Entrada' },
        { value: 'Salida', label: 'Salida' },
        { value: 'Transferencia', label: 'Transferencia' },
        { value: 'Ajuste', label: 'Ajuste' }
      ]
    }
  ];

  // Configuración de columnas para la tabla (desktop)
  const columns = [
    {
      field: 'avatar',
      header: '',
      sortable: false,
      width: '60px',
      render: (plantilla) => (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium text-sm">
            <FiLayers className="w-5 h-5" />
          </div>
        </div>
      )
    },
    {
      field: 'Plantilla_Nombre',
      header: 'Plantilla',
      render: (plantilla) => (
        <div>
          <div className="font-medium text-gray-900">{plantilla.Plantilla_Nombre}</div>
          {plantilla.Plantilla_Descripcion && (
            <div className="text-sm text-gray-500 truncate max-w-md">
              {plantilla.Plantilla_Descripcion}
            </div>
          )}
        </div>
      )
    },
    {
      field: 'Tipo_Plantilla',
      header: 'Tipo',
      render: (plantilla) => {
        const tipoColors = {
          'Requerimiento': 'bg-blue-100 text-blue-800',
          'Movimiento': 'bg-indigo-100 text-indigo-800',
          'Compra': 'bg-green-100 text-green-800'
        };
        return (
          <div className="space-y-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tipoColors[plantilla.Tipo_Plantilla] || 'bg-gray-100 text-gray-800'
            }`}>
              {plantilla.Tipo_Plantilla}
            </span>
            {plantilla.Subtipo_Plantilla && (
              <div className="text-xs text-gray-500">
                {plantilla.Subtipo_Plantilla}
              </div>
            )}
          </div>
        );
      }
    },
    {
      field: 'bodegas',
      header: 'Bodegas',
      render: (plantilla) => (
        <div className="space-y-1 text-sm">
          {plantilla.Origen_Bodega_Nombre && (
            <div className="text-gray-700">
              <span className="font-medium">Origen:</span> {plantilla.Origen_Bodega_Nombre}
            </div>
          )}
          {plantilla.Destino_Bodega_Nombre && (
            <div className="text-gray-700">
              <span className="font-medium">Destino:</span> {plantilla.Destino_Bodega_Nombre}
            </div>
          )}
          {!plantilla.Origen_Bodega_Nombre && !plantilla.Destino_Bodega_Nombre && (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      field: 'estadisticas',
      header: 'Items / Usuarios',
      render: (plantilla) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-sm text-gray-700">
            <FiPackage className="w-4 h-4 text-gray-400" />
            <span>{plantilla.Total_Items || 0} items</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-700">
            <FiUsers className="w-4 h-4 text-gray-400" />
            <span>{plantilla.Total_Usuarios_Asignados || 0} usuarios</span>
          </div>
        </div>
      )
    },
    {
      field: 'Creador_Nombre_Completo',
      header: 'Creador',
      render: (plantilla) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{plantilla.Creador_Nombre_Completo}</div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <FiCalendar className="w-3 h-3" />
            <span>{formatFecha(plantilla.Fecha_Creacion)}</span>
          </div>
        </div>
      )
    }
  ];

  // Renderizar card para vista móvil
  const renderCard = (plantilla) => {
    const tipoColors = {
      'Requerimiento': 'bg-blue-100 text-blue-800',
      'Movimiento': 'bg-indigo-100 text-indigo-800',
      'Compra': 'bg-green-100 text-green-800'
    };

    return (
      <div className="space-y-3">
        {/* Header del Card */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
              <FiLayers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {plantilla.Plantilla_Nombre}
              </h3>
              {plantilla.Plantilla_Descripcion && (
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {plantilla.Plantilla_Descripcion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tipo y Subtipo */}
        <div className="flex items-center flex-wrap gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            tipoColors[plantilla.Tipo_Plantilla] || 'bg-gray-100 text-gray-800'
          }`}>
            {plantilla.Tipo_Plantilla}
          </span>
          {plantilla.Subtipo_Plantilla && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {plantilla.Subtipo_Plantilla}
            </span>
          )}
        </div>

        {/* Bodegas */}
        {(plantilla.Origen_Bodega_Nombre || plantilla.Destino_Bodega_Nombre) && (
          <div className="space-y-1 text-sm">
            {plantilla.Origen_Bodega_Nombre && (
              <div className="text-gray-700">
                <span className="font-medium">Origen:</span> {plantilla.Origen_Bodega_Nombre}
              </div>
            )}
            {plantilla.Destino_Bodega_Nombre && (
              <div className="text-gray-700">
                <span className="font-medium">Destino:</span> {plantilla.Destino_Bodega_Nombre}
              </div>
            )}
          </div>
        )}

        {/* Estadísticas */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FiPackage className="w-4 h-4" />
              <span>{plantilla.Total_Items || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers className="w-4 h-4" />
              <span>{plantilla.Total_Usuarios_Asignados || 0}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {formatFecha(plantilla.Fecha_Creacion)}
          </div>
        </div>

        {/* Acciones en móvil */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(plantilla);
            }}
            className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    );
  };

  // Renderizar acciones para la tabla (desktop)
  const renderRowActions = (plantilla) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(plantilla);
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Eliminar"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  // Cargar plantillas
  const loadPlantillas = async () => {
    try {
      setIsLoading(true);
      const response = await plantillaService.getAllPlantillas({
        ver_todas: true
      });
      console.log('Plantillas loaded:', response);
      
      const plantillasData = response.data || response.plantillas || response || [];
      setPlantillas(Array.isArray(plantillasData) ? plantillasData : []);
    } catch (error) {
      console.error('Error loading plantillas:', error);
      toast.error('Error al cargar las plantillas');
      setPlantillas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadPlantillas();
  }, []);

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreate = () => {
    setFormData({
      Plantilla_Nombre: '',
      Plantilla_Descripcion: '',
      Tipo_Plantilla: '',
      Subtipo_Plantilla: '',
      Origen_Bodega_Id: '',
      Destino_Bodega_Id: '',
      Configuracion_Adicional: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      Plantilla_Nombre: '',
      Plantilla_Descripcion: '',
      Tipo_Plantilla: '',
      Subtipo_Plantilla: '',
      Origen_Bodega_Id: '',
      Destino_Bodega_Id: '',
      Configuracion_Adicional: ''
    });
  };

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Crear nueva plantilla
      const createData = {
        plantilla: {
          Plantilla_Nombre: data.Plantilla_Nombre,
          Plantilla_Descripcion: data.Plantilla_Descripcion,
          Tipo_Plantilla: data.Tipo_Plantilla,
          Subtipo_Plantilla: data.Subtipo_Plantilla,
          Origen_Bodega_Id: data.Origen_Bodega_Id || null,
          Destino_Bodega_Id: data.Destino_Bodega_Id || null,
          Configuracion_Adicional: data.Configuracion_Adicional || null
        },
        items: [], // Por ahora vacío, se agregarán en la página de detalles
        usuarios_asignados: [] // Por ahora vacío, se asignarán en la página de detalles
      };

      const response = await plantillaService.crearPlantilla(createData);
      toast.success('Plantilla creada exitosamente');
      handleCloseModal();
      loadPlantillas();

      // Navegar a la página de detalles si se creó exitosamente
      if (response.data && response.data.plantilla_id) {
        setTimeout(() => {
          navigate(`/configuracion/plantillas/${response.data.plantilla_id}`);
        }, 500);
      }
    } catch (error) {
      console.error('Error al guardar plantilla:', error);
      toast.error(error.message || 'Error al guardar la plantilla');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (plantilla) => {
    setPlantillaToDelete(plantilla);
    setIsConfirmModalOpen(true);
  };

  const confirmDeletePlantilla = async () => {
    if (!plantillaToDelete) return;

    try {
      setIsDeleting(true);
      await plantillaService.eliminarPlantilla(plantillaToDelete.Plantilla_Id);
      toast.success('Plantilla eliminada exitosamente');
      setIsConfirmModalOpen(false);
      setPlantillaToDelete(null);
      loadPlantillas();
    } catch (error) {
      console.error('Error deleting plantilla:', error);
      toast.error('Error al eliminar la plantilla');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeletePlantilla = () => {
    setIsConfirmModalOpen(false);
    setPlantillaToDelete(null);
  };

  const handleRowClick = (plantilla) => {
    navigate(`/configuracion/plantillas/${plantilla.Plantilla_Id}`);
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtrar plantillas localmente
  const filteredPlantillas = useMemo(() => {
    return plantillas.filter(plantilla => {
      const matchSearch = !filters.search || 
        plantilla.Plantilla_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        plantilla.Plantilla_Descripcion?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchTipo = !filters.tipo_plantilla || 
        plantilla.Tipo_Plantilla === filters.tipo_plantilla;
      
      const matchSubtipo = !filters.subtipo_plantilla || 
        plantilla.Subtipo_Plantilla === filters.subtipo_plantilla;

      return matchSearch && matchTipo && matchSubtipo;
    });
  }, [plantillas, filters]);

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiLayers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Plantillas</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                Gestión de plantillas para requerimientos, movimientos y compras
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm space-x-2 w-full sm:w-auto"
          >
            <FiPlus className="w-5 h-5" />
            <span>Nueva Plantilla</span>
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6">
        <SearchAndFilter
          filters={filterOptions}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      {/* Tabla/Cards Responsivo */}
      <ResponsiveDataView
        data={filteredPlantillas}
        columns={columns}
        renderCard={renderCard}
        isLoading={isLoading}
        emptyMessage="No se encontraron plantillas"
        emptyIcon={<FiLayers className="w-12 h-12 text-gray-400" />}
        rowKeyField="Plantilla_Id"
        pagination={true}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        initialSortField="Fecha_Creacion"
        initialSortDirection="desc"
        onRowClick={handleRowClick}
        renderRowActions={renderRowActions}
        mobileBreakpoint="lg"
        className="mb-6"
      />

      {/* Modal de Formulario */}
      <PlantillaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={false}
        selectedPlantilla={null}
        isLoading={isSubmitting}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={cancelDeletePlantilla}
        onConfirm={confirmDeletePlantilla}
        title="Eliminar Plantilla"
        message={
          plantillaToDelete 
            ? `¿Estás seguro de que deseas eliminar la plantilla "${plantillaToDelete.Plantilla_Nombre}"? Esta acción desactivará la plantilla pero no eliminará su historial.`
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

export default Plantillas;
