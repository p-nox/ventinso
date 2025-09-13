import { API_URLS, getAuthHeaders } from "../config/Config";
import createApiClient from "./ApiHandler";

const { handle } = createApiClient(API_URLS.PAYMENT);

export const deposit = (userId, amount, returnUrl) =>
    handle(api => api.post(
        `/wallet/deposit/${userId}?amount=${amount}&returnUrl=${encodeURIComponent(returnUrl)}`,
        null,
        { headers: getAuthHeaders() }
    ));

export const getUserPayments = (userId) =>
    handle(api => api.get(
        `/user/${userId}`,
        { headers: getAuthHeaders() }
    ));
