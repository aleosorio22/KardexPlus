import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiDatabase, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiRotateCcw,
  FiUser,
  FiMapPin,
  FiTag,
  FiFileText
} from 'react-icons/fi';
import bodegaService from '../services/bodegaService';
import userService from '../services/userService';
import DataTable from '../components/DataTable/DataTable';
import SearchAndFilter from '../components/DataTable/SearchAndFilter';
import { BodegaFormModal } from '../components/Modals';
import ConfirmModal from '../components/ConfirmModal';

const Bodegas = () => {
  const navigate = useNavigate();
  const [bodegas, setBodegas] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    responsable: '',
    estado: ''
  });

  // Estados para el modal de formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBodega, setSelectedBodega] = useState(null);
  const [formData, setFormData] = useState({
    Bodega_Nombre: '',
    Bodega_Tipo: '',
    Bodega_Ubicacion: '',
    Responsable_Id: '',
    Bodega_Estado: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  // Tipos de bodega únicos para filtros
  const tiposBodega = useMemo(() => {
    const tipos = [...new Set(bodegas.map(bodega => bodega.Bodega_Tipo).filter(Boolean))];
    return [
      { value: '', label: 'Todos los tipos' },
      ...tipos.map(tipo => ({ value: tipo, label: tipo }))
    ];
  }, [bodegas]);

  // Filtros disponibles para la búsqueda
  const filterOptions = [
    {
      id: 'tipo',
      label: 'Tipo de Bodega',
      type: 'select',
      defaultValue: '',
      options: tiposBodega
    },
    {
      id: 'responsable',
      label: 'Responsable',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los responsables' },
        { value: 'sin_responsable', label: 'Sin responsable' },
        ...users.map(user => ({
          value: user.Usuario_Id.toString(),
          label: `${user.Usuario_Nombre} ${user.Usuario_Apellido}`
        }))
      ]
    },
    {
      id: 'estado',
      label: 'Estado',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: '1', label: 'Activa' },
        { value: '0', label: 'Inactiva' }
      ]
    }
  ];

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'Bodega_Nombre',
      header: 'Bodega',
      render: (bodega) => (
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/10 rounded-full p-2">
            <FiDatabase className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{bodega.Bodega_Nombre}</div>
            {bodega.Bodega_Ubicacion && (
              <div className="text-sm text-gray-500 flex items-center space-x-1">
                <FiMapPin className="w-3 h-3" />
                <span>{bodega.Bodega_Ubicacion}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      field: 'Bodega_Tipo',
      header: 'Tipo',
      render: (bodega) => {
        if (!bodega.Bodega_Tipo) return <span className="text-gray-400">Sin tipo</span>;
        
        const tipoColors = {
          'Central': 'bg-blue-100 text-blue-800',
          'Producción': 'bg-green-100 text-green-800',
          'Frío': 'bg-cyan-100 text-cyan-800',
          'Temporal': 'bg-yellow-100 text-yellow-800',
          'Descarte': 'bg-red-100 text-red-800'
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            tipoColors[bodega.Bodega_Tipo] || 'bg-gray-100 text-gray-800'
          }`}>
            <FiTag className="w-3 h-3 mr-1" />
            {bodega.Bodega_Tipo}
          </span>
        );
      }
    },
    {
      field: 'Responsable_Nombre',
      header: 'Responsable',
      render: (bodega) => (
        <div className="flex items-center space-x-2">
          <FiUser className="w-4 h-4 text-gray-400" />
          {bodega.Responsable_Nombre ? (
            <span className="text-gray-900">
              {bodega.Responsable_Nombre} {bodega.Responsable_Apellido}
            </span>
          ) : (
            <span className="text-gray-400">Sin responsable</span>
          )}
        </div>
      )
    },
    {
      field: 'Bodega_Estado',
      header: 'Estado',
      render: (bodega) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          bodega.Bodega_Estado 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {bodega.Bodega_Estado ? 'Activa' : 'Inactiva'}
        </span>
      )
    }
  ];

  // Cargar bodegas
  const loadBodegas = async () => {
    try {
      setIsLoading(true);
      const response = await bodegaService.getAllBodegas();
      if (response.success) {
        setBodegas(response.data || []);
      } else {
        console.error('Error al cargar bodegas:', response.message);
      }
    } catch (error) {
      console.error('Error al cargar bodegas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.data.filter(user => user.Usuario_Estado === 1) || []);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // Abrir modal para crear bodega
  const handleCreateBodega = () => {
    setIsEditing(false);
    setSelectedBodega(null);
    setFormData({
      Bodega_Nombre: '',
      Bodega_Tipo: '',
      Bodega_Ubicacion: '',
      Responsable_Id: '',
      Bodega_Estado: true
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar bodega
  const handleEditBodega = (bodega) => {
    setIsEditing(true);
    setSelectedBodega(bodega);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBodega(null);
    setFormData({
      Bodega_Nombre: '',
      Bodega_Tipo: '',
      Bodega_Ubicacion: '',
      Responsable_Id: '',
      Bodega_Estado: true
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      let response;

      if (isEditing) {
        response = await bodegaService.updateBodega(selectedBodega.Bodega_Id, data);
      } else {
        response = await bodegaService.createBodega(data);
      }

      if (response.success) {
        await loadBodegas();
        handleCloseModal();
      } else {
        console.error('Error al guardar bodega:', response.message);
      }
    } catch (error) {
      console.error('Error al guardar bodega:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar bodegas según los criterios de búsqueda
  const filteredBodegas = useMemo(() => {
    return bodegas.filter(bodega => {
      // Filtro de búsqueda por texto
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          bodega.Bodega_Nombre?.toLowerCase().includes(searchLower) ||
          bodega.Bodega_Tipo?.toLowerCase().includes(searchLower) ||
          bodega.Bodega_Ubicacion?.toLowerCase().includes(searchLower) ||
          bodega.Responsable_Nombre?.toLowerCase().includes(searchLower) ||
          bodega.Responsable_Apellido?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por tipo
      if (filters.tipo && bodega.Bodega_Tipo !== filters.tipo) {
        return false;
      }

      // Filtro por responsable
      if (filters.responsable) {
        if (filters.responsable === 'sin_responsable') {
          if (bodega.Responsable_Id) return false;
        } else {
          if (bodega.Responsable_Id?.toString() !== filters.responsable) return false;
        }
      }

      // Filtro por estado
      if (filters.estado) {
        const isActive = filters.estado === '1';
        if (bodega.Bodega_Estado !== isActive) return false;
      }

      return true;
    });
  }, [bodegas, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Eliminar bodega
  const handleDeleteBodega = (bodega) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar bodega?',
      message: `¿Estás seguro de que deseas eliminar la bodega "${bodega.Bodega_Nombre}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await bodegaService.deleteBodega(bodega.Bodega_Id);
          if (response.success) {
            await loadBodegas();
          }
        } catch (error) {
          console.error('Error al eliminar bodega:', error);
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  // Restaurar bodega
  const handleRestoreBodega = (bodega) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Restaurar bodega?',
      message: `¿Estás seguro de que deseas restaurar la bodega "${bodega.Bodega_Nombre}"?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const response = await bodegaService.restoreBodega(bodega.Bodega_Id);
          if (response.success) {
            await loadBodegas();
          }
        } catch (error) {
          console.error('Error al restaurar bodega:', error);
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  // Navegar a los detalles de la bodega
  const handleViewBodegaDetails = (bodega) => {
    navigate(`/configuracion/bodegas/${bodega.Bodega_Id}/detalles`);
  };

  // Renderizar acciones de fila
  const renderRowActions = (bodega) => (
    <>
      <button
        onClick={() => handleViewBodegaDetails(bodega)}
        className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
        title="Ver detalles de la bodega"
      >
        <FiFileText className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleEditBodega(bodega)}
        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar bodega"
      >
        <FiEdit className="w-4 h-4" />
      </button>
      
      {bodega.Bodega_Estado ? (
        <button
          onClick={() => handleDeleteBodega(bodega)}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title="Eliminar bodega"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => handleRestoreBodega(bodega)}
          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
          title="Restaurar bodega"
        >
          <FiRotateCcw className="w-4 h-4" />
        </button>
      )}
    </>
  );

  // Cargar datos al montar el componente
  useEffect(() => {
    loadBodegas();
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 rounded-full p-3">
              <FiDatabase className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Bodegas</h1>
              <p className="text-gray-600">Administra las bodegas del sistema KardexPlus</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCreateBodega}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiPlus size={16} />
              <span>Nueva Bodega</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <SearchAndFilter
        onFilter={handleFilterChange}
        filters={filterOptions}
        currentFilters={filters}
        totalItems={filteredBodegas.length}
        searchPlaceholder="Buscar por nombre, tipo, ubicación, responsable..."
      />

      {/* Información de acciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiDatabase className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Acciones disponibles:</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li className="flex items-center space-x-2">
                <FiFileText className="w-4 h-4" />
                <span><strong>Detalles:</strong> Ver información detallada y configurar parámetros</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiEdit className="w-4 h-4" />
                <span><strong>Editar:</strong> Modificar información de la bodega</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiTrash2 className="w-4 h-4" />
                <span><strong>Eliminar:</strong> Remover bodega (solo bodegas activas)</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiRotateCcw className="w-4 h-4" />
                <span><strong>Restaurar:</strong> Reactivar bodega eliminada</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={filteredBodegas}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No se encontraron bodegas"
        emptyIcon={FiDatabase}
        renderRowActions={renderRowActions}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        initialSortField="Bodega_Nombre"
        initialSortDirection="asc"
        rowKeyField="Bodega_Id"
      />

      {/* Modal de formulario */}
      <BodegaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedBodega={selectedBodega}
        isLoading={isSubmitting}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.type === 'danger' ? 'Eliminar' : 'Confirmar'}
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Bodegas;
