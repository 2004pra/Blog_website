import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard.jsx';
import { API_BASE_URL } from '../api.js';
import '../styles/Profile.css';

export default function Profile() {
  const [userPosts, setUserPosts] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState(null);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!token) {
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
  }, [user, token, navigate]);

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      const [postsRes, videosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/posts/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/api/videos/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      if (!postsRes.ok || !videosRes.ok) {
        throw new Error('Failed to fetch profile content');
      }

      const allPosts = await postsRes.json();
      const allVideos = await videosRes.json();

      const normalizedPosts = (allPosts || [])
        .filter((post) => String(post.user_id) === String(user.id))
        .map((post) => ({
          ...post,
          username: post.username || user.username,
          created_at: post.created_at || null,
        }));

      const normalizedVideos = (allVideos || [])
        .filter((video) => String(video.user_id) === String(user.id))
        .map((video) => ({
          ...video,
          username: video.username || user.username,
          created_at: video.created_at || null,
        }));

      normalizedPosts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      normalizedVideos.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setUserPosts(normalizedPosts);
      setUserVideos(normalizedVideos);
      setError('');
    } catch (err) {
      setError('Failed to load your profile details');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };
  
  const handleVideoDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video forever?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/delete/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to delete video");
      
      setUserVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
      alert("Video deleted successfully! ✅");
    } catch(err) {
      alert("Error deleting video.");
    }
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

      <div className="profile-section">
        <h2>🎬 My Videos</h2>
        
        {loading && <p className="loading">Loading your videos...</p>}
        {error && <p className="error">{error}</p>}
        
        {!loading && userVideos.length === 0 && (
          <div className="no-posts">
            <p>You haven't uploaded any videos yet!</p>
            <button
              className="create-btn"
              onClick={() => navigate('/upload-video')}
            >
              Upload Your First Video
            </button>
          </div>
        )}

        {!loading && userVideos.length > 0 && (
          <div className="my-videos-grid">
            {userVideos.map((video) => (
              <div key={video.id} className="profile-video-card">
                <div className="video-thumb-container">
                  <video 
                    src={video.video_url} 
                    className="profile-video-player"
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    preload="metadata"
                  ></video>
                </div>
                <div className="profile-video-info">
                  <div className="profile-video-text">
                    <h4>{video.title}</h4>
                    <p className="profile-video-author">by {video.username || video.user_id || 'Unknown'}</p>
                  </div>
                  <button className="delete-btn" onClick={() => handleVideoDelete(video.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
