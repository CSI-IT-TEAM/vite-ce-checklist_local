import { useState, useEffect, useRef, Suspense } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import './Home.css'
import { useTranslation } from '../../contexts/LanguageContext'

const Home = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { t, language, changeLanguage } = useTranslation()
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

    // Scroll to top and reset viewport on mount (fix iOS keyboard issue)
    useEffect(() => {
        window.scrollTo(0, 0)
        // Force repaint to reset iOS viewport
        document.body.style.minHeight = '100vh'
        document.body.style.minHeight = '100dvh'
    }, [])

    // Derive active menu from current path
    const getActiveMenu = () => {
        const path = location.pathname
        if (path.includes('/temperature')) return 'temperature'
        if (path.includes('/history')) return 'history'
        return 'home'
    }

    const activeMenu = getActiveMenu()

    const dropdownRef = useRef<HTMLDivElement>(null)
    const languageDropdownRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLElement>(null)

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')

    // Handle different data structures (LoginLocal format hoặc Login format cũ)
    const user = userData?.user?.[0] || userData

    // Dùng nameEng thay vì userName vì tên tiếng Việt bị lỗi encoding VNI
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nameEng || user?.NAME_ENG || 'User')}&background=4F46E5&color=fff`

    // Convert photo URL từ HTTP sang HTTPS để tránh mixed content
    const getPhotoUrl = (photoUrl: string | undefined): string => {
        if (!photoUrl) return fallbackAvatar
        // Chuyển http://vjweb.dskorea.com:9090/... sang https://vjweb.dskorea.com:9091/...
        if (photoUrl.startsWith('http://vjweb.dskorea.com:9090/')) {
            return photoUrl.replace('http://vjweb.dskorea.com:9090/', 'https://vjweb.dskorea.com:9091/')
        }
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
        { id: 'home', label: t('common.home'), icon: '🏠', path: '/' },
        { id: 'temperature', label: t('common.temperature'), icon: '🌡️', path: '/temperature' },
        { id: 'history', label: t('common.history'), icon: '📜', path: '/history' },
    ]

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false)
            }
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
                setShowLanguageDropdown(false)
            }
            // Close sidebar on mobile when clicking outside
            if (window.innerWidth < 768 &&
                isSidebarExpanded &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)) {
                // Check if click is not on the toggle button
                const toggleButton = document.querySelector('.sidebar-toggle')
                if (toggleButton && !toggleButton.contains(event.target as Node)) {
                    setIsSidebarExpanded(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isSidebarExpanded])

    // Removed media query effect - toggle state only changes on user click

    const handleLogout = () => {
        // Keep cardNumber and rememberMe if they exist
        const cardNumber = localStorage.getItem('cardNumber')
        const rememberMe = localStorage.getItem('rememberMe')

        localStorage.clear()

        // Restore them if they existed
        if (cardNumber) localStorage.setItem('cardNumber', cardNumber)
        if (rememberMe) localStorage.setItem('rememberMe', rememberMe)

        navigate('/login')
    }

    const toggleUserDropdown = () => {
        setShowUserDropdown(!showUserDropdown)
    }

    const toggleLanguageDropdown = () => {
        setShowLanguageDropdown(!showLanguageDropdown)
    }

    const handleLanguageSelect = (langCode: 'en' | 'vn') => {
        changeLanguage(langCode)
        setShowLanguageDropdown(false)
    }

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded)
    }

    const handleMenuClick = (path: string) => {
        navigate(path)
        // Auto-hide sidebar on mobile after menu selection
        if (window.innerWidth < 768) {
            setIsSidebarExpanded(false)
        }
    }

    const currentLanguage = languages.find(lang => lang.code === language)!

    return (
        <div className="home-container">
            {/* AppBar */}
            <header className="app-bar">
                <div className="app-bar-left">
                    <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <div className="logo-box">CSG</div>
                        <div className="logo-text">
                            <div className="company-name">CE Temperature Checklist</div>
                            <div className="system-name">Management System</div>
                        </div>
                    </div>
                    {/* Sidebar Toggle Button */}
                    <button
                        className={`sidebar-toggle ${isSidebarExpanded ? 'expanded' : ''}`}
                        onClick={toggleSidebar}
                        title={isSidebarExpanded ? "Collapse Menu" : "Expand Menu"}
                    >
                        <div className="toggle-handle"></div>
                    </button>
                </div>

                <div className="app-bar-right">


                    <div className="language-menu" ref={languageDropdownRef}>
                        <div className="language-selector" onClick={toggleLanguageDropdown}>
                            <img src={currentLanguage.flag} alt={currentLanguage.name} className="flag-icon" />
                            <span>{currentLanguage.name}</span>
                            <span className="dropdown-arrow">▼</span>
                        </div>
                        {showLanguageDropdown && (
                            <div className="language-dropdown">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`language-option ${language === lang.code ? 'active' : ''}`}
                                        onClick={() => handleLanguageSelect(lang.code as 'en' | 'vn')}
                                    >
                                        <img src={lang.flag} alt={lang.name} className="flag-icon" />
                                        <span>{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="user-menu" ref={dropdownRef}>
                        <div className="user-avatar" onClick={toggleUserDropdown} title="User Menu">
                            <img
                                src={userInfo.avatar}
                                alt={userInfo.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = userInfo.fallbackAvatar; }}
                            />
                        </div>
                        {showUserDropdown && (
                            <div className="user-dropdown">
                                <div className="user-dropdown-header">
                                    <div className="user-dropdown-avatar">
                                        <img
                                            src={userInfo.avatar}
                                            alt={userInfo.name}
                                            onError={(e) => { (e.target as HTMLImageElement).src = userInfo.fallbackAvatar; }}
                                        />
                                    </div>
                                    <div className="user-dropdown-info">
                                        <div className="user-dropdown-name">{userInfo.name}</div>
                                        <div className="user-dropdown-email">{userInfo.email}</div>
                                    </div>
                                </div>
                                {/* Language selector for mobile - hidden on desktop */}
                                <div className="mobile-language-selector">
                                    <div className="language-label">{t('common.language')}</div>
                                    <div className="language-options">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                className={`mobile-lang-option ${language === lang.code ? 'active' : ''}`}
                                                onClick={() => handleLanguageSelect(lang.code as 'en' | 'vn')}
                                            >
                                                <img src={lang.flag} alt={lang.name} className="flag-icon" />
                                                <span>{lang.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button className="sign-out-btn" onClick={handleLogout}>
                                    <div className="sign-out-content">
                                        <svg className="sign-out-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        <span>{t('common.logout')}</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="main-layout">
                {/* Sidebar Menu */}
                <aside ref={sidebarRef} className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
                    <div className="sidebar-header">
                        <h3>MENU</h3>
                    </div>
                    <nav className="sidebar-menu">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item.path)}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Overlay for mobile when sidebar is open */}
                {isSidebarExpanded && window.innerWidth < 768 && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setIsSidebarExpanded(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className={`content-area page-${activeMenu}`}>
                    <Suspense fallback={
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading...</p>
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </main>
            </div>

            {/* Bottom Navigation for Mobile */}
            <nav className="bottom-nav">
                <button
                    className={`bottom-nav-item ${activeMenu === 'home' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('/')}
                >
                    <span className="bottom-nav-icon">🏠</span>
                    <span className="bottom-nav-label">{t('common.home')}</span>
                </button>
                <button
                    className={`bottom-nav-item ${activeMenu === 'temperature' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('/temperature')}
                >
                    <span className="bottom-nav-icon">🌡️</span>
                    <span className="bottom-nav-label">{t('common.temperature')}</span>
                </button>
                {/* 📋 */}
                <button
                    className={`bottom-nav-item ${activeMenu === 'history' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('/history')}
                >
                    <span className="bottom-nav-icon">📜</span>
                    <span className="bottom-nav-label">{t('common.history')}</span>
                </button>
            </nav>
        </div>
    )
}

export default Home
