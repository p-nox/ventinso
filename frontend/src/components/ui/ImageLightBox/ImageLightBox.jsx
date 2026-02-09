import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ImageLightBox.module.css";
import ScrollButton from "@components/Buttons/ScrollButton/ScrollButton";
import { X } from "lucide-react";


export default function ImageLightBox({
  images = [],
  startIndex = 0,
  thumbnailAlt,
  isOpen: externalIsOpen,
  onClose,
  onNext,
  onPrev
}) {

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);


  const showOverlay = externalIsOpen !== undefined ? externalIsOpen : isOpen;

  const close = () => {
    if (externalIsOpen === undefined) setIsOpen(false);
    if (onClose) onClose();

  };

  const next = (e) => {
    e.stopPropagation();
    if (onNext) onNext();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e) => {
    e.stopPropagation();
    if (onPrev) onPrev();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handlePopState = (e) => {
      if (showOverlay) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showOverlay]);


  return (
    <>
      {showOverlay &&
        createPortal(
          <div className={styles.overlay} onClick={close}>
        
            <button
              className={styles.closeBtn}
              onClick={(e) => { e.stopPropagation(); close(); }}
            >
              <X size={28} color="white" />
            </button>

            <ScrollButton direction="left" onClick={prev} show={true} />

            <img
              src={images[currentIndex]}
              alt={thumbnailAlt}
              className={styles.fullImage}
              onClick={(e) => e.stopPropagation()}
            />

            <ScrollButton direction="right" onClick={next} show={true} />
          </div>,
          document.body
        )}
    </>
  );

}
