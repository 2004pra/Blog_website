# 🚀 Koma - Social Media Platform Frontend

## Overview
A complete, production-ready social media frontend built with React, featuring user authentication, post creation, and profile management.

---

## 🎨 Features Implemented

### ✅ Authentication System
- **Login Page** - User authentication with JWT tokens
- **Signup Page** - New user registration with password validation
- **Auth Context** - Global state management for user sessions
- **Protected Routes** - Private pages require authentication

### 📝 Social Features
- **Home Page** - Beautiful hero section with all posts
- **Create Post** - Rich post creation form with character limits
- **Profile Page** - User dashboard showing their posts
- **Post Cards** - Stunning card design with hover effects
- **Delete Posts** - Remove posts from profile

### 🎭 UI/UX Components
- **Navbar** - Responsive navigation with auth status
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Loading States** - Beautiful loading indicators
- **Error Handling** - User-friendly error messages
- **Smooth Animations** - Modern transitions and effects

---

## 📁 File Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation bar
│   │   ├── HomePage.jsx            # Home page
│   │   ├── Login.jsx               # Login form
│   │   ├── Signup.jsx              # Registration form
│   │   ├── Profile.jsx             # User profile
│   │   ├── CreatePost.jsx          # Post creation
│   │   └── PostCard.jsx            # Post display
│   ├── context/
│   │   └── AuthContext.jsx         # Auth state management
│   ├── styles/
│   │   ├── Navbar.css              # Navbar styling
│   │   ├── HomePage.css            # Homepage styling
│   │   ├── Auth.css                # Auth pages styling
│   │   ├── PostCard.css            # Post card styling
│   │   ├── PostForm.css            # Create post form styling
│   │   └── Profile.css             # Profile page styling
│   ├── api.js                      # API service (fetch calls)
│   ├── App.jsx                     # Main app with routing
│   ├── App.css                     # Global app styles
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Pages & Routes

| Route | Component | Auth Required | Purpose |
|-------|-----------|---------------|---------|
| `/` | HomePage | No | Display all posts |
| `/login` | Login | No | User authentication |
| `/signup` | Signup | No | User registration |
| `/profile` | Profile | ✅ Yes | User's posts dashboard |
| `/create-post` | CreatePost | ✅ Yes | Create new post |

---

## 🔌 How It Connects to Backend

### API Endpoints Used:
```javascript
POST   /signup              - Register new user
POST   /login               - User authentication
GET    /posts/              - Get all posts
POST   /posts/create_post   - Create post (requires token)
DELETE /posts/delete/<id>   - Delete post (requires token)
PUT    /posts/update/<id>   - Update post (requires token)
```

### Authentication Flow:
```
User → Signup/Login Form
    ↓
Send credentials to /signup or /login
    ↓
Backend returns JWT token
    ↓
Store token in localStorage
    ↓
Include token in Authorization header for protected routes
```

### Data Flow Example - Creating a Post:
```javascript
// CreatePost.jsx
await fetch('http://localhost:5000/posts/create_post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // JWT token
  },
  body: JSON.stringify({ title, content })
});
```

---

## 🎨 Design System

### Color Palette
- **Primary Gradient**: `#667eea` → `#764ba2` (Purple)
- **Success**: `#27ae60` (Green)
- **Error**: `#ff6b6b` (Red)
- **Background**: `#f8f9fa` (Light Gray)
- **Text**: `#333` (Dark)

### Key Design Elements
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Gradient backgrounds, hover animations
- **Forms**: Clean inputs with focus states
- **Animations**: Smooth transitions, slide-in effects
- **Responsive**: Mobile-first approach

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd Frontend
npm install
npm install react-router-dom
```

### 2. Start Backend (Python Flask)
```bash
cd Backend
python -m venv venv
venv\Scripts\Activate.ps1  # Windows
pip install flask flask-cors flask-bcrypt pymongo python-dotenv pyjwt
python hello.py
```

Backend will run on: **http://localhost:5000**

### 3. Start Frontend (React)
```bash
cd Frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 📋 Component Details

### AuthContext.jsx
- **Manages**: User state, authentication tokens
- **Methods**: login(), signup(), logout()
- **Storage**: localStorage for persistence
- **Features**: Auto-login on page refresh

### Navbar.jsx
- **Dynamic**: Shows different links based on auth status
- **Links**: Home, Create Post, Profile, Logout
- **Sticky**: Stays at top while scrolling
- **Gradient**: Beautiful purple gradient background

### HomePage.jsx
- **Hero Section**: Welcome message with CTA
- **All Posts**: Grid of posts from all users
- **Empty State**: Message when no posts exist
- **Loading**: Animated loading indicator

### Profile.jsx
- **User Info**: Avatar, username, post count
- **My Posts**: Only user's own posts
- **Delete**: Remove posts with confirmation
- **Create**: Button to create new post

### CreatePost.jsx
- **Form Fields**: Title (100 chars), Content (5000 chars)
- **Character Count**: Real-time display
- **Validation**: Required fields checker
- **Submit**: Create post with loader

---

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Protected Routes** - Private pages require login
3. **Password Hashing** - Backend hashes passwords
4. **CORS Enabled** - Controlled cross-origin access
5. **Token Storage** - LocalStorage for session persistence

---

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

---

## 🎯 User Stories

### As a Visitor
- ✅ View all blog posts
- ✅ See post previews with truncated content
- ✅ Click signup/login buttons
- ✅ Navigate responsive website

### As a Logged-In User
- ✅ Create new blog posts
- ✅ View my profile
- ✅ See all my posts
- ✅ Delete my own posts
- ✅ Logout safely

### Technical
- ✅ Fetch data from Python backend
- ✅ Handle authentication tokens
- ✅ Request validation
- ✅ Error handling
- ✅ Loading states

---

## 🛠️ API Integration Details

### Setup for Development

**Make sure your Flask backend has CORS enabled:**

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Already added in hello.py
```

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

Edit in `src/api.js` if running backend on different port.

---

## 📊 State Management

### AuthContext Provides:
- `user` - Current logged-in user object
- `token` - JWT authentication token
- `loading` - Loading state during auth checks
- `login()` - Authenticate user
- `signup()` - Register new user
- `logout()` - Clear session

---

## ✨ Styling Highlights

### Gradient Colors
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Card Shadows
```css
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
```

### Hover Effects
```css
transform: translateY(-8px);
box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
```

---

## 🐛 Troubleshooting

### Problem: Backend not connecting
**Solution**: Make sure Flask backend is running on http://localhost:5000
```bash
cd Backend
python hello.py
```

### Problem: CORS errors
**Solution**: Ensure CORS is enabled in Flask
```bash
pip install flask-cors
```

### Problem: Posts not loading
**Solution**: Check if MongoDB is running and connected correctly

### Problem: Login fails
**Solution**: 
1. Check backend is running
2. Verify credentials are correct
3. Check network tab for error details

---

## 🎓 Learning Points

This project demonstrates:
- ✅ React functional components and hooks
- ✅ React Router for navigation
- ✅ Context API for state management
- ✅ Fetch API for HTTP requests
- ✅ Form handling and validation
- ✅ Authentication flow
- ✅ Responsive CSS Grid
- ✅ CSS animations
- ✅ Protected routes
- ✅ Error handling

---

## 🚀 Future Enhancements

Possible improvements:
- 🔍 Search functionality
- ❤️ Like/favorite posts
- 💬 Comments on posts
- 📝 Edit existing posts
- 🖼️ Image uploads
- 🌙 Dark mode
- 🏷️ Tags/categories
- 👥 Follow users
- 🔔 Notifications
- 📊 Dashboard analytics

---

## 📝 License

This project is built for educational purposes.

---

## 🙋 Questions?

If you encounter any issues:
1. Check if backend is running
2. Check browser console for errors (F12)
3. Check network tab to see API calls
4. Verify all dependencies are installed
5. Make sure ports 5000 (backend) and 5173 (frontend) are available

---

**Built with ❤️ using React + Node.js + Python Flask**

Happy Blogging! 🎉
