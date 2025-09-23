require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');


// Configuración de variables de entorno
dotenv.config();

// Importar la configuración de la base de datos
const db = require('./core/config/database');

//importar rutas
const userRoutes = require('./modules/users/user.routes');
const permissionsRoutes = require('./modules/permissions/permissions.routes');
const roleRoutes = require('./modules/roles/role.routes');
const setupRoutes = require('./modules/setup/setup.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const unidadMedidaRoutes = require('./modules/unidades-medida/unidad-medida.routes');
const itemRoutes = require('./modules/items/item.routes');
const itemPresentacionRoutes = require('./modules/item-presentaciones/item-presentacion.routes');
const bodegaRoutes = require('./modules/bodegas/bodega.routes');
const existenciaRoutes = require('./modules/existencias/existencia.routes');
const itemBodegaParamRoutes = require('./modules/existencias/itemBodegaParam.routes');
const movimientoRoutes = require('./modules/movimientos/movimiento.routes');


// Inicializar app
const app = express();

//cors para permitir solicitudes desde el frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://kardexplus.netlify.app',
      'https://kardexplus.cafeelangel.com',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    
    // En desarrollo, permitir cualquier localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('No permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API de Sistema de Inventarios para Café El Ángel' });
});

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Rutas de permisos
app.use('/api/permissions', permissionsRoutes);

// Rutas de roles
app.use('/api/roles', roleRoutes);

// Rutas de categorías
app.use('/api/categories', categoryRoutes);

// Rutas de unidades de medida
app.use('/api/unidades-medida', unidadMedidaRoutes);

// Rutas de items
app.use('/api/items', itemRoutes);

// Rutas de presentaciones de items
app.use('/api/item-presentaciones', itemPresentacionRoutes);

// Rutas de bodegas
app.use('/api/bodegas', bodegaRoutes);

// Rutas de existencias
app.use('/api/existencias', existenciaRoutes);

// Rutas de parámetros de items por bodega
app.use('/api/item-bodega-parametros', itemBodegaParamRoutes);

// Rutas de movimientos de inventario
app.use('/api/movimientos', movimientoRoutes);

// Rutas de configuración temporal (para desarrollo)
app.use('/api/setup', setupRoutes);

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

