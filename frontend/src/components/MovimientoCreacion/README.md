# Componentes de Creación de Movimientos

Esta carpeta contiene los componentes especializados para el módulo de creación de movimientos de inventario.

## Componentes

### 🔍 SearchProducto
**Archivo:** `SearchProducto.jsx`

Componente inteligente de búsqueda de productos con las siguientes características:

- **Búsqueda avanzada**: Por nombre, SKU, código de barras o ID
- **Detección de escaneo**: Reconoce cuando se pega un código escaneado
- **Navegación por teclado**: Flechas arriba/abajo, Enter para seleccionar, Esc para cancelar
- **Stock contextual**: Muestra el stock según el tipo de movimiento y bodegas seleccionadas
- **Filtrado inteligente**: Excluye productos ya seleccionados

**Props:**
- `onProductSelected`: Función callback cuando se selecciona un producto
- `tipoMovimiento`: Tipo de movimiento (entrada/salida/transferencia/ajuste)
- `bodegaOrigenId`: ID de bodega origen para obtener stock
- `bodegaDestinoId`: ID de bodega destino para obtener stock
- `itemsYaSeleccionados`: Array de items ya seleccionados (para filtrar)

### 📦 ItemSelector
**Archivo:** `ItemSelector.jsx`

Componente para mostrar y editar un item individual seleccionado:

- **Validación en tiempo real**: Valida stock según el tipo de movimiento
- **Stock contextual**: Muestra stock de la bodega correcta según el tipo
- **Indicadores visuales**: Colores y iconos según el estado del stock
- **Cálculos automáticos**: Muestra stock resultante después del movimiento
- **Alertas inteligentes**: Avisos de stock insuficiente o límites

**Props:**
- `producto`: Objeto con datos del producto
- `onCantidadChange`: Callback cuando cambia la cantidad
- `onRemove`: Callback para remover el item
- `tipoMovimiento`: Tipo de movimiento
- `bodegaOrigenId`: ID de bodega origen
- `bodegaDestinoId`: ID de bodega destino

### 📋 TablaItems
**Archivo:** `TablaItems.jsx`

Componente contenedor que maneja la lista completa de items:

- **Búsqueda integrada**: Incluye SearchProducto para agregar items
- **Lista dinámica**: Muestra todos los items seleccionados
- **Validaciones globales**: Valida toda la lista antes del envío
- **Resumen automático**: Calcula totales y estadísticas
- **Información contextual**: Adapta labels y comportamiento según el tipo de movimiento

**Props:**
- `items`: Array de items seleccionados
- `onItemAdd`: Callback para agregar item
- `onItemUpdate`: Callback para actualizar item
- `onItemRemove`: Callback para remover item
- `tipoMovimiento`: Tipo de movimiento
- `bodegaOrigenId`: ID de bodega origen
- `bodegaDestinoId`: ID de bodega destino
- `loading`: Estado de carga

## Lógica de Stock por Tipo de Movimiento

### 🔄 Entrada
- **Stock mostrado**: Stock actual en bodega destino
- **Validación**: Solo cantidad > 0
- **Cálculo**: Stock resultante = Stock actual + Cantidad

### 🔄 Salida  
- **Stock mostrado**: Stock disponible en bodega origen
- **Validación**: Cantidad ≤ Stock disponible
- **Cálculo**: Stock resultante = Stock actual - Cantidad

### 🔄 Transferencia
- **Stock mostrado**: Stock disponible en bodega origen
- **Validación**: Cantidad ≤ Stock disponible 
- **Cálculo**: Stock resultante = Stock origen - Cantidad

### 🔄 Ajuste
- **Stock mostrado**: Stock actual en bodega
- **Validación**: Solo cantidad > 0
- **Cálculo**: Nueva cantidad = Cantidad ingresada

## Características Especiales

### 🎯 Detección de Escaneo
Los componentes detectan cuando se escanea un código (simulado por paste rápido) y automáticamente:
1. Seleccionan el producto encontrado
2. Obtienen el stock actualizado
3. Preguntan por la cantidad deseada

### 🔍 Búsqueda Inteligente
- Búsqueda en tiempo real mientras se escribe
- Máximo 10 resultados para mejor rendimiento  
- Filtrado de productos ya seleccionados
- Búsqueda por múltiples campos (nombre, SKU, código de barras)

### ✅ Validaciones en Tiempo Real
- Stock insuficiente (❌ rojo)
- Stock límite (⚠️ amarillo)  
- Stock normal (✅ verde)
- Cantidad vacía (⚪ gris)

### 🎨 UI/UX Mejorada
- Colores contextuales según el tipo de movimiento
- Iconos descriptivos para cada acción
- Tooltips informativos
- Estados de carga elegantes
- Mensajes de error claros

## Integración con Servicios

Los componentes utilizan:
- **existenciaService**: Para obtener stock en tiempo real
- **itemService**: Para búsqueda y datos de productos
- **toast**: Para notificaciones elegantes

## Uso en CrearMovimiento.jsx

```jsx
import { TablaItems } from '../components/MovimientoCreacion';

<TablaItems
    items={itemsMovimiento}
    onItemAdd={handleItemAdd}
    onItemUpdate={handleItemUpdate}
    onItemRemove={handleItemRemove}
    tipoMovimiento={tipo}
    bodegaOrigenId={movimientoData.Origen_Bodega_Id}
    bodegaDestinoId={movimientoData.Destino_Bodega_Id}
    loading={isLoading}
/>
```