export const API_BASE_URL = "http://localhost:8083";

export const API_URLS = {
  INVENTORY: `${API_BASE_URL}/api/inventory`,
  AGGREGATED: `${API_BASE_URL}/api/aggregated`,
  IMAGE: `${API_BASE_URL}/api/images`,
  USER: `${API_BASE_URL}/api/users`,
  RATING: `${API_BASE_URL}/api/ratings`,
  WALLET: `${API_BASE_URL}/api/wallet`,
  ORDER: `${API_BASE_URL}/api/orders`,
  PAYMENT: `${API_BASE_URL}/api/payments`,
  AUTH: `${API_BASE_URL}/api/auth`,
  NOTIFICATION: `${API_BASE_URL}/api/notifications`,
  PREVIEW: `${API_BASE_URL}/api/preview`,
};

export const Paths = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: (userId) => `/user/${userId}`,
  ITEM: (itemId) => `/item/${itemId}`,
  ORDER: (orderId) => `/order/${orderId}`,
  WALLET: '/wallet',
  ORDERS_HISTORY: '/orders-history',
  ACCOUNT: (userId) => `/account/${userId}`,
  ADD_ITEM: '/add-item'
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `${token}` } : {};
}; 

