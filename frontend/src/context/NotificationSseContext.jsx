import React, { createContext, useState, useEffect } from 'react';
import { API_URLS } from "@config/Config";
import { useAuth } from '@context/AuthContext';
import { getUserNotifications } from '@services/NotificationService';
import { getAuthHeaders } from "@config/Config";

export const NotificationSseContext = createContext([]);

export const NotificationSseProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { userId } = useAuth();
  let evtSourceRef = null;

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      if (evtSourceRef) {
        evtSourceRef.close();
        evtSourceRef = null;
      }
      return;
    }

    getUserNotifications(userId)
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Failed to fetch notifications", err));

    const token = getAuthHeaders().Authorization;
    const url = new URL(`${API_URLS.NOTIFICATION_STREAM}/${userId}`);
    url.searchParams.append("token", token);

    const evtSource = new EventSource(url.toString());
    evtSourceRef = evtSource;

    evtSource.onopen = () => {
      console.log("[SSE] Connection opened");
    };


    evtSource.addEventListener("notification", (event) => {
      console.log("[SSE] Received notification event:", event.data);
      try {
        const data = JSON.parse(event.data);
        setNotifications((prev) => [...prev, data]);
      } catch (err) {
        console.error("[SSE] Failed to parse notification:", err);
      }
    });

    evtSource.onerror = (err) => {
      console.error("SSE error:", err);
    };

    return () => {
      if (evtSourceRef) {
        evtSourceRef.close();
        evtSourceRef = null;
      }
    };
  }, [userId]);

  return (
    <NotificationSseContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationSseContext.Provider>
  );
};

