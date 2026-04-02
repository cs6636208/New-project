export type MethodKey =
  | "graphical"
  | "bisection"
  | "false-position"
  | "one-point-iteration"
  | "newton-raphson"
  | "secant";

export type Method = {
  id: string;
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

export type IterationRow = {
  iteration: number;
  error: number | null;
  [key: string]: number | string | null;
};

export type Run = {
  id: string;
  equation: string;
  xl: number;
  xr: number;
  root: number;
  epsilon: number;
  maxIterations: number;
  converged: boolean;
  createdAt: string;
  method: Method;
  iterations: IterationRow[];
};

export type MethodGroup = {
  categoryKey: string;
  categoryLabel: string;
  categoryOrder: number;
  methods: Method[];
};

