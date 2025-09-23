# Componente BodegaSelector

Selector de bodegas reutilizable que utiliza el componente Select avanzado. Optimizado para la gestión de almacenes en KardexPlus.

## Características

- ✅ **Basado en Select avanzado**: Búsqueda, navegación con teclado, etc.
- ✅ **Carga automática**: Obtiene bodegas del backend automáticamente
- ✅ **Filtros**: Excluir bodegas específicas
- ✅ **Opción "Todas"**: Para filtros globales
- ✅ **Estados visuales**: Loading, error, vacío
- ✅ **Bodegas inactivas**: Se muestran deshabilitadas
- ✅ **Mobile-first**: Optimizado para dispositivos móviles

## Uso Básico

```jsx
import { BodegaSelector } from '../components/common';

const MiComponente = () => {
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState('');

  return (
    <BodegaSelector
      value={bodegaSeleccionada}
      onChange={setBodegaSeleccionada}
      required
    />
  );
};
```

## Props

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `value` | `string` | `''` | ID de la bodega seleccionada |
| `onChange` | `Function` | - | Callback al cambiar (`(bodegaId) => {}`) |
| `label` | `string` | `'Almacén'` | Label del selector |
| `placeholder` | `string` | `'Seleccionar almacén...'` | Texto placeholder |
| `required` | `boolean` | `false` | Si es requerido |
| `disabled` | `boolean` | `false` | Si está deshabilitado |
| `showAllOption` | `boolean` | `false` | Mostrar opción "Todas" |
| `allOptionLabel` | `string` | `'Todas las bodegas'` | Texto para opción "todas" |
| `allOptionValue` | `string` | `''` | Valor para opción "todas" |
| `excludeBodegas` | `Array` | `[]` | IDs de bodegas a excluir |
| `size` | `'sm'|'md'|'lg'` | `'md'` | Tamaño del componente |
| `className` | `string` | `''` | Clases CSS adicionales |
| `onLoadComplete` | `Function` | - | Callback post-carga (`(bodegas) => {}`) |
| `error` | `string` | - | Mensaje de error |

## Ejemplos

### Selector Básico
```jsx
<BodegaSelector
  label="Almacén de Origen"
  value={origenBodega}
  onChange={setOrigenBodega}
  required
/>
```

### Con Opción "Todas" (para filtros)
```jsx
<BodegaSelector
  label="Filtrar por Almacén"
  value={filtroActivo}
  onChange={setFiltroActivo}
  showAllOption
  allOptionLabel="Ver todos los almacenes"
  placeholder="Filtrar por almacén..."
/>
```

### Excluyendo Bodegas Específicas
```jsx
<BodegaSelector
  label="Almacén de Destino"
  value={destinoBodega}
  onChange={setDestinoBodega}
  excludeBodegas={[bodegaOrigen]} // Excluir la bodega origen
  required
/>
```

### Con Callback de Carga
```jsx
<BodegaSelector
  value={bodegaActiva}
  onChange={setBodegaActiva}
  onLoadComplete={(bodegas) => {
    console.log(`Cargadas ${bodegas.length} bodegas`);
    // Seleccionar primera bodega por defecto
    if (bodegas.length > 0 && !bodegaActiva) {
      setBodegaActiva(bodegas[0].Bodega_Id);
    }
  }}
/>
```

### Selector Pequeño (para toolbars)
```jsx
<BodegaSelector
  value={bodegaRapida}
  onChange={setBodegaRapida}
  size="sm"
  placeholder="Almacén..."
  className="w-48"
/>
```

## Estados del Componente

### Loading
- Muestra spinner y texto "Cargando almacenes..."
- Selector deshabilitado durante la carga

### Error
- Muestra mensaje de error
- Botón "Intentar nuevamente" para recargar

### Sin Bodegas
- Muestra advertencia cuando no hay bodegas disponibles
- Sugiere contactar al administrador

### Bodegas Inactivas
- Se muestran en el dropdown pero deshabilitadas
- Permite visualizar pero no seleccionar

## Integración en el Sistema

### Para Filtros Globales
```jsx
// En página de Items/Existencias/Movimientos
<BodegaSelector
  label="Filtrar por Almacén"
  value={filtros.bodega}
  onChange={(bodegaId) => setFiltros(prev => ({
    ...prev,
    bodega: bodegaId
  }))}
  showAllOption
  allOptionLabel="Todos los almacenes"
  allOptionValue=""
/>
```

### Para Formularios de Movimientos
```jsx
// Ya implementado en FormularioMovimiento.jsx
<BodegaSelector
  label="Almacén de Origen"
  value={movimientoData.Origen_Bodega_Id}
  onChange={(bodegaId) => setMovimientoData({
    ...movimientoData,
    Origen_Bodega_Id: bodegaId
  })}
  required
  excludeBodegas={[movimientoData.Destino_Bodega_Id]}
/>
```

### Para Dashboard/Resumen
```jsx
// En ResumenBodegas para cambiar contexto
<BodegaSelector
  label="Ver Resumen de"
  value={contextoBodega}
  onChange={setContextoBodega}
  showAllOption
  allOptionLabel="Todas las bodegas"
  size="sm"
/>
```

## Casos de Uso Comunes

1. **Selección de almacén activo**: En headers/toolbars
2. **Filtros de páginas**: Items, Existencias, Movimientos  
3. **Formularios**: Creación de movimientos, transferencias
4. **Configuración**: Ajustes por bodega
5. **Reportes**: Selección de alcance de reportes

## Ventajas sobre Select Manual

- ✅ **Carga automática**: No necesitas manejar el estado de bodegas
- ✅ **Estados integrados**: Loading, error, vacío automáticamente
- ✅ **Filtrado inteligente**: Bodegas inactivas, exclusiones
- ✅ **Consistencia**: Mismo comportamiento en toda la app
- ✅ **Mantenimiento**: Cambios centralizados

## Migración desde Select Manual

```jsx
// ❌ Antes - Select manual
const [bodegas, setBodegas] = useState([]);
useEffect(() => {
  bodegaService.getAllBodegas().then(res => setBodegas(res.data));
}, []);

<Select
  options={bodegas.map(b => ({value: b.Bodega_Id, label: b.Bodega_Nombre}))}
  value={bodegaId}
  onChange={setBodegaId}
/>

// ✅ Ahora - BodegaSelector
<BodegaSelector
  value={bodegaId}
  onChange={setBodegaId}
/>
```