import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FiPackage, FiTruck, FiEdit3, FiRefreshCw 
} from 'react-icons/fi';
import { bodegaService } from '../services/bodegaService';
import { movimientoService } from '../services/movimientoService';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { 
    TablaItems, 
    HeaderMovimiento, 
    FormularioMovimiento, 
    AccionesMovimiento 
} from '../components/MovimientoCreacion';
import toast from 'react-hot-toast';

const CrearMovimiento = () => {
    const navigate = useNavigate();
    const { tipo } = useParams(); // entrada, salida, transferencia, ajuste
    const { user } = useAuth(); // Obtener usuario logueado
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);
    const [bodegas, setBodegas] = useState([]);
    
    // Estados para modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({});
    
    // Obtener nombre completo del usuario logueado
    const usuarioLogueado = user?.Usuario_Nombre ? 
        `${user.Usuario_Nombre} ${user.Usuario_Apellido || ''}`.trim() : 
        'Usuario';
    
    // Datos del movimiento - Usuario_Id se maneja automáticamente en el backend
    const [movimientoData, setMovimientoData] = useState({
        Recepcionista: '', // Campo modificable para quien recibe/entrega
        Motivo: '',
        Observaciones: '', // Campo para observaciones generales
        Origen_Bodega_Id: '',
        Destino_Bodega_Id: ''
    });

    // Items del movimiento
    const [itemsMovimiento, setItemsMovimiento] = useState([]);

    // Información del tipo de movimiento - usado para el modal de confirmación
    const getTipoInfo = (tipo) => {
        const tipos = {
            'entrada': { titulo: 'Nueva Entrada' },
            'salida': { titulo: 'Nueva Salida' },
            'transferencia': { titulo: 'Nueva Transferencia' },
            'ajuste': { titulo: 'Nuevo Ajuste' }
        };
        return tipos[tipo] || tipos['entrada'];
    };

    const tipoInfo = getTipoInfo(tipo);

    // Función para obtener la configuración de campos según el tipo de movimiento
    const getCamposSegunTipo = (tipo) => {
        switch (tipo) {
            case 'entrada':
                return {
                    mostrarRecepcionista: true,
                    etiquetaRecepcionista: 'Proveedor/Origen',
                    placeholderRecepcionista: 'Nombre del proveedor o quien entrega',
                    soloLecturaRecepcionista: false,
                    mostrarObservaciones: true,
                    etiquetaObservaciones: 'Observaciones Adicionales',
                    placeholderObservaciones: 'Observaciones del ingreso...'
                };
            case 'salida':
                return {
                    mostrarRecepcionista: true,
                    etiquetaRecepcionista: 'Cliente/Destino',
                    placeholderRecepcionista: 'Nombre del cliente o quien recibe',
                    soloLecturaRecepcionista: false,
                    mostrarObservaciones: true,
                    etiquetaObservaciones: 'Observaciones Adicionales',
                    placeholderObservaciones: 'Observaciones de la salida...'
                };
            case 'transferencia':
                return {
                    mostrarRecepcionista: true,
                    etiquetaRecepcionista: 'Responsable de Recepción',
                    placeholderRecepcionista: 'Quien recibe en bodega destino',
                    soloLecturaRecepcionista: false,
                    mostrarObservaciones: true,
                    etiquetaObservaciones: 'Observaciones de Transferencia',
                    placeholderObservaciones: 'Observaciones de la transferencia...'
                };
            case 'ajuste':
                return {
                    mostrarRecepcionista: true,
                    etiquetaRecepcionista: 'Responsable del Ajuste',
                    placeholderRecepcionista: usuarioLogueado,
                    soloLecturaRecepcionista: true,
                    mostrarObservaciones: true,
                    etiquetaObservaciones: 'Motivo del Ajuste',
                    placeholderObservaciones: 'Explique el motivo del ajuste de inventario...'
                };
            default:
                return {
                    mostrarRecepcionista: true,
                    etiquetaRecepcionista: 'Recepcionista',
                    placeholderRecepcionista: 'Nombre del responsable',
                    soloLecturaRecepcionista: false,
                    mostrarObservaciones: true,
                    etiquetaObservaciones: 'Observaciones',
                    placeholderObservaciones: 'Observaciones adicionales...'
                };
        }
    };

    const camposConfig = getCamposSegunTipo(tipo);

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Actualizar campos cuando cambie el usuario o tipo
    useEffect(() => {
        if (user && tipo) {
            const nombreCompleto = user.Usuario_Nombre ? 
                `${user.Usuario_Nombre} ${user.Usuario_Apellido || ''}`.trim() : 
                'Usuario';
            
            // Actualizar campos según el tipo de movimiento
            setMovimientoData(prev => {
                const nuevoData = { ...prev };
                
                // Solo para ajustes: el usuario logueado es el responsable
                if (tipo === 'ajuste') {
                    nuevoData.Recepcionista = nombreCompleto;
                } else {
                    // Para otros tipos, limpiar el campo para que se pueda llenar manualmente
                    nuevoData.Recepcionista = '';
                }
                
                // Limpiar observaciones al cambiar tipo
                nuevoData.Observaciones = '';
                
                return nuevoData;
            });
        }
    }, [user, tipo]);

    // Actualizar stock de items cuando cambian las bodegas
    useEffect(() => {
        if (itemsMovimiento.length > 0) {
            // Forzar actualización de stock en todos los items
            const itemsActualizados = itemsMovimiento.map(item => ({
                ...item,
                needsStockUpdate: true // Flag para forzar actualización
            }));
            setItemsMovimiento(itemsActualizados);
        }
    }, [movimientoData.Origen_Bodega_Id, movimientoData.Destino_Bodega_Id, tipo]);

    const cargarDatosIniciales = async () => {
        try {
            setIsLoading(true);
            const bodegasResponse = await bodegaService.getAllBodegas();
            const bodegas = bodegasResponse.data || [];
            setBodegas(bodegas);
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error cargando datos iniciales');
        } finally {
            setIsLoading(false);
        }
    };

    // Funciones para manejar items con los nuevos componentes
    const handleItemAdd = (producto) => {
        const nuevoItem = {
            Item_Id: producto.Item_Id,
            Item_Codigo: producto.Item_Codigo,
            Item_Descripcion: producto.Item_Descripcion,
            Stock_Actual: producto.Stock_Actual,
            UnidadMedida_Prefijo: producto.UnidadMedida_Prefijo || 'Und',
            Cantidad: producto.Cantidad || ''
        };
        
        // Agregar al inicio de la lista (LIFO - Last In, First Out)
        setItemsMovimiento([nuevoItem, ...itemsMovimiento]);
    };

    const handleItemUpdate = (itemId, cantidad, stockActual) => {
        const nuevosItems = itemsMovimiento.map(item => {
            if (item.Item_Id === itemId) {
                return {
                    ...item,
                    Cantidad: cantidad,
                    Stock_Actual: stockActual
                };
            }
            return item;
        });
        setItemsMovimiento(nuevosItems);
    };

    const handleItemRemove = (itemId) => {
        const nuevosItems = itemsMovimiento.filter(item => item.Item_Id !== itemId);
        setItemsMovimiento(nuevosItems);
    };

    const validarFormulario = () => {
        console.log('Validando formulario con datos:', {
            movimientoData,
            itemsMovimiento,
            tipo
        });
        
        // Validar datos del movimiento
        if (!movimientoData.Motivo.trim()) {
            toast.error('El motivo es requerido');
            return false;
        }

        // Validaciones específicas por tipo
        if (tipo === 'salida' || tipo === 'transferencia') {
            if (!movimientoData.Origen_Bodega_Id) {
                toast.error('La bodega de origen es requerida');
                return false;
            }
        }

        if (tipo === 'entrada' || tipo === 'transferencia' || tipo === 'ajuste') {
            if (!movimientoData.Destino_Bodega_Id) {
                toast.error('La bodega de destino es requerida');
                return false;
            }
        }

        if (tipo === 'transferencia' && movimientoData.Origen_Bodega_Id === movimientoData.Destino_Bodega_Id) {
            toast.error('Las bodegas de origen y destino deben ser diferentes');
            return false;
        }

        // Validar items
        const itemsValidos = itemsMovimiento.filter(item => 
            item.Item_Id && item.Cantidad && parseFloat(item.Cantidad) > 0
        );

        if (itemsValidos.length === 0) {
            toast.error('Debe agregar al menos un item válido');
            return false;
        }

        return true;
    };

    const mostrarResumenConfirmacion = () => {
        if (!validarFormulario()) {
            return;
        }

        // Preparar datos para el resumen
        const itemsValidos = itemsMovimiento
            .filter(item => item.Item_Id && item.Cantidad && parseFloat(item.Cantidad) > 0);

        // Navegar a la página de resumen con los datos
        navigate('/bodegas/movimientos/resumen', {
            state: {
                movimientoData,
                itemsMovimiento: itemsValidos,
                tipo,
                bodegas,
                usuarioLogueado
            }
        });
    };


    // Nota: La función confirmarMovimiento se movió a ResumenMovimiento.jsx
    // Esta función ya no es necesaria aquí

    // Nota: La lógica de confirmación se movió a ResumenMovimiento.jsx

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
        <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
            {/* Header del movimiento */}
            <HeaderMovimiento 
                tipo={tipo}
            />

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Formulario de información general */}
                <FormularioMovimiento
                    tipo={tipo}
                    movimientoData={movimientoData}
                    setMovimientoData={setMovimientoData}
                    bodegas={bodegas}
                    camposConfig={camposConfig}
                />

                {/* Tabla de Items */}
                <TablaItems
                    items={itemsMovimiento}
                    onItemAdd={handleItemAdd}
                    onItemUpdate={handleItemUpdate}
                    onItemRemove={handleItemRemove}
                    tipoMovimiento={tipo}
                    bodegaOrigenId={movimientoData.Origen_Bodega_Id}
                    bodegaDestinoId={movimientoData.Destino_Bodega_Id}
                    loading={isLoading}
                />

                {/* Acciones del formulario */}
                <AccionesMovimiento
                    onCancel={() => navigate('/bodegas/movimientos')}
                    onSubmit={handleSubmit}
                    isSaving={isSaving}
                    tipoMovimiento={tipo}
                />
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