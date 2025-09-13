import React from "react";
import { useNavigate } from "react-router-dom";
import { sendOrder } from "@services/OrderService";
import { useAuth } from "@context/AuthContext";
import Button from "@components/Buttons/Button/Button";
import styles from "./ItemPageButtons.module.css";
import { Mail, ShoppingCart, HandCoins } from "lucide-react";

export default function ItemPageBtns({ item }) {
  const { userId, username } = useAuth();
  const navigator = useNavigate();

  const handleBuyNow = async () => {
    if (!userId) {
      alert("You must be logged in to proceed.");
      return;
    }

    const confirmPurchase = window.confirm(
      `Are you sure you want to buy "${item.title}" for ${item.price} credits?`
    );
    if (!confirmPurchase) return;

    const orderRequest = {
      buyerId: userId,
      buyerUsername: username,
      sellerId: item.userId,
      sellerUsername: item.username,
      itemId: item.id,
      itemTitle: item.title,
      itemCondition: item.condition,
      thumbnailUrl: item.thumbnailUrl,
      price: item.price,
    };

    try {
      const response = await sendOrder(orderRequest);
      await new Promise((r) => setTimeout(r, 300));
      navigator(`/Order/${response.orderId}`);
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Order failed");
    }
  };

  return (
    <div className={styles.wrapper}>
      <Button
        icon={Mail}
        iconOnly={true}
        className={styles.iconOnly}
        iconProps={{ size: 18 }}
        variant="contact"
        label={`Contact ${item.username}`}
        onClick={() => console.log("Contact", item.username)}
      />
      <Button
        icon={ShoppingCart}
        iconOnly={true}
       className={styles.iconOnly}
        iconProps={{ size: 18 }}
        variant="buyNow"
        label="Buy It Now"
        onClick={handleBuyNow}
        disabled={userId === item.userId}
        title={userId === item.userId ? "You cannot buy your own item" : ""}
      />
      <Button
        icon={HandCoins}
        iconOnly={true}
       className={styles.iconOnly}
        iconProps={{ size: 18 }}
        variant="offer"
        label="Make Offer"
        onClick={() => console.log("Make offer")}
      />
    </div>
  );
}

