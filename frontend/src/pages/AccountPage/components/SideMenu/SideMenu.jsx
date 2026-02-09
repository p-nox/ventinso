import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import styles from "./SideMenu.module.css";

export default function SideMenu({ items }) {
  const location = useLocation();
  const navigate = useNavigate();   
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (item) => {
    
    if (item.submenu) {
      // Toggle μόνο το state
      setOpenSubmenu(openSubmenu === item.label ? null : item.label);

      // Αν έχει defined path (πχ /orders), κάνε navigate στο default child
      if (item.path && item.submenu.length > 0) {
        navigate(item.submenu[0].path); // πάντα πάει στο πρώτο child
      }
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isSubmenuOpen = (item) => {
    if (openSubmenu === item.label) return true;
    if (item.submenu) {
      // Αν το pathname ξεκινάει με κάποιο path του submenu, κρατάει ανοιχτό
      return item.submenu.some((sub) => location.pathname.startsWith(sub.path));
    }
    return false;
  };


  return (
    <div className={styles.wrapper}>
      {items.map((item) => (
        <div key={item.label}>
          {item.submenu ? (
            <>
              <div
                className={styles.menuItem}
                onClick={() => toggleSubmenu(item)}
                style={{ cursor: "pointer" }}
              >
                {item.label}
              </div>

              {isSubmenuOpen(item) && (
                <div className={styles.submenu}>
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      end
                      className={({ isActive }) =>
                        `${styles.menuItem} ${styles.submenuItem} ${isActive ? styles.selected : ""
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          ) : (
            <NavLink
              to={item.path}
              end
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.selected : ""}`
              }
            >
              {item.label}
            </NavLink>
          )}
        </div>
      ))}
    </div>
  );
}
