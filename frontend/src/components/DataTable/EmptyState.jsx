import { FiInbox } from "react-icons/fi";

export default function EmptyState({ 
  message = "No hay datos disponibles", 
  icon: Icon = FiInbox,
  children 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-100 rounded-full">
          <Icon size={32} className="text-gray-500" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {children && (
        <div className="flex justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
