import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Pause, Volume2, ExternalLink } from 'lucide-react';
import { Slider } from './ui/slider';

interface SpotifyPlayerProps {
  previewUrl: string | null;
  trackName: string;
  artistName: string;
  spotifyUrl: string;
  youtubeSearchUrl: string;
}

export function SpotifyPlayer({ 
  previewUrl, 
  trackName, 
  artistName, 
  spotifyUrl,
  youtubeSearchUrl 
}: SpotifyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.7);
  const [showLinks, setShowLinks] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 자동 재생
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;

    // 플레이어가 마운트되면 자동으로 재생 시작
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
      setShowLinks(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!previewUrl) {
    // Spotify 미리듣기가 없으면 YouTube Player 표시
    return (
      <YouTubePlayer
        trackName={trackName}
        artistName={artistName}
        spotifyUrl={spotifyUrl}
      />
    );
  }

  return (
    <Card className="p-4 bg-[#131739] border-[#060629]">
      <audio ref={audioRef} src={previewUrl} />
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={togglePlay}
            className="bg-gradient-to-r from-[#7342ff] to-[#db65d1] hover:from-[#6235e6] hover:to-[#c554be] w-10 h-10 rounded-full p-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </Button>
          
          <div className="flex-1">
            <p className="text-white text-sm truncate">{trackName}</p>
            <p className="text-[#747798] text-xs truncate">{artistName}</p>
          </div>
          
          <div className="text-[#747798] text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#747798]" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0] / 100)}
            className="w-24"
          />
        </div>

        {showLinks && (
          <div className="pt-3 border-t border-[#060629]">
            <p className="text-[#a5a6b9] text-sm mb-3 text-center">
              🎵 전체 곡을 들으시려면:
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-gradient-to-r from-[#7342ff]/20 to-[#db65d1]/20 border-[#7342ff] text-white hover:from-[#7342ff]/30 hover:to-[#db65d1]/30"
                onClick={() => window.open(spotifyUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Spotify
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-[#1a1f4a] hover:bg-[#232961] border-[#3c4795] text-[#a5a6b9]"
                onClick={() => window.open(youtubeSearchUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                YouTube
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
