import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";
import { Paths } from "@config/Config";
import { formatText } from '@utils/utils';

export default function Breadcrumbs({ category }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === Paths.HOME) return null;

  const handleCategoryClick = () => {
    if (category) {
      navigate({
        pathname: Paths.HOME,
        search: `?category=${encodeURIComponent(category)}`
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <nav className={styles.breadcrumb}>
        <Link className={styles.label} to={Paths.HOME}>Home</Link>
        {category && (
          <>
            <span className={styles.separator}>{">"}</span>
            <span
              className={`${styles.label} ${styles.last}`}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={handleCategoryClick}
            >
              {formatText(category)}
            </span>
          </>
        )}
      </nav>
    </div>
  );
}
