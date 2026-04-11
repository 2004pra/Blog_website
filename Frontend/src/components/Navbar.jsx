import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [character, setCharacter] = useState(null);
  const [isDark, setIsDark] = useState(false);

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
    navigate('/');
    setMobileMenuOpen(false);
  };

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

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Explore
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/videos" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              📺 Videos
            </Link>
          </li>

          {user ? (
            <>
              <li className="nav-item">
                <Link to="/create-post" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  ✍️ Write
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/upload-video" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  🎬 Upload Video
                </Link>
              </li>
              <li className="nav-item profile-item">
                <Link to="/profile" className="profile-link" onClick={() => setMobileMenuOpen(false)}>
                  <div className="avatar-container">
                    {character?.image ? (
                      <img 
                        src={character.image} 
                        alt={user.username} 
                        className="avatar-img"
                        onError={(e) => {
                          console.error('Failed to load avatar image');
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="avatar-placeholder">👤</div>
                    )}
                  </div>
                  <span className="username">{user.username}</span>
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </li>
            </>
          )}
          <li className="nav-item theme-link">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
