import http from "./http";

export const getLocales = () => http.get("/catalogo/locales");
export const getLocalById = (id) => http.get(`/catalogo/locales/${id}`);
