// YouTube Data API를 사용한 검색 함수
export async function searchYouTubeVideo(query: string): Promise<string | null> {
  const API_KEY = 'AIzaSyDPbu3zoKiL3WpYjhUowaTal9YazUq6ZC4';

  try {
  console.log('YouTube search query:', query);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=1&key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      console.log('YouTube search result:', data.items[0].id.videoId);
      return data.items[0].id.videoId;
    }
    
    return null;
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}
