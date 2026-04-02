import type { Method, MethodGroup, MethodKey, Run } from "../types";

export const fallbackMethods: Method[] = [
  {
    id: "local-graphical",
    key: "graphical",
    categoryKey: "root-of-equation",
    categoryLabel: "Root Of Equation",
    categoryOrder: 1,
    orderIndex: 1,
    title: "Graphical Method",
    description: "Scan the interval, detect the local sign change, and refine the visual root estimate.",
    defaultEquation: "x^3 - x - 2",
    equationLabel: "Equation f(x)",
    primaryInputLabel: "Start X",
    secondaryInputLabel: "End X",
    secondaryInputNeeded: true,
    defaultPrimaryInput: 1,
    defaultSecondaryInput: 2
  },
  {
    id: "local-bisection",
    key: "bisection",
    categoryKey: "root-of-equation",
    categoryLabel: "Root Of Equation",
    categoryOrder: 1,
    orderIndex: 2,
    title: "Bisection Method",
    description: "Bracket the root and repeatedly halve the interval until the estimate converges.",
    defaultEquation: "x^4 - 13",
    equationLabel: "Equation f(x)",
    primaryInputLabel: "XL",
    secondaryInputLabel: "XR",
    secondaryInputNeeded: true,
    defaultPrimaryInput: 1.5,
    defaultSecondaryInput: 2
  },
  {
    id: "local-false-position",
    key: "false-position",
    categoryKey: "root-of-equation",
    categoryLabel: "Root Of Equation",
    categoryOrder: 1,
    orderIndex: 3,
    title: "False-Position Method",
    description: "Use the secant line inside the bracket to get a faster root estimate than simple halving.",
    defaultEquation: "x^3 - x - 2",
    equationLabel: "Equation f(x)",
    primaryInputLabel: "XL",
    secondaryInputLabel: "XR",
    secondaryInputNeeded: true,
    defaultPrimaryInput: 1,
    defaultSecondaryInput: 2
  },
  {
    id: "local-one-point",
    key: "one-point-iteration",
    categoryKey: "root-of-equation",
    categoryLabel: "Root Of Equation",
    categoryOrder: 1,
    orderIndex: 4,
    title: "One-Point Iteration Method",
    description: "Iterate with a rearranged g(x) function until the next estimate stabilizes.",
    defaultEquation: "(x + 2)^(1/3)",
    equationLabel: "Iteration g(x)",
    primaryInputLabel: "Initial X0",
    secondaryInputLabel: null,
    secondaryInputNeeded: false,
    defaultPrimaryInput: 1.5,
    defaultSecondaryInput: null
  },
  {
    id: "local-newton",
    key: "newton-raphson",
    categoryKey: "simple-fixed-point-iteration",
    categoryLabel: "Simple-Fixed Point Iteration",
    categoryOrder: 2,
    orderIndex: 1,
    title: "Newton Raphson Method",
    description: "Apply tangent-based updates using the numerical derivative around the current estimate.",
    defaultEquation: "x^3 - x - 2",
    equationLabel: "Equation f(x)",
    primaryInputLabel: "Initial X0",
    secondaryInputLabel: null,
    secondaryInputNeeded: false,
    defaultPrimaryInput: 1.5,
    defaultSecondaryInput: null
  },
  {
    id: "local-secant",
    key: "secant",
    categoryKey: "simple-fixed-point-iteration",
    categoryLabel: "Simple-Fixed Point Iteration",
    categoryOrder: 2,
    orderIndex: 2,
    title: "Secant Method",
    description: "Approximate the derivative from two starting points and update the root estimate iteratively.",
    defaultEquation: "x^3 - x - 2",
    equationLabel: "Equation f(x)",
    primaryInputLabel: "X0",
    secondaryInputLabel: "X1",
    secondaryInputNeeded: true,
    defaultPrimaryInput: 1,
    defaultSecondaryInput: 2
  }
];

export function groupMethods(methods: Method[]): MethodGroup[] {
  const bucket = new Map<string, MethodGroup>();

  for (const method of methods) {
    const existing = bucket.get(method.categoryKey);

    if (existing) {
      existing.methods.push(method);
      continue;
    }

    bucket.set(method.categoryKey, {
      categoryKey: method.categoryKey,
      categoryLabel: method.categoryLabel,
      categoryOrder: method.categoryOrder,
      methods: [method]
    });
  }

  return [...bucket.values()]
    .sort((left, right) => left.categoryOrder - right.categoryOrder)
    .map((group) => ({
      ...group,
      methods: [...group.methods].sort((left, right) => left.orderIndex - right.orderIndex)
    }));
}

export function getMethodTableColumns(methodKey: MethodKey) {
  switch (methodKey) {
    case "graphical":
      return [
        { key: "iteration", label: "Iteration" },
        { key: "startX", label: "Start X" },
        { key: "endX", label: "End X" },
        { key: "estimate", label: "Estimate" },
        { key: "fEstimate", label: "f(Estimate)" },
        { key: "error", label: "Error (%)" }
      ];
    case "one-point-iteration":
      return [
        { key: "iteration", label: "Iteration" },
        { key: "xCurrent", label: "X Current" },
        { key: "xNext", label: "X Next" },
        { key: "residual", label: "g(x)-x" },
        { key: "error", label: "Error (%)" }
      ];
    case "newton-raphson":
      return [
        { key: "iteration", label: "Iteration" },
        { key: "xCurrent", label: "X Current" },
        { key: "fx", label: "f(X)" },
        { key: "derivative", label: "f'(X)" },
        { key: "xNext", label: "X Next" },
        { key: "error", label: "Error (%)" }
      ];
    case "secant":
      return [
        { key: "iteration", label: "Iteration" },
        { key: "xPrev", label: "X Prev" },
        { key: "xCurrent", label: "X Current" },
        { key: "fxCurrent", label: "f(X Current)" },
        { key: "xNext", label: "X Next" },
        { key: "error", label: "Error (%)" }
      ];
    default:
      return [
        { key: "iteration", label: "Iteration" },
        { key: "xl", label: "XL" },
        { key: "xr", label: "XR" },
        { key: "xm", label: "XM" },
        { key: "fxm", label: "f(XM)" },
        { key: "error", label: "Error (%)" }
      ];
  }
}

export function describeRunInputs(method: Method, run: Run) {
  const parts = [`${method.primaryInputLabel}: ${run.xl}`];

  if (method.secondaryInputNeeded && method.secondaryInputLabel) {
    parts.push(`${method.secondaryInputLabel}: ${run.xr}`);
  }

  return parts.join(" | ");
}

