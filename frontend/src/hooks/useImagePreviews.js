import { useState, useEffect } from "react";
import { API_URLS } from "@config/Config.js";
import { deleteImage } from "@services/InventoryService.js";
import { useParams } from "react-router-dom";

export default function useImagePreviews(
  files,
  setFiles,
  existingImages,
  setExistingImages,
  thumbnail,
  setThumbnail
) {
  const [previews, setPreviews] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState();
  const { itemId } = useParams();

useEffect(() => {
   console.log("new thumbnail index", thumbnailIndex);
}, [files, existingImages, thumbnailIndex]);

  useEffect(() => {
  
    const existingUrls = existingImages
      .map(path => API_URLS.IMAGE_FILE(path.replace(/^\/+/, "")))
      .filter(Boolean);

    const newFilesUrls = files
      .map(f => f instanceof File ? URL.createObjectURL(f) : null)
      .filter(Boolean);

    const allPreviews = [...existingUrls, ...newFilesUrls];
    setPreviews(allPreviews);

    // check if thumbnail is valid after update of preview items
    const thumbnailExists = allPreviews.some(url => {
      const filename = url.split("/").pop();
      return filename === thumbnail;
    });


    if (!thumbnailExists) {
      const firstOfExistingFiles = existingImages[0]?.split("/").pop();
      const firstOfNewFiles = files[0]?.name;
      const newThumb = firstOfExistingFiles || firstOfNewFiles || null;

      setThumbnail(newThumb);
      setThumbnailIndex(newThumb ? 0 : -1);
    } else {
      const newIndex = allPreviews.findIndex(url => url.split("/").pop() === thumbnail);
      setThumbnailIndex(newIndex);
    }
    return () => newFilesUrls.forEach(url => URL.revokeObjectURL(url));
  }, [files, existingImages]);


  async function handleDelete(index) {
    console.log("Delete file");

    const existingCount = existingImages.length;
    let newExisting = [...existingImages];
    let newFiles = [...files];

    if (index < existingCount) {
      const rawValue = existingImages[index];
      const filename = typeof rawValue === "string" ? rawValue.split("/").pop() : null;

      if (filename) {
        try {
          await deleteImage(itemId, filename);
        } catch (err) {
          console.error("[handleDelete] Failed to delete image:", err);
        }
      }

      newExisting.splice(index, 1);
      setExistingImages(newExisting);
    } else {
      const fileIndex = index - existingCount;
      newFiles.splice(fileIndex, 1);
      setFiles(newFiles);
    }

    // thumbnail fix
    if (thumbnailIndex === index) {
      const newThumb = newExisting[0] || newFiles[0]?.name || null;

      setThumbnail(newThumb);
      setThumbnailIndex(newThumb ? 0 : -1);
    } else if (thumbnailIndex > index) {
      setThumbnailIndex(prev => prev - 1);
    }
  }

  return {
    previews,
    thumbnailIndex,
    setThumbnailIndex,
    handleDelete
  };
}
