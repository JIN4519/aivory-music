// ⚠️ WARNING: In production, API credentials should NEVER be exposed in frontend code!
// This should be handled by a backend server. For demo purposes only.

const CLIENT_ID = '4fe5ff91e2404dd2bfc1fe5ab66eedd5';
const CLIENT_SECRET = '2db74dd451d3426d880aa7d42e5b572b';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getSpotifyToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Get new token
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify token');
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

    return accessToken;
  } catch (error) {
    console.error('Spotify authentication error:', error);
    throw error;
  }
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  preview_url: string | null;
  external_urls: { spotify: string };
  duration_ms: number;
  popularity: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; width: number; height: number }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
  followers: { total: number };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  tracks: { total: number };
  owner: { display_name: string };
}

export async function searchSpotifyArtists(query: string, limit = 10): Promise<SpotifyArtist[]> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}&market=KR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search Spotify artists');
    }

    const data = await response.json();
    return data.artists?.items || [];
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
}

export async function getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=KR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get artist top tracks');
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Spotify top tracks error:', error);
    return [];
  }
}

export async function searchSpotifyTracks(query: string, limit = 20): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=KR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search Spotify tracks');
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error('Spotify track search error:', error);
    return [];
  }
}

export async function getKoreanPlaylists(): Promise<SpotifyPlaylist[]> {
  try {
    const token = await getSpotifyToken();
    
    // Search for K-pop playlists
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=kpop korean&type=playlist&limit=20&market=KR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get Korean playlists');
    }

    const data = await response.json();
    return data.playlists?.items || [];
  } catch (error) {
    console.error('Spotify playlists error:', error);
    return [];
  }
}

export async function getCategoryPlaylists(category: string): Promise<SpotifyPlaylist[]> {
  try {
    const token = await getSpotifyToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(category)} korean&type=playlist&limit=10&market=KR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get category playlists');
    }

    const data = await response.json();
    return data.playlists?.items || [];
  } catch (error) {
    console.error('Spotify category playlists error:', error);
    return [];
  }
}
