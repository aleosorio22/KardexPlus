import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiArrowLeft, FiPackage, FiTruck, FiArrowRight, 
    FiEdit3, FiRefreshCw 
} from 'react-icons/fi';

/**
 * Componente HeaderMovimiento - Header mobile-first para crear movimientos
 * 
 * @param {Object} props
 * @param {string} props.tipo - Tipo de movimiento (entrada, salida, transferencia, ajuste)
 * @param {Function} props.onBack - Función para regresar (opcional, por defecto navega a /bodegas/movimientos)
 */
const HeaderMovimiento = ({ tipo, onBack }) => {
    const navigate = useNavigate();

    const getTipoInfo = (tipo) => {
        const tipos = {
            'entrada': {
                icono: FiPackage,
                color: 'text-primary',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                titulo: 'Nueva Entrada',
                descripcion: 'Registrar ingreso de productos al inventario'
            },
            'salida': {
                icono: FiTruck,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                titulo: 'Nueva Salida',
                descripcion: 'Registrar salida de productos del inventario'
            },
            'transferencia': {
                icono: FiRefreshCw,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                titulo: 'Nueva Transferencia',
                descripcion: 'Transferir productos entre bodegas'
            },
            'ajuste': {
                icono: FiEdit3,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                titulo: 'Nuevo Ajuste',
                descripcion: 'Ajustar cantidades en inventario'
            }
        };
        return tipos[tipo] || tipos['entrada'];
    };

    const tipoInfo = getTipoInfo(tipo);
    const IconoTipo = tipoInfo.icono;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/bodegas/movimientos');
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Mobile-first: Header compacto con navegación táctil */}
            <div className="p-4 sm:p-6">
                {/* Navegación - Área táctil amplia para móviles */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors 
                                 p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200
                                 min-h-[44px] min-w-[44px] touch-manipulation"
                        aria-label="Regresar a movimientos"
                    >
                        <FiArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline text-sm sm:text-base">Regresar</span>
                    </button>
                </div>

                {/* Información del tipo de movimiento - Layout móvil optimizado */}
                <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Icono - Tamaño responsive */}
                    <div className={`flex-shrink-0 p-2.5 sm:p-3 rounded-lg ${tipoInfo.bgColor} ${tipoInfo.borderColor} border`}>
                        <IconoTipo className={`h-5 w-5 sm:h-6 sm:w-6 ${tipoInfo.color}`} />
                    </div>
                    
                    {/* Texto - Typography móvil optimizada */}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
                            {tipoInfo.titulo}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed">
                            {tipoInfo.descripcion}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderMovimiento;