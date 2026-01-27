import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      <li>
        <Link className={styles.dropdownLink} to={Paths.ACCOUNT(userId)}>
          Account
        </Link>
      </li>
      <li>
        <Link className={styles.dropdownLink} to={Paths.PROFILE(userId)}>
          My Profile
        </Link>
      </li>
      <li>
        <Link className={styles.dropdownLink} to={Paths.ORDERS_HISTORY}>
          My Orders
        </Link>
      </li>
      <li onClick={handleLogout}>
        Log Out
      </li>
    </ul>
  );
};
