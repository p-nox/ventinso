import React from "react";
import styles from "./ChatSidebar.module.css";
import { ChatListItem } from "../ChatListItem/ChatListItem";
import { useChatUI  } from "@context/ChatUIProvider";

export function ChatSidebar() {
    const { chats, selectedChat, setSelectedChat } = useChatUI ();
    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>Chats</div>
            <ul className={styles.chatList}>
                {chats.map((chat) => (
                    <ChatListItem
                        key={chat.chatId}
                        chat={chat}
                        isSelected={chat.chatId === selectedChat?.chatId}
                        onClick={() => setSelectedChat(chat)}
                    />
                ))}
            </ul>
        </div>
    );
}