import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Music } from 'lucide-react';
import { getChartTracksByQuery } from '../utils/spotify';
import { Track } from './GlobalMusicPlayer';

interface SpotifyChartSectionProps {
  title: string;
  query: string; // query used to find a chart/playlist, e.g. "kpop top 50" or "top 50"
  onPlay?: (t: Track) => void;
  onAddToQueue?: (t: Track) => void;
  // Called to start playback within the chart context — passes full track list and start index
  onStartContextPlay?: (tracks: Track[], startIndex: number) => void;
  // Add entire chart to user's queue
  onAddChartToQueue?: (tracks: Track[]) => void;
}

export function SpotifyChartSection({ title, query, onPlay, onAddToQueue, onStartContextPlay, onAddChartToQueue }: SpotifyChartSectionProps) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const t = await getChartTracksByQuery(query, 100);
        if (mounted) setTracks(t);
      } catch (e) {
        console.error('Failed to load chart tracks', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [query]);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6 justify-between">
        <div className="p-2 bg-gradient-to-r from-[#7342ff] to-[#db65d1] rounded-lg">
          <Music className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-white text-2xl">{title} ({tracks.length}곡)</h2>
        {onAddChartToQueue && tracks.length > 0 && (
          <div>
            <button
              className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg text-white text-sm"
              onClick={() => onAddChartToQueue(tracks.map((tr: any) => ({
                id: tr.id,
                name: tr.name,
                artist: tr.artists?.map((a: any) => a.name).join(', '),
                imageUrl: tr.album?.images?.[0]?.url,
                spotifyUrl: tr.external_urls?.spotify,
                previewUrl: tr.preview_url,
                youtubeVideoId: null,
              })))}
            >
              차트 전체 추가
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-[#131739] border-[#060629]">
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full bg-[#1a1f4a]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <Card className="bg-[#131739] border-[#060629]">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 mx-auto text-[#747798] mb-4" />
            <p className="text-[#a5a6b9] mb-2">차트 트랙을 불러올 수 없습니다</p>
            <p className="text-sm text-[#747798]">네트워크 혹은 API 제한을 확인하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tracks.map((track: any, idx: number) => (
            <Card key={`${track.id}-${idx}`} className="bg-[#131739] border-[#060629] hover:border-[#7342ff] transition-all">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-[#a5a6b9] font-bold text-lg w-8">#{idx + 1}</div>
                  {track?.album?.images?.[0] && (
                    <img src={track.album.images[0].url} alt={track.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-lg font-bold truncate mb-1">{track.name}</h3>
                    <p className="text-[#a5a6b9] truncate">{track.artists?.map((a: any) => a.name).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => {
                      if (onStartContextPlay) {
                        const mapped: Track[] = tracks.map((tr: any) => ({
                          id: tr.id,
                          name: tr.name,
                          artist: tr.artists?.map((a: any) => a.name).join(', '),
                          imageUrl: tr.album?.images?.[0]?.url,
                          spotifyUrl: tr.external_urls?.spotify,
                          previewUrl: tr.preview_url,
                          youtubeVideoId: null,
                        }));
                        onStartContextPlay(mapped, idx);
                        return;
                      }
                      if (onPlay) onPlay({
                        id: track.id,
                        name: track.name,
                        artist: track.artists?.map((a: any) => a.name).join(', '),
                        imageUrl: track.album?.images?.[0]?.url,
                        spotifyUrl: track.external_urls?.spotify,
                        previewUrl: track.preview_url,
                        youtubeVideoId: null,
                      });
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-[#7342ff] to-[#db65d1] text-white rounded-lg text-sm">
                      재생
                    </button>
                    <button onClick={() => onAddToQueue && onAddToQueue({
                      id: track.id,
                      name: track.name,
                      artist: track.artists?.map((a: any) => a.name).join(', '),
                      imageUrl: track.album?.images?.[0]?.url,
                      spotifyUrl: track.external_urls?.spotify,
                      previewUrl: track.preview_url,
                      youtubeVideoId: null,
                    })}
                    className="px-3 py-2 border border-[#7342ff] rounded-lg text-sm text-[#a5a6b9]">
                      추가
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
