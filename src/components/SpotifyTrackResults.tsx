import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Music, ExternalLink, Play } from 'lucide-react';
import { searchSpotifyTracks, SpotifyTrack } from '../utils/spotify';
import { SpotifyPlayer } from './SpotifyPlayer';

interface SpotifyTrackResultsProps {
  query: string;
  onTrackPlay?: (track: import('../components/GlobalMusicPlayer').Track) => void;
  onAddToQueue?: (track: import('../components/GlobalMusicPlayer').Track) => void;
}

export function SpotifyTrackResults({ query, onTrackPlay, onAddToQueue }: SpotifyTrackResultsProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setTracks([]);
      return;
    }

    const fetchSpotifyTracks = async () => {
      setLoading(true);
      try {
        const results = await searchSpotifyTracks(query, 20);
        
        const uniqueTracks = results.filter((track, index, self) =>
          index === self.findIndex((t) => t.id === track.id)
        );
        
        setTracks(uniqueTracks);
      } catch (error) {
        console.error('트랙 검색 오류:', error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSpotifyTracks, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!query) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gradient-to-r from-[#7342ff] to-[#db65d1] rounded-lg">
          <Music className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-white text-2xl">노래 검색 결과 ({tracks.length}개)</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-[#131739] border-[#060629]">
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full bg-[#1a1f4a]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <Card className="bg-[#131739] border-[#060629]">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 mx-auto text-[#747798] mb-4" />
            <p className="text-[#a5a6b9] mb-2">"{query}" 검색 결과가 없습니다</p>
            <p className="text-sm text-[#747798]">다른 검색어로 시도해보세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <Card
              key={`${track.id}-${index}`}
              className="bg-[#131739] border-[#060629] hover:border-[#7342ff] transition-all overflow-hidden"
            >
              <div className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-[#1a1f4a] to-[#0f1229] rounded-lg overflow-hidden">
                    {track.album.images && track.album.images[0] ? (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-[#747798]" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-white line-clamp-1 mb-1">
                      {track.name}
                    </CardTitle>
                    <p className="text-sm text-[#a5a6b9] line-clamp-1 mb-2">
                      {track.artists.map((artist) => artist.name).join(', ')}
                    </p>
                    <p className="text-xs text-[#747798] line-clamp-1 mb-3">
                      {track.album.name}
                    </p>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-[#7342ff]/20 to-[#db65d1]/20 border-[#7342ff] text-white hover:from-[#7342ff]/30 hover:to-[#db65d1]/30"
                        onClick={async () => {
                          if (!onTrackPlay) return;

                          // YouTube video ID 검색
                          let youtubeVideoId: string | null = null;
                          try {
                            const { searchYouTubeVideo } = await import('../utils/youtubeSearch');
                            youtubeVideoId = await searchYouTubeVideo(`${track.artists[0].name} ${track.name} official`);
                            console.log('YouTube Video ID:', youtubeVideoId);
                          } catch (error) {
                            console.error('YouTube search failed:', error);
                          }

                          // 디버그 로그
                          console.log('Track play request', { id: track.id, preview: track.preview_url, youtubeVideoId });

                          onTrackPlay({
                            id: track.id,
                            name: track.name,
                            artist: track.artists.map((artist) => artist.name).join(', '),
                            imageUrl: track.album.images?.[0]?.url,
                            spotifyUrl: track.external_urls.spotify,
                            previewUrl: track.preview_url,
                            youtubeVideoId: youtubeVideoId,
                          });
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        🎵 플레이어로 듣기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-[#4b5563]/10 to-[#4b5563]/10 border-[#3c3f46] text-[#a5a6b9] hover:bg-[#1a1f4a]"
                        onClick={() => {
                          if (!onAddToQueue) return;
                          onAddToQueue({
                            id: track.id,
                            name: track.name,
                            artist: track.artists.map((artist) => artist.name).join(', '),
                            imageUrl: track.album.images?.[0]?.url,
                            spotifyUrl: track.external_urls.spotify,
                            previewUrl: track.preview_url,
                            youtubeVideoId: null,
                          });
                        }}
                      >
                        ➕ 음악 추가
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-green-600/20 to-green-500/20 border-green-600 text-green-400 hover:from-green-600/30 hover:to-green-500/30"
                        onClick={() => window.open(track.external_urls.spotify, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Spotify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-red-600/20 to-red-500/20 border-red-600 text-red-400 hover:from-red-600/30 hover:to-red-500/30"
                        onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artists[0].name} ${track.name}`)}`, '_blank')}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        YouTube
                      </Button>
                    </div>
                  </div>
                </div>

                {playingTrack === track.id && track.preview_url && (
                  <SpotifyPlayer
                    previewUrl={track.preview_url}
                    trackName={track.name}
                    artistName={track.artists.map((artist) => artist.name).join(', ')}
                    spotifyUrl={track.external_urls.spotify}
                    youtubeSearchUrl={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artists[0].name} ${track.name}`)}`}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
