import { useCallback, useEffect, useState } from 'react';
import { plansApi, subscriptionsApi } from '../api/client';
import MockPaymentModal from '../components/MockPaymentModal';
import Alert from '../components/ui/Alert';
import LoadingState from '../components/ui/LoadingState';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDate, formatPrice } from '../utils/format';

const planRef = (sub) => sub?.planId || sub?.plan;

export default function UserDashboard() {
  usePageMeta({
    title: 'My subscriptions',
    description: 'View plans, subscribe, change or cancel your subscription.',
  });
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [changePlanId, setChangePlanId] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [plansData, subsData] = await Promise.all([
        plansApi.listPublic().catch(() => plansApi.list()),
        subscriptionsApi.me(),
      ]);
      setPlans(Array.isArray(plansData) ? plansData : plansData?.items ?? []);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeSub = subscriptions.find(
    (s) => s.status === 'active' && new Date(s.endDate) >= new Date()
  );
  const activePlan = activeSub ? planRef(activeSub) : null;

  const openSubscribePayment = (plan) => {
    setPaymentModal({ type: 'subscribe', plan });
  };

  const openChangePlanPayment = () => {
    const target = plans.find((p) => p._id === changePlanId);
    if (!target) return;
    setPaymentModal({ type: 'change', plan: target, subscriptionId: activeSub._id });
  };

  const handlePaymentSuccess = async (payment) => {
    if (paymentModal.type === 'subscribe') {
      setBusy(paymentModal.plan._id);
      await subscriptionsApi.subscribe(paymentModal.plan._id, payment);
      setMessage(`Subscribed to ${paymentModal.plan.name}. Payment ref: ${payment.mockTransactionId}`);
    } else {
      setBusy('change');
      await subscriptionsApi.changePlan(
        paymentModal.subscriptionId,
        paymentModal.plan._id,
        payment
      );
      setMessage(`Plan changed to ${paymentModal.plan.name}. Payment ref: ${payment.mockTransactionId}`);
      setChangePlanId('');
    }
    await load();
    setBusy(null);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return;
    setMessage('');
    setError('');
    setBusy(id);
    try {
      await subscriptionsApi.cancel(id);
      setMessage('Subscription cancelled.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your dashboard…" />;
  }

  return (
    <div className="dashboard">
      <MockPaymentModal
        open={Boolean(paymentModal)}
        plan={paymentModal?.plan}
        actionLabel={paymentModal?.type === 'change' ? 'Pay & change plan' : 'Pay & subscribe'}
        onClose={() => !busy && setPaymentModal(null)}
        onSuccess={async (payment) => {
          try {
            setError('');
            await handlePaymentSuccess(payment);
          } catch (err) {
            setError(err.message);
            throw err;
          }
        }}
      />

      <PageHeader
        title="My subscriptions"
        subtitle="Browse plans and manage your active subscription"
      />

      <Alert type="success" message={message} onDismiss={() => setMessage('')} />
      <Alert type="error" message={error} onDismiss={() => setError('')} />

      <section className="section">
        <h2>Current subscription</h2>
        {activeSub && activePlan ? (
          <div className="card highlight">
            <div className="card-row">
              <div>
                <h3>{activePlan.name}</h3>
                <p className="muted">
                  {formatPrice(activePlan.price)} / {activePlan.billingCycle || 'monthly'}
                </p>
                <p>
                  Renews until <strong>{formatDate(activeSub.endDate)}</strong>
                </p>
                {activeSub.lastPayment?.mockTransactionId && (
                  <p className="muted small">
                    Last payment: {activeSub.lastPayment.mockTransactionId} (••••{' '}
                    {activeSub.lastPayment.cardLast4})
                  </p>
                )}
              </div>
              <div className="card-actions">
                <label htmlFor="change-plan-select" className="sr-only">
                  Select plan to switch to
                </label>
                <select
                  id="change-plan-select"
                  value={changePlanId}
                  onChange={(e) => setChangePlanId(e.target.value)}
                >
                  <option value="">Switch to another plan…</option>
                  {plans
                    .filter((p) => p._id !== activePlan?._id)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {formatPrice(p.price)} / {p.billingCycle}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!changePlanId || busy === 'change'}
                  onClick={openChangePlanPayment}
                >
                  {busy === 'change' ? 'Processing…' : 'Change plan (pay)'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busy === activeSub._id}
                  onClick={() => handleCancel(activeSub._id)}
                >
                  {busy === activeSub._id ? 'Cancelling…' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">You have no active subscription. Choose a plan below.</p>
        )}
      </section>

      <section className="section">
        <h2>Available plans</h2>
        {plans.length === 0 ? (
          <p className="muted">No plans available. Ask an admin to add plans.</p>
        ) : (
          <div className="plan-grid">
            {plans.map((plan) => (
              <article key={plan._id} className="card plan-card">
                <h3>{plan.name}</h3>
                <p className="plan-price">
                  {formatPrice(plan.price)}
                  <span className="muted"> / {plan.billingCycle || 'monthly'}</span>
                </p>
                {plan.description && <p>{plan.description}</p>}
                {plan.features?.length > 0 && (
                  <ul className="feature-list">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!!activeSub || busy === plan._id}
                  onClick={() => openSubscribePayment(plan)}
                >
                  {busy === plan._id
                    ? 'Processing…'
                    : activeSub
                      ? 'Active plan exists'
                      : 'Subscribe'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Subscription history</h2>
        {subscriptions.length === 0 ? (
          <p className="muted">No subscription history yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const p = planRef(sub);
                  return (
                    <tr key={sub._id}>
                      <td>{p?.name || '—'}</td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td>{formatDate(sub.startDate)}</td>
                      <td>{formatDate(sub.endDate)}</td>
                      <td className="muted small">
                        {sub.lastPayment?.mockTransactionId
                          ? `•••• ${sub.lastPayment.cardLast4}`
                          : '—'}
                      </td>
                      <td>
                        {sub.status === 'active' && new Date(sub.endDate) >= new Date() && (
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            disabled={busy === sub._id}
                            onClick={() => handleCancel(sub._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
