import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../api.js';
import '../styles/VideoFeed.css';

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function VideoCard({ video, onShare }) {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const thumbnailUrl = video.video_url.replace(/\.[^/.]+$/, '.jpg');
  const avatarColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  const username = video.username || video.user_id || 'Anonymous';
  const avatarColor = avatarColors[username.length % avatarColors.length];
  const descriptionText = (video.description || '').trim();
  const shouldTruncateDescription = descriptionText.length > 110;
  const displayedDescription =
    showFullDescription || !shouldTruncateDescription
      ? descriptionText
      : `${descriptionText.slice(0, 110)}...`;

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      await el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-card">
      <div className="video-wrapper" ref={wrapperRef}>
        <video
          ref={videoRef}
          src={video.video_url}
          poster={thumbnailUrl}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          preload="metadata"
          className="video-player"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />

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
              <button type="button" className="ctrl-btn" onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button type="button" className="ctrl-btn" onClick={() => skipBy(-10)}>
                -10s
              </button>
              <button type="button" className="ctrl-btn" onClick={() => skipBy(10)}>
                +10s
              </button>
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
          {descriptionText && (
            <p className="video-description">
              {displayedDescription}{' '}
              {shouldTruncateDescription && (
                <button
                  type="button"
                  className="description-toggle"
                  onClick={() => setShowFullDescription((prev) => !prev)}
                  aria-label={showFullDescription ? 'Show less description' : 'Show full description'}
                >
                  {showFullDescription ? 'less' : 'more'}
                </button>
              )}
            </p>
          )}
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
    } catch (err) {
      setError(err.message || 'Error occurred while loading videos');
    } finally {
      setLoading(false); // Hide the loading screen regardless of success or failure
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
          {videos.map((video) => (
            <VideoCard key={video.id || video._id} video={video} onShare={handleShare} />
          ))}
        </div>
      )}
    </div>
  );
}
