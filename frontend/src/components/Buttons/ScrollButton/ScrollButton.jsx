import React from "react";
import styles from "./ScrollButton.module.css";
import ArrowIcon from "@assets/Icons/ArrowIcon";

export default function ScrollButton({ direction, onClick, show }) {
  if (!show) return null;

  return (
    <button
      className={`${styles.arrowButton} ${direction === "left" ? styles.left : styles.right}`}
      onClick={onClick}
    >
      <ArrowIcon direction={direction} size={40} color="black" />
    </button>
  );
}
