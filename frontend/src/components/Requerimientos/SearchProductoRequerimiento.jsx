import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiCamera, FiX, FiPackage } from 'react-icons/fi';
import { itemService } from '../../services/itemService';
import { BarcodeScanner } from '../BarcodeScanner';

const SearchProductoRequerimiento = ({ 
    onProductSelected, 
    bodegaOrigenId, 
    itemsYaSeleccionados = [],
    placeholder = "Buscar productos..." 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [scanMode, setScanMode] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    // Cargar productos al montar el componente
    useEffect(() => {
        loadProductos();
    }, []);

    // Filtrar productos cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim()) {
            filterProductos(searchTerm);
        } else {
            setFilteredProductos([]);
            setShowResults(false);
        }
        setSelectedIndex(-1);
    }, [searchTerm, productos]);

    // Cargar todos los productos disponibles
    const loadProductos = async () => {
        try {
            setLoading(true);
            const response = await itemService.getAllItems();
            if (response.success) {
                setProductos(response.data || []);
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar productos basado en el término de búsqueda
    const filterProductos = (term) => {
        const termLower = term.toLowerCase();
        const filtered = productos.filter(producto => {
            // Filtrar productos ya seleccionados
            const yaSeleccionado = itemsYaSeleccionados.some(item => item.Item_Id === producto.Item_Id);
            if (yaSeleccionado) return false;

            // Buscar en código, nombre o código de barras
            return (
                producto.Item_Codigo_SKU?.toLowerCase().includes(termLower) ||
                producto.Item_Nombre?.toLowerCase().includes(termLower) ||
                producto.Item_Codigo_Barra?.toLowerCase().includes(termLower)
            );
        });

        setFilteredProductos(filtered.slice(0, 10)); // Limitar a 10 resultados
        setShowResults(filtered.length > 0);
    };

    // Seleccionar producto
    const handleProductSelect = async (producto) => {
        try {
            // Llamar al callback con el producto seleccionado
            onProductSelected(producto);
            
            // Limpiar búsqueda
            setSearchTerm('');
            setShowResults(false);
            setSelectedIndex(-1);
            setScanMode(false);
            
            // Enfocar nuevamente el input
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            
        } catch (error) {
            console.error('Error seleccionando producto:', error);
        }
    };

    // Manejar navegación con teclado
    const handleKeyDown = (e) => {
        if (!showResults) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < filteredProductos.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && filteredProductos[selectedIndex]) {
                    handleProductSelect(filteredProductos[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowResults(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Manejar resultado del scanner
    const handleScanResult = async (code) => {
        try {
            setIsScannerOpen(false);
            
            // Buscar producto por código de barras
            const producto = productos.find(p => 
                p.Item_Codigo_Barra === code || 
                p.Item_Codigo_SKU === code
            );

            if (producto) {
                // Verificar si ya está seleccionado
                const yaSeleccionado = itemsYaSeleccionados.some(item => item.Item_Id === producto.Item_Id);
                if (!yaSeleccionado) {
                    await handleProductSelect(producto);
                } else {
                    alert('Este producto ya ha sido agregado');
                }
            } else {
                alert('Producto no encontrado');
            }
        } catch (error) {
            console.error('Error procesando escaneo:', error);
            alert('Error procesando el código escaneado');
        }
    };

    // Función para formatear precios
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    return (
        <div className="relative">
            {/* Input de búsqueda */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={bodegaOrigenId ? placeholder : "Primero selecciona una bodega de origen"}
                    disabled={!bodegaOrigenId || loading}
                    className="w-full pl-10 pr-20 py-2 border border-gray-200 rounded-lg 
                             bg-white text-gray-800 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                             transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                
                {/* Botones */}
                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                    {/* Botón scanner */}
                    <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        disabled={!bodegaOrigenId}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Escanear código de barras"
                    >
                        <FiCamera className="w-4 h-4" />
                    </button>
                    
                    {/* Botón limpiar */}
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setShowResults(false);
                                searchInputRef.current?.focus();
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Limpiar búsqueda"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Resultados de búsqueda */}
            {showResults && (
                <div 
                    ref={resultsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 
                             rounded-lg shadow-lg max-h-80 overflow-y-auto"
                >
                    {filteredProductos.map((producto, index) => (
                        <div
                            key={producto.Item_Id}
                            onClick={() => handleProductSelect(producto)}
                            className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0
                                      hover:bg-gray-50 transition-colors
                                      ${index === selectedIndex ? 'bg-green-50' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <FiPackage className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-800">
                                            {producto.Item_Codigo_SKU}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {producto.UnidadMedida_Prefijo || 'Und'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {producto.Item_Nombre}
                                    </div>
                                    {producto.CategoriaItem_Nombre && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {producto.CategoriaItem_Nombre}
                                        </div>
                                    )}
                                    {producto.Item_Precio_Venta && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formatPrice(producto.Item_Precio_Venta)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="p-3 text-center text-gray-500">
                            Cargando productos...
                        </div>
                    )}
                </div>
            )}

            {/* Scanner modal */}
            {isScannerOpen && (
                <BarcodeScanner
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScanSuccess={handleScanResult}
                />
            )}
        </div>
    );
};

export default SearchProductoRequerimiento;