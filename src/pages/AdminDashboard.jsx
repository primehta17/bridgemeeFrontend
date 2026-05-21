import { useCallback, useEffect, useState } from 'react';
import { plansApi, subscriptionsApi, usersApi } from '../api/client';
import AdminTableToolbar from '../components/AdminTableToolbar';
import AdminAuditTab from '../components/admin/AdminAuditTab';
import Alert from '../components/ui/Alert';
import PageHeader from '../components/ui/PageHeader';
import TabList from '../components/ui/TabList';
import StatusBadge from '../components/ui/StatusBadge';
import { usePageMeta } from '../hooks/usePageMeta';
import { DEFAULT_PAGINATION, formatDate, formatPrice } from '../utils/format';

const ADMIN_TABS = [
  { id: 'plans', label: 'Plans' },
  { id: 'users', label: 'Users' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'audit', label: 'Audit log' },
];

const emptyPlan = {
  name: '',
  description: '',
  price: '',
  billingCycle: 'monthly',
  features: '',
  isActive: true,
};

export default function AdminDashboard() {
  usePageMeta({
    title: 'Admin',
    description: 'Manage subscription plans, users, and view audit history.',
  });
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plansPagination, setPlansPagination] = useState(DEFAULT_PAGINATION);
  const [usersPagination, setUsersPagination] = useState(DEFAULT_PAGINATION);
  const [subsPagination, setSubsPagination] = useState(DEFAULT_PAGINATION);

  const [planSearch, setPlanSearch] = useState('');
  const [planSearchApplied, setPlanSearchApplied] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState('');
  const [planBillingFilter, setPlanBillingFilter] = useState('');
  const [plansPage, setPlansPage] = useState(1);

  const [userSearch, setUserSearch] = useState('');
  const [userSearchApplied, setUserSearchApplied] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState('');
  const [usersPage, setUsersPage] = useState(1);

  const [subsPage, setSubsPage] = useState(1);
  const [subsStatusFilter, setSubsStatusFilter] = useState('');

  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(emptyPlan);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPlans = useCallback(async () => {
    const data = await plansApi.list({
      page: plansPage,
      limit: 10,
      q: planSearchApplied || undefined,
      isActive: planStatusFilter || undefined,
      billingCycle: planBillingFilter || undefined,
    });
    setPlans(data.items ?? []);
    setPlansPagination(data.pagination ?? DEFAULT_PAGINATION);
  }, [plansPage, planSearchApplied, planStatusFilter, planBillingFilter]);

  const loadUsers = useCallback(async () => {
    const data = await usersApi.list({
      page: usersPage,
      limit: 10,
      q: userSearchApplied || undefined,
      hasActivePlan: userPlanFilter || undefined,
    });
    setUsers(data.items ?? []);
    setUsersPagination(data.pagination ?? DEFAULT_PAGINATION);
  }, [usersPage, userSearchApplied, userPlanFilter]);

  const loadSubscriptions = useCallback(async () => {
    const data = await subscriptionsApi.all({
      page: subsPage,
      limit: 10,
      status: subsStatusFilter || undefined,
    });
    setSubscriptions(data.items ?? []);
    setSubsPagination(data.pagination ?? DEFAULT_PAGINATION);
  }, [subsPage, subsStatusFilter]);

  const loadTab = useCallback(async () => {
    setTableLoading(true);
    setError('');
    try {
      if (tab === 'audit') return;
      if (tab === 'plans') await loadPlans();
      else if (tab === 'users') await loadUsers();
      else await loadSubscriptions();
    } catch (err) {
      setError(err.message);
    } finally {
      setTableLoading(false);
    }
  }, [tab, loadPlans, loadUsers, loadSubscriptions]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  const resetForm = () => {
    setForm(emptyPlan);
    setEditingId(null);
  };

  const startEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: String(plan.price),
      billingCycle: plan.billingCycle || 'monthly',
      features: (plan.features || []).join('\n'),
      isActive: plan.isActive,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      billingCycle: form.billingCycle,
      features: form.features
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await plansApi.update(editingId, body);
        setMessage('Plan updated.');
      } else {
        await plansApi.create(body);
        setMessage('Plan created.');
      }
      resetForm();
      await loadPlans();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this plan? Users will no longer be able to subscribe.')) return;
    setError('');
    try {
      await plansApi.remove(id);
      setMessage('Plan deactivated.');
      if (editingId === id) resetForm();
      await loadPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const planFilters = (
    <>
      <select
        value={planStatusFilter}
        onChange={(e) => {
          setPlanStatusFilter(e.target.value);
          setPlansPage(1);
        }}
        aria-label="Filter plans by status"
      >
        <option value="">All statuses</option>
        <option value="true">Active only</option>
        <option value="false">Inactive only</option>
      </select>
      <select
        value={planBillingFilter}
        onChange={(e) => {
          setPlanBillingFilter(e.target.value);
          setPlansPage(1);
        }}
        aria-label="Filter plans by billing cycle"
      >
        <option value="">All billing cycles</option>
        <option value="monthly">Monthly</option>
        <option value="annual">Annual</option>
      </select>
    </>
  );

  const userFilters = (
    <select
      value={userPlanFilter}
      onChange={(e) => {
        setUserPlanFilter(e.target.value);
        setUsersPage(1);
      }}
      aria-label="Filter users by subscription"
    >
      <option value="">All users</option>
      <option value="true">With active plan</option>
      <option value="false">Without active plan</option>
    </select>
  );

  const subsFilters = (
    <select
      value={subsStatusFilter}
      onChange={(e) => {
        setSubsStatusFilter(e.target.value);
        setSubsPage(1);
      }}
      aria-label="Filter subscriptions by status"
    >
      <option value="">All statuses</option>
      <option value="active">Active</option>
      <option value="cancelled">Cancelled</option>
      <option value="expired">Expired</option>
    </select>
  );

  return (
    <div className="dashboard">
      <PageHeader
        title="Admin dashboard"
        subtitle="Manage plans, users, subscriptions, and audit history"
      />

      <Alert type="success" message={message} onDismiss={() => setMessage('')} />
      <Alert type="error" message={error} onDismiss={() => setError('')} />

      <TabList
        tabs={ADMIN_TABS}
        activeId={tab}
        onChange={setTab}
        ariaLabel="Admin sections"
      />

      {tab === 'audit' && <AdminAuditTab />}

      {tab === 'plans' && (
        <div role="tabpanel" id="panel-plans" aria-labelledby="tab-plans">
        <div className="admin-grid">
          <section className="section card">
            <h2>{editingId ? 'Edit plan' : 'Create plan'}</h2>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </label>
              <div className="form-row">
                <label>
                  Price (USD)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Billing cycle
                  <select
                    value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </label>
              </div>
              <label>
                Features (one per line)
                <textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  rows={4}
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active (visible to users)
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : editingId ? 'Update plan' : 'Create plan'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="section">
            <h2>All plans</h2>
            <AdminTableToolbar
              search={planSearch}
              onSearchChange={setPlanSearch}
              onSearchSubmit={() => {
                setPlanSearchApplied(planSearch);
                setPlansPage(1);
              }}
              filters={planFilters}
              page={plansPagination.page}
              totalPages={plansPagination.totalPages}
              total={plansPagination.total}
              onPageChange={setPlansPage}
            />
            {tableLoading ? (
              <p className="muted">Loading plans…</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Billing</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="muted">
                          No plans match your filters.
                        </td>
                      </tr>
                    ) : (
                      plans.map((plan) => (
                        <tr key={plan._id}>
                          <td>{plan.name}</td>
                          <td>{formatPrice(plan.price)}</td>
                          <td>{plan.billingCycle}</td>
                        <td>
                          <StatusBadge
                            status={plan.isActive ? 'active' : 'inactive'}
                            label={plan.isActive ? 'active' : 'inactive'}
                          />
                        </td>
                          <td className="actions">
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => startEdit(plan)}
                            >
                              Edit
                            </button>
                            {plan.isActive && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeactivate(plan._id)}
                              >
                                Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
        </div>
      )}

      {tab === 'users' && (
        <section className="section" role="tabpanel" id="panel-users" aria-labelledby="tab-users">
          <h2>Users & current plans</h2>
          <AdminTableToolbar
            search={userSearch}
            onSearchChange={setUserSearch}
            onSearchSubmit={() => {
              setUserSearchApplied(userSearch);
              setUsersPage(1);
            }}
            filters={userFilters}
            page={usersPagination.page}
            totalPages={usersPagination.totalPages}
            total={usersPagination.total}
            onPageChange={setUsersPage}
          />
          {tableLoading ? (
            <p className="muted">Loading users…</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current plan</th>
                    <th>Status</th>
                    <th>Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted">
                        No users match your search.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.currentSubscription?.planId?.name || '-'}</td>
                        <td>
                        {u.currentSubscription ? (
                          <StatusBadge status={u.currentSubscription.status} />
                        ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {u.currentSubscription
                            ? formatDate(u.currentSubscription.endDate)
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'subscriptions' && (
        <section
          className="section"
          role="tabpanel"
          id="panel-subscriptions"
          aria-labelledby="tab-subscriptions"
        >
          <h2>All subscriptions</h2>
          <AdminTableToolbar
            showSearch={false}
            filters={subsFilters}
            page={subsPagination.page}
            totalPages={subsPagination.totalPages}
            total={subsPagination.total}
            onPageChange={setSubsPage}
          />
          {tableLoading ? (
            <p className="muted">Loading subscriptions…</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted">
                        No subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub._id}>
                        <td>
                          {sub.userId?.name}
                          <br />
                          <span className="muted small">{sub.userId?.email}</span>
                        </td>
                        <td>{sub.planId?.name || '-'}</td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                        <td>{formatDate(sub.startDate)}</td>
                        <td>{formatDate(sub.endDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
