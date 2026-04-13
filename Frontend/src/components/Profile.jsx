import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard.jsx';
import { API_BASE_URL, fetchFollowView } from '../api.js';
import '../styles/Profile.css';

export default function Profile() {
  const [userPosts, setUserPosts] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
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

    const savedProfilePic = localStorage.getItem('profilePicUrl');
    setProfilePicUrl(user.profile_pic_url || savedProfilePic || '');
    
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
      const [postsRes, videosRes, profileRes] = await Promise.all([
        fetch(`${API_BASE_URL}/posts/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/api/videos/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }),
      ]);

      if (!postsRes.ok || !videosRes.ok) {
        throw new Error('Failed to fetch profile content');
      }

      const allPosts = await postsRes.json();
      const allVideos = await videosRes.json();
      let profileData = null;
      if (profileRes.ok) {
        profileData = await profileRes.json();
      }

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
      try {
        const followData = await fetchFollowView(user.id, token);
        setFollowers(Array.isArray(followData.followers) ? followData.followers : []);
        setFollowing(Array.isArray(followData.following) ? followData.following : []);
      } catch {
        setFollowers([]);
        setFollowing([]);
      }
      if (profileData?.user?.profile_pic_url) {
        setProfilePicUrl(profileData.user.profile_pic_url);
        localStorage.setItem('profilePicUrl', profileData.user.profile_pic_url);
      }
      setError('');
    } catch (err) {
      setError('Failed to load your profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (!token) {
      alert('Please login again to update your profile photo.');
      event.target.value = '';
      return;
    }

    setUploadingPhoto(true);

    try {
      const sigResponse = await fetch(`${API_BASE_URL}/get-signature`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!sigResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const signatureData = await sigResponse.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.api_key);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Image upload failed');
      }

      const uploadData = await cloudinaryResponse.json();
      const uploadedUrl = uploadData.secure_url;

      const saveResponse = await fetch(`${API_BASE_URL}/profilepic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile_pic_url: uploadedUrl })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save profile photo');
      }

      setProfilePicUrl(uploadedUrl);
      localStorage.setItem('profilePicUrl', uploadedUrl);
      alert('Profile photo updated successfully!');
    } catch (err) {
      alert(err.message || 'Could not update profile photo.');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
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
      alert("Video deleted successfully.");
    } catch(err) {
      alert("Error deleting video.");
    }
  };

  const handleOpenFollowProfile = (targetUserId) => {
    if (!targetUserId) return;
    if (String(targetUserId) === String(user?.id)) {
      navigate('/profile');
      return;
    }
    navigate(`/users/${targetUserId}`);
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt={user.username} />
          ) : character?.image ? (
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
            <span>U</span>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p className="profile-stats">{userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'} published</p>
          <div className="profile-follow-stats">
            <span>{followers.length} Followers</span>
            <span>{following.length} Following</span>
          </div>
          <label className={`profile-pic-btn ${uploadingPhoto ? 'disabled' : ''}`}>
            {uploadingPhoto ? 'Updating...' : 'Update Profile Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicSelect}
              disabled={uploadingPhoto}
            />
          </label>
        </div>
      </div>

      <div className="profile-section">
        <h2>Followers and Following</h2>
        <div className="profile-follow-controls">
          <button
            type="button"
            className="profile-follow-toggle-btn"
            onClick={() => setShowFollowers((prev) => !prev)}
          >
            {showFollowers ? 'Hide Followers' : 'Show Followers'}
          </button>
          <button
            type="button"
            className="profile-follow-toggle-btn"
            onClick={() => setShowFollowing((prev) => !prev)}
          >
            {showFollowing ? 'Hide Following' : 'Show Following'}
          </button>
        </div>

        <div className="profile-follow-grid">
          {showFollowers && (
            <div className="profile-follow-card">
              <h3>My Followers</h3>
              {followers.length === 0 ? (
                <p className="profile-follow-empty">No followers yet.</p>
              ) : (
                <ul className="profile-follow-list">
                  {followers.map((item, index) => (
                    <li key={`${item.user_id || item.username}-${index}`}>
                      <button
                        type="button"
                        className="profile-follow-user-btn"
                        onClick={() => handleOpenFollowProfile(item.user_id)}
                      >
                        {item.username || 'Unknown'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showFollowing && (
            <div className="profile-follow-card">
              <h3>My Following</h3>
              {following.length === 0 ? (
                <p className="profile-follow-empty">Not following anyone yet.</p>
              ) : (
                <ul className="profile-follow-list">
                  {following.map((item, index) => (
                    <li key={`${item.user_id || item.username}-${index}`}>
                      <button
                        type="button"
                        className="profile-follow-user-btn"
                        onClick={() => handleOpenFollowProfile(item.user_id)}
                      >
                        {item.username || 'Unknown'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2>My Posts</h2>

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
        <h2>My Videos</h2>
        
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
                    Delete
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
