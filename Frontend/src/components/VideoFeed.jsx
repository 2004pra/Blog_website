import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { EllipsisVertical, MessageCircle, Pause, Play, SendHorizontal, UserCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/VideoFeed.css';

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function buildQualityUrl(url, quality) {
  if (!url || !url.includes('/upload/')) return url;

  if (quality === 'high') {
    return url.replace('/upload/', '/upload/q_auto:best,f_auto/');
  }

  if (quality === 'medium') {
    return url.replace('/upload/', '/upload/q_auto:good,f_auto,w_1280,c_limit/');
  }

  return url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_854,c_limit/');
}

function extractVideoId(video) {
  return video?.id || video?._id || '';
}

function VideoCard({
  video,
  videoKey,
  viewsCount,
  likesCount,
  isLiked,
  isLiking,
  onLike,
  onShare,
  activeVideoId,
  onPlayStart,
  comments,
  commentsOpen,
  commentsLoading,
  commentsError,
  commentValue,
  isCommentSubmitting,
  onToggleComments,
  onCommentChange,
  onCommentSubmit,
  onPlaybackChange,
  onOpenProfile,
  forceCommentsVisible = false,
  layoutMode = 'grid'
}) {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [quality, setQuality] = useState('high');
  const [showMenu, setShowMenu] = useState(false);
  const [seekHint, setSeekHint] = useState('');

  const playableUrl = buildQualityUrl(video.video_url, quality);
  const thumbnailUrl = video.video_url.replace(/\.[^/.]+$/, '.jpg');
  const avatarColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  const username = video.username || video.user_id || 'Anonymous';
  const avatarColor = avatarColors[username.length % avatarColors.length];
  const descriptionText = (video.description || '').trim();
  const [avatarError, setAvatarError] = useState(false);
  const commentCount = Array.isArray(comments) ? comments.length : 0;
  const shouldShowComments = layoutMode !== 'sidebar' && (forceCommentsVisible || commentsOpen);

  useEffect(() => {
    if (activeVideoId !== videoKey) {
      const el = videoRef.current;
      if (el && !el.paused) {
        el.pause();
      }
      setIsPlaying(false);
    }
  }, [activeVideoId, videoKey]);

  useEffect(() => {
    const closeMenuOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', closeMenuOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeMenuOnOutsideClick);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!seekHint) return;
    const timeout = setTimeout(() => setSeekHint(''), 700);
    return () => clearTimeout(timeout);
  }, [seekHint]);

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      await el.play();
      onPlayStart(videoKey);
      setIsPlaying(true);
      setSeekHint('Play');
    } else {
      el.pause();
      setIsPlaying(false);
      setSeekHint('Pause');
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const skipBy = (seconds) => {
    const el = videoRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(el.currentTime + seconds, duration || el.duration || 0));
    el.currentTime = target;
    setCurrentTime(target);
    setSeekHint(seconds > 0 ? 'Forward 5s' : 'Back 5s');
  };

  const onSeek = (event) => {
    const el = videoRef.current;
    if (!el || !duration) return;
    const percent = Number(event.target.value);
    const target = (percent / 100) * duration;
    el.currentTime = target;
    setCurrentTime(target);
  };

  const openFullscreen = async () => {
    const node = wrapperRef.current;
    if (!node || !node.requestFullscreen) return;
    await node.requestFullscreen();
  };

  const onPlayerKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      skipBy(5);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      skipBy(-5);
    } else if (event.key === ' ') {
      event.preventDefault();
      togglePlay();
    }
  };

  useEffect(() => {
    const onWindowKeyDown = (event) => {
      if (activeVideoId !== videoKey) return;
      const tagName = (event.target && event.target.tagName) || '';
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        skipBy(5);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        skipBy(-5);
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [activeVideoId, videoKey]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`video-card video-card--${layoutMode}`}>
      <div className="video-wrapper" ref={wrapperRef} tabIndex={0} onKeyDown={onPlayerKeyDown}>
        <video
          ref={videoRef}
          src={playableUrl}
          poster={thumbnailUrl}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          preload="metadata"
          className="video-player"
          onClick={togglePlay}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => {
            if (!e.currentTarget.paused) {
              setCurrentTime(e.currentTarget.currentTime || 0);
            }
          }}
          onPlay={() => {
            onPlayStart(videoKey);
            onPlaybackChange?.(videoKey, true);
            setIsPlaying(true);
          }}
          onPause={(e) => {
            onPlaybackChange?.(videoKey, false);
            setIsPlaying(false);
            setCurrentTime(e.currentTarget.currentTime || 0);
          }}
          onEnded={() => {
            onPlaybackChange?.(videoKey, false);
            setIsPlaying(false);
          }}
        />

        {!isPlaying && (
          <div className="center-play-icon" aria-hidden="true">
            <Play size={30} strokeWidth={2.4} />
          </div>
        )}
        {seekHint && <div className="seek-hint">{seekHint}</div>}

        {showDescription && descriptionText && (
          <div className="description-overlay">
            <p>{descriptionText}</p>
          </div>
        )}

        <div className="player-controls">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={onSeek}
            className="seek-bar"
            aria-label="Seek video"
          />

          <div className="controls-row">
            <div className="controls-left">
              <button
                type="button"
                className="ctrl-btn icon-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              {isFullscreen && (
                <>
                  <button type="button" className="ctrl-btn" onClick={() => skipBy(-5)}>
                    Back 5s
                  </button>
                  <button type="button" className="ctrl-btn" onClick={() => skipBy(5)}>
                    Forward 5s
                  </button>
                </>
              )}
              <button type="button" className="ctrl-btn" onClick={toggleMute}>
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <span className="time-label">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="controls-right">
              <button type="button" className="ctrl-btn share-control-btn" onClick={() => onShare(video)}>
                Share
              </button>
              <button type="button" className="ctrl-btn fullscreen-control-btn" onClick={openFullscreen}>
                Full
              </button>
              <div className="more-menu" ref={menuRef}>
                <button
                  type="button"
                  className="ctrl-btn icon-btn"
                  onClick={() => setShowMenu((prev) => !prev)}
                  aria-label="Open video options"
                >
                  <EllipsisVertical size={16} />
                </button>
                {showMenu && (
                  <div className="menu-popover">
                    <button
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        setShowDescription((prev) => !prev);
                        setShowMenu(false);
                      }}
                    >
                      {showDescription ? 'Hide description' : 'Show description'}
                    </button>
                    <div className="menu-label">Quality</div>
                    <div className="quality-group">
                      <button
                        type="button"
                        className={`quality-item ${quality === 'high' ? 'active' : ''}`}
                        onClick={() => setQuality('high')}
                      >
                        High
                      </button>
                      <button
                        type="button"
                        className={`quality-item ${quality === 'medium' ? 'active' : ''}`}
                        onClick={() => setQuality('medium')}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className={`quality-item ${quality === 'low' ? 'active' : ''}`}
                        onClick={() => setQuality('low')}
                      >
                        Data Saver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="video-details-container">
        <button
          type="button"
          className="channel-avatar-btn"
          onClick={() => onOpenProfile?.(video.user_id)}
          aria-label={`Open ${username} profile`}
        >
          <div className="channel-avatar" style={{ backgroundColor: avatarColor }} title={username}>
            {video.profile_pic_url && !avatarError ? (
              <img
                src={video.profile_pic_url}
                alt={username}
                onError={() => setAvatarError(true)}
              />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
        </button>

        <div className="video-details-text">
          <h3 className="video-title" title={video.title}>{video.title}</h3>
          <button
            type="button"
            className="channel-name channel-name-btn"
            onClick={() => onOpenProfile?.(video.user_id)}
          >
            {username}
          </button>
          <div className="video-meta-row">
            <p className="video-meta">
            <span>{Number(viewsCount ?? 0)} views</span>
            <span>&nbsp;•&nbsp;</span>
            <span>
              {new Date(video.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            </p>
            <div className="video-engagement-actions">
              <button
                type="button"
                className={`video-like-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => onLike(extractVideoId(video))}
                disabled={isLiking}
                aria-label={isLiked ? 'Unlike video' : 'Like video'}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <span className="video-like-icon">Like</span>
                <span className="video-like-count">{likesCount}</span>
              </button>
              <button
                type="button"
                className={`video-comment-btn ${commentsOpen ? 'active' : ''}`}
                onClick={() => onToggleComments(extractVideoId(video))}
                aria-label="Open comments"
                title="Comments"
              >
                <span className="video-comment-icon" aria-hidden="true">
                  <MessageCircle size={14} />
                </span>
                <span className="video-comment-count">{commentCount}</span>
              </button>
            </div>
          </div>

          {shouldShowComments && (
            <div className="video-comments-panel">
              {commentsLoading ? (
                <p className="video-comments-state">Loading comments...</p>
              ) : commentsError ? (
                <p className="video-comments-state error">{commentsError}</p>
              ) : comments && comments.length > 0 ? (
                <div className="video-comments-list">
                  {comments.map((item) => (
                    <div className="video-comment-item" key={item.id || `${item.user_id}-${item.created_at}`}>
                      <div className="video-comment-author-row">
                        <span className="video-comment-author-icon" aria-hidden="true">
                          <UserCircle2 size={14} />
                        </span>
                        <p className="video-comment-author">{item.username || 'Unknown'}</p>
                      </div>
                      <p className="video-comment-text">{item.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="video-comments-state">No comments yet.</p>
              )}

              <form
                className="video-comment-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  onCommentSubmit(extractVideoId(video));
                }}
              >
                <input
                  type="text"
                  className="video-comment-input"
                  value={commentValue}
                  onChange={(event) => onCommentChange(extractVideoId(video), event.target.value)}
                  placeholder="Write a comment..."
                  maxLength={300}
                />
                <button
                  type="submit"
                  className="video-comment-send"
                  disabled={isCommentSubmitting || !commentValue.trim()}
                >
                  {isCommentSubmitting ? 'Posting...' : (
                    <span className="video-comment-send-inner">
                      <SendHorizontal size={14} />
                      Post
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoFeed() {
  // State variables for data and generic UI states
  const [videos, setVideos] = useState([]); // Will hold the array of video objects from MongoDB
  const [loading, setLoading] = useState(true); // Shows "Loading..." initially
  const [error, setError] = useState(null); // Catches network errors
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [likesById, setLikesById] = useState({});
  const [viewsById, setViewsById] = useState({});
  const [likedById, setLikedById] = useState({});
  const [likeInFlight, setLikeInFlight] = useState({});
  const [commentsById, setCommentsById] = useState({});
  const [commentsOpenById, setCommentsOpenById] = useState({});
  const [commentsLoadingById, setCommentsLoadingById] = useState({});
  const [commentsAttemptedById, setCommentsAttemptedById] = useState({});
  const [commentErrorById, setCommentErrorById] = useState({});
  const [commentInputById, setCommentInputById] = useState({});
  const [commentSubmittingById, setCommentSubmittingById] = useState({});
  const [viewInFlight, setViewInFlight] = useState({});
  const viewedVideosRef = useRef(new Set());
  const { token, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOpenProfile = (targetUserId) => {
    if (!targetUserId) return;
    const authToken = resolveAuthToken();
    if (!authToken) {
      alert('Please login to view user profile.');
      navigate('/login');
      return;
    }
    navigate(`/users/${targetUserId}`);
  };

  const handleSessionExpired = (videoId, fallbackMessage = 'Session expired. Please login again.') => {
    if (videoId) {
      setCommentErrorById((prev) => ({ ...prev, [videoId]: fallbackMessage }));
    }
    logout();
  };

  const resolveAuthToken = () => {
    const contextToken = typeof token === 'string' ? token.trim() : '';
    if (contextToken && contextToken !== 'null' && contextToken !== 'undefined') {
      return contextToken;
    }

    const storedToken = (localStorage.getItem('authToken') || '').trim();
    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      return storedToken;
    }

    return '';
  };

  // Run exactly once when the component first loads
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      // Calls your Python endpoint: @videos_bp.route("/", methods=["GET"])
      const response = await fetch(`${API_BASE_URL}/api/videos/`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json(); // Parses JSON array from the backend
      setVideos(data); // Save the videos into React state

      const videoIds = data
        .map((video) => extractVideoId(video))
        .filter(Boolean);

      const viewCountEntries = data
        .map((video) => [extractVideoId(video), Number(video?.views || 0)])
        .filter(([videoId]) => Boolean(videoId));

      setViewsById(Object.fromEntries(viewCountEntries));

      const likeCountEntries = await Promise.all(
        videoIds.map(async (videoId) => {
          try {
            const countRes = await fetch(`${API_BASE_URL}/likes/like_count/${videoId}`);
            if (!countRes.ok) return [videoId, 0];
            const countData = await countRes.json();
            return [videoId, Number(countData.likes || 0)];
          } catch {
            return [videoId, 0];
          }
        })
      );

      setLikesById(Object.fromEntries(likeCountEntries));

      if (token) {
        const likeStatusEntries = await Promise.all(
          videoIds.map(async (videoId) => {
            try {
              const statusRes = await fetch(`${API_BASE_URL}/likes/status/${videoId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (!statusRes.ok) return [videoId, false];
              const statusData = await statusRes.json();
              return [videoId, Boolean(statusData.liked)];
            } catch {
              return [videoId, false];
            }
          })
        );

        setLikedById(Object.fromEntries(likeStatusEntries));
      } else {
        setLikedById({});
      }
    } catch (err) {
      setError(err.message || 'Error occurred while loading videos');
    } finally {
      setLoading(false); // Hide the loading screen regardless of success or failure
    }
  };

  const handleLike = async (videoId) => {
    if (!videoId) return;
    const authToken = resolveAuthToken();

    if (!authToken) {
      alert('Please login to like videos.');
      return;
    }

    if (likeInFlight[videoId]) return;

    const currentlyLiked = Boolean(likedById[videoId]);
    setLikeInFlight((prev) => ({ ...prev, [videoId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/likes/likes/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleSessionExpired('', 'Session expired. Please login again.');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to like video');
      }

      const statusRes = await fetch(`${API_BASE_URL}/likes/status/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setLikedById((prev) => ({ ...prev, [videoId]: Boolean(statusData.liked) }));
      } else {
        setLikedById((prev) => ({ ...prev, [videoId]: !currentlyLiked }));
      }

      const countRes = await fetch(`${API_BASE_URL}/likes/like_count/${videoId}`);
      if (countRes.ok) {
        const countData = await countRes.json();
        setLikesById((prev) => ({ ...prev, [videoId]: Number(countData.likes || 0) }));
      } else {
        setLikesById((prev) => ({
          ...prev,
          [videoId]: Math.max(Number(prev[videoId] || 0) + (currentlyLiked ? -1 : 1), 0)
        }));
      }
    } catch (err) {
      alert(err.message || 'Could not like this video right now.');
    } finally {
      setLikeInFlight((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  const fetchCommentsForVideo = async (videoId) => {
    if (!videoId) return;

    if (authLoading) {
      return;
    }

    const authToken = resolveAuthToken();

    if (!authToken) {
      setCommentErrorById((prev) => ({ ...prev, [videoId]: 'Login required to view comments.' }));
      setCommentsById((prev) => ({ ...prev, [videoId]: [] }));
      return;
    }

    setCommentsLoadingById((prev) => ({ ...prev, [videoId]: true }));
    setCommentsAttemptedById((prev) => ({ ...prev, [videoId]: true }));
    setCommentErrorById((prev) => ({ ...prev, [videoId]: '' }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/comment/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleSessionExpired(videoId, 'Session expired. Please login again.');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Could not load comments.');
      }

      const data = await response.json();
      setCommentsById((prev) => ({ ...prev, [videoId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      // Mark as loaded with empty data so we do not keep refetching in a loop.
      setCommentsById((prev) => ({ ...prev, [videoId]: prev[videoId] ?? [] }));
      setCommentErrorById((prev) => ({
        ...prev,
        [videoId]: err.message || 'Could not load comments.'
      }));
    } finally {
      setCommentsLoadingById((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  const incrementViewCount = async (videoId) => {
    if (!videoId) return;
    if (viewInFlight[videoId]) return;
    if (viewedVideosRef.current.has(videoId)) return;

    const authToken = resolveAuthToken();
    if (!authToken) return;

    setViewInFlight((prev) => ({ ...prev, [videoId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/videos/views/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleSessionExpired(videoId, 'Session expired. Please login again.');
        }
        return;
      }

      viewedVideosRef.current.add(videoId);
      setViewsById((prev) => ({ ...prev, [videoId]: Number(prev[videoId] || 0) + 1 }));
    } finally {
      setViewInFlight((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  const handleToggleComments = async (videoId) => {
    if (!videoId) return;

    const isOpen = Boolean(commentsOpenById[videoId]);
    setCommentsOpenById((prev) => ({ ...prev, [videoId]: !isOpen }));

    if (!isOpen && commentsById[videoId] === undefined) {
      await fetchCommentsForVideo(videoId);
    }
  };

  const handleCommentInputChange = (videoId, value) => {
    setCommentInputById((prev) => ({ ...prev, [videoId]: value }));
  };

  const handleCommentSubmit = async (videoId) => {
    if (!videoId) return;

    const rawComment = commentInputById[videoId] || '';
    const text = rawComment.trim();

    if (!text) return;

    if (authLoading) {
      setCommentErrorById((prev) => ({ ...prev, [videoId]: 'Checking login status. Please try again.' }));
      return;
    }

    const authToken = resolveAuthToken();

    if (!authToken) {
      alert('Please login to comment.');
      return;
    }

    if (commentSubmittingById[videoId]) return;

    setCommentSubmittingById((prev) => ({ ...prev, [videoId]: true }));
    setCommentErrorById((prev) => ({ ...prev, [videoId]: '' }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/comment/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ comment: text })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleSessionExpired(videoId, 'Session expired. Please login again.');
          throw new Error('Session expired. Please login again.');
        }
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Could not post comment.');
      }

      setCommentInputById((prev) => ({ ...prev, [videoId]: '' }));
      await fetchCommentsForVideo(videoId);
    } catch (err) {
      setCommentErrorById((prev) => ({
        ...prev,
        [videoId]: err.message || 'Could not post comment.'
      }));
    } finally {
      setCommentSubmittingById((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  const handlePlaybackChange = async (videoId, isPlaying) => {
    if (!videoId) return;

    if (isPlaying) {
      setActiveVideoId(videoId);
      setPlayingVideoId(videoId);
      incrementViewCount(videoId);
      return;
    }

    setPlayingVideoId((prev) => (prev === videoId ? null : prev));
  };

  useEffect(() => {
    if (authLoading || !resolveAuthToken()) return;

    const openVideoIds = Object.entries(commentsOpenById)
      .filter(([, isOpen]) => Boolean(isOpen))
      .map(([videoId]) => videoId);

    openVideoIds.forEach((videoId) => {
      const hasNoCommentsLoaded = commentsById[videoId] === undefined;
      const hasNotAttemptedFetch = !commentsAttemptedById[videoId];
      const hasAuthError = (commentErrorById[videoId] || '').toLowerCase().includes('login');
      const isLoading = Boolean(commentsLoadingById[videoId]);

      if (!isLoading && ((hasNoCommentsLoaded && hasNotAttemptedFetch) || hasAuthError)) {
        fetchCommentsForVideo(videoId);
      }
    });
  }, [authLoading, token, commentsOpenById, commentsLoadingById, commentsById, commentsAttemptedById, commentErrorById]);

  // 1. Handle UI state when waiting for the network
  if (loading) {
    return <div className="video-feed-loading">Loading Videos...</div>;
  }

  // 2. Handle UI state when an error occurs
  if (error) {
    return <div className="video-feed-error">{error}</div>;
  }

  // Secure Share Functionality
  const handleShare = async (video) => {
    try {
      await navigator.clipboard.writeText(video.video_url);
      alert('Video link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link. You can still manually share the video.');
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredVideos = videos.filter((video) => {
    if (!normalizedQuery) return true;

    const haystack = `${video.title || ''} ${video.description || ''} ${video.username || ''}`
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const focusedVideo = filteredVideos.find((video) => extractVideoId(video) === playingVideoId) || null;
  const sidebarVideos = focusedVideo
    ? filteredVideos.filter((video) => extractVideoId(video) !== extractVideoId(focusedVideo))
    : filteredVideos;

  return (
    <div className="video-feed-container">
      <div className="video-feed-header">
        <div className="video-feed-header-copy">
          <h1>Search Videos</h1>
          <p>{filteredVideos.length} of {videos.length} videos</p>
        </div>
        <input
          type="search"
          className="video-search-input"
          placeholder="Search by title, description, or creator"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search videos"
        />
      </div>

      {filteredVideos.length === 0 ? (
        <div className="no-videos">
          <p>{videos.length === 0 ? 'No video blogs have been uploaded yet.' : 'No videos match your search yet.'}</p>
        </div>
      ) : focusedVideo ? (
        <div className="video-focus-layout">
          <div className="video-focus-main">
            <VideoCard
              key={extractVideoId(focusedVideo) || focusedVideo.video_url}
              video={focusedVideo}
              videoKey={extractVideoId(focusedVideo) || focusedVideo.video_url}
              viewsCount={Number(viewsById[extractVideoId(focusedVideo)] ?? focusedVideo?.views ?? 0)}
              likesCount={Number(likesById[extractVideoId(focusedVideo)] ?? 0)}
              isLiked={Boolean(likedById[extractVideoId(focusedVideo)])}
              isLiking={Boolean(likeInFlight[extractVideoId(focusedVideo)])}
              onLike={handleLike}
              onShare={handleShare}
              activeVideoId={activeVideoId}
              onPlayStart={setActiveVideoId}
              comments={commentsById[extractVideoId(focusedVideo)] || []}
              commentsOpen={Boolean(commentsOpenById[extractVideoId(focusedVideo)])}
              commentsLoading={Boolean(commentsLoadingById[extractVideoId(focusedVideo)])}
              commentsError={commentErrorById[extractVideoId(focusedVideo)] || ''}
              commentValue={commentInputById[extractVideoId(focusedVideo)] || ''}
              isCommentSubmitting={Boolean(commentSubmittingById[extractVideoId(focusedVideo)])}
              onToggleComments={handleToggleComments}
              onCommentChange={handleCommentInputChange}
              onCommentSubmit={handleCommentSubmit}
              onPlaybackChange={handlePlaybackChange}
              onOpenProfile={handleOpenProfile}
              layoutMode="focused"
            />
          </div>

          <div className="video-focus-sidebar">
            {sidebarVideos.map((video) => {
              const videoId = extractVideoId(video);
              const videoKey = videoId || video.video_url;
              return (
                <VideoCard
                  key={videoKey}
                  video={video}
                  videoKey={videoKey}
                  viewsCount={Number(viewsById[videoId] ?? video?.views ?? 0)}
                  likesCount={Number(likesById[videoId] ?? 0)}
                  isLiked={Boolean(likedById[videoId])}
                  isLiking={Boolean(likeInFlight[videoId])}
                  onLike={handleLike}
                  onShare={handleShare}
                  activeVideoId={activeVideoId}
                  onPlayStart={setActiveVideoId}
                  comments={commentsById[videoId] || []}
                  commentsOpen={false}
                  commentsLoading={Boolean(commentsLoadingById[videoId])}
                  commentsError={commentErrorById[videoId] || ''}
                  commentValue={commentInputById[videoId] || ''}
                  isCommentSubmitting={Boolean(commentSubmittingById[videoId])}
                  onToggleComments={handleToggleComments}
                  onCommentChange={handleCommentInputChange}
                  onCommentSubmit={handleCommentSubmit}
                  onPlaybackChange={handlePlaybackChange}
                  onOpenProfile={handleOpenProfile}
                  layoutMode="sidebar"
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="video-grid">
          {filteredVideos.map((video) => {
            const videoId = extractVideoId(video);
            const videoKey = videoId || video.video_url;
            return (
            <VideoCard
              key={videoKey}
              video={video}
              videoKey={videoKey}
              viewsCount={Number(viewsById[videoId] ?? video?.views ?? 0)}
              likesCount={Number(likesById[videoId] ?? 0)}
              isLiked={Boolean(likedById[videoId])}
              isLiking={Boolean(likeInFlight[videoId])}
              onLike={handleLike}
              onShare={handleShare}
              activeVideoId={activeVideoId}
              onPlayStart={setActiveVideoId}
              comments={commentsById[videoId] || []}
              commentsOpen={Boolean(commentsOpenById[videoId])}
              commentsLoading={Boolean(commentsLoadingById[videoId])}
              commentsError={commentErrorById[videoId] || ''}
              commentValue={commentInputById[videoId] || ''}
              isCommentSubmitting={Boolean(commentSubmittingById[videoId])}
              onToggleComments={handleToggleComments}
              onCommentChange={handleCommentInputChange}
              onCommentSubmit={handleCommentSubmit}
              onPlaybackChange={handlePlaybackChange}
              onOpenProfile={handleOpenProfile}
            />
            );
          })}
        </div>
      )}
    </div>
  );
}
