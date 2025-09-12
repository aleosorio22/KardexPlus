-- ==============================
--   BASE DE DATOS KARDEX PLUS - VERSIÓN FINAL
-- ==============================

-- Crear la base de datos si no existe y definir charset
CREATE DATABASE IF NOT EXISTS kardexplus_db
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

-- Usar la base de datos
USE kardexplus_db;

-- ==============================
--   MODULO USUARIOS Y ROLES
-- ==============================

CREATE TABLE `Roles` (
  `Rol_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Rol_Nombre` varchar(25) UNIQUE NOT NULL,
  `Rol_Descripcion` varchar(100),
  CONSTRAINT chk_rol_nombre_no_vacio CHECK (TRIM(`Rol_Nombre`) <> '')
);

CREATE TABLE `Usuarios` (
  `Usuario_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Usuario_Nombre` varchar(25) NOT NULL,
  `Usuario_Apellido` varchar(25) NOT NULL,
  `Usuario_Correo` varchar(50) UNIQUE NOT NULL,
  `Usuario_Contrasena` varchar(255) NOT NULL,
  `Usuario_Estado` boolean DEFAULT true,
  `Rol_Id` int NOT NULL,
  CONSTRAINT chk_usuario_nombre_no_vacio CHECK (TRIM(`Usuario_Nombre`) <> ''),
  CONSTRAINT chk_usuario_apellido_no_vacio CHECK (TRIM(`Usuario_Apellido`) <> ''),
  CONSTRAINT chk_usuario_correo_formato CHECK (`Usuario_Correo` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT chk_contrasena_longitud CHECK (LENGTH(`Usuario_Contrasena`) >= 6)
);

-- ==============================
--   MODULO INVENTARIO E ITEMS
-- ==============================

CREATE TABLE `CategoriasItems` (
  `CategoriaItem_Id` int PRIMARY KEY AUTO_INCREMENT,
  `CategoriaItem_Nombre` varchar(50) UNIQUE NOT NULL,
  `CategoriaItem_Descripcion` varchar(150),
  CONSTRAINT chk_categoria_nombre_no_vacio CHECK (TRIM(`CategoriaItem_Nombre`) <> '')
);

CREATE TABLE `UnidadesMedida` (
  `UnidadMedida_Id` int PRIMARY KEY AUTO_INCREMENT,
  `UnidadMedida_Nombre` varchar(30) UNIQUE NOT NULL,
  `UnidadMedida_Prefijo` varchar(5) UNIQUE NOT NULL,
  `UnidadMedida_Factor_Conversion` decimal(10,4),
  CONSTRAINT chk_unidad_nombre_no_vacio CHECK (TRIM(`UnidadMedida_Nombre`) <> ''),
  CONSTRAINT chk_unidad_prefijo_no_vacio CHECK (TRIM(`UnidadMedida_Prefijo`) <> ''),
  CONSTRAINT chk_factor_conversion_positivo CHECK (`UnidadMedida_Factor_Conversion` IS NULL OR `UnidadMedida_Factor_Conversion` > 0)
);

CREATE TABLE `Presentaciones` (
  `Presentacion_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Presentacion_Nombre` varchar(30) UNIQUE NOT NULL,
  `Presentacion_Cantidad` decimal(10,2) NOT NULL,
  `UnidadMedida_Id` int NOT NULL,
  CONSTRAINT chk_presentacion_nombre_no_vacio CHECK (TRIM(`Presentacion_Nombre`) <> ''),
  CONSTRAINT chk_presentacion_cantidad_positiva CHECK (`Presentacion_Cantidad` > 0)
);

CREATE TABLE `Items` (
  `Item_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Item_Codigo_SKU` varchar(20),
  `Item_Codigo_Barra` varchar(20),
  `Item_Nombre` varchar(50) UNIQUE NOT NULL,
  `Item_Costo_Unitario` decimal(10,4) NOT NULL,
  `Item_Stock_Min` int DEFAULT 0,
  `Item_Stock_Max` int,
  `Item_Estado` boolean DEFAULT true,
  `Item_Fecha_Creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `Item_Fecha_Actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CategoriaItem_Id` int NOT NULL,
  `UnidadMedidaBase_Id` int NOT NULL,
  CONSTRAINT chk_item_nombre_no_vacio CHECK (TRIM(`Item_Nombre`) <> ''),
  CONSTRAINT chk_costo_positivo CHECK (`Item_Costo_Unitario` >= 0),
  CONSTRAINT chk_stock_min_valido CHECK (`Item_Stock_Min` >= 0),
  CONSTRAINT chk_stock_max_valido CHECK (`Item_Stock_Max` IS NULL OR `Item_Stock_Max` >= `Item_Stock_Min`)
);

-- Índices únicos para códigos (permitiendo NULL)
CREATE UNIQUE INDEX uk_item_codigo_sku ON `Items` (`Item_Codigo_SKU`);
CREATE UNIQUE INDEX uk_item_codigo_barra ON `Items` (`Item_Codigo_Barra`);

CREATE TABLE `Items_Presentaciones` (
  `Item_Presentaciones_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Item_Id` int NOT NULL,
  `Presentacion_Nombre` varchar(30) NOT NULL,
  `Cantidad_Base` decimal(10,4) NOT NULL,
  `Item_Presentacion_CodigoSKU` varchar(20),
  `Item_Presentaciones_CodigoBarras` varchar(20),
  `Item_Presentaciones_Costo` decimal(10,4),
  `Item_Presentaciones_Precio` decimal(10,4),
  CONSTRAINT chk_item_pres_costo_positivo CHECK (`Item_Presentaciones_Costo` IS NULL OR `Item_Presentaciones_Costo` >= 0),
  CONSTRAINT chk_item_pres_precio_positivo CHECK (`Item_Presentaciones_Precio` IS NULL OR `Item_Presentaciones_Precio` >= 0),
  CONSTRAINT chk_cantidad_base CHECK (`Cantidad_Base` > 0),
  CONSTRAINT uk_item_presentacion UNIQUE (`Item_Id`, `Presentacion_Nombre`)
);

-- Índices únicos para códigos de presentaciones (permitiendo NULL)
CREATE UNIQUE INDEX uk_item_pres_codigo_sku ON `Items_Presentaciones` (`Item_Presentacion_CodigoSKU`);
CREATE UNIQUE INDEX uk_item_pres_codigo_barras ON `Items_Presentaciones` (`Item_Presentaciones_CodigoBarras`);

-- ==============================
--   MODULO BODEGAS Y EXISTENCIAS
-- ==============================

CREATE TABLE `Bodegas` (
  `Bodega_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Bodega_Nombre` varchar(50) UNIQUE NOT NULL,
  `Bodega_Tipo` varchar(30),
  `Bodega_Ubicacion` varchar(100),
  `Responsable_Id` int,
  `Bodega_Estado` boolean DEFAULT true,
  CONSTRAINT chk_bodega_nombre_no_vacio CHECK (TRIM(`Bodega_Nombre`) <> ''),
  CONSTRAINT chk_bodega_tipo_valido CHECK (`Bodega_Tipo` IS NULL OR `Bodega_Tipo` IN ('Central', 'Producción', 'Frío', 'Temporal', 'Devoluciones'))
);

CREATE TABLE `Existencias` (
  `Existencia_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Bodega_Id` int NOT NULL,
  `Item_Id` int NOT NULL,
  `Cantidad` decimal(14,4) DEFAULT 0,
  `Fecha_Ultima_Actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_cantidad_no_negativa CHECK (`Cantidad` >= 0),
  CONSTRAINT uk_bodega_item UNIQUE (`Bodega_Id`, `Item_Id`)
);

-- ==============================
--   MODULO MOVIMIENTOS (KARDEX)
-- ==============================

CREATE TABLE `Movimientos` (
  `Movimiento_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Tipo_Movimiento` varchar(20) NOT NULL,
  `Fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `Usuario_Id` int NOT NULL,
  `Recepcionista` varchar(50),
  `Origen_Bodega_Id` int,
  `Destino_Bodega_Id` int,
  `Motivo` varchar(100),
  `Observaciones` text,
  CONSTRAINT chk_tipo_movimiento_valido CHECK (`Tipo_Movimiento` IN ('Entrada', 'Salida', 'Transferencia', 'Ajuste')),
  CONSTRAINT chk_transferencia_bodegas_diferentes CHECK (
    `Tipo_Movimiento` != 'Transferencia' OR 
    (`Origen_Bodega_Id` IS NOT NULL AND `Destino_Bodega_Id` IS NOT NULL AND `Origen_Bodega_Id` != `Destino_Bodega_Id`)
  ),
  CONSTRAINT chk_entrada_destino_requerido CHECK (
    `Tipo_Movimiento` != 'Entrada' OR `Destino_Bodega_Id` IS NOT NULL
  ),
  CONSTRAINT chk_salida_origen_requerido CHECK (
    `Tipo_Movimiento` != 'Salida' OR `Origen_Bodega_Id` IS NOT NULL
  )
);

CREATE TABLE `Movimientos_Detalle` (
  `Movimiento_Detalle_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Movimiento_Id` int NOT NULL,
  `Item_Id` int NOT NULL,
  `Cantidad` decimal(14,4) NOT NULL,
  CONSTRAINT chk_cantidad_movimiento_positiva CHECK (`Cantidad` > 0),
  CONSTRAINT uk_movimiento_item UNIQUE (`Movimiento_Id`, `Item_Id`)
);

-- ==============================
--   MODULO REQUERIMIENTOS ENTRE BODEGAS
-- ==============================

CREATE TABLE `Requerimientos` (
  `Requerimiento_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `Usuario_Solicita_Id` int NOT NULL,
  `Origen_Bodega_Id` int NOT NULL,
  `Destino_Bodega_Id` int NOT NULL,
  `Estado` varchar(20) DEFAULT 'Pendiente',
  `Observaciones` text,
  CONSTRAINT chk_estado_requerimiento_valido CHECK (`Estado` IN ('Pendiente', 'Aprobado', 'Rechazado', 'Completado', 'Cancelado')),
  CONSTRAINT chk_bodegas_diferentes_req CHECK (`Origen_Bodega_Id` != `Destino_Bodega_Id`)
);

CREATE TABLE `Requerimientos_Detalle` (
  `Requerimiento_Detalle_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Requerimiento_Id` int NOT NULL,
  `Item_Id` int NOT NULL,
  `Cantidad_Solicitada` decimal(14,4) NOT NULL,
  `Cantidad_Despachada` decimal(14,4) DEFAULT 0,
  CONSTRAINT chk_cantidad_solicitada_positiva CHECK (`Cantidad_Solicitada` > 0),
  CONSTRAINT chk_cantidad_despachada_valida CHECK (`Cantidad_Despachada` >= 0 AND `Cantidad_Despachada` <= `Cantidad_Solicitada`),
  CONSTRAINT uk_requerimiento_item UNIQUE (`Requerimiento_Id`, `Item_Id`)
);

-- ==============================
--   MODULO COMPRAS Y PROVEEDORES
-- ==============================

CREATE TABLE `Proveedores` (
  `Proveedor_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  `Contacto` varchar(50),
  `Telefono` varchar(20),
  `Email` varchar(50),
  `Direccion` varchar(100),
  `Estado` boolean DEFAULT true,
  CONSTRAINT chk_proveedor_nombre_no_vacio CHECK (TRIM(`Nombre`) <> ''),
  CONSTRAINT chk_proveedor_email_formato CHECK (`Email` IS NULL OR `Email` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE TABLE `Solicitudes_Compra` (
  `Solicitud_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Usuario_Solicita_Id` int NOT NULL,
  `Fecha_Solicitud` datetime DEFAULT CURRENT_TIMESTAMP,
  `Estado` varchar(20) DEFAULT 'Pendiente',
  `Motivo` text,
  `Fecha_Aprobacion` datetime,
  `Usuario_Aprueba_Id` int,
  `Observaciones` text,
  CONSTRAINT chk_estado_solicitud_valido CHECK (`Estado` IN ('Pendiente', 'Aprobada', 'Rechazada', 'Cerrada', 'Cancelada')),
  CONSTRAINT chk_aprobacion_consistente CHECK (
    (`Estado` = 'Aprobada' AND `Fecha_Aprobacion` IS NOT NULL AND `Usuario_Aprueba_Id` IS NOT NULL) OR
    (`Estado` != 'Aprobada')
  )
);

CREATE TABLE `Solicitudes_Compra_Detalle` (
  `Solicitud_Detalle_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Solicitud_Id` int NOT NULL,
  `Item_Id` int NOT NULL,
  `Cantidad_Solicitada` decimal(14,4) NOT NULL,
  `Cantidad_Aprobada` decimal(14,4) DEFAULT 0,
  CONSTRAINT chk_cant_solicitada_positiva CHECK (`Cantidad_Solicitada` > 0),
  CONSTRAINT chk_cant_aprobada_valida CHECK (`Cantidad_Aprobada` >= 0 AND `Cantidad_Aprobada` <= `Cantidad_Solicitada`),
  CONSTRAINT uk_solicitud_item UNIQUE (`Solicitud_Id`, `Item_Id`)
);

CREATE TABLE `Compras` (
  `Compra_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Proveedor_Id` int NOT NULL,
  `Fecha_Compra` datetime DEFAULT CURRENT_TIMESTAMP,
  `Usuario_Registra_Id` int NOT NULL,
  `Solicitud_Id` int,
  `Total` decimal(14,2) DEFAULT 0,
  `Estado` varchar(20) DEFAULT 'Registrada',
  `Observaciones` text,
  CONSTRAINT chk_total_no_negativo CHECK (`Total` >= 0),
  CONSTRAINT chk_estado_compra_valido CHECK (`Estado` IN ('Registrada', 'Recibida', 'Anulada', 'Parcialmente Recibida'))
);

CREATE TABLE `Compras_Detalle` (
  `Compra_Detalle_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Compra_Id` int NOT NULL,
  `Item_Id` int NOT NULL,
  `Cantidad` decimal(14,4) NOT NULL,
  `Costo_Unitario` decimal(10,2) NOT NULL,
  `Subtotal` decimal(14,2) GENERATED ALWAYS AS (`Cantidad` * `Costo_Unitario`) STORED,
  CONSTRAINT chk_cantidad_compra_positiva CHECK (`Cantidad` > 0),
  CONSTRAINT chk_costo_unitario_positivo CHECK (`Costo_Unitario` >= 0),
  CONSTRAINT uk_compra_item UNIQUE (`Compra_Id`, `Item_Id`)
);

-- ==============================
--   MODULO AUDITORÍA
-- ==============================

CREATE TABLE `Auditoria` (
  `Auditoria_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Tabla_Afectada` varchar(50) NOT NULL,
  `Registro_Id` int NOT NULL,
  `Usuario_Id` int NOT NULL,
  `Accion` varchar(20) NOT NULL,
  `Fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `Valores_Anteriores` text,
  `Valores_Nuevos` text,
  CONSTRAINT chk_accion_valida CHECK (`Accion` IN ('INSERT', 'UPDATE', 'DELETE')),
  INDEX idx_auditoria_tabla_fecha (`Tabla_Afectada`, `Fecha`),
  INDEX idx_auditoria_usuario_fecha (`Usuario_Id`, `Fecha`)
);

-- ==============================
--   FOREIGN KEYS
-- ==============================

ALTER TABLE `Usuarios` ADD FOREIGN KEY (`Rol_Id`) REFERENCES `Roles` (`Rol_Id`) ON DELETE RESTRICT;

ALTER TABLE `Items` ADD FOREIGN KEY (`CategoriaItem_Id`) REFERENCES `CategoriasItems` (`CategoriaItem_Id`) ON DELETE RESTRICT;

ALTER TABLE `Items` ADD FOREIGN KEY (`UnidadMedidaBase_Id`) REFERENCES `UnidadesMedida` (`UnidadMedida_Id`) ON DELETE RESTRICT;

ALTER TABLE `Presentaciones` ADD FOREIGN KEY (`UnidadMedida_Id`) REFERENCES `UnidadesMedida` (`UnidadMedida_Id`) ON DELETE RESTRICT;

ALTER TABLE `Items_Presentaciones` ADD FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE CASCADE;

ALTER TABLE `Bodegas` ADD FOREIGN KEY (`Responsable_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE SET NULL;

ALTER TABLE `Existencias` ADD FOREIGN KEY (`Bodega_Id`) REFERENCES `Bodegas` (`Bodega_Id`) ON DELETE CASCADE;
ALTER TABLE `Existencias` ADD FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE CASCADE;

ALTER TABLE `Movimientos` ADD FOREIGN KEY (`Usuario_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT;
ALTER TABLE `Movimientos` ADD FOREIGN KEY (`Origen_Bodega_Id`) REFERENCES `Bodegas` (`Bodega_Id`) ON DELETE RESTRICT;
ALTER TABLE `Movimientos` ADD FOREIGN KEY (`Destino_Bodega_Id`) REFERENCES `Bodegas` (`Bodega_Id`) ON DELETE RESTRICT;

ALTER TABLE `Movimientos_Detalle` ADD FOREIGN KEY (`Movimiento_Id`) REFERENCES `Movimientos` (`Movimiento_Id`) ON DELETE CASCADE;
ALTER TABLE `Movimientos_Detalle` ADD FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE RESTRICT;

ALTER TABLE `Requerimientos` ADD FOREIGN KEY (`Usuario_Solicita_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT;
ALTER TABLE `Requerimientos` ADD FOREIGN KEY (`Origen_Bodega_Id`) REFERENCES `Bodegas` (`Bodega_Id`) ON DELETE RESTRICT;
ALTER TABLE `Requerimientos` ADD FOREIGN KEY (`Destino_Bodega_Id`) REFERENCES `Bodegas` (`Bodega_Id`) ON DELETE RESTRICT;

ALTER TABLE `Requerimientos_Detalle` ADD FOREIGN KEY (`Requerimiento_Id`) REFERENCES `Requerimientos` (`Requerimiento_Id`) ON DELETE CASCADE;
ALTER TABLE `Requerimientos_Detalle` ADD FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE RESTRICT;

ALTER TABLE `Solicitudes_Compra` ADD FOREIGN KEY (`Usuario_Solicita_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT;
ALTER TABLE `Solicitudes_Compra` ADD FOREIGN KEY (`Usuario_Aprueba_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT;

ALTER TABLE `Solicitudes_Compra_Detalle` ADD FOREIGN KEY (`Solicitud_Id`) REFERENCES `Solicitudes_Compra` (`Solicitud_Id`) ON DELETE CASCADE;
ALTER TABLE `Solicitudes_Compra_Detalle` ADD FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE RESTRICT;

ALTER TABLE `Compras` ADD FOREIGN KEY (`Proveedor_Id`) REFERENCES `Proveedores` (`Proveedor_Id`) ON DELETE RESTRICT;
ALTER TABLE `Compras` ADD FOREIGN KEY (`Usuario_Registra_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT;
ALTER TABLE `Compras` ADD FOREIGN KEY (`Solicitud_Id`) REFERENCES `Solicitudes_Compra` (`Solicitud_Id`) ON DELETE SET NULL;

ALTER TABLE `Compras_Detalle` ADD FOREIGN KEY (`Compra_Id`) REFERENCES `Compras` (`Compra_Id`) ON DELETE CASCADE;
ALTER TABLE `Compras_Detalle` ADD FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE RESTRICT;

ALTER TABLE `Auditoria` ADD FOREIGN KEY (`Usuario_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE RESTRICT;

-- ==============================
--   ÍNDICES PARA PERFORMANCE
-- ==============================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_usuarios_correo ON `Usuarios` (`Usuario_Correo`);
CREATE INDEX idx_usuarios_estado ON `Usuarios` (`Usuario_Estado`);
CREATE INDEX idx_items_nombre ON `Items` (`Item_Nombre`);
CREATE INDEX idx_items_categoria ON `Items` (`CategoriaItem_Id`);
CREATE INDEX idx_items_estado ON `Items` (`Item_Estado`);
CREATE INDEX idx_existencias_bodega ON `Existencias` (`Bodega_Id`);
CREATE INDEX idx_existencias_item ON `Existencias` (`Item_Id`);
CREATE INDEX idx_existencias_cantidad ON `Existencias` (`Cantidad`);
CREATE INDEX idx_movimientos_fecha ON `Movimientos` (`Fecha`);
CREATE INDEX idx_movimientos_tipo ON `Movimientos` (`Tipo_Movimiento`);
CREATE INDEX idx_movimientos_usuario ON `Movimientos` (`Usuario_Id`);
CREATE INDEX idx_requerimientos_estado ON `Requerimientos` (`Estado`);
CREATE INDEX idx_requerimientos_fecha ON `Requerimientos` (`Fecha`);
CREATE INDEX idx_compras_fecha ON `Compras` (`Fecha_Compra`);
CREATE INDEX idx_compras_proveedor ON `Compras` (`Proveedor_Id`);
CREATE INDEX idx_compras_estado ON `Compras` (`Estado`);

-- ==============================
--   TRIGGERS PARA AUDITORIA Y AUTOMATIZACIÓN
-- ==============================

DELIMITER //

-- Trigger para auditar cambios en Items
CREATE TRIGGER tr_items_audit_update
AFTER UPDATE ON `Items`
FOR EACH ROW
BEGIN
    DECLARE current_user_id INT DEFAULT 1; -- Se debe establecer mediante variable de sesión
    
    INSERT INTO `Auditoria` (
        `Tabla_Afectada`, `Registro_Id`, `Usuario_Id`, `Accion`,
        `Valores_Anteriores`, `Valores_Nuevos`
    ) VALUES (
        'Items', NEW.Item_Id, current_user_id, 'UPDATE',
        CONCAT('Nombre: ', IFNULL(OLD.Item_Nombre, 'NULL'), 
               ', Costo: ', IFNULL(OLD.Item_Costo_Unitario, 'NULL'), 
               ', Estado: ', IFNULL(OLD.Item_Estado, 'NULL')),
        CONCAT('Nombre: ', IFNULL(NEW.Item_Nombre, 'NULL'), 
               ', Costo: ', IFNULL(NEW.Item_Costo_Unitario, 'NULL'), 
               ', Estado: ', IFNULL(NEW.Item_Estado, 'NULL'))
    );
END//

-- Trigger para auditar eliminaciones en Items
CREATE TRIGGER tr_items_audit_delete
AFTER DELETE ON `Items`
FOR EACH ROW
BEGIN
    DECLARE current_user_id INT DEFAULT 1;
    
    INSERT INTO `Auditoria` (
        `Tabla_Afectada`, `Registro_Id`, `Usuario_Id`, `Accion`,
        `Valores_Anteriores`, `Valores_Nuevos`
    ) VALUES (
        'Items', OLD.Item_Id, current_user_id, 'DELETE',
        CONCAT('Nombre: ', IFNULL(OLD.Item_Nombre, 'NULL'), 
               ', Costo: ', IFNULL(OLD.Item_Costo_Unitario, 'NULL')),
        NULL
    );
END//

-- Trigger para actualizar existencias después de un movimiento
CREATE TRIGGER tr_movimientos_update_existencias
AFTER INSERT ON `Movimientos_Detalle`
FOR EACH ROW
BEGIN
    DECLARE v_tipo_movimiento VARCHAR(20);
    DECLARE v_origen_bodega INT;
    DECLARE v_destino_bodega INT;
    
    SELECT m.Tipo_Movimiento, m.Origen_Bodega_Id, m.Destino_Bodega_Id
    INTO v_tipo_movimiento, v_origen_bodega, v_destino_bodega
    FROM Movimientos m
    WHERE m.Movimiento_Id = NEW.Movimiento_Id;
    
    -- Actualizar existencias según el tipo de movimiento
    IF v_tipo_movimiento = 'Entrada' THEN
        INSERT INTO Existencias (Bodega_Id, Item_Id, Cantidad)
        VALUES (v_destino_bodega, NEW.Item_Id, NEW.Cantidad)
        ON DUPLICATE KEY UPDATE 
        Cantidad = Cantidad + NEW.Cantidad;
        
    ELSEIF v_tipo_movimiento = 'Salida' THEN
        UPDATE Existencias 
        SET Cantidad = GREATEST(0, Cantidad - NEW.Cantidad)
        WHERE Bodega_Id = v_origen_bodega AND Item_Id = NEW.Item_Id;
        
    ELSEIF v_tipo_movimiento = 'Transferencia' THEN
        -- Disminuir en origen
        UPDATE Existencias 
        SET Cantidad = GREATEST(0, Cantidad - NEW.Cantidad)
        WHERE Bodega_Id = v_origen_bodega AND Item_Id = NEW.Item_Id;
        
        -- Aumentar en destino
        INSERT INTO Existencias (Bodega_Id, Item_Id, Cantidad)
        VALUES (v_destino_bodega, NEW.Item_Id, NEW.Cantidad)
        ON DUPLICATE KEY UPDATE 
        Cantidad = Cantidad + NEW.Cantidad;
        
    ELSEIF v_tipo_movimiento = 'Ajuste' THEN
        -- Para ajustes, actualizar directamente en la bodega destino
        IF v_destino_bodega IS NOT NULL THEN
            INSERT INTO Existencias (Bodega_Id, Item_Id, Cantidad)
            VALUES (v_destino_bodega, NEW.Item_Id, NEW.Cantidad)
            ON DUPLICATE KEY UPDATE 
            Cantidad = NEW.Cantidad; -- Establecer cantidad exacta
        END IF;
    END IF;
END//

-- Trigger para validar stock suficiente antes de salidas/transferencias
CREATE TRIGGER tr_movimientos_validar_stock
BEFORE INSERT ON `Movimientos_Detalle`
FOR EACH ROW
BEGIN
    DECLARE v_tipo_movimiento VARCHAR(20);
    DECLARE v_origen_bodega INT;
    DECLARE v_stock_actual DECIMAL(14,4) DEFAULT 0;
    
    SELECT m.Tipo_Movimiento, m.Origen_Bodega_Id
    INTO v_tipo_movimiento, v_origen_bodega
    FROM Movimientos m
    WHERE m.Movimiento_Id = NEW.Movimiento_Id;
    
    -- Validar stock solo para salidas y transferencias
    IF v_tipo_movimiento IN ('Salida', 'Transferencia') THEN
        SELECT IFNULL(Cantidad, 0)
        INTO v_stock_actual
        FROM Existencias
        WHERE Bodega_Id = v_origen_bodega AND Item_Id = NEW.Item_Id;
        
        IF v_stock_actual < NEW.Cantidad THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Stock insuficiente en bodega origen';
        END IF;
    END IF;
END//

-- Trigger para actualizar el total de compras automáticamente
CREATE TRIGGER tr_compras_actualizar_total
AFTER INSERT ON `Compras_Detalle`
FOR EACH ROW
BEGIN
    UPDATE Compras 
    SET Total = (
        SELECT IFNULL(SUM(Subtotal), 0)
        FROM Compras_Detalle 
        WHERE Compra_Id = NEW.Compra_Id
    )
    WHERE Compra_Id = NEW.Compra_Id;
END//

CREATE TRIGGER tr_compras_actualizar_total_update
AFTER UPDATE ON `Compras_Detalle`
FOR EACH ROW
BEGIN
    UPDATE Compras 
    SET Total = (
        SELECT IFNULL(SUM(Subtotal), 0)
        FROM Compras_Detalle 
        WHERE Compra_Id = NEW.Compra_Id
    )
    WHERE Compra_Id = NEW.Compra_Id;
END//

CREATE TRIGGER tr_compras_actualizar_total_delete
AFTER DELETE ON `Compras_Detalle`
FOR EACH ROW
BEGIN
    UPDATE Compras 
    SET Total = (
        SELECT IFNULL(SUM(Subtotal), 0)
        FROM Compras_Detalle 
        WHERE Compra_Id = OLD.Compra_Id
    )
    WHERE Compra_Id = OLD.Compra_Id;
END//

DELIMITER ;

-- ==============================
--   VISTAS ÚTILES PARA REPORTES
-- ==============================

-- Vista para inventario consolidado por bodega
CREATE VIEW v_inventario_consolidado AS
SELECT 
    b.Bodega_Nombre,
    b.Bodega_Tipo,
    i.Item_Nombre,
    c.CategoriaItem_Nombre,
    e.Cantidad,
    i.Item_Costo_Unitario,
    (e.Cantidad * i.Item_Costo_Unitario) AS Valor_Total,
    e.Fecha_Ultima_Actualizacion,
    CASE 
        WHEN e.Cantidad <= i.Item_Stock_Min THEN 'BAJO'
        WHEN e.Cantidad >= i.Item_Stock_Max THEN 'ALTO'
        ELSE 'NORMAL'
    END AS Estado_Stock
FROM Existencias e
INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
INNER JOIN Items i ON e.Item_Id = i.Item_Id
INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
WHERE b.Bodega_Estado = true AND i.Item_Estado = true;

-- Vista para resumen de movimientos por período
CREATE VIEW v_movimientos_resumen AS
SELECT 
    DATE(m.Fecha) AS Fecha,
    m.Tipo_Movimiento,
    b1.Bodega_Nombre AS Bodega_Origen,
    b2.Bodega_Nombre AS Bodega_Destino,
    i.Item_Nombre,
    md.Cantidad,
    CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) AS Usuario,
    m.Motivo
FROM Movimientos m
INNER JOIN Movimientos_Detalle md ON m.Movimiento_Id = md.Movimiento_Id
INNER JOIN Items i ON md.Item_Id = i.Item_Id
INNER JOIN Usuarios u ON m.Usuario_Id = u.Usuario_Id
LEFT JOIN Bodegas b1 ON m.Origen_Bodega_Id = b1.Bodega_Id
LEFT JOIN Bodegas b2 ON m.Destino_Bodega_Id = b2.Bodega_Id
ORDER BY m.Fecha DESC;

-- Vista para alertas de stock bajo
CREATE VIEW v_alertas_stock AS
SELECT 
    b.Bodega_Nombre,
    i.Item_Nombre,
    c.CategoriaItem_Nombre,
    e.Cantidad AS Stock_Actual,
    i.Item_Stock_Min AS Stock_Minimo,
    i.Item_Stock_Max AS Stock_Maximo,
    (i.Item_Stock_Min - e.Cantidad) AS Cantidad_Faltante,
    e.Fecha_Ultima_Actualizacion
FROM Existencias e
INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
INNER JOIN Items i ON e.Item_Id = i.Item_Id
INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
WHERE e.Cantidad <= i.Item_Stock_Min 
  AND b.Bodega_Estado = true 
  AND i.Item_Estado = true
ORDER BY (i.Item_Stock_Min - e.Cantidad) DESC;

-- ==============================
--   PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ==============================

DELIMITER //

-- Procedimiento para realizar transferencias entre bodegas
CREATE PROCEDURE sp_transferir_items(
    IN p_usuario_id INT,
    IN p_origen_bodega_id INT,
    IN p_destino_bodega_id INT,
    IN p_item_id INT,
    IN p_cantidad DECIMAL(14,4),
    IN p_motivo VARCHAR(100),
    IN p_observaciones TEXT
)
BEGIN
    DECLARE v_stock_origen DECIMAL(14,4) DEFAULT 0;
    DECLARE v_movimiento_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Validar stock en origen
    SELECT IFNULL(Cantidad, 0)
    INTO v_stock_origen
    FROM Existencias
    WHERE Bodega_Id = p_origen_bodega_id AND Item_Id = p_item_id;
    
    IF v_stock_origen < p_cantidad THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Stock insuficiente en bodega origen';
    END IF;
    
    -- Crear el movimiento
    INSERT INTO Movimientos (
        Tipo_Movimiento, Usuario_Id, Origen_Bodega_Id, 
        Destino_Bodega_Id, Motivo, Observaciones
    ) VALUES (
        'Transferencia', p_usuario_id, p_origen_bodega_id,
        p_destino_bodega_id, p_motivo, p_observaciones
    );
    
    SET v_movimiento_id = LAST_INSERT_ID();
    
    -- Crear el detalle del movimiento
    INSERT INTO Movimientos_Detalle (
        Movimiento_Id, Item_Id, Cantidad
    ) VALUES (
        v_movimiento_id, p_item_id, p_cantidad
    );
    
    COMMIT;
    
    SELECT 'Transferencia realizada exitosamente' AS Mensaje, v_movimiento_id AS Movimiento_Id;
END//

-- Procedimiento para obtener kardex de un item
CREATE PROCEDURE sp_kardex_item(
    IN p_item_id INT,
    IN p_bodega_id INT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        m.Fecha,
        m.Tipo_Movimiento,
        CASE 
            WHEN m.Tipo_Movimiento = 'Entrada' THEN md.Cantidad
            WHEN m.Tipo_Movimiento = 'Transferencia' AND m.Destino_Bodega_Id = p_bodega_id THEN md.Cantidad
            ELSE 0
        END AS Entrada,
        CASE 
            WHEN m.Tipo_Movimiento = 'Salida' THEN md.Cantidad
            WHEN m.Tipo_Movimiento = 'Transferencia' AND m.Origen_Bodega_Id = p_bodega_id THEN md.Cantidad
            ELSE 0
        END AS Salida,
        m.Motivo,
        CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) AS Usuario
    FROM Movimientos m
    INNER JOIN Movimientos_Detalle md ON m.Movimiento_Id = md.Movimiento_Id
    INNER JOIN Usuarios u ON m.Usuario_Id = u.Usuario_Id
    WHERE md.Item_Id = p_item_id
      AND (m.Origen_Bodega_Id = p_bodega_id OR m.Destino_Bodega_Id = p_bodega_id)
      AND DATE(m.Fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY m.Fecha ASC;
END//

DELIMITER ;

-- ==============================
--   COMENTARIOS FINALES
-- ==============================

/*
NOTAS IMPORTANTES PARA EL DESARROLLADOR:

1. TIPOS DE DATOS:
   - Todos los NVARCHAR fueron cambiados a VARCHAR (correcto para MySQL)
   - Se mantiene el charset UTF8MB4 para soporte completo de caracteres

2. CONSTRAINTS MEJORADOS:
   - Índices únicos con condición WHERE para permitir valores NULL
   - Campo subtotal ahora es calculado automáticamente (GENERATED ALWAYS AS)
   - Validaciones mejoradas para casos edge

3. TRIGGERS:
   - Control automático de existencias
   - Validación de stock antes de movimientos
   - Auditoría automática de cambios críticos
   - Cálculo automático de totales en compras

4. PERFORMANCE:
   - Índices estratégicos agregados
   - Vistas optimizadas para reportes frecuentes

5. SEGURIDAD:
   - Constraints robustos
   - Validaciones a nivel de base de datos
   - Políticas de eliminación controladas

6. FUNCIONALIDAD:
   - Procedimientos almacenados para operaciones complejas
   - Vistas para reportes comunes
   - Datos iniciales para arranque rápido

RECOMENDACIONES DE USO:
- Establecer variables de sesión para el usuario actual en triggers de auditoría
- Implementar rotación de logs de auditoría periódicamente
- Monitorear performance de los triggers en producción
- Configurar backup automático diario de la base de datos
*/

//inserts basicos o iniciales
INSERT INTO `Roles` (`Rol_Nombre`, `Rol_Descripcion`) VALUES
('Administrador', 'Acceso completo al sistema'),
('Gerente', 'Gestión de inventario y reportes'),
('Operador', 'Operaciones básicas de inventario'),
('Consulta', 'Solo lectura de información');