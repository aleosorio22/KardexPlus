-- =====================================================
-- TRIGGERS PARA REQUERIMIENTOS
-- =====================================================

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS tr_actualizar_estado_requerimiento;

-- Trigger para actualizar automáticamente el estado del requerimiento
-- Se ejecuta después de INSERT, UPDATE o DELETE en requerimientos_detalle
DELIMITER $$

CREATE TRIGGER tr_actualizar_estado_requerimiento
AFTER UPDATE ON requerimientos_detalle
FOR EACH ROW
BEGIN
    DECLARE total_items INT DEFAULT 0;
    DECLARE items_completados INT DEFAULT 0;
    DECLARE items_parcialmente_despachados INT DEFAULT 0;
    DECLARE nuevo_estado VARCHAR(25);
    
    -- Contar total de items en el requerimiento
    SELECT COUNT(*) INTO total_items
    FROM requerimientos_detalle 
    WHERE Requerimiento_Id = NEW.Requerimiento_Id;
    
    -- Contar items completamente despachados
    SELECT COUNT(*) INTO items_completados
    FROM requerimientos_detalle 
    WHERE Requerimiento_Id = NEW.Requerimiento_Id 
    AND Cantidad_Despachada >= Cantidad_Solicitada;
    
    -- Contar items parcialmente despachados
    SELECT COUNT(*) INTO items_parcialmente_despachados
    FROM requerimientos_detalle 
    WHERE Requerimiento_Id = NEW.Requerimiento_Id 
    AND Cantidad_Despachada > 0 
    AND Cantidad_Despachada < Cantidad_Solicitada;
    
    -- Determinar el nuevo estado
    IF items_completados = total_items THEN
        SET nuevo_estado = 'Completado';
    ELSEIF items_parcialmente_despachados > 0 OR items_completados > 0 THEN
        SET nuevo_estado = 'Parcialmente_Despachado';
    ELSE
        SET nuevo_estado = 'En_Despacho';
    END IF;
    
    -- Actualizar el estado del requerimiento
    UPDATE requerimientos 
    SET Estado = nuevo_estado
    WHERE Requerimiento_Id = NEW.Requerimiento_Id;
    
END$$

DELIMITER ;