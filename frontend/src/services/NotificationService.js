import createApiClient from "./ApiHandler";
import { API_URLS, getAuthHeaders } from "@config/Config";

const { handle } = createApiClient(API_URLS.NOTIFICATION);
const { handle: handlePreferences } = createApiClient(API_URLS.NOTIFICATION_PREFERENCES);



export const markAsRead = (notificationId) =>
  handle(api => api.patch(
      `/notification/${notificationId}/read`,
      null,
      { headers: getAuthHeaders() }
  ));

export const getUserNotifications = (userId) =>
  handle(api => api.get(
      `/user/${userId}`,
      { headers: getAuthHeaders() }
  ));

export const markAllAsRead = (userId) =>
  handle(api => api.patch(
      `/users/${userId}/notifications/read-all`,
      null,
      { headers: getAuthHeaders() }
  ));




export const getSettings = (userId) =>
  handlePreferences(async (api) => {
    const response = await api.get(`/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  });

export const togglePreference = (userId, request) =>
  handlePreferences(async (api) => {
    const response = await api.patch(`/${userId}/toggle`, request, {
      headers: getAuthHeaders(),
    });
    return response;
  });
