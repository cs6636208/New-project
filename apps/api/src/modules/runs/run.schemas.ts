import { z } from "zod";

export const createRunSchema = z.object({
  equation: z.string().min(1, "Equation is required."),
  primaryInput: z.coerce.number().optional(),
  secondaryInput: z.coerce.number().optional(),
  xl: z.coerce.number().optional(),
  xr: z.coerce.number().optional(),
  epsilon: z.coerce.number().positive().default(0.000001),
  maxIterations: z.coerce.number().int().min(1).max(200).default(100)
})
  .superRefine((value, context) => {
    if (value.primaryInput === undefined && value.xl === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "primaryInput is required",
        path: ["primaryInput"]
      });
    }
  })
  .transform((value) => ({
    equation: value.equation,
    primaryInput: value.primaryInput ?? value.xl!,
    secondaryInput: value.secondaryInput ?? value.xr,
    epsilon: value.epsilon,
    maxIterations: value.maxIterations
  }));

export type CreateRunInput = z.infer<typeof createRunSchema>;
