import { FormEvent, useEffect, useMemo, useState } from "react";
import { HistoryList } from "./components/HistoryList";
import { MethodCard } from "./components/MethodCard";
import { ResultsTable } from "./components/ResultsTable";
import { createRun, fetchMethods, fetchRuns } from "./lib/api";
import type { Method, Run } from "./types";

type FormState = {
  equation: string;
  xl: string;
  xr: string;
  epsilon: string;
  maxIterations: string;
};

const fallbackMethods: Method[] = [
  {
    id: "local-bisection",
    key: "bisection",
    title: "Bisection Method",
    description: "Root finding with interval halving and convergence tracking.",
    defaultEquation: "x^4 - 13"
  },
  {
    id: "local-false-position",
    key: "false-position",
    title: "False Position Method",
    description: "Root finding with linear interpolation inside the initial bracket.",
    defaultEquation: "x^3 - x - 2"
  }
];

const defaultForm: FormState = {
  equation: "x^4 - 13",
  xl: "1.5",
  xr: "2",
  epsilon: "0.00001",
  maxIterations: "50"
};

export default function App() {
  const [methods, setMethods] = useState<Method[]>(fallbackMethods);
  const [selectedMethod, setSelectedMethod] = useState<Method>(fallbackMethods[0]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [latestRun, setLatestRun] = useState<Run | null>(null);
  const [history, setHistory] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.allSettled([fetchMethods(), fetchRuns()]).then((results) => {
      const methodsResult = results[0];
      const runsResult = results[1];

      if (methodsResult.status === "fulfilled" && methodsResult.value.length > 0) {
        setMethods(methodsResult.value);
        setSelectedMethod(methodsResult.value[0]);
        setForm((current) => ({
          ...current,
          equation: methodsResult.value[0].defaultEquation
        }));
      }

      if (runsResult.status === "fulfilled") {
        setHistory(runsResult.value);
      }
    });
  }, []);

  const summary = useMemo(() => {
    if (!latestRun) {
      return {
        root: "0.000000",
        iterations: 0,
        status: "Awaiting run"
      };
    }

    return {
      root: latestRun.root.toFixed(6),
      iterations: latestRun.iterations.length,
      status: latestRun.converged ? "Converged" : "Stopped at max iteration"
    };
  }, [latestRun]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSelectMethod(method: Method) {
    setSelectedMethod(method);
    setForm((current) => ({
      ...current,
      equation: method.defaultEquation
    }));
    setMessage(`${method.title} selected`);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const run = await createRun(selectedMethod.key, {
        equation: form.equation,
        xl: Number(form.xl),
        xr: Number(form.xr),
        epsilon: Number(form.epsilon),
        maxIterations: Number(form.maxIterations)
      });

      setLatestRun(run);
      setHistory((current) => [run, ...current.filter((item) => item.id !== run.id)].slice(0, 6));
      setMessage("Calculation completed and saved to the database");
    } catch (submitError) {
      const nextMessage =
        submitError instanceof Error ? submitError.message : "An unexpected error occurred";
      setError(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReuse(run: Run) {
    setSelectedMethod(run.method);
    setForm({
      equation: run.equation,
      xl: String(run.xl),
      xr: String(run.xr),
      epsilon: String(run.epsilon),
      maxIterations: String(run.maxIterations)
    });
    setLatestRun(run);
    setMessage(`Loaded values from ${run.method.title}`);
    setError(null);
  }

  return (
    <div className="page-shell">
      <div className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Numerical Method Web App</span>
          <h1>Find the root of an equation with a complete full-stack workflow</h1>
          <p>
            This project bundles a client app, API server, database, Docker setup, Swagger
            documentation, and CI/CD into one numerical method workspace.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-tile">
            <span>Latest Root</span>
            <strong>{summary.root}</strong>
          </div>
          <div className="stat-tile">
            <span>Iterations</span>
            <strong>{summary.iterations}</strong>
          </div>
          <div className="stat-tile">
            <span>Status</span>
            <strong>{summary.status}</strong>
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>Select a Method</h2>
          <a href={`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/docs`} target="_blank" rel="noreferrer">
            Swagger Docs
          </a>
        </div>
        <div className="method-grid">
          {methods.map((method) => (
            <MethodCard
              key={method.id}
              method={method}
              selected={selectedMethod.key === method.key}
              onSelect={handleSelectMethod}
            />
          ))}
        </div>
      </section>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Input Parameters</h2>
            <span>{selectedMethod.title}</span>
          </div>

          <form className="solver-form" onSubmit={handleSubmit}>
            <label>
              <span>Equation f(x)</span>
              <input
                value={form.equation}
                onChange={(event) => updateField("equation", event.target.value)}
                placeholder="x^4 - 13"
              />
            </label>

            <div className="form-row">
              <label>
                <span>XL</span>
                <input
                  type="number"
                  step="any"
                  value={form.xl}
                  onChange={(event) => updateField("xl", event.target.value)}
                />
              </label>

              <label>
                <span>XR</span>
                <input
                  type="number"
                  step="any"
                  value={form.xr}
                  onChange={(event) => updateField("xr", event.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Epsilon</span>
                <input
                  type="number"
                  step="any"
                  value={form.epsilon}
                  onChange={(event) => updateField("epsilon", event.target.value)}
                />
              </label>

              <label>
                <span>Max Iterations</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.maxIterations}
                  onChange={(event) => updateField("maxIterations", event.target.value)}
                />
              </label>
            </div>

            <button className="primary-button" type="submit" disabled={isLoading}>
              {isLoading ? "Calculating..." : "Calculate and Save"}
            </button>
          </form>

          {message ? <div className="feedback success">{message}</div> : null}
          {error ? <div className="feedback error">{error}</div> : null}
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Calculation Result</h2>
            <span>{latestRun ? latestRun.method.title : "No run yet"}</span>
          </div>

          <div className="result-box">
            <span>Answer</span>
            <strong>{summary.root}</strong>
            <p>
              {latestRun
                ? `Equation ${latestRun.equation} on interval [${latestRun.xl}, ${latestRun.xr}]`
                : "No result available yet"}
            </p>
          </div>

          <ResultsTable rows={latestRun?.iterations ?? []} />
        </section>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>Recent History</h2>
          <span>Click any card to reuse its values</span>
        </div>
        <HistoryList runs={history} onReuse={handleReuse} />
      </section>
    </div>
  );
}
