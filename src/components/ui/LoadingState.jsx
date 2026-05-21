export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="page-center loading-state" role="status" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true" />
      <p className="loading-label">{label}</p>
    </div>
  );
}
