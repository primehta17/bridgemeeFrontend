import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Login() {
  usePageMeta({
    title: 'Sign in',
    description: 'Sign in to the Subscription Portal to manage your plans.',
  });
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { accessToken, refreshToken, user: userData } = await authApi.login(form);
      login({ accessToken, refreshToken }, userData);
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="auth-card">
      <h1>Welcome back</h1>
      <p className="subtitle">Sign in to manage your subscriptions</p>
      <Alert type="error" message={error} />
      <form onSubmit={handleSubmit} className="form" noValidate>
        <label htmlFor="login-email">
          Email
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </label>
        <label htmlFor="login-password">
          Password
          <input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-footer">
        No account? <Link to="/register">Register</Link>
      </p>
    </article>
  );
}
