import { NavLink } from "react-router-dom";
import styles from "./SideMenu.module.css";

export default function SideMenu({ items }) {
  return (
    <div className={styles.wrapper}>
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          relative="path"
          end
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.selected : ""}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
