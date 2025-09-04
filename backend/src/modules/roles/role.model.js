const db = require('../../core/config/database');

class RoleModel {
    // Obtener todos los roles
    static async findAll() {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    r.Rol_Id,
                    r.Rol_Nombre,
                    r.Rol_Descripcion,
                    COUNT(u.Usuario_Id) as Usuario_Count
                FROM Roles r
                LEFT JOIN Usuarios u ON r.Rol_Id = u.Rol_Id AND u.Usuario_Estado = true
                GROUP BY r.Rol_Id, r.Rol_Nombre, r.Rol_Descripcion
                ORDER BY r.Rol_Nombre
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un rol por ID
    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    r.Rol_Id,
                    r.Rol_Nombre,
                    r.Rol_Descripcion,
                    COUNT(u.Usuario_Id) as Usuario_Count
                FROM Roles r
                LEFT JOIN Usuarios u ON r.Rol_Id = u.Rol_Id AND u.Usuario_Estado = true
                WHERE r.Rol_Id = ?
                GROUP BY r.Rol_Id, r.Rol_Nombre, r.Rol_Descripcion
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Crear un nuevo rol
    static async create(roleData) {
        try {
            const { Rol_Nombre, Rol_Descripcion } = roleData;
            const [result] = await db.execute(
                'INSERT INTO Roles (Rol_Nombre, Rol_Descripcion) VALUES (?, ?)',
                [Rol_Nombre, Rol_Descripcion]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar un rol
    static async update(id, roleData) {
        try {
            const { Rol_Nombre, Rol_Descripcion } = roleData;
            const [result] = await db.execute(
                'UPDATE Roles SET Rol_Nombre = ?, Rol_Descripcion = ? WHERE Rol_Id = ?',
                [Rol_Nombre, Rol_Descripcion, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un rol (solo si no tiene usuarios asignados)
    static async delete(id) {
        try {
            // Verificar si el rol tiene usuarios asignados
            const [users] = await db.execute(
                'SELECT COUNT(*) as count FROM Usuarios WHERE Rol_Id = ? AND Usuario_Estado = true',
                [id]
            );

            if (users[0].count > 0) {
                throw new Error('No se puede eliminar el rol porque tiene usuarios asignados');
            }

            const [result] = await db.execute('DELETE FROM Roles WHERE Rol_Id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener permisos de un rol
    static async getRolePermissions(roleId) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    p.Permiso_Id,
                    p.Permiso_Codigo,
                    p.Permiso_Nombre,
                    p.Permiso_Modulo,
                    p.Permiso_Descripcion,
                    rp.Fecha_Asignacion
                FROM Roles_Permisos rp
                INNER JOIN Permisos p ON rp.Permiso_Id = p.Permiso_Id
                WHERE rp.Rol_Id = ? AND p.Permiso_Estado = true
                ORDER BY p.Permiso_Modulo, p.Permiso_Codigo
            `, [roleId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Asignar permisos a un rol
    static async assignPermissions(roleId, permissionIds) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Eliminar permisos existentes del rol
            await connection.execute('DELETE FROM Roles_Permisos WHERE Rol_Id = ?', [roleId]);

            // Asignar nuevos permisos
            if (permissionIds && permissionIds.length > 0) {
                const values = permissionIds.map(permissionId => [roleId, permissionId]);
                const placeholders = values.map(() => '(?, ?)').join(', ');
                const flatValues = values.flat();

                await connection.execute(
                    `INSERT INTO Roles_Permisos (Rol_Id, Permiso_Id) VALUES ${placeholders}`,
                    flatValues
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Verificar si un rol existe por nombre
    static async existsByName(name, excludeId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM Roles WHERE Rol_Nombre = ?';
            let params = [name];

            if (excludeId) {
                query += ' AND Rol_Id != ?';
                params.push(excludeId);
            }

            const [rows] = await db.execute(query, params);
            return rows[0].count > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RoleModel;
