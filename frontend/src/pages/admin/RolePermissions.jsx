import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShield, FiSave, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import roleService from '../../services/roleService';
import { LoadingSpinner } from '../../components/ui';

// Importar el servicio de permisos que ya tenemos
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3499/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Servicio para obtener todos los permisos
const permissionsService = {
  getAllPermissions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions/all`, getAuthHeaders());
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
};

const RolePermissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [roleResponse, allPermissionsResponse, rolePermissionsResponse] = await Promise.all([
        roleService.getRoleById(id),
        permissionsService.getAllPermissions(),
        roleService.getRolePermissions(id)
      ]);

      if (roleResponse.success) {
        setRole(roleResponse.data);
      }

      if (allPermissionsResponse.success) {
        setAllPermissions(allPermissionsResponse.data.permissions || []);
      }

      if (rolePermissionsResponse.success) {
        setRolePermissions(rolePermissionsResponse.data.permissions || []);
        // Crear set con los IDs de permisos que ya tiene el rol
        const currentPermissionIds = new Set(
          rolePermissionsResponse.data.permissions.map(p => p.Permiso_Id)
        );
        setSelectedPermissions(currentPermissionIds);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const permissionIds = Array.from(selectedPermissions);
      
      const response = await roleService.assignRolePermissions(id, permissionIds);
      
      if (response.success) {
        toast.success('Permisos actualizados exitosamente');
        // Recargar los permisos del rol
        loadData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error(error.message || 'Error al guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  const groupPermissionsByModule = (permissions) => {
    return permissions.reduce((acc, permission) => {
      const module = permission.Permiso_Modulo;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {});
  };

  const getModuleStats = (modulePermissions) => {
    const total = modulePermissions.length;
    const selected = modulePermissions.filter(p => selectedPermissions.has(p.Permiso_Id)).length;
    return { total, selected, percentage: total > 0 ? (selected / total) * 100 : 0 };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Rol no encontrado</h2>
          <p className="text-gray-600 mb-4">El rol que buscas no existe o no tienes permisos para verlo.</p>
          <button
            onClick={() => navigate('/configuracion/roles')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a Roles
          </button>
        </div>
      </div>
    );
  }

  const groupedPermissions = groupPermissionsByModule(allPermissions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/configuracion/roles')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="bg-blue-500/10 rounded-full p-3">
              <FiShield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Permisos del Rol: {role.Rol_Nombre}
              </h1>
              <p className="text-gray-600">
                {role.Rol_Descripcion || 'Sin descripción'} • {role.Usuario_Count} usuarios asignados
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <FiSave size={16} />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-500/10 rounded-full p-2 mr-3">
              <FiShield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{allPermissions.length}</div>
              <div className="text-sm text-gray-600">Total Permisos</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-500/10 rounded-full p-2 mr-3">
              <FiCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{selectedPermissions.size}</div>
              <div className="text-sm text-gray-600">Asignados</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-gray-500/10 rounded-full p-2 mr-3">
              <FiX className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allPermissions.length - selectedPermissions.size}
              </div>
              <div className="text-sm text-gray-600">Sin Asignar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Permisos por módulo */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([module, permissions]) => {
          const stats = getModuleStats(permissions);
          
          return (
            <div key={module} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">
                      Módulo: {module}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {stats.selected} de {stats.total} permisos asignados
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round(stats.percentage)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <label
                      key={permission.Permiso_Id}
                      className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.has(permission.Permiso_Id)}
                        onChange={() => handlePermissionToggle(permission.Permiso_Id)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {permission.Permiso_Nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {permission.Permiso_Codigo}
                        </div>
                        {permission.Permiso_Descripcion && (
                          <div className="text-xs text-gray-600 mt-1">
                            {permission.Permiso_Descripcion}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RolePermissions;
