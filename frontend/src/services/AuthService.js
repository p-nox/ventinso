import createApiClient from "./ApiHandler";
import { API_URLS } from "@config/Config";

const { handle } = createApiClient(API_URLS.AUTH);
const { handle: handleAggregated } = createApiClient(API_URLS.AGGREGATED);

export const registerAPICall = (registerObj) =>
  handle(api => api.post('register', registerObj));

export const loginAPICall = (usernameOrEmail, password) => {
  const token = 'Basic ' + window.btoa(usernameOrEmail + ":" + password);

  return handleAggregated(api => 
    api.post('/me', { usernameOrEmail, password }, {
      headers: { Authorization: token }
    })
    .then(res => {
      console.log("[loginAPICall] Response:", res);
      return res;
    })
    .catch(err => {
      console.error("[loginAPICall] Error:", err);
      throw err;
    })
  );
};

export const emailChange = (userId, payload) =>
  handle(api => api.patch(`user/${userId}/email`, payload));

export const passwordChange = (userId, payload) =>
  handle(api => api.patch(`user/${userId}/password`, payload));




export const nameChange = (userId, updatedEmail) => 
  handle(api => api.patch(`user/${userId}/email`, { email: updatedEmail }));


