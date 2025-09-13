import createApiClient from "./ApiHandler";
import { API_URLS, getAuthHeaders } from "@config/Config";

const { handle } = createApiClient(API_URLS.ORDER);

export const getOrder = (id) => {
    return handle(api => api.get(`/order/${id}`, { headers: getAuthHeaders() }));
};

export const getAllOrdersAsSeller = (id) => {
    return handle(api => api.get(`/user/${id}/sales`, { headers: getAuthHeaders() }));
};

export const getAllOrdersAsBuyer = (id) => {
    return handle(api => api.get(`/user/${id}/purchases`, { headers: getAuthHeaders() }));
};

export const sendOrder = (orderRequest) => {
    return handle(api => api.post(``, orderRequest, {
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        }
    }));
};

export const confirmOrderProgress = (id, userId) => {
    return handle(api => api.patch(`/${id}/confirm/${userId}`, null, { headers: getAuthHeaders() }));
};
