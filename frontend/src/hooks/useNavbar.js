import { useState, useEffect, useRef, useContext } from 'react';
import { NotificationSseContext } from '@context/NotificationSseContext';

export function useNavbar(setShowSearch) {
  const [username, setUsername] = useState(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const { notifications, setNotifications } = useContext(NotificationSseContext);
  const accountMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);


  const toggleSearch = () => setShowSearch(prev => !prev); // is used?

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

  
  const toggleAccountMenu = (open) => {
    if (typeof open === "boolean") {
      setIsAccountMenuOpen(open);
    } else {
      setIsAccountMenuOpen(prev => !prev);
    }
    setIsNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = (open) => {
    if (typeof open === "boolean") {
      setIsNotificationMenuOpen(open);
    } else {
      setIsNotificationMenuOpen(prev => !prev);
    }
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
