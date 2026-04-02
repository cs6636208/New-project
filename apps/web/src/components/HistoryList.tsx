import type { Run } from "../types";
import { describeRunInputs } from "../lib/method-config";

type HistoryListProps = {
  runs: Run[];
  onReuse: (run: Run) => void;
};

export function HistoryList({ runs, onReuse }: HistoryListProps) {
  if (runs.length === 0) {
    return <div className="empty-state">No saved calculations were found in the database.</div>;
  }

  return (
    <div className="history-list">
      {runs.map((run) => (
        <button key={run.id} type="button" className="history-card" onClick={() => onReuse(run)}>
          <div className="history-card__header">
            <strong>{run.method.title}</strong>
            <span>{new Date(run.createdAt).toLocaleString()}</span>
          </div>
          <p>{run.equation}</p>
          <div className="history-card__meta">
            <span>{describeRunInputs(run.method, run)}</span>
            <span>Root: {run.root.toFixed(6)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
