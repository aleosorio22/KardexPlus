import { useState, useEffect } from 'react';
import { 
  FiX, 
  FiCamera, 
  FiClock, 
  FiUser, 
  FiMapPin, 
  FiTool,
  FiDollarSign,
  FiEdit3,
  FiSave,
  FiMessageCircle,
  FiSend,
  FiImage,
  FiZoomIn,
  FiCalendar,
  FiActivity
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import IncidenciaService from '../../services/incidenciaService';

const DetalleIncidenciaModal = ({ isOpen, onClose, incidenciaId, onIncidenciaActualizada }) => {
  const [incidencia, setIncidencia] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const estados = IncidenciaService.getEstados();
  const prioridades = IncidenciaService.getPrioridades();

  useEffect(() => {
    if (isOpen && incidenciaId) {
      cargarIncidencia();
    }
  }, [isOpen, incidenciaId]);

  const cargarIncidencia = () => {
    const incidenciaData = IncidenciaService.getIncidenciaById(incidenciaId);
    if (incidenciaData) {
      setIncidencia(incidenciaData);
      setEditData({
        estado: incidenciaData.estado,
        prioridad: incidenciaData.prioridad,
        responsableAsignado: incidenciaData.responsableAsignado || '',
        costoEstimado: incidenciaData.costoEstimado || ''
      });
    }
  };

  const handleEstadoChange = async (nuevoEstado) => {
    try {
      setIsSubmitting(true);
      
      const incidenciaActualizada = IncidenciaService.updateIncidencia(incidenciaId, {
        estado: nuevoEstado,
        usuarioActual: 'Usuario Actual'
      });

      setIncidencia(incidenciaActualizada);
      setEditData(prev => ({ ...prev, estado: nuevoEstado }));
      
      toast.success('Estado actualizado correctamente');
      
      if (onIncidenciaActualizada) {
        onIncidenciaActualizada(incidenciaActualizada);
      }
    } catch (error) {
      toast.error(error.message || 'Error al actualizar estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      
      const incidenciaActualizada = IncidenciaService.updateIncidencia(incidenciaId, editData);
      
      setIncidencia(incidenciaActualizada);
      setIsEditing(false);
      
      toast.success('Incidencia actualizada correctamente');
      
      if (onIncidenciaActualizada) {
        onIncidenciaActualizada(incidenciaActualizada);
      }
    } catch (error) {
      toast.error(error.message || 'Error al actualizar incidencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim()) {
      toast.error('Escribe un comentario');
      return;
    }

    try {
      const comentarioAgregado = IncidenciaService.addComentario(
        incidenciaId,
        nuevoComentario,
        'Usuario Actual'
      );

      // Recargar incidencia para obtener comentarios actualizados
      cargarIncidencia();
      setNuevoComentario('');
      
      toast.success('Comentario agregado');
    } catch (error) {
      toast.error(error.message || 'Error al agregar comentario');
    }
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

  const getPrioridadColor = (prioridad) => {
    const colors = {
      'critica': 'bg-red-100 text-red-800 border-red-200',
      'alta': 'bg-orange-100 text-orange-800 border-orange-200',
      'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baja': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      return `${dias} día${dias === 1 ? '' : 's'}`;
    } else if (horas > 0) {
      return `${horas} hora${horas === 1 ? '' : 's'}`;
    } else {
      const minutos = Math.floor(diferencia / (1000 * 60));
      return `${minutos} minuto${minutos === 1 ? '' : 's'}`;
    }
  };

  if (!isOpen || !incidencia) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <div className="relative inline-block w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
            
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {incidencia.titulo}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(incidencia.estado)}`}>
                      {estados.find(e => e.id === incidencia.estado)?.nombre}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPrioridadColor(incidencia.prioridad)}`}>
                      {prioridades.find(p => p.id === incidencia.prioridad)?.nombre}
                    </span>
                    
                    <span className="text-gray-500 flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      Hace {calcularTiempoTranscurrido(incidencia.fechaCreacion)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-gray-400 hover:text-blue-600 p-2"
                    title={isEditing ? 'Cancelar edición' : 'Editar incidencia'}
                  >
                    <FiEdit3 className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {/* Contenido Principal */}
              <div className="px-4 py-4 sm:px-6">
                
                {/* Descripción */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Descripción</h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {incidencia.descripcion}
                  </p>
                </div>

                {/* Información Principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                  {/* Detalles */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Información</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Reportado por:</span>
                        <span className="font-medium">{incidencia.personaReporta}</span>
                      </div>
                      
                      {incidencia.ubicacion && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiMapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Ubicación:</span>
                          <span className="font-medium">{incidencia.ubicacion}</span>
                        </div>
                      )}
                      
                      {incidencia.equipoAfectado && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiTool className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Equipo afectado:</span>
                          <span className="font-medium">{incidencia.equipoAfectado}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Fecha creación:</span>
                        <span className="font-medium">{formatearFecha(incidencia.fechaCreacion)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campos Editables */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FiActivity className="w-4 h-4" />
                      Gestión
                      {isEditing && (
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSubmitting}
                          className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                        >
                          <FiSave className="w-3 h-3" />
                          Guardar
                        </button>
                      )}
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Estado */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Estado</label>
                        {isEditing ? (
                          <select
                            value={editData.estado}
                            onChange={(e) => setEditData(prev => ({ ...prev, estado: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {estados.map(estado => (
                              <option key={estado.id} value={estado.id}>
                                {estado.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {estados.map(estado => (
                              <button
                                key={estado.id}
                                onClick={() => handleEstadoChange(estado.id)}
                                disabled={isSubmitting}
                                className={`px-2 py-1 rounded text-xs border transition-all ${
                                  incidencia.estado === estado.id
                                    ? getEstadoColor(estado.id)
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                              >
                                {estado.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Responsable */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Responsable Asignado</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.responsableAsignado}
                            onChange={(e) => setEditData(prev => ({ ...prev, responsableAsignado: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Asignar responsable"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">
                            {incidencia.responsableAsignado || 'Sin asignar'}
                          </span>
                        )}
                      </div>

                      {/* Costo */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Costo Estimado</label>
                        {isEditing ? (
                          <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="number"
                              value={editData.costoEstimado}
                              onChange={(e) => setEditData(prev => ({ ...prev, costoEstimado: e.target.value }))}
                              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900 flex items-center gap-1">
                            <FiDollarSign className="w-4 h-4 text-gray-400" />
                            {incidencia.costoEstimado ? `${incidencia.costoEstimado}` : 'Sin estimar'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fotos */}
                {incidencia.fotos && incidencia.fotos.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FiImage className="w-4 h-4" />
                      Fotos ({incidencia.fotos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {incidencia.fotos.map(foto => (
                        <div key={foto.id} className="relative group cursor-pointer">
                          <img
                            src={foto.dataUrl}
                            alt={foto.nombre}
                            className="w-full h-24 object-cover rounded-md border border-gray-200 hover:border-blue-300 transition-colors"
                            onClick={() => setFotoAmpliada(foto)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-md flex items-center justify-center">
                            <FiZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                            {Math.round(foto.tamaño / 1024)}KB
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comentarios */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FiMessageCircle className="w-4 h-4" />
                    Comentarios y Actividad ({incidencia.comentarios.length})
                  </h4>
                  
                  {/* Lista de comentarios */}
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {incidencia.comentarios.map(comentario => (
                      <div key={comentario.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comentario.autor}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatearFecha(comentario.fecha)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comentario.texto}</p>
                        {comentario.tipo && (
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                            comentario.tipo === 'sistema' ? 'bg-blue-100 text-blue-800' :
                            comentario.tipo === 'cambio_estado' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {comentario.tipo === 'sistema' ? 'Sistema' :
                             comentario.tipo === 'cambio_estado' ? 'Cambio de Estado' :
                             'Comentario'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Nuevo comentario */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      placeholder="Agregar un comentario..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComentario();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComentario}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    >
                      <FiSend className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para foto ampliada */}
      {fotoAmpliada && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setFotoAmpliada(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-black bg-opacity-50 rounded-full"
            >
              <FiX className="w-6 h-6" />
            </button>
            <img
              src={fotoAmpliada.dataUrl}
              alt={fotoAmpliada.nombre}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-75 px-3 py-1 rounded">
              {fotoAmpliada.nombre} - {Math.round(fotoAmpliada.tamaño / 1024)}KB
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetalleIncidenciaModal;