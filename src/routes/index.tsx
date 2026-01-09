import { useEffect, lazy, Suspense } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { isNullOrEmpty } from "../utils/is-empty";

import LoginPage from "../pages/login/Login";
import HomeLayout from "../components/layout/HomeLayout";

const Dashboard = lazy(() => import('../pages/checklist/Checklist'));
const History = lazy(() => import('../pages/history/History'));
const Temperature = lazy(() => import('../pages/temperature/Temperature'));

const RequireLogin = () => {
    const navigate = useNavigate()
    const data = localStorage.getItem("userData");
    const userData = data ? JSON.parse(data) : null;

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