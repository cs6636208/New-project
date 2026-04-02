import { z } from "zod";

export const createRunSchema = z.object({
  equation: z.string().min(1, "Equation is required."),
  xl: z.coerce.number(),
  xr: z.coerce.number(),
  epsilon: z.coerce.number().positive().default(0.00001),
  maxIterations: z.coerce.number().int().min(1).max(100).default(50)
});

export type CreateRunInput = z.infer<typeof createRunSchema>;

