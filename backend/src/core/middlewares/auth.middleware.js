const jwt = require('jsonwebtoken');
const UserModel = require('../../modules/users/user.model');

const authMiddleware = async (req, res, next) => {
    try {
        // Verificar formato del header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Formato de token inválido' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verificar si el usuario existe y está activo
            const user = await UserModel.findById(decoded.id);
            if (!user) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Usuario no encontrado' 
                });
            }
            
            if (user.Usuario_Estado !== 1) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Usuario inactivo' 
                });
            }

            // Agregar información del usuario al request
            req.user = {
                id: decoded.id,
                correo: decoded.correo,
                rol: decoded.rol
            };
            
            next();
        } catch (jwtError) {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido o expirado',
                error: jwtError.message 
            });
        }
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error en la autenticación',
            error: error.message 
        });
    }
};

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'Administrador') {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            message: 'Acceso denegado: se requiere rol de administrador' 
        });
    }
};

// Middleware para verificar roles específicos
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (req.user && allowedRoles.includes(req.user.rol)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
            });
        }
    };
};

module.exports = {
    authMiddleware,
    isAdmin,
    hasRole
};
