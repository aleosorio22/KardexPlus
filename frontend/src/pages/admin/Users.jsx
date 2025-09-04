import { FiUsers, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const Users = () => {
  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500/10 rounded-full p-3">
              <FiUsers className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra los usuarios del sistema KardexPlus</p>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            <FiPlus size={16} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Contenido principal - En construcción */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <div className="bg-yellow-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FiUsers className="w-10 h-10 text-yellow-500" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Módulo en Construcción
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Esta sección estará disponible próximamente. Aquí podrás gestionar todos los usuarios del sistema.
          </p>

          {/* Preview de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <FiPlus className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-800 mb-1">Crear Usuarios</h3>
              <p className="text-sm text-gray-600">Registrar nuevos usuarios en el sistema</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <FiEdit className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-800 mb-1">Editar Perfiles</h3>
              <p className="text-sm text-gray-600">Modificar información de usuarios existentes</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <FiTrash2 className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-800 mb-1">Gestionar Roles</h3>
              <p className="text-sm text-gray-600">Asignar y modificar roles y permisos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
