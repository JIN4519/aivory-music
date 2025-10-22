import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ExternalLink, Loader2, Play, X } from 'lucide-react';

interface YouTubePlayerProps {
  trackName: string;
  artistName: string;
  spotifyUrl: string;
}

// YouTube Data API를 사용한 검색 함수
async function searchYouTubeVideo(query: string): Promise<string | null> {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!API_KEY) {
    console.error('YouTube API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=1&key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    
    return null;
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

export function YouTubePlayer({ trackName, artistName, spotifyUrl }: YouTubePlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const searchVideo = async () => {
      setLoading(true);
      
      // YouTube 검색어 생성 (official audio, mv 등 포함)
      const searchQuery = `${artistName} ${trackName} official`;
      const videoId = await searchYouTubeVideo(searchQuery);
      
      setVideoId(videoId);
      setLoading(false);
    };

    searchVideo();
  }, [trackName, artistName]);

  const searchQuery = encodeURIComponent(`${artistName} ${trackName} official`);
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  // 검색어로 대략적인 YouTube video URL 생성 (정확하지 않을 수 있음)
  // API 없이 임베드하려면 정확한 video ID가 필요하므로 검색 페이지로 안내
  const handlePlayInDialog = () => {
    if (videoId) {
      setIsDialogOpen(true);
    } else {
      // API key가 없으면 YouTube 검색 페이지로 이동
      window.open(youtubeSearchUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-[#131739] border-[#060629] mt-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-[#7342ff] animate-spin mb-3" />
          <p className="text-[#a5a6b9] text-sm">YouTube에서 곡을 검색하는 중...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 bg-[#131739] border-[#060629] mt-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-full mb-3">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <h4 className="text-white mb-2">🎵 Spotify 미리듣기를 사용할 수 없습니다</h4>
            <p className="text-[#a5a6b9] text-sm mb-1">
              {trackName}
            </p>
            <p className="text-[#747798] text-xs mb-4">
              by {artistName}
            </p>
            
            {videoId ? (
              <div className="mb-4">
                <Button
                  className="bg-gradient-to-r from-[#7342ff] to-[#db65d1] hover:from-[#6235e6] hover:to-[#c554be] text-white"
                  onClick={handlePlayInDialog}
                >
                  <Play className="w-4 h-4 mr-2" />
                  팝업으로 YouTube 재생하기
                </Button>
              </div>
            ) : (
              <p className="text-[#747798] text-sm mb-4">
                YouTube나 Spotify에서 전체 곡을 들어보세요!
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              variant="outline"
              className="bg-gradient-to-r from-red-600/20 to-red-500/20 border-red-600 text-red-400 hover:from-red-600/30 hover:to-red-500/30"
              onClick={() => window.open(youtubeSearchUrl, '_blank')}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube에서 검색
            </Button>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-green-600/20 to-green-500/20 border-green-600 text-green-400 hover:from-green-600/30 hover:to-green-500/30"
              onClick={() => window.open(spotifyUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Spotify
            </Button>
          </div>

          {!videoId && (
            <div className="mt-4 p-3 bg-[#1a1f4a] rounded-lg border border-[#3c4795]">
              <p className="text-[#a5a6b9] text-xs">
                💡 <span className="text-white">YouTube 자동 재생 기능을 사용하려면:</span><br/>
                YouTubePlayer.tsx 파일에서 YouTube Data API key를 설정하세요.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* YouTube Player Dialog/Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl bg-[#131739] border-[#7342ff] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              YouTube Player
            </DialogTitle>
            <DialogDescription className="text-[#a5a6b9]">
              {artistName} - {trackName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
            {videoId && (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${artistName} - ${trackName}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder="0"
              />
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              className="bg-gradient-to-r from-green-600/20 to-green-500/20 border-green-600 text-green-400 hover:from-green-600/30 hover:to-green-500/30"
              onClick={() => window.open(spotifyUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Spotify에서도 듣기
            </Button>
            <Button
              variant="outline"
              className="bg-[#1a1f4a] hover:bg-[#232961] border-[#3c4795] text-[#a5a6b9]"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
