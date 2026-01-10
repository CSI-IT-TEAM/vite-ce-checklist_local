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
    Tooltip
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
    Dialog,
    Zoom,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LanguageIcon from '@mui/icons-material/Language'
import PaletteIcon from '@mui/icons-material/Palette'
import { type ReactElement, forwardRef } from 'react'

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

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

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

    const getPhotoUrl = (photoUrl: string | undefined): string => {
        if (!photoUrl) return fallbackAvatar
        return photoUrl
    }

    const userInfo = {
        name: user?.nameEng || user?.NAME_ENG || user?.userName || user?.EMP_NAME || 'User',
        email: user?.deptName || user?.DEPT_NM || '',
        avatar: getPhotoUrl(user?.photo || user?.PHOTO_URL),
        fallbackAvatar: fallbackAvatar
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
        localStorage.clear()
        if (cardNumber) localStorage.setItem('cardNumber', cardNumber)
        if (rememberMe) localStorage.setItem('rememberMe', rememberMe)
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
                            alignItems: 'center',
                            cursor: 'pointer',
                            flexGrow: 1
                        }}
                        onClick={() => navigate('/')}
                    >
                        {/* CSG Logo */}
                        <Box
                            sx={{
                                bgcolor: '#1a2744',
                                px: { xs: 0.6, sm: 0.8 },
                                py: { xs: 0.4, sm: 0.5 },
                                mr: 0.8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 0.5
                            }}
                        >
                            <Box sx={{ width: '100%', height: '2.5px', bgcolor: 'white', mb: 0.15 }} />
                            <Typography
                                sx={{
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: { xs: '1.25rem', sm: '1.4rem' },
                                    lineHeight: 1,
                                    letterSpacing: 2
                                }}
                            >
                                CSG
                            </Typography>
                            <Box sx={{ width: '100%', height: '2.5px', bgcolor: 'white', mt: 0.15 }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.2} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                CE Temperature Checklist
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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
                        <Tooltip title="Language">
                            <IconButton
                                color="inherit"
                                onClick={(e) => setLangAnchorEl(e.currentTarget)}
                                sx={{ mr: 1 }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <img
                                        src={currentLanguage.flag}
                                        alt={currentLanguage.name}
                                        style={{ width: 24, height: 18, borderRadius: 2 }}
                                    />
                                </Box>
                            </IconButton>
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
                                src={userInfo.avatar}
                                alt={userInfo.name}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid rgba(255,255,255,0.5)'
                                }}
                                imgProps={{
                                    onError: (e) => {
                                        (e.target as HTMLImageElement).src = userInfo.fallbackAvatar
                                    }
                                }}
                            />
                        </IconButton>
                    </Tooltip>

                    {/* User Profile Menu/Dialog */}
                    {isMobile ? (
                        <Dialog
                            open={Boolean(userAnchorEl)}
                            onClose={() => setUserAnchorEl(null)}
                            TransitionComponent={Transition}
                            keepMounted
                            PaperProps={{
                                sx: {
                                    borderRadius: 4,
                                    width: '85%',
                                    maxWidth: 340,
                                    bgcolor: isDark ? '#1e293b' : '#ffffff',
                                    backgroundImage: 'none',
                                    boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.15)',
                                    overflow: 'hidden'
                                }
                            }}
                        >
                            <ProfileContent
                                isMobile={true}
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
                        </Dialog>
                    ) : (
                        <Menu
                            anchorEl={userAnchorEl}
                            open={Boolean(userAnchorEl)}
                            onClose={() => setUserAnchorEl(null)}
                            disableScrollLock
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                sx: {
                                    borderRadius: 3,
                                    minWidth: 320,
                                    mt: 1.5,
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    bgcolor: isDark ? '#1e293b' : '#ffffff'
                                }
                            }}
                        >
                            <ProfileContent
                                isMobile={false}
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
                    )}
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
                            height: 65,
                            '& .MuiBottomNavigationAction-root': {
                                color: 'text.secondary',
                                minWidth: 'auto',
                                '&.Mui-selected': {
                                    color: '#1565c0'
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
        <Box>
            {/* Header with Background Gradient */}
            <Box sx={{
                background: isDark
                    ? 'linear-gradient(135deg, #1e3a5f 0%, #132f4c 100%)'
                    : 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                p: { xs: 2, md: 3 },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                color: 'white',
                position: 'relative'
            }}>
                <Avatar
                    src={userInfo.avatar}
                    sx={{
                        width: { xs: 54, md: 70 },
                        height: { xs: 54, md: 70 },
                        border: '2px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                />
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                        {userInfo.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {userInfo.email || 'EMPLOYEE'}
                    </Typography>
                </Box>
                <IconButton onClick={close} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', opacity: 0.7 }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                {/* Compact Settings Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
                    {/* Language Selection */}
                    {isMobile && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                                <LanguageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>
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
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    '& .MuiToggleButton-root': {
                                        borderRadius: 2,
                                        py: 0.8,
                                        fontSize: '0.75rem',
                                        border: '1px solid divider',
                                        '&.Mui-selected': {
                                            bgcolor: isDark ? 'rgba(21, 101, 192, 0.2)' : 'rgba(21, 101, 192, 0.1)',
                                            color: isDark ? '#90caf9' : '#1565c0',
                                            fontWeight: 700
                                        }
                                    }
                                }}
                            >
                                {languages.map((lang: any) => (
                                    <ToggleButton key={lang.code} value={lang.code} sx={{ gap: 0.8 }}>
                                        <img src={lang.flag} alt="" style={{ width: 18, height: 12, borderRadius: 1 }} />
                                        {lang.name}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>
                    )}

                    {/* Theme Selection */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                            <PaletteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>
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
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                '& .MuiToggleButton-root': {
                                    borderRadius: 2,
                                    py: 0.8,
                                    fontSize: '0.75rem',
                                    border: '1px solid divider',
                                    '&.Mui-selected': {
                                        bgcolor: isDark ? 'rgba(21, 101, 192, 0.2)' : 'rgba(21, 101, 192, 0.1)',
                                        color: isDark ? '#90caf9' : '#1565c0',
                                        fontWeight: 700
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="light" sx={{ gap: 0.8 }}>
                                <LightModeIcon sx={{ fontSize: 16 }} /> Light
                            </ToggleButton>
                            <ToggleButton value="dark" sx={{ gap: 0.8 }}>
                                <DarkModeIcon sx={{ fontSize: 16 }} /> Dark
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

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
