import { useEffect, lazy, Suspense } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { isNullOrEmpty } from "../utils/is-empty";

import LoginPage from "../pages/login/Login";
import HomeLayout from "../components/layout/HomeLayout";

const Dashboard = lazy(() => import('../pages/checklist/Checklist'));
const History = lazy(() => import('../pages/history/History'));
const Temperature = lazy(() => import('../pages/temperature/Temperature'));

// Import auth API
import { getEmployeeInfo } from '../api/auth';

const RequireLogin = () => {
    const navigate = useNavigate()
    const data = localStorage.getItem("userData");
    const userData = data ? JSON.parse(data) : null;

    // Listen for storage changes from other tabs (cross-tab logout sync)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // If logout event is triggered from another tab, redirect to login
            if (event.key === 'logout' && event.newValue) {
                navigate('/login')
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [navigate])

    // Refresh userData in background if rememberMe is enabled
    // This ensures avatar and other user data is always up-to-date
    useEffect(() => {
        const refreshUserData = async () => {
            const cardNumber = localStorage.getItem('cardNumber')
            const rememberMe = localStorage.getItem('rememberMe') === 'true'

            if (cardNumber && rememberMe && userData) {
                try {
                    const res = await getEmployeeInfo(cardNumber)
                    if (res.success && res.data?.OUT_CURSOR?.[0]) {
                        const newUserData = {
                            user: res.data.OUT_CURSOR
                        }
                        localStorage.setItem('userData', JSON.stringify(newUserData))
                    }
                } catch (err) {
                    console.error('Failed to refresh user data:', err)
                }
            }
        }

        if (userData) {
            refreshUserData()
        }
    }, []) // Run once on mount

    useEffect(() => {
        if (isNullOrEmpty(userData)) {
            navigate("/login");
        }
    }, [navigate, userData]);
    return <Outlet />;
}

export default function PageRouter() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<RequireLogin />}>
                    <Route element={<HomeLayout />}>
                        <Route path="/" element={
                            <Suspense fallback={<div>Loading...</div>}>
                                <Dashboard />
                            </Suspense>
                        } />
                        <Route path="/checklist" element={
                            <Suspense fallback={<div>Loading...</div>}>
                                <Dashboard />
                            </Suspense>
                        } />
                        <Route path="/temperature" element={
                            <Suspense fallback={<div>Loading...</div>}>
                                <Temperature />
                            </Suspense>
                        } />
                        <Route path="/history" element={
                            <Suspense fallback={<div>Loading...</div>}>
                                <History />
                            </Suspense>
                        } />
                    </Route>
                </Route>
            </Routes>
        </>
    );
}