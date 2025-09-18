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
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                        {/* Botón cerrar */}
                        <button
                            onClick={handleClose}
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
                                onClick={toggleFlash}
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
                                onClick={switchCamera}
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
                            onClick={initializeScanner}
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
                            {/* Zona de escaneo */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    {/* Marco de escaneo */}
                                    <div className="w-64 h-40 sm:w-80 sm:h-48 border-2 border-white rounded-lg relative">
                                        {/* Esquinas del marco */}
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br"></div>
                                        
                                        {/* Línea de escaneo animada */}
                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                                    </div>
                                    
                                    {/* Texto instructivo */}
                                    <div className="text-center mt-4 text-white">
                                        <p className="text-sm font-medium">Centra el código en el marco</p>
                                        <p className="text-xs text-gray-300 mt-1">La detección es automática</p>
                                    </div>
                                </div>
                            </div>

                            {/* Overlay oscuro para enfocar */}
                            <div 
                                className="absolute inset-0 bg-black bg-opacity-50"
                                style={{
                                    clipPath: 'polygon(0% 0%, 0% 100%, 50% 100%, 50% 70%, 80% 70%, 80% 30%, 50% 30%, 50% 0%)'
                                }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Footer con información */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="text-center text-white">
                    <p className="text-sm text-gray-300">
                        Soporta: EAN-13, EAN-8, UPC-A, Code128 y más
                    </p>
                    {isScanning && (
                        <div className="flex items-center justify-center mt-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            <span className="text-sm">Buscando códigos...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;