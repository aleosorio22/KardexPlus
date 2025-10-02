-- =======================================
-- SCRIPT DE VALIDACIÓN Y MEJORAS PARA MÓDULO DE REQUERIMIENTOS
-- =======================================

-- Verificar estructura actual de las tablas
SELECT 'VERIFICANDO TABLA requerimientos' as verificacion;
DESCRIBE requerimientos;

SELECT 'VERIFICANDO TABLA requerimientos_detalle' as verificacion;
DESCRIBE requerimientos_detalle;

-- =======================================
-- VALIDACIONES Y CONSTRAINTS ADICIONALES
-- =======================================

-- Verificar que los constraints existen
SELECT 'VERIFICANDO CONSTRAINTS EXISTENTES' as verificacion;
SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    TABLE_NAME
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('requerimientos', 'requerimientos_detalle')
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;

-- =======================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =======================================

-- Índices para mejorar rendimiento en consultas frecuentes
SELECT 'CREANDO ÍNDICES ADICIONALES' as verificacion;

-- Índice compuesto para filtros frecuentes en requerimientos
CREATE INDEX IF NOT EXISTS idx_requerimientos_estado_fecha 
ON requerimientos(Estado, Fecha);

-- Índice para búsquedas por bodega origen
CREATE INDEX IF NOT EXISTS idx_requerimientos_origen_bodega 
ON requerimientos(Origen_Bodega_Id, Estado);

-- Índice para búsquedas por bodega destino  
CREATE INDEX IF NOT EXISTS idx_requerimientos_destino_bodega 
ON requerimientos(Destino_Bodega_Id, Estado);

-- Índice para búsquedas por usuario que solicita
CREATE INDEX IF NOT EXISTS idx_requerimientos_usuario_solicita 
ON requerimientos(Usuario_Solicita_Id, Estado);

-- Índice para búsquedas por usuario que despacha
CREATE INDEX IF NOT EXISTS idx_requerimientos_usuario_despacha 
ON requerimientos(Usuario_Despacha_Id, Fecha_Despacho);

-- Índice para el detalle de requerimientos
CREATE INDEX IF NOT EXISTS idx_requerimientos_detalle_item 
ON requerimientos_detalle(Item_Id, Requerimiento_Id);

-- =======================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- =======================================

-- Trigger para actualizar automáticamente el estado del requerimiento
-- cuando se actualiza el detalle (después de despachos parciales)
DELIMITER //

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS tr_actualizar_estado_requerimiento//

CREATE TRIGGER tr_actualizar_estado_requerimiento
AFTER UPDATE ON requerimientos_detalle
FOR EACH ROW
BEGIN
    DECLARE total_items INT DEFAULT 0;
    DECLARE items_completos INT DEFAULT 0;
    DECLARE items_con_despacho INT DEFAULT 0;
    DECLARE estado_actual VARCHAR(20);
    
    -- Obtener estado actual del requerimiento
    SELECT Estado INTO estado_actual 
    FROM requerimientos 
    WHERE Requerimiento_Id = NEW.Requerimiento_Id;
    
    -- Solo procesar si el requerimiento está en estado que permite despacho
    IF estado_actual IN ('Aprobado', 'En_Despacho', 'Parcialmente_Despachado') THEN
        
        -- Contar totales
        SELECT 
            COUNT(*) INTO total_items
        FROM requerimientos_detalle 
        WHERE Requerimiento_Id = NEW.Requerimiento_Id;
        
        -- Contar items completamente despachados
        SELECT 
            COUNT(*) INTO items_completos
        FROM requerimientos_detalle 
        WHERE Requerimiento_Id = NEW.Requerimiento_Id
        AND Cantidad_Despachada >= Cantidad_Solicitada;
        
        -- Contar items con algún despacho
        SELECT 
            COUNT(*) INTO items_con_despacho
        FROM requerimientos_detalle 
        WHERE Requerimiento_Id = NEW.Requerimiento_Id
        AND Cantidad_Despachada > 0;
        
        -- Actualizar estado según las condiciones
        IF items_completos = total_items THEN
            -- Todos los items están completamente despachados
            UPDATE requerimientos 
            SET Estado = 'Completado'
            WHERE Requerimiento_Id = NEW.Requerimiento_Id;
            
        ELSEIF items_con_despacho > 0 THEN
            -- Hay items con despacho parcial
            UPDATE requerimientos 
            SET Estado = 'Parcialmente_Despachado'
            WHERE Requerimiento_Id = NEW.Requerimiento_Id;
            
        ELSEIF estado_actual != 'Aprobado' THEN
            -- No hay despachos, volver a aprobado si no está ya
            UPDATE requerimientos 
            SET Estado = 'Aprobado'
            WHERE Requerimiento_Id = NEW.Requerimiento_Id;
        END IF;
        
    END IF;
END//

DELIMITER ;

-- =======================================
-- VISTAS ÚTILES PARA CONSULTAS
-- =======================================

-- Vista para requerimientos con información completa
CREATE OR REPLACE VIEW vista_requerimientos_completa AS
SELECT 
    r.Requerimiento_Id,
    r.Fecha,
    r.Fecha_Despacho,
    r.Fecha_Aprobacion,
    r.Estado,
    r.Observaciones,
    r.Observaciones_Despacho,
    
    -- Información del usuario que solicita
    r.Usuario_Solicita_Id,
    CONCAT(us.Usuario_Nombre, ' ', us.Usuario_Apellido) as Usuario_Solicita_Nombre,
    us.Usuario_Email as Usuario_Solicita_Email,
    
    -- Información del usuario que despacha
    r.Usuario_Despacha_Id,
    CONCAT(ud.Usuario_Nombre, ' ', ud.Usuario_Apellido) as Usuario_Despacha_Nombre,
    ud.Usuario_Email as Usuario_Despacha_Email,
    
    -- Información del usuario que aprueba
    r.Usuario_Aprueba_Id,
    CONCAT(ua.Usuario_Nombre, ' ', ua.Usuario_Apellido) as Usuario_Aprueba_Nombre,
    ua.Usuario_Email as Usuario_Aprueba_Email,
    
    -- Información de bodegas
    r.Origen_Bodega_Id,
    bo.Bodega_Nombre as Origen_Bodega_Nombre,
    bo.Bodega_Ubicacion as Origen_Bodega_Ubicacion,
    
    r.Destino_Bodega_Id,
    bd.Bodega_Nombre as Destino_Bodega_Nombre,
    bd.Bodega_Ubicacion as Destino_Bodega_Ubicacion,
    
    -- Estadísticas del requerimiento
    (SELECT COUNT(*) FROM requerimientos_detalle WHERE Requerimiento_Id = r.Requerimiento_Id) as Total_Items,
    (SELECT SUM(Cantidad_Solicitada) FROM requerimientos_detalle WHERE Requerimiento_Id = r.Requerimiento_Id) as Total_Cantidad_Solicitada,
    (SELECT SUM(Cantidad_Despachada) FROM requerimientos_detalle WHERE Requerimiento_Id = r.Requerimiento_Id) as Total_Cantidad_Despachada,
    
    -- Porcentaje de completitud
    ROUND(
        (SELECT SUM(Cantidad_Despachada) FROM requerimientos_detalle WHERE Requerimiento_Id = r.Requerimiento_Id) * 100.0 /
        NULLIF((SELECT SUM(Cantidad_Solicitada) FROM requerimientos_detalle WHERE Requerimiento_Id = r.Requerimiento_Id), 0),
        2
    ) as Porcentaje_Completitud

FROM requerimientos r
INNER JOIN usuarios us ON r.Usuario_Solicita_Id = us.Usuario_Id
LEFT JOIN usuarios ud ON r.Usuario_Despacha_Id = ud.Usuario_Id  
LEFT JOIN usuarios ua ON r.Usuario_Aprueba_Id = ua.Usuario_Id
INNER JOIN bodegas bo ON r.Origen_Bodega_Id = bo.Bodega_Id
INNER JOIN bodegas bd ON r.Destino_Bodega_Id = bd.Bodega_Id;

-- Vista para detalle de requerimientos con información de items
CREATE OR REPLACE VIEW vista_requerimientos_detalle_completa AS
SELECT 
    rd.Requerimiento_Detalle_Id,
    rd.Requerimiento_Id,
    rd.Item_Id,
    rd.Item_Presentaciones_Id,
    rd.Cantidad_Solicitada,
    rd.Cantidad_Solicitada_Presentacion,
    rd.Cantidad_Despachada,
    rd.Cantidad_Despachada_Presentacion,
    rd.Es_Requerimiento_Por_Presentacion,
    
    -- Información del item
    i.Item_Codigo,
    i.Item_Nombre,
    i.Item_Descripcion,
    
    -- Información de la categoría
    c.Categoria_Nombre,
    
    -- Información de la unidad de medida
    um.Unidad_Nombre,
    um.Unidad_Abreviacion,
    
    -- Información de la presentación (si aplica)
    ip.Presentacion_Nombre,
    ip.Cantidad_Base as Presentacion_Cantidad_Base,
    
    -- Cálculos útiles
    (rd.Cantidad_Solicitada - rd.Cantidad_Despachada) as Cantidad_Pendiente,
    CASE 
        WHEN rd.Cantidad_Solicitada > 0 THEN 
            ROUND((rd.Cantidad_Despachada * 100.0) / rd.Cantidad_Solicitada, 2)
        ELSE 0 
    END as Porcentaje_Despachado,
    
    -- Estado del item en el requerimiento
    CASE 
        WHEN rd.Cantidad_Despachada = 0 THEN 'Pendiente'
        WHEN rd.Cantidad_Despachada < rd.Cantidad_Solicitada THEN 'Parcial'
        WHEN rd.Cantidad_Despachada >= rd.Cantidad_Solicitada THEN 'Completo'
        ELSE 'Desconocido'
    END as Estado_Item

FROM requerimientos_detalle rd
INNER JOIN items i ON rd.Item_Id = i.Item_Id
LEFT JOIN categorias c ON i.Categoria_Id = c.Categoria_Id
LEFT JOIN unidades_medida um ON i.Unidad_Medida_Id = um.Unidad_Medida_Id
LEFT JOIN items_presentaciones ip ON rd.Item_Presentaciones_Id = ip.Item_Presentaciones_Id;

-- =======================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =======================================

-- Procedimiento para obtener resumen de requerimientos por período
DELIMITER //

DROP PROCEDURE IF EXISTS sp_resumen_requerimientos_periodo//

CREATE PROCEDURE sp_resumen_requerimientos_periodo(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        Estado,
        COUNT(*) as Total_Requerimientos,
        SUM(
            (SELECT SUM(rd.Cantidad_Solicitada) 
             FROM requerimientos_detalle rd 
             WHERE rd.Requerimiento_Id = r.Requerimiento_Id)
        ) as Total_Cantidad_Solicitada,
        SUM(
            (SELECT SUM(rd.Cantidad_Despachada) 
             FROM requerimientos_detalle rd 
             WHERE rd.Requerimiento_Id = r.Requerimiento_Id)
        ) as Total_Cantidad_Despachada,
        AVG(
            CASE 
                WHEN Estado = 'Completado' THEN TIMESTAMPDIFF(HOUR, Fecha, Fecha_Despacho)
                ELSE NULL 
            END
        ) as Promedio_Horas_Completar
    FROM requerimientos r
    WHERE DATE(r.Fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY Estado
    ORDER BY Estado;
END//

DELIMITER ;

-- =======================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =======================================

-- Comentar esta sección si no se desean datos de prueba
/*
-- Insertar algunos requerimientos de prueba
INSERT INTO requerimientos (
    Usuario_Solicita_Id, 
    Origen_Bodega_Id, 
    Destino_Bodega_Id, 
    Observaciones, 
    Estado
) VALUES 
(1, 1, 2, 'Requerimiento de prueba 1', 'Pendiente'),
(1, 2, 1, 'Requerimiento de prueba 2', 'Pendiente');

-- Insertar detalle de prueba (ajustar IDs según tu base de datos)
INSERT INTO requerimientos_detalle (
    Requerimiento_Id,
    Item_Id,
    Cantidad_Solicitada,
    Es_Requerimiento_Por_Presentacion
) VALUES 
(LAST_INSERT_ID() - 1, 1, 10.0000, 0),
(LAST_INSERT_ID(), 2, 5.0000, 0);
*/

-- =======================================
-- VERIFICACIÓN FINAL
-- =======================================

SELECT 'MÓDULO DE REQUERIMIENTOS CONFIGURADO EXITOSAMENTE' as resultado;

-- Mostrar estadísticas de las tablas
SELECT 
    'requerimientos' as tabla,
    COUNT(*) as total_registros
FROM requerimientos
UNION ALL
SELECT 
    'requerimientos_detalle' as tabla,
    COUNT(*) as total_registros  
FROM requerimientos_detalle;

-- Verificar vistas creadas
SELECT 'VISTAS CREADAS' as verificacion;
SHOW TABLES LIKE 'vista_requerimientos%';