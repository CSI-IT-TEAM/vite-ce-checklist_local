// ReactQrScanner.tsx
// Beautiful QR Scanner with iOS support and multi-device compatibility

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState, useCallback, useEffect } from 'react';
import './ReactQrScanner.css';

export interface ReactQrScannerProps {
    onSuccess: (decodedText: string, decodedResult?: any) => void;
    onError?: (error: string) => void;
}

// Các loại lỗi camera thường gặp
const ERROR_MESSAGES: { [key: string]: string } = {
    'NotAllowedError': 'Vui lòng cấp quyền Camera trong cài đặt trình duyệt',
    'NotFoundError': 'Không tìm thấy camera trên thiết bị này',
    'NotReadableError': 'Camera đang được sử dụng bởi ứng dụng khác',
    'OverconstrainedError': 'Camera không hỗ trợ cấu hình yêu cầu',
    'SecurityError': 'Cần HTTPS để truy cập camera',
    'AbortError': 'Camera bị gián đoạn',
    'TypeError': 'Trình duyệt không hỗ trợ camera',
};

const ReactQrScanner = ({ onSuccess, onError }: ReactQrScannerProps) => {
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [useFallbackCamera, setUseFallbackCamera] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // Check camera permission on mount
    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                // Check if getUserMedia is supported
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    setError('Trình duyệt không hỗ trợ camera');
                    setErrorDetails('Vui lòng sử dụng Chrome, Safari hoặc Firefox phiên bản mới');
                    setIsLoading(false);
                    return;
                }

                // Try to get camera permission
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                // Stop the stream immediately, we just wanted to check permission
                stream.getTracks().forEach(track => track.stop());
                setIsLoading(false);

                console.log('[QR Scanner] Camera permission granted');
            } catch (err: any) {
                console.error('[QR Scanner] Camera permission check failed:', err);

                // If environment camera fails, try any camera
                if (err.name === 'OverconstrainedError') {
                    console.log('[QR Scanner] Trying fallback camera...');
                    setUseFallbackCamera(true);
                    setIsLoading(false);
                    return;
                }

                const friendlyMessage = ERROR_MESSAGES[err.name] || 'Không thể truy cập camera';
                setError(friendlyMessage);
                setErrorDetails(`Mã lỗi: ${err.name}`);
                setIsLoading(false);

                if (onError) {
                    onError(friendlyMessage);
                }
            }
        };

        checkCameraPermission();
    }, [retryCount, onError]);

    const handleScan = useCallback((result: any) => {
        if (result && result.length > 0) {
            const data = result[0]?.rawValue;
            if (data) {
                console.log('[QR Scanner] Scan success:', data);
                onSuccess(data, result[0]);
            }
        }
    }, [onSuccess]);

    const handleError = useCallback((err: any) => {
        console.error('[QR Scanner] Scanner error:', err);

        const errorName = err?.name || 'UnknownError';
        const friendlyMessage = ERROR_MESSAGES[errorName] || err?.message || 'Lỗi camera không xác định';

        // If environment camera fails, try fallback
        if (errorName === 'OverconstrainedError' && !useFallbackCamera) {
            console.log('[QR Scanner] Switching to fallback camera...');
            setUseFallbackCamera(true);
            return;
        }

        setError(friendlyMessage);
        setErrorDetails(`Chi tiết: ${err?.message || errorName}`);

        if (onError) {
            onError(friendlyMessage);
        }
    }, [onError, useFallbackCamera]);

    const handleRetry = () => {
        setError(null);
        setErrorDetails(null);
        setIsLoading(true);
        setUseFallbackCamera(false);
        setRetryCount(prev => prev + 1);
    };

    // Get camera constraints based on fallback mode
    const getCameraConstraints = () => {
        if (useFallbackCamera) {
            // Fallback: use any available camera
            return {
                video: true
            };
        }
        return {
            facingMode: 'environment'
        };
    };

    return (
        <div className="qr-scanner-wrapper">
            {/* Loading state */}
            {isLoading && (
                <div className="qr-loading-container">
                    <div className="qr-loading-spinner"></div>
                    <p className="qr-loading-text">Đang khởi động camera...</p>
                </div>
            )}

            {/* Scanner */}
            {!error && !isLoading && (
                <div className="qr-scanner-container">
                    <Scanner
                        key={`scanner-${retryCount}-${useFallbackCamera}`}
                        onScan={handleScan}
                        onError={handleError}
                        paused={isPaused}
                        constraints={getCameraConstraints()}
                        styles={{
                            container: {
                                width: '100%',
                                height: '100%',
                                padding: 0,
                            },
                            video: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }
                        }}
                        components={{
                            torch: false,
                            finder: false,
                        }}
                    />

                    {/* Custom scan overlay */}
                    <div className="qr-scan-overlay">
                        {/* Scan frame */}
                        <div className="qr-scan-frame">
                            {/* Corner decorations */}
                            <div className="qr-corner qr-corner-tl"></div>
                            <div className="qr-corner qr-corner-tr"></div>
                            <div className="qr-corner qr-corner-bl"></div>
                            <div className="qr-corner qr-corner-br"></div>

                            {/* Scanning line animation */}
                            {!isPaused && (
                                <div className="qr-scan-line"></div>
                            )}
                        </div>

                        {/* Instruction text */}
                        <div className="qr-instruction">
                            {useFallbackCamera
                                ? 'Đang dùng camera trước - Đặt QR vào khung'
                                : 'Đặt mã QR vào khung để quét'
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Error display */}
            {error && !isLoading && (
                <div className="qr-error-container">
                    <div className="qr-error-icon">📷</div>
                    <p className="qr-error-text">{error}</p>
                    {errorDetails && (
                        <p className="qr-error-details">{errorDetails}</p>
                    )}
                    <div className="qr-error-tips">
                        <p><strong>Thử các bước sau:</strong></p>
                        <ul>
                            <li>Kiểm tra quyền Camera trong cài đặt trình duyệt</li>
                            <li>Đóng các app khác đang dùng camera</li>
                            <li>Tải lại trang và cho phép camera</li>
                        </ul>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="qr-retry-btn"
                    >
                        🔄 Thử lại
                    </button>
                </div>
            )}

            {/* Control button */}
            {!error && !isLoading && (
                <div className="qr-controls">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`qr-control-btn ${isPaused ? 'start' : 'stop'}`}
                    >
                        {isPaused ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Start Scanning
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 6h12v12H6z" />
                                </svg>
                                Stop Scanning
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReactQrScanner;
