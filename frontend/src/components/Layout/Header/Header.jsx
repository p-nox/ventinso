import styles from "./Header.module.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Paths } from "@config/Config";
import { Navbar, SearchBar } from "./components";
import Button from '@components/Buttons/Button/Button';

export default function Header({ openLogin }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    if (location.pathname === Paths.HOME) {
      e.preventDefault();
      window.location.reload();
    } else {
      navigate(Paths.HOME);
      window.location.reload();
    }
  };

  return (
    <header className={styles.header}>

      <div className={styles.headerContainer}>

        <div className={styles.leftGroup}>

          <div className={styles.logoWrapper}>

            <Link to={Paths.HOME} onClick={handleLogoClick}>
              <img alt="Logo" className={styles.logoImage} />
            </Link>
            
          </div>

          <SearchBar />

        </div>

        <div className={styles.rightGroup}>

          {!isLoggedIn ? (
            <button
              className={styles.loginButton}
              onClick={() => openLogin()}
            >
              Login / Sign up
            </button>
          ) : (<>
            <Button label="List an item" variant="listItem" to={Paths.ADD_ITEM()} />
             <Navbar  />
          </>
           
          )}

        </div>

      </div>

    </header>
  );
}
