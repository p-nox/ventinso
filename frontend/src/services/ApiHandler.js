import axios from "axios";

const createApiClient = (baseURL) => {
  const client = axios.create({ baseURL });

  const handle = async (requestFunc) => {
    try {
      const response = await requestFunc(client);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { handle };
};

export default createApiClient;
