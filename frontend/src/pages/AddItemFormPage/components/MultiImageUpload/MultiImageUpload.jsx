import { useRef } from "react";
import styles from "./MultiImageUpload.module.css";
import { DeleteIcon, AddIcon} from "@assets/icons";

import useImagePreviews from "@hooks/useImagePreviews";

export default function MultiImageUpload({
  files,
  setFiles,
  setThumbnail = () => { },
  existingImages = [],
  setExistingImages = () => { }
}) {
  const inputRef = useRef(null);
  const { previews, thumbnailIndex, setThumbnailIndex, handleDelete } = useImagePreviews(
    files,
    setFiles,
    existingImages,
    setExistingImages,
    setThumbnail
  );

  function openFilePicker() {
    inputRef.current.click();
  }

  function handleChange(e) {
    const maxFiles = 8;
    const maxSizeMB = 8;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const selected = Array.from(e.target.files);

    if (files.length + selected.length + existingImages.length > maxFiles) {
      alert(`You can upload up to ${maxFiles} files in total.`);
      e.target.value = '';
      return;
    }

    for (let file of selected) {
      if (file.size > maxSizeBytes) {
        alert(`${file.name} exceeds the limit of ${maxSizeMB}MB.`);
        e.target.value = '';
        return;
      }
    }

    setFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  }

  function handleThumbnailChange(index) {
    const existingCount = existingImages.length;
    let valueToSend = null;

    if (index < existingCount) {
      const rawValue = existingImages[index];
      valueToSend = typeof rawValue === "string" ? rawValue.split("/").pop() : rawValue;
    } else {
      const fileIndex = index - existingCount;
      const file = files[fileIndex];
      valueToSend = file instanceof File ? file.name : previews[index];
    }

    setThumbnail(valueToSend);
    setThumbnailIndex(index);
  }

  return (
    <div className={styles.wrapper}>
      <FilePicker inputRef={inputRef} handleChange={handleChange} />
      <UploadButton onClick={openFilePicker} />
      <PreviewsContainer
        previews={previews}
        thumbnailIndex={thumbnailIndex}
        handleThumbnailChange={handleThumbnailChange}
        handleDeletePreview={handleDelete}
      />
    </div>
  );
}


function FilePicker({ inputRef, handleChange }) {
  return <input type="file" accept="image/*" multiple ref={inputRef} onChange={handleChange} style={{ display: "none" }} />;
}

function UploadButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className={styles.uploadButton}>
      <AddIcon width={60} height={60} stroke="rgba(8,5,5,1)" />
    </button>
  );
}

function PreviewItem({ src, i, thumbnailIndex, handleThumbnailChange, handleDeletePreview }) {
  return (
    <div className={styles.previewWrapper} onClick={() => handleThumbnailChange(i)}>
      <input
        type="radio"
        name="thumbnail"
        checked={thumbnailIndex === i}
        onChange={() => handleThumbnailChange(i)}
        className={styles.radioToggle}
        onClick={e => e.stopPropagation()}
      />
      <button type="button" className={styles.deleteButton} onClick={() => handleDeletePreview(i)}>
        <DeleteIcon width={15} height={15} fill="rgba(187,202,214,1)" />
      </button>
      <img
        src={src}
        alt={`preview-${i}`}
        className={styles.previewImage}
      />
    </div>
  );
}

function PreviewsContainer({ previews, thumbnailIndex, handleThumbnailChange, handleDeletePreview }) {
  return (
    <div className={styles.previewsContainer}>
      {previews.map((src, i) => (
        <PreviewItem
          key={i}
          src={src}
          i={i}
          thumbnailIndex={thumbnailIndex}
          handleThumbnailChange={handleThumbnailChange}
          handleDeletePreview={handleDeletePreview}
        />
      ))}
    </div>
  );
}
