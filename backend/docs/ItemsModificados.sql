-- 1. Eliminar restricciones que dependen de Presentaciones
ALTER TABLE Items_Presentaciones
DROP FOREIGN KEY fk_itempres_presentacion;

-- 2. Eliminar tabla Presentaciones
DROP TABLE IF EXISTS Presentaciones;

-- 3. Modificar tabla Items: agregar columna UnidadMedidaBase_Id
ALTER TABLE Items
ADD COLUMN UnidadMedidaBase_Id INT NOT NULL AFTER CategoriaItem_Id;

-- Crear FK hacia UnidadesMedida
SET SQL_SAFE_UPDATES = 0;

UPDATE Items
SET UnidadMedidaBase_Id = 1
WHERE UnidadMedidaBase_Id NOT IN (
  SELECT UnidadMedida_Id FROM UnidadesMedida
);


ALTER TABLE Items
ADD CONSTRAINT fk_items_unidadbase
FOREIGN KEY (UnidadMedidaBase_Id) 
REFERENCES UnidadesMedida(UnidadMedida_Id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 4. Redefinir tabla Items_Presentaciones
-- Primero eliminar la actual
DROP TABLE IF EXISTS Items_Presentaciones;

-- Crear la nueva versión
CREATE TABLE Items_Presentaciones (
  Item_Presentaciones_Id INT PRIMARY KEY AUTO_INCREMENT,
  Item_Id INT NOT NULL,
  Presentacion_Nombre VARCHAR(30) NOT NULL,       -- Ej: Fardo, Paquete, Unidad, Bolsa 4oz
  Cantidad_Base DECIMAL(10,4) NOT NULL,           -- Cuántas unidades base contiene
  Item_Presentacion_CodigoSKU VARCHAR(20),
  Item_Presentaciones_CodigoBarras VARCHAR(20),
  Item_Presentaciones_Costo DECIMAL(10,4),        -- Precisión de 4 decimales para costos exactos
  Item_Presentaciones_Precio DECIMAL(10,4),       -- Precisión de 4 decimales para precios exactos

  CONSTRAINT fk_itemspres_items FOREIGN KEY (Item_Id) REFERENCES Items(Item_Id),
  CONSTRAINT uk_item_presentacion UNIQUE (Item_Id, Presentacion_Nombre),
  CONSTRAINT chk_cantidad_base CHECK (Cantidad_Base > 0),
  CONSTRAINT chk_item_pres_costo_positivo CHECK (Item_Presentaciones_Costo IS NULL OR Item_Presentaciones_Costo >= 0),
  CONSTRAINT chk_item_pres_precio_positivo CHECK (Item_Presentaciones_Precio IS NULL OR Item_Presentaciones_Precio >= 0)
);

-- Índices únicos para códigos de presentaciones (permitiendo NULL)
CREATE UNIQUE INDEX uk_item_pres_codigo_sku ON Items_Presentaciones (Item_Presentacion_CodigoSKU);
CREATE UNIQUE INDEX uk_item_pres_codigo_barras ON Items_Presentaciones (Item_Presentaciones_CodigoBarras);

--Borrar el precio de producto

ALTER TABLE items DROP COLUMN Item_Precio_Sugerido;