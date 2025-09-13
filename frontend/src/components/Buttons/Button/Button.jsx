import React from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

export default function Button({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  iconOnly = false,
  className = "",
  iconProps = {},
  to,       // only for listItem variant
  width,    
}) {
  
  const variantClass =
    variant === "edit" ? styles.editButton :
    variant === "delete" ? styles.deleteButton :
    variant === "deposit" ? styles.depositButton :
    variant === "withdraw" ? styles.withdrawButton :
    variant === "search" ? styles.searchButton :
    variant === "cancel" ? styles.cancelBtn :
    variant === "cancelForm" ? styles.cancelFormBtn :
    variant === "sent" ? styles.sentBtn :
    variant === "arrived" ? styles.arrivedBtn :
    variant === "contact" ? styles.contactBtn :
    variant === "submit" ? styles.submitBtn :
    variant === "buyNow" ? styles.buyNowBtn :
    variant === "cart" ? styles.cartBtn :
    variant === "offer" ? styles.offerBtn :
    variant === "chat" ? styles.chatBtn :
    variant === "listItem" ? styles.listItemBtn :
    variant === "pay" ? styles.payBtn :
    variant === "addMore" ? styles.addMoreBtn :
    styles.defaultButton;

  const Component = variant === "listItem" && to ? Link : "button";

  return (
    <Component
      to={variant === "listItem" ? to : undefined}
      onClick={variant !== "listItem" ? onClick : undefined}
      className={`${styles.button} ${variantClass} ${className} ${iconOnly ? styles.iconOnly : ""}`}
      style={{ width }} 
    >
      {Icon && (
        <span className={iconOnly ? styles.iconWrapper : undefined}>
          <Icon {...iconProps} />
        </span>
      )}
      {label && (
        <span className={iconOnly ? styles.label : undefined}>
          {label}
        </span>
      )}
    </Component>
  );
}
