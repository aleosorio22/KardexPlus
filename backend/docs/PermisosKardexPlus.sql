-- ==============================
--   SISTEMA DE PERMISOS PARA KARDEXPLUS
-- ==============================

-- Tabla de permisos disponibles en el sistema
CREATE TABLE `Permisos` (
  `Permiso_Id` int PRIMARY KEY AUTO_INCREMENT,
  `Permiso_Codigo` varchar(50) UNIQUE NOT NULL,
  `Permiso_Nombre` varchar(100) NOT NULL,
  `Permiso_Modulo` varchar(50) NOT NULL,
  `Permiso_Descripcion` varchar(255),
  `Permiso_Estado` boolean DEFAULT true,
  CONSTRAINT chk_permiso_codigo_no_vacio CHECK (TRIM(`Permiso_Codigo`) <> ''),
  CONSTRAINT chk_permiso_nombre_no_vacio CHECK (TRIM(`Permiso_Nombre`) <> ''),
  CONSTRAINT chk_permiso_modulo_no_vacio CHECK (TRIM(`Permiso_Modulo`) <> '')
);

-- Permisos asignados a roles (permisos base)
CREATE TABLE `Roles_Permisos` (
  `Rol_Id` int NOT NULL,
  `Permiso_Id` int NOT NULL,
  `Fecha_Asignacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Rol_Id`, `Permiso_Id`),
  FOREIGN KEY (`Rol_Id`) REFERENCES `Roles` (`Rol_Id`) ON DELETE CASCADE,
  FOREIGN KEY (`Permiso_Id`) REFERENCES `Permisos` (`Permiso_Id`) ON DELETE CASCADE
);

-- Permisos específicos por usuario (excepciones al rol)
CREATE TABLE `Usuarios_Permisos` (
  `Usuario_Id` int NOT NULL,
  `Permiso_Id` int NOT NULL,
  `Tipo` enum('GRANT', 'DENY') NOT NULL,
  `Fecha_Asignacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `Asignado_Por` int,
  `Motivo` varchar(255),
  PRIMARY KEY (`Usuario_Id`, `Permiso_Id`),
  FOREIGN KEY (`Usuario_Id`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE CASCADE,
  FOREIGN KEY (`Permiso_Id`) REFERENCES `Permisos` (`Permiso_Id`) ON DELETE CASCADE,
  FOREIGN KEY (`Asignado_Por`) REFERENCES `Usuarios` (`Usuario_Id`) ON DELETE SET NULL
);

-- ==============================
--   DATOS DE PRUEBA - PERMISOS
-- ==============================

-- Insertar permisos del sistema
INSERT INTO `Permisos` (`Permiso_Codigo`, `Permiso_Nombre`, `Permiso_Modulo`, `Permiso_Descripcion`) VALUES

-- MÓDULO DASHBOARD
('dashboard.ver', 'Ver Dashboard', 'dashboard', 'Acceso al panel principal del sistema'),

-- MÓDULO USUARIOS
('usuarios.ver', 'Ver Usuarios', 'usuarios', 'Visualizar lista de usuarios del sistema'),
('usuarios.crear', 'Crear Usuarios', 'usuarios', 'Crear nuevos usuarios en el sistema'),
('usuarios.editar', 'Editar Usuarios', 'usuarios', 'Modificar información de usuarios existentes'),
('usuarios.eliminar', 'Eliminar Usuarios', 'usuarios', 'Eliminar usuarios del sistema'),
('usuarios.cambiar_estado', 'Cambiar Estado Usuario', 'usuarios', 'Activar o desactivar usuarios'),
('usuarios.resetear_password', 'Resetear Contraseña', 'usuarios', 'Resetear contraseñas de usuarios'),

-- MÓDULO ROLES
('roles.ver', 'Ver Roles', 'roles', 'Visualizar roles del sistema'),
('roles.crear', 'Crear Roles', 'roles', 'Crear nuevos roles'),
('roles.editar', 'Editar Roles', 'roles', 'Modificar roles existentes'),
('roles.eliminar', 'Eliminar Roles', 'roles', 'Eliminar roles del sistema'),
('roles.asignar_permisos', 'Asignar Permisos', 'roles', 'Gestionar permisos de roles'),

-- MÓDULO ITEMS/PRODUCTOS
('items.ver', 'Ver Items', 'items', 'Visualizar catálogo de items'),
('items.crear', 'Crear Items', 'items', 'Crear nuevos items en el catálogo'),
('items.editar', 'Editar Items', 'items', 'Modificar items existentes'),
('items.eliminar', 'Eliminar Items', 'items', 'Eliminar items del catálogo'),
('items.ver_costos', 'Ver Costos Items', 'items', 'Visualizar información de costos'),
('items.editar_costos', 'Editar Costos Items', 'items', 'Modificar costos de items'),

-- MÓDULO CATEGORÍAS
('categorias.ver', 'Ver Categorías', 'categorias', 'Visualizar categorías de items'),
('categorias.crear', 'Crear Categorías', 'categorias', 'Crear nuevas categorías'),
('categorias.editar', 'Editar Categorías', 'categorias', 'Modificar categorías existentes'),
('categorias.eliminar', 'Eliminar Categorías', 'categorias', 'Eliminar categorías'),

-- MÓDULO BODEGAS
('bodegas.ver', 'Ver Bodegas', 'bodegas', 'Visualizar lista de bodegas'),
('bodegas.crear', 'Crear Bodegas', 'bodegas', 'Crear nuevas bodegas'),
('bodegas.editar', 'Editar Bodegas', 'bodegas', 'Modificar bodegas existentes'),
('bodegas.eliminar', 'Eliminar Bodegas', 'bodegas', 'Eliminar bodegas'),

-- MÓDULO INVENTARIO
('inventario.ver', 'Ver Inventario', 'inventario', 'Visualizar existencias por bodega'),
('inventario.ver_todas_bodegas', 'Ver Inventario Todas Bodegas', 'inventario', 'Ver inventario de todas las bodegas'),
('inventario.ajustar', 'Ajustar Inventario', 'inventario', 'Realizar ajustes de inventario'),

-- MÓDULO MOVIMIENTOS
('movimientos.ver', 'Ver Movimientos', 'movimientos', 'Visualizar historial de movimientos'),
('movimientos.crear_entrada', 'Crear Entradas', 'movimientos', 'Registrar entradas de mercancía'),
('movimientos.crear_salida', 'Crear Salidas', 'movimientos', 'Registrar salidas de mercancía'),
('movimientos.crear_transferencia', 'Crear Transferencias', 'movimientos', 'Realizar transferencias entre bodegas'),
('movimientos.aprobar', 'Aprobar Movimientos', 'movimientos', 'Aprobar movimientos pendientes'),

-- MÓDULO COMPRAS
('compras.ver', 'Ver Compras', 'compras', 'Visualizar historial de compras'),
('compras.crear', 'Crear Compras', 'compras', 'Registrar nuevas compras'),
('compras.editar', 'Editar Compras', 'compras', 'Modificar compras existentes'),
('compras.anular', 'Anular Compras', 'compras', 'Anular compras registradas'),
('compras.aprobar', 'Aprobar Compras', 'compras', 'Aprobar solicitudes de compra'),

-- MÓDULO PROVEEDORES
('proveedores.ver', 'Ver Proveedores', 'proveedores', 'Visualizar lista de proveedores'),
('proveedores.crear', 'Crear Proveedores', 'proveedores', 'Registrar nuevos proveedores'),
('proveedores.editar', 'Editar Proveedores', 'proveedores', 'Modificar proveedores existentes'),
('proveedores.eliminar', 'Eliminar Proveedores', 'proveedores', 'Eliminar proveedores'),

-- MÓDULO REPORTES
('reportes.inventario', 'Reportes Inventario', 'reportes', 'Generar reportes de inventario'),
('reportes.movimientos', 'Reportes Movimientos', 'reportes', 'Generar reportes de movimientos'),
('reportes.compras', 'Reportes Compras', 'reportes', 'Generar reportes de compras'),
('reportes.kardex', 'Reportes Kardex', 'reportes', 'Generar reportes kardex por item'),
('reportes.auditoria', 'Reportes Auditoría', 'reportes', 'Acceso a reportes de auditoría'),

-- MÓDULO CONFIGURACIÓN
('configuracion.ver', 'Ver Configuración', 'configuracion', 'Acceso a configuraciones del sistema'),
('configuracion.editar', 'Editar Configuración', 'configuracion', 'Modificar configuraciones del sistema'),

-- MÓDULO AUDITORÍA
('auditoria.ver', 'Ver Auditoría', 'auditoria', 'Visualizar logs de auditoría del sistema');

-- ==============================
--   ASIGNACIÓN DE PERMISOS POR ROL
-- ==============================

-- ADMINISTRADOR - Acceso completo
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 1, `Permiso_Id` FROM `Permisos` WHERE `Permiso_Estado` = true;

-- GERENTE - Gestión completa excepto usuarios y configuración crítica
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 2, `Permiso_Id` FROM `Permisos` 
WHERE `Permiso_Codigo` IN (
    'dashboard.ver',
    'usuarios.ver',
    'items.ver', 'items.crear', 'items.editar', 'items.ver_costos', 'items.editar_costos',
    'categorias.ver', 'categorias.crear', 'categorias.editar',
    'bodegas.ver', 'bodegas.crear', 'bodegas.editar',
    'inventario.ver', 'inventario.ver_todas_bodegas', 'inventario.ajustar',
    'movimientos.ver', 'movimientos.crear_entrada', 'movimientos.crear_salida', 
    'movimientos.crear_transferencia', 'movimientos.aprobar',
    'compras.ver', 'compras.crear', 'compras.editar', 'compras.aprobar',
    'proveedores.ver', 'proveedores.crear', 'proveedores.editar',
    'reportes.inventario', 'reportes.movimientos', 'reportes.compras', 'reportes.kardex'
);

-- OPERADOR - Operaciones básicas de inventario
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 3, `Permiso_Id` FROM `Permisos` 
WHERE `Permiso_Codigo` IN (
    'dashboard.ver',
    'items.ver',
    'categorias.ver',
    'bodegas.ver',
    'inventario.ver',
    'movimientos.ver', 'movimientos.crear_entrada', 'movimientos.crear_salida', 'movimientos.crear_transferencia',
    'compras.ver',
    'proveedores.ver',
    'reportes.inventario', 'reportes.movimientos'
);

-- CONSULTA - Solo lectura
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 4, `Permiso_Id` FROM `Permisos` 
WHERE `Permiso_Codigo` IN (
    'dashboard.ver',
    'items.ver',
    'categorias.ver',
    'bodegas.ver',
    'inventario.ver',
    'movimientos.ver',
    'compras.ver',
    'proveedores.ver',
    'reportes.inventario', 'reportes.movimientos', 'reportes.compras'
);


-- ==============================
--   ÍNDICES PARA PERFORMANCE
-- ==============================

CREATE INDEX idx_permisos_modulo ON `Permisos` (`Permiso_Modulo`);
CREATE INDEX idx_permisos_codigo ON `Permisos` (`Permiso_Codigo`);
CREATE INDEX idx_permisos_estado ON `Permisos` (`Permiso_Estado`);
CREATE INDEX idx_roles_permisos_rol ON `Roles_Permisos` (`Rol_Id`);
CREATE INDEX idx_usuarios_permisos_usuario ON `Usuarios_Permisos` (`Usuario_Id`);
CREATE INDEX idx_usuarios_permisos_tipo ON `Usuarios_Permisos` (`Tipo`);

-- ==============================
--   VISTA PARA PERMISOS EFECTIVOS DE USUARIO
-- ==============================

CREATE VIEW v_permisos_usuario AS
SELECT DISTINCT
    u.Usuario_Id,
    u.Usuario_Nombre,
    u.Usuario_Apellido,
    u.Usuario_Correo,
    r.Rol_Nombre,
    p.Permiso_Id,
    p.Permiso_Codigo,
    p.Permiso_Nombre,
    p.Permiso_Modulo,
    CASE 
        WHEN up.Tipo = 'DENY' THEN 'DENEGADO'
        WHEN up.Tipo = 'GRANT' OR rp.Permiso_Id IS NOT NULL THEN 'PERMITIDO'
        ELSE 'NO_ASIGNADO'
    END AS Estado_Permiso,
    CASE 
        WHEN up.Tipo IS NOT NULL THEN 'USUARIO'
        WHEN rp.Permiso_Id IS NOT NULL THEN 'ROL'
        ELSE 'NINGUNO'
    END AS Origen_Permiso
FROM Usuarios u
INNER JOIN Roles r ON u.Rol_Id = r.Rol_Id
CROSS JOIN Permisos p
LEFT JOIN Roles_Permisos rp ON r.Rol_Id = rp.Rol_Id AND p.Permiso_Id = rp.Permiso_Id
LEFT JOIN Usuarios_Permisos up ON u.Usuario_Id = up.Usuario_Id AND p.Permiso_Id = up.Permiso_Id
WHERE u.Usuario_Estado = true AND p.Permiso_Estado = true;

-- ==============================
--   FUNCIÓN PARA VERIFICAR PERMISOS
-- ==============================

DELIMITER //

-- Función para verificar si un usuario tiene un permiso específico
CREATE FUNCTION fn_usuario_tiene_permiso(
    p_usuario_id INT,
    p_permiso_codigo VARCHAR(50)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_tiene_permiso BOOLEAN DEFAULT FALSE;
    DECLARE v_permiso_usuario VARCHAR(10);
    DECLARE v_permiso_rol INT;
    
    -- Verificar permiso específico del usuario (GRANT/DENY)
    SELECT up.Tipo
    INTO v_permiso_usuario
    FROM Usuarios_Permisos up
    INNER JOIN Permisos p ON up.Permiso_Id = p.Permiso_Id
    WHERE up.Usuario_Id = p_usuario_id 
      AND p.Permiso_Codigo = p_permiso_codigo
    LIMIT 1;
    
    -- Si hay permiso específico del usuario
    IF v_permiso_usuario IS NOT NULL THEN
        IF v_permiso_usuario = 'GRANT' THEN
            SET v_tiene_permiso = TRUE;
        ELSE
            SET v_tiene_permiso = FALSE;
        END IF;
    ELSE
        -- Verificar permiso por rol
        SELECT COUNT(*)
        INTO v_permiso_rol
        FROM Usuarios u
        INNER JOIN Roles_Permisos rp ON u.Rol_Id = rp.Rol_Id
        INNER JOIN Permisos p ON rp.Permiso_Id = p.Permiso_Id
        WHERE u.Usuario_Id = p_usuario_id 
          AND p.Permiso_Codigo = p_permiso_codigo
          AND u.Usuario_Estado = true
          AND p.Permiso_Estado = true;
          
        IF v_permiso_rol > 0 THEN
            SET v_tiene_permiso = TRUE;
        END IF;
    END IF;
    
    RETURN v_tiene_permiso;
END//

DELIMITER ;

-- ==============================
--   COMENTARIOS Y NOTAS
-- ==============================

/*
NOTAS IMPORTANTES:

1. ESTRUCTURA DE PERMISOS:
   - Código de permiso con formato: modulo.accion
   - Permisos granulares por funcionalidad específica
   - Sistema híbrido: rol + excepciones por usuario

2. TIPOS DE PERMISOS:
   - GRANT: Otorgar permiso específico al usuario
   - DENY: Denegar permiso específico (prevalece sobre rol)

3. ORDEN DE EVALUACIÓN:
   1. ¿Hay permiso específico DENY? → NO PERMITIDO
   2. ¿Hay permiso específico GRANT? → PERMITIDO
   3. ¿Rol tiene el permiso? → PERMITIDO
   4. Sino → NO PERMITIDO

4. ROLES PREDEFINIDOS:
   - Administrador: Todos los permisos
   - Gerente: Gestión completa excepto usuarios críticos
   - Operador: Operaciones básicas de inventario
   - Consulta: Solo lectura

5. USUARIOS DE PRUEBA:
   - Todos con password temporal que debe cambiarse
   - Ejemplos de cada rol para testing

6. PERFORMANCE:
   - Índices en campos de consulta frecuente
   - Vista optimizada para verificación rápida
   - Función para validación en aplicación
*/
