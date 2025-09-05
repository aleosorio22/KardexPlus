import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';

export default function UserFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isEditing = false,
  selectedUser = null,
  isLoading = false,
  availableRoles = []
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Roles por defecto si no se proporcionan
  const defaultRoles = [
    { Rol_Id: 1, Rol_Nombre: 'Administrador' },
    { Rol_Id: 2, Rol_Nombre: 'Gerente' },
    { Rol_Id: 3, Rol_Nombre: 'Empleado' },
    { Rol_Id: 4, Rol_Nombre: 'Visualizador' }
  ];

  const roles = availableRoles.length > 0 ? availableRoles : defaultRoles;

  useEffect(() => {
    if (isEditing && selectedUser) {
      setFormData({
        Usuario_Nombre: selectedUser.Usuario_Nombre || '',
        Usuario_Apellido: selectedUser.Usuario_Apellido || '',
        Usuario_Correo: selectedUser.Usuario_Correo || '',
        Rol_Id: selectedUser.Rol_Id || '',
        Usuario_Estado: selectedUser.Usuario_Estado || 1
      });
    } else if (!isEditing) {
      // Limpiar formulario para nuevo usuario
      setFormData({
        Usuario_Nombre: '',
        Usuario_Apellido: '',
        Usuario_Correo: '',
        Usuario_Contrasena: '',
        Rol_Id: '',
        Usuario_Estado: 1
      });
    }
  }, [isEditing, selectedUser, setFormData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </Dialog.Title>
                  <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.Usuario_Nombre || ''}
                      onChange={(e) => setFormData({...formData, Usuario_Nombre: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors"
                      placeholder="Ingrese el nombre"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.Usuario_Apellido || ''}
                      onChange={(e) => setFormData({...formData, Usuario_Apellido: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors"
                      placeholder="Ingrese el apellido"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.Usuario_Correo || ''}
                      onChange={(e) => setFormData({...formData, Usuario_Correo: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors"
                      placeholder="Ingrese el email"
                      disabled={isLoading}
                    />
                  </div>

                  {!isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.Usuario_Contrasena || ''}
                          onChange={(e) => setFormData({...formData, Usuario_Contrasena: e.target.value})}
                          className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors"
                          placeholder="Ingrese la contraseña"
                          disabled={isLoading}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 6 caracteres
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      required
                      value={formData.Rol_Id || ''}
                      onChange={(e) => setFormData({...formData, Rol_Id: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors"
                      disabled={isLoading}
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map((role) => (
                        <option key={role.Rol_Id} value={role.Rol_Id}>
                          {role.Rol_Nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={formData.Usuario_Estado || 1}
                        onChange={(e) => setFormData({...formData, Usuario_Estado: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors"
                        disabled={isLoading}
                      >
                        <option value={1}>Activo</option>
                        <option value={0}>Inactivo</option>
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg text-white transition-colors ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        isEditing ? 'Guardar Cambios' : 'Crear Usuario'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
