import { useState, useEffect } from "react";
import { API_BASE_URL } from "@config/Config.js";
import { deleteImage } from "@services/InventoryService.js";
import { useParams } from 'react-router-dom';

export default function useImagePreviews(files, setFiles, existingImages, setExistingImages, setThumbnail) {

  const [previews, setPreviews] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(-1);
  const { itemId  } = useParams();

  useEffect(() => {
    const existingUrls = existingImages
      .map(img => {
        if (typeof img === "string") 
            return img.startsWith("http") ? img : `${API_BASE_URL}/${img.replace(/^\/+/, "")}`;
        if (img.thumbnailUrl || img.imageUrls?.[0]) 
            return img.thumbnailUrl || img.imageUrls[0];
        return null;
      })
      .filter(Boolean);

    const newFilesUrls = files
      .map(file => file instanceof File ? URL.createObjectURL(file) : null)
      .filter(Boolean);

    const allPreviews = [...existingUrls, ...newFilesUrls];
    setPreviews(allPreviews);

    if (allPreviews.length > 0 && thumbnailIndex === -1) {
      const firstThumbnail = existingImages[0] || files[0]?.url || files[0]?.name;
      if (firstThumbnail) {
        setThumbnail(typeof firstThumbnail === "string" ? firstThumbnail.split("/").pop() : firstThumbnail);
        setThumbnailIndex(0);
      }
    }

    return () => {
      newFilesUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files, existingImages, setThumbnail, thumbnailIndex]);

  async function handleDelete(index) {
    const existingCount = existingImages.length;

    if (index < existingCount) {
      const rawValue = existingImages[index];
      const filename = typeof rawValue === "string" ? rawValue.split("/").pop() : null;
      console.log(itemId );

      if (filename) {
        try { await deleteImage(itemId, filename); } 
        catch (err) { console.error("[handleDelete] Failed to delete image:", err); }
      }

      const newExisting = [...existingImages];
      newExisting.splice(index, 1);
      setExistingImages(newExisting);
    } else {
      const fileIndex = index - existingCount;
      setFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }

    if (thumbnailIndex === index) {
      const newThumb = existingImages[0] || files[0]?.name || null;
      setThumbnail(newThumb);
      setThumbnailIndex(newThumb ? 0 : -1);
    } else if (thumbnailIndex > index) {
      setThumbnailIndex(prev => prev - 1);
    }
  }

  return { previews, thumbnailIndex, setThumbnailIndex, handleDelete };
}
