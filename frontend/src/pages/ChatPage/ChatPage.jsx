import React, { useMemo, useRef, useState } from "react";
import styles from "./ChatPage.module.css";
import { ChatSidebar, ChatHeader, ChatSubHeader, MessagesList, ChatInput } from "./components";
import { useChatUI } from "@context/ChatUIProvider";
import { useChatSocketContext } from "@context/ChatWebSocketContext";

export default function ChatPage() {
  const {
    userId,
    username,
    isOpen,
    isMinimized,
    isFullView,
    chats,
    selectedChat,
    setSelectedChat,
    messagesByChat,
    handleClose,
    handleMinimize,
    handleRestore,
    handleFullView,
  } = useChatUI();

  const { messages: socketMessages, sendMessage } = useChatSocketContext();
  const activeChat = selectedChat;

  const allMessages = useMemo(() => {
    if (!activeChat) return [];
    const history = messagesByChat[activeChat.chatId] || [];
    const live = socketMessages.filter((m) => m.chatId === activeChat.chatId);
    return [...history, ...live];
  }, [messagesByChat, socketMessages, activeChat]);


  const modalRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setStartY(e.clientY);
    if (modalRef.current) {
      setStartHeight(modalRef.current.offsetHeight);
    }
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !modalRef.current) return;
    const dy = e.clientY - startY;
    const newHeight = startHeight - dy;
    const minHeight = 200;
    const maxHeight = window.innerHeight - 40;
    modalRef.current.style.height = `${Math.min(Math.max(newHeight, minHeight), maxHeight)}px`;
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <>
      {isOpen && isMinimized && !isFullView && (
        <div
          onClick={handleRestore}
          className={styles.minimizedBar}
        >
          <span>Chat</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className={styles.minimizedBarButton}
          >
            ✕
          </button>
        </div>
      )}

      {isOpen && (isFullView || !isMinimized) && (
        <div
          ref={modalRef}
          className={isFullView ? "" : styles.modalWrapper}
        >
          {/* Top resize handle */}
          {!isFullView && (
            <div
              className={styles.topResizeHandle}
              onMouseDown={handleMouseDown}
            />
          )}

          <ChatSidebar
            chats={chats}
            selectedChat={activeChat}
            onSelectChat={setSelectedChat}
          />

          <div
            className={isFullView ? "" : styles.chatWindow}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <ChatHeader
              chat={activeChat}
              onClose={handleClose}
              onMinimize={handleMinimize}
              onSettings={() => { }}
              onFullView={handleFullView}
            />
            <ChatSubHeader chat={activeChat} />
            <MessagesList
              key={activeChat?.chatId || "temp"}
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
      )}
    </>
  );
}
