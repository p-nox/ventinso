import React from "react";
import styles from "./ChatSubHeader.module.css";
import { API_BASE_URL, Paths } from "@config/Config";
import { Link } from "react-router-dom";


export function ChatSubHeader({ chat }) {
  return (
    <div className={styles.container}>
      <Link to={Paths.ITEM(chat.itemId)}>
        <img
          src={`${API_BASE_URL}${chat.thumbnailUrl}`}
          alt={chat.title}
          className={styles.thumbnail}
        />
      </Link>
      <div className={styles.titleWrapper}>
        <Link to={Paths.ITEM(chat.itemId)} className={styles.title}>
          {chat.title}
        </Link>
        <div className={styles.price}>{chat.price} €</div>
      </div>
    </div>
  );
}
