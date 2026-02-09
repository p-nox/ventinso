import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@services/UserService';
import { useAuth } from '@context/AuthContext';
import styles from './FavoriteButton.module.css';

function FavoriteButton({ itemId, watchers, itemOwnerId }) {
  const { userId } = useAuth();
  const isOwner = Number(userId) === Number(itemOwnerId);

  // Watchlist από localStorage
  const [watchlist, setWatchlist] = useState(() => {
    const stored = localStorage.getItem("watchlist");
    return stored ? JSON.parse(stored) : [];
  });


  const isFilled = watchlist.includes(Number(itemId));


  const [watchersCount, setWatchersCount] = useState(watchers);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    setWatchersCount(watchers);
  }, [watchers]);

  
  const updateWatchlist = (add) => {
    setWatchlist(prev => {
      let updated;
      if (add) {
        updated = prev.includes(Number(itemId)) ? prev : [...prev, Number(itemId)];
      } else {
        updated = prev.filter(id => id !== Number(itemId));
      }
      localStorage.setItem("watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  
  const handleClick = async () => {
    if (!userId || !itemId || isOwner) return;
    setLoading(true);

    try {
      await toggleFavorite(userId, itemId);

      if (isFilled) {
        updateWatchlist(false);
        setWatchersCount(prev => Math.max(prev - 1, 0));
      } else {
        updateWatchlist(true);
        setWatchersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div
      className={`${styles.favoriteWrapper} 
                  ${(watchersCount > 0 || !isOwner) ? styles.active : ''} 
                  ${isOwner ? styles.owner : ''}`}
    >
      {(watchersCount > 0 || !isOwner) && (
        <button
          className={`${styles.wrapper} ${isOwner ? styles.disabled : ''}`}
          aria-label={isFilled ? 'Remove from favorites' : 'Add to favorites'}
          onClick={handleClick}
          disabled={loading || isOwner}
          title={isOwner ? "You cannot favorite your own item" : ""}
        >
          <Heart
            className={`${styles.icon} ${isFilled ? styles.filled : styles.stroke} ${isOwner ? styles.ownerIcon : ''}`}
          />
        </button>
      )}

      {watchersCount > 0 && (
        <div className={styles.watcherBadge}>{watchersCount}</div>
      )}
    </div>
  );
}

export default React.memo(FavoriteButton);
