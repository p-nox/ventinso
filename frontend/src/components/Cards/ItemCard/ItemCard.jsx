import { Link } from 'react-router-dom';
import styles from "./ItemCard.module.css";
import { Tag } from "@components/ui";
import FavoriteButton from "@components/Buttons/FavoriteButton/FavoriteButton";
import { useAuth } from "@context/AuthContext";
import { API_BASE_URL, Paths } from "@config/Config";
import { getRatingPercentageAndLabel } from '@utils/utils';

export default function ItemCard({ item, showUserInfo }) {
  if (!item) return null;
  const { userId, watchlist } = useAuth();
  const isFavorite = watchlist.includes(Number(item.itemId));
  const isOwner = Number(userId) === Number(item.userId);

  return (
    <div className={styles.wrapper}>
      <div className={styles.priceTag}>
        {item.price} €
      </div>
      {!isOwner && (
        <div className={`${styles.favoriteButtonWrapper} ${isFavorite ? styles.alwaysVisible : ''}`}>
          <FavoriteButton
            userId={userId}
            itemId={item.itemId}
            initialFilled={isFavorite}
          />
        </div>
      )}
      <ProductImage
        title={item.title}
        thumbnail={item.thumbnailUrl}
        itemId={item.itemId}
      />
      <TitleWithCondition
        title={item.title}
        condition={item.condition}
        type={item.type}
        itemId={item.itemId}
        openToOffers={item.openToOffers}
      />
      {showUserInfo && (
        <div className={styles.userInfoWrapper}>
          <UserInfo
            username={item.username}
            totalRatings={item.totalRatings}
            avgOverallRating={item.avgOverallRating}
            userId={item.userId}
          />
        </div>
      )}
    </div>
  );
}


function ProductImage({ title, thumbnail, itemId }) {
  return (
    <Link to={Paths.ITEM(itemId)} className={styles.noUnderline}>
      <img
        src={`${API_BASE_URL}${thumbnail}`}
        alt={`Image of ${title}`}
        className={styles.productImage}
      />
    </Link>
  );
}

function TitleWithCondition({ title, condition, type, itemId, openToOffers }) {
  return (
    <div className={styles.headerContainer}>
      <Link to={Paths.ITEM(itemId)} className={styles.noUnderline}>
        <span className={styles.title}>{title}</span>
      </Link>

      <div className={styles.tagsContainer}>
        <Tag value={condition} fontSize="0.75rem" />
        <Tag value={type} fontSize="0.75rem" />
        {openToOffers &&
          <div className={styles.rightTag}>
            <Tag value="Flexible Price" fontSize="0.75rem" />
          </div>}
      </div>
    </div>
  );
}

function UserInfo({ username, totalRatings, avgOverallRating, userId }) {
  const showRatings = totalRatings > 0;
  const { percentage, label } = getRatingPercentageAndLabel(avgOverallRating);

  return (
    <div className={styles.userInfoContainer}>
      <Link to={Paths.PROFILE(userId)} className={styles.noUnderline}>
        <span className={styles.username}>
          {username}
        </span>
      </Link>

      {showRatings && (
        <span className={styles.avgRating}>
          {percentage}%  {label}
        </span>
      )}
    </div>
  );
}

