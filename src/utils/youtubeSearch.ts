// YouTube Data API를 사용한 검색 함수
export async function searchYouTubeVideo(query: string): Promise<string | null> {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!API_KEY) {
    console.error('YouTube API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
    return null;
  }

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
