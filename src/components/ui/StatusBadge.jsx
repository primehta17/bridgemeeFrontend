const STATUS_CLASS = {
  active: 'status-active',
  cancelled: 'status-cancelled',
  expired: 'status-expired',
  inactive: 'status-cancelled',
};

export default function StatusBadge({ status, label }) {
  const text = label ?? status;
  const className = STATUS_CLASS[status] || 'status-expired';
  return <span className={`status ${className}`}>{text}</span>;
}
