import React, { useState } from "react";
import "./ImageLightbox.css";

function ImageLightbox({ src, alt }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="thumbnail"
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)}>
          <div className="popup">
            <img src={src} alt={alt} className="fullImage" />
          </div>
        </div>
      )}
    </>
  );
}

export default ImageLightbox;
