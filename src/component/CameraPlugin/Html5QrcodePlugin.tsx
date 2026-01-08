import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

/**
 * Props cho Html5QrcodePlugin
 */
export interface Html5QrcodePluginProps {
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
  verbose?: boolean;
  isScanning?: boolean; // Thêm prop để điều khiển quét

  qrCodeSuccessCallback: (decodedText: string, decodedResult: unknown) => void;
  qrCodeErrorCallback?: (errorMessage: string) => void;
}

/**
 * Component TSX
 */
const Html5QrcodePlugin: React.FC<Html5QrcodePluginProps> = (props) => {
  // Tạo ID duy nhất cho mỗi lần mount để tránh xung đột với instance cũ chưa kịp stop
  const [regionId] = useState(() => `html5qr-code-full-region-${Math.random().toString(36).substring(2, 9)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [internalIsScanning, setInternalIsScanning] = useState(false);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(regionId);
    scannerRef.current = html5QrCode;

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.warn('Clean up error:', err));
      }
    };
  }, [regionId]);

  useEffect(() => {
    const startScanner = async () => {
      if (!scannerRef.current) return;

      if (props.isScanning && !scannerRef.current.isScanning) {
        // Đợi 100ms để DOM ổn định kích thước vuông
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!scannerRef.current) return;

        try {
          const config: any = {
            fps: props.fps ?? 25,
            qrbox: props.qrbox ?? 150,
            aspectRatio: props.aspectRatio ?? 1.0,
            // Đưa các ràng buộc video vào đúng vị trí trong config
            videoConstraints: {
              facingMode: 'environment',
              focusMode: 'continuous',
              advanced: [{ focusMode: 'continuous' }]
            },
            useBarCodeDetectorIfSupported: true,
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          };

          // BƯỚC 2: Bắt đầu quét
          // Tham số đầu tiên nên là config đơn giản hoặc ID camera
          await scannerRef.current.start(
            { facingMode: 'environment' },
            config,
            (decodedText, decodedResult) => {
              props.qrCodeSuccessCallback(decodedText, decodedResult);
            },
            () => { }
          );

          setInternalIsScanning(true);
        } catch (err) {
          console.error('Lỗi khởi động Camera:', err);
          setInternalIsScanning(false);

          if (props.qrCodeErrorCallback) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            if (errorMsg.includes('Requested device not found') || errorMsg.includes('NotFoundError')) {
              props.qrCodeErrorCallback('NotFoundError');
            } else if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
              props.qrCodeErrorCallback('NotAllowedError');
            } else {
              props.qrCodeErrorCallback(errorMsg);
            }
          }
        }
      } else if (!props.isScanning && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
          setInternalIsScanning(false);
        } catch (err) {
          console.error('Lỗi khi dừng scanner:', err);
        }
      }
    };

    startScanner();
  }, [props.isScanning, regionId]); // Thêm regionId vào deps

  return (
    <div
      className="qr-scanner-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        overflow: 'hidden'
      }}
    >
      <div id={regionId} style={{ width: '100%' }} />

      {/* Hiệu ứng tia laser khi đang quét */}
      {internalIsScanning && (
        <div className="scanner-laser">
          <div className="laser-line" />
        </div>
      )}

      <style>{`
        .qr-scanner-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #${regionId} {
          width: 100% !important;
          height: 100% !important;
        }
        #${regionId} video {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          object-fit: cover !important;
        }
        .scanner-laser {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }
        .laser-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: rgba(255, 0, 0, 0.6);
          box-shadow: 0 0 8px 2px rgba(255, 0, 0, 0.8);
          top: 10%;
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

export default Html5QrcodePlugin;
