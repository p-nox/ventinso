import React from "react";
import styles from "./ChatHeader.module.css";
import Avatar from "../Avatar";
import { X, Minus, Settings, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { Paths } from "@config/Config";

export function ChatHeader({ chat, onClose, onMinimize, onSettings, onFullView }) {
  if (!chat) return null;

  const displayName = chat.receiverUsername || chat.username;
  const displayAvatar = chat.receiverAvatar || chat.avatarUrl;
  const displayUserId = chat.receiverId || chat.userId;

  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatInfo}>
        <Link to={Paths.PROFILE(displayUserId)}>
          <Avatar src={displayAvatar} />
        </Link>
        <Link to={Paths.PROFILE(displayUserId)} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>{displayName}</span>
        </Link>
      </div>

      <div className={styles.chatControls}>
        <button onClick={onMinimize}><Minus size={16} /></button>
        <button onClick={onFullView}><Maximize size={16} /></button>
        <button onClick={onSettings}><Settings size={16} /></button>
        <button onClick={onClose}><X size={16} /></button>
      </div>
    </div>
  );
}