import { useState, useEffect, useRef, useContext } from 'react';
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

function VideoCard({ video, videoKey, likesCount, isLiked, isLiking, onLike, onShare, activeVideoId, onPlayStart }) {
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
      setSeekHint('▶');
    } else {
      el.pause();
      setIsPlaying(false);
      setSeekHint('⏸');
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
    setSeekHint(seconds > 0 ? '⏩ 5s' : '⏪ 5s');
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
    <div className="video-card">
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
            setIsPlaying(true);
          }}
          onPause={(e) => {
            setIsPlaying(false);
            setCurrentTime(e.currentTarget.currentTime || 0);
          }}
          onEnded={() => setIsPlaying(false)}
        />

        {!isPlaying && <div className="center-play-icon">▶</div>}
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
                {isPlaying ? '⏸' : '▶'}
              </button>
              {isFullscreen && (
                <>
                  <button type="button" className="ctrl-btn" onClick={() => skipBy(-5)}>
                    ⏪ 5s
                  </button>
                  <button type="button" className="ctrl-btn" onClick={() => skipBy(5)}>
                    5s ⏩
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
              <button type="button" className="ctrl-btn" onClick={() => onShare(video)}>
                Share
              </button>
              <button type="button" className="ctrl-btn" onClick={openFullscreen}>
                Full
              </button>
              <div className="more-menu" ref={menuRef}>
                <button
                  type="button"
                  className="ctrl-btn icon-btn"
                  onClick={() => setShowMenu((prev) => !prev)}
                  aria-label="Open video options"
                >
                  ⋮
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
        <div className="channel-avatar" style={{ backgroundColor: avatarColor }} title={username}>
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="video-details-text">
          <h3 className="video-title" title={video.title}>{video.title}</h3>
          <p className="channel-name">{username}</p>
          <div className="video-meta-row">
            <p className="video-meta">
            <span>{Math.floor(Math.random() * 900) + 10}K views</span>
            <span>&nbsp;•&nbsp;</span>
            <span>
              {new Date(video.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            </p>
            <button
              type="button"
              className={`video-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => onLike(extractVideoId(video))}
              disabled={isLiking}
              aria-label={isLiked ? 'Unlike video' : 'Like video'}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <span className="video-like-icon">♥</span>
              <span className="video-like-count">{likesCount}</span>
            </button>
          </div>
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
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [likesById, setLikesById] = useState({});
  const [likedById, setLikedById] = useState({});
  const [likeInFlight, setLikeInFlight] = useState({});
  const { token } = useContext(AuthContext);

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
    if (!token) {
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
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like video');
      }

      const statusRes = await fetch(`${API_BASE_URL}/likes/status/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
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

  return (
    <div className="video-feed-container">
      <div className="video-feed-header">
        <h1>Dashboard</h1>
        <p>{videos.length} videos</p>
      </div>

      {videos.length === 0 ? (
        <div className="no-videos">
          <p>No video blogs have been uploaded yet.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => {
            const videoKey = video.id || video._id || video.video_url;
            return (
            <VideoCard
              key={videoKey}
              video={video}
              videoKey={videoKey}
              likesCount={Number(likesById[extractVideoId(video)] ?? 0)}
              isLiked={Boolean(likedById[extractVideoId(video)])}
              isLiking={Boolean(likeInFlight[extractVideoId(video)])}
              onLike={handleLike}
              onShare={handleShare}
              activeVideoId={activeVideoId}
              onPlayStart={setActiveVideoId}
            />
            );
          })}
        </div>
      )}
    </div>
  );
}
