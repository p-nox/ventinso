import React from "react";
import styles from "./ChatHeader.module.css";
import Avatar from "../Avatar";
import { X, Minus, Settings, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { Paths } from "@config/Config";


export function ChatHeader({ chat, onClose, onMinimize }) {
  const hasChat = !!chat;

  const username = chat?.receiverUsername || chat?.username;
  const avatarFilename = chat?.receiverAvatar || chat?.avatarUrl;
  const userId = chat?.receiverId || chat?.userId;

  return (
    <div className={styles.chatHeader}>

      {hasChat && (
        <div className={styles.chatInfo}>

          <Link to={Paths.PROFILE(userId)}>

            <Avatar src={avatarFilename} />

          </Link>

          <Link to={Paths.PROFILE(userId)} style={{ textDecoration: 'none', color: 'inherit' }}>

            <span>{username}</span>

          </Link>

        </div>
      )}

      <div className={styles.chatControls}>

        {/*<button onClick={onFullView}><Maximize size={16} /></button>*/}
        <button onClick={onMinimize}><Minus size={16} /></button>
        <button onClick={onClose}><X size={16} /></button>

      </div>

    </div>
  );
}
