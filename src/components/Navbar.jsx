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
        Subscription Portal
      </Link>
      {user && (
        <div className="nav-right">
          <span className="nav-user">
            {user.name}
            <span className="badge">{user.role}</span>
          </span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
