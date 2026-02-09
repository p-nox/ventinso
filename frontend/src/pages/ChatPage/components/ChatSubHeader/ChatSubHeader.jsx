import React from "react";
import styles from "./ChatSubHeader.module.css";
import { API_URLS, Paths } from "@config/Config";
import { Link } from "react-router-dom";


export function ChatSubHeader({ chat }) {

  if (!chat) return null;
 
  return (
    <div className={styles.container}>

      <Link to={Paths.ITEM(chat.itemId)} state={{ ownerId: chat.itemOwnerId }}>
        <img
          src={API_URLS.IMAGE_FILE(chat.thumbnailUrl)}
          alt={chat.title}
          className={styles.thumbnail}
        />
      </Link>

      <div className={styles.titleWrapper}>

        <Link to={Paths.ITEM(chat.itemId)} state={{ ownerId: chat.itemOwnerId }} className={styles.title}>
          {chat.title}
        </Link>

        <div className={styles.price}>{chat.price} €</div>

      </div>
      
    </div>
  );
}
