import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../contexts/LanguageContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Container
} from '@mui/material'
import ThermostatAutoIcon from '@mui/icons-material/ThermostatAuto'
import HistoryIcon from '@mui/icons-material/History'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const Checklist = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { isDark } = useThemeMode()

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const menuCards = [
        {
            id: 'temperature',
            path: '/temperature',
            icon: <ThermostatAutoIcon sx={{ fontSize: { xs: 30, md: 55 } }} />,
            titleKey: 'home.tempCardTitle',
            descKey: 'home.tempCardDesc',
            btnKey: 'home.tempCardBtn',
            gradient: isDark
                ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
                : 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)',
            glowColor: 'rgba(244, 67, 54, 0.4)'
        },
        {
            id: 'history',
            path: '/history',
            icon: <HistoryIcon sx={{ fontSize: { xs: 30, md: 55 } }} />,
            titleKey: 'home.historyCardTitle',
            descKey: 'home.historyCardDesc',
            btnKey: 'home.historyCardBtn',
            gradient: isDark
                ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                : 'linear-gradient(135deg, #448aff 0%, #2979ff 100%)',
            glowColor: 'rgba(33, 150, 243, 0.4)'
        }
    ]

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 1, md: 8 }, px: { xs: 1, md: 3 } }}>
            {/* Header Section */}
            <Box sx={{ mb: { xs: 1.5, md: 8 }, position: 'relative' }}>
                <Box sx={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    opacity: 0.1,
                    filter: 'blur(50px)',
                    borderRadius: '50%'
                }} />
                <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                        color: 'text.primary',
                        fontSize: { xs: '1.5rem', md: '3rem' },
                        mb: 0.5,
                        letterSpacing: '-0.02em',
                        background: isDark
                            ? 'linear-gradient(90deg, #fff 0%, #90caf9 100%)'
                            : 'linear-gradient(90deg, #1565c0 0%, #1e88e5 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {t('home.title')}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.8rem', md: '1.25rem' },
                        fontWeight: 500,
                        maxWidth: 600,
                        lineHeight: 1.4
                    }}
                >
                    {t('home.subtitle')}
                </Typography>
            </Box>

            {/* Cards Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(2, 1fr)'
                },
                gap: { xs: 1.2, md: 6 },
                justifyContent: 'center'
            }}>
                {menuCards.map((card) => (
                    <Card
                        key={card.id}
                        onClick={() => handleNavigation(card.path)}
                        sx={{
                            borderRadius: 6,
                            overflow: 'visible', // Để đổ bóng lan ra ngoài
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            bgcolor: 'background.paper',
                            boxShadow: isDark
                                ? '0 10px 40px rgba(0,0,0,0.4)'
                                : '0 10px 40px rgba(0,0,0,0.06)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            '&:hover': {
                                transform: { xs: 'translateY(-5px)', md: 'translateY(-15px)' },
                                boxShadow: `0 20px 50px ${card.glowColor}`,
                                '& .card-icon-container': {
                                    transform: 'scale(1.1) rotate(5deg)',
                                }
                            }
                        }}
                    >
                        {/* Interactive Top Header */}
                        <Box sx={{
                            position: 'relative',
                            height: { xs: 80, md: 180 },
                            borderRadius: { xs: '12px 12px 0 0', md: '24px 24px 0 0' },
                            overflow: 'hidden',
                            background: card.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>

                            <Box className="card-icon-container" sx={{
                                width: { xs: 50, md: 100 },
                                height: { xs: 50, md: 100 },
                                borderRadius: '30%',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                                {card.icon}
                            </Box>
                        </Box>

                        <CardContent sx={{ p: { xs: 2.5, md: 5 } }}>
                            <Typography
                                variant="h4"
                                fontWeight={800}
                                sx={{
                                    mb: { xs: 1, md: 1.5 },
                                    fontSize: { xs: '1.2rem', md: '2rem' },
                                    letterSpacing: '-0.02em',
                                    color: 'text.primary'
                                }}
                            >
                                {t(card.titleKey)}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    mb: { xs: 2, md: 4 },
                                    fontSize: { xs: '0.75rem', md: '1.1rem' },
                                    lineHeight: 1.4,
                                    height: { md: 60 } // Đối xứng giữa các card
                                }}
                            >
                                {t(card.descKey)}
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: 18, md: 24 } }} />}
                                sx={{
                                    py: { xs: 1.2, md: 2 },
                                    borderRadius: { xs: 2.5, md: 4 },
                                    background: card.gradient,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    fontSize: { xs: '0.85rem', md: '1.1rem' },
                                    boxShadow: `0 10px 20px ${card.glowColor}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: card.gradient,
                                        filter: 'brightness(1.1)',
                                        transform: 'scale(1.02)',
                                        boxShadow: `0 15px 30px ${card.glowColor}`,
                                    }
                                }}
                            >
                                {t(card.btnKey)}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Bottom Decoration for better feeling */}
            {/* <Box sx={{
                mt: 10,
                pt: 5,
                borderTop: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                opacity: 0.6
            }}>
                <Typography variant="caption" sx={{ letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
                    Professional Management System • {new Date().getFullYear()}
                </Typography>
            </Box> */}
        </Container>
    )
}

export default Checklist

