import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { fetchFollowView, fetchUserProfile, toggleFollowUser } from '../api.js';
import PostCard from './PostCard.jsx';
import '../styles/PublicProfile.css';

function formatDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function PublicProfile() {
  const { user, token } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const isOwnProfile = useMemo(
    () => Boolean(user?.id && userId && String(user.id) === String(userId)),
    [user?.id, userId]
  );

  useEffect(() => {
    if (!user || !token) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchUserProfile(userId, token);
        const followData = await fetchFollowView(userId, token);
        setProfile({
          username: data.profile_username || 'Unknown',
          profilePic: data.profile_pic || '',
          userId: data.profile_user_id || userId,
          isFollowing: Boolean(data.is_following),
          posts: Array.isArray(data.profile_post) ? data.profile_post : [],
          videos: Array.isArray(data.profile_videos) ? data.profile_videos : []
        });
        setFollowers(Array.isArray(followData.followers) ? followData.followers : []);
        setFollowing(Array.isArray(followData.following) ? followData.following : []);
      } catch (err) {
        setError(err.message || 'Unable to load this profile right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, token, userId]);

  const handleFollowToggle = async () => {
    if (!profile || isOwnProfile || followBusy) return;

    try {
      setFollowBusy(true);
      const result = await toggleFollowUser(profile.userId, token);
      setProfile((prev) => {
        if (!prev) return prev;
        const nextFollow = typeof result.isFollowing === 'boolean' ? result.isFollowing : !prev.isFollowing;
        return {
          ...prev,
          isFollowing: nextFollow
        };
      });

      const followData = await fetchFollowView(profile.userId, token);
      setFollowers(Array.isArray(followData.followers) ? followData.followers : []);
      setFollowing(Array.isArray(followData.following) ? followData.following : []);
    } catch (err) {
      alert(err.message || 'Could not update follow status.');
    } finally {
      setFollowBusy(false);
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

  if (loading) {
    return <div className="public-profile-page-state">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="public-profile-page-state">
        <p>{error}</p>
        <button type="button" className="public-profile-secondary-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="public-profile-page-state">Profile not found.</div>;
  }

  return (
    <div className="public-profile-page">
      <header className="public-profile-header">
        <div className="public-profile-avatar">
          {profile.profilePic ? (
            <img src={profile.profilePic} alt={profile.username} />
          ) : (
            <span>{profile.username.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="public-profile-summary">
          <h1>{profile.username}</h1>
          <p>
            {profile.posts.length} {profile.posts.length === 1 ? 'post' : 'posts'} • {profile.videos.length}{' '}
            {profile.videos.length === 1 ? 'video' : 'videos'}
          </p>
          <p className="public-profile-follow-meta">
            {followers.length} Followers • {following.length} Following
          </p>
        </div>

        {!isOwnProfile ? (
          <button
            type="button"
            className={`public-profile-follow-btn ${profile.isFollowing ? 'active' : ''}`}
            onClick={handleFollowToggle}
            disabled={followBusy}
          >
            {followBusy ? 'Updating...' : profile.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        ) : (
          <button type="button" className="public-profile-secondary-btn" onClick={() => navigate('/profile')}>
            Open My Profile
          </button>
        )}
      </header>

      <section className="public-profile-section">
        <h2>Followers & Following</h2>
        <div className="public-profile-follow-controls">
          <button
            type="button"
            className="public-profile-follow-toggle-btn"
            onClick={() => setShowFollowers((prev) => !prev)}
          >
            {showFollowers ? 'Hide Followers' : 'Show Followers'}
          </button>
          <button
            type="button"
            className="public-profile-follow-toggle-btn"
            onClick={() => setShowFollowing((prev) => !prev)}
          >
            {showFollowing ? 'Hide Following' : 'Show Following'}
          </button>
        </div>
        <div className="public-profile-follow-grid">
          {showFollowers && (
            <div className="public-profile-follow-card">
              <h3>Followers</h3>
              {followers.length === 0 ? (
                <p className="public-profile-empty">No followers yet.</p>
              ) : (
                <ul className="public-profile-follow-list">
                  {followers.map((item, index) => (
                    <li key={`${item.user_id || item.username}-${index}`}>
                      <button
                        type="button"
                        className="public-profile-follow-user-btn"
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
            <div className="public-profile-follow-card">
              <h3>Following</h3>
              {following.length === 0 ? (
                <p className="public-profile-empty">Not following anyone yet.</p>
              ) : (
                <ul className="public-profile-follow-list">
                  {following.map((item, index) => (
                    <li key={`${item.user_id || item.username}-${index}`}>
                      <button
                        type="button"
                        className="public-profile-follow-user-btn"
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
      </section>

      <section className="public-profile-section">
        <h2>Posts</h2>
        {profile.posts.length === 0 ? (
          <p className="public-profile-empty">No posts yet.</p>
        ) : (
          <div className="public-profile-post-grid">
            {profile.posts.map((post, index) => (
              <PostCard
                key={`${post.title || 'post'}-${index}`}
                post={{
                  ...post,
                  id: `profile-post-${index}`,
                  user_id: profile.userId,
                  username: profile.username
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="public-profile-section">
        <h2>Videos</h2>
        {profile.videos.length === 0 ? (
          <p className="public-profile-empty">No videos yet.</p>
        ) : (
          <div className="public-profile-video-grid">
            {profile.videos.map((video, index) => (
              <article className="public-profile-video-card" key={`${video.title || 'video'}-${index}`}>
                <video controls preload="metadata" src={video.video_url} className="public-profile-video-player" />
                <div className="public-profile-video-content">
                  <h3>{video.title || 'Untitled Video'}</h3>
                  <p>{video.description || 'No description added.'}</p>
                  <div className="public-profile-video-meta">
                    <span>{video.views || 0} views</span>
                    <span>{video.likes || 0} likes</span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
