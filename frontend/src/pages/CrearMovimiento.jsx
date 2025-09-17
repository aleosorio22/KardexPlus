import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FiArrowLeft, FiPackage, FiTruck, FiArrowRight, FiEdit3, 
    FiPlus, FiTrash2, FiSend, FiMapPin, FiUser, FiFileText, FiRefreshCw 
} from 'react-icons/fi';
import { bodegaService } from '../services/bodegaService';
import { itemService } from '../services/itemService';
import { movimientoService } from '../services/movimientoService';
import ConfirmModal from '../components/ConfirmModal';

const CrearMovimiento = () => {
    const navigate = useNavigate();
    const { tipo } = useParams(); // entrada, salida, transferencia, ajuste
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);
    const [bodegas, setBodegas] = useState([]);
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    
    // Estados para modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({});
    
    // Datos del movimiento
    const [movimientoData, setMovimientoData] = useState({
        Recepcionista: '',
        Motivo: '',
        Observaciones: '',
        Origen_Bodega_Id: '',
        Destino_Bodega_Id: ''
    });

    // Items del movimiento
    const [itemsMovimiento, setItemsMovimiento] = useState([{
        Item_Id: '',
        Cantidad: ''
    }]);

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

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            setIsLoading(true);
            const [bodegasResponse, itemsResponse] = await Promise.all([
                bodegaService.getAllBodegas(),
                itemService.getAllItems()
            ]);

            const bodegas = bodegasResponse.data || [];
            setBodegas(bodegas);
            
            const rawItems = itemsResponse.data || [];
            const itemsValidos = rawItems.filter(item => 
                item && item.Item_Id && (item.Item_Codigo_SKU || item.Item_Nombre)
            ).map(item => ({
                ...item,
                Item_Codigo: item.Item_Codigo_SKU || item.Item_Id.toString(),
                Item_Descripcion: item.Item_Nombre
            }));
            setItems(itemsValidos);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error cargando datos iniciales');
        } finally {
            setIsLoading(false);
        }
    };

    const agregarItem = () => {
        setItemsMovimiento([...itemsMovimiento, { Item_Id: '', Cantidad: '' }]);
    };

    const eliminarItem = (index) => {
        if (itemsMovimiento.length > 1) {
            setItemsMovimiento(itemsMovimiento.filter((_, i) => i !== index));
        }
    };

    const actualizarItem = (index, campo, valor) => {
        const nuevosItems = [...itemsMovimiento];
        nuevosItems[index][campo] = valor;
        setItemsMovimiento(nuevosItems);
    };

    const validarFormulario = () => {
        // Validar datos del movimiento
        if (!movimientoData.Motivo.trim()) {
            setError('El motivo es requerido');
            return false;
        }

        // Validaciones específicas por tipo
        if (tipo === 'salida' || tipo === 'transferencia') {
            if (!movimientoData.Origen_Bodega_Id) {
                setError('La bodega de origen es requerida');
                return false;
            }
        }

        if (tipo === 'entrada' || tipo === 'transferencia' || tipo === 'ajuste') {
            if (!movimientoData.Destino_Bodega_Id) {
                setError('La bodega de destino es requerida');
                return false;
            }
        }

        if (tipo === 'transferencia' && movimientoData.Origen_Bodega_Id === movimientoData.Destino_Bodega_Id) {
            setError('Las bodegas de origen y destino deben ser diferentes');
            return false;
        }

        // Validar items
        const itemsValidos = itemsMovimiento.filter(item => 
            item.Item_Id && item.Cantidad && parseFloat(item.Cantidad) > 0
        );

        if (itemsValidos.length === 0) {
            setError('Debe agregar al menos un item válido');
            return false;
        }

        return true;
    };

    const mostrarResumenConfirmacion = () => {
        setError('');

        if (!validarFormulario()) {
            return;
        }

        // Preparar datos para el resumen
        const itemsValidos = itemsMovimiento
            .filter(item => item.Item_Id && item.Cantidad && parseFloat(item.Cantidad) > 0);
        
        const totalItems = itemsValidos.length;
        const totalCantidad = itemsValidos.reduce((sum, item) => sum + parseFloat(item.Cantidad), 0);

        const origenBodega = bodegas.find(b => b.Bodega_Id == movimientoData.Origen_Bodega_Id);
        const destinoBodega = bodegas.find(b => b.Bodega_Id == movimientoData.Destino_Bodega_Id);

        const resumenItems = itemsValidos.map(item => {
            const itemData = items.find(i => i.Item_Id == item.Item_Id);
            return {
                codigo: itemData?.Item_Codigo || `ID-${item.Item_Id}`,
                nombre: itemData?.Item_Descripcion || 'Item desconocido',
                cantidad: parseFloat(item.Cantidad),
                unidad: itemData?.UnidadMedida_Prefijo || 'Und'
            };
        });

        setConfirmModalConfig({
            title: `Confirmar ${tipoInfo.titulo}`,
            message: (
                <div className="space-y-4 text-left">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Resumen del Movimiento</h4>
                        
                        {/* Bodegas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {origenBodega && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center mb-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-red-800">Almacén Origen</span>
                                    </div>
                                    <p className="text-sm text-red-700">{origenBodega.Bodega_Nombre}</p>
                                </div>
                            )}
                            
                            {destinoBodega && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-green-800">Almacén Destino</span>
                                    </div>
                                    <p className="text-sm text-green-700">{destinoBodega.Bodega_Nombre}</p>
                                </div>
                            )}
                        </div>

                        {/* Información adicional */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="text-sm font-medium text-gray-600">Quien Entrega</span>
                                <p className="text-sm text-gray-900">{movimientoData.Recepcionista || 'Usuario'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Quien Recibe</span>
                                <p className="text-sm text-gray-900">{movimientoData.Observaciones || 'Usuario'}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Items ({totalItems})</h5>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {resumenItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">{item.codigo}</span>
                                            <p className="text-xs text-gray-600">{item.nombre}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium">{item.cantidad}</span>
                                            <span className="text-xs text-gray-600 ml-1">{item.unidad}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            Total: {totalCantidad.toFixed(2)} unidades
                        </div>
                    </div>
                </div>
            ),
            confirmText: 'Enviar Movimiento',
            cancelText: 'Cancelar',
            type: 'info',
            onConfirm: confirmarMovimiento
        });

        setShowConfirmModal(true);
    };

    const confirmarMovimiento = async () => {
        try {
            setShowConfirmModal(false);
            setSaving(true);

            // Preparar items válidos
            const itemsValidos = itemsMovimiento
                .filter(item => item.Item_Id && item.Cantidad && parseFloat(item.Cantidad) > 0)
                .map(item => ({
                    Item_Id: parseInt(item.Item_Id),
                    Cantidad: parseFloat(item.Cantidad)
                }));

            let response;
            
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

            // Regresar a la página de movimientos con mensaje de éxito
            navigate('/bodegas/movimientos', { 
                state: { 
                    message: `${tipoInfo.titulo} creada exitosamente`,
                    type: 'success'
                }
            });
            
        } catch (error) {
            console.error('Error creando movimiento:', error);
            setError(error.message || 'Error creando el movimiento');
            setSaving(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mostrarResumenConfirmacion();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header de la página */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/bodegas/movimientos')}
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <FiArrowLeft className="h-5 w-5 mr-2" />
                            Regresar
                        </button>
                    </div>
                </div>
                <div className="flex items-center mt-4">
                    <div className={`p-3 rounded-lg ${tipoInfo.bgColor} ${tipoInfo.borderColor} border mr-4`}>
                        <IconoTipo className={`h-6 w-6 ${tipoInfo.color}`} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{tipoInfo.titulo}</h1>
                        <p className="text-gray-600">{tipoInfo.descripcion}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información General */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiFileText className="h-5 w-5 mr-3 text-blue-600" />
                            Movimientos de Inventario
                        </h2>
                        <p className="text-gray-600 mt-1">Registra y controla cualquier cambio que se haga en el inventario.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bodegas */}
                        <div className="space-y-4">
                            {(tipo === 'salida' || tipo === 'transferencia') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Almacén Origen *
                                    </label>
                                    <select
                                        value={movimientoData.Origen_Bodega_Id}
                                        onChange={(e) => setMovimientoData({...movimientoData, Origen_Bodega_Id: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar bodega...</option>
                                        {bodegas.map(bodega => (
                                            <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                                {bodega.Bodega_Nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(tipo === 'entrada' || tipo === 'transferencia' || tipo === 'ajuste') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {tipo === 'ajuste' ? 'Almacén *' : 'Almacén Destino *'}
                                    </label>
                                    <select
                                        value={movimientoData.Destino_Bodega_Id}
                                        onChange={(e) => setMovimientoData({...movimientoData, Destino_Bodega_Id: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar bodega...</option>
                                        {bodegas.map(bodega => (
                                            <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                                {bodega.Bodega_Nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Información del movimiento */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo *
                                </label>
                                <select
                                    value={movimientoData.Motivo}
                                    onChange={(e) => setMovimientoData({...movimientoData, Motivo: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccionar motivo...</option>
                                    {tipo === 'entrada' && (
                                        <>
                                            <option value="Compra">Compra</option>
                                            <option value="Devolución">Devolución</option>
                                            <option value="Producción">Producción</option>
                                            <option value="Donación">Donación</option>
                                            <option value="Otro">Otro</option>
                                        </>
                                    )}
                                    {tipo === 'salida' && (
                                        <>
                                            <option value="Venta">Venta</option>
                                            <option value="Uso interno">Uso interno</option>
                                            <option value="Pérdida/Daño">Pérdida/Daño</option>
                                            <option value="Donación">Donación</option>
                                            <option value="Otro">Otro</option>
                                        </>
                                    )}
                                    {tipo === 'transferencia' && (
                                        <>
                                            <option value="Reabastecimiento">Reabastecimiento</option>
                                            <option value="Reorganización">Reorganización</option>
                                            <option value="Distribución">Distribución</option>
                                            <option value="Otro">Otro</option>
                                        </>
                                    )}
                                    {tipo === 'ajuste' && (
                                        <>
                                            <option value="Inventario físico">Inventario físico</option>
                                            <option value="Corrección">Corrección</option>
                                            <option value="Merma">Merma</option>
                                            <option value="Otro">Otro</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quien Entrega
                                    </label>
                                    <input
                                        type="text"
                                        value={movimientoData.Recepcionista}
                                        onChange={(e) => setMovimientoData({...movimientoData, Recepcionista: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Usuario"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quien Recibe
                                    </label>
                                    <input
                                        type="text"
                                        value={movimientoData.Observaciones}
                                        onChange={(e) => setMovimientoData({...movimientoData, Observaciones: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Usuario"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Movimientos - Tabla de Items */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Movimientos</h2>
                    </div>
                    
                    {/* Búsqueda */}
                    <div className="mb-6">
                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white">
                            <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Buscar"
                                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Tabla de items */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 px-4 py-2">
                            <div className="col-span-6">Items</div>
                            <div className="col-span-2">Stock Actual</div>
                            <div className="col-span-2">Cantidad a mover</div>
                            <div className="col-span-2">Stock</div>
                        </div>

                        {itemsMovimiento.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-6">
                                        <select
                                            value={item.Item_Id}
                                            onChange={(e) => actualizarItem(index, 'Item_Id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar item...</option>
                                            {items.map(itemOption => (
                                                <option key={itemOption.Item_Id} value={itemOption.Item_Id}>
                                                    {itemOption.Item_Codigo} - {itemOption.Item_Descripcion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-gray-900 font-medium">
                                            {item.Item_Id ? '150' : '-'}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.Cantidad}
                                            onChange={(e) => actualizarItem(index, 'Cantidad', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-gray-900 font-medium">
                                            {item.Cantidad && item.Item_Id ? (150 - (parseFloat(item.Cantidad) || 0)) : '-'}
                                        </span>
                                    </div>
                                </div>
                                {itemsMovimiento.length > 1 && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => eliminarItem(index)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={agregarItem}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                        >
                            <FiPlus className="h-5 w-5 mr-2" />
                            Agregar Item
                        </button>
                    </div>
                </div>

                {/* Botón de envío */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/bodegas/movimientos')}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enviando Movimiento...
                                </>
                            ) : (
                                <>
                                    <FiSend className="h-4 w-4 mr-2" />
                                    Enviar Movimiento
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Modal de confirmación */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmModalConfig.onConfirm}
                title={confirmModalConfig.title}
                message={confirmModalConfig.message}
                confirmText={confirmModalConfig.confirmText}
                cancelText={confirmModalConfig.cancelText}
                type={confirmModalConfig.type}
            />
        </div>
    );
};

export default CrearMovimiento;