    import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiPackage, 
  FiUsers, 
  FiMapPin, 
  FiCalendar,
  FiUser,
  FiLayers,
  FiAlertCircle
} from 'react-icons/fi';
import plantillaService from '../../services/plantillaService';
import { LoadingSpinner } from '../../components/ui';
import { GestionarItemsPlantillaModal, GestionarUsuariosPlantillaModal } from '../../components/Plantillas';
import ConfirmModal from '../../components/ConfirmModal';
import PlantillaFormModal from '../../components/Modals/PlantillaFormModal';

function PlantillaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [plantilla, setPlantilla] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState({ puede_modificar: false, es_creador: false });
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [isUsuariosModalOpen, setIsUsuariosModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para modales de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    data: null
  });

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    Plantilla_Nombre: '',
    Plantilla_Descripcion: '',
    Tipo_Plantilla: '',
    Subtipo_Plantilla: '',
    Origen_Bodega_Id: '',
    Destino_Bodega_Id: '',
    Configuracion_Adicional: ''
  });

  // Cargar datos de la plantilla
  useEffect(() => {
    loadPlantillaDetails();
  }, [id]);

  const loadPlantillaDetails = async () => {
    try {
      setIsLoading(true);
      const response = await plantillaService.getPlantillaById(id);
      
      if (response.success) {
        setPlantilla(response.data);
        setPermisos(response.permisos || { puede_modificar: false, es_creador: false });
      }
    } catch (error) {
      console.error('Error loading plantilla details:', error);
      toast.error('Error al cargar los detalles de la plantilla');
      navigate('/configuracion/plantillas');
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoBadgeColor = (tipo) => {
    const colors = {
      'Requerimiento': 'bg-purple-100 text-purple-800',
      'Movimiento': 'bg-blue-100 text-blue-800',
      'Compra': 'bg-green-100 text-green-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getSubtipoBadgeColor = (subtipo) => {
    const colors = {
      'Entrada': 'bg-green-100 text-green-700',
      'Salida': 'bg-red-100 text-red-700',
      'Transferencia': 'bg-indigo-100 text-indigo-700'
    };
    return colors[subtipo] || 'bg-gray-100 text-gray-700';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGuardarItems = async (items) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Confirmar cambios',
      message: '¿Deseas guardar los cambios realizados en los items de la plantilla?',
      onConfirm: () => confirmarGuardarItems(items),
      data: items
    });
  };

  const confirmarGuardarItems = async (items) => {
    try {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      
      await plantillaService.actualizarItemsPlantilla(id, items);
      setIsItemsModalOpen(false);
      
      // Recargar los detalles de la plantilla
      await loadPlantillaDetails();
      toast.success('Items actualizados exitosamente');
    } catch (error) {
      console.error('Error guardando items:', error);
      toast.error(error.message || 'Error al guardar los items');
      throw error;
    }
  };

  const handleGuardarUsuarios = async (usuarios) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Confirmar cambios',
      message: '¿Deseas guardar los cambios realizados en los usuarios de la plantilla?',
      onConfirm: () => confirmarGuardarUsuarios(usuarios),
      data: usuarios
    });
  };

  const confirmarGuardarUsuarios = async (usuarios) => {
    try {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      
      // Primero obtener los usuarios actualmente asignados
      const usuariosActualesIds = plantilla.usuarios_asignados?.map(u => u.Usuario_Id) || [];
      const nuevosUsuariosIds = usuarios.map(u => u.Usuario_Id);

      // Usuarios a desasignar (están actualmente pero no en la nueva lista)
      const usuariosADesasignar = usuariosActualesIds.filter(id => !nuevosUsuariosIds.includes(id));
      
      // Usuarios a asignar (están en la nueva lista pero no actualmente)
      const usuariosAAsignar = usuarios.filter(u => !usuariosActualesIds.includes(u.Usuario_Id));

      // Desasignar usuarios removidos
      if (usuariosADesasignar.length > 0) {
        await plantillaService.desasignarUsuarios(id, usuariosADesasignar);
      }

      // Asignar nuevos usuarios
      if (usuariosAAsignar.length > 0) {
        const idsAAsignar = usuariosAAsignar.map(u => u.Usuario_Id);
        await plantillaService.asignarUsuarios(id, idsAAsignar);
      }

      // Actualizar permisos de todos los usuarios (nuevos y existentes que tienen Puede_Modificar = true)
      for (const usuario of usuarios) {
        if (usuario.Puede_Modificar) {
          // Solo actualizar si el usuario tiene permisos de modificar
          await plantillaService.actualizarPermisosUsuario(id, usuario.Usuario_Id, true);
        } else if (usuariosActualesIds.includes(usuario.Usuario_Id)) {
          // Si el usuario ya estaba asignado y ahora NO tiene permisos, actualizar a false
          const usuarioActual = plantilla.usuarios_asignados.find(u => u.Usuario_Id === usuario.Usuario_Id);
          if (usuarioActual && usuarioActual.Puede_Modificar !== usuario.Puede_Modificar) {
            await plantillaService.actualizarPermisosUsuario(id, usuario.Usuario_Id, false);
          }
        }
      }

      setIsUsuariosModalOpen(false);
      
      // Recargar los detalles de la plantilla
      await loadPlantillaDetails();
      toast.success('Usuarios actualizados exitosamente');
    } catch (error) {
      console.error('Error guardando usuarios:', error);
      toast.error(error.message || 'Error al guardar los usuarios');
      throw error;
    }
  };

  const handleEditarInfo = () => {
    // Cargar datos actuales en el formulario
    setFormData({
      Plantilla_Nombre: plantilla.Plantilla_Nombre || '',
      Plantilla_Descripcion: plantilla.Plantilla_Descripcion || '',
      Tipo_Plantilla: plantilla.Tipo_Plantilla || '',
      Subtipo_Plantilla: plantilla.Subtipo_Plantilla || '',
      Origen_Bodega_Id: plantilla.Origen_Bodega_Id || '',
      Destino_Bodega_Id: plantilla.Destino_Bodega_Id || '',
      Configuracion_Adicional: plantilla.Configuracion_Adicional || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (data) => {
    try {
      setIsSaving(true);
      
      // Preparar datos para actualizar
      const updateData = {
        Plantilla_Nombre: data.Plantilla_Nombre,
        Plantilla_Descripcion: data.Plantilla_Descripcion,
        Tipo_Plantilla: data.Tipo_Plantilla,
        Subtipo_Plantilla: data.Subtipo_Plantilla || null,
        Origen_Bodega_Id: data.Origen_Bodega_Id || null,
        Destino_Bodega_Id: data.Destino_Bodega_Id || null,
        Configuracion_Adicional: data.Configuracion_Adicional || null
      };

      await plantillaService.updatePlantilla(id, updateData);
      
      setIsEditModalOpen(false);
      await loadPlantillaDetails();
      
      toast.success('Plantilla actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando plantilla:', error);
      toast.error(error.message || 'Error al actualizar la plantilla');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  if (!plantilla) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Plantilla no encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se pudo cargar la información de la plantilla
          </p>
          <div className="mt-6">
            <Link
              to="/configuracion/plantillas"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Volver a Plantillas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/configuracion/plantillas')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="mr-2 h-5 w-5" />
          Volver a Plantillas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{plantilla.Plantilla_Nombre}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTipoBadgeColor(plantilla.Tipo_Plantilla)}`}>
                <FiLayers className="mr-1 h-4 w-4" />
                {plantilla.Tipo_Plantilla}
              </span>
              {plantilla.Subtipo_Plantilla && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSubtipoBadgeColor(plantilla.Subtipo_Plantilla)}`}>
                  {plantilla.Subtipo_Plantilla}
                </span>
              )}
            </div>
          </div>

          {permisos.puede_modificar && (
            <div className="mt-4 sm:mt-0 flex gap-2">
              <button
                onClick={handleEditarInfo}
                className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <FiEdit2 className="mr-2 h-4 w-4" />
                Editar Información
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Información General</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Descripción */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <p className="text-gray-900">
                {plantilla.Plantilla_Descripcion || 'Sin descripción'}
              </p>
            </div>

            {/* Bodega de Origen */}
            {plantilla.Origen_Bodega_Nombre && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiMapPin className="mr-1 h-4 w-4" />
                  Bodega de Origen
                </label>
                <p className="text-gray-900 font-medium">
                  {plantilla.Origen_Bodega_Nombre}
                </p>
              </div>
            )}

            {/* Bodega de Destino */}
            {plantilla.Destino_Bodega_Nombre && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiMapPin className="mr-1 h-4 w-4" />
                  Bodega de Destino
                </label>
                <p className="text-gray-900 font-medium">
                  {plantilla.Destino_Bodega_Nombre}
                </p>
              </div>
            )}

            {/* Creador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiUser className="mr-1 h-4 w-4" />
                Creado por
              </label>
              <p className="text-gray-900">
                {plantilla.Creador_Nombre_Completo}
              </p>
            </div>

            {/* Fecha de Creación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiCalendar className="mr-1 h-4 w-4" />
                Fecha de Creación
              </label>
              <p className="text-gray-900">
                {formatFecha(plantilla.Fecha_Creacion)}
              </p>
            </div>

            {/* Última Modificación */}
            {plantilla.Fecha_Modificacion && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiCalendar className="mr-1 h-4 w-4" />
                  Última Modificación
                </label>
                <p className="text-gray-900">
                  {formatFecha(plantilla.Fecha_Modificacion)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items de la Plantilla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <FiPackage className="mr-2 h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Items ({plantilla.detalle?.length || 0})
            </h2>
          </div>
          {permisos.puede_modificar && (
            <button
              onClick={() => setIsItemsModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
            >
              <FiEdit2 className="mr-1 h-4 w-4" />
              Gestionar Items
            </button>
          )}
        </div>
        <div className="px-6 py-4">
          {plantilla.detalle && plantilla.detalle.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Presentación
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantilla.detalle.map((item) => (
                    <tr key={item.Plantilla_Detalle_Id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.Item_Nombre}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.Item_Codigo || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.CategoriaItem_Nombre || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.Es_Por_Presentacion && item.Presentacion_Nombre
                            ? `${item.Presentacion_Nombre} (${item.Cantidad_Presentacion})`
                            : item.UnidadMedida_Nombre || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {item.Cantidad} {item.UnidadMedida_Prefijo || ''}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay items</h3>
              <p className="mt-1 text-sm text-gray-500">
                Esta plantilla aún no tiene items configurados.
              </p>
              {permisos.puede_modificar && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsItemsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FiPackage className="mr-2 h-4 w-4" />
                    Agregar Items
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Usuarios Asignados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <FiUsers className="mr-2 h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Usuarios Asignados ({plantilla.usuarios_asignados?.length || 0})
            </h2>
          </div>
          {permisos.puede_modificar && (
            <button
              onClick={() => setIsUsuariosModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
            >
              <FiUsers className="mr-1 h-4 w-4" />
              Gestionar Usuarios
            </button>
          )}
        </div>
        <div className="px-6 py-4">
          {plantilla.usuarios_asignados && plantilla.usuarios_asignados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantilla.usuarios_asignados.map((usuario) => (
                <div
                  key={usuario.Usuario_Id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {usuario.Usuario_Nombre} {usuario.Usuario_Apellido}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{usuario.Usuario_Correo}</p>
                      {usuario.Rol_Nombre && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {usuario.Rol_Nombre}
                        </span>
                      )}
                    </div>
                    {usuario.Puede_Modificar && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Puede editar
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Asignado: {formatFecha(usuario.Fecha_Asignacion)}
                    </p>
                    {usuario.Asignado_Por_Nombre && (
                      <p className="text-xs text-gray-500">
                        Por: {usuario.Asignado_Por_Nombre}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios asignados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Esta plantilla aún no tiene usuarios asignados.
              </p>
              {permisos.puede_modificar && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsUsuariosModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FiUsers className="mr-2 h-4 w-4" />
                    Asignar Usuarios
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para gestionar items */}
      <GestionarItemsPlantillaModal
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        plantilla={plantilla}
        itemsActuales={plantilla?.detalle || []}
        onGuardar={handleGuardarItems}
      />

      {/* Modal para gestionar usuarios */}
      <GestionarUsuariosPlantillaModal
        isOpen={isUsuariosModalOpen}
        onClose={() => setIsUsuariosModalOpen(false)}
        plantilla={plantilla}
        usuariosActuales={plantilla?.usuarios_asignados || []}
        onGuardar={handleGuardarUsuarios}
      />

      {/* Modal para editar información general */}
      <PlantillaFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        formData={formData}
        setFormData={setFormData}
        isEditing={true}
        selectedPlantilla={plantilla}
        isLoading={isSaving}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Guardar"
        cancelText="Cancelar"
      />
    </div>
  );
}

export default PlantillaDetails;
