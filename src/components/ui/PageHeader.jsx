export default function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      <div className="page-header-inner">
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
