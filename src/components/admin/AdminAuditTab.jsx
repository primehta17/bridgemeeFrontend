import { useCallback, useEffect, useState } from 'react';
import { auditLogsApi } from '../../api/client';
import AdminTableToolbar from '../AdminTableToolbar';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import { DEFAULT_PAGINATION, formatDateTime } from '../../utils/format';

const ACTION_LABELS = {
  created: 'Created',
  updated: 'Updated',
  deactivated: 'Deactivated',
  subscribed: 'Subscribed',
  cancelled: 'Cancelled',
  change_plan: 'Plan change',
};

export default function AdminAuditTab() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditLogsApi.list({
        page,
        limit: 10,
        q: searchApplied || undefined,
        entityType: entityFilter || undefined,
        action: actionFilter || undefined,
      });
      setLogs(data.items ?? []);
      setPagination(data.pagination ?? DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [page, searchApplied, entityFilter, actionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filters = (
    <>
      <select
        value={entityFilter}
        onChange={(e) => {
          setEntityFilter(e.target.value);
          setPage(1);
        }}
        aria-label="Filter by entity"
      >
        <option value="">All entities</option>
        <option value="plan">Plans</option>
        <option value="subscription">Subscriptions</option>
      </select>
      <select
        value={actionFilter}
        onChange={(e) => {
          setActionFilter(e.target.value);
          setPage(1);
        }}
        aria-label="Filter by action"
      >
        <option value="">All actions</option>
        {Object.entries(ACTION_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </>
  );

  const rows = logs.map((log) => (
    <tr key={log._id}>
      <td>{formatDateTime(log.createdAt)}</td>
      <td>
        <StatusBadge status={log.entityType === 'plan' ? 'active' : 'expired'} label={log.entityType} />
      </td>
      <td>{ACTION_LABELS[log.action] || log.action}</td>
      <td>{log.summary}</td>
      <td>
        {log.performedByName}
        <br />
        <span className="muted small">{log.performedByEmail}</span>
      </td>
    </tr>
  ));

  return (
    <section className="section" role="tabpanel" id="panel-audit" aria-labelledby="tab-audit">
      <h2>Audit log</h2>
      <p className="subtitle">Recent changes to plans and subscriptions</p>
      <AdminTableToolbar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {
          setSearchApplied(search);
          setPage(1);
        }}
        filters={filters}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
      />
      <DataTable
        caption="Audit log entries"
        loading={loading}
        loadingLabel="Loading audit log…"
        emptyMessage="No audit entries match your filters."
        columns={[
          { key: 'when', label: 'When' },
          { key: 'entity', label: 'Entity' },
          { key: 'action', label: 'Action' },
          { key: 'summary', label: 'Summary' },
          { key: 'by', label: 'By' },
        ]}
        rows={rows}
      />
    </section>
  );
}
