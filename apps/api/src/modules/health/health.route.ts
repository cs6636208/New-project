import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    status: "ok",
    service: "numerical-method-api",
    timestamp: new Date().toISOString()
  });
});

export { healthRouter };

