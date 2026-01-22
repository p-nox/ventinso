import React, { createContext, useContext } from "react";
import { useChat } from "@hooks/useChat";

const ChatUIContext = createContext(null);

export function ChatUIProvider({ children }) {
  const chat = useChat();
  return (
    <ChatUIContext.Provider value={chat}>
      {children}
    </ChatUIContext.Provider>
  );
}

export function useChatUI() {
  const context = useContext(ChatUIContext);
  if (!context) {
    throw new Error("useChatUI must be used within ChatUIProvider");
  }
  return context;
}
