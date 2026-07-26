import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  Video,
  Info,
  FileText,
  PenSquare,
  Upload,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/LeftSidebar.css';

export default function LeftSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('profilePicUrl');
    navigate('/');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <aside className="left-sidebar">
      {/* ── Logo ── */}
      <Link to="/" className="sidebar-logo">
        <span className="sidebar-logo-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" className="sidebar-brand-icon" focusable="false">
            <defs>
              <linearGradient id="sbGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00b8ff" />
                <stop offset="100%" stopColor="#7c5cff" />
              </linearGradient>
            </defs>
            <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#sbGrad)" />
            <path
              d="M18 42c3.2-6.5 8.8-9.8 14-9.8S42.8 35.5 46 42"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <circle cx="24" cy="27" r="3.2" fill="#ffffff" />
            <circle cx="40" cy="27" r="3.2" fill="#ffffff" />
          </svg>
        </span>
        <span className="sidebar-logo-text">koma</span>
      </Link>

      {/* ── Nav links ── */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <Link
          to="/"
          className={`sidebar-link ${isActive('/') ? 'sidebar-link--active' : ''}`}
        >
          <House size={18} strokeWidth={isActive('/') ? 2.5 : 1.8} />
          Explore
        </Link>
        <Link
          to="/videos"
          className={`sidebar-link ${isActive('/videos') ? 'sidebar-link--active' : ''}`}
        >
          <Video size={18} strokeWidth={isActive('/videos') ? 2.5 : 1.8} />
          Videos
        </Link>
        <Link
          to="/about"
          className={`sidebar-link ${isActive('/about') ? 'sidebar-link--active' : ''}`}
        >
          <Info size={18} strokeWidth={isActive('/about') ? 2.5 : 1.8} />
          About
        </Link>
        <Link
          to="/terms-policies"
          className={`sidebar-link ${isActive('/terms-policies') ? 'sidebar-link--active' : ''}`}
        >
          <FileText size={18} strokeWidth={isActive('/terms-policies') ? 2.5 : 1.8} />
          Terms
        </Link>
      </nav>

      {/* ── Spacer ── */}
      <div className="sidebar-spacer" />

      {/* ── Auth / User section ── */}
      <div className="sidebar-actions">
        {user ? (
          <>
            {/* Create dropdown */}
            <div className="sidebar-create-wrap">
              <button
                className="sidebar-btn sidebar-btn--primary"
                onClick={() => setCreateOpen((p) => !p)}
                aria-expanded={createOpen}
              >
                + Create
                <ChevronDown
                  size={14}
                  className={`sidebar-chevron ${createOpen ? 'open' : ''}`}
                />
              </button>
              {createOpen && (
                <div className="sidebar-create-popover">
                  <Link
                    to="/create-post"
                    className="sidebar-create-item"
                    onClick={() => setCreateOpen(false)}
                  >
                    <PenSquare size={15} /> Write Post
                  </Link>
                  <Link
                    to="/upload-video"
                    className="sidebar-create-item"
                    onClick={() => setCreateOpen(false)}
                  >
                    <Upload size={15} /> Upload Video
                  </Link>
                </div>
              )}
            </div>

            {/* Profile link */}
            <Link to="/profile" className="sidebar-profile-chip">
              <span className="sidebar-avatar">
                <User size={14} />
              </span>
              <span className="sidebar-username">{user.username}</span>
            </Link>

            {/* Logout */}
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="sidebar-btn sidebar-btn--primary">
              Sign up
            </Link>
            <Link to="/login" className="sidebar-btn sidebar-btn--dark">
              Log in
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
