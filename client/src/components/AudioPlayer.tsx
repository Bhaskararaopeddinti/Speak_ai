import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioSrc: string;
  autoPlay?: boolean;
  label?: string;
  onFinished?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  autoPlay = false,
  label = 'Listen',
  onFinished,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (onFinished) onFinished();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc, autoPlay, onFinished]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn('Audio play failed:', e);
      });
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleSpeed = () => {
    const speeds = [0.8, 1.0, 1.25];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white/90 border border-brand-100 shadow-sm rounded-2xl p-2.5 px-4">
      <audio ref={audioRef} src={audioSrc} preload="auto" />

      {/* Play/Pause CTA */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
        title={isPlaying ? 'Pause' : 'Play audio'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Label and Progress */}
      <div className="flex-1 min-w-[140px]">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
          <span className="flex items-center gap-1.5 text-brand-700">
            <Volume2 className="w-3.5 h-3.5" />
            {label}
          </span>
          <span className="font-mono text-slate-500 text-[11px]">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-500 to-accent-500 h-full transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls: Restart and Speed */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={restart}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Replay from start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleSpeed}
          className="px-2 py-1 text-xs font-bold font-mono text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
          title="Change playback speed"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
};
