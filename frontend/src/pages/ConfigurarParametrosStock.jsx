import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiSave, 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiEdit3,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';
import { DataTable, SearchAndFilter } from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import bodegaService from '../services/bodegaService';
import { itemBodegaParamService } from '../services/itemBodegaParamService';
import itemService from '../services/itemService';

const ConfigurarParametrosStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [bodega, setBodega] = useState(null);
  const [items, setItems] = useState([]);
  const [parametros, setParametros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRows, setEditingRows] = useState(new Set());
  const [changedRows, setChangedRows] = useState(new Map());
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    configurado: '',
    stockBajo: false
  });
  
  // Estados para agregar nuevos items
  const [showAddItems, setShowAddItems] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Estados para modales de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [id]);

  // Funciones auxiliares para modales
  const showConfirmModal = (config) => {
    setConfirmModal({
      isOpen: true,
      type: config.type || 'info',
      title: config.title,
      message: config.message,
      onConfirm: config.onConfirm,
      isLoading: false
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccessMessage = (message) => {
    showConfirmModal({
      type: 'info',
      title: '¡Éxito!',
      message,
      onConfirm: closeConfirmModal
    });
  };

  const showErrorMessage = (message) => {
    showConfirmModal({
      type: 'danger',
      title: 'Error',
      message,
      onConfirm: closeConfirmModal
    });
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      console.log('Cargando datos para bodega ID:', id);
      
      // Cargar datos en paralelo
      const [bodegaData, parametrosData, itemsData] = await Promise.all([
        bodegaService.getBodegaById(id).catch(err => {
          console.error('Error cargando bodega:', err);
          throw new Error(`Error cargando bodega: ${err.message || err}`);
        }),
        itemBodegaParamService.getParametrosByBodega(id).catch(err => {
          console.error('Error cargando parámetros:', err);
          throw new Error(`Error cargando parámetros: ${err.message || err}`);
        }),
        itemService.getAllItems().catch(err => {
          console.error('Error cargando items:', err);
          throw new Error(`Error cargando items: ${err.message || err}`);
        })
      ]);

      console.log('Datos recibidos:', { bodegaData, parametrosData, itemsData });
      
      // Debug: Ver estructura del primer parámetro
      if (parametrosData && parametrosData.length > 0) {
        console.log('Estructura del primer parámetro:', parametrosData[0]);
        console.log('Campos disponibles:', Object.keys(parametrosData[0]));
      }
      
      setBodega(bodegaData);
      
      // Asegurar que parametrosData es un array
      const parametrosArray = Array.isArray(parametrosData) ? parametrosData : 
                            (parametrosData.data && Array.isArray(parametrosData.data)) ? parametrosData.data : 
                            [];
      setParametros(parametrosArray);
      
      // Asegurar que itemsData es un array  
      const itemsArray = Array.isArray(itemsData) ? itemsData :
                        (itemsData.data && Array.isArray(itemsData.data)) ? itemsData.data :
                        [];
      setItems(itemsArray);
      
      // Filtrar items disponibles (que no tienen parámetros configurados)
      const itemsConParametros = new Set(parametrosArray.map(p => p.Item_Id));
      const itemsDisponibles = itemsArray.filter(item => !itemsConParametros.has(item.Item_Id));
      setAvailableItems(itemsDisponibles);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      const errorMessage = error.message || 'Error desconocido al cargar los datos';
      showErrorMessage(`Error al cargar los datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejar edición de celdas
  const handleCellEdit = (rowId, field, value) => {
    const numValue = parseFloat(value) || 0;
    
    setChangedRows(prev => {
      const updated = new Map(prev);
      if (!updated.has(rowId)) {
        updated.set(rowId, {});
      }
      updated.get(rowId)[field] = numValue;
      return updated;
    });

    // Actualizar parámetros localmente
    setParametros(prev => prev.map(param => 
      param.Item_Id === rowId 
        ? { ...param, [field]: numValue }
        : param
    ));
  };

  // Iniciar edición de fila
  const startEditing = (rowId) => {
    setEditingRows(prev => new Set([...prev, rowId]));
  };

  // Cancelar edición
  const cancelEditing = (rowId) => {
    setEditingRows(prev => {
      const updated = new Set(prev);
      updated.delete(rowId);
      return updated;
    });
    
    setChangedRows(prev => {
      const updated = new Map(prev);
      updated.delete(rowId);
      return updated;
    });
    
    // Recargar datos para deshacer cambios locales
    loadInitialData();
  };

  // Guardar cambios individuales
  const saveRowChanges = async (rowId) => {
    try {
      const changes = changedRows.get(rowId);
      if (!changes) return;

      setSaving(true);
      
      await itemBodegaParamService.updateParametro(rowId, id, changes);
      
      setEditingRows(prev => {
        const updated = new Set(prev);
        updated.delete(rowId);
        return updated;
      });
      
      setChangedRows(prev => {
        const updated = new Map(prev);
        updated.delete(rowId);
        return updated;
      });
      
      showSuccessMessage('Parámetros actualizados correctamente');
      
    } catch (error) {
      console.error('Error guardando cambios:', error);
      showErrorMessage('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // Guardar todos los cambios
  const saveAllChanges = async () => {
    try {
      if (changedRows.size === 0) {
        showErrorMessage('No hay cambios para guardar');
        return;
      }

      setSaving(true);
      
      // Preparar datos para guardado masivo
      const updates = Array.from(changedRows.entries()).map(([itemId, changes]) => ({
        Item_Id: itemId,
        Bodega_Id: parseInt(id),
        ...changes
      }));

      await itemBodegaParamService.configurarParametrosMasivos(id, updates);
      
      setEditingRows(new Set());
      setChangedRows(new Map());
      
      showSuccessMessage('Todos los cambios guardados correctamente');
      
    } catch (error) {
      console.error('Error en guardado masivo:', error);
      showErrorMessage('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // Agregar nuevos items
  const confirmAddItems = () => {
    if (selectedItems.length === 0) {
      showErrorMessage('Selecciona al menos un item');
      return;
    }

    showConfirmModal({
      type: 'info',
      title: 'Agregar Items',
      message: `¿Estás seguro de agregar ${selectedItems.length} item(s) a la configuración de parámetros? Los valores iniciales serán 0 y podrás editarlos después.`,
      onConfirm: handleAddItems
    });
  };

  const handleAddItems = async () => {
    try {
      setConfirmModal(prev => ({ ...prev, isLoading: true }));
      setSaving(true);
      
      const nuevosParametros = selectedItems.map(itemId => ({
        Item_Id: itemId,
        Bodega_Id: parseInt(id),
        Stock_Min_Bodega: 0,
        Stock_Max_Bodega: 0,
        Punto_Reorden: 0
      }));

      await itemBodegaParamService.configurarParametrosMasivos(id, nuevosParametros);
      
      closeConfirmModal();
      setShowAddItems(false);
      setSelectedItems([]);
      loadInitialData(); // Recargar datos
      
      showSuccessMessage(`${selectedItems.length} item(s) agregados correctamente. Ahora puedes configurar sus parámetros de stock.`);
      
    } catch (error) {
      console.error('Error agregando items:', error);
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
      showErrorMessage('Error al agregar los items');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar parámetro
  const confirmDeleteParametro = (itemId, itemNombre) => {
    showConfirmModal({
      type: 'danger',
      title: 'Eliminar Parámetros',
      message: `¿Estás seguro de eliminar los parámetros de stock de "${itemNombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => handleDeleteParametro(itemId, itemNombre)
    });
  };

  const handleDeleteParametro = async (itemId, itemNombre) => {
    try {
      setConfirmModal(prev => ({ ...prev, isLoading: true }));
      setSaving(true);
      await itemBodegaParamService.deleteParametro(itemId, id);
      closeConfirmModal();
      loadInitialData();
      showSuccessMessage(`Parámetros de "${itemNombre}" eliminados correctamente`);
    } catch (error) {
      console.error('Error eliminando parámetros:', error);
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
      showErrorMessage('Error al eliminar los parámetros');
    } finally {
      setSaving(false);
    }
  };

  // Filtrar datos
  const filteredData = parametros.filter(param => {
    const matchesSearch = !searchTerm || 
      param.Item_Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.Item_Codigo_SKU?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = !filters.categoria || param.CategoriaItem_Nombre === filters.categoria;
    
    const matchesConfigurado = !filters.configurado || 
      (filters.configurado === 'si' && (param.Stock_Min_Bodega > 0 || param.Stock_Max_Bodega > 0)) ||
      (filters.configurado === 'no' && param.Stock_Min_Bodega === 0 && param.Stock_Max_Bodega === 0);
    
    const matchesStockBajo = !filters.stockBajo || 
      (param.Cantidad_Actual < param.Stock_Min_Bodega && param.Stock_Min_Bodega > 0);

    return matchesSearch && matchesCategoria && matchesConfigurado && matchesStockBajo;
  });

  // Columnas de la tabla
  const columns = [
    {
      field: 'Item_Codigo_SKU',
      header: 'Código',
      width: '120px'
    },
    {
      field: 'Item_Nombre',
      header: 'Producto',
      width: 'auto'
    },
    {
      field: 'CategoriaItem_Nombre',
      header: 'Categoría',
      width: '140px'
    },
    {
      field: 'Cantidad_Actual',
      header: 'Stock Actual',
      width: '110px',
      align: 'center',
      render: (row) => renderCell(row, { field: 'Cantidad_Actual' })
    },
    {
      field: 'Stock_Min_Bodega',
      header: 'Stock Mínimo',
      width: '130px',
      align: 'center',
      editable: true,
      render: (row) => renderCell(row, { field: 'Stock_Min_Bodega', editable: true })
    },
    {
      field: 'Stock_Max_Bodega',
      header: 'Stock Máximo',
      width: '130px',
      align: 'center',
      editable: true,
      render: (row) => renderCell(row, { field: 'Stock_Max_Bodega', editable: true })
    },
    {
      field: 'Punto_Reorden',
      header: 'Punto Reorden',
      width: '130px',
      align: 'center',
      editable: true,
      render: (row) => renderCell(row, { field: 'Punto_Reorden', editable: true })
    },
    {
      field: 'acciones',
      header: 'Acciones',
      width: '120px',
      align: 'center',
      render: (row) => renderCell(row, { field: 'acciones' })
    }
  ];

  // Renderizar celdas editables
  const renderCell = (row, column) => {
    const isEditing = editingRows.has(row.Item_Id);
    
    if (column.field === 'acciones') {
      const hasChanges = changedRows.has(row.Item_Id);
      
      return (
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={() => saveRowChanges(row.Item_Id)}
                disabled={saving || !hasChanges}
                className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                title="Guardar"
              >
                <FiCheckCircle size={16} />
              </button>
              <button
                onClick={() => cancelEditing(row.Item_Id)}
                disabled={saving}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
                title="Cancelar"
              >
                <FiArrowLeft size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEditing(row.Item_Id)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Editar"
              >
                <FiEdit3 size={16} />
              </button>
              <button
                onClick={() => confirmDeleteParametro(row.Item_Id, row.Item_Nombre)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Eliminar"
              >
                <FiTrash2 size={16} />
              </button>
            </>
          )}
        </div>
      );
    }

    // Campos editables (Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden)
    if (column.editable) {
      if (isEditing) {
        return (
          <input
            type="number"
            min="0"
            step="1"
            value={row[column.field] || 0}
            onChange={(e) => handleCellEdit(row.Item_Id, column.field, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:outline-none"
            autoFocus={column.field === 'Stock_Min_Bodega'}
          />
        );
      } else {
        // Mostrar como texto clickeable para editar
        const value = row[column.field] || 0;
        const hasValue = value > 0;
        return (
          <span 
            onClick={() => startEditing(row.Item_Id)}
            className={`cursor-pointer px-2 py-1 rounded hover:bg-blue-50 ${
              hasValue ? 'text-gray-900 bg-gray-50' : 'text-gray-400'
            }`}
            title="Click para editar"
          >
            {value}
          </span>
        );
      }
    }

    if (column.field === 'Cantidad_Actual') {
      const stockBajo = row.Stock_Min_Bodega > 0 && row.Cantidad_Actual < row.Stock_Min_Bodega;
      return (
        <span className={stockBajo ? 'text-red-600 font-medium' : ''}>
          {row[column.field] || 0}
          {stockBajo && <FiAlertTriangle className="inline ml-1" size={14} />}
        </span>
      );
    }

    return row[column.field] || (column.align === 'center' ? '0' : '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/configuracion/bodegas/${id}/detalles`)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft size={20} />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configurar Parámetros de Stock
            </h1>
            <p className="text-gray-600">
              Bodega: {bodega?.Nombre_Bodega}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {changedRows.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <FiAlertTriangle className="text-amber-600" size={16} />
              <span className="text-amber-800 text-sm">
                {changedRows.size} cambio(s) pendientes
              </span>
              <button
                onClick={saveAllChanges}
                disabled={saving}
                className="ml-2 px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 text-sm"
              >
                <FiSave size={14} className="inline mr-1" />
                Guardar Todo
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowAddItems(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus size={16} />
            Agregar Items
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-4">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          placeholder="Buscar por nombre o código del producto..."
          additionalFilters={[
            {
              key: 'categoria',
              label: 'Categoría',
              type: 'select',
              options: [...new Set(parametros.map(param => param.CategoriaItem_Nombre))].filter(Boolean).map(cat => ({
                value: cat,
                label: cat
              }))
            },
            {
              key: 'configurado',
              label: 'Estado Configuración',
              type: 'select',
              options: [
                { value: 'si', label: 'Configurado' },
                { value: 'no', label: 'Sin Configurar' }
              ]
            },
            {
              key: 'stockBajo',
              label: 'Solo Stock Bajo',
              type: 'checkbox'
            }
          ]}
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Items Configurados</p>
              <p className="text-2xl font-bold text-gray-900">
                {parametros.filter(p => p.Stock_Min_Bodega > 0 || p.Stock_Max_Bodega > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-amber-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-amber-600">
                {parametros.filter(p => p.Stock_Min_Bodega > 0 && p.Cantidad_Actual < p.Stock_Min_Bodega).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <FiEdit3 className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">En Edición</p>
              <p className="text-2xl font-bold text-green-600">
                {editingRows.size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <FiSave className="text-purple-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Cambios Pendientes</p>
              <p className="text-2xl font-bold text-purple-600">
                {changedRows.size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de parámetros */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredData}
          columns={columns}
          rowKeyField="Item_Id"
          loading={saving}
          emptyMessage="No se encontraron parámetros configurados"
        />
      </div>

      {/* Modal para agregar items */}
      {showAddItems && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Agregar Items a la Configuración</h3>
              <p className="text-gray-600 text-sm mt-1">
                Selecciona los items que deseas configurar para esta bodega
              </p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {availableItems.map(item => (
                  <label key={item.Item_Id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.Item_Id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(prev => [...prev, item.Item_Id]);
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== item.Item_Id));
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.Item_Nombre}</p>
                      <p className="text-sm text-gray-600">
                        {item.Item_Codigo_SKU} • {item.CategoriaItem_Nombre}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              
              {availableItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Todos los items ya tienen parámetros configurados
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddItems(false);
                  setSelectedItems([]);
                }}
                disabled={saving}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAddItems}
                disabled={saving || selectedItems.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Agregando...' : `Agregar ${selectedItems.length} Items`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
        confirmText={confirmModal.type === 'danger' ? 'Eliminar' : 'Confirmar'}
      />
    </div>
  );
};

export default ConfigurarParametrosStock;