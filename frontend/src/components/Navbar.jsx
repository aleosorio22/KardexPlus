import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from './Sidebar';
import { 
  FiUser, 
  FiBell, 
  FiLogOut, 
  FiMenu,
  FiX,
  FiSettings,
  FiSearch
} from 'react-icons/fi';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const { setIsMobileOpen } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Stock bajo en productos', time: '5 min' },
    { id: 2, text: 'Nuevo movimiento registrado', time: '10 min' },
    { id: 3, text: 'Usuario actualizado', time: '1 hora' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="flex justify-between items-center h-16 px-4 md:px-6">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors mr-2"
            aria-label="Abrir menú"
          >
            <FiMenu size={24} />
          </button>

          <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
            Panel Administrativo
          </h1>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500/20 outline-none transition-colors"
            />
          </div>
        </div>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 relative transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                3
              </span>
            </button>

            {/* Dropdown Notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                </div>
                {notifications.map((note) => (
                  <div key={note.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800">{note.text}</p>
                    <p className="text-xs text-gray-500">Hace {note.time}</p>
                  </div>
                ))}
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-green-500 text-sm hover:text-green-600 w-full text-center">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
            <FiSettings size={20} />
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3 px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {auth?.user?.Usuario_Nombre?.[0] || "U"}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">
                {auth?.user?.Usuario_Nombre} {auth?.user?.Usuario_Apellido}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {auth?.user?.Rol_Nombre || "Usuario"}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button 
            onClick={logout}
            className="p-2 rounded-md hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
            title="Cerrar Sesión"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
