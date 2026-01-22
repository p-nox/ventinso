import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Paths } from '@config/Config';
import {
    AddItemForm,
    ItemPage,
    MyProfilePage,
    MyOrdersPage,
    OrderPage,
    HomePage,
    ChatPage,
    AccountPage
} from '@pages';

import { useAuth } from '@context/AuthContext';
import { ChatUIProvider } from '@context/ChatUIProvider';
import { Layout } from '@components/Layout';
import { Register } from '@components/Auth';


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
                    path="/add-item"
                    element={
                        <AuthenticatedRoute>
                            <AddItemForm />
                        </AuthenticatedRoute>
                    }
                />
                <Route
                    path="/item/:itemId/add-item"
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
                <Route
                    path="/messages"
                    element={
                        <ChatUIProvider>
                            <ChatPage />
                        </ChatUIProvider>
                    }
                />
            </Routes>

            {/* Register Modal */}
            {showRegister && <Register onClose={closeRegister} />}
        </Layout>
    );
}
