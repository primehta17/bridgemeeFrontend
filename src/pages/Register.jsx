import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';
import InfoTooltip from '../components/ui/InfoTooltip';
import { usePageMeta } from '../hooks/usePageMeta';

const REGISTER_TIPS = [
  '8+ chars, letter and number'
];

export default function Register() {
  usePageMeta({
    title: 'Register',
    description: 'Create a Subscription Portal account and choose a plan.',
  });
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { accessToken, refreshToken, user: userData } = await authApi.register(form);
      login({ accessToken, refreshToken }, userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-hero auth-hero--register" aria-hidden="true">
        <p className="auth-hero-tag">Get started</p>
        <h2 className="auth-hero-title">Pick a plan that fits.</h2>
        <p className="auth-hero-desc">
          Create your account in seconds, then browse plans and subscribe when you are ready.
        </p>
      </aside>
      <article className="auth-card">
        <h1>Create account</h1>
        <p className="subtitle">Register to subscribe to a plan</p>
        <Alert type="error" message={error} />
        <form onSubmit={handleSubmit} className="form" noValidate>
          <label htmlFor="register-name">
            Full name
            <input
              id="register-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoComplete="name"
            />
          </label>
          <label htmlFor="register-email">
            Email
            <input
              id="register-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </label>
          <label htmlFor="register-password">
            <span className="label-row">
              Password
              <InfoTooltip items={REGISTER_TIPS} label="Registration details" />
            </span>
            <input
              id="register-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </article>
    </div>
  );
}
