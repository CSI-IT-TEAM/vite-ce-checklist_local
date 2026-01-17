import { useState, useEffect, Suspense } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useTranslation } from '../../contexts/LanguageContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Tooltip,
    Button
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import ThermostatAutoIcon from '@mui/icons-material/ThermostatAuto'
import HistoryIcon from '@mui/icons-material/History'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'


const drawerWidth = 240
const collapsedWidth = 70

import {
    Zoom,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LanguageIcon from '@mui/icons-material/Language'
import PaletteIcon from '@mui/icons-material/Palette'
import { type ReactElement, forwardRef } from 'react'
import { ENV } from '../../api/config'

const Transition = forwardRef(function Transition(
    props: any & { children: ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Zoom ref={ref} {...props} />;
});

const Home = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { t, language, changeLanguage } = useTranslation()
    const { isDark, toggleTheme } = useThemeMode()
    const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null)
    const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Derive active menu from current path
    const getActiveMenu = () => {
        const path = location.pathname
        if (path.includes('/temperature')) return 'temperature'
        if (path.includes('/history')) return 'history'
        return 'home'
    }

    const activeMenu = getActiveMenu()

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const user = userData?.user?.[0] || userData
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nameEng || user?.NAME_ENG || 'User')}&background=6a11cb&color=fff`

    const getPhotoUrl = (photoUrl: any): string | undefined => {
        if (!photoUrl || photoUrl === 'NULL' || photoUrl === 'none' || photoUrl === 'undefined') return undefined;
        if (typeof photoUrl !== 'string') return undefined;
        if (photoUrl.startsWith('http')) return photoUrl;

        // Xử lý URL tương đối
        const baseUrl = ENV.API_SERVER.endsWith('/') ? ENV.API_SERVER.slice(0, -1) : ENV.API_SERVER;
        const path = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
        return `${baseUrl}${path}`;
    }

    const userInfo = {
        name: user?.nameEng || user?.NAME_ENG || user?.userName || user?.EMP_NAME || 'User',
        email: user?.deptName || user?.DEPT_NM || '',
        avatar: getPhotoUrl(user?.photo || user?.PHOTO_URL),
        fallbackAvatar: fallbackAvatar,
        initial: (user?.nameEng || user?.NAME_ENG || 'U').charAt(0).toUpperCase()
    }

    const languages = [
        { code: 'en', name: 'English', flag: '/images/en.png' },
        { code: 'vn', name: 'Việt Nam', flag: '/images/vn.png' }
    ]

    const menuItems = [
        { id: 'home', label: t('common.home'), icon: <HomeRoundedIcon />, path: '/' },
        { id: 'temperature', label: t('common.temperature'), icon: <ThermostatAutoIcon />, path: '/temperature' },
        { id: 'history', label: t('common.history'), icon: <HistoryIcon />, path: '/history' },
    ]

    const handleLogout = () => {
        const cardNumber = localStorage.getItem('cardNumber')
        const rememberMe = localStorage.getItem('rememberMe')
        const themeMode = localStorage.getItem('themeMode')
        const language = localStorage.getItem('language')

        // Trigger logout event for other tabs BEFORE clearing
        localStorage.setItem('logout', Date.now().toString())

        localStorage.clear()

        if (cardNumber) localStorage.setItem('cardNumber', cardNumber)
        if (rememberMe) localStorage.setItem('rememberMe', rememberMe)
        if (themeMode) localStorage.setItem('themeMode', themeMode)
        if (language) localStorage.setItem('language', language)

        navigate('/login')
    }

    const handleMenuClick = (path: string) => {
        navigate(path)
        if (isMobile) {
            setIsSidebarExpanded(false)
        }
    }

    const currentLanguage = languages.find(lang => lang.code === language)!

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1e3a5f 0%, #132f4c 100%)'
                        : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar>
                    {/* Menu Button - Hidden on Mobile */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Logo & System Name */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'stretch',
                            cursor: 'pointer',
                            flexGrow: 1
                        }}
                        onClick={() => navigate('/')}
                    >
                        {/* CSG Brand Logo - Justified */}
                        <Box
                            sx={{
                                bgcolor: isDark ? 'white' : '#1a2744',
                                p: { xs: 0.3, sm: 0.4 },
                                mr: 0.0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: '4px',
                                minWidth: { xs: 45, sm: 55 }
                            }}
                        >
                            <Box sx={{ width: '100%', height: '3px', bgcolor: isDark ? '#1a2744' : 'white', mb: 0.4, borderRadius: '1px' }} />
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                                {['C', 'S', 'G'].map((char, index) => (
                                    <Typography
                                        key={char}
                                        sx={{
                                            color: isDark ? '#1a2744' : 'white',
                                            fontWeight: 900,
                                            fontSize: { xs: '1.2rem', sm: '1.4rem' },
                                            lineHeight: 1,
                                            textAlign: index === 0 ? 'left' : index === 2 ? 'right' : 'center',
                                            transform: 'scaleY(1.45)',
                                            display: 'inline-block',
                                            flex: 1,
                                            // Chữ C bám lề trái, Chữ G bám lề phải tuyệt đối
                                            ml: index === 0 ? '-0.05em' : 0,
                                            mr: index === 2 ? '-0.05em' : 0
                                        }}
                                    >
                                        {char}
                                    </Typography>
                                ))}
                            </Box>
                            <Box sx={{ width: '100%', height: '3px', bgcolor: isDark ? '#1a2744' : 'white', mt: 0.4, borderRadius: '1px' }} />
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            py: { xs: 0.3, sm: 0.4 },
                            ml: 0.8
                        }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                lineHeight: 0.7,
                                transform: 'scaleY(1.3)',
                                transformOrigin: 'top'
                            }}>
                                CE Temperature Checklist
                            </Typography>
                            <Typography variant="caption" sx={{
                                opacity: 0.85,
                                display: 'block',
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                lineHeight: 0.7,
                                transform: 'scaleY(1.3)',
                                transformOrigin: 'bottom'
                            }}>
                                Management System
                            </Typography>
                        </Box>
                    </Box>

                    {/* Theme Toggle - Desktop */}
                    <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
                        <IconButton
                            color="inherit"
                            onClick={toggleTheme}
                            sx={{ mr: 1, display: { xs: 'none', md: 'flex' } }}
                        >
                            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* Language Selector - Hidden on Mobile (Moved to User Menu) */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Tooltip title="Switch Language">
                            <Button
                                color="inherit"
                                onClick={(e: React.MouseEvent<HTMLElement>) => setLangAnchorEl(e.currentTarget)}
                                sx={{
                                    mr: 2,
                                    px: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.08)',
                                        borderColor: 'rgba(255,255,255,0.3)'
                                    }
                                }}
                                startIcon={
                                    <img
                                        src={currentLanguage.flag}
                                        alt={currentLanguage.name}
                                        style={{ width: 22, height: 16, borderRadius: 2, objectFit: 'cover' }}
                                    />
                                }
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                    {currentLanguage.name}
                                </Typography>
                            </Button>
                        </Tooltip>
                        <Menu
                            anchorEl={langAnchorEl}
                            open={Boolean(langAnchorEl)}
                            onClose={() => setLangAnchorEl(null)}
                            PaperProps={{
                                sx: { borderRadius: 2, minWidth: 150, mt: 1 }
                            }}
                        >
                            {languages.map((lang) => (
                                <MenuItem
                                    key={lang.code}
                                    selected={language === lang.code}
                                    onClick={() => {
                                        changeLanguage(lang.code as 'en' | 'vn')
                                        setLangAnchorEl(null)
                                    }}
                                    sx={{ gap: 1.5 }}
                                >
                                    <img
                                        src={lang.flag}
                                        alt={lang.name}
                                        style={{ width: 24, height: 18, borderRadius: 2 }}
                                    />
                                    {lang.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* User Menu Trigger */}
                    <Tooltip title={userInfo.name}>
                        <IconButton
                            onClick={(e) => setUserAnchorEl(e.currentTarget)}
                            sx={{ p: 0.5 }}
                        >
                            <Avatar
                                src={userInfo.avatar || undefined}
                                alt={userInfo.name}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid rgba(255,255,255,0.5)',
                                    bgcolor: isDark ? 'primary.dark' : 'primary.light',
                                    fontWeight: 'bold'
                                }}
                                imgProps={{
                                    onError: (e) => {
                                        (e.target as HTMLImageElement).src = userInfo.fallbackAvatar
                                    }
                                }}
                            >
                                {userInfo.initial}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    {/* User Profile Menu - Unified Floating Card at Top-Right */}
                    <Menu
                        anchorEl={userAnchorEl}
                        open={Boolean(userAnchorEl)}
                        onClose={() => setUserAnchorEl(null)}
                        disableScrollLock
                        TransitionComponent={Transition}
                        MenuListProps={{ disablePadding: true, sx: { p: 0 } }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            sx: {
                                borderRadius: 4,
                                p: 0,
                                width: { xs: 'calc(100vw - 32px)', sm: 340 },
                                maxWidth: 340,
                                mt: 1.5,
                                overflow: 'hidden',
                                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)',
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                bgcolor: isDark ? '#1e293b' : '#ffffff',
                                backgroundImage: 'none',
                            }
                        }}
                    >
                        <ProfileContent
                            isMobile={isMobile}
                            userInfo={userInfo}
                            isDark={isDark}
                            toggleTheme={toggleTheme}
                            language={language}
                            changeLanguage={changeLanguage}
                            languages={languages}
                            handleLogout={handleLogout}
                            close={() => setUserAnchorEl(null)}
                            t={t}
                        />
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? isSidebarExpanded : true}
                onClose={() => setIsSidebarExpanded(false)}
                sx={{
                    width: isSidebarExpanded || isMobile ? drawerWidth : collapsedWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: isSidebarExpanded || isMobile ? drawerWidth : collapsedWidth,
                        boxSizing: 'border-box',
                        borderRight: 'none',
                        bgcolor: 'background.paper',
                        boxShadow: isDark ? '2px 0 10px rgba(0,0,0,0.3)' : '2px 0 10px rgba(0,0,0,0.05)',
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                        overflowX: 'hidden'
                    },
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}
                <Box sx={{ overflowX: 'hidden', overflowY: 'auto', mt: 2 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.id} disablePadding sx={{ px: 1, mb: 0.5 }}>
                                <ListItemButton
                                    selected={activeMenu === item.id}
                                    onClick={() => handleMenuClick(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        minHeight: 48,
                                        justifyContent: isSidebarExpanded || isMobile ? 'initial' : 'center',
                                        px: 2.5,
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(21, 101, 192, 0.1)',
                                            '&:hover': {
                                                bgcolor: 'rgba(21, 101, 192, 0.15)',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: '#1565c0'
                                            },
                                            '& .MuiListItemText-primary': {
                                                color: '#1565c0',
                                                fontWeight: 'bold'
                                            }
                                        },
                                        '&:hover': {
                                            bgcolor: 'rgba(0,0,0,0.04)'
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: isSidebarExpanded || isMobile ? 2 : 'auto',
                                            justifyContent: 'center',
                                            color: activeMenu === item.id ? '#1565c0' : 'text.secondary'
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        sx={{
                                            opacity: isSidebarExpanded || isMobile ? 1 : 0,
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    width: '100%',
                    minHeight: '100vh',
                    maxWidth: { md: 1600 },
                    mx: 'auto',
                    pb: { xs: 10, sm: 1 }
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}
                <Suspense
                    fallback={
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '50vh',
                                gap: 2
                            }}
                        >
                            <CircularProgress sx={{ color: '#6a11cb' }} />
                            <Typography color="text.secondary">Loading...</Typography>
                        </Box>
                    }
                >
                    <Outlet />
                </Suspense>
            </Box>

            {/* Bottom Navigation for Mobile */}
            {isMobile && (
                <Paper
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        borderRadius: '20px 20px 0 0',
                        overflow: 'hidden',
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
                    }}
                    elevation={3}
                >
                    <BottomNavigation
                        value={activeMenu}
                        showLabels
                        onChange={(_, newValue) => {
                            const item = menuItems.find(m => m.id === newValue)
                            if (item) handleMenuClick(item.path)
                        }}
                        sx={{
                            height: 70,
                            bgcolor: isDark ? '#0f172a' : '#ffffff',
                            '& .MuiBottomNavigationAction-root': {
                                color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary',
                                minWidth: 'auto',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    mt: 0.5
                                },
                                '&.Mui-selected': {
                                    color: '#1565c0',
                                    '& .MuiBottomNavigationAction-label': {
                                        fontSize: '0.8rem',
                                        fontWeight: 800,
                                    },
                                    '& .MuiSvgIcon-root': {
                                        transform: 'scale(1.2) translateY(-2px)',
                                        color: '#1565c0'
                                    }
                                }
                            }
                        }}
                    >
                        {menuItems.map((item) => (
                            <BottomNavigationAction
                                key={item.id}
                                value={item.id}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    )
}

// Sub-component for Profile Content to avoid duplication
const ProfileContent = ({ isMobile, userInfo, isDark, toggleTheme, language, changeLanguage, languages, handleLogout, close, t }: any) => {
    return (
        <Box sx={{ overflow: 'hidden' }}>
            {/* Header - Premium Gradient Section */}
            <Box sx={{
                background: isDark
                    ? 'linear-gradient(135deg, #1e3a5f 0%, #132f4c 100%)'
                    : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                borderBottom: '1px solid',
                borderColor: 'rgba(255,255,255,0.1)',
                p: { xs: 1.5, md: 2 },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'white',
                position: 'relative'
            }}>
                <Avatar
                    src={userInfo.avatar || undefined}
                    alt={userInfo.name}
                    sx={{
                        width: { xs: 46, md: 54 },
                        height: { xs: 46, md: 54 },
                        border: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        bgcolor: isDark ? 'primary.dark' : 'primary.light',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                    }}
                    imgProps={{
                        onError: (e) => {
                            (e.target as HTMLImageElement).src = userInfo.fallbackAvatar
                        }
                    }}
                >
                    {userInfo.initial}
                </Avatar>
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '0.9rem', md: '1.05rem' } }}>
                        {userInfo.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                        {userInfo.email || 'EMPLOYEE'}
                    </Typography>
                </Box>
                <IconButton onClick={close} sx={{ position: 'absolute', top: 4, right: 4, opacity: 0.5 }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

            <Box sx={{ p: { xs: 1.5, md: 2 }, pt: 0.5 }}>
                {/* Compact Settings Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
                    {/* Language Selection */}
                    {isMobile && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <LanguageIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.8 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                    {t('common.language')}
                                </Typography>
                            </Box>
                            <ToggleButtonGroup
                                value={language}
                                exclusive
                                onChange={(_, v) => v && changeLanguage(v)}
                                fullWidth
                                size="small"
                                sx={{
                                    bgcolor: 'transparent',
                                    gap: 1,
                                    '& .MuiToggleButton-root': {
                                        borderRadius: '12px !important',
                                        py: 1,
                                        fontSize: '0.75rem',
                                        border: '1px solid !important',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1) !important' : 'rgba(0,0,0,0.08) !important',
                                        color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&.Mui-selected': {
                                            bgcolor: isDark ? '#1565c0 !important' : '#1565c0 !important',
                                            color: 'white !important',
                                            fontWeight: 800,
                                            boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                                            borderColor: 'transparent !important'
                                        },
                                        '&:hover': {
                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                        }
                                    }
                                }}
                            >
                                {languages.map((lang: any) => (
                                    <ToggleButton key={lang.code} value={lang.code} sx={{ gap: 0.6 }}>
                                        <img src={lang.flag} alt="" style={{ width: 16, height: 11, borderRadius: 0.5 }} />
                                        {lang.name}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>
                    )}

                    {/* Theme Selection - Hidden on Desktop because it's in AppBar */}
                    {isMobile && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <PaletteIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.8 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                    Theme
                                </Typography>
                            </Box>
                            <ToggleButtonGroup
                                value={isDark ? 'dark' : 'light'}
                                exclusive
                                onChange={(_, v) => {
                                    if (v === 'dark' && !isDark) toggleTheme()
                                    if (v === 'light' && isDark) toggleTheme()
                                }}
                                fullWidth
                                size="small"
                                sx={{
                                    bgcolor: 'transparent',
                                    gap: 1,
                                    '& .MuiToggleButton-root': {
                                        borderRadius: '12px !important',
                                        py: 1,
                                        fontSize: '0.75rem',
                                        border: '1px solid !important',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1) !important' : 'rgba(0,0,0,0.08) !important',
                                        color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&.Mui-selected': {
                                            bgcolor: isDark ? '#1565c0 !important' : '#1565c0 !important',
                                            color: 'white !important',
                                            fontWeight: 800,
                                            boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                                            borderColor: 'transparent !important'
                                        },
                                        '&:hover': {
                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="light" sx={{ gap: 0.6 }}>
                                    <LightModeIcon sx={{ fontSize: 14 }} /> Light
                                </ToggleButton>
                                <ToggleButton value="dark" sx={{ gap: 0.6 }}>
                                    <DarkModeIcon sx={{ fontSize: 14 }} /> Dark
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Logout Button */}
                <Box
                    onClick={() => {
                        handleLogout()
                        close()
                    }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        p: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                        '&:hover': {
                            boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)',
                            transform: 'translateY(-1px)'
                        },
                        '&:active': { transform: 'translateY(1px)' }
                    }}
                >
                    <LogoutRoundedIcon sx={{ fontSize: 18 }} />
                    <Typography fontWeight={800} sx={{ fontSize: '0.9rem', letterSpacing: 0.5 }}>
                        {t('common.logout')}
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Home
