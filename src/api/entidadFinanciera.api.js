import http from "./http";

export const getEntidades = () => http.get("/entidad");
export const getEntidadById = (id) => http.get(`/entidad/${id}`);
