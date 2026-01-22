import { useState, useEffect, useRef, useContext } from 'react';
import { NotificationSseContext } from '@context/NotificationSseContext';

export function useNavbar(setShowSearch) {
  const [username, setUsername] = useState(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);

  const { notifications, setNotifications } = useContext(NotificationSseContext);

  const accountMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  useEffect(() => {
    setUsername(localStorage.getItem('authenticatedUser'));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearch = () => setShowSearch(prev => !prev);
  
  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(prev => !prev);
    setIsNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(prev => !prev);
    setIsAccountMenuOpen(false);
  };

  return {
    username,
    notifications,
    setNotifications,
    isAccountMenuOpen,
    isNotificationMenuOpen,
    accountMenuRef,
    notificationMenuRef,
    toggleSearch,
    toggleAccountMenu,
    toggleNotificationMenu
  };
}
