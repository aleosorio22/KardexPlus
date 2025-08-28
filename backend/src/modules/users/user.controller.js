const UserModel = require('./User.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../core/config/database');

/**
 * Autentica un usuario y genera un token JWT
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.login = async (req, res) => {
    try {
        const { Usuario_Correo, Usuario_Contrasena } = req.body;

        // Validar campos requeridos
        if (!Usuario_Correo || !Usuario_Contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Correo y contraseña son requeridos'
            });
        }

        // Buscar usuario por correo
        const user = await UserModel.findByEmail(Usuario_Correo);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si el usuario está activo
        if (user.Usuario_Estado !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Verificar contraseña
        const isValidPassword = await UserModel.verifyPassword(Usuario_Contrasena, user.Usuario_Contrasena);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: user.Usuario_Id,
                correo: user.Usuario_Correo,
                rol: user.Rol_Nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '7d' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    Usuario_Id: user.Usuario_Id,
                    Usuario_Nombre: user.Usuario_Nombre,
                    Usuario_Apellido: user.Usuario_Apellido,
                    Usuario_Correo: user.Usuario_Correo,
                    Rol_Nombre: user.Rol_Nombre,
                    Rol_Descripcion: user.Rol_Descripcion
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Crea el usuario administrador inicial del sistema
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.createAdminUser = async (req, res) => {
    try {
        // Verificar si ya existe un administrador
        const adminExists = await UserModel.adminExists();
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario administrador en el sistema'
            });
        }

        // Obtener el ID del rol de Administrador
        const adminRoleId = await UserModel.getRoleIdByName('Administrador');
        if (!adminRoleId) {
            return res.status(500).json({
                success: false,
                message: 'No se encontró el rol de Administrador'
            });
        }

        // Datos del usuario administrador
        const adminData = {
            Usuario_Nombre: 'admin',
            Usuario_Apellido: 'admin',
            Usuario_Correo: 'admin@kardexplus.com',
            Usuario_Contrasena: 'admin123',
            Rol_Id: adminRoleId
        };

        const userId = await UserModel.create(adminData);

        res.status(201).json({
            success: true,
            message: 'Usuario administrador creado exitosamente',
            data: {
                Usuario_Id: userId,
                Usuario_Correo: adminData.Usuario_Correo,
                Rol: 'Administrador'
            }
        });
    } catch (error) {
        console.error('Error al crear usuario administrador:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Registra un nuevo usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.register = async (req, res) => {
    try {
        const userId = await UserModel.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: { Usuario_Id: userId }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtiene todos los usuarios
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT u.Usuario_Id, u.Usuario_Nombre, u.Usuario_Apellido, u.Usuario_Correo, 
                   u.Usuario_Estado, r.Rol_Nombre, r.Rol_Descripcion
            FROM usuarios u 
            LEFT JOIN roles r ON u.Rol_Id = r.Rol_Id 
            WHERE u.Usuario_Estado = 1
        `);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtiene un usuario por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Actualiza un usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.updateUser = async (req, res) => {
    try {
        const { Usuario_Nombre, Usuario_Apellido, Usuario_Correo, Rol_Id } = req.body;
        
        const [result] = await db.execute(
            'UPDATE usuarios SET Usuario_Nombre = ?, Usuario_Apellido = ?, Usuario_Correo = ?, Rol_Id = ? WHERE Usuario_Id = ? AND Usuario_Estado = 1',
            [Usuario_Nombre, Usuario_Apellido, Usuario_Correo, Rol_Id, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Actualiza la contraseña de un usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        
        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        const [result] = await db.execute(
            'UPDATE usuarios SET Usuario_Contrasena = ? WHERE Usuario_Id = ? AND Usuario_Estado = 1',
            [hashedPassword, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Elimina (desactiva) un usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.deleteUser = async (req, res) => {
    try {
        const [result] = await db.execute(
            'UPDATE usuarios SET Usuario_Estado = 0 WHERE Usuario_Id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtiene el perfil del usuario autenticado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtiene usuarios disponibles (que no son administradores y están activos)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getAvailableUsers = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT u.Usuario_Id, u.Usuario_Nombre, u.Usuario_Apellido, u.Usuario_Correo, 
                   u.Usuario_Estado, r.Rol_Nombre
            FROM usuarios u 
            LEFT JOIN roles r ON u.Rol_Id = r.Rol_Id
            WHERE u.Usuario_Estado = 1 
            AND r.Rol_Nombre != 'Administrador'
        `);
        
        res.json({
            success: true,
            data: rows || []
        });
    } catch (error) {
        console.error('Error al obtener usuarios disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios disponibles',
            data: []
        });
    }
};