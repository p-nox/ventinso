import React, { useMemo } from "react";
import styles from "./ChatFullView.module.css";
import { ChatSidebar, ChatHeader, ChatSubHeader, MessagesList, ChatInput } from "../components";
import { useChatUI } from "@context/ChatUIProvider";
import { useChatSocketContext } from "@context/ChatWebSocketContext";

export default function ChatFullView() {
  const { userId, username, chats, selectedChat, setSelectedChat, messagesByChat } = useChatUI();
  const { messages: socketMessages, sendMessage } = useChatSocketContext();

  const activeChat = selectedChat;

  const allMessages = useMemo(() => {
    if (!activeChat) return [];
    const history = messagesByChat[activeChat.chatId] || [];
    const live = socketMessages.filter((m) => m.chatId === activeChat.chatId);
    return [...history, ...live];
  }, [messagesByChat, socketMessages, activeChat]);

 

  return (
    <div className={styles.fullPageChat}>
      <ChatSidebar
        chats={chats}
        selectedChat={activeChat}
        onSelectChat={setSelectedChat}
      />

      <div className={styles.chatArea}>
        <ChatHeader
          chat={activeChat}
          onClose={() => {}}
          onMinimize={() => {}}
          onSettings={() => {}}
          onFullView={() => {}}
        />
        <ChatSubHeader chat={activeChat} />
        <MessagesList
          key={activeChat?.chatId}
          messages={allMessages}
          chatId={activeChat?.chatId}
          price={activeChat?.price}
        />
        <ChatInput
          selectedChat={activeChat}
          userId={userId}
          username={username}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
