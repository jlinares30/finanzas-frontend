import http from "./http";

export const postLogin = (data) => http.post("/auth/login", data);
export const postRegister = (data) => http.post("/auth/register", data);
export const postSocioeconomico = (data) => http.post("/cliente/socioeconomico", data);

export const getProfile = (id) => http.get(`/cliente/profile/${id}`);
export const updateProfile = (data) => http.put(`/cliente/profile/${data.id}`, data);
export const updateSocioeconomico = (data) => http.put(`/cliente/socioeconomico/${data.id}`, data); 