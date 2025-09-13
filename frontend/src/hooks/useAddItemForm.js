import { useState, useEffect } from 'react';
import { getCategories, createItem, updateItem } from '@services/InventoryService';

export function useAddItemForm(initialItem, userId, navigate) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    type: '',
    condition: '',
    price: '',
    openToOffers: false,
    pickUpByAppointment: false,
    location: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);

  const maxTitleChars = 100;
  const maxDescriptionChars = 10000;

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res))
      .catch(() => {
        alert("Failed to fetch categories");
      });
  }, []);

  // Initialize form if editing an item
  useEffect(() => {
    if (initialItem) {
      const matchedCategory = categories.find(c => c.name === initialItem.category);
      setFormData({
        title: initialItem.title,
        categoryId: matchedCategory?.id || '',
        categoryName: initialItem.category,
        type: initialItem.type,
        condition: initialItem.condition,
        price: initialItem.price.toString(),
        description: initialItem.description,
        openToOffers: initialItem.openToOffers || false,
        pickUpByAppointment: initialItem.pickUpByAppointment || false,
        location: initialItem.location || '',
      });

      const initialFiles = initialItem.imageUrls?.map(url => ({ url })) || [];
      setFiles(initialFiles);
      setExistingImages(initialItem.imageUrls || []);

      // default pick first image as thumbnail
      const firstThumbnail =
        initialItem.thumbnailUrl ||
        initialFiles[0]?.url ||
        initialItem.imageUrls?.[0] ||
        null;

      // remove prefix if thumbnail is Url
      if (firstThumbnail) {
        setThumbnail(typeof firstThumbnail === "string" ? firstThumbnail.split("/").pop() : firstThumbnail);
      }
    }
  }, [initialItem, categories]);

  useEffect(() => {
    if (files.length > 0 || existingImages.length > 0) {
      const firstFile = files[0]?.name || files[0]?.url;
      const firstExisting = existingImages[0]?.split?.("/")?.pop() || existingImages[0];
      const autoThumb = firstFile || firstExisting;
      setThumbnail(autoThumb);
    }
  }, [files, existingImages]);


  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {  // test returns true if value match the regex
      setFormData(prev => ({ ...prev, price: value }));
    }
  };

  const handleAddItemSubmit = async (itemValidator) => {
    if (itemValidator && !itemValidator()) return;

    if (!thumbnail) {
      alert("Thumbnail is required");
      return;
    }

    const cleanThumbnail = thumbnail?.includes("/api/images/") ? thumbnail.split("/").pop() : thumbnail;

    const itemPayload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      condition: formData.condition,
      type: formData.type,
      userId,
      categoryId: formData.categoryId,
      thumbnail: cleanThumbnail,
      openToOffers: formData.openToOffers,
      pickUpByAppointment: formData.pickUpByAppointment,
    };

    try {
      if (!initialItem) {
        await createItem(itemPayload, files);
        setFormData({
          title: '',
          categoryId: '',
          type: '',
          condition: '',
          price: '',
          location: '',
          description: '',
          openToOffers: false,
          pickUpByAppointment: false,
        });
        setFiles([]);
        setExistingImages([]);
        setThumbnail(null);
      } else {
        await updateItem(initialItem.id, itemPayload, files);
        navigate(`/Item/${initialItem.id}`);
      }
    } catch (error) {
      console.error("Failed to create/update item:", error);
    }
  };

  return {
    categories,
    formData,
    setFormData,
    files,
    setFiles,
    existingImages,
    setExistingImages,
    thumbnail,
    setThumbnail,
    maxTitleChars,
    maxDescriptionChars,
    handleChange,
    handlePriceChange,
    handleAddItemSubmit,
  };
}
