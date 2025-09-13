import styles from "./MyOrdersPage.module.css";
import SideMenu from "@components/Menus/SideMenu/SideMenu";
import OrdersHistory from "@components/OrdersHistory/OrdersHistory";
import { useAuth } from "@context/AuthContext";
import { Routes, Route } from "react-router-dom";

export default function MyOrdersPage() {
  const { userId } = useAuth();

  const menuItems = [
    { label: "My Orders", path: `/orders-history` },
    { label: "Purchases", path: `/orders-history/${userId}/purchases` },
    { label: "Sales", path: `/orders-history/${userId}/sales` },
  ];

  return (
    <div className={styles.wrapper}>
      <SideMenu items={menuItems} userId={userId} />
      <Routes>
        <Route
          index
          element={
            <OrdersHistory
              key="all"
              userId={userId}
              defaultType="buyer"
              title="My Orders"
            />
          }
        />
        <Route
          path=":userId/purchases"
          element={
            <OrdersHistory
              key="buyer"
              userId={userId}
              defaultType="buyer"
              title="Purchases"
            />
          }
        />
        <Route
          path=":userId/sales"
          element={
            <OrdersHistory
              key="seller"
              userId={userId}
              defaultType="seller"
              title="Sales"
            />
          }
        />
      </Routes>
    </div>
  );
}
