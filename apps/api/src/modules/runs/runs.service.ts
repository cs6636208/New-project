import { evaluate } from "mathjs";
import { prisma } from "../../lib/prisma.js";
import { methodCatalog, supportedMethodKeys, type MethodKey } from "../methods/method-catalog.js";
import type { CreateRunInput } from "./run.schemas.js";

type IterationValue = number | string | null;

type IterationRow = {
  iteration: number;
  error: number | null;
  [key: string]: IterationValue;
};

type SolveResult = {
  root: number;
  iterations: IterationRow[];
  converged: boolean;
};

function fx(equation: string, x: number) {
  return Number(evaluate(equation, { x }));
}

function percentageError(previous: number, current: number) {
  if (current === 0) {
    return Math.abs(current - previous);
  }

  return Math.abs((current - previous) / current) * 100;
}

function numericDerivative(equation: string, x: number) {
  const h = 0.000001;
  return (fx(equation, x + h) - fx(equation, x - h)) / (2 * h);
}

function getMethodDefinition(methodKey: string) {
  const method = methodCatalog.find((entry) => entry.key === methodKey);

  if (!method) {
    throw new Error(`Method ${methodKey} was not found.`);
  }

  return method;
}

function getSecondaryInput(input: CreateRunInput, message: string) {
  if (input.secondaryInput === undefined) {
    throw new Error(message);
  }

  return input.secondaryInput;
}

function normalizeRange(a: number, b: number) {
  return a <= b ? { left: a, right: b } : { left: b, right: a };
}

function assertValidBracket(equation: string, xl: number, xr: number) {
  const fxl = fx(equation, xl);
  const fxr = fx(equation, xr);

  if (fxl * fxr > 0) {
    throw new Error("The selected interval must bracket a root.");
  }

  return { fxl, fxr };
}

function solveWithGraphical(input: CreateRunInput): SolveResult {
  const secondInput = getSecondaryInput(input, "Graphical Method requires a start X and end X.");
  let { left, right } = normalizeRange(input.primaryInput, secondInput);
  let previousEstimate: number | null = null;
  let root = left;
  const iterations: IterationRow[] = [];
  let converged = false;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    const segments = 10;
    const step = (right - left) / segments;

    if (step === 0) {
      break;
    }

    let bestX = left;
    let bestFx = fx(input.equation, bestX);
    let nextLeft = left;
    let nextRight = right;
    let signChangeDetected = false;
    let previousX = left;
    let previousFx = bestFx;

    for (let index = 1; index <= segments; index += 1) {
      const currentX = index === segments ? right : left + step * index;
      const currentFx = fx(input.equation, currentX);

      if (Math.abs(currentFx) < Math.abs(bestFx)) {
        bestX = currentX;
        bestFx = currentFx;
      }

      if (!signChangeDetected && previousFx * currentFx <= 0) {
        signChangeDetected = true;
        nextLeft = previousX;
        nextRight = currentX;

        if (currentFx !== previousFx) {
          bestX = previousX - (previousFx * (currentX - previousX)) / (currentFx - previousFx);
          bestFx = fx(input.equation, bestX);
        }
      }

      previousX = currentX;
      previousFx = currentFx;
    }

    const error = previousEstimate === null ? null : percentageError(previousEstimate, bestX);
    iterations.push({
      iteration,
      startX: left,
      endX: right,
      estimate: bestX,
      fEstimate: bestFx,
      error
    });

    root = bestX;

    if (Math.abs(bestFx) <= input.epsilon || (error !== null && error <= input.epsilon)) {
      converged = true;
      break;
    }

    if (signChangeDetected) {
      left = nextLeft;
      right = nextRight;
    } else {
      left = bestX - step;
      right = bestX + step;
    }

    previousEstimate = bestX;
  }

  return { root, iterations, converged };
}

function solveWithBisection(input: CreateRunInput): SolveResult {
  const secondInput = getSecondaryInput(input, "Bisection Method requires XL and XR.");
  let { left: xl, right: xr } = normalizeRange(input.primaryInput, secondInput);
  let { fxr } = assertValidBracket(input.equation, xl, xr);
  let previousXm: number | null = null;
  let root = xl;
  const iterations: IterationRow[] = [];
  let converged = false;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    const xm = (xl + xr) / 2;
    const fxm = fx(input.equation, xm);
    const error = previousXm === null ? null : percentageError(previousXm, xm);

    iterations.push({ iteration, xl, xr, xm, fxm, error });
    root = xm;

    if (Math.abs(fxm) <= input.epsilon || (error !== null && error <= input.epsilon)) {
      converged = true;
      break;
    }

    if (fxm * fxr < 0) {
      xl = xm;
    } else {
      xr = xm;
      fxr = fxm;
    }

    previousXm = xm;
  }

  return { root, iterations, converged };
}

function solveWithFalsePosition(input: CreateRunInput): SolveResult {
  const secondInput = getSecondaryInput(input, "False-Position Method requires XL and XR.");
  let { left: xl, right: xr } = normalizeRange(input.primaryInput, secondInput);
  let { fxl, fxr } = assertValidBracket(input.equation, xl, xr);
  let previousXm: number | null = null;
  let root = xl;
  const iterations: IterationRow[] = [];
  let converged = false;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    const denominator = fxr - fxl;

    if (Math.abs(denominator) <= Number.EPSILON) {
      throw new Error("False-Position Method encountered a zero denominator.");
    }

    const xm = (xl * fxr - xr * fxl) / denominator;
    const fxm = fx(input.equation, xm);
    const error = previousXm === null ? null : percentageError(previousXm, xm);

    iterations.push({ iteration, xl, xr, xm, fxm, error });
    root = xm;

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

  return { root, iterations, converged };
}

function solveWithOnePointIteration(input: CreateRunInput): SolveResult {
  let current = input.primaryInput;
  let root = current;
  const iterations: IterationRow[] = [];
  let converged = false;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    const next = fx(input.equation, current);
    const residual = next - current;
    const error = percentageError(current, next);

    iterations.push({
      iteration,
      xCurrent: current,
      xNext: next,
      residual,
      error
    });

    root = next;

    if (Math.abs(residual) <= input.epsilon || error <= input.epsilon) {
      converged = true;
      break;
    }

    current = next;
  }

  return { root, iterations, converged };
}

function solveWithNewtonRaphson(input: CreateRunInput): SolveResult {
  let current = input.primaryInput;
  let root = current;
  const iterations: IterationRow[] = [];
  let converged = false;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    const fxCurrent = fx(input.equation, current);
    const derivative = numericDerivative(input.equation, current);

    if (Math.abs(derivative) <= Number.EPSILON) {
      throw new Error("Newton Raphson Method encountered a zero derivative.");
    }

    const next = current - fxCurrent / derivative;
    const error = percentageError(current, next);

    iterations.push({
      iteration,
      xCurrent: current,
      fx: fxCurrent,
      derivative,
      xNext: next,
      error
    });

    root = next;

    if (Math.abs(fx(input.equation, next)) <= input.epsilon || error <= input.epsilon) {
      converged = true;
      break;
    }

    current = next;
  }

  return { root, iterations, converged };
}

function solveWithSecant(input: CreateRunInput): SolveResult {
  let previous = input.primaryInput;
  let current = getSecondaryInput(input, "Secant Method requires X0 and X1.");
  let root = current;
  const iterations: IterationRow[] = [];
  let converged = false;

  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    const fPrevious = fx(input.equation, previous);
    const fCurrent = fx(input.equation, current);
    const denominator = fCurrent - fPrevious;

    if (Math.abs(denominator) <= Number.EPSILON) {
      throw new Error("Secant Method encountered a zero denominator.");
    }

    const next = current - (fCurrent * (current - previous)) / denominator;
    const error = percentageError(current, next);

    iterations.push({
      iteration,
      xPrev: previous,
      xCurrent: current,
      xNext: next,
      fxCurrent: fCurrent,
      error
    });

    root = next;

    if (Math.abs(fx(input.equation, next)) <= input.epsilon || error <= input.epsilon) {
      converged = true;
      break;
    }

    previous = current;
    current = next;
  }

  return { root, iterations, converged };
}

function solve(methodKey: MethodKey, input: CreateRunInput) {
  switch (methodKey) {
    case "graphical":
      return solveWithGraphical(input);
    case "bisection":
      return solveWithBisection(input);
    case "false-position":
      return solveWithFalsePosition(input);
    case "one-point-iteration":
      return solveWithOnePointIteration(input);
    case "newton-raphson":
      return solveWithNewtonRaphson(input);
    case "secant":
      return solveWithSecant(input);
    default:
      throw new Error(`Method ${methodKey} is not supported.`);
  }
}

export async function createRun(methodKey: string, input: CreateRunInput) {
  if (!supportedMethodKeys.has(methodKey as MethodKey)) {
    throw new Error(`Method ${methodKey} was not found.`);
  }

  const method = await prisma.method.findUnique({
    where: { key: methodKey }
  });

  if (!method) {
    throw new Error(`Method ${methodKey} was not found.`);
  }

  const methodDefinition = getMethodDefinition(methodKey);
  const result = solve(methodKey as MethodKey, input);

  const savedRun = await prisma.computationRun.create({
    data: {
      methodId: method.id,
      equation: input.equation,
      xl: input.primaryInput,
      xr: methodDefinition.secondaryInputNeeded ? input.secondaryInput ?? input.primaryInput : input.primaryInput,
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
