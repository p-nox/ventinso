import React, { useState } from "react";
import styles from "./OfferModal.module.css";

function OfferModal({ price, onSubmit, onClose }) {
  const [value, setValue] = useState("");

  const calcPercent = () => {
    if (!value) return null;
    const offer = Number(value);
    if (offer >= price) return "0%";
    const percent = ((price - offer) / price) * 100;
    return `~${percent.toFixed(0)}% off`;
  };

  const handleSubmit = () => {
    const offer = Number(value);
    if (offer && onSubmit) onSubmit(offer);
  };

  return (
    <div className={styles.backdrop}>

      <div className={styles.modal}>

        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <h3 className={styles.title}>Make an Offer</h3>

        <p className={styles.price}>Price € {price.toFixed(2)}</p>

        <div className={styles.inputRow}>

          <input
            type="number"
            placeholder="e.g. 200"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={styles.input}
          />
          {value && <span className={styles.percent}>{calcPercent()}</span>}

        </div>

        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit Offer
        </button>

      </div>

    </div>
  );
}
export default OfferModal;
