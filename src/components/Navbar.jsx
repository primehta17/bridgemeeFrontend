import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar" role="banner">
      <Link
        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
        className="brand"
        aria-label="Subscription Portal home"
      >
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-text">
          Bridge<span className="brand-accent">Mee</span>
        </span>
      </Link>
      {user && (
        <div className="nav-right">
          <span className="nav-user">
            <span className="nav-avatar" aria-hidden="true">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
            <span className="nav-user-meta">
              <span className="nav-user-name">{user.name}</span>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </span>
          </span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
