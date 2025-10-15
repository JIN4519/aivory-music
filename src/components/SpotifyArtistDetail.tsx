import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { ArrowLeft, ExternalLink, Music, Users, Play, Globe, Instagram } from 'lucide-react';
import { 
  SpotifyArtist, 
  getArtistTopTracks, 
  getSpotifyToken,
  SpotifyTrack
} from '../utils/spotify';
import { SpotifyPlayer } from './SpotifyPlayer';
import { Track } from './GlobalMusicPlayer';

interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  total_tracks: number;
  external_urls: { spotify: string };
  album_type: string;
}

interface SpotifyArtistDetailProps {
  artist: SpotifyArtist;
  onBack: () => void;
  onTrackPlay?: (track: Track) => void;
}

export function SpotifyArtistDetail({ artist, onBack, onTrackPlay }: SpotifyArtistDetailProps) {
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [cantPlayDialogOpen, setCantPlayDialogOpen] = useState(false);
  const [cantPlayMessage, setCantPlayMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tracks = await getArtistTopTracks(artist.id);
        setTopTracks(tracks);
        
        // Fetch albums manually
        const token = await getSpotifyToken();
        const albumsResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single&market=KR&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (albumsResponse.ok) {
          const albumsData = await albumsResponse.json();
          setAlbums(albumsData.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artist.id]);

  return (
    <div className="min-h-screen bg-[#0b0d21]">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-[#131739] to-[#0b0d21] pt-20 pb-12">
        <div className="container mx-auto px-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>

          <div className="flex gap-8 items-end">
            <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1f4a] to-[#0f1229]">
              {artist.images && artist.images[0] ? (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-24 h-24 text-[#747798]" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl mb-4 text-white">{artist.name}</h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-gradient-to-r from-[#7342ff]/20 to-[#db65d1]/20 text-white border-[#7342ff] text-sm">
                  <Users className="w-3 h-3 mr-1" />
                  {(artist.followers.total / 1000000).toFixed(1)}M 팔로워
                </Badge>
                <Badge className="bg-[#1a1f4a] text-[#a5a6b9] border-[#3c4795] text-sm">
                  인기도: {artist.popularity}
                </Badge>
              </div>

              {artist.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {artist.genres.slice(0, 5).map((genre, idx) => (
                    <Badge key={idx} variant="outline" className="bg-transparent text-[#a5a6b9] border-[#3c4795]">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-gradient-to-r from-[#7342ff] to-[#db65d1] hover:from-[#6235e6] hover:to-[#c554be] text-white"
                  asChild
                >
                  <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Spotify
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-pink-600 text-pink-400 hover:from-pink-600/30 hover:to-purple-600/30"
                  asChild
                >
                  <a 
                    href={`https://www.instagram.com/explore/tags/${encodeURIComponent(artist.name.replace(/\s+/g, ''))}/`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-600 text-blue-400 hover:from-blue-600/30 hover:to-cyan-600/30"
                  asChild
                >
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(artist.name + ' official website')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    공식 홈페이지
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-8">
        <h2 className="text-white text-2xl mb-6">인기곡</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-[#131739] border-[#060629]">
                <Skeleton className="h-20 w-full bg-[#1a1f4a]" />
              </Card>
            ))}
          </div>
        ) : topTracks.length === 0 ? (
          <div className="text-center py-16 bg-[#131739] rounded-2xl border border-[#060629]">
            <Music className="w-16 h-16 mx-auto text-[#747798] mb-4" />
            <p className="text-[#747798]">인기곡 정보가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topTracks.map((track, index) => (
              <Card 
                key={track.id}
                className="bg-[#131739] border-[#060629] hover:border-[#7342ff] transition-all"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-[#747798] w-6 text-center">
                      {index + 1}
                    </div>
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-[#1a1f4a] to-[#0f1229] rounded-lg overflow-hidden">
                      {track.album.images && track.album.images[0] ? (
                        <img
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-[#747798]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white mb-1 line-clamp-1">{track.name}</h4>
                      <p className="text-sm text-[#a5a6b9] line-clamp-1">{track.album.name}</p>
                    </div>
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
                            youtubeVideoId = await searchYouTubeVideo(`${artist.name} ${track.name} official`);
                          } catch (error) {
                            console.error('YouTube search failed:', error);
                          }

                          const isPlayable = Boolean(track.preview_url) || Boolean(youtubeVideoId);
                          if (!isPlayable) {
                            setCantPlayMessage(`\"${track.name}\" 은(는) 미리듣기와 YouTube 재생 정보를 찾을 수 없습니다.`);
                            setCantPlayDialogOpen(true);
                            return;
                          }

                          onTrackPlay({
                            id: track.id,
                            name: track.name,
                            artist: artist.name,
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
                        onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist.name} ${track.name}`)}`, '_blank')}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        YouTube
                      </Button>
                    </div>
                  </div>

                  {playingTrack === track.id && track.preview_url && (
                    <SpotifyPlayer
                      previewUrl={track.preview_url}
                      trackName={track.name}
                      artistName={artist.name}
                      spotifyUrl={track.external_urls.spotify}
                      youtubeSearchUrl={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist.name} ${track.name}`)}`}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {cantPlayDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setCantPlayDialogOpen(false)} />
            <div className="relative bg-[#0b1024] border border-[#2b2f4f] rounded-lg p-6 w-[90%] max-w-md text-center">
              <p className="text-white mb-4">{cantPlayMessage}</p>
              <div className="flex justify-center">
                <Button onClick={() => setCantPlayDialogOpen(false)}>확인</Button>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-white text-2xl mt-12 mb-6">앨범</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-[#131739] border-[#060629]">
                <Skeleton className="w-full aspect-square bg-[#1a1f4a]" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-[#1a1f4a]" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16 bg-[#131739] rounded-2xl border border-[#060629]">
            <Music className="w-16 h-16 mx-auto text-[#747798] mb-4" />
            <p className="text-[#747798]">앨범 정보가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((album, index) => (
              <Card
                key={`${album.id}-${index}`}
                className="bg-[#131739] border-[#060629] hover:border-[#7342ff] transition-all overflow-hidden group cursor-pointer"
                onClick={() => window.open(album.external_urls.spotify, '_blank')}
              >
                <div className="relative w-full aspect-square bg-gradient-to-br from-[#1a1f4a] to-[#0f1229]">
                  {album.images && album.images[0] ? (
                    <img
                      src={album.images[0].url}
                      alt={album.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 h-16 text-[#747798]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardHeader>
                  <CardTitle className="text-base text-white line-clamp-2">{album.name}</CardTitle>
                  <div className="flex items-center justify-between text-xs text-[#747798] mt-2">
                    <span>{new Date(album.release_date).getFullYear()}</span>
                    <span>{album.total_tracks} 곡</span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
