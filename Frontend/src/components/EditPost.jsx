import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../api.js';
import '../styles/PostForm.css';

export default function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { postId } = useParams();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPost();
  }, [user, navigate, postId]);

  const loadPost = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to load post');
      }

      const allPosts = await response.json();
      const post = allPosts.find((p) => p.id === postId);

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.user_id !== user.id) {
        setError('You can only edit your own posts');
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load post');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/posts/update/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      alert('Post updated successfully! ✨');
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Error updating post');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="post-form-container">
        <p className="loading">Loading post...</p>
      </div>
    );
  }

  return (
    <div className="post-form-container">
      <div className="post-form-card">
        <h1>✏️ Edit Post</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
              disabled={loading}
              maxLength={100}
            />
            <small>{title.length}/100</small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Post Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Update your story..."
              required
              disabled={loading}
              rows={10}
              maxLength={5000}
            />
            <small>{content.length}/5000</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Post ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
