import http from "./http";

export const getLocales = () => http.get("/catalogo/locales");
export const getLocalById = (id) => http.get(`/catalogo/locales/${id}`);
export const updateLocal = (id, data) => http.put(`/catalogo/locales/${id}`, data);
