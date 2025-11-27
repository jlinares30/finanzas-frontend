import { useAuthStore } from "../store/useAuthStore";

export const api = async (url, options = {}) => {
  const { token } = useAuthStore.getState();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response.json();
};
