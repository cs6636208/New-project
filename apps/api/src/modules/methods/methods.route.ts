import { Router } from "express";
import { listMethods } from "./methods.service.js";

const methodsRouter = Router();

methodsRouter.get("/", async (_request, response, next) => {
  try {
    const methods = await listMethods();
    response.json(methods);
  } catch (error) {
    next(error);
  }
});

export { methodsRouter };

