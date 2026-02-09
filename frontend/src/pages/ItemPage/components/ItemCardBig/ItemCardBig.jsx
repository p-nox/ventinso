import React, { useState, useEffect } from 'react';
import styles from './ItemCardBig.module.css';
import FavoriteButton from '@components/Buttons/FavoriteButton/FavoriteButton';
import { API_URLS } from '@config/Config';
import { ImageLightBox, Tag } from '@components/ui';
import { Euro } from "lucide-react";

export default function ItemCardBig({ item, itemOwnerId }) {
  const [mainImage, setMainImage] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsLightboxOpen(false);
    if (item.imageUrls?.length > 0) {
      setMainImage(
        item.thumbnailUrl
          ? API_URLS.IMAGE_FILE(item.thumbnailUrl)
          : API_URLS.IMAGE_FILE(item.imageUrls[0])
      );
      setCurrentIndex(0);
    }
  }, [item]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    window.history.pushState({ lightbox: true }, '', window.location.href);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    if (window.history.state?.lightbox) window.history.back();
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % item.imageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? item.imageUrls.length - 1 : prev - 1
    );
  };



  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.text}>{item.title}</p>

        <p className={styles.price}>
          <span className={styles.priceText}>{item.price}</span>
          <Euro className={styles.priceIcon} />
        </p>
      </div>

      <Tag value={item.condition} fontSize="0.8rem" margin="0px 0px 0px 6px" />

      <div className={styles.imageContainer}>

        <div className={styles.mainImageWrapper}>

          <FavoriteButton
            itemId={item.itemId}
            watchers={item.watchers}
            itemOwnerId={itemOwnerId}
          />

          {item.status === "SOLD" && (
            <div className={styles.soldTag}>SOLD</div>
          )}
          {mainImage && (
            <img
              src={mainImage}
              alt={item.title}
              className={styles.mainImage}
              onClick={() => openLightbox(currentIndex)}
            />
          )}

        </div>

        <div className={styles.thumbnailContainer}>

          {item.imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={API_URLS.IMAGE_FILE(url)}
              alt={`Thumbnail ${idx}`}
              className={styles.thumbnail}
              onClick={() => openLightbox(idx)}
              onMouseEnter={() => setMainImage(API_URLS.IMAGE_FILE(url))}
            />
          ))}

        </div>

      </div>

      <div className={styles.description}>
        <p>{item.description}</p>
      </div>

      {isLightboxOpen && (
        <ImageLightBox
          images={item.imageUrls.map((url) => API_URLS.IMAGE_FILE(url))}
          startIndex={currentIndex}
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          thumbnailSrc={API_URLS.IMAGE_FILE(item.imageUrls[currentIndex])}
          thumbnailAlt={item.title}
        />
      )}

    </div>
  );
}