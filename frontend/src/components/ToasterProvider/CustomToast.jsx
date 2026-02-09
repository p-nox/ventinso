import React, {useEffect} from "react";
import { toast } from "react-hot-toast";
import styles from "./ToasterProvider.module.css";


const icons = {
  success: (
    <svg className={styles.iconSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 11.917 9.724 16.5 19 7.5"/>
    </svg>
  ),
  error: (
    <svg className={styles.iconSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M18 18 6 6"/>
    </svg>
  ),
  info: (
    <svg className={styles.iconSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
      <path stroke="white" strokeWidth="2" strokeLinecap="round" d="M12 8v4M12 16h0"/>
    </svg>
  ),
};

const bgColors = {
  success: "#34D399",
  error: "#F87171",
  info: "#60A5FA",
};

export default function CustomToast({ id, message, type = "success", duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.remove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration]);

  return (
    <div className={`${styles.toast} ${styles[type]}`} style={{ pointerEvents: "auto" }}>
      <div className={styles.iconWrapper} style={{ backgroundColor: bgColors[type] }}>
        {icons[type]}
      </div>
      <div className={styles.message}>{message}</div>
      <div className={styles.timerLine} style={{ animationDuration: `${duration}ms` }} />
    </div>
  );
}