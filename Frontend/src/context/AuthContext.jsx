import { createContext, useState, useEffect } from 'react';
import { getRandomAnimeCharacter } from '../utils/animeAvatar.js';
import { API_BASE_URL } from '../api.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearPersistedAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('profilePicUrl');
  };

  const isTokenExpired = (authToken) => {
    if (!authToken || typeof authToken !== 'string') return true;

    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const exp = Number(payload?.exp);
      if (!Number.isFinite(exp)) return true;

      return exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  };

  const hydrateProfilePicture = async (authToken, baseUser) => {
    if (!authToken || !baseUser?.id) return baseUser;

    try {
      const profileRes = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!profileRes.ok) return baseUser;

      const profileData = await profileRes.json();
      const profilePicUrl = profileData?.user?.profile_pic_url || '';

      if (!profilePicUrl) return baseUser;

      const enrichedUser = {
        ...baseUser,
        profile_pic_url: profilePicUrl
      };

      localStorage.setItem('user', JSON.stringify(enrichedUser));
      localStorage.setItem('profilePicUrl', profilePicUrl);
      return enrichedUser;
    } catch {
      return baseUser;
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const bootstrapAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        if (isTokenExpired(savedToken)) {
          clearPersistedAuth();
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);

          const hydratedUser = await hydrateProfilePicture(savedToken, parsedUser);
          setUser(hydratedUser);
        } catch {
          clearPersistedAuth();
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const hydratedUser = await hydrateProfilePicture(data.token, data.user);

      setToken(data.token);
      setUser(hydratedUser);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(hydratedUser));

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

      const response = await fetch(`${API_BASE_URL}/signup`, {
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
    clearPersistedAuth();
    localStorage.removeItem('userCharacter');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
