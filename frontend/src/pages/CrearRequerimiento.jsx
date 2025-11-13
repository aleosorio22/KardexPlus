import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { bodegaService } from '../services/bodegaService';
import { requerimientoService } from '../services/requerimientoService';
import plantillaService from '../services/plantillaService';

// Componentes específicos para requerimientos
import HeaderRequerimiento from '../components/Requerimientos/HeaderRequerimiento';
import FormularioRequerimiento from '../components/Requerimientos/FormularioRequerimiento';
import TablaItemsRequerimiento from '../components/Requerimientos/TablaItemsRequerimiento';
import AccionesRequerimiento from '../components/Requerimientos/AccionesRequerimiento';

// Modal de confirmación
import ConfirmModal from '../components/ConfirmModal';

const CrearRequerimiento = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);
    const [bodegas, setBodegas] = useState([]);
    const [plantillaInfo, setPlantillaInfo] = useState(null);
    
    // Estados para modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({});
    
    // Obtener nombre completo del usuario logueado
    const usuarioLogueado = user?.Usuario_Nombre ? 
        `${user.Usuario_Nombre} ${user.Usuario_Apellido || ''}`.trim() : 
        'Usuario';
    
    // Datos del requerimiento
    const [requerimientoData, setRequerimientoData] = useState({
        Observaciones: '',
        Origen_Bodega_Id: '',
        Destino_Bodega_Id: ''
    });

    // Items del requerimiento
    const [itemsRequerimiento, setItemsRequerimiento] = useState([]);

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            setIsLoading(true);
            
            // Cargar bodegas
            const bodegasResponse = await bodegaService.getAllBodegas();
            const bodegas = bodegasResponse.data || [];
            setBodegas(bodegas);

            // Verificar si viene desde una plantilla
            const { plantillaId, plantillaNombre, fromPlantilla } = location.state || {};
            
            if (fromPlantilla && plantillaId) {
                console.log('🎯 Cargando plantilla:', plantillaId);
                toast.loading('Cargando plantilla...', { id: 'loading-plantilla' });
                
                try {
                    const plantillaResponse = await plantillaService.getPlantillaById(plantillaId);
                    
                    if (plantillaResponse.success && plantillaResponse.data) {
                        const plantilla = plantillaResponse.data;
                        console.log('✅ Plantilla cargada:', plantilla);
                        
                        setPlantillaInfo({
                            id: plantilla.Plantilla_Id,
                            nombre: plantilla.Plantilla_Nombre
                        });

                        // Precargar datos de bodegas desde la plantilla
                        setRequerimientoData(prev => ({
                            ...prev,
                            Origen_Bodega_Id: plantilla.Origen_Bodega_Id || '',
                            Destino_Bodega_Id: plantilla.Destino_Bodega_Id || '',
                            Observaciones: `Creado desde plantilla: ${plantilla.Plantilla_Nombre}`
                        }));

                        // Precargar items desde la plantilla
                        if (plantilla.detalle && plantilla.detalle.length > 0) {
                            console.log('🔍 DETALLE COMPLETO DE LA PLANTILLA:', JSON.stringify(plantilla.detalle, null, 2));
                            
                            const itemsPlantilla = plantilla.detalle.map(item => {
                                // CORRECCIÓN: Es_Por_Presentacion viene como número (0 o 1) desde MySQL
                                const esPorPresentacion = !!(
                                    item.Es_Por_Presentacion === 1 || 
                                    item.Es_Por_Presentacion === true ||
                                    (item.Item_Presentaciones_Id && item.Cantidad_Presentacion)
                                );
                                
                                console.log(`📦 Procesando item de plantilla:`, {
                                    Item_Id: item.Item_Id,
                                    Item_Nombre: item.Item_Nombre,
                                    Es_Por_Presentacion_Backend: item.Es_Por_Presentacion,
                                    Es_Por_Presentacion_Tipo: typeof item.Es_Por_Presentacion,
                                    Item_Presentaciones_Id: item.Item_Presentaciones_Id,
                                    Cantidad_Presentacion: item.Cantidad_Presentacion,
                                    Cantidad_Base: item.Cantidad,
                                    Presentacion_Nombre: item.Presentacion_Nombre,
                                    Presentacion_Unidad_Prefijo: item.Presentacion_Unidad_Prefijo,
                                    Factor_Conversion: item.Factor_Conversion,
                                    UnidadMedida_Prefijo: item.UnidadMedida_Prefijo,
                                    esPorPresentacion_Calculado: esPorPresentacion
                                });
                                
                                const itemMapeado = {
                                    Item_Id: item.Item_Id,
                                    Item_Codigo_SKU: item.Item_Codigo || item.Item_Codigo_SKU,
                                    Item_Nombre: item.Item_Nombre,
                                    UnidadMedida_Prefijo: item.UnidadMedida_Prefijo || 'Und',
                                    // CORRECCIÓN: Si es por presentación, NO usar Cantidad_Solicitada base
                                    // La Cantidad_Solicitada se calculará automáticamente desde Cantidad_Solicitada_Presentacion
                                    Cantidad_Solicitada: esPorPresentacion ? '' : (parseFloat(item.Cantidad) || ''),
                                    // Campos de presentación - ESTOS SON LOS IMPORTANTES
                                    Item_Presentaciones_Id: esPorPresentacion ? item.Item_Presentaciones_Id : null,
                                    Cantidad_Solicitada_Presentacion: esPorPresentacion ? parseFloat(item.Cantidad_Presentacion) : null,
                                    Es_Requerimiento_Por_Presentacion: esPorPresentacion,
                                    // Campos adicionales para mostrar la presentación correctamente
                                    Presentacion_Nombre: esPorPresentacion ? item.Presentacion_Nombre : null,
                                    Presentacion_Unidad_Prefijo: esPorPresentacion ? (item.Presentacion_Unidad_Prefijo || item.UnidadMedida_Prefijo) : null,
                                    Factor_Conversion: esPorPresentacion ? parseFloat(item.Factor_Conversion) : null
                                };
                                
                                console.log(`✅ Item mapeado final:`, itemMapeado);
                                return itemMapeado;
                            });
                            
                            console.log('📦 Items precargados:', itemsPlantilla);
                            
                            // Verificar items con presentación
                            itemsPlantilla.forEach((item, idx) => {
                                if (item.Es_Requerimiento_Por_Presentacion) {
                                    console.log(`🎯 Item #${idx + 1} CON PRESENTACIÓN:`, {
                                        Item_Nombre: item.Item_Nombre,
                                        Item_Presentaciones_Id: item.Item_Presentaciones_Id,
                                        Cantidad_Solicitada_Presentacion: item.Cantidad_Solicitada_Presentacion,
                                        Cantidad_Solicitada: item.Cantidad_Solicitada,
                                        Presentacion_Nombre: item.Presentacion_Nombre,
                                        Factor_Conversion: item.Factor_Conversion
                                    });
                                }
                            });
                            
                            setItemsRequerimiento(itemsPlantilla);
                            toast.success(`Plantilla "${plantilla.Plantilla_Nombre}" cargada con ${itemsPlantilla.length} items`, 
                                { id: 'loading-plantilla' });
                        } else {
                            toast.success(`Plantilla "${plantilla.Plantilla_Nombre}" cargada`, 
                                { id: 'loading-plantilla' });
                        }
                    }
                } catch (plantillaError) {
                    console.error('❌ Error cargando plantilla:', plantillaError);
                    toast.error('Error cargando la plantilla', { id: 'loading-plantilla' });
                }
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error cargando datos iniciales');
        } finally {
            setIsLoading(false);
        }
    };

    // Funciones para manejar items
    const handleItemAdd = (producto) => {
        const nuevoItem = {
            Item_Id: producto.Item_Id,
            Item_Codigo_SKU: producto.Item_Codigo_SKU,
            Item_Nombre: producto.Item_Nombre,
            UnidadMedida_Prefijo: producto.UnidadMedida_Prefijo || 'Und',
            Cantidad_Solicitada: producto.Cantidad_Solicitada || '',
            // Campos de presentación
            Item_Presentaciones_Id: null,
            Cantidad_Solicitada_Presentacion: null,
            Es_Requerimiento_Por_Presentacion: false,
            // Campos adicionales para mostrar
            Presentacion_Nombre: null,
            Presentacion_Unidad_Prefijo: null,
            Factor_Conversion: null
        };
        
        // Agregar al inicio de la lista (LIFO - Last In, First Out)
        setItemsRequerimiento([nuevoItem, ...itemsRequerimiento]);
    };

    const handleItemUpdate = (itemId, cantidad, datosItem = null) => {
        console.log(`🔧 CrearRequerimiento: === LLAMADA A handleItemUpdate ===`);
        console.log(`🔧 CrearRequerimiento: itemId: ${itemId}`);
        console.log(`🔧 CrearRequerimiento: cantidad: ${cantidad}`);
        console.log(`🔧 CrearRequerimiento: datosItem:`, datosItem);
        
        const nuevosItems = itemsRequerimiento.map(item => {
            if (item.Item_Id === itemId) {
                console.log(`🔧 CrearRequerimiento: Encontrado item ${itemId}, datos actuales:`, item);
                
                const itemActualizado = { ...item };
                
                // Si datosItem es null, solo actualizar cantidad base
                if (datosItem === null) {
                    console.log(`🔧 CrearRequerimiento: Actualizando solo cantidad base`);
                    itemActualizado.Cantidad_Solicitada = cantidad;
                    itemActualizado.Es_Requerimiento_Por_Presentacion = false;
                    itemActualizado.Item_Presentaciones_Id = null;
                    itemActualizado.Cantidad_Solicitada_Presentacion = null;
                    itemActualizado.Presentacion_Nombre = null;
                    itemActualizado.Presentacion_Unidad_Prefijo = null;
                    itemActualizado.Factor_Conversion = null;
                } else {
                    // Actualizar con datos de presentación
                    console.log(`🔧 CrearRequerimiento: Actualizando con presentación`);
                    itemActualizado.Cantidad_Solicitada = cantidad; // Cantidad calculada en unidades base
                    itemActualizado.Es_Requerimiento_Por_Presentacion = true;
                    itemActualizado.Item_Presentaciones_Id = datosItem.Item_Presentaciones_Id;
                    itemActualizado.Cantidad_Solicitada_Presentacion = datosItem.Cantidad_Solicitada_Presentacion;
                    itemActualizado.Presentacion_Nombre = datosItem.Presentacion_Nombre;
                    itemActualizado.Presentacion_Unidad_Prefijo = datosItem.Presentacion_Unidad_Prefijo;
                    itemActualizado.Factor_Conversion = datosItem.Factor_Conversion;
                }
                
                console.log(`🔧 CrearRequerimiento: Item actualizado:`, itemActualizado);
                return itemActualizado;
            }
            return item;
        });
        
        console.log('🔧 CrearRequerimiento: === FIN handleItemUpdate ===');
        setItemsRequerimiento(nuevosItems);
    };

    const handleItemRemove = (itemId) => {
        const nuevosItems = itemsRequerimiento.filter(item => item.Item_Id !== itemId);
        setItemsRequerimiento(nuevosItems);
    };

    const validarFormulario = () => {
        console.log('Validando formulario con datos:', {
            requerimientoData,
            itemsRequerimiento
        });
        
        // Validar bodegas
        if (!requerimientoData.Origen_Bodega_Id) {
            toast.error('La bodega de origen es requerida');
            return false;
        }

        if (!requerimientoData.Destino_Bodega_Id) {
            toast.error('La bodega de destino es requerida');
            return false;
        }

        if (requerimientoData.Origen_Bodega_Id === requerimientoData.Destino_Bodega_Id) {
            toast.error('Las bodegas de origen y destino deben ser diferentes');
            return false;
        }

        // Validar items - Validar correctamente items con presentaciones
        const itemsValidos = itemsRequerimiento.filter(item => {
            if (!item.Item_Id) {
                return false;
            }
            
            let tieneCantidadValida = false;
            
            if (item.Es_Requerimiento_Por_Presentacion) {
                // Para items con presentación: validar Cantidad_Solicitada_Presentacion
                tieneCantidadValida = item.Cantidad_Solicitada_Presentacion && 
                                    parseFloat(item.Cantidad_Solicitada_Presentacion) > 0;
                console.log(`🔧 Item ${item.Item_Id} (PRESENTACIÓN): Cantidad_Presentacion="${item.Cantidad_Solicitada_Presentacion}", Válido=${tieneCantidadValida}`);
            } else {
                // Para items normales: validar Cantidad_Solicitada base
                tieneCantidadValida = item.Cantidad_Solicitada && parseFloat(item.Cantidad_Solicitada) > 0;
                console.log(`🔧 Item ${item.Item_Id} (BASE): Cantidad="${item.Cantidad_Solicitada}", Válido=${tieneCantidadValida}`);
            }
            
            return tieneCantidadValida;
        });

        console.log('Items válidos encontrados:', itemsValidos.length);
        console.log('Items válidos:', itemsValidos.map(item => ({
            Id: item.Item_Id,
            Nombre: item.Item_Nombre,
            Es_Presentacion: item.Es_Requerimiento_Por_Presentacion,
            Cantidad_Base: item.Cantidad_Solicitada,
            Cantidad_Presentacion: item.Cantidad_Solicitada_Presentacion
        })));

        if (itemsValidos.length === 0) {
            toast.error('Debe agregar al menos un item válido con cantidad');
            return false;
        }

        return true;
    };

    const mostrarResumenConfirmacion = () => {
        if (!validarFormulario()) {
            return;
        }

        // Preparar datos para el resumen
        const itemsValidos = itemsRequerimiento.filter(item => {
            // Validar que el item tenga ID
            if (!item.Item_Id) {
                return false;
            }
            
            // Para items con presentación: validar Cantidad_Solicitada_Presentacion
            if (item.Es_Requerimiento_Por_Presentacion) {
                return item.Cantidad_Solicitada_Presentacion && 
                       parseFloat(item.Cantidad_Solicitada_Presentacion) > 0;
            }
            
            // Para items normales: validar Cantidad_Solicitada base
            const cantidadBaseValida = item.Cantidad_Solicitada && parseFloat(item.Cantidad_Solicitada) > 0;
            return cantidadBaseValida;
        });

        console.log('🔧 CrearRequerimiento: Items válidos filtrados:', itemsValidos.length);
        console.log('🔧 CrearRequerimiento: Items antes de confirmar (COMPLETOS):', itemsValidos);

        // Configurar modal de confirmación
        setConfirmModalConfig({
            title: 'Confirmar Creación de Requerimiento',
            message: `¿Está seguro de crear este requerimiento con ${itemsValidos.length} ${itemsValidos.length === 1 ? 'item' : 'items'}?`,
            confirmText: 'Crear Requerimiento',
            cancelText: 'Cancelar',
            type: 'confirm',
            onConfirm: () => confirmarCreacion(itemsValidos)
        });
        setShowConfirmModal(true);
    };

    const confirmarCreacion = async (itemsValidos) => {
        try {
            setSaving(true);
            setShowConfirmModal(false);

            console.log('🔧 CrearRequerimiento: Enviando datos al backend...');
            console.log('🔧 requerimientoData:', requerimientoData);
            console.log('🔧 items:', itemsValidos);

            // Preparar items en el formato esperado por el backend
            const itemsParaBackend = itemsValidos.map(item => ({
                Item_Id: item.Item_Id,
                Cantidad_Solicitada: item.Es_Requerimiento_Por_Presentacion ? 
                                   item.Cantidad_Solicitada : // Ya está calculada en unidades base
                                   parseFloat(item.Cantidad_Solicitada),
                // Campos de presentación
                Item_Presentaciones_Id: item.Es_Requerimiento_Por_Presentacion ? 
                                      item.Item_Presentaciones_Id : null,
                Cantidad_Solicitada_Presentacion: item.Es_Requerimiento_Por_Presentacion ? 
                                                 parseFloat(item.Cantidad_Solicitada_Presentacion) : null,
                Es_Requerimiento_Por_Presentacion: item.Es_Requerimiento_Por_Presentacion
            }));

            console.log('🔧 Items para backend:', itemsParaBackend);

            const response = await requerimientoService.crearRequerimiento(requerimientoData, itemsParaBackend);

            if (response.success) {
                toast.success('Requerimiento creado exitosamente');
                
                // Navegar a la página de detalles del requerimiento recién creado
                const requerimientoId = response.data.requerimiento_id;
                navigate(`/requerimientos/${requerimientoId}`, {
                    state: { 
                        message: 'Requerimiento creado exitosamente',
                        fromCreation: true
                    }
                });
            } else {
                throw new Error(response.message || 'Error creando requerimiento');
            }

        } catch (error) {
            console.error('Error creando requerimiento:', error);
            const errorMessage = error.message || 'Error creando requerimiento';
            toast.error(errorMessage);
        } finally {
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
        <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
            {/* Header del requerimiento */}
            <HeaderRequerimiento plantillaInfo={plantillaInfo} />

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Formulario de información general */}
                <FormularioRequerimiento
                    requerimientoData={requerimientoData}
                    setRequerimientoData={setRequerimientoData}
                    bodegas={bodegas}
                    usuarioLogueado={usuarioLogueado}
                />

                {/* Tabla de Items */}
                <TablaItemsRequerimiento
                    items={itemsRequerimiento}
                    onItemAdd={handleItemAdd}
                    onItemUpdate={handleItemUpdate}
                    onItemRemove={handleItemRemove}
                    bodegaOrigenId={requerimientoData.Origen_Bodega_Id}
                    loading={isLoading}
                />

                {/* Acciones del formulario */}
                <AccionesRequerimiento
                    onCancel={() => navigate('/requerimientos')}
                    onSubmit={handleSubmit}
                    isSaving={isSaving}
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

export default CrearRequerimiento;