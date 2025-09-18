import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { FiX, FiZap, FiZapOff, FiCamera, FiRotateCcw } from 'react-icons/fi';

/**
 * Componente BarcodeScanner - Escáner de códigos de barras mobile-first
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onResult - Callback cuando se escanea un código (codigo) => {}
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {boolean} props.autoFlash - Si enciende flash automáticamente (default: true)
 * @param {Array} props.formats - Formatos de código a detectar (opcional)
 * @param {boolean} props.continuousMode - Si continúa escaneando después de encontrar un código
 */
const BarcodeScanner = ({
    isOpen = false,
    onResult,
    onClose,
    autoFlash = true,
    formats = null, // null = todos los formatos
    continuousMode = false
}) => {
    const videoRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasFlash, setHasFlash] = useState(false);
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [error, setError] = useState(null);
    const [cameraDevices, setCameraDevices] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [reader, setReader] = useState(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (isOpen) {
            initializeScanner();
        } else {
            cleanup();
        }

        return () => cleanup();
    }, [isOpen]);

    const initializeScanner = async () => {
        try {
            setError(null);
            setIsScanning(true);

            // Crear el reader de ZXing
            const codeReader = new BrowserMultiFormatReader();
            setReader(codeReader);

            // Obtener dispositivos de cámara disponibles
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setCameraDevices(videoDevices);

            // Seleccionar cámara trasera por defecto (mejor para escanear)
            const backCamera = videoDevices.find(device => 
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('environment')
            ) || videoDevices[videoDevices.length - 1]; // Última cámara como fallback

            setSelectedCamera(backCamera?.deviceId || videoDevices[0]?.deviceId);

            // Iniciar escaneo con la cámara seleccionada
            await startScanning(codeReader, backCamera?.deviceId || videoDevices[0]?.deviceId);

        } catch (err) {
            console.error('Error inicializando escáner:', err);
            handleError(err);
        }
    };

    const startScanning = async (codeReader, deviceId) => {
        try {
            // Configurar constraints para la cámara
            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    facingMode: deviceId ? undefined : { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    focusMode: 'continuous',
                    torch: autoFlash // Intentar activar flash automáticamente
                }
            };

            // Obtener stream de video
            const videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(videoStream);

            // Verificar si tiene capacidades de flash
            const track = videoStream.getVideoTracks()[0];
            const capabilities = track.getCapabilities?.();
            
            if (capabilities?.torch) {
                setHasFlash(true);
                if (autoFlash) {
                    await enableFlash(track, true);
                    setFlashEnabled(true);
                }
            }

            // Configurar video element
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
                
                // Iniciar detección continua
                codeReader.decodeFromVideoDevice(
                    deviceId,
                    videoRef.current,
                    (result, error) => {
                        if (result) {
                            handleScanResult(result.getText());
                            
                            // Vibración de feedback (si está disponible)
                            if (navigator.vibrate) {
                                navigator.vibrate(200);
                            }
                            
                            // Si no está en modo continuo, cerrar después del primer escaneo
                            if (!continuousMode) {
                                setTimeout(() => {
                                    cleanup();
                                    onClose?.();
                                }, 500);
                            }
                        }
                        
                        if (error && !(error instanceof NotFoundException)) {
                            console.warn('Error de escaneo:', error);
                        }
                    }
                );
            }

        } catch (err) {
            console.error('Error iniciando escaneo:', err);
            handleError(err);
        }
    };

    const enableFlash = async (track, enable) => {
        try {
            await track.applyConstraints({
                advanced: [{ torch: enable }]
            });
            setFlashEnabled(enable);
        } catch (err) {
            console.warn('No se pudo controlar el flash:', err);
        }
    };

    const toggleFlash = async () => {
        if (!hasFlash || !stream) return;
        
        const track = stream.getVideoTracks()[0];
        await enableFlash(track, !flashEnabled);
    };

    const switchCamera = async () => {
        if (cameraDevices.length < 2) return;

        const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedCamera);
        const nextIndex = (currentIndex + 1) % cameraDevices.length;
        const nextDevice = cameraDevices[nextIndex];

        cleanup();
        setSelectedCamera(nextDevice.deviceId);
        
        if (reader) {
            await startScanning(reader, nextDevice.deviceId);
        }
    };

    const handleScanResult = (code) => {
        console.log('Código escaneado:', code);
        onResult?.(code);
    };

    const handleError = (error) => {
        let errorMessage = 'Error accediendo a la cámara';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró cámara disponible.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Cámara no soportada en este dispositivo.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Cámara en uso por otra aplicación.';
        }
        
        setError(errorMessage);
        setIsScanning(false);
    };

    const cleanup = () => {
        // Detener stream de video
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            setStream(null);
        }

        // Resetear reader
        if (reader) {
            reader.reset();
        }

        // Reset estados
        setIsScanning(false);
        setHasFlash(false);
        setFlashEnabled(false);
        setError(null);
    };

    const handleClose = () => {
        cleanup();
        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Header con controles */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4 border-b border-white/20">
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                        {/* Botón cerrar */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors touch-manipulation"
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                        
                        <div>
                            <h2 className="text-lg font-semibold">Escanear Código</h2>
                            <p className="text-sm text-gray-300">Apunta la cámara al código de barras</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Control de flash */}
                        {hasFlash && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFlash();
                                }}
                                className={`p-2 rounded-full transition-colors touch-manipulation ${
                                    flashEnabled 
                                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                                        : 'bg-black/40 hover:bg-black/60'
                                }`}
                            >
                                {flashEnabled ? (
                                    <FiZap className="h-5 w-5 text-black" />
                                ) : (
                                    <FiZapOff className="h-5 w-5" />
                                )}
                            </button>
                        )}

                        {/* Cambiar cámara */}
                        {cameraDevices.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    switchCamera();
                                }}
                                className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors touch-manipulation"
                            >
                                <FiRotateCcw className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Área de video */}
            <div className="relative w-full h-full flex items-center justify-center">
                {error ? (
                    <div className="text-center text-white p-8">
                        <FiCamera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Error de Cámara</h3>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                initializeScanner();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Video element */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay de escaneo */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Oscurecimiento del fondo */}
                            <div className="absolute inset-0 bg-black/40"></div>
                            
                            {/* Zona de escaneo */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    {/* Marco de escaneo - área transparente */}
                                    <div className="w-72 h-44 sm:w-80 sm:h-48 bg-transparent border-2 border-white/80 rounded-lg relative backdrop-blur-none">
                                        {/* Esquinas del marco más visibles */}
                                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                                        
                                        {/* Línea de escaneo animada más sutil */}
                                        <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse"></div>
                                    </div>
                                    
                                    {/* Máscara para crear el efecto de "recorte" */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {/* Top */}
                                        <div className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: 'calc(50% - 88px)' }}></div>
                                        {/* Bottom */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: 'calc(50% - 88px)' }}></div>
                                        {/* Left */}
                                        <div className="absolute left-0 bg-black/60" style={{ top: 'calc(50% - 88px)', bottom: 'calc(50% - 88px)', width: 'calc(50% - 144px)' }}></div>
                                        {/* Right */}
                                        <div className="absolute right-0 bg-black/60" style={{ top: 'calc(50% - 88px)', bottom: 'calc(50% - 88px)', width: 'calc(50% - 144px)' }}></div>
                                    </div>
                                    
                                    {/* Texto instructivo */}
                                    <div className="text-center mt-6 text-white">
                                        <p className="text-base font-medium">Centra el código en el marco</p>
                                        <p className="text-sm text-gray-300 mt-1">La detección es automática</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer con información */}
            {/* Footer con información */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 border-t border-white/20">
                <div className="text-center text-white">
                    <p className="text-sm text-gray-300 mb-2">
                        <strong>Soporta:</strong> EAN-13, EAN-8, UPC-A, Code128 y más
                    </p>
                    {isScanning && (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent mr-2"></div>
                            <span className="text-sm text-blue-300">Buscando códigos...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;