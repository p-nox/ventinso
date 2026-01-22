import createApiClient from "./ApiHandler";
import { API_URLS, getAuthHeaders } from "@config/Config";

const { handle } = createApiClient(API_URLS.CHAT);

export const getUserChats = (userId) => {
  const { handle } = createApiClient(API_URLS.AGGREGATED);
  return handle(async api => {
    const response = await api.get(`/user-chats/${userId}`, { headers: getAuthHeaders() });
    console.log("[ChatService:getUserChats] Response:", response.data);
    return response;
  });
};


export const getChatMessages = (chatId, userId) => {
  return handle(async api => {
    const response = await api.get(`/chat-messages/${chatId}`, {
      headers: getAuthHeaders(),
      params: { userId },
    });
    console.log('[getChatMessages] Response:', response.data);
    return response;
  });
};

export const initChat = (messageRequest) => {
  return handle(async api => {
    console.log("[initChat] Sending request:", messageRequest);
    const response = await api.post("/init-chat", messageRequest, { headers: getAuthHeaders() });
    console.log("[initChat] Response:", response.data);
    return response;
  });
};

export const sendMessage = (messageRequest, files = []) => {
  const formData = buildFormData(messageRequest, files);

  return handle(api => {
    console.log("[sendMessage] Request:", messageRequest, "Files:", files.map(f => f.name));

    return api.post("/messages", formData, {
      headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
    }).then(response => {
      console.log("[sendMessage] Response data:", response.data);
      return response;
    });
  });
};

export const deleteChat = (chatId, userId) => {
  return handle(api => {
    console.log(`[deleteChat] Deleting chatId=${chatId} for userId=${userId}`);
    return api.delete(`/${chatId}/${userId}`, { headers: getAuthHeaders() });
  });
};


function buildFormData(messageRequest, files = []) {
  const formData = new FormData();
  formData.append("message", new Blob([JSON.stringify(messageRequest)], { type: "application/json" }));
  files.forEach(file => formData.append("files", file));

  return formData;
}
