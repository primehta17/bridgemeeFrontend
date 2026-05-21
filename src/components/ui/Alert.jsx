export default function Alert({ type = 'error', message, onDismiss }) {
  if (!message) return null;
  const role = type === 'error' ? 'alert' : 'status';
  return (
    <div className={`alert alert-${type}`} role={role} aria-live="polite">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
