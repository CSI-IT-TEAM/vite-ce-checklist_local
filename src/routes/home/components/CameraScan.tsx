import * as React from "react";
import { Box } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import Html5QrScanner from "./Html5QrScanner";
import "./CameraScan.scss";

/* -------------------- Types -------------------- */

export interface CameraScanProps {
    open: boolean;
    handleSuccess: (decodedText: string, decodedResult?: unknown) => void;
    handleClose: () => void;
}

/* ------------------ Component ------------------ */

const CameraScan: React.FC<CameraScanProps> = ({
    handleSuccess,
    handleClose,
}) => {
    return (
        <Box className="s-camera">
            <Box className="s-camera-content" sx={{
                padding: '0 !important',
                background: 'transparent',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                maxWidth: '360px',
                width: '90vw'
            }}>
                {/* Close button */}
                <Box
                    className="s-camera-icon"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        zIndex: 100,
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            background: 'rgba(0, 0, 0, 0.7)',
                            transform: 'scale(1.1)'
                        }
                    }}
                >
                    <CloseRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
                </Box>

                <Html5QrScanner onSuccess={handleSuccess} />
            </Box>
        </Box>
    );
};

export default CameraScan;
