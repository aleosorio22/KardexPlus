import React from 'react';
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
            {/* Header de controles para vista previa */}
            <div style={{ 
                position: 'fixed', 
                top: '10px', 
                right: '10px', 
                zIndex: 10001,
                display: 'flex',
                gap: '10px'
            }}>
                <button 
                    onClick={() => window.print()}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🖨️ Imprimir
                </button>
                <button 
                    onClick={onClose}
                    className="ticket-close-btn"
                >
                    ×
                </button>
            </div>
            
            <div className="ticket-pos-container">
                
                {/* Contenido del ticket */}
                <div className="ticket-pos">
                    {/* Encabezado */}
                    <div className="ticket-header">
                        <div className="company-name">KARDEX PLUS</div>
                        <div className="company-subtitle">Sistema de Inventario</div>
                        <div className="separator">================================</div>
                        <div className="document-type">{getTipoTexto()}</div>
                        <div className="separator">================================</div>
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