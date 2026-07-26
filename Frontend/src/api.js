// API service to connect React to Python backend
// We use the environment variable VITE_API_URL if it exists (for production/deployment), 
// otherwise we default to 'http://localhost:5000' which is where the Python backend usually runs locally.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fetches all the posts from the backend. Notice there's no token required here, so it's a public endpoint.
export const fetchPosts = async () => {
  try {
    // Make a network GET request to the backend backend
    const response = await fetch(`${API_BASE_URL}/posts/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // If the server replies with an error status (like 404 or 500), throw an error
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    // Parse the JSON data sent by the python API
    const data = await response.json();
    return data;
  } catch (error) {
    // If there's a problem (e.g. backend is down), log it to the console
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Sends data to the backend to create a new post
export const createPost = async (title, content, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/create_post`, {
      method: 'POST', // POST is used for creating new data on the server
      headers: {
        'Content-Type': 'application/json',
        // Pass the token so the backend knows *who* is trying to create the post
        'Authorization': `Bearer ${token}`,
      },
      // Convert our title and content into a JSON string that the Python server can understand
      body: JSON.stringify({ title, content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Sends a DELETE request to tell the server to delete a given post
export const deletePost = async (postId, token) => {
  try {
    // Send a DELETE request to the URL corresponding to the post we want to delete
    const response = await fetch(`${API_BASE_URL}/posts/delete/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Authorization token confirms this user is allowed to delete this specific post
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Sends a PUT request to update the title and content of an existing post
export const updatePost = async (postId, title, content, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/update/${postId}`, {
      method: 'PUT', // PUT is standard for completely updating an existing item
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // Pass the updated fields to the backend
      body: JSON.stringify({ title, content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update post');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Submits a new user's username and password to create an account
export const signup = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to signup');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

// Submits a user's details to log in. This typically returns the user data plus an auth token
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to login');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Retrieves another user's profile based on their user ID
export const fetchUserProfile = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Send token in case we need to know whether the person viewing the profile is following the profile's owner
      'Authorization': `Bearer ${token}`
    }
  });

  // Since we don't have a try-catch catching syntax errors here, 
  // we catch JSON parsing errors by defaulting to an empty object `{}`
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load user profile');
  }

  // Returns the profile data
  return payload;
};

// Follows or unfollows a specific user in the database
export const toggleFollowUser = async (targetUserId, token) => {
  const response = await fetch(`${API_BASE_URL}/follow/${targetUserId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We must authorize so the backend knows who is doing the following
      'Authorization': `Bearer ${token}`
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Failed to update follow status');
  }

  // Returns whether they are now followed or unfollowed
  return payload;
};

// Gets the list of followers and people a person is following
export const fetchFollowView = async (targetUserId, token) => {
  // Makes a request to get follow statistics for that specific user ID
  const response = await fetch(`${API_BASE_URL}/follow/view/${targetUserId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load followers/following');
  }

  return payload;
};
