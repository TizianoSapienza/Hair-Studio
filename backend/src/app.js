import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { deepCamelCase } from "./utils/caseConvert.js";
import apiRoutes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(cors({ origin: env.frontendOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(attachUser);

  //Confine snake_case (DB) -> camelCase (HTTP): i service restituiscono righe grezze del
  //DB, qui vengono convertite una sola volta prima di uscire, per ogni risposta JSON.
  app.use((_req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => originalJson(deepCamelCase(body));
    next();
  });

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
