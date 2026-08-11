import { asyncHandler } from "../utils/asyncHandler.js";
import * as uploadService from "../services/uploadService.js";

export const presignUpload = asyncHandler(async (req, res) => {
  res.json(await uploadService.createPresignedUpload(req.body));
});

export const listUploads = asyncHandler(async (req, res) => {
  res.json({ images: await uploadService.listUploads(req.query.folder) });
});
