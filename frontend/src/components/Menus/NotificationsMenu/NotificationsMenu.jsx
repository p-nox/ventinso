import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationsMenu.module.css';
import { markAsRead, markAllAsRead } from "@services/NotificationService.js";
import { useAuth } from '@context/AuthContext';

export default function NotificationsMenu({ notifications, setNotifications }) {
  const prevNotifications = [...notifications];
  const { userId } = useAuth();
  const navigate = useNavigate();

  const sortedNotifications = [...notifications].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );


  function handleClick(id, redirectUrl) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );

    markAsRead(id).catch(error => {
      console.error('Failed to mark notification as read', error);
      setNotifications(prevNotifications);
    });

    if (location.pathname === redirectUrl) {
      navigate(redirectUrl, { state: { refresh: Date.now() } });
    } else {
      navigate(redirectUrl);
    }
  }

  function handleMarkAllAsRead() {
    const prev = [...notifications];
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );

    markAllAsRead(userId).catch(error => {
      console.error('Failed to mark all as read', error);
      setNotifications(prev);
    });
  }

  return (
    <ul className={styles.dropdown}>
      {sortedNotifications.length > 0 ? (
        sortedNotifications.map(({ id, message, redirectUrl, isRead }) => (
          <li
            key={id}
            onClick={() => handleClick(id, redirectUrl)}
            className={!isRead ? styles.unread : ''}
          >
            {!isRead && <span className={styles.redBadge} />}
            {message}
          </li>
        ))
      ) : (
        <li className={styles.empty}>All Quiet</li>
      )}

      {sortedNotifications.length > 0 && (
        <li
          className={styles.markAllCenter}
          onClick={handleMarkAllAsRead}
        >
          Mark All as Read
        </li>
      )}
    </ul>
  );
}
