import React from "react";
import styles from "./ActiveFilters.module.css";
import { DeleteIcon } from "@assets/icons";

export default function ActiveFilters({ filters, onRemove, onClear }) {
  const activeFilters = Object.entries(filters)
    .filter(
      ([key, value]) =>
        value !== null &&
        value !== "" &&
        key !== "minPrice" &&
        key !== "maxPrice"
    );

  const min = filters.minPrice != null && filters.minPrice !== '' ? filters.minPrice : null;
  const max = filters.maxPrice != null && filters.maxPrice !== '' ? filters.maxPrice : null;

  if (min !== null || max !== null) {
    let label = "";
    if (min !== null && max !== null) {
      label = `${min} - ${max}`;
    } else if (min !== null) {
      label = `≥ ${min}`;
    } else if (max !== null) {
      label = `≤ ${max}`;
    }
    activeFilters.push(["priceRange", label]);
  }

  const handleRemove = (key) => {
    if (key === "priceRange") {
      onRemove(["minPrice", "maxPrice"]); 
    } else {
      onRemove([key]);
    }
  };

  return (
    <div
      className={`${styles.wrapper} ${activeFilters.length === 0 ? styles.empty : ""
        }`}
    >
      {activeFilters.length > 0 && (
        <div className={styles.filtersRow}>
          {activeFilters.map(([key, value]) => (
            <div key={key} className={styles.filterBadge}>
              <span className={styles.filterValue}>{value.toString()}</span>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(key)}
              >
                <DeleteIcon
                  width={16}
                  height={16}
                  color="#c7c7c7ff"
                  strokeWidth={2}
                />
              </button>
            </div>
          ))}
          {onClear && (
            <span className={styles.clearSpan} onClick={onClear}>
              clear filters
            </span>
          )}
        </div>
      )}
    </div>
  );
}
