import styles from "./Header.module.css";
import Login from "@components/Login/Login";
import Navbar from "@components/Navbar/Navbar";
import { useAuth } from "@context/AuthContext";
import { Paths } from "@config/Config";
import SearchBar from "@components/SearchBar/SearchBar";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function Header({ setShowSearch, openRegister }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    if (location.pathname === Paths.HOME) {
      e.preventDefault();
      window.location.reload();
    } else {
      navigate(Paths.HOME);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logoWrapper}>
          <Link to={Paths.HOME} onClick={handleLogoClick}>
            <img alt="Logo" className={styles.logoImage} />
          </Link>
        </div>
        <SearchBar />
        {isLoggedIn ? (
          <Navbar setShowSearch={setShowSearch} />
        ) : (
          <Login openRegister={openRegister} />
        )}
      </div>
    </header>
  );
}
