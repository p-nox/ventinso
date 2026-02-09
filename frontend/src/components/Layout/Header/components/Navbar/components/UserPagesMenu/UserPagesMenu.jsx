import { User, Settings, Box, LogOut, Wallet, Heart } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Paths } from '@config/Config';
import styles from './UserPagesMenu.module.css';
import { useChatSocketContext } from "@context/ChatWebSocketContext";
import { useNotificationSseContext } from "@context/NotificationSseContext";


export default function UserPagesMenu({ onClose }) {
  const navigate = useNavigate();
  const { logout, userId } = useAuth();
  const { disconnect: disconnectChat } = useChatSocketContext();
  const { disconnect: disconnectSse } = useNotificationSseContext();
  

  const handleLogout = () => {
    disconnectChat?.();
    disconnectSse?.();
    logout();
    navigate(Paths.HOME);
    onClose?.();
  };

  const handleClickLink = (path) => {
    navigate(path);
    onClose?.();
  };


  return (
    <ul className={styles.dropdown}>

      <li>

        <button
          className={styles.dropdownLink}
          onClick={() => handleClickLink(Paths.PROFILE(userId))}
        >
          <User className={styles.icon} /> Profile
        </button>

      </li>

      <li>

        <button
          className={styles.dropdownLink}
          onClick={() => handleClickLink(Paths.ACCOUNT(userId))}
        >
          <Settings className={styles.icon} /> Account
        </button>

      </li>

      <li>

        <button
          className={styles.dropdownLink}
          onClick={() => handleClickLink(Paths.WALLET(userId))}
        >
           <Wallet className={styles.icon} />
            Wallet

        </button>

      </li>

      <li>

        <button
          className={styles.dropdownLink}
          onClick={() => handleClickLink(Paths.ORDERS.PURCHASES(userId))}
        >
          <Box className={styles.icon} /> My Orders
        </button>

      </li>

      <li>

        <button
          className={styles.dropdownLink}
          onClick={() => handleClickLink(Paths.FAVORITES(userId))}
        >
          <Heart className={styles.icon} /> Favorites
        </button>

      </li>

      <li>

        <button className={styles.dropdownLink} onClick={handleLogout}>
          <LogOut className={styles.icon} /> Log Out
        </button>

      </li>

    </ul>
  );
}
