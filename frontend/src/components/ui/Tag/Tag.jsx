import React from "react";
import styles from "./Tag.module.css";
import { formatText } from '@utils/utils';

export default function ConditionTag({
  value,
  fontSize = "0.75rem",
  margin = "0px 0px 0px 0px",
  type = "tag", 
  className = "",  
}) {
  if (!value) return null;

  const style = { fontSize, margin };
  const tagStyle = type === "badge" ? getBadgeStyle(value) : getTagStyle(value);


  const combinedClassName = `${styles.tag} ${tagStyle} ${className}`.trim();

  return (
    <span className={combinedClassName} style={style}>
      {formatText(value)}
    </span>
  );
}

function getTagStyle(value) {
  switch (value) {
    case "NEW": return styles.new;
    case "LIKE_NEW": return styles.likeNew;
    case "USED": return styles.used;

    case "PENDING_VALIDATION": return styles.orderTagPendingValidation;
    case "PENDING_DELIVERY": return styles.orderTagPendingDelivery;
    case "PENDING_ARRIVAL": return styles.orderTagPendingArrival;
    case "CONFIRMED": return styles.orderTagConfirmed;
    case "COMPLETED": return styles.orderTagCompleted;
    case "CANCELLED": return styles.orderTagCancelled;

    case "BUY": return styles.buy;
    case "SELL": return styles.sell;
    case "AUCTION": return styles.auction;

    case "Flexible Price": return styles.flexiblePrice;

    default: return "";
  }
}

function getBadgeStyle(value) {
  switch (value) {
    case "COMPLETED": return styles.statusCompleted;
    case "CANCELLED": return styles.statusCancelled;
    case "PENDING": return styles.statusPending;
    default: return "";
  }
}
