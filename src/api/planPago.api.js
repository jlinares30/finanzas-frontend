import http from "./http";

export const crearPlanPago = (data) =>
  http.post("/plan-pagos", data);

export const getCuotas = (planId) =>
  http.get(`/plan-pagos/${planId}/cuotas`);

export const getAllPlanPagosByUserId = (userId) =>
  http.get(`/plan-pagos/user/${userId}`);

export const deletePlanPago = (planId) =>
  http.delete(`/plan-pagos/${planId}`);
