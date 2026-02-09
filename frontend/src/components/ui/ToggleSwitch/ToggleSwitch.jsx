import React from "react";
import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch({ label, value, onChange, onLabel = "On", offLabel = "Off", onIcon, offIcon, enableIcons = false }) {
  return (
    <div className={styles.wrapper}>

        {enableIcons && (

          <div className={styles.icons}>
            {value ? onIcon : offIcon}
          </div>

        )}

      <span className={styles.label}>{label}</span>

      <div className={styles.control}>

        <span className={styles.text}>{value ? onLabel : offLabel}</span>

        <label className={styles.switch}>

          <input type="checkbox" checked={value} onChange={onChange} />

          <span className={styles.slider}></span>

        </label>

      </div>
      
    </div>
  );
}
