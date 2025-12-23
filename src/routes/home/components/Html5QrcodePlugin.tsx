// Html5QrcodePlugin.tsx
// Using qr-scanner library for better iOS support

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import QrScanner from "qr-scanner";

export interface Html5QrcodePluginProps {
    fps?: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    verbose?: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    qrCodeErrorCallback?: (errorMessage: string) => void;
}

// Helper function to create corner element
const createCorner = (position: 'tl' | 'tr' | 'bl' | 'br'): HTMLDivElement => {
    const corner = document.createElement('div');
    corner.className = `qr-corner qr-corner-${position}`;
    corner.style.cssText = `
        position: absolute;
        width: 35px;
        height: 35px;
        pointer-events: none;
        z-index: 4;
    `;

    const offset = '8px';
    const borderStyle = '4px solid white';

    switch (position) {
        case 'tl':
            corner.style.top = offset;
            corner.style.left = offset;
            corner.style.borderTop = borderStyle;
            corner.style.borderLeft = borderStyle;
            break;
        case 'tr':
            corner.style.top = offset;
            corner.style.right = offset;
            corner.style.borderTop = borderStyle;
            corner.style.borderRight = borderStyle;
            break;
        case 'bl':
            corner.style.bottom = offset;
            corner.style.left = offset;
            corner.style.borderBottom = borderStyle;
            corner.style.borderLeft = borderStyle;
            break;
        case 'br':
            corner.style.bottom = offset;
            corner.style.right = offset;
            corner.style.borderBottom = borderStyle;
            corner.style.borderRight = borderStyle;
            break;
    }

    return corner;
};

const Html5QrcodePlugin = (props: Html5QrcodePluginProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasCamera, setHasCamera] = useState(true);

    // Generate unique ID
    const containerId = useMemo(() => `qr-container-${Date.now()}`, []);

    const startScanner = useCallback(async () => {
        if (!videoRef.current || scannerRef.current) return;

        try {
            setError(null);

            const scanner = new QrScanner(
                videoRef.current,
                (result) => {
                    // Success callback
                    props.qrCodeSuccessCallback(result.data, result);
                },
                {
                    preferredCamera: 'environment',
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    maxScansPerSecond: props.fps ?? 10,
                    // Return detailed result
                    returnDetailedScanResult: true,
                }
            );

            scannerRef.current = scanner;
            await scanner.start();
            setIsScanning(true);

            // Add corners to container
            if (containerRef.current && !containerRef.current.querySelector('.qr-corner')) {
                containerRef.current.appendChild(createCorner('tl'));
                containerRef.current.appendChild(createCorner('tr'));
                containerRef.current.appendChild(createCorner('bl'));
                containerRef.current.appendChild(createCorner('br'));
            }

        } catch (err: any) {
            console.error('QR Scanner error:', err);

            if (err.name === 'NotAllowedError') {
                setError('Vui lòng cấp quyền camera để quét QR');
            } else if (err.name === 'NotFoundError') {
                setError('Không tìm thấy camera');
                setHasCamera(false);
            } else {
                setError(`Lỗi: ${err.message || 'Không thể khởi động camera'}`);
            }
        }
    }, [props.fps, props.qrCodeSuccessCallback]);

    const stopScanner = useCallback(() => {
        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
            setIsScanning(false);
        }
    }, []);

    // Auto-start scanner when component mounts
    useEffect(() => {
        // Small delay to ensure video element is ready
        const timer = setTimeout(() => {
            startScanner();
        }, 100);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [startScanner, stopScanner]);

    return (
        <div
            ref={containerRef}
            id={containerId}
            style={{
                position: 'relative',
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#000'
            }}
        >
            {/* Video element for camera */}
            <video
                ref={videoRef}
                style={{
                    width: '100%',
                    maxHeight: '35vh',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: hasCamera ? 'block' : 'none'
                }}
                autoPlay
                playsInline
                muted
            />

            {/* Error display */}
            {error && (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#DC2626',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '8px'
                }}>
                    <p style={{ marginBottom: '12px' }}>{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            startScanner();
                        }}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Loading state */}
            {!isScanning && !error && hasCamera && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 10px'
                    }} />
                    <span>Đang khởi động camera...</span>
                </div>
            )}

            {/* Control buttons */}
            {hasCamera && !error && (
                <div style={{
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: 'white'
                }}>
                    <button
                        onClick={isScanning ? stopScanner : startScanner}
                        style={{
                            padding: '10px 24px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: isScanning ? '#DC2626' : '#4F46E5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Html5QrcodePlugin;
