import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../api.js';
import '../styles/VideoUpload.css';

export default function VideoUpload() {
  // 1. Defining State Variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null); // The actual physical file chosen by user
  const [loading, setLoading] = useState(false); // Disables buttons while uploading
  const [progress, setProgress] = useState(0); // Tracks upload percentage (0 to 100)
  const [error, setError] = useState(''); // Stores any error messages
  
  // 2. Getting Context & Navigation
  const { user, token } = useContext(AuthContext); // Get the logged-in user and their auth token
  const navigate = useNavigate(); // Lets us redirect the user after upload

  // Security Check: If no user is logged in, kick them out to login page
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handling File Selection
  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0]; // Get the first file selected
    
    // Check if file is actually a video
    if (file && !file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      setVideoFile(null);
      e.target.value = null; // reset input
      return;
    }
    setVideoFile(file); // Save file to state
  };

  // The Main Upload Logic
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop regular form submission
    if (!videoFile || !title || !description) {
      setError('Please fill all fields and select a video.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    // 1. First, ask the Python backend for a secure uploading "signature"
    let signatureData;
    try {
      const sigResponse = await fetch(`${API_BASE_URL}/get-signature`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Show our JWT so the backend trusts us
        }
      });
      if (!sigResponse.ok) throw new Error('Failed to get upload signature');
      signatureData = await sigResponse.json();
    } catch (err) {
      setError(err.message || 'Could not authenticate upload process.');
      setLoading(false);
      return;
    }

    // 2. Setup payload for Cloudinary Secure Signed Upload
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('api_key', signatureData.api_key); // The public API key
    formData.append('timestamp', signatureData.timestamp); // Expiration timestamp
    formData.append('signature', signatureData.signature); // The cryptographic signature!

    // 3. Use XMLHttpRequest to track upload progress (to the signed endpoint)
    const xhr = new XMLHttpRequest();
    // We dynamically use the cloud_name given by the backend
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/video/upload`, true);

    // 4. Update progress bar as it uploads
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setProgress(percentComplete);
      }
    };

    // 5. Triggered when Cloudinary is done receiving the video
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        const video_url = response.secure_url; // We got the Cloudinary URL!

        // 6. Send Title, Description, and URL to our Python backend
        try {
          const backendRes = await fetch(`${API_BASE_URL}/api/videos/Upload_video`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title,
              description,
              video_url
            })
          });

          if (!backendRes.ok) {
            const data = await backendRes.json();
            throw new Error(data.error || 'Failed to save to database');
          }

          alert('Video uploaded successfully! 🎉');
          navigate('/videos');
        } catch (err) {
          setError(err.message || 'Error saving video to backend');
          setLoading(false);
        }
      } else {
        const errorResponse = JSON.parse(xhr.responseText);
        setError(errorResponse.error?.message || 'Failed to upload video to Cloudinary');
        setLoading(false);
      }
    };

    xhr.onerror = () => {
      setError('An error occurred during the video upload.');
      setLoading(false);
    };

    xhr.send(formData); // Officially start the Cloudinary upload process
  };

  return (
    <div className="video-form-container">
      <div className="video-form-card">
        <h2>Upload Video Blog 🎬</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your video a catchy title..."
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this video about?"
              disabled={loading}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={loading}
              required
            />
          </div>

          {loading && (
            <div className="progress-container">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {progress < 100 ? `Uploading to Cloudinary: ${progress}%` : 'Finalizing Data...'}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || !videoFile || !title || !description}
          >
            {loading ? 'Uploading...' : 'Publish Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
