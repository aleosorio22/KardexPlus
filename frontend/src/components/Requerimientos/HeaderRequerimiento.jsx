import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiArrowRight, FiClock } from 'react-icons/fi';

const HeaderRequerimiento = ({ onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/mis-requerimientos');
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
                        aria-label="Regresar a mis requerimientos"
                    >
                        <FiArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline text-sm sm:text-base">Regresar</span>
                    </button>
                </div>

                {/* Información del requerimiento - Layout móvil optimizado */}
                <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Icono - Tamaño responsive */}
                    <div className="flex-shrink-0 p-2.5 sm:p-3 rounded-lg bg-green-50 border-green-200 border">
                        <FiPackage className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    
                    {/* Texto - Typography móvil optimizada */}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
                            Nuevo Requerimiento
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed">
                            Solicita productos entre bodegas del sistema
                        </p>
                    </div>
                </div>

                {/* Indicador de flujo - Solo en desktop */}
                <div className="hidden lg:flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiClock className="w-3 h-3" />
                        <span>Pendiente</span>
                    </div>
                    <FiArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Aprobación</span>
                    <FiArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Despacho</span>
                </div>
            </div>
        </div>
    );
};

export default HeaderRequerimiento;