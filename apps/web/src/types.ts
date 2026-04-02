export type Method = {
  id: string;
  key: "bisection" | "false-position";
  title: string;
  description: string;
  defaultEquation: string;
};

export type IterationRow = {
  iteration: number;
  xl: number;
  xr: number;
  xm: number;
  fxm: number;
  error: number | null;
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

