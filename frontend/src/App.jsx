import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import AddItemForm from '@pages/AddItemFormPage/AddItemFormPage';
import Register from '@components/Register/Register';
import ItemPage from '@pages/ItemPage/ItemPage';
import MyProfilePage from '@pages/MyProfilePage/MyProfilePage';
import MyOrdersPage from '@pages/MyOrdersPage/MyOrdersPage';
import OrderPage from '@pages/OrderPage/OrderPage';
import HomePage from '@pages/HomePage/HomePage';
import { SearchProvider } from '@context/SearchContext';
import Layout from '@components/Layout/Layout';
import AccountPage from '@pages/AccountPage/AccountPage';
import { Paths } from '@config/Config';

export default function App() {
    const [showRegister, setShowRegister] = useState(false);
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const openRegister = () => setShowRegister(true);
    const closeRegister = () => setShowRegister(false);



    useEffect(() => {
        if (location.state?.openRegister) {
            setShowRegister(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);


    const AuthenticatedRoute = ({ children }) => {
        const currentLocation = useLocation();

        if (isLoggedIn) return children;

        // redirect to "/" with state to open Register modal
        return (
            <Navigate
                to="/"
                state={{ openRegister: true, from: currentLocation.pathname }}
                replace
            />
        );
    };


    return (
        <SearchProvider>
            <Layout
                showRegister={showRegister}
                closeRegister={closeRegister}
                openRegister={openRegister}
            >
                <Routes>
                    <Route path={Paths.HOME} element={<HomePage />} />
                    <Route path={Paths.ITEM(':id')} element={<ItemPage />} />
                    <Route path={Paths.PROFILE(':id')} element={<MyProfilePage />} />
                    <Route
                        path={Paths.ADD_ITEM}
                        element={
                            <AuthenticatedRoute>
                                <AddItemForm />
                            </AuthenticatedRoute>
                        }
                    />
                    <Route
                        path={Paths.ORDER(':id')}
                        element={
                            <AuthenticatedRoute>
                                <OrderPage />
                            </AuthenticatedRoute>
                        }
                    />
                    <Route
                        path={Paths.ACCOUNT(":id") + "/*"}
                        element={
                            <AuthenticatedRoute>
                                <AccountPage />
                            </AuthenticatedRoute>
                        }
                    />
                    <Route
                        path={Paths.ORDERS_HISTORY + "/*"}
                        element={
                            <AuthenticatedRoute>
                                <MyOrdersPage />
                            </AuthenticatedRoute>
                        }
                    />
                </Routes>

                {/* Register Modal */}
                {showRegister && <Register onClose={closeRegister} />}
            </Layout>
        </SearchProvider>
    );
}
