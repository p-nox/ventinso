import styles from "./Header.module.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Login } from "@components/Auth";
import { useAuth } from "@context/AuthContext";
import { Paths } from "@config/Config";
import { Navbar, SearchBar } from "./components";

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
