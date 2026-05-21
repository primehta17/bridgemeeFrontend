export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="page-center" role="status" aria-live="polite" aria-busy="true">
      <p className="muted">{label}</p>
    </div>
  );
}
