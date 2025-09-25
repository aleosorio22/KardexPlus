/**
 * Utilidades para probar el comportamiento del ItemSelector
 * Estas funciones nos ayudan a validar que las conversiones de presentaciones funcionan correctamente
 */

/**
 * Prueba la conversión de cantidad base a cantidad de presentación
 * @param {number} cantidadBase - Cantidad en unidad base
 * @param {number} factorConversion - Factor de conversión (Cantidad_Base de la presentación)
 * @returns {number} - Cantidad en presentación
 */
export const convertirBaseAPresentacion = (cantidadBase, factorConversion) => {
    if (!cantidadBase || !factorConversion || factorConversion <= 0) {
        return 0;
    }
    
    // Cantidad Presentación = Cantidad Base ÷ Factor de Conversión
    return cantidadBase / factorConversion;
};

/**
 * Prueba la conversión de cantidad de presentación a cantidad base
 * @param {number} cantidadPresentacion - Cantidad en presentación
 * @param {number} factorConversion - Factor de conversión (Cantidad_Base de la presentación)
 * @returns {number} - Cantidad en unidad base
 */
export const convertirPresentacionABase = (cantidadPresentacion, factorConversion) => {
    if (!cantidadPresentacion || !factorConversion || factorConversion <= 0) {
        return 0;
    }
    
    // Cantidad Base = Cantidad Presentación × Factor de Conversión
    return cantidadPresentacion * factorConversion;
};

/**
 * Valida que los datos del item estén completos para enviar al backend
 * @param {Object} datosItem - Datos del item desde ItemSelector
 * @returns {Object} - Resultado de la validación
 */
export const validarDatosItem = (datosItem) => {
    const errores = [];
    const advertencias = [];
    
    // Validaciones requeridas
    if (!datosItem.Item_Id) {
        errores.push('Item_Id es requerido');
    }
    
    if (datosItem.Cantidad === undefined || datosItem.Cantidad === null) {
        errores.push('Cantidad es requerida');
    }
    
    if (datosItem.Cantidad <= 0) {
        errores.push('Cantidad debe ser mayor a 0');
    }
    
    // Validaciones de presentación
    if (datosItem.Es_Movimiento_Por_Presentacion) {
        if (!datosItem.Item_Presentaciones_Id) {
            errores.push('Item_Presentaciones_Id es requerido para movimientos por presentación');
        }
        
        if (!datosItem.Cantidad_Presentacion || datosItem.Cantidad_Presentacion <= 0) {
            errores.push('Cantidad_Presentacion debe ser mayor a 0 para movimientos por presentación');
        }
        
        if (!datosItem.Factor_Conversion || datosItem.Factor_Conversion <= 0) {
            errores.push('Factor_Conversion debe ser mayor a 0 para movimientos por presentación');
        }
        
        // Validar consistencia de conversión
        const cantidadCalculada = convertirPresentacionABase(datosItem.Cantidad_Presentacion, datosItem.Factor_Conversion);
        const diferencia = Math.abs(cantidadCalculada - datosItem.Cantidad);
        
        if (diferencia > 0.01) { // Tolerancia de 0.01 para errores de redondeo
            advertencias.push(`Inconsistencia en conversión: calculado ${cantidadCalculada}, recibido ${datosItem.Cantidad}`);
        }
    } else {
        // Para movimientos normales, estos campos deberían ser null
        if (datosItem.Item_Presentaciones_Id !== null) {
            advertencias.push('Item_Presentaciones_Id debería ser null para movimientos normales');
        }
        
        if (datosItem.Cantidad_Presentacion !== null) {
            advertencias.push('Cantidad_Presentacion debería ser null para movimientos normales');
        }
    }
    
    return {
        valido: errores.length === 0,
        errores,
        advertencias
    };
};

/**
 * Simula los datos que debería enviar ItemSelector para un movimiento por presentación
 * @param {Object} params - Parámetros de prueba
 * @returns {Object} - Datos simulados del item
 */
export const simularDatosMovimientoPresentacion = ({
    itemId = 1,
    cantidadPresentacion = 2,
    factorConversion = 20,
    presentacionId = 5,
    presentacionNombre = 'CAJA DE 20 LIBRAS',
    stockActual = 100
}) => {
    const cantidadBase = convertirPresentacionABase(cantidadPresentacion, factorConversion);
    
    return {
        Item_Id: itemId,
        Item_Codigo: 'TEST001',
        Item_Descripcion: 'Item de prueba',
        Item_Nombre: 'Item de prueba',
        Cantidad: cantidadBase,
        Stock_Actual: stockActual,
        Item_Presentaciones_Id: presentacionId,
        Cantidad_Presentacion: cantidadPresentacion,
        Es_Movimiento_Por_Presentacion: true,
        Presentacion_Nombre: presentacionNombre,
        Presentacion_Unidad_Prefijo: 'lb',
        Factor_Conversion: factorConversion,
        UnidadMedida_Prefijo: 'lb'
    };
};

/**
 * Simula los datos que debería enviar ItemSelector para un movimiento normal (sin presentación)
 * @param {Object} params - Parámetros de prueba
 * @returns {Object} - Datos simulados del item
 */
export const simularDatosMovimientoNormal = ({
    itemId = 1,
    cantidad = 40,
    stockActual = 100
}) => {
    return {
        Item_Id: itemId,
        Item_Codigo: 'TEST001',
        Item_Descripcion: 'Item de prueba',
        Item_Nombre: 'Item de prueba',
        Cantidad: cantidad,
        Stock_Actual: stockActual,
        Item_Presentaciones_Id: null,
        Cantidad_Presentacion: null,
        Es_Movimiento_Por_Presentacion: false,
        Presentacion_Nombre: null,
        Presentacion_Unidad_Prefijo: null,
        Factor_Conversion: null,
        UnidadMedida_Prefijo: 'lb'
    };
};

/**
 * Ejecuta una batería de pruebas de conversión
 * @returns {Object} - Resultados de las pruebas
 */
export const ejecutarPruebasConversion = () => {
    const pruebas = [
        {
            nombre: 'Conversión básica presentación a base',
            cantidadPresentacion: 2,
            factorConversion: 20,
            esperado: 40
        },
        {
            nombre: 'Conversión básica base a presentación',
            cantidadBase: 40,
            factorConversion: 20,
            esperado: 2
        },
        {
            nombre: 'Conversión con decimales',
            cantidadPresentacion: 1.5,
            factorConversion: 20,
            esperado: 30
        },
        {
            nombre: 'Conversión inversa con decimales',
            cantidadBase: 30,
            factorConversion: 20,
            esperado: 1.5
        }
    ];
    
    const resultados = [];
    
    pruebas.forEach((prueba, index) => {
        let resultado;
        let pasó = false;
        
        if (prueba.cantidadPresentacion !== undefined) {
            // Prueba de presentación a base
            resultado = convertirPresentacionABase(prueba.cantidadPresentacion, prueba.factorConversion);
            pasó = Math.abs(resultado - prueba.esperado) < 0.01;
        } else {
            // Prueba de base a presentación
            resultado = convertirBaseAPresentacion(prueba.cantidadBase, prueba.factorConversion);
            pasó = Math.abs(resultado - prueba.esperado) < 0.01;
        }
        
        resultados.push({
            prueba: index + 1,
            nombre: prueba.nombre,
            resultado,
            esperado: prueba.esperado,
            pasó,
            diferencia: Math.abs(resultado - prueba.esperado)
        });
    });
    
    const pruebasPasadas = resultados.filter(r => r.pasó).length;
    const totalPruebas = resultados.length;
    
    return {
        resultados,
        pruebasPasadas,
        totalPruebas,
        éxito: pruebasPasadas === totalPruebas
    };
};

/**
 * Logs de prueba con formato bonito para la consola
 * @param {string} titulo - Título de la prueba
 * @param {Object} datos - Datos a mostrar
 */
export const logPrueba = (titulo, datos) => {
    console.log(`🧪 PRUEBA: ${titulo}`);
    console.log('📊 DATOS:', JSON.stringify(datos, null, 2));
    
    if (datos.validacion) {
        console.log(`✅ VÁLIDO: ${datos.validacion.valido}`);
        if (datos.validacion.errores.length > 0) {
            console.log('❌ ERRORES:', datos.validacion.errores);
        }
        if (datos.validacion.advertencias.length > 0) {
            console.log('⚠️  ADVERTENCIAS:', datos.validacion.advertencias);
        }
    }
    
    console.log('---');
};