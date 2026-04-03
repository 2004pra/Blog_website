import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { deletePost } from '../api';
import '../styles/PostCard.css';

export default function PostCard({ post, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isOwnPost = user && user.id === post.user_id;

  const truncateContent = (text, maxLength = 150) => {
    if (isExpanded) return text;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffSeconds = Math.floor(diffTime / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffSeconds < 60) return 'just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return `${Math.floor(diffDays / 30)}m ago`;
    } catch {
      return 'Recently';
    }
  };

  const { token } = useContext(AuthContext);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id, token);
        if (onDelete) onDelete(post.id);
      } catch (error) {
        alert('Error deleting post: ' + error.message);
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit-post/${post.id}`);
  };

  return (
    <article className="post-card">
      <div className="post-card-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">{truncateContent(post.content)}</p>
        <div className="post-meta">
          <span className="post-date">{formatDate(post.created_at)}</span>
          {post.content.length > 150 && (
            <span 
              className="read-more" 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              style={{ cursor: 'pointer' }}
            >
              {isExpanded ? 'Show Less ↑' : 'Read More →'}
            </span>
          )}
        </div>
      </div>
      
      {isOwnPost && (
        <div className="post-actions" style={{
          padding: '1rem 2rem 0',
          display: 'flex',
          gap: '0.5rem',
          borderTop: '1px solid #f0f0f0',
        }}>
          <button
            onClick={handleEdit}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#764ba2'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ef5350',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c62828'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef5350'}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
