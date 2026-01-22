import React from "react";
import { ToggleTheme } from '@components/ui';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footerContainer}>
        <span>© 2025 MyApp. All rights reserved.</span>
        <div className={styles.links}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <ToggleTheme />
        </div>
      </div>
    </footer>
  );
}
