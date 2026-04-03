import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard.jsx';
import { API_BASE_URL } from '../api.js';
import '../styles/Profile.css';

export default function Profile() {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Load anime character from localStorage
    const userCharacter = localStorage.getItem('userCharacter');
    if (userCharacter) {
      try {
        const char = JSON.parse(userCharacter);
        setCharacter(char);
        console.log('Character loaded in Profile:', char);
      } catch (e) {
        console.error('Error parsing character:', e);
      }
    }
    
    loadUserPosts();
  }, [user, navigate]);

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const allPosts = await response.json();
      // Filter posts for current user
      const myPosts = allPosts.filter((post) => post.user_id === user.id);
      setUserPosts(myPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setError('');
    } catch (err) {
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setUserPosts(userPosts.filter((post) => post.id !== postId));
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {character?.image ? (
            <img 
              src={character.image} 
              alt={character.name} 
              onError={(e) => {
                console.error('Failed to load profile avatar');
                e.target.style.display = 'none';
              }}
            />
          ) : user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p className="profile-stats">{userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'} published</p>
        </div>
      </div>

      <div className="profile-section">
        <h2>📝 My Posts</h2>

        {loading && <p className="loading">Loading your posts...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && userPosts.length === 0 && (
          <div className="no-posts">
            <p>You haven't created any posts yet!</p>
            <button
              className="create-btn"
              onClick={() => navigate('/create-post')}
            >
              Create Your First Post
            </button>
          </div>
        )}

        {!loading && userPosts.length > 0 && (
          <div className="my-posts-grid">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handlePostDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
