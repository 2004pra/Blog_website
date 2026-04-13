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

      <section className="platform-intro" aria-labelledby="platform-intro-title">
        <div className="platform-intro-main">
          <h2 id="platform-intro-title">A Social Platform For Thoughts And Stories</h2>
          <p>
            Koma is where people share thoughts, life updates, and ideas through posts and video blogs.
            The goal is simple: make it easy to express yourself and connect with people who care about
            the same things.
          </p>
        </div>
        <div className="platform-intro-card">
          <h3>What You Can Do</h3>
          <ul>
            <li>Write and publish posts</li>
            <li>Upload and watch video blogs</li>
            <li>Like and comment on content</li>
            <li>Build your profile and presence</li>
          </ul>
        </div>
      </section>

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

      <footer className="explore-footer">
        <div className="explore-footer-left">
          <h4>Koma</h4>
          <p>Share your thoughts. Share your story. Grow with the community.</p>
        </div>
        <div className="explore-footer-right">
          <p>Followers and Following are now live on profile pages.</p>
          <p>Now in progress: real-time chat system.</p>
          <p>
            Read platform rules:{' '}
            <a className="footer-mail-link" href="/terms-policies">Terms And Policies</a>
          </p>
          <p>
            Report suspicious activity:{' '}
            <a className="footer-mail-link" href="mailto:support@koma.app">support@koma.app</a>
          </p>
          <p>
            Business inquiries:{' '}
            <a className="footer-mail-link" href="mailto:prashant37364@gmail.com">prashant37364@gmail.com</a>
          </p>
          <p className="explore-footer-note">Built with consistency, patience, and learning by doing.</p>
        </div>
      </footer>
    </div>
  );
}
