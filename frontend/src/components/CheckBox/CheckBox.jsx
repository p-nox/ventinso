import React from 'react';
import styles from './CheckBox.module.css';

export default function CheckBox({ isChecked, setIsChecked, name, displayText }) {
    return (
        <label className={styles.checkbox}>
            <input
                type="checkbox"
                name={name}
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
            />
            {displayText}
        </label>
    );
}
