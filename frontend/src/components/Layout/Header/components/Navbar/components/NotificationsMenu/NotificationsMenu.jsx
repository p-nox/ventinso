import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationsMenu.module.css';
import { markAsRead, markAllAsRead } from "@services/NotificationService.js";
import { useAuth } from '@context/AuthContext';
import { Paths, API_URLS } from '@config/Config';
import { Settings } from "lucide-react";
import { timeAgo } from '@utils/utils';

export default function NotificationsMenu({ notifications, setNotifications, onClose }) {
  const prevNotifications = [...notifications];
  const { userId } = useAuth();
  const navigate = useNavigate();

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleClick = (id, redirectUrl) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    markAsRead(id).catch(error => {
      console.error("Failed to mark notification as read", error);
      setNotifications(prevNotifications);
    });

    onClose?.();

    if (location.pathname === redirectUrl) {
      navigate(redirectUrl, { state: { refresh: Date.now() } });
    } else {
      navigate(redirectUrl);
    }
  };

  useEffect(() => {
    console.log("Notifications updated:", notifications);
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    const prev = [...notifications];
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );

    markAllAsRead(userId).catch(error => {
      console.error("Failed to mark all as read", error);
      setNotifications(prev);
    });
  };

  const handleSettingsClick = () => {
    navigate(Paths.NOTIFICATIONS(userId));
    onClose?.();
  };

  return (
    <ul className={styles.dropdown}>

      <li className={styles.header}>

        <span className={styles.headerTitle}>Notifications</span>

        <button className={styles.headerSettings} onClick={handleSettingsClick} >
          <Settings size={16} className={styles.icon} />
        </button>

      </li>

      {sortedNotifications.length > 0 ? (
        sortedNotifications.map(({ id, message, redirectUrl, isRead, thumbnail, createdAt }) => (
          <li
            key={id}
            onClick={() => handleClick(id, redirectUrl)}
            className={`${styles.item} ${!isRead ? styles.unread : ''}`}
          >
            {!isRead && <span className={styles.redBadge} />}

            <img src={API_URLS.IMAGE_FILE(thumbnail)} alt="" className={styles.avatar} />

            <div className={styles.content}>
              <span className={styles.message}>{message}</span>
              <span className={styles.date}>{timeAgo(createdAt)}</span>
            </div>
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
