export default function AdminTableToolbar({
  search,
  onSearchChange,
  onSearchSubmit,
  filters,
  page,
  totalPages,
  total,
  onPageChange,
  showSearch = true,
}) {
  return (
    <div className="table-toolbar">
      {showSearch && (
        <form
          className="toolbar-search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.();
          }}
        >
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-ghost">
            Search
          </button>
        </form>
      )}
      {filters}
      <div className="toolbar-pagination">
        <span className="muted small">
          {total} result{total === 1 ? '' : 's'} · Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
