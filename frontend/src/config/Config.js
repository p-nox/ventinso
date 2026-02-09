export const API_BASE_URL = "http://localhost:8083";

export const API_URLS = {
  // ----- Auth -----
  AUTH: `${API_BASE_URL}/api/auth`,

  // ----- Users -----
  USER: `${API_BASE_URL}/api/users`,
  AVATAR_FILE: (path) =>
    `${API_BASE_URL}/api/users/avatar/${path}`,

  // ----- Inventory -----
  INVENTORY: `${API_BASE_URL}/api/inventory`,
  AGGREGATED: `${API_BASE_URL}/api/aggregated`,
  IMAGE_FILE: (path) =>
    `${API_BASE_URL}/api/images/${path}`,

  PREVIEW: `${API_BASE_URL}/api/preview`,

  // ----- Ratings -----
  RATING: `${API_BASE_URL}/api/ratings`,

  // ----- Wallet / Payments / Orders -----
  WALLET: `${API_BASE_URL}/api/wallet`,
  ORDER: `${API_BASE_URL}/api/orders`,
  PAYMENT: `${API_BASE_URL}/api/payments`,

  // ----- Notifications -----
  NOTIFICATION: `${API_BASE_URL}/api/notifications`,
  NOTIFICATION_PREFERENCES: `${API_BASE_URL}/api/notification-preferences`,
  NOTIFICATION_STREAM: `${API_BASE_URL}/api/notifications/stream`,

  // ----- Chat -----
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_SOCKET: `${API_BASE_URL}/chats`,
  CHAT_MEDIA: (chatId, file) =>
    `${API_BASE_URL}/api/chat/uploads/chat/media/${chatId}/${file}`,
};


export const Paths = {
  // General / Auth
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Users
  PROFILE: (userId) => `/user/${userId}`,

  // Items
  ITEM: (itemId) => `/item/${itemId}`,
  ADD_ITEM: (itemId) => (itemId ? `/item/${itemId}/add-item` : '/add-item'),

  // Orders
  ORDER: (orderId) => `/order/${orderId}`,
  ORDERS: {
    ROOT: (userId) => `/account/${userId}/orders`,
    PURCHASES: (userId) => `/account/${userId}/orders/purchases`,
    SALES: (userId) => `/account/${userId}/orders/sales`,
  },


  // Account / User Settings
  ACCOUNT: (userId) => `/account/${userId}`,
  WALLET: (userId) => `/account/${userId}/wallet`,
  NOTIFICATIONS: (userId) => `/account/${userId}/notifications`,

  // Chat
  CHAT: (chatId) => `/messages/${chatId}`,
  CHAT_FULL: '/chat',
};



export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `${token}` } : {};
};

export const APP = {
  NAME: "Ventinso",
  LOGO_URL: "/assets/logo.png",
  PLACEHOLDER_IMG: "/assets/placeholder.png",
};
