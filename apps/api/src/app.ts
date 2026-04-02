import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { healthRouter } from "./modules/health/health.route.js";
import { methodsRouter } from "./modules/methods/methods.route.js";
import { runsRouter } from "./modules/runs/runs.route.js";
import { swaggerSpec } from "./swagger/spec.js";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL
  })
);
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    name: "Numerical Method API",
    docs: "/api/docs",
    health: "/api/health"
  });
});

app.use("/api/health", healthRouter);
app.use("/api/methods", methodsRouter);
app.use("/api/runs", runsRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_request, response) => {
  response.json(swaggerSpec);
});

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  response.status(400).json({
    message: error.message || "Unexpected error"
  });
});

