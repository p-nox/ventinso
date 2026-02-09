import React, { useState } from "react";
import { sendOrder } from "@services/OrderService";
import { useAuth } from "@context/AuthContext";
import { useChatUI } from "@context/ChatUIProvider";
import Button from "@components/Buttons/Button/Button";
import OfferModal from "@components/OfferModal/OfferModal";
import styles from "./ItemPageButtons.module.css";
import { Mail, ShoppingCart, HandCoins } from "lucide-react";
import toast from "react-hot-toast";

export default function ItemPageButtons({ item, user, openLogin }) {
  const { userId: currentUserId, username: currentUsername } = useAuth();
  const [open, setOpen] = useState(false);
  const { setIsOpen, setSelectedChat, addMessage, openOrCreateChat } = useChatUI();

  const handleBuyNow = async () => {
    if (!currentUserId) {
      openLogin();
      return;
    }

    const confirmPurchase = window.confirm(
      `Are you sure you want to buy "${item.title}" for ${item.price} credits?`
    );
    if (!confirmPurchase) return;

    const orderRequest = {
      buyerId: currentUserId,
      buyerUsername: currentUsername,
      sellerId: user.userId,
      sellerUsername: user.username,
      itemId: item.itemId,
      itemTitle: item.title,
      itemCondition: item.condition,
      thumbnailUrl: item.thumbnailUrl,
      price: item.price,
      orderType: 'DEFAULT'
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
    if (!currentUserId) {
      openLogin();
      return;
    }

    const chat = openOrCreateChat({
      receiverId: user.userId,
      receiverUsername: user.username,
      receiverAvatar: user.avatarUrl,
      itemId: item.itemId,
      thumbnailUrl: item.thumbnailUrl,
      title: item.title,
      price: item.price
    });

    setSelectedChat(chat);
    setIsOpen(true);
  };

  const handleOfferClick = () => {
    if (!currentUserId) {
      openLogin();
      return;
    }
    setOpen(true);
  };

  const handleOfferSubmit = async (offerAmount) => {
    setOpen(false);

    const chat = openOrCreateChat({
      receiverId: user.userId,
      receiverUsername: user.username,
      receiverAvatar: user.avatarUrl,
      itemId: item.itemId,
      thumbnailUrl: item.thumbnailUrl,
      title: item.title,
      price: item.price
    });

    setSelectedChat(chat);
    setIsOpen(true);

    const offerMessage = {
      content: offerAmount,
      type: "OFFER",
    };
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
        label={`Contact ${user.username}`}
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
        disabled={currentUserId === user.userId}
        title={currentUserId === user.userId ? "You cannot buy your own item" : ""}
      />
      <Button
        icon={HandCoins}
        iconOnly
        className={styles.iconOnly}
        iconProps={{ size: 18 }}
        variant="offer"
        label="Make Offer"
        onClick={handleOfferClick}
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
