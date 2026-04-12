import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [character, setCharacter] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [isDark, setIsDark] = useState(false);
  const createMenuRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Load character from localStorage whenever user changes
  useEffect(() => {
    if (user) {
      const savedProfilePic = localStorage.getItem('profilePicUrl');
      setProfilePicUrl(user.profile_pic_url || savedProfilePic || '');

      const userCharacter = localStorage.getItem('userCharacter');
      if (userCharacter) {
        try {
          const char = JSON.parse(userCharacter);
          setCharacter(char);
          console.log('Character loaded in Navbar:', char);
        } catch (e) {
          console.error('Error parsing character from localStorage:', e);
          setCharacter(null);
        }
      } else {
        console.log('No character found in localStorage');
        setCharacter(null);
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('profilePicUrl');
    navigate('/');
    setDrawerOpen(false);
    setCreateMenuOpen(false);
  };

  const closeDrawer = () => setDrawerOpen(false);
  const closeCreateMenu = () => setCreateMenuOpen(false);

  // Keep drawer behavior stable: close on route changes and ESC, and lock page scroll while open.
  useEffect(() => {
    setDrawerOpen(false);
    setCreateMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        setCreateMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setCreateMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" className="brand-icon" role="img" focusable="false">
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6ee7f9" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#brandGrad)" />
              <path d="M18 42c3.2-6.5 8.8-9.8 14-9.8S42.8 35.5 46 42" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
              <circle cx="24" cy="27" r="3.2" fill="#ffffff" />
              <circle cx="40" cy="27" r="3.2" fill="#ffffff" />
            </svg>
          </span>
          <span className="logo-text">KOMA</span>
        </Link>

        <div className="nav-primary-links">
          <Link to="/" className="nav-link">Explore</Link>
          <Link to="/videos" className="nav-link">Videos</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>

        <div className="nav-right-actions">
          <div className="create-menu-wrap" ref={createMenuRef}>
            <button
              className="create-toggle-btn"
              onClick={() => setCreateMenuOpen((prev) => !prev)}
              aria-label="Open create menu"
              aria-expanded={createMenuOpen}
            >
              + Create
            </button>

            {createMenuOpen && (
              <div className="create-menu-popover">
                {user ? (
                  <>
                    <Link to="/create-post" className="create-menu-item" onClick={closeCreateMenu}>
                      ✍️ Write Post
                    </Link>
                    <Link to="/upload-video" className="create-menu-item" onClick={closeCreateMenu}>
                      🎬 Upload Video
                    </Link>
                  </>
                ) : (
                  <Link to="/login" className="create-menu-item" onClick={closeCreateMenu}>
                    Sign in to create
                  </Link>
                )}
              </div>
            )}
          </div>

          {user && (
            <Link to="/profile" className="profile-chip" onClick={closeDrawer}>
              <div className="avatar-container">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={user.username}
                    className="avatar-img"
                    onError={() => setProfilePicUrl('')}
                  />
                ) : character?.image ? (
                  <img
                    src={character.image}
                    alt={user.username}
                    className="avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">👤</div>
                )}
              </div>
              <span className="username">{user.username}</span>
            </Link>
          )}

          <button
            className="menu-toggle-btn"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label="Open quick menu"
            aria-expanded={drawerOpen}
          >
            Menu
          </button>
        </div>
      </div>

      {drawerOpen && <button className="drawer-backdrop" onClick={closeDrawer} aria-label="Close menu" />}

      <aside className={`side-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Quick Actions</h3>
          <button className="drawer-close-btn" onClick={closeDrawer} aria-label="Close menu">×</button>
        </div>

        <div className="drawer-links">
          {user ? (
            <>
              <Link to="/create-post" className="drawer-link" onClick={closeDrawer}>✍️ Create Post</Link>
              <Link to="/upload-video" className="drawer-link" onClick={closeDrawer}>🎬 Upload Video</Link>
              <Link to="/profile" className="drawer-link" onClick={closeDrawer}>👤 Profile</Link>
              <button className="drawer-link drawer-theme-btn" onClick={toggleTheme}>
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button className="drawer-link drawer-logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="drawer-link" onClick={closeDrawer}>Sign In</Link>
              <Link to="/signup" className="drawer-link" onClick={closeDrawer}>Get Started</Link>
              <button className="drawer-link drawer-theme-btn" onClick={toggleTheme}>
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </>
          )}
        </div>
      </aside>
    </nav>
  );
}
