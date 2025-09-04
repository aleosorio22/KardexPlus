import { useState, useEffect } from 'react';
import { FiShield, FiUsers, FiLock, FiSettings, FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import roleService from '../../services/roleService';
import { LoadingSpinner } from '../../components/ui';

const Roles = () => {
  console.log('Roles component - Rendering');
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    Rol_Nombre: '',
    Rol_Descripcion: ''
  });

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, []);

  // Cargar todos los roles
  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAllRoles();
      if (response.success) {
        setRoles(response.data);
      } else {
        toast.error('Error al cargar roles');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error(error.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Crear o actualizar rol
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.Rol_Nombre.trim()) {
      toast.error('El nombre del rol es obligatorio');
      return;
    }

    try {
      let response;
      if (selectedRole) {
        // Actualizar rol existente
        response = await roleService.updateRole(selectedRole.Rol_Id, formData);
      } else {
        // Crear nuevo rol
        response = await roleService.createRole(formData);
      }

      if (response.success) {
        toast.success(response.message);
        setShowCreateModal(false);
        setSelectedRole(null);
        setFormData({ Rol_Nombre: '', Rol_Descripcion: '' });
        loadRoles();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.message || 'Error al guardar el rol');
    }
  };

  // Eliminar rol
  const handleDelete = async (role) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el rol "${role.Rol_Nombre}"?`)) {
      return;
    }

    try {
      const response = await roleService.deleteRole(role.Rol_Id);
      if (response.success) {
        toast.success('Rol eliminado exitosamente');
        loadRoles();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error.message || 'Error al eliminar el rol');
    }
  };

  // Abrir modal para crear rol
  const openCreateModal = () => {
    setSelectedRole(null);
    setFormData({ Rol_Nombre: '', Rol_Descripcion: '' });
    setShowCreateModal(true);
  };

  // Abrir modal para editar rol
  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      Rol_Nombre: role.Rol_Nombre,
      Rol_Descripcion: role.Rol_Descripcion || ''
    });
    setShowCreateModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowCreateModal(false);
    setSelectedRole(null);
    setFormData({ Rol_Nombre: '', Rol_Descripcion: '' });
  };
  
  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 rounded-full p-3">
              <FiShield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Roles y Permisos</h1>
              <p className="text-gray-600">Administra los roles y permisos del sistema KardexPlus</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              to="/configuracion/usuarios"
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FiUsers size={16} />
              <span>Volver a Usuarios</span>
            </Link>
            
            <button 
              onClick={openCreateModal}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiShield size={16} />
              <span>Nuevo Rol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Tabla de roles */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No hay roles registrados
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.Rol_Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-500/10 rounded-full p-2 mr-3">
                            <FiShield className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {role.Rol_Nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {role.Rol_Descripcion || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {role.Usuario_Count} usuarios
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/configuracion/roles/${role.Rol_Id}/permisos`}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title="Gestionar permisos"
                          >
                            <FiLock size={16} />
                          </Link>
                          <button
                            onClick={() => openEditModal(role)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Editar rol"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(role)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Eliminar rol"
                            disabled={role.Usuario_Count > 0}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para crear/editar rol */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  name="Rol_Nombre"
                  value={formData.Rol_Nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Gerente, Operador..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="Rol_Descripcion"
                  value={formData.Rol_Descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del rol..."
                />
              </div>
            </form>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {selectedRole ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
