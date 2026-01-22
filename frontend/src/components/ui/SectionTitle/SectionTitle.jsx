import React from "react";
import styles from "./SectionTitle.module.css";

export default function SectionTitle({ text, onClick }) {
  return (
    <h2
      className={styles.labelWithLine}
      onClick={onClick}
      style={{ cursor: 'pointer' }} 
    >
      {text}
    </h2>
  );
}
