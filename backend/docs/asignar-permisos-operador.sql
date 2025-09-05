-- ==============================
--   ASIGNAR PERMISOS DE USUARIOS AL ROL OPERADOR
-- ==============================

USE kardexplus_db;

-- Primero, obtener el ID del rol "Operador" (puede variar según tu base de datos)
-- Asumiendo que existe un rol llamado "Operador" o similar

-- Si el rol no existe, crearlo
INSERT IGNORE INTO `Roles` (`Rol_Nombre`, `Rol_Descripcion`) 
VALUES ('Operador', 'Usuario operador con permisos de gestión de usuarios y operaciones básicas');

-- Obtener el ID del rol Operador
SET @operador_rol_id = (SELECT Rol_Id FROM Roles WHERE Rol_Nombre = 'Operador' LIMIT 1);

-- Si no existe el rol Operador, usar rol ID 3 (asumiendo que es Empleado) o crear uno nuevo
IF @operador_rol_id IS NULL THEN
    INSERT INTO `Roles` (`Rol_Nombre`, `Rol_Descripcion`) 
    VALUES ('Operador', 'Usuario operador con permisos de gestión de usuarios');
    SET @operador_rol_id = LAST_INSERT_ID();
END IF;

-- Asignar permisos de usuarios al rol operador
INSERT IGNORE INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT @operador_rol_id, p.`Permiso_Id` FROM `Permisos` p
WHERE p.`Permiso_Codigo` IN (
    'usuarios.ver',
    'usuarios.crear', 
    'usuarios.editar',
    'usuarios.cambiar_estado',
    'roles.ver',
    'inventario.ver',
    'movimientos.ver',
    'bodegas.ver',
    'reportes.inventario',
    'reportes.movimientos'
);

-- Verificar los permisos asignados
SELECT 
    r.Rol_Nombre,
    p.Permiso_Codigo,
    p.Permiso_Nombre,
    p.Permiso_Modulo
FROM Roles r
INNER JOIN Roles_Permisos rp ON r.Rol_Id = rp.Rol_Id
INNER JOIN Permisos p ON rp.Permiso_Id = p.Permiso_Id
WHERE r.Rol_Id = @operador_rol_id
ORDER BY p.Permiso_Modulo, p.Permiso_Codigo;
