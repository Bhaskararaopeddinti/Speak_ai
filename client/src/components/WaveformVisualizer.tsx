import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ stream, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAudioCtx: AudioContext | null = null;
    let localAnalyser: AnalyserNode | null = null;

    if (isRecording && stream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        localAudioCtx = new AudioContextClass();
        localAnalyser = localAudioCtx.createAnalyser();
        localAnalyser.fftSize = 64;
        localAnalyser.smoothingTimeConstant = 0.8;

        const source = localAudioCtx.createMediaStreamSource(stream);
        source.connect(localAnalyser);

        audioContextRef.current = localAudioCtx;
        analyserRef.current = localAnalyser;
      } catch (e) {
        console.warn('Could not initialize Web Audio API AnalyserNode:', e);
      }
    }

    const draw = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isRecording && analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barCount = 32;
        const barWidth = Math.floor((width - (barCount - 1) * 3) / barCount);
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * bufferLength);
          const rawValue = dataArray[dataIndex] || 0;
          // Scale bar height
          const minHeight = 4;
          const barHeight = Math.max(minHeight, (rawValue / 255) * (height - 8));
          const y = (height - barHeight) / 2;

          // Gradient color: indigo to purple
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#818cf8');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, '#a855f7');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();

          x += barWidth + 3;
        }
      } else {
        // Idle state: subtle sine wave or gentle static bars
        const barCount = 28;
        const barWidth = Math.floor((width - (barCount - 1) * 3) / barCount);
        let x = 0;
        const time = Date.now() / 1000;

        for (let i = 0; i < barCount; i++) {
          const h = 6 + Math.sin(i * 0.4 + time * 1.5) * 4;
          const y = (height - h) / 2;

          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, h, 2);
          ctx.fill();

          x += barWidth + 3;
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (localAudioCtx && localAudioCtx.state !== 'closed') {
        localAudioCtx.close().catch(() => {});
      }
    };
  }, [isRecording, stream]);

  return (
    <div className="w-full h-16 bg-slate-100/80 rounded-2xl flex items-center justify-center p-2 border border-slate-200/80 shadow-inner overflow-hidden">
      <canvas
        ref={canvasRef}
        width={340}
        height={56}
        className="w-full h-full max-w-sm"
      />
    </div>
  );
};
