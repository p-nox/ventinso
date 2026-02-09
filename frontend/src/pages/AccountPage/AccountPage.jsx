import styles from "./AccountPage.module.css";
import { Routes, Route, Navigate } from "react-router-dom";
import SideMenu from "./components/SideMenu/SideMenu";
import AccountInfo from "./components/AccountInfo/AccountInfo";
import NotificationsSettings from "./components/NotificationsSettings/NotificationsSettings";
import MyWalletPage from "./components/MyWalletPage/MyWalletPage";
import OrdersHistory  from "./components/OrdersHistory/OrdersHistory";
import { useAuth } from "@context/AuthContext";

export default function AccountPage() {
  const { userId } = useAuth();

  const menuItems = [
    { label: "Account", path: `/account/${userId}/info` },
    { label: "Wallet", path: `/account/${userId}/wallet` },
    { label: "Addresses", path: `/account/${userId}/addresses` },
    { label: "Notifications", path: `/account/${userId}/notifications` },
    {
      label: "My Orders", path: `/account/${userId}/orders`,
      submenu: [
        { label: "Purchases", path: `/account/${userId}/orders/purchases` },
        { label: "Sales", path: `/account/${userId}/orders/sales` },
      ],
    },
  ];

  return (
    <div className={styles.wrapper}>
      <SideMenu items={menuItems} userId={userId} />

      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="info" replace />} />

        {/* Main account routes */}
        <Route path="info" element={<AccountInfo />} />
        <Route path="wallet" element={<MyWalletPage />} />
        <Route path="notifications" element={<NotificationsSettings userId={userId} />} />

        {/* My Orders submenu routes */}
        <Route
          path="orders"
          element={
            <OrdersHistory
              key="buyer-default"
              userId={userId}
              defaultType="buyer"
              title="Purchases"
            />
          }
        />

        <Route
          path="orders/purchases"
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
          path="orders/sales"
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
