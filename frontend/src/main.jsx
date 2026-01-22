import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ChatWebSocketProvider, NotificationSseProvider , SearchProvider } from '@context';
import '@assets/styles/global.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationSseProvider >
        <ChatWebSocketProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </ChatWebSocketProvider>
      </NotificationSseProvider >
    </AuthProvider>
  </BrowserRouter>,
)
