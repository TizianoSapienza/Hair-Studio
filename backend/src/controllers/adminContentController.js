import { asyncHandler } from "../utils/asyncHandler.js";
import * as businessInfoService from "../services/businessInfoService.js";
import * as homepageContentService from "../services/homepageContentService.js";
import * as userService from "../services/userService.js";

export const getBusinessInfo = asyncHandler(async (_req, res) => {
  res.json({ businessInfo: await businessInfoService.getBusinessInfo() });
});

export const updateBusinessInfo = asyncHandler(async (req, res) => {
  res.json({ businessInfo: await businessInfoService.upsertBusinessInfo(req.body) });
});

export const getHomepageContent = asyncHandler(async (_req, res) => {
  res.json({ homepageContent: await homepageContentService.getHomepageContent() });
});

export const updateHomepageContent = asyncHandler(async (req, res) => {
  res.json({ homepageContent: await homepageContentService.upsertHomepageContent(req.body) });
});

export const listClients = asyncHandler(async (_req, res) => {
  res.json({ users: await userService.listAllUsers() });
});
