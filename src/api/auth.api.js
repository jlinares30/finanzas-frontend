import http from "./http";

export const postLogin = (data) => http.post("/auth/login", data);
export const postRegister = (data) => http.post("/auth/register", data);
export const postSocioeconomico = (data) => http.post("/cliente/socioeconomico", data);