import React, { useState, useEffect } from 'react';
import { FiSettings, FiCheck, FiX, FiUser, FiShield, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import setupService from '../../services/setupService';
import { LoadingSpinner } from '../../components/ui';

const SystemSetup = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Verificar estado actual del sistema
  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await setupService.checkPermissionsStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Error al verificar el estado del sistema');
    } finally {
      setLoading(false);
    }
  };

  // Configurar permisos básicos
  const setupPermissions = async () => {
    try {
      setIsConfiguring(true);
      
      // Configurar permisos básicos
      const setupResponse = await setupService.setupPermissions();
      if (setupResponse.success) {
        toast.success('Permisos básicos configurados');
      }

      // Asignar permisos específicos a roles
      const rolePermissions = {
        'Operador': [
          'usuarios.ver',
          'usuarios.crear', 
          'usuarios.editar',
          'roles.ver'
        ],
        'Gerente': [
          'usuarios.ver',
          'usuarios.crear', 
          'usuarios.editar',
          'roles.ver',
          'roles.crear',
          'roles.editar'
        ]
      };

      for (const [roleName, permissions] of Object.entries(rolePermissions)) {
        try {
          const assignResponse = await setupService.assignPermissionsToRole(roleName, permissions);
          if (assignResponse.success) {
            toast.success(`Permisos asignados al rol ${roleName}`);
          }
        } catch (error) {
          console.warn(`No se pudo asignar permisos al rol ${roleName}:`, error.message);
        }
      }

      // Verificar estado nuevamente
      await checkStatus();
      
    } catch (error) {
      console.error('Error configurando permisos:', error);
      toast.error(error.message || 'Error al configurar permisos');
    } finally {
      setIsConfiguring(false);
    }
  };

  // Asignar permisos a un rol específico
  const assignPermissionsToOperador = async () => {
    try {
      setIsConfiguring(true);
      
      const operadorPermissions = [
        'usuarios.ver',
        'usuarios.crear', 
        'usuarios.editar',
        'usuarios.cambiar_estado',
        'roles.ver'
      ];

      const response = await setupService.assignPermissionsToRole('Operador', operadorPermissions);
      if (response.success) {
        toast.success('Permisos asignados al rol Operador exitosamente');
        await checkStatus();
      }
    } catch (error) {
      console.error('Error asignando permisos a operador:', error);
      toast.error(error.message || 'Error al asignar permisos al operador');
    } finally {
      setIsConfiguring(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 rounded-full p-3">
              <FiSettings className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
              <p className="text-gray-600">Verificar y configurar permisos del sistema</p>
            </div>
          </div>
          
          <button
            onClick={checkStatus}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado del Sistema de Permisos</h2>
        
        {status && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                {status.tablesExist ? (
                  <FiCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <FiX className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Tablas de Permisos</div>
                  <div className="text-sm text-gray-500">
                    {status.tablesExist ? 'Creadas' : 'No existen'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                {status.permissionsCount > 0 ? (
                  <FiCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <FiX className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Permisos</div>
                  <div className="text-sm text-gray-500">
                    {status.permissionsCount || 0} configurados
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                {status.assignmentsCount > 0 ? (
                  <FiCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <FiX className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Asignaciones</div>
                  <div className="text-sm text-gray-500">
                    {status.assignmentsCount || 0} activas
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                {status.functionExists ? (
                  <FiCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <FiX className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Función BD</div>
                  <div className="text-sm text-gray-500">
                    {status.functionExists ? 'Disponible' : 'No existe'}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${status.isConfigured ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center space-x-2">
                {status.isConfigured ? (
                  <FiCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <FiX className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${status.isConfigured ? 'text-green-800' : 'text-yellow-800'}`}>
                  {status.isConfigured ? 'Sistema configurado correctamente' : 'Sistema requiere configuración'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones de Configuración */}
      {status && !status.isConfigured && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones de Configuración</h2>
          
          <div className="space-y-4">
            {!status.tablesExist && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800">Tablas no encontradas</h3>
                <p className="text-sm text-red-600 mt-1">
                  Ejecuta manualmente el archivo <code>backend/docs/permisos.sql</code> en tu base de datos.
                </p>
              </div>
            )}
            
            {status.tablesExist && status.permissionsCount === 0 && (
              <button
                onClick={setupPermissions}
                disabled={isConfiguring}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FiSettings className="w-4 h-4" />
                <span>{isConfiguring ? 'Configurando...' : 'Configurar Permisos Básicos'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Acciones Específicas */}
      {status && status.isConfigured && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuraciones Específicas</h2>
          
          <div className="space-y-4">
            <button
              onClick={assignPermissionsToOperador}
              disabled={isConfiguring}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FiUser className="w-4 h-4" />
              <span>{isConfiguring ? 'Asignando...' : 'Asignar Permisos al Rol Operador'}</span>
            </button>
            
            <p className="text-sm text-gray-600">
              Esto asignará los permisos necesarios para que el rol "Operador" pueda gestionar usuarios.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSetup;
