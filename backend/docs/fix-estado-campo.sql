-- =======================================
-- FIX PARA CAMPO ESTADO EN REQUERIMIENTOS
-- =======================================

-- Verificar la longitud actual del campo Estado
SELECT 'VERIFICANDO LONGITUD ACTUAL DEL CAMPO Estado' as verificacion;
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'requerimientos' 
AND COLUMN_NAME = 'Estado';

-- Verificar constraint actual
SELECT 'VERIFICANDO CONSTRAINT DE ESTADOS' as verificacion;
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE() 
AND CONSTRAINT_NAME LIKE '%estado%requerimiento%';

-- Si el campo es muy corto, expandirlo
-- El estado más largo es 'Parcialmente_Despachado' (22 caracteres)
-- Vamos a asegurar que el campo tenga al menos 25 caracteres

ALTER TABLE requerimientos 
MODIFY COLUMN Estado VARCHAR(25) DEFAULT 'Pendiente';

-- Verificar que el cambio se aplicó
SELECT 'VERIFICANDO CAMBIO APLICADO' as verificacion;
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'requerimientos' 
AND COLUMN_NAME = 'Estado';

-- Verificar que todos los estados válidos caben en el nuevo campo
SELECT 'VERIFICANDO LONGITUD DE ESTADOS VÁLIDOS' as verificacion;
SELECT 
    'Pendiente' as estado, LENGTH('Pendiente') as longitud
UNION ALL SELECT 'Aprobado', LENGTH('Aprobado')
UNION ALL SELECT 'En_Despacho', LENGTH('En_Despacho')
UNION ALL SELECT 'Completado', LENGTH('Completado')
UNION ALL SELECT 'Parcialmente_Despachado', LENGTH('Parcialmente_Despachado')
UNION ALL SELECT 'Rechazado', LENGTH('Rechazado')
UNION ALL SELECT 'Cancelado', LENGTH('Cancelado')
ORDER BY longitud DESC;