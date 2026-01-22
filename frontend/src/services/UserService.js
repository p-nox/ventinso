import createApiClient from "./ApiHandler";
import { API_URLS, getAuthHeaders } from "../config/Config";

const { handle: handleUsers } = createApiClient(API_URLS.USER);
const { handle: handleAggregated } = createApiClient(API_URLS.AGGREGATED);
const { handle: handleRatings } = createApiClient(API_URLS.RATING);
const { handle: handleWallet } = createApiClient(API_URLS.WALLET);

export const getUser = (id, includeHidden = false) =>
  handleAggregated(api =>
    api.get(`/user/${id}`, {
      params: { includeHidden }
    })
  );


export const toggleFavorite = (userId, itemId) =>
  handleUsers(api => api.post(`/${userId}/watchlist/${itemId}`));

export const getUserProfile = (userId) =>
  handleUsers(api => api.get(`/${userId}/profile`));


/* Rating Service */
export const createRating = (ratingRequest) =>
  handleRatings(api => api.post(``, ratingRequest));

export const getRating = (orderId) =>
  handleRatings(api => api.get(`/order/${orderId}`));


/* Wallet Service */
export const getBalance = (userId, token) =>
  handleWallet(api => api.get(`/${userId}`, { headers: getAuthHeaders(token) }));

export const updateUser = (id, user, token) =>
  handleUsers(api => api.put(`/${id}`, user, { headers: getAuthHeaders(token) }));
