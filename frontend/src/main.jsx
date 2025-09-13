import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext.jsx';
import { NotificationProvider } from '@context/NotificationContext.jsx';
import '@assets/css/global.css';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
        <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>,
)
