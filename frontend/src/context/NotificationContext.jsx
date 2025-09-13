import React, { createContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@context/AuthContext';
import { getUserNotifications } from '@services/NotificationService';
import { getAuthHeaders } from "@config/Config";

export const NotificationContext = createContext([]);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { userId } = useAuth();
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {

    if (!userId) {

      if (stompClientRef.current && stompClientRef.current.connected) {

        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setNotifications([]);
      return;
    }

    getUserNotifications(userId)
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Failed to fetch notifications", err));


    const socket = new SockJS('http://localhost:8083/notifications');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
       connectHeaders: getAuthHeaders(),
      onConnect: () => {

        const subscription = stompClient.subscribe(
          `/topic/notifications/${userId}`,
          (message) => {
            const data = JSON.parse(message.body);

            console.table([data]);
            setNotifications((prev) => [...prev, data]);
          }
        );
        subscriptionRef.current = subscription;
      },
      onStompError: (frame) => {
        console.error('[NotificationProvider] STOMP error:', frame.headers['message']);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
