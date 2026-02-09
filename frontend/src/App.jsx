import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Paths } from '@config/Config';
import {
    AddItemForm,
    ItemPage,
    MyProfilePage,
    OrderPage,
    HomePage,
    ChatPage,
    AccountPage,
    ChatFullView
} from '@pages';
import { useAuth } from '@context/AuthContext';
import { ChatUIProvider } from '@context/ChatUIProvider';
import { Layout } from '@components/Layout';
import  ToasterProvider  from '@components/ToasterProvider/ToasterProvider';

import { Register, Login } from '@components/Auth';



export default function App() {

    const location = useLocation();
    const { isLoggedIn } = useAuth();

    const [showRegister, setShowRegister] = useState(false);
    const openRegister = () => setShowRegister(true);
    const closeRegister = () => setShowRegister(false);

    const [showLogin, setShowLogin] = useState(false);
    const openLogin = () => setShowLogin(true);
    const closeLogin = () => setShowLogin(false);


    useEffect(() => {
        if (location.state?.openRegister) {
            setShowRegister(true);
            window.history.replaceState({}, document.title);
        }

        if (location.state?.openLogin) {
            setShowLogin(true);
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
        <Layout openLogin={openLogin}>
            <ToasterProvider />
            <Routes>
                {/* Home */}
                <Route path={Paths.HOME} element={<HomePage />} />

                {/* Items */}
                <Route
                    path="/item/:itemId"
                    element={<ItemPage openLogin={openLogin} />}
                />

                <Route
                    path={Paths.ADD_ITEM()}
                    element={
                        <AuthenticatedRoute>
                            <AddItemForm />
                        </AuthenticatedRoute>
                    }
                />
                <Route
                    path={Paths.ADD_ITEM(':itemId')}
                    element={
                        <AuthenticatedRoute>
                            <AddItemForm />
                        </AuthenticatedRoute>
                    }
                />

                {/* Chat */}
                <Route
                    path={Paths.CHAT_FULL}
                    element={
                        <ChatUIProvider>
                            <ChatFullView />
                        </ChatUIProvider>
                    }
                />
                <Route
                    path={Paths.MESSAGES}
                    element={
                        <ChatUIProvider>
                            <ChatPage />
                        </ChatUIProvider>
                    }
                />

                {/* Orders */}
                <Route
                    path={Paths.ORDER(':id')}
                    element={
                        <AuthenticatedRoute>
                            <OrderPage />
                        </AuthenticatedRoute>
                    }
                />

                {/* Account */}
                <Route
                    path={Paths.ACCOUNT(':id') + '/*'}
                    element={
                        <AuthenticatedRoute>
                            <AccountPage />
                        </AuthenticatedRoute>
                    }
                />
                <Route path={Paths.PROFILE(':id')} element={<MyProfilePage />} />

            </Routes>

            {/* Modals */}
            {showLogin && <Login closeLogin={closeLogin} openRegister={openRegister} />}
            {showRegister && <Register closeRegister={closeRegister} openLogin={openLogin} />}
        </Layout>

    );
}
