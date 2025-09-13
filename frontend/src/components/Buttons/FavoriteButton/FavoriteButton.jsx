import React, { useState, useCallback } from 'react';
import { toggleFavorite } from '@services/UserService';
import FavIcon from '@assets/Icons/FavIcon'; 
import { useAuth } from '@context/AuthContext';
import styles from './FavoriteButton.module.css';

function FavoriteButton({
  itemId,
  initialFilled = false,
  setWatchersCount,
  variant = 'card', 
  style = {},           
}) {
  const { toggleWatchlist, userId } = useAuth();
  const [filled, setFilled] = useState(initialFilled);
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (!userId || !itemId) return;

    try {
      setLoading(true);
      await toggleFavorite(userId, itemId);
      toggleWatchlist(itemId);

      const newFilled = !filled;
      setFilled(newFilled);

      if (setWatchersCount) {
        setWatchersCount(prevCount =>
          newFilled ? prevCount + 1 : prevCount - 1
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, itemId, toggleWatchlist, filled, setWatchersCount]);

  const wrapperClass =
    variant === 'bigCard' ? styles.wrapperItemCardBig : styles.wrapperItemCard;

  return (
    <button
      className={wrapperClass}
      style={style}                
      aria-label={filled ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
      onClick={handleClick}
      disabled={loading}
    >
      <FavIcon filled={filled} />
    </button>
  );
}

export default React.memo(FavoriteButton);
