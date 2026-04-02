import { FormEvent, useEffect, useMemo, useState } from "react";
import { ErrorChart } from "./components/ErrorChart";
import { HistoryList } from "./components/HistoryList";
import { MethodCard } from "./components/MethodCard";
import { ResultsTable } from "./components/ResultsTable";
import { createRun, fetchMethods, fetchRuns } from "./lib/api";
import { describeRunInputs, fallbackMethods, groupMethods } from "./lib/method-config";
import type { Method, Run } from "./types";

type FormState = {
  equation: string;
  primaryInput: string;
  secondaryInput: string;
  epsilon: string;
  maxIterations: string;
};

function createFormState(method: Method): FormState {
  return {
    equation: method.defaultEquation,
    primaryInput: String(method.defaultPrimaryInput),
    secondaryInput: method.defaultSecondaryInput === null ? "" : String(method.defaultSecondaryInput),
    epsilon: "0.000001",
    maxIterations: "100"
  };
}

export default function App() {
  const [methods, setMethods] = useState<Method[]>(fallbackMethods);
  const [selectedMethod, setSelectedMethod] = useState<Method>(fallbackMethods[0]);
  const [form, setForm] = useState<FormState>(createFormState(fallbackMethods[0]));
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
        setForm(createFormState(methodsResult.value[0]));
      }

      if (runsResult.status === "fulfilled") {
        setHistory(runsResult.value);
      }
    });
  }, []);

  const methodGroups = useMemo(() => groupMethods(methods), [methods]);

  const summary = useMemo(() => {
    const latestError = latestRun?.iterations[latestRun.iterations.length - 1]?.error;

    return {
      root: latestRun ? latestRun.root.toFixed(6) : "0.000000",
      iterations: latestRun?.iterations.length ?? 0,
      status: latestRun ? (latestRun.converged ? "Converged" : "Stopped at max iteration") : "Awaiting run",
      error: typeof latestError === "number" ? latestError.toExponential(2) : "n/a"
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
    setForm(createFormState(method));
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
        primaryInput: Number(form.primaryInput),
        secondaryInput: selectedMethod.secondaryInputNeeded ? Number(form.secondaryInput) : undefined,
        epsilon: Number(form.epsilon),
        maxIterations: Number(form.maxIterations)
      });

      setLatestRun(run);
      setHistory((current) => [run, ...current.filter((item) => item.id !== run.id)].slice(0, 8));
      setMessage("Calculation completed and saved to the database");
    } catch (submitError) {
      const nextMessage = submitError instanceof Error ? submitError.message : "An unexpected error occurred";
      setError(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReuse(run: Run) {
    setSelectedMethod(run.method);
    setForm({
      equation: run.equation,
      primaryInput: String(run.xl),
      secondaryInput: run.method.secondaryInputNeeded ? String(run.xr) : "",
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
          <h1>Grouped numerical methods with dynamic inputs and error charts</h1>
          <p>
            Explore root-finding and iteration methods, switch between categories, store each run in the database, and review convergence with a visual error graph.
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
            <span>Final Error</span>
            <strong>{summary.error}</strong>
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>Method Categories</h2>
          <a href={`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/docs`} target="_blank" rel="noreferrer">
            Swagger Docs
          </a>
        </div>

        <div className="category-stack">
          {methodGroups.map((group) => (
            <section key={group.categoryKey} className="category-block">
              <div className="category-heading">
                <span>{group.categoryOrder}</span>
                <h3>{group.categoryLabel}</h3>
              </div>
              <div className="method-grid">
                {group.methods.map((method) => (
                  <MethodCard
                    key={method.id}
                    method={method}
                    selected={selectedMethod.key === method.key}
                    onSelect={handleSelectMethod}
                  />
                ))}
              </div>
            </section>
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
              <span>{selectedMethod.equationLabel}</span>
              <input
                value={form.equation}
                onChange={(event) => updateField("equation", event.target.value)}
                placeholder={selectedMethod.defaultEquation}
              />
            </label>

            <div className={`form-row ${selectedMethod.secondaryInputNeeded ? "" : "single-column"}`}>
              <label>
                <span>{selectedMethod.primaryInputLabel}</span>
                <input
                  type="number"
                  step="any"
                  value={form.primaryInput}
                  onChange={(event) => updateField("primaryInput", event.target.value)}
                />
              </label>

              {selectedMethod.secondaryInputNeeded ? (
                <label>
                  <span>{selectedMethod.secondaryInputLabel}</span>
                  <input
                    type="number"
                    step="any"
                    value={form.secondaryInput}
                    onChange={(event) => updateField("secondaryInput", event.target.value)}
                  />
                </label>
              ) : null}
            </div>

            <div className="form-row">
              <label>
                <span>Error Threshold</span>
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
                  max="200"
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
            <p>{latestRun ? `${latestRun.equation} | ${describeRunInputs(latestRun.method, latestRun)}` : "No result available yet"}</p>
          </div>

          <ErrorChart rows={latestRun?.iterations ?? []} />
          <ResultsTable methodKey={(latestRun?.method.key ?? selectedMethod.key) as Method["key"]} rows={latestRun?.iterations ?? []} />
        </section>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>Recent History</h2>
          <span>Click any card to reload a saved configuration</span>
        </div>
        <HistoryList runs={history} onReuse={handleReuse} />
      </section>
    </div>
  );
}
