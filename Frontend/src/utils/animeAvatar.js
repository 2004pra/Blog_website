import { useEffect, useState } from 'react';

// Jikan API - Free anime character avatars
export const getRandomAnimeCharacter = async () => {
  try {
    // Get a random character from Jikan API
    const randomPage = Math.floor(Math.random() * 50) + 1;
    console.log('Fetching anime character from page:', randomPage);
    
    const response = await fetch(`https://api.jikan.moe/v4/characters?limit=1&page=${randomPage}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No character data received');
    }
    
    const character = data.data[0];
    
    if (!character.images?.jpg?.image_url) {
      throw new Error('Character missing image URL');
    }

    const result = {
      name: character.name || 'Anime User',
      image: character.images.jpg.image_url,
      characterId: character.mal_id,
    };
    
    console.log('Successfully fetched anime character:', result);
    return result;
  } catch (error) {
    console.error('Error fetching character from Jikan API:', error);
    // Fallback to a default character
    const fallback = {
      name: 'Anime Fan',
      image: 'https://via.placeholder.com/64/667eea/ffffff?text=Avatar',
      characterId: 0,
    };
    console.log('Using fallback character:', fallback);
    return fallback;
  }
};

export const useAnimeCharacter = () => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacter = async () => {
      const char = await getRandomAnimeCharacter();
      setCharacter(char);
      setLoading(false);
    };

    loadCharacter();
  }, []);

  return { character, loading };
};
