import { useState, useContext } from 'react';
// Link is used like an <a> tag without reloading the browser page
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/Auth.css';

export default function Login() {
  // useState controls forms in React. We keep track of whatever the user types inside these boxes.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // An error message to show them if the backend rejects their login
  const [error, setError] = useState('');
  // Loading state when the app is contacting the server to login
  const [loading, setLoading] = useState(false);
  
  // We extract the `login` function from our AuthContext 
  // (we wrote this logic back in `AuthContext.jsx` -> `api.js`)
  const { login } = useContext(AuthContext);
  // Get navigation logic to push the user to another page after login
  const navigate = useNavigate();

  // Function called automatically when the user clicks 'Submit' (Login button)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from doing its default "reload the webpage" behavior on form submit
    setError(''); // Clear any existing errors
    setLoading(true); // Disable the button while working

    try {
      // Call the login function from context (this makes an API call behind the scenes)
      await login(username, password);
      // If it works without throwing an error, take the user to the HomePage '/'
      navigate('/');
    } catch (err) {
      // If the backend threw an error (e.g. wrong password), set the error state
      setError(err.message || 'Login failed');
    } finally {
      // Regardless of success or failure, turn off the loading animation
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to your account</p>

        {/* If 'error' variable has a value, render this red error div on top of the form */}
        {error && <div className="error-message">{error}</div>}

        {/* The built-in HTML onSubmit handler calls our handleSubmit function above */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username} // React controls the value
              // Whenever the user types a single letter, update the state variable with the new letter
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your username"
              required // makes HTML enforce they typed something
              disabled={loading} // blocks typing if we are waiting for the server
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password" // Hides text as dots
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {/* Changing the button text based on the 'loading' state */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          {/* A React-Router Link to let the user go to signup without reloading the client */}
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>

        <p className="auth-policy-link">
          By continuing, you agree to our <Link to="/terms-policies">Terms and Policies</Link>.
        </p>
      </div>
    </div>
  );
}
