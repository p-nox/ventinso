import React from "react";
import styles from "./Layout.module.css";
import Header from "@components/Header/Header";
import Breadcrumbs from "@components/Breadcrumbs/Breadcrumbs";
import Register from "@components/Register/Register";
import Footer from "@components/Footer/Footer";
import ScrollToTopButton from "@components/Buttons/ScrollToTopButton/ScrollToTopButton";

export default function Layout({ children, showRegister, closeRegister, setShowSearch, openRegister }) {
  return (
    <>
      <div className={styles.wrapper}>
        <Header setShowSearch={setShowSearch} openRegister={openRegister} />
        <Breadcrumbs />
        {showRegister && <Register onClose={closeRegister} />}
        <main className={styles.mainContent}>
          {children}
        </main>
        <ScrollToTopButton />
      </div>
      <Footer />
    </>
  );
}
