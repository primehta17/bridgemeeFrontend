export default function DataTable({ caption, columns, rows, emptyMessage, loading, loadingLabel }) {
  if (loading) {
    return <p className="muted" role="status">{loadingLabel || 'Loading…'}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows
          )}
        </tbody>
      </table>
    </div>
  );
}
