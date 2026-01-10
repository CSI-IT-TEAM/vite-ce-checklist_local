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

                    {/* User Menu Popover */}
                    <Menu
                        anchorEl={userAnchorEl}
                        open={Boolean(userAnchorEl)}
                        onClose={() => setUserAnchorEl(null)}
                        disableScrollLock
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                minWidth: 280,
                                mt: 1.5,
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        {/* Profile Header (Blue Gradient) */}
                        <Box sx={{
                            background: 'linear-gradient(135deg, #0081f1 0%, #0069c0 100%)',
                            p: 2.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <Avatar
                                src={userInfo.avatar}
                                sx={{
                                    width: 72,
                                    height: 72,
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    mb: 1.5,
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.2 }}>
                                {userInfo.name}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, letterSpacing: 0.5, fontWeight: 500 }}>
                                {userInfo.email || 'EMPLOYEE'}
                            </Typography>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            {/* Language Section - Mobile Only inside menu */}
                            {isMobile && (
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                                        {t('common.language') || 'Ngôn ngữ'}
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                                        {languages.map((lang) => (
                                            <Box
                                                key={lang.code}
                                                onClick={() => {
                                                    changeLanguage(lang.code as 'en' | 'vn')
                                                    setUserAnchorEl(null)
                                                }}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 1,
                                                    p: 1.2,
                                                    borderRadius: 2,
                                                    border: language === lang.code ? '1.5px solid #1565c0' : '1px solid #e0e0e0',
                                                    bgcolor: language === lang.code ? 'rgba(21, 101, 192, 0.05)' : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: language === lang.code ? 'rgba(21, 101, 192, 0.08)' : 'rgba(0,0,0,0.02)' }
                                                }}
                                            >
                                                <img src={lang.flag} alt="" style={{ width: 22, height: 16, borderRadius: 1 }} />
                                                <Typography variant="body2" fontWeight={language === lang.code ? 700 : 500} color={language === lang.code ? 'primary' : 'text.primary'}>
                                                    {lang.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Divider sx={{ mt: 2.5 }} />
                                </Box>
                            )}

                            {/* Theme Toggle Section */}
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                                    Theme
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                                    <Box
                                        onClick={() => {
                                            if (isDark) toggleTheme()
                                            setUserAnchorEl(null)
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            p: 1.2,
                                            borderRadius: 2,
                                            border: !isDark ? '1.5px solid #1565c0' : '1px solid #e0e0e0',
                                            bgcolor: !isDark ? 'rgba(21, 101, 192, 0.05)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: !isDark ? 'rgba(21, 101, 192, 0.08)' : 'rgba(0,0,0,0.02)' }
                                        }}
                                    >
                                        <LightModeIcon sx={{ fontSize: 18, color: !isDark ? '#1565c0' : 'text.secondary' }} />
                                        <Typography variant="body2" fontWeight={!isDark ? 700 : 500} color={!isDark ? 'primary' : 'text.primary'}>
                                            Light
                                        </Typography>
                                    </Box>
                                    <Box
                                        onClick={() => {
                                            if (!isDark) toggleTheme()
                                            setUserAnchorEl(null)
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            p: 1.2,
                                            borderRadius: 2,
                                            border: isDark ? '1.5px solid #1565c0' : '1px solid #e0e0e0',
                                            bgcolor: isDark ? 'rgba(21, 101, 192, 0.05)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: isDark ? 'rgba(21, 101, 192, 0.08)' : 'rgba(0,0,0,0.02)' }
                                        }}
                                    >
                                        <DarkModeIcon sx={{ fontSize: 18, color: isDark ? '#1565c0' : 'text.secondary' }} />
                                        <Typography variant="body2" fontWeight={isDark ? 700 : 500} color={isDark ? 'primary' : 'text.primary'}>
                                            Dark
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ mt: 2.5 }} />
                            </Box>

                            {/* Logout Action */}
                            <Box
                                onClick={handleLogout}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1.2,
                                    p: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 15px rgba(211, 47, 47, 0.25)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(211, 47, 47, 0.35)',
                                        transform: 'translateY(-1px)'
                                    },
                                    '&:active': { transform: 'translateY(0)' }
                                }}
                            >
                                <LogoutRoundedIcon sx={{ fontSize: 20 }} />
                                <Typography fontWeight="bold" sx={{ fontSize: '0.95rem' }}>{t('common.logout')}</Typography>
                            </Box>
                        </Box>
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

export default Home
