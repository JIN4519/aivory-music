import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Play, Pause, Volume2, VolumeX, X, Maximize2, Minimize2, ExternalLink, SkipBack, SkipForward } from 'lucide-react';

export interface Track {
  id: string;
  name: string;
  artist: string;
  imageUrl?: string;
  spotifyUrl?: string;
  previewUrl?: string | null;
  youtubeVideoId?: string | null;
}

interface GlobalMusicPlayerProps {
  track: Track | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function GlobalMusicPlayer({ track, onClose, onNext, onPrev }: GlobalMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Spotify Audio Player
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.previewUrl) return;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Auto-play failed:', error);
      }
    };

    playAudio();

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 30);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) onNext();
    };

    const handleAudioError = async () => {
      console.error('Audio playback error detected');
      setIsPlaying(false);
      // If we already have a youtube id, open expanded YouTube player
      if (track?.youtubeVideoId) {
        setIsExpanded(true);
        return;
      }
      // Otherwise, attempt to search YouTube automatically and expand if found
      try {
        const { searchYouTubeVideo } = await import('../utils/youtubeSearch');
        const q = `${track?.artist ?? ''} ${track?.name ?? ''} official`;
        const vid = await searchYouTubeVideo(q);
        if (vid) {
          // update track youtubeVideoId by creating a small local update via ref
          // since props are immutable here, we just expand and rely on parent to update if needed
          // but we can open the YouTube player using found vid
          (track as any).youtubeVideoId = vid; // best-effort local enrichment for immediate view
          setIsExpanded(true);
        } else {
          console.warn('YouTube fallback not found');
        }
      } catch (e) {
        console.error('YouTube fallback search failed', e);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('stalled', handleAudioError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('stalled', handleAudioError);
    };
  }, [track?.previewUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 자동으로 YouTube-only 트랙일 때 확장
  useEffect(() => {
    if (!track) return;
    if (!track.previewUrl && track.youtubeVideoId) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [track?.youtubeVideoId, track?.previewUrl]);

  const togglePlay = () => {
    if (track?.previewUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (track?.previewUrl && audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  // 디버깅용 로그
  console.log('GlobalMusicPlayer Track:', {
    name: track.name,
    artist: track.artist,
    hasPreviewUrl: !!track.previewUrl,
    hasYouTubeId: !!track.youtubeVideoId,
    youtubeVideoId: track.youtubeVideoId
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-all mb-32">
      <Card className={`bg-[#131739] border-t-2 border-[#7342ff] shadow-2xl transition-all ${isExpanded ? 'h-[400px] mr-[400px]' : 'h-24 mr-[400px]'}`}>
        {/* Audio element for Spotify preview */}
        {track.previewUrl && <audio ref={audioRef} src={track.previewUrl} />}

        {/* Expanded YouTube Player */}
        {isExpanded && track.youtubeVideoId && !track.previewUrl && (
          <div className="p-4 border-b border-[#060629] h-[calc(100%-96px)]">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${track.youtubeVideoId}?autoplay=1&controls=1`}
              title={`${track.artist} - ${track.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* YouTube video ID 없을 때 메시지 */}
        {isExpanded && !track.youtubeVideoId && !track.previewUrl && (
          <div className="p-4 border-b border-[#060629] h-[calc(100%-96px)] flex items-center justify-center">
            <div className="text-center">
              <p className="text-white mb-2">YouTube 영상을 찾을 수 없습니다</p>
              <p className="text-[#747798] text-sm mb-4">아래 버튼으로 자동 검색하거나 YouTube에서 직접 열어보세요</p>
              <div className="flex items-center gap-2 justify-center">
                <Button
                  onClick={async () => {
                    try {
                      const { searchYouTubeVideo } = await import('../utils/youtubeSearch');
                      const q = `${track.artist} ${track.name} official`;
                      const vid = await searchYouTubeVideo(q);
                      if (vid) {
                        // best-effort immediate UI update
                        (track as any).youtubeVideoId = vid;
                        setIsExpanded(true);
                      } else {
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.name}`)}`, '_blank');
                      }
                    } catch (e) {
                      console.error('YouTube search failed', e);
                      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.name}`)}`, '_blank');
                    }
                  }}
                  className="bg-gradient-to-r from-[#7342ff] to-[#db65d1]"
                >
                  찾아서 재생
                </Button>
                <Button
                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.name}`)}`, '_blank')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  YouTube에서 열기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Player Controls */}
        <div className="flex items-center gap-4 p-4 h-24">
          {/* Album Art & Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-14 h-14 flex-shrink-0 bg-gradient-to-br from-[#1a1f4a] to-[#0f1229] rounded-lg overflow-hidden">
              {track.imageUrl ? (
                <img
                  src={track.imageUrl}
                  alt={track.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#747798]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white truncate">{track.name}</h4>
              <p className="text-sm text-[#a5a6b9] truncate">{track.artist}</p>
              {track.youtubeVideoId && !track.previewUrl && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube 플레이어
                </p>
              )}
              {track.previewUrl && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Spotify 30초 미리듣기
                </p>
              )}
            </div>
          </div>

          {/* Playback Controls - Only for Spotify */}
          {track.previewUrl && (
            <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={togglePlay}
                  className="bg-gradient-to-r from-[#7342ff] to-[#db65d1] hover:from-[#6235e6] hover:to-[#c554be] w-10 h-10 rounded-full p-0"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </Button>
                {/* Prev button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPrev && onPrev()}
                  className="text-white hover:bg-white/5"
                  aria-label="이전 트랙"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                {/* Next button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onNext && onNext()}
                  className="text-white hover:bg-white/5"
                  aria-label="다음 트랙"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-[#747798] w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-[#747798] w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          )}

          {/* YouTube message */}
          {!track.previewUrl && (
            <div className="flex-1 flex items-center justify-center">
              {track.youtubeVideoId ? (
                <p className="text-[#a5a6b9] text-sm">
                  {isExpanded ? '👆 YouTube 영상에서 재생되고 있습니다' : '👉 확대 버튼(🔲)을 눌러 YouTube 플레이어를 여세요'}
                </p>
              ) : (
                <p className="text-yellow-400 text-sm">
                  ⚠️ YouTube 영상을 찾는 중... 확대 버튼을 눌러보세요
                </p>
              )}
            </div>
          )}

          {/* Volume & Actions */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {track.previewUrl && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/10"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value: number[]) => setVolume(value[0] / 100)}
                  className="w-24 hidden md:block"
                />
              </>
            )}
            
            {track.youtubeVideoId && !track.previewUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-white/10"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            )}

            {track.spotifyUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(track.spotifyUrl, '_blank')}
                className="text-green-400 hover:bg-green-400/10"
                title="Spotify에서 전체 곡 듣기"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
