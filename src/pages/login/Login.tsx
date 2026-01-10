import React, { useState, useEffect } from 'react'
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Container,
    InputAdornment,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress
} from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../contexts/LanguageContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import { getEmployeeInfo } from '../../api/auth'

const Login = () => {
    const [cardNumber, setCardNumber] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [validationError, setValidationError] = useState('')
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { isDark } = useThemeMode()

    useEffect(() => {
        const savedCard = localStorage.getItem('cardNumber')
        const savedRemember = localStorage.getItem('rememberMe') === 'true'
        if (savedCard && savedRemember) {
            setCardNumber(savedCard)
            setRememberMe(true)
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')
        setError('')

        if (!cardNumber) {
            setValidationError(t('login.errorCardEmpty'))
            return
        }

        setIsPending(true)
        try {
            const res = await getEmployeeInfo(cardNumber)
            if (res.success && res.data?.OUT_CURSOR?.[0]) {
                const userData = {
                    user: res.data.OUT_CURSOR
                }
                localStorage.setItem('userData', JSON.stringify(userData))
                if (rememberMe) {
                    localStorage.setItem('cardNumber', cardNumber)
                    localStorage.setItem('rememberMe', 'true')
                } else {
                    localStorage.removeItem('cardNumber')
                    localStorage.removeItem('rememberMe')
                }
                navigate('/')
            } else {
                setError(t('login.errorInvalidCard'))
            }
        } catch (err) {
            setError(t('login.errorSystem'))
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark
                ? 'radial-gradient(circle at 20% 30%, #1e3c72 0%, #0a1929 100%)'
                : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90d9 100%)',
            py: { xs: 2, md: 4 },
            px: 2,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Decoration */}
            <Box sx={{
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: isDark
                    ? 'radial-gradient(circle, rgba(25, 118, 210, 0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                top: '-25%',
                left: '-25%',
                animation: 'pulse 15s infinite alternate ease-in-out',
                zIndex: 0,
                '@keyframes pulse': {
                    '0%': { transform: 'scale(1) rotate(0deg)' },
                    '100%': { transform: 'scale(1.2) rotate(10deg)' }
                }
            }} />

            <Container maxWidth="xs" sx={{ px: { xs: 1, sm: 2 }, position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 6,
                        overflow: 'hidden',
                        bgcolor: isDark ? 'rgba(19, 47, 76, 0.8)' : 'background.paper',
                        backdropFilter: 'blur(20px)',
                        boxShadow: isDark
                            ? '0 25px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)'
                            : '0 25px 50px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {/* Header */}
                    {/* Header - Brand Identity Only */}
                    <Box sx={{
                        background: isDark
                            ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1929 100%)'
                            : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                        pt: { xs: 4, md: 5 },
                        pb: { xs: 3, md: 4 },
                        px: 3,
                        textAlign: 'center',
                        color: 'white',
                        position: 'relative'
                    }}>
                        {/* CSG Brand Logo */}
                        <Box
                            sx={{
                                bgcolor: '#1a2744',
                                p: { xs: 1.2, md: 2 },
                                mx: 'auto',
                                mb: 1.5,
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 1.5,
                                boxShadow: '0 15px 45px rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <Box sx={{ width: '100%', height: { xs: '4px', md: '5px' }, bgcolor: 'white', mb: { xs: 0.8, md: 1.2 }, borderRadius: '1.5px' }} />
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                                {['C', 'S', 'G'].map((char) => (
                                    <Typography
                                        key={char}
                                        sx={{
                                            color: 'white',
                                            fontWeight: 950,
                                            fontSize: { xs: '2.2rem', md: '3.8rem' },
                                            lineHeight: 1,
                                            textAlign: 'center',
                                            transform: 'scaleY(1.35)',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {char}
                                    </Typography>
                                ))}
                            </Box>
                            <Box sx={{ width: '100%', height: { xs: '4px', md: '5px' }, bgcolor: 'white', mt: { xs: 0.8, md: 1.2 }, borderRadius: '1.5px' }} />
                        </Box>

                        {/* System Branding - Subtle & Integrated */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{
                                fontWeight: 800,
                                fontSize: { xs: '1rem', md: '1.4rem' },
                                color: 'white',
                                opacity: 0.9,
                                lineHeight: 1,
                                letterSpacing: 1
                            }}>
                                VJ CE
                            </Typography>
                            <Typography sx={{
                                fontSize: { xs: '0.55rem', md: '0.65rem' },
                                color: 'white',
                                opacity: 0.7,
                                fontWeight: 600,
                                letterSpacing: 3,
                                textTransform: 'uppercase',
                                mt: 0.5
                            }}>
                                MOBILE SYSTEM
                            </Typography>
                        </Box>
                    </Box>

                    {/* Form Section - Action & Feedback */}
                    <Box component="form" onSubmit={handleLogin} sx={{ p: { xs: 3, md: 5 }, pt: { xs: 3, md: 4 } }}>
                        <Box sx={{ mb: 2.5, textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight={800} sx={{
                                fontSize: { xs: '1.4rem', md: '1.75rem' },
                                color: isDark ? 'white' : 'text.primary',
                                mb: 0.5
                            }}>
                                {t('login.header')}
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: 'text.secondary',
                                fontWeight: 500,
                                opacity: 0.85
                            }}>
                                {t('login.subtitle')}
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            label={t('login.cardNumber')}
                            placeholder=""
                            variant="outlined"
                            margin="normal"
                            value={cardNumber}
                            onChange={(e) => {
                                setCardNumber(e.target.value)
                                setValidationError('')
                                setError('')
                            }}
                            error={!!validationError || !!error}
                            disabled={isPending}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CreditCardIcon sx={{ color: isDark ? 'primary.light' : 'primary.main' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 3,
                                    height: 60,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                                    '& fieldset': {
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                    '& input': {
                                        color: 'text.primary',
                                    },
                                    '& input::placeholder': {
                                        color: 'text.secondary',
                                        opacity: 0.5
                                    }
                                }
                            }}
                            InputLabelProps={{
                                sx: {
                                    fontWeight: 600,
                                    '&.Mui-focused': {
                                        color: 'primary.main'
                                    }
                                }
                            }}
                        />

                        {validationError && <Alert severity="warning" sx={{ mt: 2, borderRadius: 2, fontWeight: 500 }}>{validationError}</Alert>}
                        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2, fontWeight: 500 }}>{error}</Alert>}

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>{t('login.rememberMe')}</Typography>}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isPending}
                            sx={{
                                py: 2,
                                borderRadius: 3,
                                background: isDark
                                    ? 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)'
                                    : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                textTransform: 'none',
                                boxShadow: isDark
                                    ? '0 8px 24px rgba(25, 118, 210, 0.4)'
                                    : '0 8px 24px rgba(21, 101, 192, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: isDark
                                        ? '0 12px 32px rgba(25, 118, 210, 0.6)'
                                        : '0 12px 32px rgba(21, 101, 192, 0.5)',
                                    background: isDark
                                        ? 'linear-gradient(135deg, #64b5f6 0%, #1e88e5 100%)'
                                        : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                }
                            }}
                        >
                            {isPending ? <CircularProgress size={26} color="inherit" /> : t('login.submit')}
                        </Button>

                        <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 4, color: 'text.secondary', fontWeight: 600, opacity: 0.6, letterSpacing: 1 }}>
                            © {new Date().getFullYear()} CSG MANAGEMENT SYSTEM
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default Login

