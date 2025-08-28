const db = require('../../core/config/database');
const bcrypt = require('bcrypt');

class UserModel {
    /**
     * Crea un nuevo usuario en la base de datos
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<number>} - ID del usuario creado
     */
    static async create(userData) {
        const { Usuario_Nombre, Usuario_Apellido, Usuario_Correo, Usuario_Contrasena, Rol_Id } = userData;
        
        // Verificar si el correo ya existe
        const [existingUser] = await db.execute(
            'SELECT Usuario_Id FROM usuarios WHERE Usuario_Correo = ?',
            [Usuario_Correo]
        );
        
        if (existingUser.length > 0) {
            throw new Error('El correo ya está registrado');
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(Usuario_Contrasena, 12);

        const [result] = await db.execute(
            'INSERT INTO usuarios (Usuario_Nombre, Usuario_Apellido, Usuario_Correo, Usuario_Contrasena, Rol_Id) VALUES (?, ?, ?, ?, ?)',
            [Usuario_Nombre, Usuario_Apellido, Usuario_Correo, hashedPassword, Rol_Id]
        );
        
        return result.insertId;
    }

    /**
     * Busca un usuario por correo electrónico
     * @param {string} email - Correo electrónico del usuario
     * @returns {Promise<Object|undefined>} - Usuario encontrado o undefined
     */
    static async findByEmail(email) {
        const [users] = await db.execute(`
            SELECT u.*, r.Rol_Nombre, r.Rol_Descripcion
            FROM usuarios u 
            LEFT JOIN roles r ON u.Rol_Id = r.Rol_Id 
            WHERE u.Usuario_Correo = ? AND u.Usuario_Estado = 1
        `, [email]);
        return users[0];
    }

    /**
     * Busca un usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object|undefined>} - Usuario encontrado o undefined
     */
    static async findById(id) {
        const [users] = await db.execute(`
            SELECT u.*, r.Rol_Nombre, r.Rol_Descripcion
            FROM usuarios u 
            LEFT JOIN roles r ON u.Rol_Id = r.Rol_Id 
            WHERE u.Usuario_Id = ? AND u.Usuario_Estado = 1
        `, [id]);
        return users[0];
    }

    /**
     * Verifica si una contraseña coincide con el hash
     * @param {string} plainPassword - Contraseña en texto plano
     * @param {string} hashedPassword - Contraseña hasheada
     * @returns {Promise<boolean>} - true si coincide, false si no
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Verifica si ya existe un usuario administrador
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async adminExists() {
        const [admins] = await db.execute(`
            SELECT u.Usuario_Id 
            FROM usuarios u 
            JOIN roles r ON u.Rol_Id = r.Rol_Id 
            WHERE r.Rol_Nombre = 'Administrador' AND u.Usuario_Estado = 1
        `);
        return admins.length > 0;
    }

    /**
     * Obtiene el ID de un rol por su nombre
     * @param {string} roleName - Nombre del rol
     * @returns {Promise<number|undefined>} - ID del rol o undefined
     */
    static async getRoleIdByName(roleName) {
        const [roles] = await db.execute(
            'SELECT Rol_Id FROM roles WHERE Rol_Nombre = ?',
            [roleName]
        );
        return roles[0]?.Rol_Id;
    }
}

module.exports = UserModel;
