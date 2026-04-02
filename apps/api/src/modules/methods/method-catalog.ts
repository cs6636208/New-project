export type MethodKey =
  | "graphical"
  | "bisection"
  | "false-position"
  | "one-point-iteration"
  | "newton-raphson"
  | "secant";

export type MethodCatalogItem = {
  key: MethodKey;
  categoryKey: string;
  categoryLabel: string;
  categoryOrder: number;
  orderIndex: number;
  title: string;
  description: string;
  defaultEquation: string;
  equationLabel: string;
  primaryInputLabel: string;
  secondaryInputLabel: string | null;
  secondaryInputNeeded: boolean;
  defaultPrimaryInput: number;
  defaultSecondaryInput: number | null;
};

export const methodCatalog: MethodCatalogItem[] = [
  {
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

export const supportedMethodKeys = new Set(methodCatalog.map((method) => method.key));

