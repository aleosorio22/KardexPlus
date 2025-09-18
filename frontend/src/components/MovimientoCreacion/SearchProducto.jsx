import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiCamera, FiX, FiPackage } from 'react-icons/fi';
import { itemService } from '../../services/itemService';
import { existenciaService } from '../../services/existenciaService';
import { BarcodeScanner } from '../BarcodeScanner';

const SearchProducto = ({ 
    onProductSelected, 
    tipoMovimiento, 
    bodegaOrigenId, 
    bodegaDestinoId, 
    itemsYaSeleccionados = [] 
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

    // Manejar detección de escaneo (simulado por paste o entrada rápida)
    useEffect(() => {
        const detectScan = (e) => {
            if (e.target === searchInputRef.current) {
                // Si se pega algo o se escribe muy rápido, activar modo escaneo
                if (e.type === 'paste' || (searchTerm.length > 5 && !scanMode)) {
                    setScanMode(true);
                    setTimeout(() => {
                        if (filteredProductos.length > 0) {
                            handleProductSelect(filteredProductos[0]);
                        }
                        setScanMode(false);
                    }, 100);
                }
            }
        };

        document.addEventListener('paste', detectScan);
        return () => document.removeEventListener('paste', detectScan);
    }, [searchTerm, filteredProductos]);

    const loadProductos = async () => {
        try {
            setLoading(true);
            const response = await itemService.getAllItems();
            const itemsData = response.data || response.items || response || [];
            
            // Filtrar items activos
            const itemsActivos = itemsData.filter(item => item.Item_Estado === 1 || item.Item_Estado === true);
            setProductos(itemsActivos);
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProductos = (term) => {
        const searchLower = term.toLowerCase();
        const filtered = productos.filter(producto => {
            const matchesName = producto.Item_Nombre?.toLowerCase().includes(searchLower);
            const matchesSKU = producto.Item_Codigo_SKU?.toLowerCase().includes(searchLower);
            const matchesBarcode = producto.Item_Codigo_Barra?.toLowerCase().includes(searchLower);
            const matchesId = producto.Item_Id?.toString().includes(searchLower);
            
            // No mostrar items ya seleccionados
            const alreadySelected = itemsYaSeleccionados.some(item => 
                item.Item_Id === producto.Item_Id
            );
            
            return (matchesName || matchesSKU || matchesBarcode || matchesId) && !alreadySelected;
        });

        setFilteredProductos(filtered.slice(0, 10)); // Limitar a 10 resultados
        setShowResults(filtered.length > 0);
    };

    const handleProductSelect = async (producto) => {
        try {
            setLoading(true);
            
            // Determinar qué bodega usar para obtener el stock
            let bodegaParaStock = null;
            
            switch (tipoMovimiento) {
                case 'entrada':
                case 'ajuste':
                    // Para entrada y ajuste, mostrar stock del destino
                    bodegaParaStock = bodegaDestinoId;
                    break;
                case 'salida':
                case 'transferencia':
                    // Para salida y transferencia, mostrar stock del origen
                    bodegaParaStock = bodegaOrigenId;
                    break;
            }

            let stockActual = 0;
            
            if (bodegaParaStock) {
                try {
                    console.log(`Obteniendo stock para Item ${producto.Item_Id} en Bodega ${bodegaParaStock}`);
                    const existenciaResponse = await existenciaService.getExistenciaByBodegaAndItem(
                        bodegaParaStock, 
                        producto.Item_Id
                    );
                    console.log('Respuesta del servicio de existencias:', existenciaResponse);
                    
                    // El backend devuelve el campo 'Cantidad' - asegurar que sea número
                    stockActual = parseFloat(existenciaResponse.data?.Cantidad) || 0;
                                 
                    console.log(`Stock obtenido: ${stockActual}`);
                } catch (error) {
                    // Si es 404, significa que no hay existencia para ese item en esa bodega (stock = 0)
                    if (error.response?.status === 404) {
                        console.log('No existe registro de existencia, stock = 0');
                        stockActual = 0;
                    } else {
                        console.warn('Error obteniendo stock:', error);
                        stockActual = 0;
                    }
                }
            } else {
                console.log('No hay bodega seleccionada para obtener stock');
            }

            // Preparar datos del producto seleccionado
            const productoConStock = {
                Item_Id: producto.Item_Id,
                Item_Codigo: producto.Item_Codigo_SKU || producto.Item_Id.toString(),
                Item_Descripcion: producto.Item_Nombre,
                Stock_Actual: stockActual,
                UnidadMedida_Prefijo: producto.UnidadMedida_Prefijo || 'Und',
                Cantidad: ''
            };

            onProductSelected(productoConStock);
            
            // Limpiar búsqueda
            setSearchTerm('');
            setShowResults(false);
            
        } catch (error) {
            console.error('Error al seleccionar producto:', error);
        } finally {
            setLoading(false);
        }
    };

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
                setShowResults(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const clearSearch = (e) => {
        // Prevenir cualquier comportamiento por defecto del formulario
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSearchTerm('');
        setShowResults(false);
        setSelectedIndex(-1);
        searchInputRef.current?.focus();
    };

    // Manejar resultado del escáner de códigos de barras
    const handleScanResult = (codigoEscaneado) => {
        console.log('Código escaneado:', codigoEscaneado);
        
        // Buscar producto por código escaneado
        setSearchTerm(codigoEscaneado);
        
        // Buscar automáticamente el producto
        const productoEncontrado = productos.find(p => 
            p.Item_Codigo_SKU === codigoEscaneado ||
            p.Item_Codigo_Barra === codigoEscaneado ||
            p.Item_Id?.toString() === codigoEscaneado
        );

        if (productoEncontrado) {
            // Si se encontró, seleccionarlo automáticamente
            setTimeout(() => {
                handleProductSelect(productoEncontrado);
            }, 300);
        } else {
            // Si no se encontró, mostrar el código en el input para búsqueda manual
            setShowResults(true);
            filterProductos(codigoEscaneado);
        }
    };

    const openScanner = (e) => {
        // Prevenir cualquier comportamiento por defecto del formulario
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsScannerOpen(true);
    };

    const closeScanner = () => {
        setIsScannerOpen(false);
    };

    const getStockIndicator = (tipoMovimiento) => {
        switch (tipoMovimiento) {
            case 'entrada':
                return 'Stock actual en destino';
            case 'salida':
                return 'Stock disponible en origen';
            case 'transferencia':
                return 'Stock disponible en origen';
            case 'ajuste':
                return 'Stock actual en bodega';
            default:
                return 'Stock actual';
        }
    };

    return (
        <div className="relative">
            {/* Campo de búsqueda */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className={`h-5 w-5 ${scanMode ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchTerm && setShowResults(true)}
                    className={`block w-full pl-10 ${searchTerm ? 'pr-20' : 'pr-12'} py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        scanMode ? 'ring-2 ring-green-500 border-green-500' : ''
                    }`}
                    placeholder="Buscar producto por nombre, SKU o código..."
                    autoComplete="off"
                />

                {/* Botones de acción */}
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                    {/* Botón scanner de código de barras */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openScanner(e);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Escanear código de barras"
                    >
                        <FiCamera className="h-5 w-5" />
                    </button>

                    {/* Botón limpiar */}
                    {searchTerm && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearSearch(e);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            type="button"
                            title="Limpiar búsqueda"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Indicador de modo escaneo */}
                {scanMode && (
                    <div className="absolute -top-8 left-0 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        <FiCamera className="inline mr-1" />
                        Modo escaneo activado
                    </div>
                )}
            </div>

            {/* Información del tipo de stock que se mostrará */}
            <p className="text-xs text-gray-500 mt-1">
                {getStockIndicator(tipoMovimiento)} • Use Enter para seleccionar • Esc para cancelar
            </p>

            {/* Resultados de búsqueda */}
            {showResults && (
                <div 
                    ref={resultsRef}
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                >
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Buscando productos...</p>
                        </div>
                    ) : filteredProductos.length > 0 ? (
                        <div>
                            {filteredProductos.map((producto, index) => (
                                <div
                                    key={producto.Item_Id}
                                    onClick={() => handleProductSelect(producto)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                                        index === selectedIndex 
                                            ? 'bg-blue-50 border-blue-200' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-2 rounded">
                                                <FiPackage className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {producto.Item_Nombre}
                                                </p>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    {producto.Item_Codigo_SKU && (
                                                        <span>SKU: {producto.Item_Codigo_SKU}</span>
                                                    )}
                                                    {producto.Item_Codigo_Barra && (
                                                        <span>• Código: {producto.Item_Codigo_Barra}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-600">
                                                ID: {producto.Item_Id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <FiPackage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No se encontraron productos</p>
                        </div>
                    )}
                </div>
            )}

            {/* Scanner de código de barras */}
            <BarcodeScanner 
                isOpen={isScannerOpen}
                onResult={handleScanResult}
                onClose={closeScanner}
            />
        </div>
    );
};

export default SearchProducto;