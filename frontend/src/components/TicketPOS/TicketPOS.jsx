import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FiPrinter, FiX, FiDownload, FiShare2 } from 'react-icons/fi';
import './TicketPOS.css';

const TicketPOS = ({ 
    movimientoData, 
    itemsMovimiento, 
    tipo, 
    bodegas, 
    usuarioLogueado, 
    totales,
    onClose 
}) => {
    const ticketRef = useRef();

    // Configurar impresión con react-to-print
    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket-${tipo}-${Date.now()}`,
        onBeforeGetContent: () => {
            // Asegurar que el ticket esté listo
            return Promise.resolve();
        },
        onAfterPrint: () => {
            console.log('Ticket impreso exitosamente');
        },
        pageStyle: `
            @page {
                size: 58mm auto;
                margin: 0mm;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 11px;
                    line-height: 1.2;
                }
            }
        `
    });
    // Obtener nombre de bodega
    const getBodegaNombre = (id) => {
        const bodega = bodegas?.find(b => b.Bodega_Id === parseInt(id));
        return bodega?.Bodega_Nombre || 'No especificada';
    };

    // Configuración según tipo
    const getTipoTexto = () => {
        const textos = {
            entrada: 'ENTRADA DE INVENTARIO',
            salida: 'SALIDA DE INVENTARIO',
            transferencia: 'TRANSFERENCIA ENTRE BODEGAS',
            ajuste: 'AJUSTE DE INVENTARIO'
        };
        return textos[tipo] || 'MOVIMIENTO DE INVENTARIO';
    };

    // Generar número de comprobante (simulado)
    const numeroComprobante = `${tipo.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-6)}`;

    const formatearFecha = (fecha = new Date()) => {
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="ticket-pos-overlay">
            {/* Header de controles mejorado */}
            <div className="ticket-controls">
                <div className="controls-group">
                    <button 
                        onClick={handlePrint}
                        className="control-btn print-btn"
                        title="Imprimir ticket"
                    >
                        <FiPrinter className="btn-icon" />
                        <span>Imprimir</span>
                    </button>
                    <button 
                        onClick={() => navigator.share && navigator.share({ title: 'Ticket KardexPlus', text: 'Comprobante de movimiento' })}
                        className="control-btn share-btn"
                        title="Compartir"
                    >
                        <FiShare2 className="btn-icon" />
                        <span>Compartir</span>
                    </button>
                </div>
                <button 
                    onClick={onClose}
                    className="control-btn close-btn"
                    title="Cerrar"
                >
                    <FiX className="btn-icon" />
                </button>
            </div>
            
            <div className="ticket-pos-container">
                
                {/* Contenido del ticket mejorado */}
                <div ref={ticketRef} className="ticket-pos">
                    {/* Encabezado mejorado */}
                    <div className="ticket-header">
                        <div className="company-logo">📦</div>
                        <div className="company-name">KARDEX PLUS</div>
                        <div className="company-subtitle">Sistema de Inventario Inteligente</div>
                        <div className="header-separator">═══════════════════════════════</div>
                        <div className="document-type">{getTipoTexto()}</div>
                        <div className="document-number">#{numeroComprobante}</div>
                        <div className="header-separator">═══════════════════════════════</div>
                    </div>

                    {/* Información del comprobante */}
                    <div className="ticket-info">
                        <div className="info-line">
                            <span className="label">Comprobante:</span>
                            <span className="value">{numeroComprobante}</span>
                        </div>
                        <div className="info-line">
                            <span className="label">Fecha:</span>
                            <span className="value">{formatearFecha()}</span>
                        </div>
                        <div className="info-line">
                            <span className="label">Responsable:</span>
                            <span className="value">{usuarioLogueado || 'Usuario'}</span>
                        </div>
                        {movimientoData.Recepcionista && (
                            <div className="info-line">
                                <span className="label">Recepcionista:</span>
                                <span className="value">{movimientoData.Recepcionista}</span>
                            </div>
                        )}
                        <div className="info-line">
                            <span className="label">Motivo:</span>
                            <span className="value">{movimientoData.Motivo}</span>
                        </div>
                        
                        {/* Bodegas */}
                        {movimientoData.Origen_Bodega_Id && (
                            <div className="info-line">
                                <span className="label">Origen:</span>
                                <span className="value">{getBodegaNombre(movimientoData.Origen_Bodega_Id)}</span>
                            </div>
                        )}
                        {movimientoData.Destino_Bodega_Id && (
                            <div className="info-line">
                                <span className="label">Destino:</span>
                                <span className="value">{getBodegaNombre(movimientoData.Destino_Bodega_Id)}</span>
                            </div>
                        )}
                    </div>

                    <div className="separator">--------------------------------</div>

                    {/* Items */}
                    <div className="ticket-items">
                        <div className="items-header">DETALLE DE ITEMS</div>
                        <div className="separator">--------------------------------</div>
                        
                        {itemsMovimiento.map((item, index) => (
                            <div key={index} className="item">
                                <div className="item-name">{item.Item_Descripcion}</div>
                                <div className="item-details">
                                    <span>Cód: {item.Item_Codigo}</span>
                                    <span className="item-id">ID: {item.Item_Id}</span>
                                </div>
                                <div className="item-quantity">
                                    <span className="qty">{parseFloat(item.Cantidad).toLocaleString()} {item.UnidadMedida_Prefijo}</span>
                                    {item.Precio_Unitario && (
                                        <span className="price">
                                            ${item.Precio_Unitario.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                                {item.Precio_Unitario && (
                                    <div className="item-subtotal">
                                        Subtotal: ${(item.Precio_Unitario * parseFloat(item.Cantidad)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </div>
                                )}
                                <div className="item-separator">- - - - - - - - - - - - - - - -</div>
                            </div>
                        ))}
                    </div>

                    <div className="separator">--------------------------------</div>

                    {/* Totales */}
                    <div className="ticket-totals">
                        <div className="total-line">
                            <span className="label">Total Items:</span>
                            <span className="value">{totales.totalItems}</span>
                        </div>
                        <div className="total-line">
                            <span className="label">Cantidad Total:</span>
                            <span className="value">{totales.cantidadTotal.toLocaleString()}</span>
                        </div>
                        {totales.valorTotal > 0 && (
                            <div className="total-line total-final">
                                <span className="label">VALOR TOTAL:</span>
                                <span className="value">${totales.valorTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                    </div>

                    {movimientoData.Observaciones && (
                        <>
                            <div className="separator">--------------------------------</div>
                            <div className="ticket-observations">
                                <div className="obs-title">OBSERVACIONES:</div>
                                <div className="obs-content">{movimientoData.Observaciones}</div>
                            </div>
                        </>
                    )}

                    <div className="separator">================================</div>

                    {/* Pie */}
                    <div className="ticket-footer">
                        <div className="footer-line">Documento generado automáticamente</div>
                        <div className="footer-line">por KardexPlus v1.0</div>
                        <div className="footer-line">Conserve este comprobante</div>
                        <div className="separator">================================</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketPOS;