import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Music, Users, ExternalLink, Play } from 'lucide-react';
import { searchSpotifyArtists, SpotifyArtist } from '../utils/spotify';

interface SpotifyCategorySectionProps {
  title: string;
  query: string;
  onArtistClick: (artist: SpotifyArtist) => void;
}

export function SpotifyCategorySection({ title, query, onArtistClick }: SpotifyCategorySectionProps) {
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const results = await searchSpotifyArtists(query, 8);
        
        // 중복된 아티스트 제거
        const uniqueArtists = results.filter((artist, index, self) =>
          index === self.findIndex((a) => a.id === artist.id)
        );
        
        setArtists(uniqueArtists);
      } catch (error) {
        console.error('Failed to fetch artists:', error);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [query]);

  if (!loading && artists.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#131739] border-[#060629]">
              <Skeleton className="w-full aspect-square bg-[#1a1f4a]" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-[#1a1f4a]" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist, index) => (
            <Card
              key={`${artist.id}-${index}`}
              className="bg-[#131739] border-[#060629] hover:border-[#7342ff] transition-all overflow-hidden group cursor-pointer backdrop-blur-sm"
              onClick={() => onArtistClick(artist)}
            >
              <div className="relative w-full aspect-square bg-gradient-to-br from-[#1a1f4a] to-[#0f1229]">
                {artist.images && artist.images[0] ? (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-16 h-16 text-[#747798]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white line-clamp-2">{artist.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-[#747798] mt-2">
                  <Users className="w-3 h-3" />
                  <span>{(artist.followers.total / 1000000).toFixed(1)}M 팔로워</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs bg-[#1a1f4a] text-[#a5a6b9] border-none">
                    인기도: {artist.popularity}
                  </Badge>
                </div>
                {artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {artist.genres.slice(0, 2).map((genre, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-transparent border-[#3c4795] text-[#a5a6b9]">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-[#7342ff]/20 to-[#db65d1]/20 hover:from-[#7342ff]/30 hover:to-[#db65d1]/30 border-[#7342ff] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(artist.external_urls.spotify, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Spotify
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-[#1a1f4a] hover:bg-[#232961] border-[#3c4795] text-[#a5a6b9]"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(artist.name)}`, '_blank');
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    YouTube
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
