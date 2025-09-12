-- Script para actualizar la precisión decimal de los campos de costos 
-- Cambiar de DECIMAL(10,2) a DECIMAL(10,4) para mayor precisión en costos

-- ===== ACTUALIZAR TABLA ITEMS =====
-- Actualizar campo Item_Costo_Unitario en la tabla Items para soportar 4 decimales
ALTER TABLE Items 
MODIFY COLUMN Item_Costo_Unitario DECIMAL(10,4) NOT NULL 
COMMENT 'Costo unitario del item con precisión de 4 decimales';

-- Actualizar constraint para costo positivo en Items
ALTER TABLE Items 
DROP CONSTRAINT chk_costo_positivo;

ALTER TABLE Items 
ADD CONSTRAINT chk_costo_positivo 
CHECK (Item_Costo_Unitario >= 0);

-- ===== ACTUALIZAR TABLA ITEMS_PRESENTACIONES =====
-- Actualizar campo Cantidad_Base (ya debe estar en DECIMAL(10,4) pero por si acaso)
ALTER TABLE Items_Presentaciones 
MODIFY COLUMN Cantidad_Base DECIMAL(10,4) NOT NULL 
COMMENT 'Cantidad de unidades base que contiene esta presentación';

-- Actualizar campo Item_Presentaciones_Costo para soportar 4 decimales
ALTER TABLE Items_Presentaciones 
MODIFY COLUMN Item_Presentaciones_Costo DECIMAL(10,4) NULL 
COMMENT 'Costo específico de esta presentación con precisión de 4 decimales';

-- Actualizar campo Item_Presentaciones_Precio para soportar 4 decimales
ALTER TABLE Items_Presentaciones 
MODIFY COLUMN Item_Presentaciones_Precio DECIMAL(10,4) NULL 
COMMENT 'Precio específico de esta presentación con precisión de 4 decimales';

-- Verificar que los constraints sigan funcionando con la nueva precisión
ALTER TABLE Items_Presentaciones 
DROP CONSTRAINT chk_item_pres_costo_positivo;

ALTER TABLE Items_Presentaciones 
ADD CONSTRAINT chk_item_pres_costo_positivo 
CHECK (Item_Presentaciones_Costo IS NULL OR Item_Presentaciones_Costo >= 0);

ALTER TABLE Items_Presentaciones 
DROP CONSTRAINT chk_item_pres_precio_positivo;

ALTER TABLE Items_Presentaciones 
ADD CONSTRAINT chk_item_pres_precio_positivo 
CHECK (Item_Presentaciones_Precio IS NULL OR Item_Presentaciones_Precio >= 0);

-- Mostrar las estructuras actualizadas
DESCRIBE Items;
DESCRIBE Items_Presentaciones;
