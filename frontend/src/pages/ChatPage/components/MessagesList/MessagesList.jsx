import React, { useState, useRef, useEffect } from "react";
import styles from "./MessagesList.module.css";
import Avatar from "../Avatar";
import { API_URLS, Paths } from "@config/Config";
import { formatTimestamp } from "@utils/utils";
import { ImageLightBox } from "@components/ui";
import { Check } from "lucide-react";
import { useChatUI } from "@context/ChatUIProvider";
import { sendOrder } from "@services/OrderService";
import { Link } from "react-router-dom";
import { useChatSocketContext } from "@context/ChatWebSocketContext";
import OfferModal from "@components/OfferModal/OfferModal";

export function MessagesList({ messages, chatId, price }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { sendMessage } = useChatSocketContext();
  const { userId, username, selectedChat } = useChatUI();
  const messagesEndRef = useRef(null);
  const [handledOffers, setHandledOffers] = useState(new Set());
  const [open, setOpen] = useState(false);

  function openLightbox(imagesArray, index) {
    setLightboxImages(imagesArray);
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  }

  function closeLightbox() {
    setIsLightboxOpen(false);
    if (window.history.state?.lightbox) window.history.back();
  }

  function nextImage(e) {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % lightboxImages.length);
  }

  function prevImage(e) {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
  }


  async function handleAcceptOffer(message) {
    if (!userId) return;

    const offerAmount = message;
    if (!offerAmount) return;

    const orderRequest = {
      buyerId: selectedChat.receiverId,
      buyerUsername: selectedChat.username,
      sellerId: userId,
      sellerUsername: username,
      itemId: selectedChat.itemId,
      itemTitle: selectedChat.title,
      itemCondition: selectedChat.condition,
      thumbnailUrl: selectedChat.thumbnailUrl,
      price: offerAmount,
      orderType: "OFFER",
    };

    try {
      const response = await sendOrder(orderRequest);
      await new Promise((r) => setTimeout(r, 300));

      sendMessage({
        content: JSON.stringify({ offerAmount: message, orderId: response.orderId }),
        receiverId: selectedChat.receiverId,
        itemId: selectedChat.itemId,
        files: [],
        chatId: selectedChat.chatId,
        type: "OFFER_ACCEPTED",
      });
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Order failed");
    }
  }





  function handleOfferAction(message, action) {
    setHandledOffers((prev) => new Set(prev).add(message.id));
    switch (action) {
      case "accept":
        handleAcceptOffer(message.payload);
        break;
      case "reject":
        sendMessage({
          content: message.payload,
          receiverId: selectedChat.receiverId,
          itemId: selectedChat.itemId,
          files: [],
          chatId: selectedChat.chatId,
          type: "OFFER_REJECTED",
        });
        break;
      case "new_offer":
        setOpen(true)
        break;

      default:
        break;
    }
  }

  const handleOfferSubmit = async (offerAmount) => {
    console.log("=== Submitting Counter Offer ===");
    console.log("Offer Amount:", offerAmount);
    console.log("Chat ID:", selectedChat.chatId);
    console.log("Receiver ID:", selectedChat.receiverId);
    console.log("Item ID:", selectedChat.itemId);
    console.log("Message Type: COUNTER_OFFER");
    console.log("===============================");

    setOpen(false);

    sendMessage({
      content: String(offerAmount),
      receiverId: selectedChat.receiverId,
      itemId: selectedChat.itemId,
      files: [],
      chatId: selectedChat.chatId,
      type: "COUNTER_OFFER",
    });
  };

  function parseMediaContent(content) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return [];
  }


  function renderMessageContent(msg, isOwn) {
    const payload = msg.payload;
    const type = msg.type;
    const previewContent = msg.previewContent;



    let images = [];
    let videos = [];

    let offerAmount =
      type === "OFFER" || type === "OFFER_CLOSED" || type === "OFFER_ACCEPTED" || type === "OFFER_REJECTED"
        ? msg.fileUrls
        : payload;

    let orderId;
    if (type === "OFFER_ACCEPTED") {
      try {
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
        orderId = parsed.orderId;
        offerAmount = parsed.offerAmount;
        console.log("Parsed OFFER_ACCEPTED fileUrls:", parsed);
        console.log("Extracted orderId:", orderId);
      } catch (e) {
        console.error("Failed to parse OFFER_ACCEPTED fileUrls", e);
      }
    }

    if (type === "TEXT") {
      return <div className={`${styles.messageBubble} ${isOwn ? styles.messageOwn : styles.messageOther}`}><span>{previewContent}</span></div>;
    }

    if (type === "MEDIA") {

      const files = Array.isArray(msg.payload) 
                    ? msg.payload 
                    : JSON.parse(msg.payload);

      images = files.filter((f) => f.match(/\.(jpeg|jpg|png|gif)$/i));
      videos = files.filter((f) => f.match(/\.(mp4|webm|ogg)$/i));

      return (
        <div className={`${styles.messageBubble} ${isOwn ? styles.messageOwn : styles.messageOther}`}>
          {images.length > 0 && (
            <div className={styles.mediaGrid}>
              {images.slice(0, 2).map((file, index) => {
                const allImages = images.map((f) => API_URLS.CHAT_MEDIA(chatId, f));
                return (
                  <div
                    key={`${chatId}-img-${file}-${index}`}
                    className={styles.gridItem}
                    onClick={() => openLightbox(allImages, index)}
                  >
                    <img
                      src={API_URLS.CHAT_MEDIA(chatId, file)}
                      alt="preview"
                      style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                    />
                    {index === 1 && images.length > 2 && (
                      <div className={styles.overlay}>+{images.length - 2}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {videos.length > 0 && (
            <div>
              {videos.map((file, index) => (
                <video key={`${chatId}-vid-${file}-${index}`} controls style={{ maxWidth: 200, borderRadius: 8, margin: 4 }}>
                  <source src={`${API_URLS.BASE}/api/chat/uploads/chat/media/${chatId}/${file}`} type="video/mp4" />
                </video>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Offers messages 
    if (type === "OFFER" || type === "OFFER_CLOSED") {
      const isHandled = handledOffers.has(msg.id);
      return (
        <div className={`${styles.offerContainer} ${isOwn ? styles.offerOwn : styles.offerOther}`}>
          <div className={styles.offerHeader}>
            <span className={styles.offerLabel}>💰 New Offer</span>
          </div>
          <p className={styles.offerText}>
            {!isOwn ? (
              <>
                <strong className={styles.username}>{selectedChat.username}</strong> sent you an offer of <strong>{offerAmount} {payload}€</strong>.
              </>
            ) : (
              <>You sent an offer of <strong>{offerAmount} {payload}€</strong>. </>
            )}
          </p>
          {type === "OFFER" && !isHandled && (
            <div className={styles.offerButtons}>
              {!isOwn ? (
                <>
                  <button className={styles.accept} onClick={() => handleOfferAction(msg, "accept")}>Accept</button>
                  <button className={styles.reject} onClick={() => handleOfferAction(msg, "reject")}>Reject</button>
                  <button className={styles.newOffer} onClick={() => handleOfferAction(msg, "new_offer")}>Counter Offer</button>
                </>
              ) : (
                <button className={styles.cancel} onClick={() => handleOfferAction(msg, "cancel")}>Cancel</button>
              )}
            </div>
          )}
        </div>
      );
    }

    if (type === "OFFER_REJECTED") {
      return (
        <div className={`${styles.offerContainer} ${isOwn ? styles.offerOwn : styles.offerOther}`}>
          <div className={styles.offerHeader}>
            <span className={styles.offerBadgeRejected}>❌ Rejected</span>
          </div>
          <p className={styles.offerText}>
            {!isOwn ? (
              <>
                <strong className={styles.username}>{selectedChat.username}</strong> has rejected your offer of <strong>{payload} €</strong>.
              </>
            ) : (
              <>You rejected the offer of <strong>{payload} €</strong>.</>
            )}
          </p>
        </div>
      );
    }

    if (type === "OFFER_ACCEPTED") {
      return (
        <div className={`${styles.offerContainer} ${isOwn ? styles.offerOwn : styles.offerOther}`}>
          <div className={styles.offerHeader}>
            <span className={styles.offerBadgeAccepted}>✅ Accepted</span>
          </div>
          <p className={styles.offerText}>
            {!isOwn ? (
              <>
                <Link to={Paths.PROFILE(selectedChat.userId)} className={styles.usernameLink}>{selectedChat.username}</Link> has accepted your offer.
                <br />
                <br />
                Check your order{" "}
                <Link to={Paths.ORDER(orderId)} className={styles.orderLink}>
                  here
                </Link>

              </>
            ) : (
              <>
                You accepted the offer.
                <br />
                <br />
                <Link to={Paths.ORDER(orderId)} className={styles.orderLink}>Check your order here</Link>
              </>
            )}
          </p>
        </div>
      );
    }

    if (type === "COUNTER_OFFER") {
      return (
        <div className={`${styles.offerContainer} ${isOwn ? styles.offerOwn : styles.offerOther}`}>
          <div className={styles.offerHeader}>
            <span className={styles.offerLabel}>💡 Counter Offer</span>
          </div>
          <p className={styles.offerText}>
            {!isOwn ? (
              <>
                <strong className={styles.username}>{selectedChat.username}</strong> sent you a counter offer of <strong>{offerAmount}€</strong>.
              </>
            ) : (
              <>You sent a counter offer of <strong>{offerAmount}€</strong>.</>
            )}
          </p>
          {!isOwn && (
            <div className={styles.offerButtons}>
              <button className={styles.accept} onClick={() => handleOfferAction(msg, "accept")}>Accept</button>
              <button className={styles.reject} onClick={() => handleOfferAction(msg, "reject")}>Reject</button>
              <button className={styles.newOffer} onClick={() => handleOfferAction(msg, "new_offer")}>Counter Again</button>
            </div>
          )}
          {isOwn && (
            <div className={styles.offerButtons}>
              <button className={styles.cancel} onClick={() => handleOfferAction(msg, "cancel")}>Cancel</button>
            </div>
          )}
        </div>
      );
    }


    return null;
  }

  // scroll to bottom 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className={styles.messages}>
        {messages?.filter((msg) => msg && msg.id).map((msg) => {
          const senderAvatar = msg.avatarUrl;
          const isReadByReceiver = msg.isReadByReceiver;
          const timestamp = msg.timestamp;
          const isOwn = msg.userId === Number(userId);

          return (
            <div key={`${chatId}-${msg.id}`} className={`${styles.messageRow} ${isOwn ? styles.ownRow : styles.otherRow}`}>
              <div className={styles.messageContainer} style={{ flexDirection: isOwn ? "row-reverse" : "row" }}>
                <Link to={Paths.PROFILE(msg.userId)}>
                  <Avatar src={senderAvatar} />
                </Link>
                <div className={styles.messageBubbleWrapper}>
                  {renderMessageContent(msg, isOwn)}
                  <MessageTimestamp isOwn={isOwn} isReadByReceiver={isReadByReceiver} timestamp={timestamp} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {isLightboxOpen && (
        <ImageLightBox
          images={lightboxImages}
          startIndex={currentIndex}
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
      {open && (
        <OfferModal
          price={price}
          onSubmit={handleOfferSubmit}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function MessageTimestamp({ isOwn, isReadByReceiver, timestamp }) {
  return (
    <span className={styles.messageTimestamp}>
      {isOwn && <Check size={16} color={isReadByReceiver ? "#4c9aff" : "#999"} />}
      {timestamp ? formatTimestamp(timestamp) : ""}
      {!isOwn && <Check size={16} color={isReadByReceiver ? "#4c9aff" : "#999"} />}
    </span>
  );
}
