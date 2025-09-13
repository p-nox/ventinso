import React, { useContext } from 'react';
import styles from './Navbar.module.css';
import MailIcon from '@assets/Icons/MailIcon';
import NotificationIcon from '@assets/Icons/NotificationIcon';
import UserIcon from '@assets/Icons/UserIcon';
import UserMenu from '@components/Menus/UserMenu/UserMenu';
import NotificationsMenu from '@components/Menus/NotificationsMenu/NotificationsMenu';
import { useNavbar } from '@hooks/useNavbar';
import { useAuth } from '@context/AuthContext';
import { Link } from 'react-router-dom';
import { Paths } from '@config/Config';
import { NotificationContext } from '@context/NotificationContext';

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

  const { userId } = useAuth();
  const { notifications } = useContext(NotificationContext);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <ul className={styles.navList}>
      <li>
        <div ref={accountMenuRef} className={styles.accountMenuWrapper}>
          <Link to={Paths.PROFILE(userId)} className={styles.usernameText} style={{ textDecoration: "none" }}>
            {username || "Guest"}
          </Link>
          <div onClick={toggleAccountMenu} className={styles.iconWrapper}>
            <UserIcon width={30} height={30} fill="rgba(187, 202, 214, 1)" />
          </div>
          {isAccountMenuOpen && <UserMenu />}
        </div>
      </li>

      <li>
        <div className={styles.iconWrapper}>
          <MailIcon width={25} height={25} fill="rgba(187, 202, 214, 1)" />
        </div>
      </li>

      <li>
        <div ref={notificationMenuRef} className={styles.notificationWrapper}>
          <div onClick={toggleNotificationMenu} className={styles.iconWrapper}>
            <NotificationIcon width={25} height={25} fill="rgba(187, 202, 214, 1)" />
            {unreadCount > 0 && <span className={styles.unreadDot} />}
          </div>
          {isNotificationMenuOpen && (
            <NotificationsMenu
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}
        </div>
      </li>
    </ul>
  );
}
