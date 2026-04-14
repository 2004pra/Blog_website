# React - Python Backend Connection Guide

## Architecture Overview

Your social media application has two separate parts:
- **Backend**: Python (Flask) running on `http://localhost:5000`
- **Frontend**: React + Vite running on `http://localhost:5173`

## How I Connected Them: Using Fetch API

### 1. **API Service Layer** (`src/api.js`)

I created a dedicated API service module that handles all HTTP communication with your Python backend using the native `fetch()` API:

```javascript
const API_BASE_URL = 'http://localhost:5000';

export const fetchPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/posts/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};
```

**Why this approach?**
- Uses the native browser Fetch API (no external dependencies)
- Centralized API endpoint management
- Error handling & try-catch blocks
- Easy to maintain and modify endpoints

### 2. **Key API Methods Created**

#### `fetchPosts()` - Get all feed posts
- **Endpoint**: `GET /posts/`
- **Purpose**: Retrieve all social feed posts from the database
- **Returns**: Array of post objects with id, title, content

#### `createPost(title, content, token)` - Create a new feed post
- **Endpoint**: `POST /posts/create_post`
- **Headers**: Includes Authorization token (Bearer token from login)
- **Purpose**: Create a new feed post
- **Requires**: User authentication token

#### `deletePost(postId, token)` - Delete a post
- **Endpoint**: `DELETE /posts/delete/{postId}`
- **Purpose**: Delete a specific blog post
- **Requires**: User must own the post

#### `updatePost(postId, title, content, token)` - Update a post
- **Endpoint**: `PUT /posts/update/{postId}`
- **Purpose**: Update existing post
- **Requires**: User must own the post

#### `signup(username, password)` - Register new user
- **Endpoint**: `POST /signup`
- **Purpose**: Create a new user account

#### `login(username, password)` - User authentication
- **Endpoint**: `POST /login`
- **Purpose**: Authenticate user and get JWT token

### 3. **Frontend Components**

#### `HomePage.jsx` - Feed Page
- **Purpose**: Displays all feed posts
- **Features**:
  - Fetches posts on component mount using `useEffect`
  - Shows loading state while fetching
  - Displays error messages if fetch fails
  - Renders empty state if no posts exist

#### `PostCard.jsx` - Individual Post Component
- **Purpose**: Displays a single blog post
- **Props**: Receives post object from HomePage
- **Shows**: Title, content, post ID

### 4. **Data Flow**

```
User Opens Browser
       ↓
React Component (HomePage) loads
       ↓
useEffect hook triggers on mount
       ↓
Calls fetchPosts() from api.js
       ↓
Fetch sends HTTP GET request to http://localhost:5000/posts/
       ↓
Python Backend (Flask) processes request
       ↓
Backend queries MongoDB for all posts
       ↓
Backend returns JSON array
       ↓
React receives JSON and setState(posts)
       ↓
Components re-render with post data
       ↓
User sees feed posts on screen
```

### 5. **CORS Configuration**

**Important Note**: Your React frontend and Python backend are on different ports, so you need CORS (Cross-Origin Resource Sharing) enabled on your Python backend.

Make sure your Flask app has CORS enabled:

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
```

Install Flask-CORS if not already installed:
```bash
pip install flask-cors
```

### 6. **Environment Setup**

#### Backend Setup:
```bash
cd Backend
pip install flask flask-cors flask-bcrypt pymongo python-dotenv
```

Create a `.env` file in Backend folder:
```
SECRET_KEY=your_secret_key_here
MONGO_URI=mongodb://localhost:27017/blog_db
```

Run Flask server:
```bash
python hello.py
# Backend will run on http://localhost:5000
```

#### Frontend Setup:
```bash
cd Frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

### 7. **HTTP Request Headers**

**For Public Requests (Get Posts):**
```javascript
{
  'Content-Type': 'application/json'
}
```

**For Protected Requests (Create/Delete/Update):**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

The token comes from successful login, typically stored in localStorage:
```javascript
// After login
localStorage.setItem('authToken', responseData.token);

// When making protected requests
const token = localStorage.getItem('authToken');
```

### 8. **Error Handling**

Each API function includes try-catch blocks:
```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('API Error');
  return await response.json();
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

### 9. **Testing Your Connection**

To test the connection:

1. **Start Backend**:
   ```bash
   cd Backend
   python hello.py
   ```

2. **Start Frontend**:
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Check Console**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Posts should be fetched from `http://localhost:5000/posts/`

### 10. **File Structure**

```
Frontend/
├── src/
│   ├── api.js                  # API service (all fetch calls)
│   ├── components/
│   │   ├── HomePage.jsx       # Main page showing all posts
│   │   └── PostCard.jsx       # Individual post display
│   ├── App.jsx                # Main app component
│   ├── App.css                # Styling for posts display
│   └── main.jsx               # React entry point
├── package.json
└── vite.config.js
```

## Summary

The connection works through:
1. **Fetch API** sends HTTP requests from React to Python
2. **API Service Layer** (`api.js`) manages all endpoint communication
3. **Components** use the API service to get/display data
4. **CORS** allows cross-origin requests between frontend and backend
5. **Authentication tokens** (JWT) for secured operations

This is a clean, modular, and scalable approach to connecting React with Python backends! 🚀
