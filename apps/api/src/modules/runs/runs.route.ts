import { Router } from "express";
import { ZodError } from "zod";
import { createRunSchema } from "./run.schemas.js";
import { createRun, listRuns } from "./runs.service.js";

const runsRouter = Router();

runsRouter.get("/", async (request, response, next) => {
  try {
    const limit = Number(request.query.limit ?? 10);
    const runs = await listRuns(Number.isNaN(limit) ? 10 : limit);
    response.json(runs);
  } catch (error) {
    next(error);
  }
});

runsRouter.post("/:methodKey", async (request, response, next) => {
  try {
    const methodKey = request.params.methodKey as "bisection" | "false-position";
    const payload = createRunSchema.parse(request.body);
    const run = await createRun(methodKey, payload);
    response.status(201).json(run);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Invalid payload",
        issues: error.flatten()
      });
      return;
    }

    next(error);
  }
});

export { runsRouter };

