import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiDatabase,
  FiEdit,
  FiSettings,
  FiPackage,
  FiBarChart,
  FiUser,
  FiMapPin,
  FiTag,
  FiSave,
  FiPlus,
  FiFilter,
  FiDownload,
  FiUpload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import bodegaService from '../services/bodegaService';
import { itemBodegaParamService } from '../services/itemBodegaParamService';
import { existenciaService } from '../services/existenciaService';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';
import DataTable from '../components/DataTable/DataTable';
import SearchAndFilter from '../components/DataTable/SearchAndFilter';
import { BodegaFormModal } from '../components/Modals';

const BodegaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [bodega, setBodega] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Estados para el modal de edición de bodega
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Bodega_Nombre: '',
    Bodega_Tipo: '',
    Bodega_Ubicacion: '',
    Responsable_Id: '',
    Bodega_Estado: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para parámetros de stock
  const [parametros, setParametros] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isParametrosLoading, setIsParametrosLoading] = useState(false);
  const [parametrosFilters, setParametrosFilters] = useState({
    search: '',
    categoria: '',
    configurado: '',
    estado_stock: ''
  });

  // Estados para existencias
  const [existencias, setExistencias] = useState([]);
  const [isExistenciasLoading, setIsExistenciasLoading] = useState(false);
  const [existenciasFilters, setExistenciasFilters] = useState({
    search: '',
    categoria: '',
    stock_bajo: '',
    sin_stock: ''
  });

  // Configuración de pestañas
  const tabs = [
    {
      id: 'info',
      label: 'Información General',
      icon: FiDatabase,
      description: 'Datos básicos de la bodega'
    },
    {
      id: 'parametros',
      label: 'Parámetros de Stock',
      icon: FiSettings,
      description: 'Configuración de stock por item'
    },
    {
      id: 'existencias',
      label: 'Inventario Actual',
      icon: FiPackage,
      description: 'Estado actual del inventario'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: FiBarChart,
      description: 'Análisis y reportes'
    }
  ];

  // Cargar datos de la bodega
  const loadBodega = async () => {
    try {
      setIsLoading(true);
      const response = await bodegaService.getBodegaById(id);
      if (response.success) {
        setBodega(response.data);
        setFormData({
          Bodega_Nombre: response.data.Bodega_Nombre || '',
          Bodega_Tipo: response.data.Bodega_Tipo || '',
          Bodega_Ubicacion: response.data.Bodega_Ubicacion || '',
          Responsable_Id: response.data.Responsable_Id || '',
          Bodega_Estado: response.data.Bodega_Estado
        });
      } else {
        toast.error('Error al cargar los datos de la bodega');
        navigate('/configuracion/bodegas');
      }
    } catch (error) {
      console.error('Error loading bodega:', error);
      toast.error('Error al cargar los datos de la bodega');
      navigate('/configuracion/bodegas');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar parámetros de stock
  const loadParametros = async () => {
    try {
      setIsParametrosLoading(true);
      const response = await itemBodegaParamService.getParametrosByBodega(id, parametrosFilters);
      if (response.success) {
        setParametros(response.data || []);
      } else {
        console.error('Error loading parametros:', response.message);
        setParametros([]);
      }
    } catch (error) {
      console.error('Error loading parametros:', error);
      setParametros([]);
    } finally {
      setIsParametrosLoading(false);
    }
  };

  // Cargar items disponibles
  const loadItems = async () => {
    try {
      const response = await itemService.getAllItems();
      const itemsData = response.data || response.items || response || [];
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
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

  // Cargar existencias
  const loadExistencias = async () => {
    try {
      setIsExistenciasLoading(true);
      const response = await existenciaService.getExistenciasByBodega(id, existenciasFilters);
      if (response.success) {
        setExistencias(response.data || []);
      } else {
        console.error('Error loading existencias:', response.message);
        setExistencias([]);
      }
    } catch (error) {
      console.error('Error loading existencias:', error);
      setExistencias([]);
    } finally {
      setIsExistenciasLoading(false);
    }
  };

  // Navegar de vuelta
  const handleGoBack = () => {
    navigate('/configuracion/bodegas');
  };

  // Abrir modal para editar bodega
  const handleEditBodega = () => {
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Manejar envío del formulario de bodega
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await bodegaService.updateBodega(id, data);
      if (response.success) {
        await loadBodega();
        handleCloseModal();
        toast.success('Bodega actualizada exitosamente');
      } else {
        toast.error('Error al actualizar la bodega');
      }
    } catch (error) {
      console.error('Error updating bodega:', error);
      toast.error('Error al actualizar la bodega');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar pestaña activa
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Cargar datos específicos de la pestaña
    switch (tabId) {
      case 'parametros':
        loadParametros();
        break;
      case 'existencias':
        loadExistencias();
        break;
      default:
        break;
    }
  };

  // Formatear valores
  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2
    });
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadBodega();
    loadItems();
    loadCategories();
  }, [id]);

  // Cargar datos de la pestaña activa
  useEffect(() => {
    if (!isLoading && bodega) {
      handleTabChange(activeTab);
    }
  }, [activeTab, isLoading, bodega]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Cargando detalles de la bodega...</span>
        </div>
      </div>
    );
  }

  if (!bodega) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <FiDatabase className="w-16 h-16 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-800">Bodega no encontrada</h3>
        <p className="text-gray-600">No se pudo cargar la información de la bodega solicitada.</p>
        <button 
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Volver a Bodegas</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleGoBack}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              title="Volver a Bodegas"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="bg-blue-500/10 rounded-full p-3">
              <FiDatabase className="w-6 h-6 text-blue-500" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{bodega.Bodega_Nombre}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {bodega.Bodega_Tipo && (
                  <div className="flex items-center space-x-1">
                    <FiTag className="w-4 h-4" />
                    <span>{bodega.Bodega_Tipo}</span>
                  </div>
                )}
                {bodega.Bodega_Ubicacion && (
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-4 h-4" />
                    <span>{bodega.Bodega_Ubicacion}</span>
                  </div>
                )}
                {bodega.Responsable_Nombre && (
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-4 h-4" />
                    <span>{bodega.Responsable_Nombre} {bodega.Responsable_Apellido}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              bodega.Bodega_Estado 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {bodega.Bodega_Estado ? 'Activa' : 'Inactiva'}
            </span>
            
            <button 
              onClick={handleEditBodega}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiEdit size={16} />
              <span>Editar Bodega</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Contenido de la pestaña Información */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiDatabase className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Nombre</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{bodega.Bodega_Nombre}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiTag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Tipo</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {bodega.Bodega_Tipo || 'Sin especificar'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiMapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Ubicación</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {bodega.Bodega_Ubicacion || 'Sin especificar'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiUser className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Responsable</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {bodega.Responsable_Nombre 
                        ? `${bodega.Responsable_Nombre} ${bodega.Responsable_Apellido}` 
                        : 'Sin asignar'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiSettings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Estado</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bodega.Bodega_Estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bodega.Bodega_Estado ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de la pestaña Parámetros */}
          {activeTab === 'parametros' && (
            <ParametrosStockTab
              bodegaId={id}
              parametros={parametros}
              setParametros={setParametros}
              items={items}
              categories={categories}
              isLoading={isParametrosLoading}
              filters={parametrosFilters}
              setFilters={setParametrosFilters}
              navigate={navigate}
              onReload={loadParametros}
            />
          )}

          {/* Contenido de la pestaña Existencias */}
          {activeTab === 'existencias' && (
            <ExistenciasTab
              bodegaId={id}
              existencias={existencias}
              categories={categories}
              isLoading={isExistenciasLoading}
              filters={existenciasFilters}
              setFilters={setExistenciasFilters}
              onReload={loadExistencias}
            />
          )}

          {/* Contenido de la pestaña Reportes */}
          {activeTab === 'reportes' && (
            <ReportesTab
              bodegaId={id}
              bodega={bodega}
            />
          )}
        </div>
      </div>

      {/* Modal de edición de bodega */}
      <BodegaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={true}
        selectedBodega={bodega}
        isLoading={isSubmitting}
      />
    </div>
  );
};

// Componente para la pestaña de Parámetros de Stock
const ParametrosStockTab = ({ 
  bodegaId, 
  parametros, 
  setParametros, 
  items, 
  categories, 
  isLoading, 
  filters, 
  setFilters, 
  onReload,
  navigate 
}) => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros para parámetros
  const filterOptions = [
    {
      id: 'categoria',
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
      id: 'configurado',
      label: 'Estado de Configuración',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Configurados' },
        { value: 'false', label: 'Sin configurar' }
      ]
    },
    {
      id: 'estado_stock',
      label: 'Estado de Stock',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'Sin Stock', label: 'Sin Stock' },
        { value: 'Stock Bajo', label: 'Stock Bajo' },
        { value: 'Normal', label: 'Normal' },
        { value: 'Sobre Stock', label: 'Sobre Stock' },
        { value: 'Punto Reorden', label: 'Punto de Reorden' }
      ]
    }
  ];

  // Configuración de columnas
  const columns = [
    {
      field: 'Item_Nombre',
      header: 'Item',
      render: (param) => (
        <div>
          <div className="font-medium text-gray-900">{param.Item_Nombre}</div>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <span>{param.CategoriaItem_Nombre}</span>
            {param.UnidadMedida_Prefijo && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {param.UnidadMedida_Prefijo}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      field: 'cantidad_actual',
      header: 'Stock Actual',
      render: (param) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {param.Cantidad_Actual || 0}
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${getEstadoStockColor(param.Estado_Stock_Actual)}`}>
            {param.Estado_Stock_Actual || 'Normal'}
          </div>
        </div>
      )
    },
    {
      field: 'parametros',
      header: 'Parámetros',
      render: (param) => (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Mín:</span>
            <span className="font-medium">
              {param.Stock_Min_Bodega !== null ? param.Stock_Min_Bodega : 'No config.'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Máx:</span>
            <span className="font-medium">
              {param.Stock_Max_Bodega !== null ? param.Stock_Max_Bodega : 'No config.'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reorden:</span>
            <span className="font-medium">
              {param.Punto_Reorden !== null ? param.Punto_Reorden : 'No config.'}
            </span>
          </div>
        </div>
      )
    },
    {
      field: 'Es_Item_Activo_Bodega',
      header: 'Estado',
      render: (param) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          param.Es_Item_Activo_Bodega 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {param.Es_Item_Activo_Bodega ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  // Función para obtener color del estado de stock
  const getEstadoStockColor = (estado) => {
    const colores = {
      'Sin Stock': 'bg-red-100 text-red-800',
      'Stock Bajo': 'bg-yellow-100 text-yellow-800',
      'Normal': 'bg-green-100 text-green-800',
      'Sobre Stock': 'bg-orange-100 text-orange-800',
      'Punto Reorden': 'bg-blue-100 text-blue-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  // Filtrar parámetros
  const filteredParametros = useMemo(() => {
    return parametros.filter(param => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          param.Item_Nombre?.toLowerCase().includes(searchLower) ||
          param.Item_Codigo_SKU?.toLowerCase().includes(searchLower) ||
          param.CategoriaItem_Nombre?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      if (filters.categoria && param.CategoriaItem_Id?.toString() !== filters.categoria) {
        return false;
      }

      if (filters.configurado) {
        const isConfigurado = param.Stock_Min_Bodega !== null || param.Stock_Max_Bodega !== null;
        if (filters.configurado === 'true' && !isConfigurado) return false;
        if (filters.configurado === 'false' && isConfigurado) return false;
      }

      if (filters.estado_stock && param.Estado_Stock_Actual !== filters.estado_stock) {
        return false;
      }

      return true;
    });
  }, [parametros, filters]);

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Editar parámetro
  const handleEditParam = (param) => {
    setEditingParam(param);
    setIsConfigModalOpen(true);
  };

  // Renderizar acciones de fila
  const renderRowActions = (param) => (
    <button
      onClick={() => handleEditParam(param)}
      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
      title="Configurar parámetros"
    >
      <FiSettings className="w-4 h-4" />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Parámetros de Stock por Item</h3>
          <p className="text-sm text-gray-600">
            Configura stock mínimo, máximo y punto de reorden para cada item en esta bodega
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onReload}
            className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FiSettings size={16} />
            <span>Actualizar</span>
          </button>
          <button 
            onClick={() => navigate(`/configuracion/bodegas/${bodegaId}/parametros`)}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <FiSettings size={16} />
            <span>Configurar Parámetros</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <SearchAndFilter
        onFilter={handleFilterChange}
        filters={filterOptions}
        currentFilters={filters}
        totalItems={filteredParametros.length}
        searchPlaceholder="Buscar por nombre de item, SKU, categoría..."
      />

      {/* Información estadística */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FiPackage className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">Total Items</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {parametros.length}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FiSettings className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">Configurados</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {parametros.filter(p => p.Stock_Min_Bodega !== null || p.Stock_Max_Bodega !== null).length}
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FiTag className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-800">Stock Bajo</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">
            {parametros.filter(p => p.Estado_Stock_Actual === 'Stock Bajo').length}
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FiPackage className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">Sin Stock</span>
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {parametros.filter(p => p.Estado_Stock_Actual === 'Sin Stock').length}
          </div>
        </div>
      </div>

      {/* Tabla de parámetros */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <DataTable
          data={filteredParametros}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No se encontraron parámetros para mostrar"
          emptyIcon={FiSettings}
          renderRowActions={renderRowActions}
          initialPageSize={15}
          pageSizeOptions={[10, 15, 25, 50]}
          initialSortField="Item_Nombre"
          initialSortDirection="asc"
          rowKeyField="ItemBodegaParam_Id"
        />
      </div>

      {/* Modal de configuración (placeholder por ahora) */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingParam ? 'Editar Parámetros' : 'Configurar Parámetros de Stock'}
              </h2>
              <button 
                onClick={() => {
                  setIsConfigModalOpen(false);
                  setEditingParam(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiPlus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="text-center py-8">
              <FiSettings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                El modal de configuración de parámetros se implementará en el siguiente paso.
              </p>
              {editingParam && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Editando parámetros para: <strong>{editingParam.Item_Nombre}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de Existencias
const ExistenciasTab = ({ 
  bodegaId, 
  existencias, 
  categories, 
  isLoading, 
  filters, 
  setFilters, 
  onReload 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Inventario Actual</h3>
        <button 
          onClick={onReload}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiPackage size={16} />
          <span>Actualizar</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      ) : existencias.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 mb-4">
            Mostrando {existencias.length} items en inventario
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existencias.slice(0, 6).map((existencia, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{existencia.Item_Nombre}</div>
                <div className="text-sm text-gray-600">Cantidad: {existencia.Cantidad}</div>
                <div className="text-xs text-gray-500">{existencia.Estado_Stock}</div>
              </div>
            ))}
          </div>
          {existencias.length > 6 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Y {existencias.length - 6} items más...
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay items en inventario para esta bodega.</p>
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de Reportes
const ReportesTab = ({ bodegaId, bodega }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Reportes y Análisis</h3>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            <FiDownload size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <FiBarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Los reportes y análisis se implementarán próximamente.</p>
      </div>
    </div>
  );
};

export default BodegaDetails;