/**
 * Utilidades para formateo de números y moneda
 */

/**
 * Formatea un número de manera inteligente mostrando solo los decimales necesarios
 * @param {number|string} value - El valor a formatear
 * @param {number} maxDecimals - Máximo número de decimales a mostrar (default: 4)
 * @param {number} minDecimals - Mínimo número de decimales a mostrar (default: 2)
 * @returns {string} - Número formateado
 */
export const formatNumber = (value, maxDecimals = 4, minDecimals = 2) => {
  const num = parseFloat(value || 0);
  
  // Si es cero, mostrar con los decimales mínimos
  if (num === 0) {
    return num.toFixed(minDecimals);
  }
  
  // Formatear con el máximo de decimales
  const formatted = num.toFixed(maxDecimals);
  
  // Remover ceros innecesarios del final
  const trimmed = formatted.replace(/\.?0+$/, '');
  const decimalPart = trimmed.split('.')[1];
  
  // Si no tiene decimales o tiene menos que el mínimo, formatear con mínimo
  if (!decimalPart || decimalPart.length < minDecimals) {
    return num.toFixed(minDecimals);
  }
  
  return trimmed;
};

/**
 * Formatea un valor como moneda (hasta 4 decimales si es necesario)
 * @param {number|string} value - El valor a formatear
 * @returns {string} - Valor formateado como moneda
 */
export const formatCurrency = (value) => {
  return formatNumber(value, 4, 2);
};

/**
 * Formatea una cantidad (hasta 4 decimales si es necesario)
 * @param {number|string} value - El valor a formatear
 * @returns {string} - Valor formateado como cantidad
 */
export const formatQuantity = (value) => {
  return formatNumber(value, 4, 0);
};

/**
 * Formatea un porcentaje
 * @param {number|string} value - El valor a formatear (como decimal, ej: 0.15 para 15%)
 * @param {number} decimals - Número de decimales a mostrar (default: 2)
 * @returns {string} - Valor formateado como porcentaje
 */
export const formatPercentage = (value, decimals = 2) => {
  const num = parseFloat(value || 0) * 100;
  return `${num.toFixed(decimals)}%`;
};

/**
 * Parsea un valor numérico de forma segura
 * @param {any} value - El valor a parsear
 * @param {number} defaultValue - Valor por defecto si el parseo falla
 * @returns {number} - Número parseado o valor por defecto
 */
export const safeParseFloat = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parsea un valor entero de forma segura
 * @param {any} value - El valor a parsear
 * @param {number} defaultValue - Valor por defecto si el parseo falla
 * @returns {number} - Número entero parseado o valor por defecto
 */
export const safeParseInt = (value, defaultValue = 0) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Ejemplos de uso:
 * 
 * formatNumber(10) -> "10.00"
 * formatNumber(10.0000) -> "10.00"
 * formatNumber(10.5) -> "10.50"
 * formatNumber(10.1234) -> "10.1234"
 * formatNumber(10.1200) -> "10.12"
 * 
 * formatCurrency(150.2285) -> "150.2285"
 * formatCurrency(150.00) -> "150.00"
 * formatCurrency(150) -> "150.00"
 * 
 * formatQuantity(12.5000) -> "12.5"
 * formatQuantity(12) -> "12"
 * formatQuantity(12.1234) -> "12.1234"
 */
