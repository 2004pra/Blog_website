// React core hooks:
// useState: manages variables that should update the screen when changed
// useEffect: runs code when the component first appears or when certain variables change
// useContext: lets us read data from a surrounding Context (like AuthContext)
import { useState, useEffect, useContext } from 'react';
// useNavigate + Link: hooks/components from React Router for navigation
import { useNavigate, Link } from 'react-router-dom';
// fetchPosts: making network requests to the backend to get articles
import { fetchPosts } from '../api.js';
// AuthContext: the place where we stored our logged-in user data
import { AuthContext } from '../context/AuthContext.jsx';
// PostCard: a smaller component responsible for drawing a single blog post on the screen
import PostCard from './PostCard.jsx';
// CSS for this specific page
import '../styles/HomePage.css';

// HomePage is the main feed where users see all posts
export default function HomePage() {
  // State to hold the array of blog posts fetched from the backend
  const [posts, setPosts] = useState([]);
  // State to track if we're currently fetching data from the server
  const [loading, setLoading] = useState(true);
  // State to handle error messages if fetching fails
  const [error, setError] = useState(null);
  
  // Grab the currently logged-in user (if any) from our global Auth state
  const { user } = useContext(AuthContext);
  // Get the navigation function to move between pages
  const navigate = useNavigate();

  // useEffect triggers automatically when the HomePage component mounts (loads for the first time)
  // The empty array [] means "run this once when the page loads, and never again"
  useEffect(() => {
    loadPosts();
  }, []);

  // An async function to request the posts from the backend
  const loadPosts = async () => {
    try {
      setLoading(true); // Turn on the loading spinner
      const data = await fetchPosts(); // Ask the API for posts
      // Sort the posts so the newest ones appear at the top (descending date)
      setPosts(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setError(null); // Clear out any previous errors
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      // Stop the loading spinner regardless of success or error
      setLoading(false);
    }
  };

  // This function is passed down to the PostCard.
  // If the user deletes a post, we remove it from the 'posts' state immediately so it vanishes from the screen locally.
  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  // If we are currently loading posts, return a friendly loading screen
  // instead of the normal page
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
      {/* If the user is NOT logged in (!user == true), show the welcome/hero banner */}
      {!user && (
        <div className="home-hero">
          <h1>Welcome to <span className="home-brand">Koma</span></h1>
          <p>Discover stories, ideas, and expertise</p>
          {/* Navigate to the signup page when they click the button */}
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
        {/* If there was an error fetching posts from the backend, show the error box */}
        {error && (
          <div className="error-box">
            <p className="error">{error}</p>
            {/* The user can click Try Again, which re-runs loadPosts() to fetch them once more */}
            <button onClick={loadPosts} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* If there is NO error, show the stories block */}
        {!error && (
          <>
            <div className="posts-header">
              <h2>Latest Stories</h2>
              {/* Display how many posts there currently are in total */}
              <p className="posts-count">{posts.length} {posts.length === 1 ? 'story' : 'stories'}</p>
            </div>

            {/* Check if the backend gave us an empty list of posts */}
            {posts.length === 0 ? (
              <div className="no-posts-container">
                <div className="no-posts">
                  <h3>No stories yet</h3>
                  <p>Be the first to share your thoughts</p>
                  {/* If they are logged in, we let them create a post */}
                  {user && (
                    <button className="create-btn" onClick={() => navigate('/create-post')}>
                      Create Your First Story
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // If there are posts, we map over the array, creating one <PostCard/> per post
              <div className="posts-container">
                <div className="posts-grid">
                  {/* Map loops through the list of posts. 
                      Each post gets its own PostCard component. 
                      Keys help React keep track of each individual element when mapping */}
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

      {/* ── Purple CTA Banner (Tumblr-style) — only for logged-out visitors ── */}
      {!user && (
        <div className="home-cta-banner">
          <p className="home-cta-banner-text">
            Join over <strong>thousands of people</strong> using{' '}
            <strong>Koma</strong> to share their{' '}
            <strong>thoughts</strong> and make{' '}
            <strong>connections</strong>.
          </p>
          <div className="home-cta-banner-actions">
            <Link to="/signup" className="home-cta-signup-btn">Sign up</Link>
            <Link to="/login" className="home-cta-login-btn">Log in</Link>
          </div>
        </div>
      )}
    </div>
  );
}

