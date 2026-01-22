import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatInput.module.css";
import { Image } from "lucide-react";
import { useChatUI } from "@context/ChatUIProvider";
import { useChatSocketContext } from "@context/ChatWebSocketContext";


export function ChatInput({ selectedChat, userId }) {
    const [text, setText] = useState("");
    const [files, setFiles] = useState([]);
    const [sending, setSending] = useState(false);
    const fileInputRef = useRef(null);

    const { sendMessage } = useChatSocketContext();
    const { addMessage } = useChatUI();

    const previews = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
    }));

    useEffect(() => {
        return () => previews.forEach(p => URL.revokeObjectURL(p.url));
    }, [files]);

    const handleSend = async () => {
        if (!text.trim() && files.length === 0) return;
        if (!userId || !selectedChat) return;

        console.log("text to send:", text);
        setSending(true);
        try {
            if (selectedChat.isTemp) {
                // create temp chat send meesage and replace temp chatId with backend response chatId
                await addMessage({ content: text, type: "TEXT" });
            } else {
                // otherwise send & broadcast message via websocket
                await sendMessage({
                    content: text,
                    receiverId: selectedChat.receiverId,
                    itemId: selectedChat.itemId,
                    files,
                    chatId: selectedChat.chatId,
                    type: "TEXT"
                });
            }

            setText("");
            setFiles([]);
        } catch (err) {
            console.error("[ChatInput] Error sending message:", err);
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles].slice(0, 6));
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.inputArea}>
            {previews.length > 0 && (
                <div className={styles.previewContainer}>
                    {previews.map((p, index) => (
                        <div key={index} className={styles.previewItem}>
                            {p.file.type.startsWith("image/") ? (
                                <img src={p.url} alt="preview" className={styles.previewMedia} />
                            ) : (
                                <video src={p.url} className={styles.previewMedia} muted />
                            )}
                            <button onClick={() => removeFile(index)} className={styles.removeButton}>
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.inputRow}>
                <textarea
                    placeholder="Type a message..."
                    className={styles.inputBox}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (e.shiftKey || e.target.value.includes("\n")) {
                            e.target.style.height = "auto"; 
                            e.target.style.height = e.target.scrollHeight + "px"; 
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                            e.target.style.height = "40px"; 
                        }
                    }}
                />


                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.iconButton}
                >
                    <Image size={25} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.hiddenFileInput}
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                />
                <button className={styles.sendButton} onClick={handleSend} disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    );
}
