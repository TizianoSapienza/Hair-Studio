import { asyncHandler } from "../utils/asyncHandler.js";
import * as serviceService from "../services/serviceService.js";
import { notFound } from "../utils/AppError.js";

export const listServices = asyncHandler(async (_req, res) => {
  res.json({ services: await serviceService.listAllServices() });
});

export const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.body);
  res.status(201).json({ service });
});

export const reorderServices = asyncHandler(async (req, res) => {
  res.json({ services: await serviceService.reorderServices(req.body.orderedIds) });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.body, req.user.id);
  if (!service) throw notFound("Servizio non trovato");
  res.json({ service });
});

export const deleteService = asyncHandler(async (req, res) => {
  await serviceService.deleteService(req.params.id);
  res.status(204).end();
});

export const getServicePriceHistory = asyncHandler(async (req, res) => {
  res.json({ history: await serviceService.getServicePriceHistory(req.params.id) });
});
