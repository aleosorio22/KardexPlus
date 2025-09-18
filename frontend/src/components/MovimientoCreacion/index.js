// =======================================
// COMPONENTES DE CREACIÓN DE MOVIMIENTOS
// Exportación centralizada de componentes para el módulo de movimientos
// =======================================

export { default as SearchProducto } from './SearchProducto';
export { default as ItemSelector } from './ItemSelector';
export { default as TablaItems } from './TablaItems';
export { default as HeaderMovimiento } from './HeaderMovimiento';
export { default as FormularioMovimiento } from './FormularioMovimiento';
export { default as AccionesMovimiento } from './AccionesMovimiento';

// Re-exportar servicios relacionados para conveniencia
export { existenciaService } from '../../services/existenciaService';
export { itemService } from '../../services/itemService';