import React from "react";
import styles from "./Layout.module.css";
import { Register } from "@components/Auth";
import { Header, Footer, Breadcrumbs, ScrollToTopButton } from '@components/Layout';
import { ChatUIProvider } from '@context/ChatUIProvider';
import { ChatPage } from '@pages';

export default function Layout({ children, showRegister, closeRegister, setShowSearch, openRegister }) {
  return (
    <>
      <ChatUIProvider>
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
        <ChatPage />
      </ChatUIProvider>
    </>
  );
}
