import http from "./http";

export const getIndicadores = (planId) =>
  http.get(`/indicador/${planId}`);
