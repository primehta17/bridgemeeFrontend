import { useId } from 'react';

export default function InfoTooltip({ items, label = 'More information' }) {
  const tooltipId = useId();

  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-btn"
        aria-label={label}
        aria-describedby={tooltipId}
      >
        <span aria-hidden="true">i</span>
      </button>
      <span id={tooltipId} role="tooltip" className="info-tip-popup">
        <ul className="info-tip-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </span>
    </span>
  );
}
