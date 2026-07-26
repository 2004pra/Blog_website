// React Router components for handling client-side navigation (URLs)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// The AuthProvider component gives auth data to children; AuthContext holds the data
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
// useContext is a React Hook that lets components read from a context
import { useContext } from 'react';
import Navbar from './components/Navbar.jsx';
import LeftSidebar from './components/LeftSidebar.jsx';
import HomePage from './components/HomePage.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Profile from './components/Profile.jsx';
import PublicProfile from './components/PublicProfile.jsx';
import CreatePost from './components/CreatePost.jsx';
import EditPost from './components/EditPost.jsx';
import VideoFeed from './components/VideoFeed.jsx';
import VideoUpload from './components/VideoUpload.jsx';
import AboutDocs from './components/AboutDocs.jsx';
import TermsPolicies from './components/TermsPolicies.jsx';
// Import general styling for the app structure
import './App.css';

// A wrapper component that protects routes. Only logged-in users can see what's inside.
function PrivateRoute({ children }) {
  // Grab the current user and checking state from AuthContext
  const { user, loading } = useContext(AuthContext);

  // If the app is still figuring out if we are logged in, show a loading screen
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // If we have a user (logged in), render the requested page (children)
  // Otherwise, redirect them to the "/login" page
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    // Two-column layout: left sidebar (desktop) + main content area
    <div className="app-layout">
      {/* Left sidebar — visible on desktop only, hidden on mobile via CSS */}
      <LeftSidebar />

      {/* Main content column */}
      <div className="app-main">
        {/* Top Navbar — visible on mobile only, hidden on desktop via CSS */}
        <Navbar />

        {/* Routes looks at the current URL and displays only the matching Route */}
        <Routes>
          {/* Public Routes - anyone can visit these */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<AboutDocs />} />
          <Route path="/terms-policies" element={<TermsPolicies />} />
          <Route path="/videos" element={<VideoFeed />} />
          {/* Private Routes - Wrapped in <PrivateRoute>, so only logged-in users hit these */}
          <Route
            path="/upload-video"
            element={
              <PrivateRoute>
                <VideoUpload />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <PrivateRoute>
                <PublicProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-post/:postId"
            element={
              <PrivateRoute>
                <EditPost />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
