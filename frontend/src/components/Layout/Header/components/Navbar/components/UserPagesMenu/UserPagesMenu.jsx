import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserPagesMenu.module.css';
import { useAuth } from '@context/AuthContext';
import { Paths } from '@config/Config';

export default function UserPagesMenu() {
  const navigator = useNavigate();
  const { logout, userId } = useAuth();

  const handleLogout = () => {
    logout();
    navigator(Paths.HOME);
  };

  return (
    <ul className={styles.dropdown}>
      <li onClick={() => navigator(Paths.ACCOUNT(userId))}>
        Account
      </li>
      <li onClick={() => navigator(Paths.PROFILE(userId))}>
        My Profile
      </li>
      <li onClick={() => navigator(Paths.ORDERS_HISTORY)}>
        My Orders
      </li>
      <li onClick={handleLogout}>
        Log Out
      </li>
    </ul>
  );
};
