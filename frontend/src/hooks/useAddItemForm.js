import { useState, useEffect } from 'react';
import { getCategories, createItem, updateItem } from '@services/InventoryService';
import { Paths } from "@config/Config";

export function useAddItemForm(initialItem, userId, navigate) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    type: 'SELL',
    condition: '',
    price: '',
    openToOffers: false,
    pickUpByAppointment: false,
    location: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [thumbnail, setThumbnail] = useState();

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
        type: "SELL",
        condition: initialItem.condition,
        price: initialItem.price.toString(),
        description: initialItem.description,
        openToOffers: initialItem.openToOffers || false,
        pickUpByAppointment: initialItem.pickUpByAppointment || false,
        location: initialItem.location || '',
        thumbnail: initialItem?.thumbnailUrl?.split?.("/").pop()
      });
      setExistingImages(initialItem.imageUrls || []);

    }
  }, [initialItem, categories]);

  useEffect(() => {

    if (!initialItem && existingImages.length === 0 && files.length === 0) return;

    const firstFile = files[0]?.name || files[0]?.url;

    const firstExisting =
      initialItem?.thumbnailUrl?.split?.("/")?.pop() ||
      existingImages[0];

    const autoThumb = firstExisting || firstFile;

    if (!thumbnail && autoThumb) setThumbnail(autoThumb);

  }, [files, existingImages, initialItem]);

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

  const handleAddItemSubmit = async () => {
    
    if (!thumbnail) {
      alert("Thumbnail is required");
      return;
    }

    const cleanThumbnail = thumbnail.split("/").pop();

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
        await updateItem(initialItem.itemId, itemPayload, files);
        navigate(Paths.ITEM(initialItem.itemId));
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
