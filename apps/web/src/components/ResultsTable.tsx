import type { IterationRow } from "../types";

type ResultsTableProps = {
  rows: IterationRow[];
};

function formatNumber(value: number | null) {
  if (value === null) {
    return "-";
  }

  return value.toFixed(6);
}

export function ResultsTable({ rows }: ResultsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="empty-state">
        Run a calculation to view the iteration table for the selected method.
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Iteration</th>
            <th>XL</th>
            <th>XR</th>
            <th>XM</th>
            <th>f(XM)</th>
            <th>Error (%)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.iteration}>
              <td>{row.iteration}</td>
              <td>{formatNumber(row.xl)}</td>
              <td>{formatNumber(row.xr)}</td>
              <td>{formatNumber(row.xm)}</td>
              <td>{formatNumber(row.fxm)}</td>
              <td>{formatNumber(row.error)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
