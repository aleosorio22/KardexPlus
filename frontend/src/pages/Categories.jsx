import { Tag, Package, Plus, Search, Folder } from 'lucide-react';

const Categories = () => {
  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
              <p className="text-gray-600">Gestión de categorías de items</p>
            </div>
          </div>
          
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categorías</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <div className="bg-blue-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <Folder className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Categorizados</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <div className="bg-green-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Última Actualización</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <div className="bg-yellow-500/10 rounded-full w-10 h-10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Área principal de contenido */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Barra de herramientas */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800">Lista de Categorías</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la tabla */}
        <div className="p-6">
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No hay categorías</h3>
            <p className="text-gray-600 mb-4">
              Comienza creando tu primera categoría para organizar tus items.
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
              <Plus className="w-4 h-4" />
              <span>Crear Primera Categoría</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
