import http from "./http";

export const crearPlanPago = (data) =>
  http.post("/plan-pagos", data);

export const getCuotas = (planId) =>
  http.get(`/plan-pagos/${planId}/cuotas`);
