import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getUserChats, getChatMessages, initChat } from "@services/ChatService";
import { useAuth } from "@context/AuthContext";
import { useChatSocketContext } from "@context/ChatWebSocketContext";

export function useChat() {
    const { userId, username } = useAuth();
    const location = useLocation();
    const { messages: wsMessages, sendMessage } = useChatSocketContext();

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullView, setIsFullView] = useState(false);
    const { chats, setChats, newChats, setNewChats } = useChatSocketContext();
    const [selectedChat, setSelectedChat] = useState(null);
    const [messagesByChat, setMessagesByChat] = useState({});
    const [tempChat, setTempChat] = useState(null);
    const [hasOpenedNavChat, setHasOpenedNavChat] = useState(false);


    useEffect(() => {
        console.log("Chats updated:", chats);
    }, [chats]);


    // load user chats
    useEffect(() => {
        if (!userId) return;

        getUserChats(userId)
            .then(data => {
                setChats(data);

                // Open or create chat from navigation state if not already opened
                if (location.state?.chat && !hasOpenedNavChat) {
                    const navChat = location.state.chat;
                    const chat = openOrCreateChat(
                        {
                            receiverId: navChat.receiverId,
                            receiverUsername: navChat.receiverUsername,
                            receiverAvatar: navChat.receiverAvatar,
                            itemId: navChat.itemId,
                            thumbnailUrl: navChat.itemThumbnail,
                            title: navChat.itemTitle
                        },
                        data
                    );

                    setSelectedChat(chat);
                    setIsOpen(true);
                    setHasOpenedNavChat(true);
                } else if (!selectedChat && data.length > 0) {
                    setSelectedChat(data[0]);
                }
            })
            .catch(err => console.error("[useChat] Error loading chats:", err));
    }, [userId, tempChat]);

    // load messages for selected chat
    useEffect(() => {
        if (!selectedChat?.chatId || selectedChat?.isTemp) return;

        getChatMessages(selectedChat.chatId, userId)
            .then(messages => {
                setMessagesByChat(prev => ({
                    ...prev,
                    [selectedChat.chatId]: messages
                }));
            })
            .catch(err => console.error("[useChat:getChatMessages] Error:", err));
    }, [userId, selectedChat]);


    // --- Handle incoming WebSocket messages ---
    useEffect(() => {
        if (!userId || !wsMessages) return;
        wsMessages.forEach(wsMsg => {
            const { chatId, messageResponse } = wsMsg;

            if (!chatId || !messageResponse) return;

            // --- Add to messagesByChat ---
            setMessagesByChat(prev => {
                const currentMessages = prev[chatId] || [];
                const exists = currentMessages.some(m => m.id === messageResponse.id);

                return {
                    ...prev,
                    [chatId]: exists ? currentMessages : [...currentMessages, messageResponse]
                };
            });


            // --- Update sidebar ---
            setChats(prevChats => {
                const chatExists = prevChats.some(c => c.chatId === chatId);
                let updatedChats;
                if (chatExists) {
                    updatedChats = prevChats.map(c =>
                        c.chatId === chatId
                            ? { ...c, lastMessage: messageResponse.previewContent, lastUpdated: messageResponse.timestamp }
                            : c
                    );
                } else {
                    updatedChats = [{ chatId, lastMessage: messageResponse.content, lastUpdated: messageResponse.timestamp, ...messageResponse.senderSnapshot }, ...prevChats];
                }
                return updatedChats;
            });
        });
    }, [userId, wsMessages]);

    // runs only when new chat
    useEffect(() => {
        if (!newChats || newChats.length === 0) return;
        getUserChats(userId)
            .then(setChats)
            .finally(() => setNewChats([]));
    }, [userId, newChats]);

    const handleClose = () => {
        setIsOpen(false);
        setIsMinimized(false);
        setIsFullView(false);
        if (tempChat) setTempChat(null);
    };
    const handleMinimize = () => setIsMinimized(true);
    const handleRestore = () => setIsMinimized(false);
    const handleFullView = () => setIsFullView(prev => !prev);




    const openOrCreateChat = ({ receiverId, receiverUsername, receiverAvatar, itemId, thumbnailUrl, title }, chatsList) => {
        const chatsToCheck = chatsList || chats;
        if (!userId) return;

        const existingChat = chatsToCheck.find(c =>
            ((c.senderId === Number(userId) && c.receiverId === receiverId) ||
                (c.senderId === receiverId && c.receiverId === Number(userId))) &&
            c.itemId === itemId
        );

        if (existingChat) {
            setSelectedChat(existingChat);
            setTempChat(null);
            return existingChat;
        }

        if (!tempChat || tempChat.itemId !== itemId || tempChat.receiverId !== receiverId) {
            const newTempChat = {
                chatId: `temp`,
                receiverId,
                senderId: userId,
                itemId,
                receiverUsername,
                receiverAvatar,
                thumbnailUrl,
                title,
                isTemp: true,
            };
            console.log("temp chat:", newTempChat);
            setTempChat(newTempChat);
            setSelectedChat(newTempChat);
            return newTempChat;
        } else {
            setSelectedChat(tempChat);
            return tempChat;
        }
    };


    const addNewChat = chat => {
        console.log("Chat for sidebar:", chat);
        setChats(prev => {
            const updated = [chat, ...prev.filter(c => c.chatId !== chat.chatId)];
            return updated;
        });
        setSelectedChat(chat);
        setTempChat(null);
    };

    // --- Add message (WebSocket) ---
    const addMessage = async (message, chat = null) => {
        const currentChat = chat || selectedChat;
        if (!message.content || !userId || !currentChat) return;

        let chatIdToUse = currentChat.chatId;
        let receiverId = currentChat.receiverId;
        let itemId = currentChat.itemId;
        let senderUsername = username;
        let senderAvatar = currentChat.receiverAvatar;
        let receiverUsername = currentChat.receiverUsername;
        let receiverAvatar = currentChat.receiverAvatar;

        if (currentChat.isTemp) {
            console.log("initChat");
            const response = await initChat({
                senderId: Number(userId),
                senderUsername,
                senderAvatar,
                receiverId,
                receiverUsername,
                receiverAvatar,
                itemId,
                content: message.content || "",
                messageType: message.type
            });
            chatIdToUse = response.chatId;

            const chatForSidebar = {
                ...currentChat,
                chatId: chatIdToUse,
                lastMessage: message.content,
                lastUpdated: new Date().toISOString(),
                username: receiverUsername,
                avatarUrl: receiverAvatar,
                isTemp: false
            };

            addNewChat(chatForSidebar);
        } else {
            // --- Αν είναι ήδη υπαρκτό chat: στείλε κατευθείαν το message ---
            sendMessage({
                content: String(message.content),
                receiverId,
                itemId,
                chatId: chatIdToUse,
                type: "OFFER"
            });
        }

        const actualChatId = chatIdToUse;


        setMessagesByChat(prev => ({
            ...prev,
            [actualChatId]: [
                ...(prev[actualChatId] || []),
                {
                    id: `temp-${Date.now()}`, // προσωρινό id
                    userId: Number(userId),
                    avatarUrl: currentChat.receiverAvatar,
                    content: message.content,
                    type: message.type,
                    isReadByReceiver: false,
                    timestamp: new Date().toISOString()
                }
            ]
        }));

    };



    return {
        openOrCreateChat,
        addNewChat,
        userId,
        username,
        isOpen,
        setIsOpen,
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
        addMessage,
        tempChat,
        setTempChat,
        setChats
    };
}
