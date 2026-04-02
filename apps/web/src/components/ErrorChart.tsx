import type { IterationRow } from "../types";

type ErrorChartProps = {
  rows: IterationRow[];
};

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = 28;

export function ErrorChart({ rows }: ErrorChartProps) {
  const points = rows
    .filter((row) => typeof row.error === "number" && row.error !== null)
    .map((row) => ({
      iteration: row.iteration,
      error: Math.max(Number(row.error), 0.000000000001)
    }));

  if (points.length === 0) {
    return <div className="empty-state">Error chart will appear after the method produces at least one measurable error value.</div>;
  }

  const xMin = points[0].iteration;
  const xMax = points[points.length - 1].iteration;
  const yValues = points.map((point) => Math.log10(point.error));
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const chartPoints = points.map((point) => {
    const xRatio = xMax === xMin ? 0.5 : (point.iteration - xMin) / (xMax - xMin);
    const yValue = Math.log10(point.error);
    const yRatio = yMax === yMin ? 0.5 : (yValue - yMin) / (yMax - yMin);

    return {
      x: PADDING + xRatio * (WIDTH - PADDING * 2),
      y: HEIGHT - PADDING - yRatio * (HEIGHT - PADDING * 2),
      label: point.error
    };
  });

  const polylinePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="chart-shell">
      <div className="chart-header">
        <strong>Error Trend</strong>
        <span>log10 scale</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="error-chart" role="img" aria-label="Error trend chart">
        <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} className="chart-axis" />
        <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} className="chart-axis" />
        <polyline fill="none" points={polylinePoints} className="chart-line" />
        {chartPoints.map((point, index) => (
          <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="4" className="chart-point" />
        ))}
      </svg>
      <div className="chart-footer">
        <span>First error: {points[0].error.toExponential(2)}</span>
        <span>Latest error: {points[points.length - 1].error.toExponential(2)}</span>
      </div>
    </div>
  );
}
