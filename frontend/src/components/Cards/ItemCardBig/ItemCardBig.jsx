import React, { useState, useEffect } from 'react';
import styles from './ItemCardBig.module.css';
import Tag from '@components/Tag/Tag';
import FavoriteButton from '@components/Buttons/FavoriteButton/FavoriteButton';
import ScrollButton from '@components/Buttons/ScrollButton/ScrollButton';
import { API_BASE_URL } from '@config/Config';
import { useAuth } from '@context/AuthContext';

export default function ItemCardBig({ item }) {
  const { userId, watchlist } = useAuth();
  const [mainImage, setMainImage] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchersCount, setWatchersCount] = useState(item.watchersCount);

  const isFavorite = watchlist.includes(Number(item.id));
  const isOwner = Number(userId) === Number(item.userId);

  useEffect(() => {
    setIsLightboxOpen(false);
    if (item.imageUrls?.length > 0) {
      setMainImage(
        item.thumbnailUrl
          ? `${API_BASE_URL}${item.thumbnailUrl}`
          : `${API_BASE_URL}${item.imageUrls[0]}`
      );
      setCurrentIndex(0);
    }
  }, [item]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (isLightboxOpen) {
        e.preventDefault();
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLightboxOpen]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    if (!isLightboxOpen) {
      window.history.pushState({ lightbox: true }, '', window.location.href);
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    if (window.history.state?.lightbox) {
      window.history.back();
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % item.imageUrls.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? item.imageUrls.length - 1 : prev - 1
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.text}>{item.title}</p>
        <p className={styles.text}>{item.price}€</p>
      </div>
      <Tag value={item.condition} fontSize="0.8rem" margin="0px 0px 0px 6px" />
      <div className={styles.imageContainer}>
        <div className={styles.mainImageWrapper}>
          {!isOwner && (
            <div
              className={styles.favoriteWrapper}
              style={{ borderRadius: watchersCount > 0 ? '100px' : '50%' }}
            >
              <FavoriteButton
                itemId={item.id}
                initialFilled={isFavorite}
                watchersCount={watchersCount}
                setWatchersCount={setWatchersCount}
                variant="bigCard"
              />
              {watchersCount > 0 && (
                <div className={styles.watcherBadge}>{watchersCount}</div>
              )}
            </div>
          )}
          <img
            src={mainImage}
            alt={item.title}
            className={styles.mainImage}
            onClick={() => openLightbox(currentIndex)}
          />
        </div>

        <div className={styles.thumbnailContainer}>
          {item.imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={`${API_BASE_URL}${url}`}
              alt={`Thumbnail ${idx}`}
              className={styles.thumbnail}
              onClick={() => openLightbox(idx)}
              onMouseEnter={() => setMainImage(`${API_BASE_URL}${url}`)}
            />
          ))}
        </div>
      </div>

      <div className={styles.description}>
        <p>{item.description}</p>
      </div>

      {isLightboxOpen && (
        <div className={styles.overlay} onClick={closeLightbox}>
          <ScrollButton direction="left" onClick={prevImage} show={true} />
          <img
            src={`${API_BASE_URL}${item.imageUrls[currentIndex]}`}
            alt={item.title}
            className={styles.fullImage}
          />
          <ScrollButton direction="right" onClick={nextImage} show={true} />
        </div>
      )}
    </div>
  );
}
