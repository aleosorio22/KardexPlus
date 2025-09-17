// =======================================
// COMPONENTES DE CREACIÓN DE MOVIMIENTOS
// Exportación centralizada de componentes para el módulo de movimientos
// =======================================

export { default as SearchProducto } from './SearchProducto';
export { default as ItemSelector } from './ItemSelector';
export { default as TablaItems } from './TablaItems';

// Re-exportar servicios relacionados para conveniencia
export { existenciaService } from '../../services/existenciaService';
export { itemService } from '../../services/itemService';