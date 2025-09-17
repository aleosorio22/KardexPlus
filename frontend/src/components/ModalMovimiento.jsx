import React, { useState, useEffect } from 'react';
import { 
    FiX, FiPlus, FiMinus, FiPackage, FiTruck, 
    FiAlertCircle, FiArrowRight, FiSave,
    FiSearch, FiEdit3
} from 'react-icons/fi';
import { movimientoService } from '../services/movimientoService';

const ModalMovimiento = ({ tipo, isOpen, onClose, onSubmit, bodegas, items }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchItem, setSearchItem] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    const [formData, setFormData] = useState({
        tipo_movimiento: tipo,
        motivo: '',
        observaciones: '',
        recepcionista: '',
        origen_bodega_id: '',
        destino_bodega_id: '',
        detalles: []
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                tipo_movimiento: tipo,
                motivo: '',
                observaciones: '',
                recepcionista: '',
                origen_bodega_id: '',
                destino_bodega_id: '',
                detalles: []
            });
            setError('');
            setSearchItem('');
            setFilteredItems([]);
        }
    }, [isOpen, tipo]);

    useEffect(() => {
        if (searchItem && Array.isArray(items)) {
            try {
                const filtered = items.filter(item => {
                    if (!item) return false;
                    
                    const codigo = item.Item_Codigo || item.Item_Codigo_SKU || '';
                    const descripcion = item.Item_Descripcion || item.Item_Nombre || '';
                    const searchTerm = searchItem.toLowerCase();
                    
                    return codigo.toLowerCase().includes(searchTerm) ||
                           descripcion.toLowerCase().includes(searchTerm);
                });
                setFilteredItems(filtered.slice(0, 10));
            } catch (error) {
                console.error('Error filtrando items:', error);
                setFilteredItems([]);
            }
        } else {
            setFilteredItems([]);
        }
    }, [searchItem, items]);

    const getTipoConfig = () => {
        const configs = {
            entrada: {
                titulo: 'Nueva Entrada',
                descripcion: 'Registrar ingreso de mercancía',
                icono: FiPackage,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                motivos: [
                    'Compra',
                    'Devolución de cliente',
                    'Producción',
                    'Ajuste por inventario',
                    'Otro'
                ]
            },
            salida: {
                titulo: 'Nueva Salida',
                descripcion: 'Registrar salida de mercancía',
                icono: FiTruck,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                motivos: [
                    'Venta',
                    'Devolución a proveedor',
                    'Producción',
                    'Pérdida/Daño',
                    'Ajuste por inventario',
                    'Otro'
                ]
            },
            transferencia: {
                titulo: 'Nueva Transferencia',
                descripcion: 'Mover mercancía entre bodegas',
                icono: FiArrowRight,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                motivos: [
                    'Reabastecimiento',
                    'Reorganización',
                    'Demanda específica',
                    'Otro'
                ]
            },
            ajuste: {
                titulo: 'Nuevo Ajuste',
                descripcion: 'Corregir diferencias de inventario',
                icono: FiEdit3,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                motivos: [
                    'Diferencia en inventario físico',
                    'Error de registro',
                    'Mercancía dañada',
                    'Vencimiento',
                    'Otro'
                ]
            }
        };
        return configs[tipo] || configs.entrada;
    };

    const config = getTipoConfig();
    const IconoTipo = config.icono;

    const validarFormulario = () => {
        if (!formData.motivo.trim()) {
            setError('El motivo es obligatorio');
            return false;
        }

        if (tipo === 'transferencia') {
            if (!formData.origen_bodega_id || !formData.destino_bodega_id) {
                setError('Debe seleccionar bodega de origen y destino');
                return false;
            }
            if (formData.origen_bodega_id === formData.destino_bodega_id) {
                setError('La bodega de origen debe ser diferente a la de destino');
                return false;
            }
        } else {
            if (tipo === 'salida') {
                if (!formData.origen_bodega_id) {
                    setError('Debe seleccionar una bodega de origen');
                    return false;
                }
            } else {
                if (!formData.destino_bodega_id) {
                    setError('Debe seleccionar una bodega de destino');
                    return false;
                }
            }
        }

        if (formData.detalles.length === 0) {
            setError('Debe agregar al menos un item');
            return false;
        }

        for (let detalle of formData.detalles) {
            if (!detalle.cantidad || detalle.cantidad <= 0) {
                setError('Todas las cantidades deben ser mayores a 0');
                return false;
            }
        }

        return true;
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            setError(error.message || 'Error al crear el movimiento');
        } finally {
            setLoading(false);
        }
    };

    const agregarItem = (item) => {
        if (!item || !item.Item_Id) {
            setError('Item inválido');
            return;
        }

        const yaExiste = formData.detalles.find(d => d.item_id === item.Item_Id);
        if (yaExiste) {
            setError('Este item ya fue agregado');
            return;
        }

        const nuevoDetalle = {
            item_id: item.Item_Id,
            item_codigo: item.Item_Codigo || item.Item_Codigo_SKU || '',
            item_descripcion: item.Item_Descripcion || item.Item_Nombre || '',
            cantidad: 1
        };

        setFormData(prev => ({
            ...prev,
            detalles: [...prev.detalles, nuevoDetalle]
        }));
        setSearchItem('');
        setFilteredItems([]);
    };

    const actualizarDetalle = (index, campo, valor) => {
        const nuevosDetalles = [...formData.detalles];
        nuevosDetalles[index][campo] = valor;
        setFormData(prev => ({ ...prev, detalles: nuevosDetalles }));
    };

    const eliminarDetalle = (index) => {
        const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, detalles: nuevosDetalles }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className={`${config.bgColor} px-6 py-4 border-b border-gray-200`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <IconoTipo className={`h-6 w-6 ${config.color} mr-3`} />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{config.titulo}</h3>
                                <p className="text-sm text-gray-600">{config.descripcion}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={manejarSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex items-center">
                                    <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                    <span className="text-sm text-red-700">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Información General */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Motivo *
                                </label>
                                <select
                                    value={formData.motivo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccionar motivo</option>
                                    {config.motivos.map((motivo) => (
                                        <option key={motivo} value={motivo}>{motivo}</option>
                                    ))}
                                </select>
                            </div>

                            {tipo !== 'transferencia' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bodega {tipo === 'entrada' || tipo === 'ajuste' ? 'de destino' : 'de origen'} *
                                    </label>
                                    <select
                                        value={tipo === 'salida' ? formData.origen_bodega_id : formData.destino_bodega_id}
                                        onChange={(e) => {
                                            if (tipo === 'salida') {
                                                setFormData(prev => ({ ...prev, origen_bodega_id: e.target.value }));
                                            } else {
                                                setFormData(prev => ({ ...prev, destino_bodega_id: e.target.value }));
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar bodega</option>
                                        {bodegas.map((bodega) => (
                                            <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                                {bodega.Bodega_Nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {tipo === 'transferencia' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bodega de origen *
                                        </label>
                                        <select
                                            value={formData.origen_bodega_id}
                                            onChange={(e) => setFormData(prev => ({ ...prev, origen_bodega_id: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Seleccionar bodega origen</option>
                                            {bodegas.map((bodega) => (
                                                <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                                    {bodega.Bodega_Nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bodega de destino *
                                        </label>
                                        <select
                                            value={formData.destino_bodega_id}
                                            onChange={(e) => setFormData(prev => ({ ...prev, destino_bodega_id: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Seleccionar bodega destino</option>
                                            {bodegas.map((bodega) => (
                                                <option key={bodega.Bodega_Id} value={bodega.Bodega_Id}>
                                                    {bodega.Bodega_Nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recepcionista
                                </label>
                                <input
                                    type="text"
                                    value={formData.recepcionista}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recepcionista: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nombre del recepcionista"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observaciones
                                </label>
                                <input
                                    type="text"
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Observaciones adicionales"
                                />
                            </div>
                        </div>

                        {/* Búsqueda de Items */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Agregar Items *
                            </label>
                            <div className="relative">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar items por código o descripción..."
                                        value={searchItem}
                                        onChange={(e) => setSearchItem(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {filteredItems.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {filteredItems.map((item) => (
                                            <button
                                                key={item.Item_Id}
                                                type="button"
                                                onClick={() => agregarItem(item)}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="font-medium text-gray-900">{item.Item_Codigo || item.Item_Codigo_SKU || 'Sin código'}</div>
                                                <div className="text-sm text-gray-600 truncate">{item.Item_Descripcion || item.Item_Nombre || 'Sin descripción'}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lista de Items Seleccionados */}
                        {formData.detalles.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    Items Seleccionados ({formData.detalles.length})
                                </h4>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {formData.detalles.map((detalle, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{detalle.item_codigo}</div>
                                                    <div className="text-sm text-gray-600 mb-2">{detalle.item_descripcion}</div>
                                                    
                                                    <div className="w-40">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Cantidad *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={detalle.cantidad}
                                                            onChange={(e) => actualizarDetalle(index, 'cantidad', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarDetalle(index)}
                                                    className="ml-4 text-red-400 hover:text-red-600"
                                                >
                                                    <FiMinus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creando...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <FiSave className="h-4 w-4 mr-2" />
                                        Crear {config.titulo.split(' ')[1]}
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalMovimiento;