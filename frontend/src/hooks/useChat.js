import { useState, useEffect } from "react";
import { getUserChats, getChatMessages, initChat } from "@services/ChatService";
import { useAuth } from "@context/AuthContext";
import { useChatSocketContext } from "@context/ChatWebSocketContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Paths } from "@config/Config";

export function useChat() {
    const { userId, username, userAvatar } = useAuth();
    const navigate = useNavigate();
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

        let isMounted = true;

        getUserChats(userId)
            .then(data => {
                if (!isMounted) return;
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
                            title: navChat.itemTitle,
                            itemOwnerId: navChat.itemOwnerId
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

        return () => { isMounted = false };
    }, [userId, tempChat]);

    // load messages for selected chat
    useEffect(() => {
        if (!selectedChat?.chatId || selectedChat?.isTemp || !userId) return;

        let isMounted = true;

        getChatMessages(selectedChat.chatId, userId)
            .then(messages => {
                if (!isMounted) return;
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
    const handleFullView = (chat) => {

        setIsOpen(false);
        setIsMinimized(false);

        if (chat?.chatId) {
            navigate(Paths.CHAT_FULL + `?chatId=${chat.chatId}`);
        } else if (chat?.isTemp) {
            navigate(Paths.CHAT_FULL + `?temp=true`);
        } else {
            navigate(Paths.CHAT_FULL);
        }
    };


    const openOrCreateChat = ({ receiverId, receiverUsername, receiverAvatar, itemId, thumbnailUrl, title, price }, chatsList) => {
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
                itemOwnerId: receiverId,
                receiverUsername,
                receiverAvatar,
                thumbnailUrl,
                title,
                price,
                isTemp: true,
            };
           
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
        let senderAvatar = userAvatar;
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
            sendMessage({
                content: String(message.content),
                receiverId,
                itemId,
                chatId: chatIdToUse,
                type: "OFFER"
            });
        }
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
