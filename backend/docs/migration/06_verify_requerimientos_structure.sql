-- =====================================================
-- VERIFICACIÓN DE ESTRUCTURA DE REQUERIMIENTOS
-- =====================================================

-- Verificar que las tablas existen
SELECT 'Verificando existencia de tablas...' as status;

SELECT 
    TABLE_NAME,
    ENGINE,
    TABLE_COLLATION,
    AUTO_INCREMENT
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('requerimientos', 'requerimientos_detalle');

-- Verificar columnas de requerimientos
SELECT 'Estructura de tabla requerimientos:' as status;
DESCRIBE requerimientos;

-- Verificar columnas de requerimientos_detalle
SELECT 'Estructura de tabla requerimientos_detalle:' as status;
DESCRIBE requerimientos_detalle;

-- Verificar foreign keys
SELECT 'Foreign Keys de requerimientos:' as status;
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('requerimientos', 'requerimientos_detalle')
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verificar check constraints
SELECT 'Check Constraints:' as status;
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    CHECK_CLAUSE
FROM information_schema.CHECK_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('requerimientos', 'requerimientos_detalle');

-- Verificar triggers
SELECT 'Triggers existentes:' as status;
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = DATABASE() 
AND EVENT_OBJECT_TABLE IN ('requerimientos', 'requerimientos_detalle');

-- Verificar índices
SELECT 'Índices creados:' as status;
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE,
    INDEX_TYPE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('requerimientos', 'requerimientos_detalle')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

SELECT 'Verificación completada' as status;