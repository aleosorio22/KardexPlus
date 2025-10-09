import { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiAlertTriangle, 
  FiClock, 
  FiPlus, 
  FiFilter, 
  FiSearch,
  FiDownload,
  FiTrash2,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiSettings,
  FiRefreshCw,
  FiCamera,
  FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Components
import { LoadingSpinner } from '../components/ui';
import NuevaIncidenciaModal from '../components/Modals/NuevaIncidenciaModal';
import DetalleIncidenciaModal from '../components/Modals/DetalleIncidenciaModal';

// Services
import IncidenciaService from '../services/incidenciaService';

const RegistroIncidencias = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [incidenciasFiltradas, setIncidenciasFiltradas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    subcategoria: '',
    estado: '',
    prioridad: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Estados para modales
  const [isNuevaIncidenciaModalOpen, setIsNuevaIncidenciaModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);

  // Configuración
  const categorias = IncidenciaService.getCategorias();
  const estados = IncidenciaService.getEstados();
  const prioridades = IncidenciaService.getPrioridades();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [incidencias, filtros]);

  const cargarDatos = () => {
    setIsLoading(true);
    
    // Simular delay de carga para mejor UX
    setTimeout(() => {
      const incidenciasData = IncidenciaService.getAllIncidencias();
      const estadisticasData = IncidenciaService.getEstadisticas();
      
      // Si no hay datos, inicializar con datos de prueba
      if (incidenciasData.length === 0) {
        IncidenciaService.inicializarDatosPrueba();
        const nuevasIncidencias = IncidenciaService.getAllIncidencias();
        const nuevasEstadisticas = IncidenciaService.getEstadisticas();
        setIncidencias(nuevasIncidencias);
        setEstadisticas(nuevasEstadisticas);
      } else {
        setIncidencias(incidenciasData);
        setEstadisticas(estadisticasData);
      }
      
      setIsLoading(false);
    }, 800);
  };

  const aplicarFiltros = () => {
    const incidenciasFiltradas = IncidenciaService.filtrarIncidencias(filtros);
    setIncidenciasFiltradas(incidenciasFiltradas);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      // Limpiar subcategoría si se cambia la categoría
      ...(campo === 'categoria' && { subcategoria: '' })
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      categoria: '',
      subcategoria: '',
      estado: '',
      prioridad: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  const handleIncidenciaCreada = (nuevaIncidencia) => {
    setIncidencias(prev => [nuevaIncidencia, ...prev]);
    cargarDatos(); // Recargar para actualizar estadísticas
    toast.success('Incidencia creada exitosamente');
  };

  const handleIncidenciaActualizada = (incidenciaActualizada) => {
    setIncidencias(prev => 
      prev.map(inc => 
        inc.id === incidenciaActualizada.id ? incidenciaActualizada : inc
      )
    );
    cargarDatos(); // Recargar para actualizar estadísticas
  };

  const handleVerDetalle = (incidenciaId) => {
    setIncidenciaSeleccionada(incidenciaId);
    setIsDetalleModalOpen(true);
  };

  const exportarDatos = () => {
    try {
      IncidenciaService.exportarDatos();
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      toast.error('Error al exportar datos');
    }
  };

  const subcategoriasDisponibles = filtros.categoria 
    ? categorias.find(cat => cat.id === filtros.categoria)?.subcategorias || []
    : [];

  const getPrioridadColor = (prioridad) => {
    const colors = {
      'critica': 'bg-red-100 text-red-800 border-red-200',
      'alta': 'bg-orange-100 text-orange-800 border-orange-200',
      'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baja': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'abierta': 'bg-red-100 text-red-800 border-red-200',
      'en_progreso': 'bg-blue-100 text-blue-800 border-blue-200',
      'esperando': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'resuelta': 'bg-green-100 text-green-800 border-green-200',
      'cerrada': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoTranscurrido = (fechaCreacion) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diferencia = ahora - creacion;
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) {
      return `${dias}d`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      const minutos = Math.floor(diferencia / (1000 * 60));
      return `${minutos}min`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Cargando incidencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      
      {/* Header Mobile-First */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Registro de Incidencias
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Gestión de incidencias, daños y actividades operacionales
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setIsNuevaIncidenciaModalOpen(true)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Nueva Incidencia
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={cargarDatos}
                className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span className="sm:inline hidden">Actualizar</span>
              </button>
              
              <button
                onClick={exportarDatos}
                className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span className="sm:inline hidden">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Dashboard */}
      {estadisticas && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-500/10 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{estadisticas.general.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-500/10 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Abiertas</p>
                <p className="text-lg sm:text-xl font-bold text-red-600">{estadisticas.general.abiertas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-500/10 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">En Progreso</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">{estadisticas.general.enProgreso}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-green-500/10 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Resueltas</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">{estadisticas.general.resueltas}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros Mobile-First */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="space-y-4">
          
          {/* Búsqueda principal */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por título, descripción, ubicación..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
            />
          </div>

          {/* Filtros en grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filtros.subcategoria}
              onChange={(e) => handleFiltroChange('subcategoria', e.target.value)}
              disabled={!filtros.categoria}
            >
              <option value="">Todas las subcategorías</option>
              {subcategoriasDisponibles.map(subcat => (
                <option key={subcat.id} value={subcat.id}>{subcat.nombre}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="">Todos los estados</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id}>{estado.nombre}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filtros.prioridad}
              onChange={(e) => handleFiltroChange('prioridad', e.target.value)}
            >
              <option value="">Todas las prioridades</option>
              {prioridades.map(prioridad => (
                <option key={prioridad.id} value={prioridad.id}>{prioridad.nombre}</option>
              ))}
            </select>

            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filtros.fechaDesde}
              onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
              placeholder="Desde"
            />

            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filtros.fechaHasta}
              onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
              placeholder="Hasta"
            />
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex justify-between items-center">
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <FiFilter className="w-4 h-4" />
              Limpiar Filtros
            </button>
            
            <span className="text-sm text-gray-500">
              {incidenciasFiltradas.length} de {incidencias.length} incidencias
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Incidencias Mobile-First */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Incidencias Registradas</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {incidenciasFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {incidencias.length === 0 ? 'No hay incidencias registradas' : 'No se encontraron incidencias'}
              </h3>
              <p className="text-gray-500 mb-4">
                {incidencias.length === 0 
                  ? 'Cuando se registren incidencias, aparecerán aquí.' 
                  : 'Intenta ajustar los filtros para encontrar lo que buscas.'
                }
              </p>
              {incidencias.length === 0 && (
                <button
                  onClick={() => setIsNuevaIncidenciaModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Crear Primera Incidencia
                </button>
              )}
            </div>
          ) : (
            incidenciasFiltradas.map((incidencia) => {
              const categoria = categorias.find(cat => cat.id === incidencia.categoria);
              const subcategoria = categoria?.subcategorias.find(sub => sub.id === incidencia.subcategoria);
              const estado = estados.find(est => est.id === incidencia.estado);
              const prioridad = prioridades.find(prior => prior.id === incidencia.prioridad);

              return (
                <div 
                  key={incidencia.id} 
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleVerDetalle(incidencia.id)}
                >
                  <div className="space-y-3">
                    
                    {/* Header mobile */}
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                        incidencia.prioridad === 'critica' ? 'bg-red-500/10' :
                        incidencia.prioridad === 'alta' ? 'bg-orange-500/10' :
                        incidencia.prioridad === 'media' ? 'bg-yellow-500/10' :
                        'bg-green-500/10'
                      }`}>
                        <FiAlertTriangle className={`w-5 h-5 ${
                          incidencia.prioridad === 'critica' ? 'text-red-500' :
                          incidencia.prioridad === 'alta' ? 'text-orange-500' :
                          incidencia.prioridad === 'media' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                          {incidencia.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {incidencia.descripcion}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(incidencia.estado)}`}>
                          {estado?.nombre}
                        </span>
                        <span className="text-xs text-gray-500">
                          {calcularTiempoTranscurrido(incidencia.fechaCreacion)}
                        </span>
                      </div>
                    </div>

                    {/* Metadata mobile */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiUser className="w-3 h-3" />
                          {incidencia.personaReporta}
                        </span>
                        
                        {incidencia.ubicacion && (
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" />
                            {incidencia.ubicacion}
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {formatearFecha(incidencia.fechaCreacion)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPrioridadColor(incidencia.prioridad)}`}>
                          {prioridad?.nombre}
                        </span>
                        
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {categoria?.nombre}
                        </span>
                        
                        {subcategoria && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                            {subcategoria.nombre}
                          </span>
                        )}

                        {incidencia.fotos && incidencia.fotos.length > 0 && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs flex items-center gap-1">
                            <FiCamera className="w-3 h-3" />
                            {incidencia.fotos.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick actions mobile */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerDetalle(incidencia.id);
                        }}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                      >
                        <FiEye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modales */}
      <NuevaIncidenciaModal
        isOpen={isNuevaIncidenciaModalOpen}
        onClose={() => setIsNuevaIncidenciaModalOpen(false)}
        onIncidenciaCreada={handleIncidenciaCreada}
      />

      <DetalleIncidenciaModal
        isOpen={isDetalleModalOpen}
        onClose={() => {
          setIsDetalleModalOpen(false);
          setIncidenciaSeleccionada(null);
        }}
        incidenciaId={incidenciaSeleccionada}
        onIncidenciaActualizada={handleIncidenciaActualizada}
      />
    </div>
  );
};

export default RegistroIncidencias;