// ReactQrScanner.tsx
// Beautiful QR Scanner with iOS support

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState, useCallback } from 'react';
import './ReactQrScanner.css';

export interface ReactQrScannerProps {
    onSuccess: (decodedText: string, decodedResult?: any) => void;
    onError?: (error: string) => void;
}

const ReactQrScanner = ({ onSuccess, onError }: ReactQrScannerProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const handleScan = useCallback((result: any) => {
        if (result && result.length > 0) {
            const data = result[0]?.rawValue;
            if (data) {
                onSuccess(data, result[0]);
            }
        }
    }, [onSuccess]);

    const handleError = useCallback((err: any) => {
        console.error('QR Scanner error:', err);
        const errorMsg = err?.message || 'Lỗi camera';
        setError(errorMsg);
        if (onError) {
            onError(errorMsg);
        }
    }, [onError]);

    return (
        <div className="qr-scanner-wrapper">
            {/* Scanner */}
            {!error && (
                <div className="qr-scanner-container">
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        paused={isPaused}
                        constraints={{
                            facingMode: 'environment'
                        }}
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
                            finder: false, // Disable default ugly finder
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
                            Đặt mã QR vào khung để quét
                        </div>
                    </div>
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="qr-error-container">
                    <div className="qr-error-icon">⚠️</div>
                    <p className="qr-error-text">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="qr-retry-btn"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Control button */}
            {!error && (
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
