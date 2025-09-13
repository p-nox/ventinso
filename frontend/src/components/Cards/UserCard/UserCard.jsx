import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "@components/Cards/UserCard/UserCard.module.css";
import { Paths, API_BASE_URL } from "@config/Config";
import { Camera } from "lucide-react";

export default function UserCard({
  avatarUrl,
  username,
  totalSales,
  sales,
  userId,
  registeredAt,
  editable = false,
  onAvatarChange,
  disableLink = false,
}) {
  return (
    <div className={styles.wrapper}>
      <Avatar
        avatarUrl={avatarUrl}
        editable={editable}
        userId={userId}
        onAvatarChange={onAvatarChange}
        disableLink={disableLink}
      />
      <Username
        username={username}
        totalSales={totalSales}
        userId={userId}
        disableLink={disableLink}
      />
    </div>
  );
}









function Username({ username, totalSales, userId, disableLink }) {
  const content = (
    <p className={styles.username}>
      {username}
    </p>
  );

  return (
    <div className={styles.usernameContainer}>
      {disableLink ? content : (
        <Link to={Paths.PROFILE(userId)} className={styles.usernameLink}>
          {content}
        </Link>
      )}
    </div>
  );
}

function Avatar({ avatarUrl, editable, onAvatarChange }) {
  const inputRef = useRef(null);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [imgSrc, setImgSrc] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (avatarUrl) {

      const newSrc = `${API_BASE_URL}${avatarUrl}?t=${cacheBuster}`;
      setLoading(true);
      const img = new Image();
      img.src = newSrc;
      img.onload = () => {
        setImgSrc(newSrc);
        setLoading(false);
      };
      img.onerror = () => {
        setImgSrc(null);
        setLoading(false);
      };
    } else {
      setImgSrc(null);
      setLoading(true);
    }
  }, [avatarUrl, cacheBuster]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (onAvatarChange) {
      await onAvatarChange(file);
      setCacheBuster(Date.now());
    }
  };

  return (
    <div className={styles.avatarWrapper}>
      <div className={styles.avatarContainer}>
        {loading || !imgSrc ? (
          <div className={styles.avatarPlaceholder}></div>
        ) : (
          <img
            src={imgSrc}
            alt=""
            className={styles.avatar}
            onError={() => setImgSrc(null)}
          />
        )}

        {editable && (
          <button
            className={styles.editButton}
            onClick={() => inputRef.current?.click()}
          >
            <Camera size={20} />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  );
}

