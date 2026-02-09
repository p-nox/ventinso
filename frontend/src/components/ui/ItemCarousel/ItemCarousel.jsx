import React, { useRef, useState, useEffect } from "react";
import ItemCard from "@components/Cards/ItemCard/ItemCard";
import styles from "./ItemCarousel.module.css";
import { ArrowIcon } from "@assets/icons";
import { SectionTitle } from "@components/ui";

export default function ItemCarousel({ items, username }) {
  const scrollRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 0,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth,
    });
  };

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items]);

  if (!items || items.length === 0) {
    return null;
  }
  return (
    <div>

      <SectionTitle text={`More items from ${username}`} />

      <div className={styles.carouselWrapper}>
        <ScrollButton direction="left" onClick={() => scroll("left")} show={canScroll.left} />

        <div className={styles.carousel} ref={scrollRef} onScroll={updateScrollButtons}>
          {items.map(item => (
            <div key={item.itemId} className={styles.cardWrapper}>
              <ItemCard item={item} showUserInfo={false} />
            </div>
          ))}
        </div>

        <ScrollButton direction="right" onClick={() => scroll("right")} show={canScroll.right} />
          
      </div>

    </div>
  );
}


function ScrollButton({ direction, onClick, show }) {
  if (!show) return null;
  return (
    <button
      className={`${styles.arrowButton} ${direction === "left" ? styles.left : styles.right}`}
      onClick={onClick}
    >
      <ArrowIcon direction={direction} size={40} color="black" />
    </button>
  );
}