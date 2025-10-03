-- =====================================================
-- MIGRACIÓN COMPLETA DE REQUERIMIENTOS
-- =====================================================

-- PASO 1: Eliminar tablas existentes si existen
DROP TABLE IF EXISTS requerimientos_detalle;
DROP TABLE IF EXISTS requerimientos;

-- PASO 2: Crear tabla principal requerimientos
CREATE TABLE `requerimientos` (
  `Requerimiento_Id` int NOT NULL AUTO_INCREMENT,
  `Fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `Fecha_Despacho` datetime DEFAULT NULL,
  `Fecha_Aprobacion` datetime DEFAULT NULL,
  `Usuario_Solicita_Id` int NOT NULL,
  `Usuario_Despacha_Id` int DEFAULT NULL,
  `Usuario_Aprueba_Id` int DEFAULT NULL,
  `Origen_Bodega_Id` int NOT NULL,
  `Destino_Bodega_Id` int NOT NULL,
  `Estado` varchar(25) COLLATE utf8mb4_general_ci DEFAULT 'Pendiente',
  `Observaciones` text COLLATE utf8mb4_general_ci,
  `Observaciones_Despacho` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`Requerimiento_Id`),
  KEY `idx_requerimientos_estado` (`Estado`),
  KEY `idx_requerimientos_fecha` (`Fecha`),
  KEY `idx_requerimientos_estado_fecha` (`Estado`,`Fecha`),
  KEY `idx_requerimientos_origen_bodega` (`Origen_Bodega_Id`,`Estado`),
  KEY `idx_requerimientos_destino_bodega` (`Destino_Bodega_Id`,`Estado`),
  KEY `idx_requerimientos_usuario_solicita` (`Usuario_Solicita_Id`,`Estado`),
  KEY `idx_requerimientos_usuario_despacha` (`Usuario_Despacha_Id`,`Fecha_Despacho`),
  CONSTRAINT `fk_requerimientos_usuario_despacha` FOREIGN KEY (`Usuario_Despacha_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT,
  CONSTRAINT `requerimientos_ibfk_1` FOREIGN KEY (`Usuario_Solicita_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT,
  CONSTRAINT `requerimientos_ibfk_2` FOREIGN KEY (`Origen_Bodega_Id`) REFERENCES `Bodegas` (`Bodega_Id`) ON DELETE RESTRICT,
  CONSTRAINT `requerimientos_ibfk_3` FOREIGN KEY (`Destino_Bodega_Id`) REFERENCES `Bodegas` (`Bodega_Id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_bodegas_diferentes_req` CHECK ((`Origen_Bodega_Id` <> `Destino_Bodega_Id`)),
  CONSTRAINT `chk_despacho_consistente` CHECK (((`Estado` <> _utf8mb4'Completado') or ((`Estado` = _utf8mb4'Completado') and (`Usuario_Despacha_Id` is not null) and (`Fecha_Despacho` is not null)))),
  CONSTRAINT `chk_estado_requerimiento_valido` CHECK ((`Estado` in (_utf8mb4'Pendiente',_utf8mb4'Aprobado',_utf8mb4'En_Despacho',_utf8mb4'Completado',_utf8mb4'Parcialmente_Despachado',_utf8mb4'Rechazado',_utf8mb4'Cancelado')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- PASO 3: Crear tabla detalle requerimientos
CREATE TABLE `requerimientos_detalle` (
  `Requerimiento_Detalle_Id` int NOT NULL AUTO_INCREMENT,
  `Requerimiento_Id` int NOT NULL,
  `Item_Id` int NOT NULL,
  `Item_Presentaciones_Id` int DEFAULT NULL,
  `Cantidad_Solicitada` decimal(14,4) NOT NULL,
  `Cantidad_Solicitada_Presentacion` decimal(14,4) DEFAULT NULL,
  `Cantidad_Despachada` decimal(14,4) DEFAULT '0.0000',
  `Cantidad_Despachada_Presentacion` decimal(14,4) DEFAULT NULL,
  `Es_Requerimiento_Por_Presentacion` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Requerimiento_Detalle_Id`),
  UNIQUE KEY `uk_requerimiento_item` (`Requerimiento_Id`,`Item_Id`),
  KEY `idx_requerimientos_detalle_presentacion` (`Item_Presentaciones_Id`),
  KEY `idx_requerimientos_detalle_item` (`Item_Id`,`Requerimiento_Id`),
  CONSTRAINT `fk_requerimientos_detalle_presentacion` FOREIGN KEY (`Item_Presentaciones_Id`) REFERENCES `Items_Presentaciones` (`Item_Presentaciones_Id`) ON DELETE RESTRICT,
  CONSTRAINT `requerimientos_detalle_ibfk_1` FOREIGN KEY (`Requerimiento_Id`) REFERENCES `requerimientos` (`Requerimiento_Id`) ON DELETE CASCADE,
  CONSTRAINT `requerimientos_detalle_ibfk_2` FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_cantidad_despachada_presentacion_valida` CHECK (((`Cantidad_Despachada_Presentacion` is null) or ((`Cantidad_Despachada_Presentacion` >= 0) and (`Cantidad_Despachada_Presentacion` <= `Cantidad_Solicitada_Presentacion`)))),
  CONSTRAINT `chk_cantidad_despachada_valida` CHECK (((`Cantidad_Despachada` >= 0) and (`Cantidad_Despachada` <= `Cantidad_Solicitada`))),
  CONSTRAINT `chk_cantidad_solicitada_positiva` CHECK ((`Cantidad_Solicitada` > 0)),
  CONSTRAINT `chk_cantidad_solicitada_presentacion_positiva` CHECK (((`Cantidad_Solicitada_Presentacion` is null) or (`Cantidad_Solicitada_Presentacion` > 0))),
  CONSTRAINT `chk_requerimiento_base_limpio` CHECK (((`Es_Requerimiento_Por_Presentacion` = 1) or ((`Es_Requerimiento_Por_Presentacion` = 0) and (`Item_Presentaciones_Id` is null) and (`Cantidad_Solicitada_Presentacion` is null) and (`Cantidad_Despachada_Presentacion` is null)))),
  CONSTRAINT `chk_requerimiento_presentacion_completo` CHECK (((`Es_Requerimiento_Por_Presentacion` = 0) or ((`Es_Requerimiento_Por_Presentacion` = 1) and (`Item_Presentaciones_Id` is not null) and (`Cantidad_Solicitada_Presentacion` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- PASO 4: Crear triggers
-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS tr_actualizar_estado_requerimiento;

-- Trigger para actualizar automáticamente el estado del requerimiento
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

-- PASO 5: Insertar datos de prueba (opcional)
INSERT INTO requerimientos (
    Usuario_Solicita_Id, 
    Origen_Bodega_Id, 
    Destino_Bodega_Id, 
    Estado, 
    Observaciones
) VALUES 
(1, 1, 2, 'Pendiente', 'Requerimiento de prueba inicial'),
(1, 2, 1, 'Aprobado', 'Segundo requerimiento de prueba');

SELECT 'Migración de requerimientos completada exitosamente' as resultado;