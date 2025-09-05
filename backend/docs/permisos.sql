-- ==============================
--   SISTEMA DE PERMISOS KARDEX PLUS
-- ==============================

USE kardexplus_db;

-- Tabla de Permisos
CREATE TABLE IF NOT EXISTS `Permisos` (
  `Permiso_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Permiso_Codigo` varchar(50) UNIQUE NOT NULL,
  `Permiso_Nombre` varchar(100) NOT NULL,
  `Permiso_Descripcion` varchar(255),
  `Permiso_Modulo` varchar(50) NOT NULL,
  `Permiso_Estado` boolean DEFAULT true,
  `Fecha_Creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_permiso_codigo_no_vacio CHECK (TRIM(`Permiso_Codigo`) <> ''),
  CONSTRAINT chk_permiso_nombre_no_vacio CHECK (TRIM(`Permiso_Nombre`) <> ''),
  CONSTRAINT chk_permiso_modulo_no_vacio CHECK (TRIM(`Permiso_Modulo`) <> '')
);

-- Tabla intermedia Roles-Permisos (muchos a muchos)
CREATE TABLE IF NOT EXISTS `Roles_Permisos` (
  `Rol_Id` int NOT NULL,
  `Permiso_Id` int NOT NULL,
  `Fecha_Asignacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Rol_Id`, `Permiso_Id`),
  FOREIGN KEY (`Rol_Id`) REFERENCES `Roles`(`Rol_Id`) ON DELETE CASCADE,
  FOREIGN KEY (`Permiso_Id`) REFERENCES `Permisos`(`Permiso_Id`) ON DELETE CASCADE
);

-- Insertar permisos del sistema
INSERT INTO `Permisos` (`Permiso_Codigo`, `Permiso_Nombre`, `Permiso_Descripcion`, `Permiso_Modulo`) VALUES
-- Módulo Usuarios
('usuarios.ver', 'Ver Usuarios', 'Permite ver la lista de usuarios y sus detalles', 'usuarios'),
('usuarios.crear', 'Crear Usuarios', 'Permite crear nuevos usuarios en el sistema', 'usuarios'),
('usuarios.editar', 'Editar Usuarios', 'Permite modificar información de usuarios existentes', 'usuarios'),
('usuarios.eliminar', 'Eliminar Usuarios', 'Permite eliminar usuarios del sistema', 'usuarios'),
('usuarios.cambiar_estado', 'Cambiar Estado Usuario', 'Permite activar/desactivar usuarios', 'usuarios'),

-- Módulo Roles
('roles.ver', 'Ver Roles', 'Permite ver la lista de roles y sus detalles', 'roles'),
('roles.crear', 'Crear Roles', 'Permite crear nuevos roles en el sistema', 'roles'),
('roles.editar', 'Editar Roles', 'Permite modificar roles existentes', 'roles'),
('roles.eliminar', 'Eliminar Roles', 'Permite eliminar roles del sistema', 'roles'),
('roles.asignar_permisos', 'Asignar Permisos', 'Permite asignar y gestionar permisos de roles', 'roles'),

-- Módulo Inventario
('inventario.ver', 'Ver Inventario', 'Permite ver el inventario y existencias', 'inventario'),
('inventario.crear_items', 'Crear Items', 'Permite crear nuevos items en el inventario', 'inventario'),
('inventario.editar_items', 'Editar Items', 'Permite modificar items existentes', 'inventario'),
('inventario.eliminar_items', 'Eliminar Items', 'Permite eliminar items del inventario', 'inventario'),

-- Módulo Movimientos
('movimientos.ver', 'Ver Movimientos', 'Permite ver el historial de movimientos', 'movimientos'),
('movimientos.crear_entrada', 'Crear Entradas', 'Permite crear movimientos de entrada al inventario', 'movimientos'),
('movimientos.crear_salida', 'Crear Salidas', 'Permite crear movimientos de salida del inventario', 'movimientos'),
('movimientos.crear_transferencia', 'Crear Transferencias', 'Permite crear transferencias entre bodegas', 'movimientos'),
('movimientos.anular', 'Anular Movimientos', 'Permite anular movimientos existentes', 'movimientos'),

-- Módulo Bodegas
('bodegas.ver', 'Ver Bodegas', 'Permite ver la lista de bodegas', 'bodegas'),
('bodegas.crear', 'Crear Bodegas', 'Permite crear nuevas bodegas', 'bodegas'),
('bodegas.editar', 'Editar Bodegas', 'Permite modificar bodegas existentes', 'bodegas'),
('bodegas.eliminar', 'Eliminar Bodegas', 'Permite eliminar bodegas', 'bodegas'),

-- Módulo Reportes
('reportes.inventario', 'Reportes de Inventario', 'Permite generar y ver reportes de inventario', 'reportes'),
('reportes.movimientos', 'Reportes de Movimientos', 'Permite generar y ver reportes de movimientos', 'reportes'),
('reportes.kardex', 'Reportes Kardex', 'Permite generar y ver reportes tipo kardex', 'reportes'),
('reportes.exportar', 'Exportar Reportes', 'Permite exportar reportes en diferentes formatos', 'reportes'),

-- Módulo Configuración
('configuracion.general', 'Configuración General', 'Permite acceder a la configuración general del sistema', 'configuracion'),
('configuracion.backup', 'Gestión de Respaldos', 'Permite crear y restaurar respaldos del sistema', 'configuracion'),
('configuracion.logs', 'Ver Logs del Sistema', 'Permite ver los logs y auditoría del sistema', 'configuracion');

-- Asignar todos los permisos al rol Administrador (asumiendo que tiene ID 1)
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 1, `Permiso_Id` FROM `Permisos`
WHERE NOT EXISTS (SELECT 1 FROM `Roles_Permisos` WHERE `Rol_Id` = 1 AND `Permiso_Id` = `Permisos`.`Permiso_Id`);

-- Asignar permisos básicos al rol Gerente (asumiendo que tiene ID 2)
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 2, p.`Permiso_Id` FROM `Permisos` p
WHERE p.`Permiso_Codigo` IN (
    'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.cambiar_estado',
    'roles.ver',
    'inventario.ver', 'inventario.crear_items', 'inventario.editar_items',
    'movimientos.ver', 'movimientos.crear_entrada', 'movimientos.crear_salida', 'movimientos.crear_transferencia',
    'bodegas.ver', 'bodegas.crear', 'bodegas.editar',
    'reportes.inventario', 'reportes.movimientos', 'reportes.kardex', 'reportes.exportar'
)
AND NOT EXISTS (SELECT 1 FROM `Roles_Permisos` WHERE `Rol_Id` = 2 AND `Permiso_Id` = p.`Permiso_Id`);

-- Asignar permisos básicos al rol Empleado (asumiendo que tiene ID 3)
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 3, p.`Permiso_Id` FROM `Permisos` p
WHERE p.`Permiso_Codigo` IN (
    'inventario.ver',
    'movimientos.ver', 'movimientos.crear_entrada', 'movimientos.crear_salida',
    'bodegas.ver',
    'reportes.inventario', 'reportes.movimientos'
)
AND NOT EXISTS (SELECT 1 FROM `Roles_Permisos` WHERE `Rol_Id` = 3 AND `Permiso_Id` = p.`Permiso_Id`);

-- Asignar permisos de solo lectura al rol Visualizador (asumiendo que tiene ID 4)
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 4, p.`Permiso_Id` FROM `Permisos` p
WHERE p.`Permiso_Codigo` IN (
    'inventario.ver',
    'movimientos.ver',
    'bodegas.ver',
    'reportes.inventario', 'reportes.movimientos', 'reportes.kardex'
)
AND NOT EXISTS (SELECT 1 FROM `Roles_Permisos` WHERE `Rol_Id` = 4 AND `Permiso_Id` = p.`Permiso_Id`);

-- ==============================
--   FUNCIÓN PARA VERIFICAR PERMISOS
-- ==============================

DELIMITER //

-- Función para verificar si un usuario tiene un permiso específico
CREATE FUNCTION IF NOT EXISTS fn_usuario_tiene_permiso(
    p_usuario_id INT,
    p_permiso_codigo VARCHAR(50)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_tiene_permiso BOOLEAN DEFAULT FALSE;
    
    SELECT COUNT(*) > 0 INTO v_tiene_permiso
    FROM Usuarios u
    INNER JOIN Roles r ON u.Rol_Id = r.Rol_Id
    INNER JOIN Roles_Permisos rp ON r.Rol_Id = rp.Rol_Id
    INNER JOIN Permisos p ON rp.Permiso_Id = p.Permiso_Id
    WHERE u.Usuario_Id = p_usuario_id
      AND u.Usuario_Estado = 1
      AND p.Permiso_Codigo = p_permiso_codigo
      AND p.Permiso_Estado = 1;
    
    RETURN v_tiene_permiso;
END//

DELIMITER ;

-- ==============================
--   VISTAS ÚTILES
-- ==============================

-- Vista para obtener usuarios con sus roles y permisos
CREATE OR REPLACE VIEW v_usuarios_permisos AS
SELECT 
    u.Usuario_Id,
    u.Usuario_Nombre,
    u.Usuario_Apellido,
    u.Usuario_Correo,
    u.Usuario_Estado,
    r.Rol_Id,
    r.Rol_Nombre,
    r.Rol_Descripcion,
    p.Permiso_Id,
    p.Permiso_Codigo,
    p.Permiso_Nombre,
    p.Permiso_Modulo,
    rp.Fecha_Asignacion
FROM Usuarios u
INNER JOIN Roles r ON u.Rol_Id = r.Rol_Id
LEFT JOIN Roles_Permisos rp ON r.Rol_Id = rp.Rol_Id
LEFT JOIN Permisos p ON rp.Permiso_Id = p.Permiso_Id AND p.Permiso_Estado = 1
WHERE u.Usuario_Estado = 1;

-- Vista para obtener roles con conteo de usuarios y permisos
CREATE OR REPLACE VIEW v_roles_estadisticas AS
SELECT 
    r.Rol_Id,
    r.Rol_Nombre,
    r.Rol_Descripcion,
    COUNT(DISTINCT u.Usuario_Id) as Usuario_Count,
    COUNT(DISTINCT rp.Permiso_Id) as Permiso_Count
FROM Roles r
LEFT JOIN Usuarios u ON r.Rol_Id = u.Rol_Id AND u.Usuario_Estado = 1
LEFT JOIN Roles_Permisos rp ON r.Rol_Id = rp.Rol_Id
GROUP BY r.Rol_Id, r.Rol_Nombre, r.Rol_Descripcion;

-- ==============================
--   ÍNDICES PARA PERFORMANCE
-- ==============================

-- Índices para mejorar el rendimiento de consultas de permisos
CREATE INDEX IF NOT EXISTS idx_permisos_codigo ON Permisos(Permiso_Codigo);
CREATE INDEX IF NOT EXISTS idx_permisos_modulo ON Permisos(Permiso_Modulo);
CREATE INDEX IF NOT EXISTS idx_permisos_estado ON Permisos(Permiso_Estado);
CREATE INDEX IF NOT EXISTS idx_roles_permisos_rol ON Roles_Permisos(Rol_Id);
CREATE INDEX IF NOT EXISTS idx_roles_permisos_permiso ON Roles_Permisos(Permiso_Id);

-- ==============================
--   COMENTARIOS
-- ==============================

/*
INSTRUCCIONES DE USO:

1. Ejecutar este script después de crear la base de datos principal
2. Los permisos se organizan por módulos para mejor gestión
3. La función fn_usuario_tiene_permiso() se usa en el middleware del backend
4. Las vistas facilitan consultas complejas desde el frontend
5. Los índices mejoran el rendimiento de las consultas de autorización

CÓDIGOS DE PERMISOS:
- usuarios.*: Gestión de usuarios
- roles.*: Gestión de roles y permisos
- inventario.*: Gestión de items e inventario
- movimientos.*: Gestión de entradas, salidas y transferencias
- bodegas.*: Gestión de bodegas
- reportes.*: Generación y visualización de reportes
- configuracion.*: Configuración del sistema

Para agregar nuevos permisos, usar el formato: modulo.accion
Ejemplo: 'clientes.crear', 'proveedores.editar', etc.
*/
