import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import {
  FiHome,
  FiUsers,
  FiUser,
  FiPackage,
  FiShoppingCart,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiBox,
  FiTag,
  FiTool,
  FiDatabase,
  FiBarChart2,
  FiArchive,
  FiRefreshCw,
  FiClipboard,
  FiFileText
} from "react-icons/fi";

// Contexto para compartir el estado del sidebar
const SidebarContext = createContext();
export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Detectar tamaño de pantalla para colapsar automáticamente en pantallas pequeñas
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsExpanded(false);
      }
    };

    // Inicializar
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        setIsExpanded,
        isMobileOpen,
        setIsMobileOpen,
        openSubmenus,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export default function Sidebar() {
  
  const { logout } = useAuth();
  const location = useLocation();
  const { hasPermission, hasModulePermissions, loading: permissionsLoading } = usePermissions();
  const { isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen, openSubmenus, toggleSubmenu } = useSidebar();


  // Menú items con submenús y permisos requeridos
  const menuItems = [
    { 
      name: "Inicio", 
      icon: FiHome, 
      path: "/dashboard",
      permission: "dashboard.ver"
    },
    { 
      name: "Inventario", 
      icon: FiPackage, 
      hasSubmenu: true,
      modulePermission: "inventario",
      submenu: [
        { 
          name: "Categorías", 
          icon: FiTag, 
          path: "/inventario/categorias",
          permission: "categorias.ver"
        },
        { 
          name: "Items", 
          icon: FiBox, 
          path: "/inventario/items",
          permission: "items.ver"
        },
      ]
    },
    { 
      name: "Bodegas", 
      icon: FiDatabase, 
      hasSubmenu: true,
      modulePermission: "bodegas",
      submenu: [
        { 
          name: "Resumen", 
          icon: FiBarChart2, 
          path: "/bodegas/resumen",
          permission: "bodegas.ver"
        },
        { 
          name: "Existencias", 
          icon: FiArchive, 
          path: "/bodegas/existencias",
          permission: "bodegas.ver"
        },
        { 
          name: "Movimientos", 
          icon: FiRefreshCw, 
          path: "/bodegas/movimientos",
          permission: "bodegas.ver"
        },
        { 
          name: "Requerimientos", 
          icon: FiClipboard, 
          path: "/bodegas/requerimientos",
          permission: "bodegas.ver"
        },
        { 
          name: "Mis Requerimientos", 
          icon: FiUser, 
          path: "/mis-requerimientos",
          permission: "requerimientos.ver"
        },
      ]
    },
    { 
      name: "Compras", 
      icon: FiShoppingCart, 
      path: "/compras",
      permission: "compras.ver"
    },
    { 
      name: "Registro de Incidencias y Actividades", 
      icon: FiFileText, 
      path: "/incidencias",
      permission: "incidencias.ver"
    },
    { 
      name: "Configuración", 
      icon: FiSettings, 
      hasSubmenu: true,
      modulePermission: "configuracion", // Verificar si tiene algún permiso del módulo
      submenu: [
        { 
          name: "Usuarios", 
          icon: FiUsers, 
          path: "/configuracion/usuarios",
          permission: "usuarios.ver"
        },
        { 
          name: "Bodegas", 
          icon: FiDatabase, 
          path: "/configuracion/bodegas",
          permission: "bodegas.ver"
        },
        { 
          name: "Unidades de Medida", 
          icon: FiTool, 
          path: "/configuracion/unidades-medida",
          permission: "categorias.ver"
        },
        { 
          name: "Almacenes y Producción", 
          icon: FiSettings, 
          path: "/configuracion/almacenes",
          permission: "bodegas.ver"
        },
        { 
          name: "Turnos", 
          icon: FiClock, 
          path: "/configuracion/turnos",
          permission: "configuracion.ver"
        },
      ]
    },
  ];

  // Filtrar elementos del menú basado en permisos
  const getFilteredMenuItem = (item) => {
    // TEMPORALMENTE: mostrar todos los elementos sin filtrar
    return item;
    
    // Código original comentado por ahora
    /*
    // Si está cargando permisos, mostrar todos los elementos temporalmente
    if (permissionsLoading) return item;

    if (item.hasSubmenu) {
      // Para submenús, filtrar los elementos internos
      const filteredSubmenu = item.submenu.filter(subItem => 
        !subItem.permission || hasPermission(subItem.permission)
      );
      
      // Si no hay submenús visibles, no mostrar el elemento principal
      if (filteredSubmenu.length === 0) return null;
      
      return {
        ...item,
        submenu: filteredSubmenu
      };
    } else {
      // Para elementos normales, verificar permiso directo
      if (item.permission && !hasPermission(item.permission)) {
        return null;
      }
      return item;
    }
    */
  };

  const filteredMenuItems = menuItems
    .map(getFilteredMenuItem)
    .filter(Boolean); // Remover elementos null
    

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname === item.path);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const handleMenuItemClick = () => {
    // Cerrar sidebar móvil
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
    
    // Colapsar sidebar en desktop si está expandido
    if (window.innerWidth >= 768 && isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleSubmenuToggle = (menuName) => {
    // Si el sidebar está colapsado, expandirlo al hacer clic en un menú con submenú
    if (!isExpanded) {
      setIsExpanded(true);
    }
    toggleSubmenu(menuName);
  };

  return (
    <>
      {/* Sidebar para desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
                   ${isExpanded ? "w-64" : "w-[80px]"} 
                   hidden md:flex shadow-sm`}
      >
        {/* Logo y toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-white" />
            </div>
            {isExpanded && <span className="ml-3 text-gray-800 font-semibold">KardexPlus</span>}
          </Link>

          {isExpanded && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Colapsar menú"
            >
              <FiChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Toggle button para sidebar colapsado */}
        {!isExpanded && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-green-500 p-1.5 rounded-full text-white hover:bg-green-600 shadow-md transition-colors"
            aria-label="Expandir menú"
          >
            <FiMenu size={16} />
          </button>
        )}

        {/* Navegación principal */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          <ul className="space-y-1.5 px-2">
            {filteredMenuItems.map((item) => (
              <li key={item.name}>
                {item.hasSubmenu ? (
                  <>
                    {/* Elemento con submenú */}
                    <button
                      onClick={() => handleSubmenuToggle(item.name)}
                      className={`flex items-center w-full ${isExpanded ? "px-4" : "justify-center px-0"} py-3 rounded-md transition-all duration-200
                                ${
                                  isSubmenuActive(item.submenu)
                                    ? "bg-green-500 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-green-600"
                                }`}
                    >
                      <item.icon
                        className={`${isExpanded ? "mr-3" : ""} transition-transform ${isSubmenuActive(item.submenu) ? "scale-110" : ""}`}
                        size={20}
                      />
                      {isExpanded && (
                        <>
                          <span className="font-medium flex-1 text-left">{item.name}</span>
                          {openSubmenus[item.name] ? (
                            <FiChevronDown size={16} />
                          ) : (
                            <FiChevronRight size={16} />
                          )}
                        </>
                      )}
                    </button>
                    
                    {/* Submenú */}
                    {isExpanded && openSubmenus[item.name] && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.path}
                              onClick={handleMenuItemClick}
                              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 text-sm
                                        ${
                                          isActive(subItem.path)
                                            ? "bg-green-500 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-green-600"
                                        }`}
                            >
                              <subItem.icon className="mr-3" size={16} />
                              <span className="font-medium">{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  /* Elemento normal sin submenú */
                  <Link
                    to={item.path}
                    onClick={handleMenuItemClick}
                    className={`flex items-center ${isExpanded ? "px-4" : "justify-center px-0"} py-3 rounded-md transition-all duration-200
                              ${
                                isActive(item.path)
                                  ? "bg-green-500 text-white shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-green-600"
                              }`}
                  >
                    <item.icon
                      className={`${isExpanded ? "mr-3" : ""} transition-transform ${isActive(item.path) ? "scale-110" : ""}`}
                      size={20}
                    />
                    {isExpanded && <span className="font-medium">{item.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Botón de logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className={`flex items-center ${isExpanded ? "px-4" : "justify-center px-0"} py-3 w-full text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors`}
            title="Cerrar Sesión"
          >
            <FiLogOut className={`${isExpanded ? "mr-3" : ""}`} size={20} />
            {isExpanded && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out transform ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={closeMobileSidebar}></div>

          {/* Sidebar content */}
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white flex flex-col shadow-xl">
            {/* Header con botón de cerrar */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <Link to="/dashboard" className="flex items-center" onClick={closeMobileSidebar}>
                <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <FiPackage className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-gray-800 font-semibold">KardexPlus</span>
              </Link>
              <button
                onClick={closeMobileSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Navegación */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
              <ul className="space-y-1 px-3">
                {filteredMenuItems.map((item) => (
                  <li key={item.name}>
                    {item.hasSubmenu ? (
                      <>
                        {/* Elemento con submenú - móvil */}
                        <button
                          onClick={() => toggleSubmenu(item.name)}
                          className={`flex items-center w-full px-4 py-3 rounded-md transition-all duration-200 ${
                            isSubmenuActive(item.submenu)
                              ? "bg-green-500 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-green-600"
                          }`}
                        >
                          <item.icon className={`mr-3 ${isSubmenuActive(item.submenu) ? "scale-110" : ""}`} size={20} />
                          <span className="font-medium flex-1 text-left">{item.name}</span>
                          {openSubmenus[item.name] ? (
                            <FiChevronDown size={16} />
                          ) : (
                            <FiChevronRight size={16} />
                          )}
                        </button>
                        
                        {/* Submenú - móvil */}
                        {openSubmenus[item.name] && (
                          <ul className="mt-2 ml-6 space-y-1">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 text-sm ${
                                    isActive(subItem.path)
                                      ? "bg-green-500 text-white shadow-sm"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-green-600"
                                  }`}
                                  onClick={closeMobileSidebar}
                                >
                                  <subItem.icon className="mr-3" size={16} />
                                  <span className="font-medium">{subItem.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      /* Elemento normal sin submenú - móvil */
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-md transition-all duration-200 ${
                          isActive(item.path)
                            ? "bg-green-500 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-green-600"
                        }`}
                        onClick={closeMobileSidebar}
                      >
                        <item.icon className={`mr-3 ${isActive(item.path) ? "scale-110" : ""}`} size={20} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  logout();
                  closeMobileSidebar();
                }}
                className="flex items-center w-full px-4 py-3 text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="mr-3" size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
