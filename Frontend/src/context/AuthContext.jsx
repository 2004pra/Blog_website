import { createContext, useState, useEffect } from 'react';
import { getRandomAnimeCharacter } from '../utils/animeAvatar.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // If character not stored, fetch one for this user
      const existingCharacter = localStorage.getItem('userCharacter');
      if (!existingCharacter) {
        try {
          const character = await getRandomAnimeCharacter();
          localStorage.setItem('userCharacter', JSON.stringify(character));
          console.log('Anime character fetched and stored:', character);
        } catch (charError) {
          console.warn('Could not fetch anime character:', charError);
        }
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (username, password) => {
    try {
      // Get anime character for new user
      const character = await getRandomAnimeCharacter();
      console.log('Anime character fetched during signup:', character);

      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      // Store character info in localStorage immediately
      localStorage.setItem('userCharacter', JSON.stringify(character));
      console.log('Anime character stored in localStorage');

      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userCharacter');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
