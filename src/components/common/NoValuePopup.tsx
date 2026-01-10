import { useState } from 'react'
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
import ThermostatIcon from '@mui/icons-material/Thermostat'

interface NoValuePopupProps {
    isOpen: boolean
    onClose: () => void
    onSave: (temperature: string, remark: string) => void
    initialTemperature?: string
    initialRemark?: string
}

const NoValuePopup = ({ isOpen, onClose, onSave, initialTemperature = '', initialRemark = '' }: NoValuePopupProps) => {
    const { t } = useTranslation()
    const [temperature, setTemperature] = useState(initialTemperature)
    const [remark, setRemark] = useState(initialRemark)

    const handleSave = () => {
        onSave(temperature, remark)
        setTemperature('')
        setRemark('')
    }

    const handleClose = () => {
        onClose()
        setTemperature('')
        setRemark('')
    }

    const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setTemperature(value)
        }
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
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <ThermostatIcon />
                <Typography variant="h6" component="span" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {t('popup.editTitle')}
                </Typography>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {t('popup.editSubtitle')}
                </Typography>

                <TextField
                    fullWidth
                    label={t('popup.temperatureLabel')}
                    placeholder={t('popup.temperaturePlaceholder')}
                    value={temperature}
                    onChange={handleTemperatureChange}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#f5576c' },
                            '&.Mui-focused fieldset': { borderColor: '#f5576c' }
                        }
                    }}
                />

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={
                        <>
                            {t('popup.issueLabel')} <span style={{ color: 'red' }}>*</span>
                        </>
                    }
                    placeholder={t('popup.issuePlaceholder')}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#f5576c' },
                            '&.Mui-focused fieldset': { borderColor: '#f5576c' }
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
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #e080e8 0%, #e04a5e 100%)' }
                    }}
                >
                    {t('popup.save')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                        borderRadius: 2,
                        borderColor: '#f5576c',
                        color: '#f5576c',
                        '&:hover': { borderColor: '#e04a5e', bgcolor: 'rgba(245, 87, 108, 0.04)' }
                    }}
                >
                    {t('popup.close')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default NoValuePopup
