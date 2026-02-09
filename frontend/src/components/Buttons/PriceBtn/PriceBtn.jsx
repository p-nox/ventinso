import React from 'react';
import { Euro } from 'lucide-react';
import styles from './PriceBtn.module.css';

const VARIANTS = {
  withPadding: {
    width: '38%',
    borderRadius: '20px',
    iconSize: 12,
  },
};

export default function PriceBtn({
  value,
  onChange,
  placeholder = 'Enter price',
  variant = 'default'
}) {

  const config = VARIANTS[variant] || VARIANTS.default;

  const inputClass = variant === 'withPadding'
    ? `${styles.priceInput} ${styles.withPadding}`
    : styles.priceInput;

  return (
    <div
      className={styles.inputGroup}
      style={{
        width: config.width,
        borderRadius: config.borderRadius,
        padding: config.padding,
      }}
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={inputClass}
        style={{
          fontSize: config.fontSize,
        }}
      />
      <div className={styles.iconContainer}>
        <Euro className={styles.euroIcon} />
      </div>

    </div>
  );
}
