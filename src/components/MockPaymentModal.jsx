import { useEffect, useRef, useState } from 'react';
import { processMockPayment, validateCardForm } from '../utils/mockPayment';

const formatPrice = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

export default function MockPaymentModal({ open, plan, actionLabel, onClose, onSuccess }) {
  const [form, setForm] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/30',
    cvv: '123',
    name: '',
  });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector('input, button, select, textarea');
      focusable?.focus();
    }
  }, [open]);

  if (!open || !plan) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validation = validateCardForm(form);
    if (validation) {
      setError(validation);
      return;
    }

    setProcessing(true);
    try {
      const payment = await processMockPayment(plan.price, form.cardNumber);
      await onSuccess(payment);
      onClose();
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="modal card" ref={dialogRef}>
        <header className="modal-header">
          <div>
            <h2 id="payment-title">Mock payment</h2>
            <p className="subtitle">
              Demo checkout for <strong>{plan.name}</strong> - {formatPrice(plan.price)} /{' '}
              {plan.billingCycle}
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={processing}>
            ✕
          </button>
        </header>

        <p className="mock-badge">No real charges - test card only</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Card number
            <input
              value={form.cardNumber}
              onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
              placeholder="4242 4242 4242 4242"
              disabled={processing}
            />
          </label>
          <div className="form-row">
            <label>
              Expiry
              <input
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                placeholder="MM/YY"
                disabled={processing}
              />
            </label>
            <label>
              CVV
              <input
                value={form.cvv}
                onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                placeholder="123"
                disabled={processing}
              />
            </label>
          </div>
          <label>
            Cardholder name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={processing}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={processing}>
              {processing ? 'Processing…' : actionLabel || 'Pay now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
