import { evaluate } from "mathjs";
import { prisma } from "../../lib/prisma.js";
import type { CreateRunInput } from "./run.schemas.js";

type SupportedMethod = "bisection" | "false-position";

type IterationRow = {
  iteration: number;
  xl: number;
  xr: number;
  xm: number;
  fxm: number;
  error: number | null;
};

type SolveResult = {
  root: number;
  iterations: IterationRow[];
  converged: boolean;
};

function fx(equation: string, x: number) {
  return evaluate(equation, { x }) as number;
}

function percentageError(previous: number, current: number) {
  if (current === 0) {
    return Math.abs(current - previous);
  }

  return Math.abs((current - previous) / current) * 100;
}

function assertValidBracket(equation: string, xl: number, xr: number) {
  const fxl = fx(equation, xl);
  const fxr = fx(equation, xr);

  if (fxl * fxr > 0) {
    throw new Error("XL and XR must bracket a root.");
  }

  return { fxl, fxr };
}

function solveWithBisection(input: CreateRunInput): SolveResult {
  let { xl, xr } = input;
  let { fxl, fxr } = assertValidBracket(input.equation, xl, xr);
  let previousXm = 0;
  const iterations: IterationRow[] = [];
  let converged = false;
  let xm = xl;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    xm = (xl + xr) / 2;
    const fxm = fx(input.equation, xm);
    const error = iteration === 1 ? null : percentageError(previousXm, xm);

    iterations.push({ iteration, xl, xr, xm, fxm, error });

    if (Math.abs(fxm) <= input.epsilon || (error !== null && error <= input.epsilon)) {
      converged = true;
      break;
    }

    if (fxm * fxr < 0) {
      xl = xm;
      fxl = fxm;
    } else {
      xr = xm;
      fxr = fxm;
    }

    previousXm = xm;
  }

  return { root: xm, iterations, converged };
}

function solveWithFalsePosition(input: CreateRunInput): SolveResult {
  let { xl, xr } = input;
  let { fxl, fxr } = assertValidBracket(input.equation, xl, xr);
  let previousXm = 0;
  const iterations: IterationRow[] = [];
  let converged = false;
  let xm = xl;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    xm = (xl * fxr - xr * fxl) / (fxr - fxl);
    const fxm = fx(input.equation, xm);
    const error = iteration === 1 ? null : percentageError(previousXm, xm);

    iterations.push({ iteration, xl, xr, xm, fxm, error });

    if (Math.abs(fxm) <= input.epsilon || (error !== null && error <= input.epsilon)) {
      converged = true;
      break;
    }

    if (fxm * fxr < 0) {
      xl = xm;
      fxl = fxm;
    } else {
      xr = xm;
      fxr = fxm;
    }

    previousXm = xm;
  }

  return { root: xm, iterations, converged };
}

function solve(methodKey: SupportedMethod, input: CreateRunInput) {
  if (methodKey === "false-position") {
    return solveWithFalsePosition(input);
  }

  return solveWithBisection(input);
}

export async function createRun(methodKey: SupportedMethod, input: CreateRunInput) {
  const method = await prisma.method.findUnique({
    where: { key: methodKey }
  });

  if (!method) {
    throw new Error(`Method ${methodKey} was not found.`);
  }

  const result = solve(methodKey, input);

  const savedRun = await prisma.computationRun.create({
    data: {
      methodId: method.id,
      equation: input.equation,
      xl: input.xl,
      xr: input.xr,
      root: result.root,
      epsilon: input.epsilon,
      maxIterations: input.maxIterations,
      converged: result.converged,
      iterations: result.iterations
    },
    include: {
      method: true
    }
  });

  return {
    ...savedRun,
    iterations: result.iterations
  };
}

export async function listRuns(limit = 10) {
  return prisma.computationRun.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      method: true
    }
  });
}

