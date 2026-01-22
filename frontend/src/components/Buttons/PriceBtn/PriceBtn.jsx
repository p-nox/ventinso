import React from 'react';
import { EuroIcon } from '@assets/icons';
import styles from './PriceBtn.module.css';

const VARIANTS = {
  default: {
    borderRadius: 'var(--border-radius)',
    padding: '8px 12px',
    fontSize: '1rem',
    iconSize: 20,
  },
  withPadding: {
    width: '50%',
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
        <EuroIcon width={config.iconSize} height={config.iconSize} fill="var(--text-color)" />
      </div>
    </div>
  );
}
