import React, { useState, useEffect, useMemo } from 'react';
import { FiLayers, FiPackage, FiUsers, FiEdit2, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ResponsiveDataView, SearchAndFilter } from '../components/DataTable';
import plantillaService from '../services/plantillaService';
import toast from 'react-hot-toast';

const MisPlantillas = () => {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tipo_plantilla: '',
    subtipo_plantilla: ''
  });

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
          {plantilla.Puede_Modificar && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
              Puedes editar
            </span>
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
          {plantilla.Puede_Modificar && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              <FiEdit2 className="w-3 h-3 mr-1" />
              Puedes editar
            </span>
          )}
        </div>

        {/* Bodegas */}
        {(plantilla.Origen_Bodega_Nombre || plantilla.Destino_Bodega_Nombre) && (
          <div className="space-y-1 text-sm">
            {plantilla.Origen_Bodega_Nombre && (
              <div className="flex items-center text-gray-700">
                <FiMapPin className="w-4 h-4 mr-1 text-gray-400" />
                <span className="font-medium">Origen:</span>
                <span className="ml-1">{plantilla.Origen_Bodega_Nombre}</span>
              </div>
            )}
            {plantilla.Destino_Bodega_Nombre && (
              <div className="flex items-center text-gray-700">
                <FiMapPin className="w-4 h-4 mr-1 text-gray-400" />
                <span className="font-medium">Destino:</span>
                <span className="ml-1">{plantilla.Destino_Bodega_Nombre}</span>
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

        {/* Info adicional */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span className="font-medium">Creador:</span> {plantilla.Creador_Nombre_Completo}
        </div>
      </div>
    );
  };

  // Cargar plantillas asignadas al usuario
  const loadMisPlantillas = async () => {
    try {
      setIsLoading(true);
      const response = await plantillaService.getMisPlantillas();
      console.log('Mis plantillas loaded:', response);
      
      const plantillasData = response.data || response.plantillas || response || [];
      setPlantillas(Array.isArray(plantillasData) ? plantillasData : []);
    } catch (error) {
      console.error('Error loading mis plantillas:', error);
      toast.error('Error al cargar tus plantillas');
      setPlantillas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadMisPlantillas();
  }, []);

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRowClick = (plantilla) => {
    // Navegar según el tipo de plantilla
    if (plantilla.Tipo_Plantilla === 'Requerimiento') {
      // Navegar a crear requerimiento con plantilla precargada
      navigate('/requerimientos/crear', {
        state: {
          plantillaId: plantilla.Plantilla_Id,
          plantillaNombre: plantilla.Plantilla_Nombre,
          fromPlantilla: true
        }
      });
    } else if (plantilla.Tipo_Plantilla === 'Movimiento') {
      // Navegar a crear movimiento según el subtipo de la plantilla
      // El Subtipo_Plantilla indica el tipo: 'Entrada', 'Salida', 'Transferencia', 'Ajuste'
      const tipoMovimiento = (plantilla.Subtipo_Plantilla || 'Entrada').toLowerCase();
      
      // Validar que sea un tipo válido
      const tiposValidos = ['entrada', 'salida', 'transferencia', 'ajuste'];
      const tipoFinal = tiposValidos.includes(tipoMovimiento) ? tipoMovimiento : 'entrada';
      
      navigate(`/bodegas/movimientos/crear/${tipoFinal}`, {
        state: {
          plantillaId: plantilla.Plantilla_Id,
          plantillaNombre: plantilla.Plantilla_Nombre,
          tipoMovimiento: tipoFinal,
          fromPlantilla: true
        }
      });
    } else if (plantilla.Tipo_Plantilla === 'Compra') {
      // TODO: Implementar navegación para compras
      toast.info('Funcionalidad de compras próximamente');
    } else {
      // Fallback: ir a detalles de plantilla
      navigate(`/configuracion/plantillas/${plantilla.Plantilla_Id}`);
    }
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
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FiLayers className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mis Plantillas</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Plantillas asignadas a ti para usar en requerimientos y movimientos
            </p>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      {!isLoading && plantillas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plantillas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{plantillas.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiLayers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Puedes Editar</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {plantillas.filter(p => p.Puede_Modificar).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiEdit2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requerimientos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {plantillas.filter(p => p.Tipo_Plantilla === 'Requerimiento').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Movimientos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {plantillas.filter(p => p.Tipo_Plantilla === 'Movimiento').length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

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
        emptyMessage="No tienes plantillas asignadas"
        emptyIcon={FiLayers}
        rowKeyField="Plantilla_Id"
        pagination={true}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        initialSortField="Fecha_Creacion"
        initialSortDirection="desc"
        onRowClick={handleRowClick}
        mobileBreakpoint="lg"
        className="mb-6"
      />
    </div>
  );
};

export default MisPlantillas;
