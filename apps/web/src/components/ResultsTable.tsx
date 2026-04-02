import { getMethodTableColumns } from "../lib/method-config";
import type { IterationRow, MethodKey } from "../types";

type ResultsTableProps = {
  methodKey: MethodKey;
  rows: IterationRow[];
};

function formatValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(6);
  }

  return value;
}

export function ResultsTable({ methodKey, rows }: ResultsTableProps) {
  if (rows.length === 0) {
    return <div className="empty-state">Run a calculation to view the iteration table for the selected method.</div>;
  }

  const columns = getMethodTableColumns(methodKey);

  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.iteration}>
              {columns.map((column) => (
                <td key={`${row.iteration}-${column.key}`}>{formatValue(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
