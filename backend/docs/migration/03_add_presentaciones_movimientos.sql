-- ==============================
--   MIGRACIÓN: AGREGAR SOPORTE PARA MOVIMIENTOS POR PRESENTACIÓN
--   Fecha: 2025-09-23
--   Descripción: Agrega campos necesarios para manejar movimientos por presentación
-- ==============================

USE kardexplus_db;

-- ==============================
-- PASO 1: AGREGAR NUEVAS COLUMNAS A Movimientos_Detalle
-- ==============================

ALTER TABLE `Movimientos_Detalle` 
ADD COLUMN `Item_Presentaciones_Id` int NULL AFTER `Item_Id`,
ADD COLUMN `Cantidad_Presentacion` decimal(14,4) NULL AFTER `Cantidad`,
ADD COLUMN `Es_Movimiento_Por_Presentacion` boolean DEFAULT FALSE AFTER `Cantidad_Presentacion`;

-- ==============================
-- PASO 2: AGREGAR FOREIGN KEY CONSTRAINT
-- ==============================

ALTER TABLE `Movimientos_Detalle` 
ADD CONSTRAINT `fk_movimientos_detalle_presentacion` 
FOREIGN KEY (`Item_Presentaciones_Id`) 
REFERENCES `Items_Presentaciones` (`Item_Presentaciones_Id`) 
ON DELETE RESTRICT;

-- ==============================
-- PASO 3: AGREGAR ÍNDICES PARA PERFORMANCE
-- ==============================

CREATE INDEX `idx_movimientos_detalle_presentacion` ON `Movimientos_Detalle` (`Item_Presentaciones_Id`);
CREATE INDEX `idx_movimientos_detalle_tipo` ON `Movimientos_Detalle` (`Es_Movimiento_Por_Presentacion`);

-- ==============================
-- PASO 4: AGREGAR CONSTRAINT PARA VALIDACIÓN DE DATOS
-- ==============================

-- Constraint: Si es movimiento por presentación, debe tener presentación y cantidad de presentación
ALTER TABLE `Movimientos_Detalle`
ADD CONSTRAINT `chk_movimiento_presentacion_completo` 
CHECK (
    (`Es_Movimiento_Por_Presentacion` = FALSE) OR 
    (`Es_Movimiento_Por_Presentacion` = TRUE AND `Item_Presentaciones_Id` IS NOT NULL AND `Cantidad_Presentacion` IS NOT NULL)
);

-- Constraint: Si no es movimiento por presentación, no debe tener datos de presentación
ALTER TABLE `Movimientos_Detalle`
ADD CONSTRAINT `chk_movimiento_base_limpio` 
CHECK (
    (`Es_Movimiento_Por_Presentacion` = TRUE) OR 
    (`Es_Movimiento_Por_Presentacion` = FALSE AND `Item_Presentaciones_Id` IS NULL AND `Cantidad_Presentacion` IS NULL)
);

-- Constraint: Cantidad de presentación debe ser positiva si existe
ALTER TABLE `Movimientos_Detalle`
ADD CONSTRAINT `chk_cantidad_presentacion_positiva` 
CHECK (`Cantidad_Presentacion` IS NULL OR `Cantidad_Presentacion` > 0);

-- ==============================
-- PASO 5: ACTUALIZAR REGISTROS EXISTENTES
-- ==============================

-- Marcar todos los movimientos existentes como movimientos por unidad base
UPDATE `Movimientos_Detalle` 
SET `Es_Movimiento_Por_Presentacion` = FALSE 
WHERE `Es_Movimiento_Por_Presentacion` IS NULL;

-- ==============================
-- PASO 6: VERIFICACIÓN DE LA MIGRACIÓN
-- ==============================

-- Verificar que la estructura se creó correctamente
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'kardexplus_db' 
AND TABLE_NAME = 'Movimientos_Detalle'
AND COLUMN_NAME IN ('Item_Presentaciones_Id', 'Cantidad_Presentacion', 'Es_Movimiento_Por_Presentacion');

-- Verificar que los constraints se crearon correctamente
SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'kardexplus_db' 
AND TABLE_NAME = 'Movimientos_Detalle'
AND CONSTRAINT_NAME LIKE '%presentacion%';

-- Contar registros existentes (deben tener Es_Movimiento_Por_Presentacion = FALSE)
SELECT 
    COUNT(*) as total_registros,
    SUM(CASE WHEN Es_Movimiento_Por_Presentacion = FALSE THEN 1 ELSE 0 END) as movimientos_base,
    SUM(CASE WHEN Es_Movimiento_Por_Presentacion = TRUE THEN 1 ELSE 0 END) as movimientos_presentacion
FROM `Movimientos_Detalle`;

-- ==============================
-- NOTAS IMPORTANTES:
-- ==============================

/*
1. Esta migración es BACKWARD COMPATIBLE - no rompe funcionalidad existente
2. Todos los movimientos existentes quedan marcados como Es_Movimiento_Por_Presentacion = FALSE
3. Los triggers existentes siguen funcionando normalmente con el campo Cantidad
4. Los nuevos campos son opcionales (NULL permitido) excepto para movimientos por presentación
5. Se agregaron constraints para mantener integridad de datos
6. Los índices mejoran el performance de consultas por presentación

PRÓXIMOS PASOS:
- Modificar modelos del backend para usar estos nuevos campos
- Crear endpoints específicos para movimientos por presentación
- Actualizar frontend para mostrar opciones de presentación
*/