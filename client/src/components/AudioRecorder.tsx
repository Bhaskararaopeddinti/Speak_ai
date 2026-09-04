import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, AlertCircle, RefreshCw } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, durationSeconds: number) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isProcessing,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Clean up media stream and timer on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    setDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setStream(mediaStream);

      // Determine supported mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
      ];
      const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(mediaStream, supportedMime ? { mimeType: supportedMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Stop all tracks
        mediaStream.getTracks().forEach((track) => track.stop());
        setStream(null);

        if (finalBlob.size > 0) {
          onRecordingComplete(finalBlob, duration);
        } else {
          setError('No audio captured. Please try speaking closer to your microphone.');
        }
      };

      recorder.start(100); // 100ms slices for smooth capture
      setIsRecording(true);

      // Start duration timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings to speak.');
      } else {
        setError(err.message || 'Could not access your microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setDuration(0);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      {/* Error alert */}
      {error && (
        <div className="mb-4 w-full p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-medium">Microphone Notice</p>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Waveform Visualizer */}
      <div className="w-full mb-6">
        <WaveformVisualizer stream={stream} isRecording={isRecording} />
      </div>

      {/* Recording State & Timer */}
      <div className="flex items-center gap-3 mb-6">
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            RECORDING
          </div>
        )}
        <div className="font-mono text-2xl font-bold tracking-wider text-slate-700">
          {formatTimer(duration)}
        </div>
      </div>

      {/* Center Mic Button */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Pulsing ring animation when recording */}
        {isRecording && (
          <div className="absolute w-28 h-28 rounded-full bg-rose-500/20 recording-pulse pointer-events-none" />
        )}

        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled || isProcessing}
            type="button"
            className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              disabled || isProcessing
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-tr from-brand-600 to-accent-500 text-white hover:scale-105 hover:shadow-brand-500/30 active:scale-95'
            }`}
            title="Start Recording"
          >
            <Mic className="w-10 h-10 transition-transform group-hover:scale-110" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            type="button"
            className="relative w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-600/30 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Stop Recording"
          >
            <Square className="w-9 h-9 fill-current" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled || isProcessing}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px]"
          >
            <Mic className="w-4 h-4" />
            <span>Start Recording</span>
          </button>
        ) : (
          <>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md shadow-rose-600/25 transition-all flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Recording</span>
            </button>
            <button
              onClick={cancelRecording}
              className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-600 text-center">
        {isRecording
          ? 'Speak clearly into your microphone in your target language...'
          : 'Click "Start Recording", speak your sentence, and click "Stop" for AI feedback.'}
      </p>
    </div>
  );
};
