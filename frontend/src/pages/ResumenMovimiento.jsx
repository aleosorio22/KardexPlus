import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    FiArrowLeft, 
    FiPrinter, 
    FiCheck, 
    FiPackage, 
    FiMapPin, 
    FiUser, 
    FiCalendar,
    FiFileText,
    FiHash,
    FiBox
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import TicketPOS from '../components/TicketPOS/TicketPOS';
import { movimientoService } from '../services/movimientoService';

const ResumenMovimiento = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [confirmando, setConfirmando] = useState(false);
    const [mostrarTicket, setMostrarTicket] = useState(false);

    // Obtener datos del movimiento desde el state de navegación
    const { movimientoData, itemsMovimiento, tipo, bodegas, usuarioLogueado } = location.state || {};

    // Debug: verificar datos recibidos
    useEffect(() => {
        console.log('ResumenMovimiento - datos recibidos:', {
            itemsMovimiento,
            primerItem: itemsMovimiento?.[0]
        });
        
        // Debug específico para presentaciones
        if (itemsMovimiento && itemsMovimiento.length > 0) {
            itemsMovimiento.forEach((item, index) => {
                console.log(`📄 ResumenMovimiento: Item ${index + 1} - TODOS LOS CAMPOS:`, item);
                console.log(`📄 ResumenMovimiento: Item ${index + 1} - CAMPOS DE PRESENTACIÓN:`, {
                    Item_Nombre: item.Item_Nombre,
                    Item_Descripcion: item.Item_Descripcion,
                    Es_Movimiento_Por_Presentacion: item.Es_Movimiento_Por_Presentacion,
                    Presentacion_Nombre: item.Presentacion_Nombre,
                    Presentacion_Unidad_Prefijo: item.Presentacion_Unidad_Prefijo,
                    Factor_Conversion: item.Factor_Conversion,
                    Cantidad_Presentacion: item.Cantidad_Presentacion,
                    Item_Presentaciones_Id: item.Item_Presentaciones_Id
                });
            });
        }
    }, [itemsMovimiento]);

    useEffect(() => {
        // Si no hay datos, redirigir de vuelta
        if (!movimientoData || !itemsMovimiento || !tipo) {
            toast.error('No se encontraron datos del movimiento');
            navigate('/bodegas/movimientos/crear');
        }
    }, [movimientoData, itemsMovimiento, tipo, navigate]);

    if (!movimientoData || !itemsMovimiento || !tipo) {
        return null; // Evitar renderizar si no hay datos
    }

    // Configuración según tipo de movimiento
    const getTipoConfig = () => {
        const configs = {
            entrada: {
                titulo: 'Entrada de Inventario',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                icon: FiPackage
            },
            salida: {
                titulo: 'Salida de Inventario', 
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                icon: FiPackage
            },
            transferencia: {
                titulo: 'Transferencia entre Bodegas',
                color: 'text-blue-600', 
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                icon: FiPackage
            },
            ajuste: {
                titulo: 'Ajuste de Inventario',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50', 
                borderColor: 'border-yellow-200',
                icon: FiPackage
            }
        };
        return configs[tipo] || configs.entrada;
    };

    const config = getTipoConfig();
    const IconoTipo = config.icon;

    // Obtener nombres de bodegas
    const getBodegaNombre = (id) => {
        const bodega = bodegas?.find(b => b.Bodega_Id === parseInt(id));
        return bodega?.Bodega_Nombre || 'No especificada';
    };

    // Calcular totales
    const calcularTotales = () => {
        const totalItems = itemsMovimiento.length;
        const cantidadTotal = itemsMovimiento.reduce((sum, item) => sum + parseFloat(item.Cantidad || 0), 0);
        const valorTotal = itemsMovimiento.reduce((sum, item) => {
            const precio = item.Precio_Unitario || 0;
            const cantidad = parseFloat(item.Cantidad || 0);
            return sum + (precio * cantidad);
        }, 0);

        // Calcular estadísticas de presentaciones
        const itemsConPresentacion = itemsMovimiento.filter(item => item.Es_Movimiento_Por_Presentacion);
        const itemsUnidadBase = itemsMovimiento.filter(item => !item.Es_Movimiento_Por_Presentacion);

        return { 
            totalItems, 
            cantidadTotal, 
            valorTotal,
            itemsConPresentacion: itemsConPresentacion.length,
            itemsUnidadBase: itemsUnidadBase.length
        };
    };

    const totales = calcularTotales();

    const handleVolver = () => {
        navigate(-1); // Volver a la página anterior
    };

    const handleImprimir = async () => {
        try {
            console.log('Generando ticket PDF...');
            
            // Preparar datos para el ticket
            const datosTicket = {
                movimiento: movimientoData,
                items: itemsMovimiento,
                tipo: tipo,
                bodegas: bodegas,
                usuario: usuarioLogueado,
                totales: totales
            };

            // Usar el servicio para generar el PDF
            const resultado = await movimientoService.generarTicketPDF(datosTicket);
            
            if (resultado.success) {
                toast.success(resultado.message);
            }
            
        } catch (error) {
            console.error('Error generando ticket:', error);
            toast.error(error.message || 'Error al generar el ticket');
        }
    };

    const handleConfirmar = async () => {
        setConfirmando(true);
        
        try {
            // Preparar items válidos para el envío, incluyendo datos de presentación
            const itemsValidos = itemsMovimiento.map(item => ({
                Item_Id: parseInt(item.Item_Id),
                Cantidad: parseFloat(item.Cantidad),
                // Incluir datos de presentación si existen
                Item_Presentaciones_Id: item.Item_Presentaciones_Id || null,
                Cantidad_Presentacion: item.Cantidad_Presentacion ? parseFloat(item.Cantidad_Presentacion) : null,
                Es_Movimiento_Por_Presentacion: item.Es_Movimiento_Por_Presentacion || false
            }));

            console.log('📄 ResumenMovimiento: Items preparados para envío al backend:', itemsValidos);
            
            // Log específico para items con presentación
            itemsValidos.forEach((item, index) => {
                console.log(`📄 ResumenMovimiento: Item ${index + 1} para envío:`, {
                    Item_Id: item.Item_Id,
                    Cantidad: item.Cantidad,
                    Item_Presentaciones_Id: item.Item_Presentaciones_Id,
                    Cantidad_Presentacion: item.Cantidad_Presentacion,
                    Es_Movimiento_Por_Presentacion: item.Es_Movimiento_Por_Presentacion
                });
            });

            let response;
            
            // Crear movimiento según el tipo
            switch (tipo) {
                case 'entrada':
                    response = await movimientoService.crearEntrada(movimientoData, itemsValidos);
                    break;
                case 'salida':
                    response = await movimientoService.crearSalida(movimientoData, itemsValidos);
                    break;
                case 'transferencia':
                    response = await movimientoService.crearTransferencia(movimientoData, itemsValidos);
                    break;
                case 'ajuste':
                    response = await movimientoService.crearAjuste(movimientoData, itemsValidos);
                    break;
                default:
                    throw new Error('Tipo de movimiento no válido');
            }

            // Éxito: mostrar mensaje y navegar
            toast.success(`${config.titulo} creado exitosamente`);
            navigate('/bodegas/movimientos');
            
        } catch (error) {
            console.error('Error creando movimiento:', error);
            toast.error(error.message || 'Error al crear el movimiento');
        } finally {
            setConfirmando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleVolver}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Resumen del Movimiento</h1>
                                <p className="text-sm text-gray-500">Revisa y confirma los detalles</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleImprimir}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FiPrinter className="h-4 w-4" />
                                <span className="hidden sm:inline">Imprimir</span>
                            </button>
                            
                            <button
                                onClick={handleConfirmar}
                                disabled={confirmando}
                                className={`flex items-center space-x-2 px-6 py-2 text-white rounded-lg transition-colors ${
                                    confirmando 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {confirmando ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCheck className="h-4 w-4" />
                                        <span>Confirmar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Información del Movimiento */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                            {/* Tipo de Movimiento */}
                            <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 ${config.color} bg-white rounded-lg`}>
                                        <IconoTipo className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${config.color}`}>
                                            {config.titulo}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date().toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <FiHash className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Motivo</p>
                                        <p className="text-sm text-gray-600">{movimientoData.Motivo}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <FiUser className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Responsable</p>
                                        <p className="text-sm text-gray-600">{usuarioLogueado || 'Usuario'}</p>
                                    </div>
                                </div>

                                {movimientoData.Recepcionista && (
                                    <div className="flex items-center space-x-3">
                                        <FiUser className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Recepcionista</p>
                                            <p className="text-sm text-gray-600">{movimientoData.Recepcionista}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bodegas */}
                                {movimientoData.Origen_Bodega_Id && (
                                    <div className="flex items-center space-x-3">
                                        <FiMapPin className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Bodega Origen</p>
                                            <p className="text-sm text-gray-600">
                                                {getBodegaNombre(movimientoData.Origen_Bodega_Id)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {movimientoData.Destino_Bodega_Id && (
                                    <div className="flex items-center space-x-3">
                                        <FiMapPin className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Bodega Destino</p>
                                            <p className="text-sm text-gray-600">
                                                {getBodegaNombre(movimientoData.Destino_Bodega_Id)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {movimientoData.Observaciones && (
                                    <div className="flex items-start space-x-3">
                                        <FiFileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Observaciones</p>
                                            <p className="text-sm text-gray-600">{movimientoData.Observaciones}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Resumen de Totales */}
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-3">Resumen</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total de Items:</span>
                                        <span className="font-medium">{totales.totalItems}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Cantidad Total (Base):</span>
                                        <span className="font-medium">{totales.cantidadTotal.toLocaleString()}</span>
                                    </div>
                                    {(totales.itemsConPresentacion > 0 || totales.itemsUnidadBase > 0) && (
                                        <div className="space-y-1 pt-1 border-t border-gray-100">
                                            {totales.itemsConPresentacion > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-purple-600">• Con presentación:</span>
                                                    <span className="text-purple-600">{totales.itemsConPresentacion} items</span>
                                                </div>
                                            )}
                                            {totales.itemsUnidadBase > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">• Unidad base:</span>
                                                    <span className="text-gray-500">{totales.itemsUnidadBase} items</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {totales.valorTotal > 0 && (
                                        <div className="flex justify-between text-sm pt-1 border-t border-gray-100">
                                            <span className="text-gray-600">Valor Total:</span>
                                            <span className="font-medium">
                                                ${totales.valorTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Items del Movimiento ({itemsMovimiento.length})
                                        </h3>
                                        {totales.itemsConPresentacion > 0 && (
                                            <div className="flex items-center space-x-1 mt-1">
                                                <FiBox className="h-3 w-3 text-purple-500" />
                                                <span className="text-xs text-purple-600">
                                                    {totales.itemsConPresentacion} con presentaciones personalizadas
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Producto
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Código
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cantidad
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Unidad/Presentación
                                            </th>
                                            {totales.valorTotal > 0 && (
                                                <>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Precio Unit.
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subtotal
                                                    </th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {itemsMovimiento.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.Item_Descripcion}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {item.Item_Id}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {item.Item_Codigo}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {item.Es_Movimiento_Por_Presentacion && item.Cantidad_Presentacion ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium text-purple-600">
                                                                {parseFloat(item.Cantidad_Presentacion).toLocaleString()} 
                                                                <span className="text-xs ml-1">
                                                                    {parseFloat(item.Cantidad_Presentacion) === 1 ? 'unidad' : 'unidades'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                = {parseFloat(item.Cantidad).toLocaleString()} {item.UnidadMedida_Prefijo}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {parseFloat(item.Cantidad).toLocaleString()}
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                {item.UnidadMedida_Prefijo}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.Es_Movimiento_Por_Presentacion && item.Presentacion_Nombre ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium text-purple-600 flex items-center">
                                                                <FiBox className="h-3 w-3 mr-1" />
                                                                {item.Presentacion_Nombre}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Factor: {item.Factor_Conversion}x → {item.UnidadMedida_Prefijo}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-900">
                                                            <span className="text-gray-600">Unidad Base:</span> {item.UnidadMedida_Prefijo}
                                                        </div>
                                                    )}
                                                </td>
                                                {totales.valorTotal > 0 && (
                                                    <>
                                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                                            ${(item.Precio_Unitario || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                                                            ${((item.Precio_Unitario || 0) * parseFloat(item.Cantidad)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Componente de Ticket para Impresión (oculto por defecto) */}
            {mostrarTicket && (
                <TicketPOS
                    movimientoData={movimientoData}
                    itemsMovimiento={itemsMovimiento}
                    tipo={tipo}
                    bodegas={bodegas}
                    usuarioLogueado={usuarioLogueado}
                    totales={totales}
                    onClose={() => setMostrarTicket(false)}
                />
            )}
        </div>
    );
};

export default ResumenMovimiento;