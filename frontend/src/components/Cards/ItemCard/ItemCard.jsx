import { Link } from 'react-router-dom';
import styles from "./ItemCard.module.css";
import { Tag } from "@components/ui";
import FavoriteButton from "@components/Buttons/FavoriteButton/FavoriteButton";
import { API_URLS, Paths } from "@config/Config";
import { Euro } from "lucide-react";


export default function ItemCard({ item, minWidth, maxWidth }) {
  if (!item) return null;
 
  return (

    <div className={styles.wrapper} style={{ minWidth, maxWidth }}>

      <div className={styles.priceTag}>
        {item.price}
        <Euro className={styles.priceIcon} />
      </div>

      <FavoriteButton
        itemId={item.itemId}
        watchers={item.watchers}
        itemOwnerId={item.userId}
      />

      <Link to={Paths.ITEM(item.itemId)} className={styles.noUnderline} >
        <img
          src={API_URLS.IMAGE_FILE(item.thumbnailUrl)}
          alt={`${item.title}`}
          className={styles.productImage}
        />
      </Link>

      <TitleWithCondition
        title={item.title}
        condition={item.condition}
        type={item.type}
        itemId={item.itemId}
        openToOffers={item.openToOffers}
      />
      {/*{
            {item.openToOffers &&
          <div className={styles.rightTag}>
            <Tag value="Flexible Price" fontSize="0.75rem" />
          </div>}
       
      )}*/}
    </div>

  );
}


function TitleWithCondition({ title, condition, openToOffers }) {
  return (
    <div className={styles.headerContainer}>
      <span className={styles.title}>{title}</span>
      <div className={styles.tagsContainer}>
        <Tag value={condition} fontSize="0.75rem" />
      </div>
    </div>
  );
}
