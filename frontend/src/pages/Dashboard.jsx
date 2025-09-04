import { Package, Construction } from 'lucide-react';
import { LoadingSpinner } from '../components/ui';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center">
          <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Panel principal del sistema KardexPlus</p>
        </div>
      </div>

      {/* Mensaje en construcción */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <div className="bg-yellow-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            En Construcción
          </h2>
          
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Estamos trabajando en esta sección para brindarte la mejor experiencia. 
            Pronto estará disponible con todas las funcionalidades.
          </p>

          <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <Construction className="w-4 h-4 mr-2" />
            Funcionalidad en desarrollo
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
