import React from "react";
import styles from "./ChatListItem.module.css";
import Avatar from "../Avatar";
import { formatTimestamp } from "@utils/Utils";

export function ChatListItem({ chat, isSelected, onClick }) {
    return (
        <li
            onClick={onClick}
            className={`${styles.chatItem} ${isSelected ? styles.chatItemSelected : ""}`}
        >
            <div className={styles.chatListItemWrapper}>

                <Avatar src={chat.avatarUrl} />

                <div className={styles.chatInfo}>
                    <div className={styles.chatName}>{chat.username}</div>
                    <div className={styles.lastMessage}>{chat.lastMessage}</div>
                </div>

                <div className={styles.lastUpdated}>
                    {chat.lastUpdated ? formatTimestamp(chat.lastUpdated) : ""}
                </div>

            </div>
        </li>
    );
}
