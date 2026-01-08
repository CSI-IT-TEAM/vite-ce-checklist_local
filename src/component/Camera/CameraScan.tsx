import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import Html5QrcodePlugin from '../CameraPlugin/Html5QrcodePlugin';
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

        <Box className="s-camera-body">
          {error ? (
            <Box className="s-camera-error-view">
              <Box className="error-icon-wrapper">
                <CameraAltRoundedIcon sx={{ fontSize: 60, color: '#999' }} />
              </Box>

              <Typography variant="h6" color="error" fontWeight="bold" align="center" sx={{ mt: 2 }}>
                Không tìm thấy camera trên thiết bị này
              </Typography>

              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, mb: 3 }}>
                Mã lỗi: {error}
              </Typography>

              <Box className="error-suggestions">
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Thử các bước sau:
                </Typography>
                <ul>
                  <li>Kiểm tra quyền Camera trong cài đặt trình duyệt</li>
                  <li>Đóng các app khác đang dùng camera</li>
                  <li>Tải lại trang và cho phép camera</li>
                </ul>
              </Box>

              <Button
                variant="contained"
                startIcon={<RefreshRoundedIcon />}
                onClick={handleRetry}
                className="retry-button"
                sx={{
                  mt: 3,
                  px: 4,
                  py: 1.5,
                  borderRadius: '30px',
                  background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Thử lại
              </Button>
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
