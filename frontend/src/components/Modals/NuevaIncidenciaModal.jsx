import { useState, useEffect } from 'react';
import { 
  FiX, 
  FiCamera, 
  FiUpload, 
  FiTrash2, 
  FiMapPin, 
  FiTool, 
  FiUser,
  FiDollarSign,
  FiAlertTriangle,
  FiSave
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import IncidenciaService from '../../services/incidenciaService';

const NuevaIncidenciaModal = ({ isOpen, onClose, onIncidenciaCreada }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    prioridad: 'media',
    ubicacion: '',
    equipoAfectado: '',
    costoEstimado: '',
    responsableAsignado: ''
  });

  const [fotos, setFotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);

  const categorias = IncidenciaService.getCategorias();
  const prioridades = IncidenciaService.getPrioridades();

  // Detectar soporte de cámara
  useEffect(() => {
    // Verificar si el navegador soporta getUserMedia (API de cámara)
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasFileInput = 'capture' in document.createElement('input');
    setCameraSupported(hasGetUserMedia || hasFileInput);
  }, []);

  const subcategoriasDisponibles = formData.categoria 
    ? categorias.find(cat => cat.id === formData.categoria)?.subcategorias || []
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Limpiar subcategoría si se cambia la categoría
      ...(name === 'categoria' && { subcategoria: '' })
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    setIsUploadingPhoto(true);
    
    try {
      const nuevasFotos = [];
      
      for (const file of files) {
        try {
          const fotoProcessada = await IncidenciaService.processImage(file);
          nuevasFotos.push(fotoProcessada);
        } catch (error) {
          toast.error(`Error al procesar ${file.name}: ${error.message}`);
        }
      }

      setFotos(prev => [...prev, ...nuevasFotos]);
      
      if (nuevasFotos.length > 0) {
        toast.success(`${nuevasFotos.length} foto(s) agregada(s) exitosamente`);
      }
    } catch (error) {
      toast.error('Error al procesar las fotos');
    } finally {
      setIsUploadingPhoto(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  const handleCameraCapture = async (e) => {
    console.log('📸 Botón de cámara presionado');
    console.log('📁 Archivos seleccionados:', e.target.files?.length || 0);
    
    if (e.target.files && e.target.files.length > 0) {
      try {
        await handlePhotoUpload(e);
      } catch (error) {
        console.error('Error al procesar foto de cámara:', error);
        toast.error('Error al procesar la foto de la cámara');
      }
    } else {
      console.log('⚠️ No se seleccionaron archivos de la cámara');
      
      // Si no hay soporte de cámara, mostrar mensaje informativo
      if (!cameraSupported) {
        toast.error('Tu navegador no soporta acceso a la cámara. Usa "Subir Fotos" en su lugar.');
      } else {
        toast.info('No se tomó ninguna foto. Intenta de nuevo.');
      }
    }
  };

  const eliminarFoto = (fotoId) => {
    setFotos(prev => prev.filter(foto => foto.id !== fotoId));
    toast.success('Foto eliminada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!formData.descripcion.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    if (!formData.categoria) {
      toast.error('Selecciona una categoría');
      return;
    }

    if (!formData.subcategoria) {
      toast.error('Selecciona una subcategoría');
      return;
    }

    setIsSubmitting(true);

    try {
      const nuevaIncidencia = IncidenciaService.saveIncidencia({
        ...formData,
        fotos: fotos
      });

      toast.success('Incidencia creada exitosamente');
      
      // Notificar al componente padre
      if (onIncidenciaCreada) {
        onIncidenciaCreada(nuevaIncidencia);
      }

      // Limpiar formulario
      setFormData({
        titulo: '',
        descripcion: '',
        categoria: '',
        subcategoria: '',
        prioridad: 'media',
        ubicacion: '',
        equipoAfectado: '',
        costoEstimado: '',
        responsableAsignado: ''
      });
      setFotos([]);
      
      onClose();
    } catch (error) {
      toast.error(error.message || 'Error al crear la incidencia');
    } finally {
      setIsSubmitting(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div className="relative inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <div className="bg-blue-500/10 rounded-full w-8 h-8 flex items-center justify-center">
                  <FiAlertTriangle className="w-4 h-4 text-blue-500" />
                </div>
                Nueva Incidencia
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la Incidencia *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Refrigerador principal no enfría correctamente"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe el problema, qué pasó, cuándo ocurrió, etc..."
                  required
                />
              </div>

              {/* Categoría y Subcategoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategoría *
                  </label>
                  <select
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!formData.categoria}
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {subcategoriasDisponibles.map(subcat => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {prioridades.map(prioridad => (
                    <label
                      key={prioridad.id}
                      className={`relative flex cursor-pointer rounded-md border p-3 focus:outline-none ${
                        formData.prioridad === prioridad.id
                          ? getPrioridadColor(prioridad.id)
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="prioridad"
                        value={prioridad.id}
                        checked={formData.prioridad === prioridad.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-xs font-medium">{prioridad.nombre}</span>
                        <span className="text-xs text-gray-500 mt-1">{prioridad.descripcion}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ubicación y Equipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiMapPin className="inline w-4 h-4 mr-1" />
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Cocina principal, Mesa 5, Almacén"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiTool className="inline w-4 h-4 mr-1" />
                    Equipo Afectado
                  </label>
                  <input
                    type="text"
                    name="equipoAfectado"
                    value={formData.equipoAfectado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Refrigerador #1, Plancha, POS Principal"
                  />
                </div>
              </div>

              {/* Responsable y Costo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUser className="inline w-4 h-4 mr-1" />
                    Responsable Asignado
                  </label>
                  <input
                    type="text"
                    name="responsableAsignado"
                    value={formData.responsableAsignado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Técnico Juan, Supervisor María"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiDollarSign className="inline w-4 h-4 mr-1" />
                    Costo Estimado
                  </label>
                  <input
                    type="number"
                    name="costoEstimado"
                    value={formData.costoEstimado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Fotos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos de la Incidencia
                </label>
                
                {/* Información sobre uso de cámara */}
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Consejos:</strong> En móviles, usa "Cámara" para la frontal y "Cámara Trasera" para mejor calidad. 
                    En computadoras, usa "Subir Fotos" para seleccionar archivos.
                  </p>
                </div>
                
                {/* Botones de upload */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 text-sm transition-colors">
                    <FiUpload className="w-4 h-4" />
                    Subir Fotos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                  </label>

                  <label className={`px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 text-sm transition-colors ${
                    cameraSupported 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}>
                    <FiCamera className="w-4 h-4" />
                    {cameraSupported ? 'Cámara' : 'Cámara no disponible'}
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleCameraCapture}
                      className="hidden"
                      disabled={isUploadingPhoto || !cameraSupported}
                    />
                  </label>

                  {/* Botón adicional para cámara trasera en móviles */}
                  {cameraSupported && (
                    <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 text-sm transition-colors sm:hidden">
                      <FiCamera className="w-4 h-4" />
                      Cámara Trasera
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                        className="hidden"
                        disabled={isUploadingPhoto}
                      />
                    </label>
                  )}
                </div>

                {/* Preview de fotos */}
                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fotos.map(foto => (
                      <div key={foto.id} className="relative group">
                        <img
                          src={foto.dataUrl}
                          alt={foto.nombre}
                          className="w-full h-24 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => eliminarFoto(foto.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {Math.round(foto.tamaño / 1024)}KB
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isUploadingPhoto && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Procesando fotos...</p>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors sm:ml-3 sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Crear Incidencia
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="mt-3 w-full sm:mt-0 sm:w-auto bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-300 rounded-md transition-colors sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaIncidenciaModal;