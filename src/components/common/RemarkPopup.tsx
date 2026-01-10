import { useState, useEffect } from 'react'
import { useTranslation } from '../../contexts/LanguageContext'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CommentIcon from '@mui/icons-material/Comment'

interface RemarkPopupProps {
    isOpen: boolean
    onClose: () => void
    onSave: (remark: string) => void
    initialRemark?: string
}

const RemarkPopup = ({ isOpen, onClose, onSave, initialRemark = '' }: RemarkPopupProps) => {
    const { t } = useTranslation()
    const [remark, setRemark] = useState(initialRemark)

    useEffect(() => {
        setRemark(initialRemark)
    }, [initialRemark])

    const handleSave = () => {
        onSave(remark)
        setRemark('')
    }

    const handleClose = () => {
        onClose()
        setRemark('')
    }

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <CommentIcon />
                <Typography variant="h6" component="span" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {t('popup.remarkTitle') || 'Add Remark'}
                </Typography>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('popup.remarkSubtitle') || 'Enter your remark below. Click "Save" when done.'}
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={t('popup.remarkPlaceholder') || 'Enter remark...'}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    autoFocus
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#6a11cb' },
                            '&.Mui-focused fieldset': { borderColor: '#6a11cb' }
                        }
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #5a0db3 0%, #1e65e0 100%)' }
                    }}
                >
                    {t('popup.save')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                        borderRadius: 2,
                        borderColor: '#6a11cb',
                        color: '#6a11cb',
                        '&:hover': { borderColor: '#5a0db3', bgcolor: 'rgba(106, 17, 203, 0.04)' }
                    }}
                >
                    {t('popup.close')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default RemarkPopup
