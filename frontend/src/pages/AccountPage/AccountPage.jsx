import styles from "./AccountPage.module.css";
import { Routes, Route, Navigate } from "react-router-dom";
import SideMenu from "@components/Menus/SideMenu/SideMenu";
import AccountInfo from "@components/AccountInfo/AccountInfo";
import WalletPage from "@pages/WalletPage/WalletPage";
import { useAuth } from "@context/AuthContext";

export default function AccountPage() {
  const { userId } = useAuth();

  const menuItems = [
    { label: "Account", path: `/account/${userId}/info` },
    { label: "Wallet", path: `/account/${userId}/wallet` },
  ];

  return (
    <div className={styles.wrapper}>
      <SideMenu items={menuItems} userId={userId} />
      <Routes>
        <Route path="/" element={<Navigate to="info" replace />} />
        <Route path="info" element={<AccountInfo />} />
        <Route path="wallet" element={<WalletPage />} />
      </Routes>
    </div>
  );
}