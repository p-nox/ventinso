import React, { useContext } from 'react';
import styles from './Navbar.module.css';
import { MailIcon, NotificationIcon, UserIcon} from '@assets/icons';
import { NotificationsMenu, UserPagesMenu } from './components';
import { useNavbar } from '@hooks/useNavbar';
import { useAuth } from '@context/AuthContext';
import { Link } from 'react-router-dom';
import { Paths } from '@config/Config';
import { NotificationSseContext } from '@context/NotificationSseContext';
import { useChatUI } from "@context/ChatUIProvider";


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
  const { notifications } = useContext(NotificationSseContext);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const { isOpen, setIsOpen } = useChatUI(); 

  const toggleChat = () => {
    setIsOpen(prev => !prev); 
  };

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
          {isAccountMenuOpen && <UserPagesMenu />}
        </div>
      </li>

      <li>
        <div onClick={toggleChat} className={styles.iconWrapper}>
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
