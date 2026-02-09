import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { API_URLS, getAuthHeaders } from "@config/Config";
import { useAuth } from '@context/AuthContext';
import { getUserNotifications } from '@services/NotificationService';

export const NotificationSseContext = createContext([]);

export const NotificationSseProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { userId } = useAuth();
  const evtSourceRef = useRef(null);

  const disconnect = () => {
    if (evtSourceRef.current) {
      evtSourceRef.current.close();
      evtSourceRef.current = null;
    }
  };

  useEffect(() => {
    if (!userId) {
      disconnect();
      setNotifications([]);
      return;
    }

    getUserNotifications(userId)
      .then(data => setNotifications(data))
      .catch(err => console.error("Failed to fetch notifications", err));

    const token = getAuthHeaders().Authorization;
    const url = new URL(`${API_URLS.NOTIFICATION_STREAM}/${userId}`);
    url.searchParams.append("token", token);

    const evtSource = new EventSource(url.toString());
    evtSourceRef.current = evtSource; // ✅ σωστά

    evtSource.onopen = () => console.log("[SSE] Connection opened");

    evtSource.addEventListener("notification", event => {
      console.log("[SSE] Received notification:", event.data);
      try {
        const data = JSON.parse(event.data);
        setNotifications(prev => [...prev, data]);
      } catch (err) {
        console.error("[SSE] Failed to parse notification:", err);
      }
    });

    evtSource.onerror = err => {
      console.error("[SSE] SSE error:", err);
    };

    return () => {
      disconnect(); 
    };
  }, [userId]);

  return (
    <NotificationSseContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationSseContext.Provider>
  );
};


export function useNotificationSseContext() {
  const context = useContext(NotificationSseContext);
  if (!context) {
    throw new Error("useNotificationSseContext must be used within NotificationSseProvider");
  }
  return context;
}