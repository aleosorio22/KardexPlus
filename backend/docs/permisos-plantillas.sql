-- =====================================================
-- PERMISOS DEL MÓDULO: PLANTILLAS
-- =====================================================
-- Script para insertar permisos del sistema de plantillas
-- Fecha: 2025-11-10
-- Módulo: Plantillas (Templates para Requerimientos, Movimientos y Compras)
-- =====================================================

-- Insertar permisos del módulo Plantillas
INSERT INTO `Permisos` (`Permiso_Codigo`, `Permiso_Nombre`, `Permiso_Descripcion`, `Permiso_Modulo`) VALUES
-- Permisos básicos de plantillas
('plantillas.ver', 'Ver Plantillas Asignadas', 'Permite ver las plantillas asignadas al usuario', 'plantillas'),
('plantillas.ver_todas', 'Ver Todas las Plantillas', 'Permite ver todas las plantillas del sistema (Administradores)', 'plantillas'),
('plantillas.usar', 'Usar Plantillas', 'Permite utilizar plantillas asignadas para crear requerimientos/movimientos', 'plantillas'),

-- Permisos de gestión (CRUD)
('plantillas.crear', 'Crear Plantillas', 'Permite crear nuevas plantillas del sistema', 'plantillas'),
('plantillas.editar', 'Editar Plantillas', 'Permite modificar plantillas existentes', 'plantillas'),
('plantillas.eliminar', 'Eliminar Plantillas', 'Permite eliminar plantillas del sistema', 'plantillas'),

-- Permisos de asignación de usuarios
('plantillas.asignar_usuarios', 'Asignar Usuarios a Plantillas', 'Permite asignar y desasignar usuarios de plantillas', 'plantillas'),
('plantillas.gestionar_permisos', 'Gestionar Permisos de Plantillas', 'Permite modificar permisos de usuarios sobre plantillas específicas', 'plantillas'),

-- Permisos de reportes y estadísticas
('plantillas.reportes', 'Ver Reportes de Plantillas', 'Permite ver estadísticas y reportes de uso de plantillas', 'plantillas');

-- =====================================================
-- ASIGNACIÓN DE PERMISOS A ROLES PREDETERMINADOS
-- =====================================================

-- ROL: Administrador (Rol_Id = 1) - TODOS LOS PERMISOS
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 1, Permiso_Id 
FROM Permisos 
WHERE Permiso_Modulo = 'plantillas';

-- ROL: Gerente (Rol_Id = 2) - PERMISOS COMPLETOS EXCEPTO ELIMINAR
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 2, Permiso_Id 
FROM Permisos 
WHERE Permiso_Modulo = 'plantillas' 
AND Permiso_Codigo IN (
    'plantillas.ver',
    'plantillas.ver_todas',
    'plantillas.usar',
    'plantillas.crear',
    'plantillas.editar',
    'plantillas.asignar_usuarios',
    'plantillas.gestionar_permisos',
    'plantillas.reportes'
);

-- ROL: Supervisor de Bodega (Rol_Id = 3) - PUEDE CREAR Y USAR PLANTILLAS
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 3, Permiso_Id 
FROM Permisos 
WHERE Permiso_Modulo = 'plantillas' 
AND Permiso_Codigo IN (
    'plantillas.ver',
    'plantillas.ver_todas',
    'plantillas.usar',
    'plantillas.crear',
    'plantillas.editar',
    'plantillas.reportes'
);

-- ROL: Operador de Bodega (Rol_Id = 4) - SOLO USA PLANTILLAS ASIGNADAS
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 4, Permiso_Id 
FROM Permisos 
WHERE Permiso_Modulo = 'plantillas' 
AND Permiso_Codigo IN (
    'plantillas.ver',
    'plantillas.usar'
);

-- ROL: Solicitante (Rol_Id = 5) - SOLO USA PLANTILLAS ASIGNADAS
INSERT INTO `Roles_Permisos` (`Rol_Id`, `Permiso_Id`)
SELECT 5, Permiso_Id 
FROM Permisos 
WHERE Permiso_Modulo = 'plantillas' 
AND Permiso_Codigo IN (
    'plantillas.ver',
    'plantillas.usar'
);

-- =====================================================
-- VERIFICACIÓN DE PERMISOS INSERTADOS
-- =====================================================

-- Consultar permisos del módulo plantillas
SELECT 
    Permiso_Id,
    Permiso_Codigo,
    Permiso_Nombre,
    Permiso_Descripcion,
    Permiso_Modulo
FROM Permisos
WHERE Permiso_Modulo = 'plantillas'
ORDER BY Permiso_Codigo;

-- Consultar asignación de permisos por rol
SELECT 
    r.Rol_Nombre,
    p.Permiso_Codigo,
    p.Permiso_Nombre
FROM Roles r
INNER JOIN Roles_Permisos rp ON r.Rol_Id = rp.Rol_Id
INNER JOIN Permisos p ON rp.Permiso_Id = p.Permiso_Id
WHERE p.Permiso_Modulo = 'plantillas'
ORDER BY r.Rol_Id, p.Permiso_Codigo;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*
ESTRUCTURA DE PERMISOS:

1. PERMISOS DE VISUALIZACIÓN:
   - plantillas.ver: Ver solo plantillas asignadas al usuario
   - plantillas.ver_todas: Ver todas las plantillas (Admins/Gerentes)

2. PERMISOS DE USO:
   - plantillas.usar: Usar plantillas para crear requerimientos/movimientos

3. PERMISOS DE GESTIÓN (CRUD):
   - plantillas.crear: Crear nuevas plantillas
   - plantillas.editar: Modificar plantillas existentes
   - plantillas.eliminar: Eliminar plantillas (solo Admins)

4. PERMISOS DE ASIGNACIÓN:
   - plantillas.asignar_usuarios: Asignar/desasignar usuarios
   - plantillas.gestionar_permisos: Modificar permisos específicos

5. PERMISOS DE REPORTES:
   - plantillas.reportes: Ver estadísticas de uso

ROLES Y SUS PERMISOS:

┌─────────────────────┬──────┬──────────┬──────┬────────┬──────────┬──────────┬──────────┬──────────────┬──────────┐
│ ROL                 │ VER  │ VER TODO │ USAR │ CREAR  │ EDITAR   │ ELIMINAR │ ASIGNAR  │ GESTIONAR    │ REPORTES │
├─────────────────────┼──────┼──────────┼──────┼────────┼──────────┼──────────┼──────────┼──────────────┼──────────┤
│ Administrador       │  ✓   │    ✓     │  ✓   │   ✓    │    ✓     │    ✓     │    ✓     │      ✓       │    ✓     │
│ Gerente             │  ✓   │    ✓     │  ✓   │   ✓    │    ✓     │    ✗     │    ✓     │      ✓       │    ✓     │
│ Supervisor Bodega   │  ✓   │    ✓     │  ✓   │   ✓    │    ✓     │    ✗     │    ✗     │      ✗       │    ✓     │
│ Operador Bodega     │  ✓   │    ✗     │  ✓   │   ✗    │    ✗     │    ✗     │    ✗     │      ✗       │    ✗     │
│ Solicitante         │  ✓   │    ✗     │  ✓   │   ✗    │    ✗     │    ✗     │    ✗     │      ✗       │    ✗     │
└─────────────────────┴──────┴──────────┴──────┴────────┴──────────┴──────────┴──────────┴──────────────┴──────────┘

FLUJO DE TRABAJO:

1. ADMINISTRADOR/GERENTE:
   - Crea una plantilla (ej: "Pedido Cocina Mensual")
   - Define items, cantidades y presentaciones
   - Asigna usuarios del área de cocina a la plantilla

2. USUARIO OPERADOR/SOLICITANTE:
   - Ve solo sus plantillas asignadas
   - Selecciona plantilla → Sistema precarga datos
   - Ajusta cantidades si es necesario
   - Crea requerimiento/movimiento

3. SUPERVISOR:
   - Puede crear plantillas para su área
   - Puede editar plantillas existentes
   - Puede ver reportes de uso

CONSIDERACIONES DE SEGURIDAD:

- Los operadores/solicitantes NO pueden:
  ✗ Crear plantillas
  ✗ Editar plantillas
  ✗ Ver plantillas de otros usuarios
  ✗ Asignar usuarios

- Solo Admins/Gerentes pueden:
  ✓ Gestionar asignaciones de usuarios
  ✓ Eliminar plantillas
  ✓ Ver todas las plantillas del sistema

INTEGRACIÓN CON OTROS MÓDULOS:

- Para USAR plantillas de requerimientos: requiere 'requerimientos.crear'
- Para USAR plantillas de movimientos: requiere 'movimientos.crear_[tipo]'
- Para USAR plantillas de compras: requerirá 'compras.crear' (futuro)
*/
