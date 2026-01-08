// Html5QrScanner.tsx
// Simple QR Scanner using html5-qrcode library
// Designed for maximum compatibility with iOS and Android

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './Html5QrScanner.css';

export interface Html5QrScannerProps {
    onSuccess: (decodedText: string, decodedResult?: unknown) => void;
    onError?: (error: string) => void;
}

// Error messages in Vietnamese
const ERROR_MESSAGES: Record<string, string> = {
    'NotAllowedError': 'Vui lòng cấp quyền Camera trong cài đặt trình duyệt',
    'NotFoundError': 'Không tìm thấy camera trên thiết bị này',
    'NotReadableError': 'Camera đang được sử dụng bởi ứng dụng khác',
    'OverconstrainedError': 'Camera không hỗ trợ cấu hình yêu cầu',
    'SecurityError': 'Cần HTTPS để truy cập camera',
    'AbortError': 'Camera bị gián đoạn',
};

// Unique ID generation using timestamp to ensure absolute uniqueness
const generateScannerId = () => `html5-qr-reader-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const Html5QrScanner = ({ onSuccess, onError }: Html5QrScannerProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
    
    // Constant ID for component lifecycle
    const [scannerId] = useState(generateScannerId());
    
    // Refs for logic
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const hasScannedRef = useRef(false);
    const isMountedRef = useRef(true);

    // 1. Initialize: Fetch cameras once
    useEffect(() => {
        isMountedRef.current = true;
        
        const initCameras = async () => {
             try {
                const deviceCameras = await Html5Qrcode.getCameras();
                
                if (!isMountedRef.current) return;
                
                if (deviceCameras && deviceCameras.length > 0) {
                     // Clean up labels with better Android support
                     const cleanCameras = deviceCameras.map((cam, index) => {
                        let label = cam.label || `Camera ${index + 1}`;
                        const labelLower = label.toLowerCase();
                        
                        // Detect back/environment camera
                        if (labelLower.includes('back') || 
                            labelLower.includes('rear') || 
                            labelLower.includes('environment') ||
                            labelLower.includes('facing back')) {
                            label = `📸 Camera sau (${index + 1})`;
                        } 
                        // Detect front/user camera
                        else if (labelLower.includes('front') || 
                                 labelLower.includes('user') || 
                                 labelLower.includes('facing front')) {
                            label = `🤳 Camera trước (${index + 1})`;
                        }
                        // Fallback for generic names
                        else {
                             if (deviceCameras.length > 1) {
                                 // Usually the last camera is front on some devices, or first is back.
                                 // But safe bet is just using the name or index
                                 label = `📷 Camera ${index + 1} (${label.substring(0, 15)}...)`;
                             }
                        }
                        
                        return {
                            id: cam.id,
                            label: label
                        };
                    });
                    setCameras(cleanCameras);
                    
                    // Check local storage for saved camera
                    const savedCameraId = localStorage.getItem('HTML5_QR_CAMERA_ID');
                    const savedCameraExists = cleanCameras.some(c => c.id === savedCameraId);

                    if (savedCameraId && savedCameraExists) {
                        setSelectedCameraId(savedCameraId);
                    } else {
                        // Prefer back camera initially if no saved preference
                        const backCamera = cleanCameras.find(c => 
                            c.label.toLowerCase().includes('back') ||
                            c.label.toLowerCase().includes('rear') ||
                            c.label.toLowerCase().includes('environment')
                        );
                        setSelectedCameraId(backCamera?.id || cleanCameras[0].id);
                    }
                } else {
                    const msg = 'Không tìm thấy camera nào';
                    setError(msg);
                    setIsLoading(false);
                    if (onError) onError(msg);
                }
             } catch (err) {
                 if (isMountedRef.current) {
                    console.error('[QrScanner] Camera perms error:', err);
                    const msg = 'Vui lòng cấp quyền Camera';
                    setError(msg);
                    setIsLoading(false);
                    if (onError) onError(msg);
                 }
             }
        };

        initCameras();
        
        return () => {
            isMountedRef.current = false;
        };
    }, [onError]);

    // 2. Main Scanner Logic: Runs when selectedCameraId changes
    useEffect(() => {
        if (!selectedCameraId) return;

        // Reset scan flag
        hasScannedRef.current = false;
        
        const startScanner = async () => {
            try {
                // Force clear container content before starting
                const container = document.getElementById(scannerId);
                if (container) {
                    container.innerHTML = '';
                }

                console.log('[QrScanner] Starting with ID:', scannerId, 'Cam:', selectedCameraId);
                
                // Create scanner
                if (scannerRef.current) {
                    try { await scannerRef.current.stop(); } catch (e) { console.debug(e); }
                    try { scannerRef.current.clear(); } catch (e) { console.debug(e); }
                }
                scannerRef.current = new Html5Qrcode(scannerId);
                
                // On iOS, aspectRatio 1.0 might cause issues, so we can conditionally remove it
                // or just rely on the library natural behavior.
                // Let's keep it simple as user confirmed it's working now without aspectRatio constraint.
                const finalConfig = {
                    fps: 15,
                    qrbox: { width: 250, height: 250 },
                };
                
                await scannerRef.current.start(
                    selectedCameraId,
                    finalConfig,
                    (decodedText, decodedResult) => {
                        if (hasScannedRef.current) return;
                        hasScannedRef.current = true;
                        
                        console.log('[QrScanner] Success:', decodedText);
                        
                        if (scannerRef.current) {
                            scannerRef.current.stop()
                                .then(() => onSuccess(decodedText, decodedResult))
                                .catch(() => onSuccess(decodedText, decodedResult));
                        } else {
                            onSuccess(decodedText, decodedResult);
                        }
                    },
                    () => {}
                );

                // --- Auto-focus Enhancement (Optimized for iOS) ---
                try {
                    if (scannerRef.current.getRunningTrackCapabilities && scannerRef.current.applyVideoConstraints) {
                        const caps = scannerRef.current.getRunningTrackCapabilities();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const constraints: any = { advanced: [] };

                        // Check if focusMode is supported
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if ((caps as any).focusMode) {
                            constraints.focusMode = "continuous";
                            constraints.advanced.push({ focusMode: "continuous" });
                        }
                        
                        // Check zoom capability - slight zoom can help trigger focus on iOS
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if ((caps as any).zoom) {
                            // Don't zoom too much, just a tiny bit logic could be here,
                            // but usually just enabling continuous focus is enough if done right.
                            // For now, let's stick to focusMode.
                        }

                        console.log('[QrScanner] Applying constraints:', constraints);
                        await scannerRef.current.applyVideoConstraints(constraints);
                    }
                } catch (e) {
                    console.log('[QrScanner] Auto-focus adjustment failed', e);
                }
                // ------------------------------
                
                if (isMountedRef.current) {
                    setIsLoading(false);
                    setError(null);
                }
                
            } catch (err) {
                console.error('[QrScanner] Start error:', err);
                if (isMountedRef.current) {
                    const errObj = err as Error;
                    const msg = ERROR_MESSAGES[errObj.name] || `Lỗi camera: ${errObj.message}`;
                    setError(msg);
                    setIsLoading(false);
                    if (onError) onError(msg);
                }
            }
        };
        
        startScanner();
        
        // Cleanup function - CRITICAL for stability
        return () => {
            console.log('[QrScanner] Cleanup for:', selectedCameraId);
            if (scannerRef.current) {
                scannerRef.current.stop()
                    .catch(() => {})
                    .finally(() => {
                        try { scannerRef.current?.clear(); } catch (e) { console.debug(e); }
                        scannerRef.current = null;
                    });
            }
        };
    }, [selectedCameraId, onSuccess, onError, scannerId]);

    const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        if (newId !== selectedCameraId) {
            setIsLoading(true); // Set loading explicitly when user changes camera
            setSelectedCameraId(newId);
            localStorage.setItem('HTML5_QR_CAMERA_ID', newId);
        }
    };

    return (
        <div className="html5-qr-wrapper">
             {/* Scanner container */}
            <div className={`html5-qr-container ${error ? 'hidden' : ''}`} style={error ? {display: 'none'} : {}}>
                <div id={scannerId} className="html5-qr-reader"></div>
                
                {/* MODERN OVERLAY UI */}
                {!isLoading && !error && (
                    <div className="html5-qr-overlay">
                        {/* Dark backdrop with hole */}
                        <div className="html5-qr-hole"></div>
                        
                        {/* Scanning Frame with Corners */}
                        <div className="html5-qr-frame">
                            <div className="corner top-left"></div>
                            <div className="corner top-right"></div>
                            <div className="corner bottom-right"></div>
                            <div className="corner bottom-left"></div>
                            {/* Animated Laser Line */}
                            <div className="scan-line"></div>
                        </div>

                        {/* Floating Camera Selector */}
                        {cameras.length > 1 && (
                            <div className="camera-select-container">
                                <div className="camera-select-wrapper">
                                    <span className="camera-icon">📷</span>
                                    <select 
                                        value={selectedCameraId || ''} 
                                        onChange={handleCameraChange}
                                        className="camera-select-input"
                                    >
                                        {cameras.map(cam => (
                                            <option key={cam.id} value={cam.id}>
                                                {cam.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="dropdown-arrow">▼</span>
                                </div>
                            </div>
                        )}

                        {/* Instruction Text */}
                        <div className="html5-qr-instruction">
                            Đặt mã QR vào khung ngắm
                        </div>
                    </div>
                )}
            </div>

            {/* Loading */}
            {isLoading && !error && (
                <div className="html5-qr-loading">
                    <div className="html5-qr-spinner"></div>
                    <p>Đang khởi động camera...</p>
                </div>
            )}
            
            {/* Error */}
            {error && (
                <div className="html5-qr-error">
                    <div className="html5-qr-error-icon">⚠️</div>
                    <p className="html5-qr-error-text">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="html5-qr-retry-btn"
                    >
                        Thử lại
                    </button>
                    {/* Camera Select Fallback Error */}
                     {cameras.length > 1 && (
                         <div style={{marginTop: 10}}>
                            <select onChange={handleCameraChange} value={selectedCameraId || ''}>
                                {cameras.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                         </div>
                     )}
                </div>
            )}
        </div>
    );
};

export default Html5QrScanner;
