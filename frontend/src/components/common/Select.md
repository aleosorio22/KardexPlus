# Componente Select

Componente de selección personalizado para KardexPlus. Reemplaza los selectores nativos con una interfaz más atractiva y funcionalidad avanzada.

## Características

- ✅ **Mobile-first**: Optimizado para dispositivos móviles
- ✅ **Búsqueda**: Permite filtrar opciones en tiempo real
- ✅ **Navegación con teclado**: Soporte completo de teclas (↑↓, Enter, Esc)
- ✅ **Limpieza**: Opción de limpiar selección
- ✅ **Estados visuales**: Error, disabled, required
- ✅ **Tamaños**: sm, md, lg
- ✅ **Accesible**: Labels, ARIA, focus management

## Uso Básico

```jsx
import { Select } from '../components/common';

const MiComponente = () => {
  const [valor, setValor] = useState('');
  
  const opciones = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3', disabled: true }
  ];

  return (
    <Select
      label="Mi Campo"
      value={valor}
      onChange={setValor}
      options={opciones}
      placeholder="Seleccionar..."
      required
    />
  );
};
```

## Props

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `options` | `Array<{value, label, disabled?}>` | `[]` | Array de opciones |
| `value` | `string\|number` | `''` | Valor seleccionado |
| `onChange` | `Function` | - | Callback al cambiar (`(value) => {}`) |
| `placeholder` | `string` | `'Seleccionar...'` | Texto placeholder |
| `label` | `string` | - | Label del campo |
| `required` | `boolean` | `false` | Si es requerido |
| `disabled` | `boolean` | `false` | Si está deshabilitado |
| `searchable` | `boolean` | `true` | Si permite búsqueda |
| `clearable` | `boolean` | `false` | Si permite limpiar |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | Tamaño del componente |
| `className` | `string` | `''` | Clases CSS adicionales |

## Ejemplos

### Select Básico
```jsx
<Select
  options={[
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' }
  ]}
  value={idioma}
  onChange={setIdioma}
  placeholder="Seleccionar idioma..."
/>
```

### Select con Búsqueda
```jsx
<Select
  label="País"
  options={paises}
  value={paisSeleccionado}
  onChange={setPaisSeleccionado}
  searchable
  placeholder="Buscar país..."
/>
```

### Select con Error
```jsx
<Select
  label="Categoría"
  options={categorias}
  value={categoria}
  onChange={setCategoria}
  required
  error={errores.categoria}
  placeholder="Seleccionar categoría..."
/>
```

### Select Pequeño
```jsx
<Select
  options={tamaños}
  value={tamaño}
  onChange={setTamaño}
  size="sm"
  placeholder="Tamaño..."
/>
```

### Select con Limpieza
```jsx
<Select
  label="Filtro Opcional"
  options={filtros}
  value={filtro}
  onChange={setFiltro}
  clearable
  placeholder="Aplicar filtro..."
/>
```

## Navegación con Teclado

- **↑/↓**: Navegar entre opciones
- **Enter**: Seleccionar opción resaltada
- **Esc**: Cerrar dropdown
- **Typing**: Buscar opciones (si `searchable=true`)

## Estilos y Temas

El componente usa Tailwind CSS y sigue el sistema de diseño de KardexPlus:

- **Colores**: Azul para focus/active, rojo para errores
- **Bordes**: Redondeados (rounded-lg)
- **Shadows**: Sutiles para dropdown
- **Transiciones**: Suaves en todos los estados

## Estados Visuales

### Normal
- Borde gris claro
- Fondo blanco
- Hover: borde más oscuro

### Focus/Active
- Borde azul
- Ring azul
- Fondo azul muy claro

### Error
- Borde rojo
- Ring rojo
- Fondo rojo muy claro
- Mensaje de error debajo

### Disabled
- Fondo gris
- Texto gris
- Cursor not-allowed

## Responsive

- **Mobile**: Touch-friendly (min 44px altura)
- **Tablet/Desktop**: Tamaños más grandes disponibles
- **Dropdown**: Se ajusta automáticamente al ancho del contenedor

## Accesibilidad

- Labels semánticos
- Estados ARIA apropiados
- Navegación completa con teclado
- Focus management correcto
- Contraste de colores adecuado

## Integración en el Proyecto

Este componente está diseñado para reemplazar todos los `<select>` nativos en KardexPlus:

```jsx
// ❌ Antes
<select value={valor} onChange={(e) => setValor(e.target.value)}>
  <option value="">Seleccionar...</option>
  <option value="1">Opción 1</option>
</select>

// ✅ Ahora
<Select
  value={valor}
  onChange={setValor}
  options={[{ value: '1', label: 'Opción 1' }]}
  placeholder="Seleccionar..."
/>
```

## Casos de Uso Comunes

1. **Selección de bodegas**: Con búsqueda para muchas opciones
2. **Motivos de movimiento**: Con opciones predefinidas por tipo
3. **Filtros**: Con opción de limpiar selección
4. **Configuraciones**: Con estados disabled según permisos
5. **Formularios**: Con validación y estados de error