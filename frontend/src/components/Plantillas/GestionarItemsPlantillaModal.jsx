import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiSearch, FiPlus, FiPackage, FiAlertCircle, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import itemService from '../../services/itemService';
import ItemSelectorPlantilla from './ItemSelectorPlantilla';
import { LoadingSpinner } from '../ui';
import ConfirmModal from '../ConfirmModal';

function GestionarItemsPlantillaModal({ 
    isOpen, 
    onClose, 
    plantilla,
    itemsActuales = [],
    onGuardar 
}) {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [showConfirmSave, setShowConfirmSave] = useState(false);

    // Inicializar items cuando se abre el modal
    useEffect(() => {
        if (isOpen && itemsActuales) {
            // Convertir items actuales al formato esperado
            const itemsFormateados = itemsActuales.map((item, index) => ({
                ...item,
                Cantidad: item.Cantidad || 0,
                Cantidad_Presentacion: item.Cantidad_Presentacion || null,
                Es_Por_Presentacion: item.Es_Por_Presentacion || false,
                Item_Presentaciones_Id: item.Item_Presentaciones_Id || null,
                Orden: item.Orden || index
            }));
            setItems(itemsFormateados);
            setHasChanges(false);
        }
    }, [isOpen, itemsActuales]);

    // Búsqueda de items
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                buscarItems();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const buscarItems = async () => {
        try {
            setIsSearching(true);
            const response = await itemService.searchItems(searchTerm);
            
            // Filtrar items que ya están agregados
            const itemsYaAgregados = items.map(i => i.Item_Id);
            const resultadosFiltrados = (response.data || []).filter(
                item => !itemsYaAgregados.includes(item.Item_Id)
            );
            
            setSearchResults(resultadosFiltrados);
        } catch (error) {
            console.error('Error buscando items:', error);
            toast.error('Error al buscar items');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const agregarItem = (item) => {
        // Verificar que no esté ya agregado
        if (items.find(i => i.Item_Id === item.Item_Id)) {
            toast.error('Este item ya está en la lista');
            return;
        }

        const nuevoItem = {
            Item_Id: item.Item_Id,
            Item_Nombre: item.Item_Nombre,
            Item_Codigo_SKU: item.Item_Codigo_SKU,
            Item_Codigo: item.Item_Codigo,
            Item_Codigo_Barra: item.Item_Codigo_Barra,
            CategoriaItem_Nombre: item.CategoriaItem_Nombre,
            UnidadMedida_Prefijo: item.UnidadMedida_Prefijo,
            UnidadMedida_Nombre: item.UnidadMedida_Nombre,
            Cantidad: 0,
            Cantidad_Presentacion: null,
            Es_Por_Presentacion: false,
            Item_Presentaciones_Id: null,
            Orden: items.length
        };

        setItems([...items, nuevoItem]);
        setSearchTerm('');
        setSearchResults([]);
        setHasChanges(true);
        toast.success('Item agregado');
    };

    const actualizarItem = (itemId, cantidad, datosAdicionales) => {
        setItems(prevItems => 
            prevItems.map(item => 
                item.Item_Id === itemId 
                    ? { 
                        ...item, 
                        Cantidad: cantidad,
                        ...datosAdicionales
                    }
                    : item
            )
        );
        setHasChanges(true);
    };

    const eliminarItem = (itemId) => {
        setItems(prevItems => prevItems.filter(item => item.Item_Id !== itemId));
        setHasChanges(true);
        toast.success('Item eliminado');
    };

    const handleGuardar = async () => {
        try {
            // Validar que haya al menos un item
            if (items.length === 0) {
                toast.error('Debe agregar al menos un item');
                return;
            }

            // Validar que todos los items tengan cantidad
            const itemsSinCantidad = items.filter(item => !item.Cantidad || parseFloat(item.Cantidad) <= 0);
            if (itemsSinCantidad.length > 0) {
                toast.error('Todos los items deben tener una cantidad mayor a 0');
                return;
            }

            // Mostrar modal de confirmación para guardar
            setShowConfirmSave(true);
        } catch (error) {
            console.error('Error validando items:', error);
            toast.error(error.message || 'Error al validar los items');
        }
    };

    const confirmarGuardar = async () => {
        try {
            setShowConfirmSave(false);
            setIsSaving(true);

            // Formatear items para el backend
            const itemsFormateados = items.map((item, index) => ({
                Item_Id: item.Item_Id,
                Cantidad: parseFloat(item.Cantidad),
                Item_Presentaciones_Id: item.Item_Presentaciones_Id || null,
                Cantidad_Presentacion: item.Cantidad_Presentacion ? parseFloat(item.Cantidad_Presentacion) : null,
                Es_Por_Presentacion: item.Es_Por_Presentacion || false,
                Orden: index
            }));

            await onGuardar(itemsFormateados);
            setHasChanges(false);
        } catch (error) {
            console.error('Error guardando items:', error);
            toast.error(error.message || 'Error al guardar los items');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (hasChanges) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    };

    const confirmarCerrar = () => {
        setShowConfirmClose(false);
        onClose();
    };

    return (
        <>
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <FiPackage className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                                Gestionar Items
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-600">
                                                {plantilla?.Plantilla_Nombre}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 max-h-[70vh] overflow-y-auto">
                                    {/* Buscador de items */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Buscar y agregar items
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiSearch className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar por código o nombre..."
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                                                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                            {isSearching && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Resultados de búsqueda */}
                                        {searchResults.length > 0 && (
                                            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {searchResults.map((item) => (
                                                    <button
                                                        key={item.Item_Id}
                                                        onClick={() => agregarItem(item)}
                                                        className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors
                                                                 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">
                                                                {item.Item_Codigo_SKU} - {item.Item_Nombre}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {item.CategoriaItem_Nombre} • {item.UnidadMedida_Nombre}
                                                            </div>
                                                        </div>
                                                        <FiPlus className="w-5 h-5 text-purple-600" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchTerm.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                                            <div className="mt-2 text-center py-4 text-gray-500 text-sm">
                                                No se encontraron items
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista de items agregados */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Items en la plantilla ({items.length})
                                            </h3>
                                            {hasChanges && (
                                                <span className="text-xs text-orange-600 flex items-center gap-1">
                                                    <FiAlertCircle className="w-3 h-3" />
                                                    Cambios sin guardar
                                                </span>
                                            )}
                                        </div>

                                        {items.length > 0 ? (
                                            <div className="space-y-3">
                                                {items.map((item, index) => (
                                                    <ItemSelectorPlantilla
                                                        key={item.Item_Id}
                                                        item={item}
                                                        index={index}
                                                        onUpdate={actualizarItem}
                                                        onRemove={eliminarItem}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay items</h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Busca y agrega items usando el campo de búsqueda
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <button
                                        onClick={handleClose}
                                        disabled={isSaving}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleGuardar}
                                        disabled={isSaving || !hasChanges}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg
                                                 shadow-sm text-white bg-purple-600 hover:bg-purple-700
                                                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="mr-2 h-4 w-4" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>

        {/* Modal de confirmación para guardar */}
        <ConfirmModal
            isOpen={showConfirmSave}
            onClose={() => setShowConfirmSave(false)}
            onConfirm={confirmarGuardar}
            title="Confirmar cambios"
            message="¿Deseas guardar los cambios realizados en los items de la plantilla?"
            type="info"
            confirmText="Guardar"
            cancelText="Cancelar"
        />

        {/* Modal de confirmación para cerrar sin guardar */}
        <ConfirmModal
            isOpen={showConfirmClose}
            onClose={() => setShowConfirmClose(false)}
            onConfirm={confirmarCerrar}
            title="Cerrar sin guardar"
            message="Tienes cambios sin guardar. ¿Estás seguro que deseas cerrar?"
            type="warning"
            confirmText="Cerrar sin guardar"
            cancelText="Cancelar"
        />
    </>
    );
}

export default GestionarItemsPlantillaModal;
