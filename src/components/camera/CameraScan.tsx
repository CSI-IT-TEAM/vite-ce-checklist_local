import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import { useState, useCallback, useEffect } from 'react';

import './CameraScan.scss';

/**
 * Props cho CameraScan
 */
export interface CameraScanProps {
  open: boolean;
  handleSuccess: (decodedText: string, decodedResult: unknown) => void;
  handleClose: () => void;
}

const CameraScan: React.FC<CameraScanProps> = ({
  open,
  handleSuccess,
  handleClose
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khôi phục delay cực nhỏ để đảm bảo Layout đã render xong (tránh lỗi méo hình)
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setIsScanning(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsScanning(false);
      setError(null);
    }
  }, [open]);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsScanning(true);
  }, []);

  const handleScanError = useCallback((errorMessage: string) => {
    // Chỉ set error nếu là lỗi nghiêm trọng (không tìm thấy camera, quyền truy cập...)
    if (errorMessage.includes('NotFoundError') || errorMessage.includes('NotAllowedError')) {
      setError(errorMessage);
    }
  }, []);

  if (!open) return null;

  return (
    <Box className="s-camera">
      <Box className={`s-camera-content ${error ? 'is-error' : ''}`}>
        <Box className="s-camera-header" sx={{ borderBottom: error ? 'none' : '1px solid #f0f0f0' }}>
          <Typography variant="h6" fontWeight="bold" color={error ? 'error' : 'primary'}>
            {error ? 'Lỗi Camera' : 'QR Scanner'}
          </Typography>
          <IconButton className="s-camera-close-btn" onClick={handleClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box className={`s-camera-body ${error ? 'is-error' : ''}`}>
          {error ? (
            <Box className="s-camera-error-view">
              {/* Icon Camera với hiệu ứng */}
              <Box className="error-icon-container">
                <Box className="error-icon-ring" />
                <Box className="error-icon-wrapper">
                  <CameraAltRoundedIcon className="camera-icon" />
                </Box>
                <Box className="error-slash" />
              </Box>

              {/* Tiêu đề lỗi */}
              <Typography className="error-title">
                Không thể truy cập Camera
              </Typography>

              <Typography className="error-subtitle">
                Thiết bị không tìm thấy camera hoặc quyền truy cập bị từ chối
              </Typography>

              {/* Hướng dẫn khắc phục */}
              <Box className="error-suggestions">
                <Typography className="suggestions-title">
                  💡 Hướng dẫn khắc phục:
                </Typography>
                <Box className="suggestions-list">
                  <Box className="suggestion-item">
                    <span className="suggestion-number">1</span>
                    <span>Kiểm tra quyền Camera trong cài đặt trình duyệt</span>
                  </Box>
                  <Box className="suggestion-item">
                    <span className="suggestion-number">2</span>
                    <span>Đóng các ứng dụng khác đang sử dụng camera</span>
                  </Box>
                  <Box className="suggestion-item">
                    <span className="suggestion-number">3</span>
                    <span>Tải lại trang và cấp quyền truy cập camera</span>
                  </Box>
                </Box>
              </Box>

              {/* Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 3, width: '100%' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={handleRetry}
                  className="retry-button"
                  fullWidth
                >
                  Thử lại
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => window.location.reload()}
                  className="reload-button"
                  fullWidth
                >
                  Tải lại trang
                </Button>
              </Stack>
            </Box>
          ) : (
            <Html5QrcodePlugin
              key="camera"
              fps={25}
              qrbox={150}
              isScanning={isScanning}
              qrCodeSuccessCallback={handleSuccess}
              qrCodeErrorCallback={handleScanError}
            />
          )}
        </Box>

        {!error && (
          <Box className="s-camera-footer">
            <Stack direction="row" spacing={2} justifyContent="center" width="100%">
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={() => setIsScanning(true)}
                disabled={isScanning}
                sx={{ borderRadius: '25px', flex: 1 }}
              >
                Start
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<StopRoundedIcon />}
                onClick={() => setIsScanning(false)}
                disabled={!isScanning}
                sx={{ borderRadius: '25px', flex: 1 }}
              >
                Stop
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CameraScan;
