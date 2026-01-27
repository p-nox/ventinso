import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Paths } from '@config/Config';
import { formatDate } from '@utils/utils';
import styles from "./ReviewsSection.module.css";
import { SectionTitle } from '@components/ui';

export default function ReviewsSection({ reviews }) {
  const sectionRef = useRef(null);

  if (!reviews || reviews.length === 0) return null;

  const handleTitleClick = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={sectionRef}>
      <SectionTitle text="Recent Reviews" onClick={handleTitleClick} />
      <ReviewsList reviews={reviews} />
    </div>
  );
}

function ReviewsList({ reviews }) {
  return (
    <div className={styles.reviewsContainer}>
      {reviews.map((review, index) => (
        <ReviewItem key={index} review={review} />
      ))}
    </div>
  );
}

function ReviewItem({ review }) {
  const overallRating =
    (review.listingDescription + review.listingPackaging + review.listingCondition) / 3;

  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewHeader}>
        <Link to={Paths.PROFILE(review.reviewerId)} className={styles.username}>
          {review.reviewerUsername}
        </Link>
        <span className={styles.rating}>{overallRating.toFixed(1)}★</span>
        <span className={styles.time}>{formatDate(review.createdAt)}</span>
      </div>
      <div className={styles.reviewText}>
        {review.comment}
      </div>
      <div className={styles.productInfo}>
        {review.itemTitle}
        <Link to={Paths.ORDER(review.orderId)} className={styles.username}>
          - Order #{review.orderId}
        </Link>
      </div>
    </div>
  );
}
