import type { Method } from "../types";

type MethodCardProps = {
  method: Method;
  selected: boolean;
  onSelect: (method: Method) => void;
};

export function MethodCard({ method, selected, onSelect }: MethodCardProps) {
  return (
    <button
      type="button"
      className={`method-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(method)}
    >
      <span className="method-card__eyebrow">{method.key}</span>
      <strong>{method.title}</strong>
      <p>{method.description}</p>
    </button>
  );
}

