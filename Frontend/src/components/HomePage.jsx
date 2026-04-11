import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from '../api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import PostCard from './PostCard.jsx';
import '../styles/HomePage.css';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading brilliant stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {!user && (
        <div className="home-hero">
          <h1>Welcome to <span className="home-brand">Koma</span></h1>
          <p>Discover stories, ideas, and expertise</p>
          <button className="hero-btn" onClick={() => navigate('/signup')}>
            Start Writing Today
          </button>
        </div>
      )}

      <div className="home-content">
        {error && (
          <div className="error-box">
            <p className="error">{error}</p>
            <button onClick={loadPosts} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <>
            <div className="posts-header">
              <h2>Latest Stories</h2>
              <p className="posts-count">{posts.length} {posts.length === 1 ? 'story' : 'stories'}</p>
            </div>

            {posts.length === 0 ? (
              <div className="no-posts-container">
                <div className="no-posts">
                  <h3>No stories yet</h3>
                  <p>Be the first to share your thoughts</p>
                  {user && (
                    <button className="create-btn" onClick={() => navigate('/create-post')}>
                      Create Your First Story
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="posts-container">
                <div className="posts-grid">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onDelete={handlePostDelete} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
