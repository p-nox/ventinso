import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import { API_URLS } from "@config/Config";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "@context/AuthContext";

const ChatWebSocketContext = createContext(null);

export function ChatWebSocketProvider({ children }) {
  const { userId, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newChats, setNewChats] = useState([]);
  const [chats, setChats] = useState([]);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });


  useEffect(() => {
    if (!userId) {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (stompClientRef.current) stompClientRef.current.deactivate();
      setMessages([]);
      return;
    }

    const socket = new SockJS(API_URLS.CHAT_SOCKET);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      maxWebSocketFrameSize: 26 * 1024 * 1024,
      onConnect: () => {

        // Existing messages subscription
        const msgSub = stompClient.subscribe(
          `/topic/messages/${userId}`,
          (msg) => {
            try {
              const data = JSON.parse(msg.body);
              if (data.messageResponse) {
                console.log("received message:", data.messageResponse);
                setMessages(prev => [...prev, data]);
              }
            } catch (err) {
              console.error(err, msg.body);
            }
          }
        );

        // New chats subscription
        const chatSub = stompClient.subscribe(`/topic/new-chat/${userId}`, (msg) => {
          try {
            const data = JSON.parse(msg.body);

            const sidebarChat = {
              chatId: data.chatSummaryResponse.chatId,
              senderId: data.chatSummaryResponse.senderId,
              username: data.senderUsername,
              senderAvatar: data.senderAvatarUrl,
              receiverId: data.chatSummaryResponse.receiverId,
              lastMessage: data.chatSummaryResponse.lastMessage,
              lastUpdated: data.chatSummaryResponse.lastUpdated,
              itemId: data.chatSummaryResponse.itemId,
            };

           
            setNewChats(prev => {
              const exists = prev.some(c => c.chatId === sidebarChat.chatId);
              if (exists) return prev;
              return [sidebarChat, ...prev];
            });

          } catch (err) {
            console.error("[ChatContext] WebSocket parse error:", err, msg.body);
          }
        });
        subscriptionRef.current = [msgSub, chatSub];
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    const handleUnload = () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      subscriptionRef.current?.forEach(s => s.unsubscribe());
      stompClientRef.current?.deactivate();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [userId, token]);

  const sendMessage = async ({ content, receiverId, itemId, files, chatId, type }) => {
    const chunkSize = 60 * 1024; // 60 KB

    if (!userId) return;

   
    const messageBase = {
      senderId: Number(userId),
      receiverId: Number(receiverId),
      itemId: Number(itemId),
      content: content?.trim() || "",
    };

    console.log("content to send:", content);
    // send text message if exists
    if (content?.trim()) {
      stompClientRef.current.publish({
        destination: "/app/messages",
        body: JSON.stringify({
          message: { ...messageBase, messageType: type },
          chunks: [],
          fileExtension: null,
          totalChunks: null,
          chunkIndex: null,
          chatId
        }),
      });
      console.log("Sent TEXT message:", { ...messageBase, messageType: type });
    }

    // send files to chunks if exists
    if (files?.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const base64 = await fileToBase64(files[i]);
        const extension = files[i].name.split(".").pop();
        const totalChunks = Math.ceil(base64.length / chunkSize);

        for (let c = 0; c < totalChunks; c++) {
          const start = c * chunkSize;
          const end = Math.min(base64.length, (c + 1) * chunkSize);
          const chunkData = base64.slice(start, end);

          const payload = {
            message: { ...messageBase, content: "", messageType: "MEDIA" },
            chunks: [{
              fileName: `file_${i}`,
              extension,
              chunkIndex: c,
              totalChunks,
              dataBase64: chunkData
            }],
            fileExtension: extension,
            totalChunks,
            totalFiles: files.length,
            chatId
          };
          stompClientRef.current.publish({
            destination: "/app/messages",
            body: JSON.stringify(payload)
          });
        }
      }
    }
  };


  return (
    <ChatWebSocketContext.Provider
      value={{ messages, sendMessage, chats, setChats, newChats, setNewChats }}>
      {children}
    </ChatWebSocketContext.Provider>

  );
}

export function useChatSocketContext() {
  const context = useContext(ChatWebSocketContext);
  if (!context) throw new Error("useChatContext must be used within ChatProvider");
  return context;
}
