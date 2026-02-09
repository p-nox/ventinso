import React from "react";
import styles from "./Layout.module.css";
import { Header, Footer, ScrollToTopButton } from '@components/Layout';
import { ChatUIProvider } from '@context/ChatUIProvider';
import { ChatPage } from '@pages';

export default function Layout({ children, openLogin  }) {
  return (
    <ChatUIProvider>
      <div className={styles.wrapper}>
        <main className={styles.mainContent}>
          <Header openLogin={openLogin} />
          {children}
        </main>
        <ScrollToTopButton />
      </div>
      <Footer />
      <ChatPage />
    </ChatUIProvider>
  );
}
