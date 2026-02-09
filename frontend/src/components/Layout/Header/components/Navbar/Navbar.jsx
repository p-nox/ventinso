import React, { useContext, useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { NotificationsMenu, UserPagesMenu } from './components';
import { useNavbar } from '@hooks/useNavbar';
import { useAuth } from '@context/AuthContext';
import { API_URLS } from '@config/Config';
import { NotificationSseContext } from '@context/NotificationSseContext';
import { useChatUI } from "@context/ChatUIProvider";
import { Mail, Bell } from 'lucide-react';
import { getBalance } from '@services/UserService';

export default function Navbar() {
  const {
    username,
    isAccountMenuOpen,
    isNotificationMenuOpen,
    accountMenuRef,
    notificationMenuRef,
    toggleAccountMenu,
    toggleNotificationMenu,
    setNotifications
  } = useNavbar();

  const { userId, userAvatar } = useAuth();
  const { notifications } = useContext(NotificationSseContext);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const { isOpen, setIsOpen } = useChatUI();

  const [balance, setBalance] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(
    userAvatar
      ? userAvatar.startsWith("http")
        ? userAvatar
        : `${API_URLS.AVATAR_FILE(userAvatar)}`
      : "/placeholder.png"
  );

  useEffect(() => {
    if (!userAvatar) return;

    setAvatarUrl(
      userAvatar.startsWith("http")
        ? userAvatar
        : `${API_URLS.AVATAR_FILE(userAvatar)}`
    );
  }, [userAvatar]);


  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const handleToggleAccountMenu = async () => {
    const willOpen = !isAccountMenuOpen;
    toggleAccountMenu(willOpen);

    if (willOpen && userId) {
      try {
        const data = await getBalance(userId);
        setBalance(data.balance);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance(0);
      }
    }
  };

  return (
    <ul className={styles.navList}>
      <li>
        <div ref={accountMenuRef} className={styles.accountMenuWrapper}>
          {userAvatar && (
            <img
              src={avatarUrl}
              alt={`${username}'s avatar`}
              className={styles.userAvatar}
              onClick={handleToggleAccountMenu}
            />
          )}

          {isAccountMenuOpen && (
            <UserPagesMenu
              onClose={() => toggleAccountMenu(false)}
              balance={balance}
            />
          )}
        </div>
      </li>

      <li>
        <div onClick={toggleChat} className={styles.iconWrapper}>
          <Mail className={styles.icon} />
        </div>
      </li>

      <li>
        <div ref={notificationMenuRef} className={styles.notificationWrapper}>
          <div onClick={toggleNotificationMenu} className={styles.iconWrapper}>
            <Bell className={styles.icon} />
           {unreadCount > 0 && (
  <span className={styles.unreadDot}>
    {unreadCount > 99 ? '99' : unreadCount}
  </span>
)}

          </div>

          {isNotificationMenuOpen && (
            <NotificationsMenu
              notifications={notifications}
              setNotifications={setNotifications}
              onClose={() => toggleNotificationMenu(false)}
            />
          )}
        </div>
      </li>

    </ul>
  );
}
