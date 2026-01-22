import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";
import { getUser } from "@services/UserService";
import { getItem } from "@services/InventoryService";
import { Paths } from "@config/Config";
import { formatText } from '@utils/Utils';

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [label, setLabel] = useState("");
  const [isCategory, setIsCategory] = useState(false);

  useEffect(() => {
    async function fetchLabel() {
      const path = location.pathname;
      setIsCategory(false);

      try {
        if (path.startsWith("/user/")) {

          const userId = path.split("/")[2];
          const user = await getUser(userId);
          setLabel(user.username);

        } else if (path.startsWith("/item/")) {

          const itemId = path.split("/")[2];
          const item = await getItem(itemId);
          setLabel(formatText(item.category));
          setIsCategory(true); 

        } else if (path.startsWith("/account/")) {

          const parts = path.split("/");
          const subPath = parts[3];
          let labelText = "Account";

          if (subPath === "wallet") labelText = "Wallet";
          else if (subPath === "info") labelText = "Account";

          setLabel(labelText);

        } else if (path.startsWith("/orders-history")) {

          const parts = path.split("/");
          const section = parts[3];
          if (section === "purchases") setLabel("Purchases");
          else if (section === "sales") setLabel("Sales");
          else setLabel("My Orders");
          
        }
        // Static paths
        else if (path === Paths.WALLET) setLabel("Wallet");
        else if (path === Paths.ADD_ITEM) setLabel("Add Item");
        else setLabel("");
      } catch (err) {
        console.error(err);
        setLabel("");
      }
    }

    fetchLabel();
  }, [location.pathname]);

  if (location.pathname === Paths.HOME) return null;

  const handleCategoryClick = () => {
    if (isCategory) {
      navigate({
        pathname: Paths.HOME,
        search: `?category=${encodeURIComponent(label.toUpperCase())}`
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <nav className={styles.breadcrumb}>
        <Link className={styles.label} to={Paths.HOME}>Home</Link>
        {label && (
          <>
            <span className={styles.separator}>{">"}</span>
            <span
              className={`${styles.label} ${styles.last}`}
              style={isCategory ? { cursor: 'pointer', textDecoration: 'underline' } : {}}
              onClick={handleCategoryClick}
            >
              {label}
            </span>
          </>
        )}
      </nav>
    </div>
  );
}
