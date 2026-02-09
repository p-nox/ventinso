import createApiClient from "./ApiHandler";
import { API_URLS } from "@config/Config";

const { handle } = createApiClient(API_URLS.INVENTORY);

export const updateItemPreference = (itemId, preference, value) =>
  handle(api => api.patch(`/${itemId}/preferences/${preference}`, {}, { params: { value } }));


export const getItem = (itemId, userId) => {
  const { handle } = createApiClient(API_URLS.AGGREGATED);

  return handle(api =>
    api.get(`/item/${itemId}`, {
      params: { userId }
    })
  );
};




export const updateItemStatus = (itemId, itemStatus) =>
  handle(api => api.patch(`/${itemId}/status/${itemStatus}`));

export const deleteItem = (itemId) =>
  handle(api => api.delete(`/${itemId}`));

export const getCategories = () =>
  handle(api => api.get(`/categories`));

export const getCategoryForItem = (itemId) =>
  handle(api => api.get(`/${itemId}/category`));


export const deleteImage = (itemId, filename) => {
  const { handle } = createApiClient(API_URLS.IMAGE);
  return handle(api => api.delete(API_URLS.IMAGE_FILE(`${itemId}/${filename}`)));
};

export const createItem = (itemObj, files = []) => {
  const formData = buildFormData(itemObj, files);
  return handle(api => api.post('', formData));
};

export const updateItem = (itemId, itemObj, files = []) => {
  const formData = buildFormData(itemObj, files);
  return handle(api => api.put(`/${itemId}`, formData));
};

function buildFormData(itemObj, files = []) {
  const formData = new FormData();
  Object.entries(itemObj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === 'object' && !(value instanceof File)) {
        if ('id' in value) formData.append(key, value.id.toString());
        else formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });
   console.log("Files being appended:", files);
  files.forEach(file => formData.append('files', file));
  return formData;
}
