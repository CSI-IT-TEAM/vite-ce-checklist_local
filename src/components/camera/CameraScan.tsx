import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import { useState, useCallback, useEffect } from 'react';
import { useThemeMode } from '../../contexts/ThemeContext';

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
  const { isDark } = useThemeMode();

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
    <Box className={`s-camera ${isDark ? 'is-dark' : 'is-light'}`} onClick={handleClose}>
      <Box
        className={`s-camera-content ${error ? 'is-error' : ''}`}
        sx={{ bgcolor: isDark ? '#1e293b' : '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box className="s-camera-header" sx={{
          background: isDark
            ? 'linear-gradient(135deg, #1e3a5f 0%, #132f4c 100%)'
            : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
          color: 'white',
          borderBottom: 'none'
        }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
            {error ? 'Lỗi Camera' : 'QR Scanner'}
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'white', opacity: 0.8 }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className={`s-camera-body ${error ? 'is-error' : ''}`}>
          {error ? (
            <Box className="s-camera-error-view" sx={{ bgcolor: isDark ? '#0f172a' : '#f1f5f9' }}>
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
          <Box className="s-camera-footer" sx={{
            bgcolor: isDark ? '#0a121e' : '#f1f3f5',
            borderTop: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            pt: 2.5
          }}>
            <Stack direction="row" spacing={2} justifyContent="center" width="100%">
              <Button
                variant="contained"
                onClick={() => setIsScanning(true)}
                disabled={isScanning}
                sx={{
                  borderRadius: '12px',
                  flex: 1,
                  bgcolor: isDark ? 'primary.dark' : 'primary.main',
                  textTransform: 'none',
                  fontWeight: 700
                }}
              >
                Start
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsScanning(false)}
                disabled={!isScanning}
                sx={{
                  borderRadius: '12px',
                  flex: 1,
                  background: 'linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)',
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:disabled': { opacity: 0.5, color: 'rgba(255,255,255,0.5)' }
                }}
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
