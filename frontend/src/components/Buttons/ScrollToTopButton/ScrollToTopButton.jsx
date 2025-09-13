import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./ScrollToTopButton.module.css";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!visible) return null;

  return (
    <button className={styles.scrollButton} onClick={scrollToTop}>
      <ArrowUp size={20} />
    </button>
  );
}
