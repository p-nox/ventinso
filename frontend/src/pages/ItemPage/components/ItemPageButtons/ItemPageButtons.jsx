import React, { useState } from "react";
import { sendOrder } from "@services/OrderService";
import { useAuth } from "@context/AuthContext";
import { useChatUI } from "@context/ChatUIProvider";
import Button from "@components/Buttons/Button/Button";
import OfferModal from "@components/OfferModal/OfferModal";
import styles from "./ItemPageButtons.module.css";
import { Mail, ShoppingCart, HandCoins } from "lucide-react";

export default function ItemPageButtons({ item }) {
  const { userId, username } = useAuth();
  const [open, setOpen] = useState(false);
  const { setIsOpen, setSelectedChat, addMessage, openOrCreateChat } = useChatUI();

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
      navigate(`/Order/${response.orderId}`);
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Order failed");
    }
  };

  const handleContact = () => {
    if (!userId) return;

    const chat = openOrCreateChat({
      receiverId: item.userId,
      receiverUsername: item.username,
      receiverAvatar: item.avatarUrl,
      itemId: item.id,
      thumbnailUrl: item.thumbnailUrl,
      title: item.title
    });

    setSelectedChat(chat);
    setIsOpen(true);
  };


  const handleOfferSubmit = async (offerAmount) => {
    setOpen(false);
    
    const chat = openOrCreateChat({
      receiverId: item.userId,
      receiverUsername: item.username,
      receiverAvatar: item.avatarUrl,
      itemId: item.id,
      thumbnailUrl: item.thumbnailUrl,
      title: item.title
    });

    setSelectedChat(chat);
    setIsOpen(true);

    const offerMessage = {
      content: offerAmount,
      type: "OFFER",
    };

    console.log("offerMessage", offerMessage);
    await addMessage(offerMessage, chat);
  };


  return (
    <div className={styles.wrapper}>
      <Button
        icon={Mail}
        iconOnly
        className={styles.iconOnly}
        iconProps={{ size: 18 }}
        variant="contact"
        label={`Contact ${item.username}`}
        onClick={handleContact}
      />
      <Button
        icon={ShoppingCart}
        iconOnly
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
        iconOnly
        className={styles.iconOnly}
        iconProps={{ size: 18 }}
        variant="offer"
        label="Make Offer"
        onClick={() => setOpen(true)}
      />

      {open && (
        <OfferModal
          price={item.price}
          onSubmit={handleOfferSubmit}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
