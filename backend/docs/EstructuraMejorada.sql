-- ==============================
--   ESTRUCTURA MEJORADA PARA SISTEMA DE PRESENTACIONES JERÁRQUICAS
-- ==============================

-- Tabla mejorada de UnidadesMedida (ya está bien, solo pequeños ajustes)
CREATE TABLE `UnidadesMedida` (
  `UnidadMedida_Id` int PRIMARY KEY AUTO_INCREMENT,
  `UnidadMedida_Nombre` varchar(30) UNIQUE NOT NULL,
  `UnidadMedida_Prefijo` varchar(5) UNIQUE NOT NULL,
  `UnidadMedida_Tipo` varchar(20) DEFAULT 'Unidad', -- 'Peso', 'Volumen', 'Longitud', 'Unidad'
  `UnidadMedida_Factor_Conversion` decimal(10,6), -- Aumenté precisión para conversiones exactas
  `UnidadMedida_Base` boolean DEFAULT false, -- Indica si es la unidad base del tipo
  `UnidadMedida_Estado` boolean DEFAULT true,
  CONSTRAINT chk_unidad_nombre_no_vacio CHECK (TRIM(`UnidadMedida_Nombre`) <> ''),
  CONSTRAINT chk_unidad_prefijo_no_vacio CHECK (TRIM(`UnidadMedida_Prefijo`) <> ''),
  CONSTRAINT chk_factor_conversion_positivo CHECK (`UnidadMedida_Factor_Conversion` IS NULL OR `UnidadMedida_Factor_Conversion` > 0),
  CONSTRAINT chk_tipo_valido CHECK (`UnidadMedida_Tipo` IN ('Peso', 'Volumen', 'Longitud', 'Unidad', 'Tiempo'))
);

-- Tabla mejorada de Presentaciones con soporte para jerarquías
CREATE TABLE `Presentaciones` (
  `Presentacion_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Presentacion_Nombre` varchar(50) UNIQUE NOT NULL,
  `Presentacion_Descripcion` varchar(150),
  `Presentacion_Cantidad` decimal(10,6) NOT NULL, -- Aumenté precisión
  `UnidadMedida_Id` int NOT NULL,
  `Presentacion_Padre_Id` int NULL, -- Para jerarquías: fardo → paquete → unidad
  `Factor_Conversion_Padre` decimal(10,6), -- Cuántas unidades de esta presentación hay en la presentación padre
  `Presentacion_Tipo` varchar(20) DEFAULT 'Normal', -- 'Compra', 'Venta', 'Almacenamiento', 'Produccion'
  `Presentacion_Estado` boolean DEFAULT true,
  `Fecha_Creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_presentacion_nombre_no_vacio CHECK (TRIM(`Presentacion_Nombre`) <> ''),
  CONSTRAINT chk_presentacion_cantidad_positiva CHECK (`Presentacion_Cantidad` > 0),
  CONSTRAINT chk_factor_conversion_positivo CHECK (`Factor_Conversion_Padre` IS NULL OR `Factor_Conversion_Padre` > 0),
  CONSTRAINT chk_presentacion_tipo_valido CHECK (`Presentacion_Tipo` IN ('Compra', 'Venta', 'Almacenamiento', 'Produccion', 'Normal')),
  -- Evitar referencias circulares
  CONSTRAINT chk_no_autorreferencia CHECK (`Presentacion_Id` != `Presentacion_Padre_Id`)
);

-- Tabla para Items con presentación de compra principal
CREATE TABLE `Items` (
  `Item_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Item_Codigo_SKU` varchar(20),
  `Item_Codigo_Barra` varchar(20),
  `Item_Nombre` varchar(80) UNIQUE NOT NULL, -- Aumenté para nombres más descriptivos
  `Item_Descripcion` varchar(200),
  `Item_Tipo` varchar(30) DEFAULT 'Producto', -- 'Producto', 'Materia Prima', 'Insumo', 'Servicio'
  
  -- Presentación y costo de compra (presentación base)
  `Presentacion_Compra_Id` int NOT NULL, -- Presentación en la que se compra (ej: fardo)
  `Item_Costo_Compra` decimal(12,4) NOT NULL, -- Costo en la presentación de compra
  
  -- Configuración de stock
  `Item_Stock_Min` decimal(10,4) DEFAULT 0,
  `Item_Stock_Max` decimal(10,4),
  `Unidad_Stock_Id` int NOT NULL, -- En qué unidad se maneja el stock (ej: paquetes)
  
  -- Configuración general
  `Item_Estado` boolean DEFAULT true,
  `Item_Permite_Venta` boolean DEFAULT true,
  `Item_Requiere_Lote` boolean DEFAULT false,
  `Item_Fecha_Creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `Item_Fecha_Actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CategoriaItem_Id` int NOT NULL,
  
  CONSTRAINT chk_item_nombre_no_vacio CHECK (TRIM(`Item_Nombre`) <> ''),
  CONSTRAINT chk_costo_compra_positivo CHECK (`Item_Costo_Compra` > 0),
  CONSTRAINT chk_stock_min_valido CHECK (`Item_Stock_Min` >= 0),
  CONSTRAINT chk_stock_max_valido CHECK (`Item_Stock_Max` IS NULL OR `Item_Stock_Max` >= `Item_Stock_Min`),
  CONSTRAINT chk_item_tipo_valido CHECK (`Item_Tipo` IN ('Producto', 'Materia Prima', 'Insumo', 'Servicio'))
);

-- Tabla para todas las presentaciones disponibles de un item con costos calculados
CREATE TABLE `Items_Presentaciones` (
  `Item_Presentaciones_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Item_Id` int NOT NULL,
  `Presentacion_Id` int NOT NULL,
  
  -- Códigos específicos para esta presentación
  `Item_Presentacion_CodigoSKU` varchar(20),
  `Item_Presentaciones_CodigoBarras` varchar(20),
  
  -- Factor de conversión desde la presentación de compra
  `Factor_Conversion_Compra` decimal(14,8) NOT NULL, -- Cuántas unidades de esta presentación salen de 1 unidad de compra
  
  -- Costos calculados automáticamente
  `Costo_Unitario_Calculado` decimal(12,6) GENERATED ALWAYS AS (
    (SELECT i.Item_Costo_Compra FROM Items i WHERE i.Item_Id = Items_Presentaciones.Item_Id) / Factor_Conversion_Compra
  ) STORED,
  
  -- Precios de venta (si aplica)
  `Precio_Venta` decimal(12,4),
  `Margen_Ganancia` decimal(5,2), -- Porcentaje
  
  -- Configuración
  `Es_Presentacion_Compra` boolean GENERATED ALWAYS AS (
    Presentacion_Id = (SELECT i.Presentacion_Compra_Id FROM Items i WHERE i.Item_Id = Items_Presentaciones.Item_Id)
  ) STORED,
  `Permite_Venta` boolean DEFAULT true,
  `Permite_Compra` boolean DEFAULT false,
  `Activo` boolean DEFAULT true,
  
  CONSTRAINT uk_item_presentacion UNIQUE (`Item_Id`, `Presentacion_Id`),
  CONSTRAINT chk_factor_conversion_positivo CHECK (`Factor_Conversion_Compra` > 0),
  CONSTRAINT chk_precio_venta_positivo CHECK (`Precio_Venta` IS NULL OR `Precio_Venta` >= 0),
  CONSTRAINT chk_margen_valido CHECK (`Margen_Ganancia` IS NULL OR (`Margen_Ganancia` >= 0 AND `Margen_Ganancia` <= 100))
);

-- Tabla para transformaciones de productos (ej: lomito → cuadritos)
CREATE TABLE `Items_Transformaciones` (
  `Transformacion_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Item_Origen_Id` int NOT NULL,
  `Presentacion_Origen_Id` int NOT NULL,
  `Cantidad_Origen` decimal(10,6) NOT NULL,
  
  `Item_Destino_Id` int NOT NULL,
  `Presentacion_Destino_Id` int NOT NULL,
  `Cantidad_Destino` decimal(10,6) NOT NULL,
  
  `Tipo_Transformacion` varchar(30) NOT NULL, -- 'Procesamiento', 'Porcionado', 'Reempaque'
  `Descripcion` varchar(200),
  `Merma_Porcentaje` decimal(5,2) DEFAULT 0, -- Pérdida esperada en el proceso
  `Costo_Procesamiento` decimal(10,4) DEFAULT 0, -- Costo adicional del procesamiento
  `Tiempo_Procesamiento` int, -- Minutos
  `Activo` boolean DEFAULT true,
  
  CONSTRAINT chk_cantidades_positivas CHECK (`Cantidad_Origen` > 0 AND `Cantidad_Destino` > 0),
  CONSTRAINT chk_merma_valida CHECK (`Merma_Porcentaje` >= 0 AND `Merma_Porcentaje` <= 100),
  CONSTRAINT chk_costo_procesamiento_positivo CHECK (`Costo_Procesamiento` >= 0),
  CONSTRAINT chk_tipo_transformacion_valido CHECK (`Tipo_Transformacion` IN ('Procesamiento', 'Porcionado', 'Reempaque', 'Ensamble'))
);

-- ==============================
--   FOREIGN KEYS
-- ==============================

ALTER TABLE `Presentaciones` ADD FOREIGN KEY (`UnidadMedida_Id`) REFERENCES `UnidadesMedida` (`UnidadMedida_Id`) ON DELETE RESTRICT;
ALTER TABLE `Presentaciones` ADD FOREIGN KEY (`Presentacion_Padre_Id`) REFERENCES `Presentaciones` (`Presentacion_Id`) ON DELETE RESTRICT;

ALTER TABLE `Items` ADD FOREIGN KEY (`CategoriaItem_Id`) REFERENCES `CategoriasItems` (`CategoriaItem_Id`) ON DELETE RESTRICT;
ALTER TABLE `Items` ADD FOREIGN KEY (`Presentacion_Compra_Id`) REFERENCES `Presentaciones` (`Presentacion_Id`) ON DELETE RESTRICT;
ALTER TABLE `Items` ADD FOREIGN KEY (`Unidad_Stock_Id`) REFERENCES `UnidadesMedida` (`UnidadMedida_Id`) ON DELETE RESTRICT;

ALTER TABLE `Items_Presentaciones` ADD FOREIGN KEY (`Item_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE CASCADE;
ALTER TABLE `Items_Presentaciones` ADD FOREIGN KEY (`Presentacion_Id`) REFERENCES `Presentaciones` (`Presentacion_Id`) ON DELETE RESTRICT;

ALTER TABLE `Items_Transformaciones` ADD FOREIGN KEY (`Item_Origen_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE RESTRICT;
ALTER TABLE `Items_Transformaciones` ADD FOREIGN KEY (`Presentacion_Origen_Id`) REFERENCES `Presentaciones` (`Presentacion_Id`) ON DELETE RESTRICT;
ALTER TABLE `Items_Transformaciones` ADD FOREIGN KEY (`Item_Destino_Id`) REFERENCES `Items` (`Item_Id`) ON DELETE RESTRICT;
ALTER TABLE `Items_Transformaciones` ADD FOREIGN KEY (`Presentacion_Destino_Id`) REFERENCES `Presentaciones` (`Presentacion_Id`) ON DELETE RESTRICT;

-- ==============================
--   ÍNDICES ÚNICOS CON CONDICIONES
-- ==============================

CREATE UNIQUE INDEX uk_item_codigo_sku ON `Items` (`Item_Codigo_SKU`) WHERE `Item_Codigo_SKU` IS NOT NULL;
CREATE UNIQUE INDEX uk_item_codigo_barra ON `Items` (`Item_Codigo_Barra`) WHERE `Item_Codigo_Barra` IS NOT NULL;
CREATE UNIQUE INDEX uk_item_pres_codigo_sku ON `Items_Presentaciones` (`Item_Presentacion_CodigoSKU`) WHERE `Item_Presentacion_CodigoSKU` IS NOT NULL;
CREATE UNIQUE INDEX uk_item_pres_codigo_barras ON `Items_Presentaciones` (`Item_Presentaciones_CodigoBarras`) WHERE `Item_Presentaciones_CodigoBarras` IS NOT NULL;

-- ==============================
--   DATOS INICIALES EJEMPLO
-- ==============================

-- Unidades de medida básicas
INSERT INTO `UnidadesMedida` (`UnidadMedida_Nombre`, `UnidadMedida_Prefijo`, `UnidadMedida_Tipo`, `UnidadMedida_Factor_Conversion`, `UnidadMedida_Base`) VALUES
('Unidad', 'un', 'Unidad', 1.0, true),
('Gramo', 'g', 'Peso', 1.0, true),
('Kilogramo', 'kg', 'Peso', 1000.0, false),
('Libra', 'lb', 'Peso', 453.592, false),
('Onza', 'oz', 'Peso', 28.3495, false),
('Litro', 'l', 'Volumen', 1.0, true),
('Mililitro', 'ml', 'Volumen', 0.001, false),
('Galón', 'gal', 'Volumen', 3.78541, false);

-- Presentaciones jerárquicas ejemplo (platos)
INSERT INTO `Presentaciones` (`Presentacion_Nombre`, `Presentacion_Descripcion`, `Presentacion_Cantidad`, `UnidadMedida_Id`, `Presentacion_Padre_Id`, `Factor_Conversion_Padre`, `Presentacion_Tipo`) VALUES
('Fardo', 'Empaque de compra principal', 1, 1, NULL, NULL, 'Compra'),
('Paquete', 'Empaque intermedio', 1, 1, 1, 10, 'Almacenamiento'), -- 10 paquetes por fardo
('Unidad Individual', 'Unidad suelta', 1, 1, 2, 10, 'Venta'); -- 10 unidades por paquete

-- Ejemplo para carnes
INSERT INTO `Presentaciones` (`Presentacion_Nombre`, `Presentacion_Descripcion`, `Presentacion_Cantidad`, `UnidadMedida_Id`, `Presentacion_Padre_Id`, `Factor_Conversion_Padre`, `Presentacion_Tipo`) VALUES
('Corte Completo', 'Pieza completa de carne', 1, 3, NULL, NULL, 'Compra'), -- en kg
('Porción 1/2 libra', 'Porción para churrasco', 0.5, 4, NULL, NULL, 'Venta'), -- en libras
('Porción 4 onzas', 'Porción para baguette', 4, 5, NULL, NULL, 'Venta'), -- en onzas
('Carne Deshilachada', 'Para tortillas', 1, 5, NULL, NULL, 'Produccion'); -- en onzas
