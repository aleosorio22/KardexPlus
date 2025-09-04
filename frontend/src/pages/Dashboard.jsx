import { useAuth } from '../context/AuthContext';
import { LogOut, User, Package } from 'lucide-react';

const Dashboard = () => {
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">KardexPlus</h1>
                <p className="text-xs text-muted-foreground">Sistema de Inventario</p>
              </div>
            </div>

            {/* Información del usuario */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {auth?.user?.Usuario_Nombre} {auth?.user?.Usuario_Apellido}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {auth?.user?.Rol_Nombre}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de bienvenida */}
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¡Bienvenido, {auth?.user?.Usuario_Nombre}!
            </h2>
            
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Has iniciado sesión exitosamente en el sistema KardexPlus. 
              Desde aquí podrás gestionar el inventario de manera eficiente.
            </p>

            {/* Información del usuario */}
            <div className="bg-primary/5 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Información de tu cuenta
              </h3>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre completo:</span>
                  <span className="font-medium text-foreground">
                    {auth?.user?.Usuario_Nombre} {auth?.user?.Usuario_Apellido}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correo:</span>
                  <span className="font-medium text-foreground">
                    {auth?.user?.Usuario_Correo}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rol:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    {auth?.user?.Rol_Nombre}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de usuario:</span>
                  <span className="font-medium text-foreground">
                    #{auth?.user?.Usuario_Id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas funcionalidades */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Próximas funcionalidades
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-3 w-fit mx-auto mb-3">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Gestión de Inventario</h4>
                <p className="text-sm text-muted-foreground">
                  Control completo de productos, stock y movimientos de inventario.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-3 w-fit mx-auto mb-3">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Gestión de Usuarios</h4>
                <p className="text-sm text-muted-foreground">
                  Administración de usuarios, roles y permisos del sistema.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-3 w-fit mx-auto mb-3">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Reportes</h4>
                <p className="text-sm text-muted-foreground">
                  Generación de reportes detallados y estadísticas del inventario.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
