import { useEffect, lazy, Suspense } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { isNullOrEmpty } from "../funtions/is-empty";

import LoginPage from "./login/LoginLocal";
import HomeLayout from "./home/Home";

const Dashboard = lazy(() => import('./home/components/Checklist'));
const History = lazy(() => import('./home/components/History'));
const Temperature = lazy(() => import('./home/components/Temperature'));

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