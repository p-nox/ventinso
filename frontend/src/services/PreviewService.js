import { API_URLS } from "@config/Config";
import createApiClient from "./ApiHandler";

const { handle } = createApiClient(API_URLS.PREVIEW);

export const fillTheGrid = (offset = 0, limit) =>
  handle(api => api.get(`/latest?limit=${limit}&offset=${offset}`));


export const fetchItems = (filters) => {
  const params = {};
  if (filters.q != null) params.q = filters.q;
  if (filters.category != null) params.category = filters.category;
  if (filters.type != null) params.type = filters.type;
  if (filters.condition != null) params.condition = filters.condition;
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  params.limit = filters.limit || 20;

  return handle(api => api.get(`/search`, { params }));
};
