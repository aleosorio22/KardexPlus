//// ==============================
////   MODULO USUARIOS Y ROLES
//// ==============================

Table Usuarios {
  Usuario_Id int [pk, increment]
  Usuario_Nombre nvarchar(25) [not null]
  Usuario_Apellido nvarchar(25) [not null]
  Usuario_Correo nvarchar(50) [not null, unique]
  Usuario_Contrasena nvarchar(255) [not null]
  Usuario_Estado bool [default: true]
  Rol_Id int [ref: > Roles.Rol_Id]
}

Table Roles {
  Rol_Id int [pk, increment]
  Rol_Nombre nvarchar(25) [not null, unique]
  Rol_Descripcion nvarchar(100)
}

tablegroup usuarios_roles [color: #2980b9] {
  Usuarios
  Roles
}

//// ==============================
////   MODULO INVENTARIO E ITEMS
//// ==============================

Table CategoriasItems {
  CategoriaItem_Id int [pk, increment]
  CategoriaItem_Nombre nvarchar(50) [not null, unique]
  CategoriaItem_Descripcion nvarchar(150)
}

Table Items {
  Item_Id int [pk, increment]
  Item_Codigo_SKU nvarchar(20)
  Item_Codigo_Barra nvarchar(20)
  Item_Nombre nvarchar(50) [not null, unique]
  Item_Costo_Unitario decimal(10,2) [not null]
  Item_Precio_Sugerido decimal(10,2)
  Item_Stock_Min int
  Item_Stock_Max int
  Item_Estado bool [default: true]
  Item_Fecha_Creacion datetime
  Item_Fecha_Actualizacion datetime
  CategoriaItem_Id int [ref: > CategoriasItems.CategoriaItem_Id]
}

Table UnidadesMedida {
  UnidadMedida_Id int [pk, increment]
  UnidadMedida_Nombre nvarchar(30) [not null, unique]
  UnidadMedida_Prefijo nvarchar(5) [not null, unique]
  UnidadMedida_Factor_Conversion decimal(10,4)
}

Table Presentaciones {
  Presentacion_Id int [pk, increment]
  Presentacion_Nombre nvarchar(30) [not null, unique]
  Presentacion_Cantidad decimal(10,2) [not null]
  UnidadMedida_Id int [ref: > UnidadesMedida.UnidadMedida_Id]
}

Table Items_Presentaciones {
  Item_Presentaciones_Id int [pk, increment]
  Item_Id int [ref: > Items.Item_Id]
  Presentacion_Id int [ref: > Presentaciones.Presentacion_Id]
  Item_Presentacion_CodigoSKU nvarchar(20)
  Item_Presentaciones_CodigoBarras nvarchar(20)
  Item_Presentaciones_Costo decimal(10,2)
  Item_Presentaciones_Precio decimal(10,2)
}

tablegroup inventario [color: #27ae60] {
  CategoriasItems
  Items
  Items_Presentaciones
}

tablegroup presentaciones [color: #2ecc71] {
  UnidadesMedida
  Presentaciones
}

//// ==============================
////   MODULO BODEGAS Y EXISTENCIAS
//// ==============================

Table Bodegas {
  Bodega_Id int [pk, increment]
  Bodega_Nombre nvarchar(50) [not null, unique]
  Bodega_Tipo nvarchar(30) // Central, Producción, Frío, etc.
  Bodega_Ubicacion nvarchar(100)
  Responsable_Id int [ref: > Usuarios.Usuario_Id]
  Bodega_Estado bool [default: true]
}

Table Existencias {
  Existencia_Id int [pk, increment]
  Bodega_Id int [ref: > Bodegas.Bodega_Id]
  Item_Id int [ref: > Items.Item_Id]
  Cantidad decimal(14,4) [default: 0]
  Fecha_Ultima_Actualizacion datetime
}

tablegroup bodegas [color: #8e44ad] {
  Bodegas
  Existencias
}

//// ==============================
////   MODULO MOVIMIENTOS (KARDEX)
//// ==============================

Table Movimientos {
  Movimiento_Id int [pk, increment]
  Tipo_Movimiento nvarchar(20) // Entrada, Salida, Transferencia
  Fecha datetime
  Usuario_Id int [ref: > Usuarios.Usuario_Id]
  Recepcionista nvarchar(50)
  Origen_Bodega_Id int [ref: > Bodegas.Bodega_Id]
  Destino_Bodega_Id int [ref: > Bodegas.Bodega_Id]
  Motivo nvarchar(100)
  Observaciones text
}

Table Movimientos_Detalle {
  Movimiento_Detalle_Id int [pk, increment]
  Movimiento_Id int [ref: > Movimientos.Movimiento_Id]
  Item_Id int [ref: > Items.Item_Id]
  Cantidad decimal(14,4)
}

tablegroup movimientos [color: #e67e22] {
  Movimientos
  Movimientos_Detalle
}

//// ==============================
////   MODULO REQUERIMIENTOS ENTRE BODEGAS
//// ==============================

Table Requerimientos {
  Requerimiento_Id int [pk, increment]
  Fecha datetime [default: "current_timestamp"]
  Usuario_Solicita_Id int [ref: > Usuarios.Usuario_Id]
  Origen_Bodega_Id int [ref: > Bodegas.Bodega_Id]   // Bodega que surtirá
  Destino_Bodega_Id int [ref: > Bodegas.Bodega_Id]  // Bodega que solicita
  Estado nvarchar(20) // Pendiente, Aprobado, Rechazado, Completado
  Observaciones text
}

Table Requerimientos_Detalle {
  Requerimiento_Detalle_Id int [pk, increment]
  Requerimiento_Id int []
  Item_Id int [ref: > Items.Item_Id]
  Cantidad_Solicitada decimal(14,4)
  Cantidad_Despachada decimal(14,4)
}

tablegroup requerimientos [color: #f39c12] {
  Requerimientos
  Requerimientos_Detalle
}

//// ==============================
////   MODULO PRODUCCIÓN
//// ==============================

// Table Produccion {
//   Produccion_Id int [pk]
//   Fecha datetime
//   Usuario_Id int [ref: > Usuarios.Usuario_Id]
//   Producto_Final_Id int [ref: > Items.Item_Id]
//   Cantidad_Producida decimal(14,4)
//   Observaciones text
// }

// Table Produccion_Detalle {
//   Produccion_Detalle_Id int [pk]
//   Produccion_Id int [ref: > Produccion.Produccion_Id]
//   Item_Id int [ref: > Items.Item_Id]
//   Cantidad_Utilizada decimal(14,4)
// }

//// ==============================
////   MODULO COMPRAS Y PROVEEDORES
//// ==============================

Table Proveedores {
  Proveedor_Id int [pk, increment]
  Nombre nvarchar(50)
  Contacto nvarchar(50)
  Telefono nvarchar(20)
  Email nvarchar(50)
  Direccion nvarchar(100)
  Estado bool [default: true]
}

Table Solicitudes_Compra {
  Solicitud_Id int [pk, increment]
  Usuario_Solicita_Id int [ref: > Usuarios.Usuario_Id]
  Fecha_Solicitud datetime
  Estado nvarchar(20) // Pendiente, Aprobada, Rechazada, Cerrada
  Motivo text
  Fecha_Aprobacion datetime
  Usuario_Aprueba_Id int [ref: > Usuarios.Usuario_Id]
  Observaciones text
}

Table Solicitudes_Compra_Detalle {
  Solicitud_Detalle_Id int [pk, increment]
  Solicitud_Id int [ref: > Solicitudes_Compra.Solicitud_Id]
  Item_Id int [ref: > Items.Item_Id]
  Cantidad_Solicitada decimal(14,4)
  Cantidad_Aprobada decimal(14,4)
}

Table Compras {
  Compra_Id int [pk, increment]
  Proveedor_Id int [ref: > Proveedores.Proveedor_Id]
  Fecha_Compra datetime
  Usuario_Registra_Id int [ref: > Usuarios.Usuario_Id]
  Solicitud_Id int [ref: > Solicitudes_Compra.Solicitud_Id]
  Total decimal(14,2)
  Estado nvarchar(20) // Registrada, Recibida, Anulada
  Observaciones text
}

Table Compras_Detalle {
  Compra_Detalle_Id int [pk, increment]
  Compra_Id int [ref: > Compras.Compra_Id]
  Item_Id int [ref: > Items.Item_Id]
  Cantidad decimal(14,4)
  Costo_Unitario decimal(10,2)
  Subtotal decimal(14,2)
}

tablegroup compras [color: #3498db] {
  Proveedores
  Solicitudes_Compra
  Solicitudes_Compra_Detalle
  Compras
  Compras_Detalle
}

//// ==============================
////   MODULO AUDITORÍA
//// ==============================

Table Auditoria {
  Auditoria_Id int [pk, increment]
  Tabla_Afectada nvarchar(50)
  Registro_Id int
  Usuario_Id int [ref: > Usuarios.Usuario_Id]
  Accion nvarchar(20) // Insert, Update, Delete
  Fecha datetime
  Valores_Anteriores text
  Valores_Nuevos text
}

tablegroup auditoria [color: #7f8c8d] {
  Auditoria
}