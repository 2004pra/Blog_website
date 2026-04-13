import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { useContext } from 'react';
import Navbar from './components/Navbar.jsx';
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
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<AboutDocs />} />
        <Route path="/videos" element={<VideoFeed />} />
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
    </>
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
