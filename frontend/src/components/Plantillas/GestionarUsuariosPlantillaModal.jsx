import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiSearch, FiPlus, FiUsers, FiAlertCircle, FiSave, FiCheck, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import userService from '../../services/userService';
import ConfirmModal from '../ConfirmModal';

function GestionarUsuariosPlantillaModal({ 
    isOpen, 
    onClose, 
    plantilla,
    usuariosActuales = [],
    onGuardar 
}) {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [todosLosUsuarios, setTodosLosUsuarios] = useState([]);
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [showConfirmSave, setShowConfirmSave] = useState(false);

    // Inicializar usuarios cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            cargarTodosLosUsuarios();
            if (usuariosActuales) {
                const usuariosFormateados = usuariosActuales.map(usuario => ({
                    Usuario_Id: usuario.Usuario_Id,
                    Usuario_Nombre: usuario.Usuario_Nombre,
                    Usuario_Apellido: usuario.Usuario_Apellido,
                    Usuario_Correo: usuario.Usuario_Correo,
                    Rol_Nombre: usuario.Rol_Nombre,
                    Puede_Modificar: usuario.Puede_Modificar || false
                }));
                setUsuarios(usuariosFormateados);
                setHasChanges(false);
            }
        }
    }, [isOpen, usuariosActuales]);

    // Búsqueda de usuarios
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                buscarUsuarios();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, usuarios, todosLosUsuarios]);

    const cargarTodosLosUsuarios = async () => {
        try {
            const response = await userService.getAllUsers({ status: 'activo' });
            setTodosLosUsuarios(response.data || []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            toast.error('Error al cargar usuarios');
        }
    };

    const buscarUsuarios = () => {
        try {
            setIsSearching(true);
            
            // Filtrar usuarios que ya están asignados
            const usuariosYaAsignados = usuarios.map(u => u.Usuario_Id);
            const searchLower = searchTerm.toLowerCase();
            
            const resultadosFiltrados = todosLosUsuarios.filter(usuario => {
                const nombreCompleto = `${usuario.Usuario_Nombre} ${usuario.Usuario_Apellido}`.toLowerCase();
                const correo = (usuario.Usuario_Correo || '').toLowerCase();
                const rol = (usuario.Rol_Nombre || '').toLowerCase();
                
                const matchSearch = nombreCompleto.includes(searchLower) || 
                                   correo.includes(searchLower) ||
                                   rol.includes(searchLower);
                
                return matchSearch && !usuariosYaAsignados.includes(usuario.Usuario_Id);
            });
            
            setSearchResults(resultadosFiltrados.slice(0, 10));
        } catch (error) {
            console.error('Error buscando usuarios:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const agregarUsuario = (usuario) => {
        // Verificar que no esté ya agregado
        if (usuarios.find(u => u.Usuario_Id === usuario.Usuario_Id)) {
            toast.error('Este usuario ya está asignado');
            return;
        }

        const nuevoUsuario = {
            Usuario_Id: usuario.Usuario_Id,
            Usuario_Nombre: usuario.Usuario_Nombre,
            Usuario_Apellido: usuario.Usuario_Apellido,
            Usuario_Correo: usuario.Usuario_Correo,
            Rol_Nombre: usuario.Rol_Nombre,
            Puede_Modificar: false
        };

        setUsuarios([...usuarios, nuevoUsuario]);
        setSearchTerm('');
        setSearchResults([]);
        setHasChanges(true);
        toast.success('Usuario agregado');
    };

    const eliminarUsuario = (usuarioId) => {
        setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.Usuario_Id !== usuarioId));
        setHasChanges(true);
        toast.success('Usuario eliminado');
    };

    const togglePuedeModificar = (usuarioId) => {
        setUsuarios(prevUsuarios => 
            prevUsuarios.map(u => 
                u.Usuario_Id === usuarioId 
                    ? { ...u, Puede_Modificar: !u.Puede_Modificar }
                    : u
            )
        );
        setHasChanges(true);
    };

    const handleGuardar = async () => {
        // Mostrar modal de confirmación
        setShowConfirmSave(true);
    };

    const confirmarGuardar = async () => {
        try {
            setShowConfirmSave(false);
            setIsSaving(true);

            // Formatear usuarios para el backend
            const usuariosParaAsignar = usuarios.map(usuario => ({
                Usuario_Id: usuario.Usuario_Id,
                Puede_Modificar: usuario.Puede_Modificar
            }));

            await onGuardar(usuariosParaAsignar);
            setHasChanges(false);
        } catch (error) {
            console.error('Error guardando usuarios:', error);
            toast.error(error.message || 'Error al guardar los usuarios');
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <FiUsers className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                                Gestionar Usuarios
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
                                    {/* Buscador de usuarios */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Buscar y agregar usuarios
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiSearch className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar por nombre, correo o rol..."
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
                                                {searchResults.map((usuario) => (
                                                    <button
                                                        key={usuario.Usuario_Id}
                                                        onClick={() => agregarUsuario(usuario)}
                                                        className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors
                                                                 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">
                                                                {usuario.Usuario_Nombre} {usuario.Usuario_Apellido}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {usuario.Usuario_Correo}
                                                                {usuario.Rol_Nombre && ` • ${usuario.Rol_Nombre}`}
                                                            </div>
                                                        </div>
                                                        <FiPlus className="w-5 h-5 text-purple-600" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchTerm.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                                            <div className="mt-2 text-center py-4 text-gray-500 text-sm">
                                                No se encontraron usuarios
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista de usuarios asignados */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Usuarios asignados ({usuarios.length})
                                            </h3>
                                            {hasChanges && (
                                                <span className="text-xs text-orange-600 flex items-center gap-1">
                                                    <FiAlertCircle className="w-3 h-3" />
                                                    Cambios sin guardar
                                                </span>
                                            )}
                                        </div>

                                        {usuarios.length > 0 ? (
                                            <div className="space-y-2">
                                                {usuarios.map((usuario) => (
                                                    <div
                                                        key={usuario.Usuario_Id}
                                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-medium text-gray-900">
                                                                        {usuario.Usuario_Nombre} {usuario.Usuario_Apellido}
                                                                    </h4>
                                                                    {usuario.Puede_Modificar && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                            <FiEdit2 className="w-3 h-3 mr-1" />
                                                                            Puede editar
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600">{usuario.Usuario_Correo}</p>
                                                                {usuario.Rol_Nombre && (
                                                                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                                                                        {usuario.Rol_Nombre}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => togglePuedeModificar(usuario.Usuario_Id)}
                                                                    className={`p-2 rounded-lg transition-colors ${
                                                                        usuario.Puede_Modificar
                                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                                    }`}
                                                                    title={usuario.Puede_Modificar ? 'Quitar permisos de edición' : 'Dar permisos de edición'}
                                                                >
                                                                    {usuario.Puede_Modificar ? (
                                                                        <FiCheck className="w-4 h-4" />
                                                                    ) : (
                                                                        <FiEdit2 className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => eliminarUsuario(usuario.Usuario_Id)}
                                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                                    title="Eliminar usuario"
                                                                >
                                                                    <FiX className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios asignados</h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Busca y agrega usuarios usando el campo de búsqueda
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nota informativa */}
                                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Permisos de edición:</p>
                                                <p className="text-blue-700">
                                                    Los usuarios con permisos de edición podrán modificar los items de esta plantilla.
                                                    Los usuarios sin este permiso solo podrán usar la plantilla para crear requerimientos o movimientos.
                                                </p>
                                            </div>
                                        </div>
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
            message="¿Deseas guardar los cambios realizados en los usuarios de la plantilla?"
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

export default GestionarUsuariosPlantillaModal;
